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
  $.fn.addressfield = function(config, enabled_fields) {
    var $container = $(this),
      field_order = [],
      $element,
      field;

    // Iterate through defined address fields for this country.
    for (field in config) {
      // Account for non-field attributes within the configuration.
      if (typeof config[field] === 'object') {
        // Pick out the existing elements for the given field.
        $element = $container.find('.' + field);

        // Account for nested fields.
        if (!config[field].hasOwnProperty('label')) {
          return $.fn.addressfield.call($element, config[field], enabled_fields);
        }
        // Otherwise perform the usual actions.
        else {
          // When swapping out labels / values for existing fields.
          // Ensure the element exists and is configured to be displayed.
          if ($element.length && $.inArray(field, enabled_fields) !== -1) {
            // Push this field onto the field_order array.
            field_order.push(field);

            // Update the options.
            if (typeof config[field].options !== 'undefined') {
              // If this field has options but it's currently a text field,
              // convert it back to a select field.
              if (!$element.is('select')) {
                $element = $.fn.addressfield.convertToSelect.call($element);
              }
              $.fn.addressfield.updateOptions.call($element, config[field].options);
            }
            else {
              // If this field does not have options but it's currently a select
              // field, convert it back to a text field.
              if ($element.is('select')) {
                $element = $.fn.addressfield.convertToText.call($element);
              }
            }

            // Update the label.
            $.fn.addressfield.updateLabel.call($element, config[field].label);
          }

          // When adding fields that didn't previously exist.
          if ($element.not(':visible') && $.inArray(field, enabled_fields) !== -1) {
            $.fn.addressfield.showField.call($element);
          }
        }
      }
    }

    // Now check for fields that are still on the page but shouldn't be.
    $.each(enabled_fields, function (index, field) {
      var $element = $container.find('.' + field);
      if ($element.length && !config.hasOwnProperty(field)) {
        $.fn.addressfield.hideField.call($element);
      }
    });

    // Now ensure the fields are in their given order.
    $.fn.addressfield.orderFields.call($container, field_order);

    return this;
  };

  /**
   * Updates a given field's label with a given label.
   */
  $.fn.addressfield.updateLabel = function (label) {
    if ($(this).prev('label').length) {
      $(this).prev('label').text(label);
    }
  };

  /**
   * Updates a given select field's options with given options.
   */
  $.fn.addressfield.updateOptions = function (options) {
    var $self = $(this);
    $self.children('option').remove();
    $.each(options, function (value, label) {
      $self.append($('<option></option>').attr('value', value).text(label));
    });
  };

  /**
   * Converts a given select field to a regular textarea.
   */
  $.fn.addressfield.convertToText = function () {
    var $self = $(this),
        $input = $('<input />').attr('type', 'text');
    $.each($self[0].attributes, function () {
      if ($.inArray(this.name, ['class', 'id', 'name']) !== -1) {
        $input.attr(this.name, this.value);
      }
    });
    $self.replaceWith($input);
    return $input;
  };

  /**
   * Converts a given input field to a select field.
   */
  $.fn.addressfield.convertToSelect = function() {
    var $self = $(this),
        $select = $('<select></select>');
    $.each($self[0].attributes, function () {
      if ($.inArray(this.name, ['class', 'id', 'name']) !== -1) {
        $select.attr(this.name, this.value);
      }
    });
    $self.replaceWith($select);
    return $select;
  };

  /**
   * Hides the field, but stores it for restoration later, if necessary.
   */
  $.fn.addressfield.hideField = function() {
    $(this).val('');
    $(this).parent().hide();
  };

  /**
   * Shows / restores the field that had been previously hidden.
   */
  $.fn.addressfield.showField = function() {
    $(this).parent().show();
  };

  /**
   * Re-orders fields given an array of class names representing fields. Note
   * that this can be called recursively if one of the values passed in the
   * order array is itself an array.
   */
  $.fn.addressfield.orderFields = function(order) {
    var length = order.length,
      i = 0,
      $element;

    // Iterate through the fields to be ordered.
    for (i; i < length; ++i) {
      if (i in order) {
        // Save off the element container over its class selector in order.
        $element = $(this).find('.' + order[i]).parent('div, section');
        order[i] = $element;

        // Remove the original element from the page.
        $element.remove();
      }
    }

    // Elements have been saved off in order and removed. Now, add them back in
    // the correct order.
    for (i = 0; i < length; ++i) {
      if (i in order) {
        $(this).append(order[i]);
      }
    }
  };

}(jQuery));
