# Overriding and extending jquery.addressfield
[Back](../README.md)

## Overriding default functionality
The jquery.addressfield plugin attempts to use sane defaults to make plugin use
as simple as possible for as many people as possible. For those with less
control over their markup or for those with more complex needs, the plugin
provides a way to override default logic.

This plugin attempts to encapsulate small bits of logic in public methods on
jquery.addressfield. Overriding a method is simple:

```javascript
(function ($) {
  // Set up your own custom logic for element label updating.
  $.fn.addressfield.updateLabel = function(label) {
    // Custom label update logic here.
  };
  
  // You could also extend a method like so:
  var oldUpdateEg = $.fn.addressfield.updateEg;
  $.fn.addressfield.updateEg = function(example) {
    oldUpdateEg.call(this, example);
    // Additional custom logic here, or up above (depending).
  };

  // Subsequently, jquery.addressfield will use your overridden method(s).
  $('#my-address-form').addressfield({/* ... */});
})(jQuery);
```

This plugin is made up of many such public methods; a few common use-cases are
highlighted below, but you can dig through the
[jquery.addressfield.js](../src/jquery.addressfield.js) source to find more.

You may consider the methods and their argument signatures an API; they can be
changed or removed in major versions, but not in minor or patch versions. Minor
versions can delineate method additions, however.

#### Changing the way elements are validated
By default, (if available) jquery.addressfield will attempt to integrate with
the [jquery.validate](http://jqueryvalidation.org/) plugin. If you wish to use a
different validation plugin, you can override `$.fn.addressfield.validate`.

```javascript
/**
 * Invoked when validation handlers are meant to be added, updated, or removed
 * on an individual field.
 *
 * @param field
 *   The name of the field (usually xNAL) as a string.
 *
 * @param config
 *   The field configuration object for this field.
 */
$.fn.addressfield.validate = function(field, config) {
  // In this context, "this" is the field element. Before you proceed, you may
  // want to check that the field configuration specifies a regex format.
  if (config.hasOwnProperty('format')) {
    $(this).myCustomValidationAttachmentLogic();
  }
};
```

#### Changing the way labels, options, and placeholders are set
In some cases, you may need to supply more custom logic when updating field
labels, updating select list options, or when updating placeholder text. To do
so, override any of the following methods:

```javascript
/**
 * Invoked when a field's label is meant to be replaced.
 *
 * @param label
 *   A string representing the end-user facing form label for the given element.
 */
$.fn.addressfield.updateLabel = function(label) {
  // Note, in this context, "this" is the field element (not the label element).
  // You may wish to load it like this:
  var $label = $('label[for="' + $(this).attr('id') + '"]');
  
  $label.myCustomLabelUpdateLogicHere();
};
```

```javascript
// This method is invoked when a select element's options are updated.
/**
 * Invoked when a form element's select options are meant to be updated.
 *
 * @param options
 *   An array of option objects (which consist of a key/value pair where the key
 *   is the shortcode or "stored" value and the value is the end-user facing
 *   string).
 */
$.fn.addressfield.updateOptions = function(options) {
  // In this context, "this" is the select element.
  $(this).myCustomOptionsUpdateLogic(options);
};
```

```javascript
/**
 * Invoked when an input element's placeholder or example text is meant to be
 * updated.
 *
 * @param example
 *   A string representing the example placeholder text meant for the form
 *   element. Note that this can sometimes be an empty string.
 */
$.fn.addressfield.updateEg = function(example) {
  // In this context, "this" is the form element.
  $(this).myCustomPlaceHolderUpdateLogic(example);
};
```

#### Changing the way fields are hidden or shown
In some cases, the way jquery.addressfield shows and hides field elements may
conflict with other interactions on your page. You can get around those by
implementing your own versions of the following methods:

```javascript
/**
 * Sets a "visible" form element to be "hidden" (for instance, when switching
 * from an address that includes administrative areas to those that do not).
 */
$.fn.addressfield.hideField = function() {
  // In this context, "this" is the form element.
  $(this).myCustomHideOrRemoveLogic();
};
```

```javascript
/**
 * Sets a "hidden" form element to be "shown" (for instance, when switching
 * from an address that does not include postal codes to one that does).
 */
$.fn.addressfield.showField = function() {
  // In this context, "this" is the form element.
  $(this).myCustomShowOrPlaceLogic();
};
```

```javascript
/**
 * Determines whether or not a given form element is currently visible on the
 * page. Should return a boolean.
 *
 * @return bool
 *   Returns TRUE if the element is currently visible. FALSE otherwise.
 */
$.fn.addressfield.isVisible = function() {
  // In this context, "this" is the form element.
  return $(this).myCustomIsVisibleCheck();
};
```

### Custom events 
This plugin will fire an event named `addressfield:after` on the provided form
or wrapper after each form manipulation is performed. This can be useful when
you need custom behavior right after jquery.addressfield does its thing.

```javascript
$('#my-address-form').bind('addressfield:after', function (e, data) {
  // Access the field configuration of the selected country at data.config.
  if (data.config.iso === 'CA') {
    // Do something for Canada.
  }

  // Access the xNAL/selector field map at data.fieldMap.
  var $zip = $(data.fieldMap.postalcode);
});
```
