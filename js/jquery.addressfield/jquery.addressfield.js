/*! Address Field - v1.0.1 - 2014-12-01
* https://github.com/tableau-mkt/jquery.addressfield
* Copyright (c) 2014 Eric Peterson; Licensed MIT */
(function ($) {

  /**
   * Modifies an address field for this wrapped set of fields, given a config
   * representing how the country writes its addresses (conforming roughly to
   * xNAL standards), and an array of fields you desire to show (again, roughly
   * xNAL compatible).
   *
   * @param options
   *   A configuration object with the following properties:
   *   - fields: (Required) An object mapping xNAL field names to jQuery
   *     selectors corresponding to the associated form elements. Any fields in
   *     your form that are not listed here will be ignored when mutating your
   *     postal address form. Note that the "country" field is required at a
   *     minimum. A common example might look like:
   *     {
   *       country: 'select#address-country',
   *       localityname: 'input.city',
   *       administrativearea: '#address-state',
   *       postalcode: '.zipcode'
   *     }
   *   - json: One of:
   *     - A string, representing the path to a JSON resource containing postal
   *       address field configurations matching the format defined by the
   *       addressfield.json project. This project comes packaged with a release
   *       of addressfield.json for ease-of-use, but you can provide your own
   *       configuration as well!
   *     - An object, representing the exact same data in the exact same format
   *       as would be returned by the JSON request for the string version of
   *       this configuration. Useful in cases where a hard-coded configuration
   *       would be more advantageous over the extra http request.
   *   - async: (Optional) Boolean flag that represents whether the request to
   *     the JSON resource specified above will be performed synchronously or
   *     asynchronously. Defaults to true (async JSON request).
   *   - defs: Deprecated; if no JSON config is provided (neither a valid
   *     path nor a full JavaScript object), you can use this key to apply a
   *     one-time postal form mutation given a field configuration and field
   *     map. Useful for quick-and-dirty upgrades from jquery.addressfield 0.x.
   *     Use of this functionality is highly discouraged.
   *
   * @returns {*}
   *   Returns itself (useful for chaining).
   */
  $.fn.addressfield = function(options) {
    var $container = this,
        configs = $.extend({
          fields: {},
          json: null,
          async: true,
          // @deprecated Support for manual, synchronous, external control.
          defs: {fields: {}}
        }, options);

    // If a path was given for a JSON resource, load the resource and execute.
    if (typeof configs.json === 'string') {
      $.ajax({
        dataType: "json",
        url: configs.json,
        async: configs.async,
        success: function (data) {
          $.fn.addressfield.binder.call($container, configs.fields, $.fn.addressfield.transform(data));
          $(configs.fields.country).change();
        }
      });
      return $container;
    }
    // In this case, a direct configuration has been provided inline.
    else if (typeof configs.json === 'object' && configs.json !== null) {
      $.fn.addressfield.binder.call($container, configs.fields, $.fn.addressfield.transform(configs.json));
      $(configs.fields.country).change();
      return $container;
    }
    // Legacy support for manual, synchronous, external control.
    // @deprecated Remove this functionality in the next major version (2.0.x).
    else {
      return $.fn.addressfield.apply.call($container, configs.defs, configs.fields);
    }
  };

  /**
   * Applies a given field configuration against a given postal address form.
   *
   * @param config
   *   The field configuration to be applied to the postal address form.
   *
   * @param fieldMap
   *   A mapping of xNAL field names to their selectors within this form.
   *
   * @returns {*}
   *   Returns itself (useful for chaining).
   */
  $.fn.addressfield.apply = function (config, fieldMap) {
    var $container = $(this),
        fieldOrder = [],
        $element,
        selector,
        placeholder,
        fieldPos,
        field;

    // Iterate through defined address fields for this country.
    for (fieldPos in config.fields) {
      // Determine the xNAL name of this field.
      field = $.fn.addressfield.onlyKey(config.fields[fieldPos]);

      // Pick out the existing elements for the given field.
      selector = fieldMap.hasOwnProperty(field) ? fieldMap[field] : '.' + field;
      $element = $container.find(selector);

      // Account for nested fields.
      if (config.fields[fieldPos][field] instanceof Array) {
        return $.fn.addressfield.apply.call($element, {fields: config.fields[fieldPos][field]}, fieldMap);
      }
      // Otherwise perform the usual actions.
      else {
        // When swapping out labels / values for existing fields.
        // Ensure the element exists and is configured to be displayed.
        if ($element.length && fieldMap.hasOwnProperty(field)) {
          // Push this field selector onto the fieldOrder array.
          fieldOrder.push(selector);

          // Update the options.
          if (typeof config.fields[fieldPos][field].options !== 'undefined') {
            // If this field has options but it's currently a text field,
            // convert it back to a select field.
            if (!$element.is('select')) {
              $element = $.fn.addressfield.convertToSelect.call($element);
            }
            $.fn.addressfield.updateOptions.call($element, config.fields[fieldPos][field].options);
          }
          else {
            // If this field does not have options but it's currently a select
            // field, convert it back to a text field.
            if ($element.is('select')) {
              $element = $.fn.addressfield.convertToText.call($element);
            }

            // Apply a placeholder; empty one if none exists.
            placeholder = config.fields[fieldPos][field].hasOwnProperty('eg') ? config.fields[fieldPos][field].eg : '';
            $.fn.addressfield.updateEg.call($element, placeholder);
          }

          // Update the label.
          $.fn.addressfield.updateLabel.call($element, config.fields[fieldPos][field].label);
        }

        // When adding fields that didn't previously exist.
        if (!$.fn.addressfield.isVisible.call($element) && fieldMap.hasOwnProperty(field)) {
          $.fn.addressfield.showField.call($element);
        }

        // Add, update, or remove validation handling for this field.
        $.fn.addressfield.validate.call($element, field, config.fields[fieldPos][field]);
      }
    }

    // Now check for fields that are still on the page but shouldn't be.
    $.each(fieldMap, function (field_name, field_selector) {
      var $element = $container.find(field_selector);
      if ($element.length && !$.fn.addressfield.hasField(config, field_name)) {
        $.fn.addressfield.hideField.call($element);
      }
    });

    // Now ensure the fields are in their given order.
    $.fn.addressfield.orderFields.call($container, fieldOrder);

    // Trigger an addressfield:after event on the container.
    $container.trigger('addressfield:after', {config: config, fieldMap: fieldMap});

    return this;
  };

  /**
   * Binds a handler to the country form field element, which applies postal
   * address form mutations to this form container based on the selected country
   * and given xNAL field map.
   *
   * @param fieldMap
   *   A map of xNAL fields to jQuery selectors representing their corresponding
   *   form field elements.
   *
   * @param countryConfigMap
   *   A map of field configurations to country ISO codes which should match
   *   the values associated with the country select element, defined in the
   *   fieldMap above).
   */
  $.fn.addressfield.binder = function(fieldMap, countryConfigMap) {
    var $container = this;

    $(fieldMap.country).bind('change', function() {
      // Trigger the apply method with the country's data.
      $.fn.addressfield.apply.call($container, countryConfigMap[this.value], fieldMap);
    });

    return $container;
  };

  /**
   * Transforms JSON data returned in the instantiation method to the format
   * expected by the binder method.
   */
  $.fn.addressfield.transform = function(data) {
    var countryMap = {},
        position;

    // Store a map of countries to their associated field configs.
    for (position in data.options) {
      countryMap[data.options[position].iso] = data.options[position];
    }

    return countryMap;
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
          // @todo Drop jQuery 1.3 support. No need for .toString() call.
          return new RegExp(config.format).test($.trim(value.toString()));
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
   * Re-orders fields given an array of selectors representing fields. Note that
   * this can be called recursively if one of the values passed in the
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
        $element = $.fn.addressfield.container.call(this.find(order[i]));
        order[i] = {
          'element': $element.clone(),
          'selector': order[i],
          'value': $(this).find(order[i]).val()
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
        $element.find(order[i]['selector']).val(order[i].value).change();
      }
    }
  };

}(jQuery));
