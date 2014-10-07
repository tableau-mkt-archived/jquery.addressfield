/*
 * Address field
 * https://github.com/tableau-mkt/jquery.addressfield
 *
 * Licensed under the GPL-2.0 license.
 */

(function ($) {

  /**
   * Modifies an address field for this wrapped set of fields, given a config
   * representing how the country writes its addresses (conforming roughly to
   * xNAL standards), and an array of fields you desire to show (again, roughly
   * xNAL compatible).
   */
  $.fn.addressfield = function(configs) {
    var $container = $(this),
        field_order = [],
        $element,
        placeholder,
        field_pos,
        field;

    // Provide default values for sanity.
    configs = configs || {defs: {fields: {}}, fields: []};

    // Iterate through defined address fields for this country.
    for (field_pos in configs.defs.fields) {
      // Determine the xNAL name of this field.
      field = $.fn.addressfield.onlyKey(configs.defs.fields[field_pos]);

      // Pick out the existing elements for the given field.
      $element = $container.find('.' + field);

      // Account for nested fields.
      if (configs.defs.fields[field_pos][field] instanceof Array) {
        return $.fn.addressfield.call($element, {defs: {fields: configs.defs.fields[field_pos][field]}, fields: configs.fields});
      }
      // Otherwise perform the usual actions.
      else {
        // When swapping out labels / values for existing fields.
        // Ensure the element exists and is configured to be displayed.
        if ($element.length && $.inArray(field, configs.fields) !== -1) {
          // Push this field onto the field_order array.
          field_order.push(field);

          // Update the options.
          if (typeof configs.defs.fields[field_pos][field].options !== 'undefined') {
            // If this field has options but it's currently a text field,
            // convert it back to a select field.
            if (!$element.is('select')) {
              $element = $.fn.addressfield.convertToSelect.call($element);
            }
            $.fn.addressfield.updateOptions.call($element, configs.defs.fields[field_pos][field].options);
          }
          else {
            // If this field does not have options but it's currently a select
            // field, convert it back to a text field.
            if ($element.is('select')) {
              $element = $.fn.addressfield.convertToText.call($element);
            }

            // Apply a placeholder; empty one if none exists.
            placeholder = configs.defs.fields[field_pos][field].hasOwnProperty('eg') ? configs.defs.fields[field_pos][field].eg : '';
            $.fn.addressfield.updateEg.call($element, placeholder);
          }

          // Update the label.
          $.fn.addressfield.updateLabel.call($element, configs.defs.fields[field_pos][field].label);
        }

        // When adding fields that didn't previously exist.
        if (!$.fn.addressfield.isVisible.call($element) && $.inArray(field, configs.fields) !== -1) {
          $.fn.addressfield.showField.call($element);
        }

        // Add, update, or remove validation handling for this field.
        $.fn.addressfield.validate.call($element, field, configs.defs.fields[field_pos][field]);
      }
    }

    // Now check for fields that are still on the page but shouldn't be.
    $.each(configs.fields, function (index, field) {
      var $element = $container.find('.' + field);
      if ($element.length && !$.fn.addressfield.hasField(configs.defs, field)) {
        $.fn.addressfield.hideField.call($element);
      }
    });

    // Now ensure the fields are in their given order.
    $.fn.addressfield.orderFields.call($container, field_order);

    // Trigger an addressfield:after event on the container.
    $container.trigger('addressfield:after');

    return this;
  };

  /**
   * Returns the "first" (only) key of a JavaScript object.
   */
  $.fn.addressfield.onlyKey = function (obj) {
    for (var i in obj) {
      return i;
    }
  };

  /**
   * Returns whether or not a given configuration contains a given field.
   */
  $.fn.addressfield.hasField = function (config, expectedField) {
    var pos,
        field;

    for (pos in config.fields) {
      field = $.fn.addressfield.onlyKey(config.fields[pos]);
      if (config.fields[pos][field] instanceof Array) {
        return $.fn.addressfield.hasField({fields: config.fields[pos][field]}, expectedField);
      }
      else {
        if (field === expectedField) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * Updates a given field's label with a given label.
   */
  $.fn.addressfield.updateLabel = function (label) {
    var $this = $(this),
        elementName = $this.attr('id'),
        $label = $('label[for="' + elementName + '"]') || $this.prev('label');

    $label.text(label);
  };

  /**
   * Updates a given field's expected format. By default, the placeholder text.
   */
  $.fn.addressfield.updateEg = function (example) {
    var text = example ? 'e.g. ' + example : '';
    $(this).attr('placeholder', text);
  };

  /**
   * Updates a given select field's options with given options.
   */
  $.fn.addressfield.updateOptions = function (options) {
    var $self = $(this),
        oldVal = $self.data('_saved') || $self.val();

    $self.children('option').remove();
    $.each(options, function (optionPos) {
      var value = $.fn.addressfield.onlyKey(options[optionPos]);
      $self.append($('<option></option>').attr('value', value).text(options[optionPos][value]));
    });

    // Ensure the old value is still reflected after options are updated.
    $self.val(oldVal).change();

    // Clean up the data attribute; no-op if it was not previously populated.
    $self.removeData('_saved');
  };

  /**
   * Converts a given select field to a regular textarea.
   */
  $.fn.addressfield.convertToText = function () {
    var $self = $(this),
        $input = $('<input />').attr('type', 'text');

    // Copy attributes from $self to $input.
    $.fn.addressfield.copyAttrsTo.call($self, $input);

    // Ensure the old value is still reflected after conversion.
    $input.val($self.val());

    // Replace the existing element with our new one; also return it.
    $self.replaceWith($input);
    return $input;
  };

  /**
   * Converts a given input field to a select field.
   */
  $.fn.addressfield.convertToSelect = function() {
    var $self = $(this),
        $select = $('<select></select>');

    // Copy attributes from $self to $select.
    $.fn.addressfield.copyAttrsTo.call($self, $select);

    // Save the old input value to a data attribute, for use in updateOptions.
    $select.data('_saved', $self.val());

    // Replace the existing element with our new one; also return it.
    $self.replaceWith($select);
    return $select;
  };

  /**
   * Optional integration with jQuery.validate.
   */
  $.fn.addressfield.validate = function(field, config) {
    var $this = $(this),
        methodName = 'isValid_' + field,
        rule = {},
        message = "Please check your formatting.";

    // Only proceed if jQuery.validator is installed.
    if (typeof $.validator !== 'undefined') {
      // Support pre-set validation messages.
      message = $.validator.messages.hasOwnProperty(methodName) ? $.validator.messages[methodName] : message;

      // If the provided field has a specified format...
      if (config.hasOwnProperty('format')) {
        // Create the validation method.
        $.validator.addMethod(methodName, function (value) {
          return new RegExp(config.format).test(value);
        }, message);

        // Apply the rule.
        rule[methodName] = true;
        $this.rules('add', rule);
      }
      else {
        // If there is no format, create the validation method anyway, but have
        // it do nothing.
        $.validator.addMethod(methodName, function () {return true;}, message);
      }
    }
  };

  /**
   * Hides the field, but stores it for restoration later, if necessary.
   */
  $.fn.addressfield.hideField = function() {
    $(this).val('').hide();
    $.fn.addressfield.container.call(this).hide();
  };

  /**
   * Shows / restores the field that had been previously hidden.
   */
  $.fn.addressfield.showField = function() {
    this.show();
    $.fn.addressfield.container.call(this).show();
  };

  /**
   * Returns whether or not the field is visible.
   */
  $.fn.addressfield.isVisible = function() {
    return $(this).is(':visible');
  };

  /**
   * Returns the container element for a given field.
   */
  $.fn.addressfield.container = function() {
    var $this = $(this),
        elementName = $this.attr('id'),
        $label = $('label[for="' + elementName + '"]') || $this.prev('label');

    // @todo drop support for jQuery 1.3, just use .has()
    if (typeof $.fn.has === 'function') {
      return $this.parents().has($label).first();
    }
    else {
      return $this.parents().find(':has(label):has(#' + elementName + '):last');
    }
  };

  /**
   * Copies select HTML attributes from a given element to the supplied element.
   */
  $.fn.addressfield.copyAttrsTo = function($to) {
    var attributes = ['class', 'id', 'name', 'propdescname'],
        $this = $(this);

    $.each($this[0].attributes, function () {
      if ($.inArray(this.name, attributes) !== -1) {
        // Compatibility for IE8.
        if (this.name === 'propdescname') {
          $to.attr('name', this.value);
        }
        else {
          $to.attr(this.name, this.value);
        }
      }
    });
  };

  /**
   * Re-orders fields given an array of class names representing fields. Note
   * that this can be called recursively if one of the values passed in the
   * order array is itself an array.
   */
  $.fn.addressfield.orderFields = function(order) {
    var length = order.length,
        i,
        $element;

    // Iterate through the fields to be ordered.
    for (i = 0; i < length; ++i) {
      if (i in order) {
        // Save off the element container over its class selector in order.
        $element = $.fn.addressfield.container.call(this.find('.' + order[i]));
        order[i] = {
          'element': $element.clone(),
          'class': order[i],
          'value': $(this).find('.' + order[i]).val()
        };

        // Remove the original element from the page.
        $element.remove();
      }
    }

    // Elements have been saved off in order and removed. Now, add them back in
    // the correct order.
    for (i = 0; i < length; ++i) {
      if (i in order) {
        $element = $(this).append(order[i].element);

        // The clone process doesn't seem to copy input values; apply that here.
        $element.find('.' + order[i]['class']).val(order[i].value).change();
      }
    }
  };

}(jQuery));
