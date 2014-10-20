# jquery.addressfield [![Build Status](https://travis-ci.org/tableau-mkt/jquery.addressfield.svg?branch=master)](https://travis-ci.org/tableau-mkt/jquery.addressfield) [![Coverage](https://codeclimate.com/github/tableau-mkt/jquery.addressfield/coverage.png)](https://codeclimate.com/github/tableau-mkt/jquery.addressfield) [![Code Climate](https://codeclimate.com/github/tableau-mkt/jquery.addressfield.png)](https://codeclimate.com/github/tableau-mkt/jquery.addressfield)

The simple, configurable, dynamic postal address field plugin.

## Features
This plugin enhances user experience and data quality on your address
(shipping/PO) forms by dynamically...
- Updating field labels (e.g. "ZIP code" vs. "Postcode"),
- Adding or removing fields that are irrelevant (e.g. countries that do not have
  a postal code system),
- Converting fields between select lists and text fields (e.g. US States vs.
  counties in the UK),
- Updating select options (e.g. US states vs. Canadian provinces)
- Updating field order (e.g. city, state, zip for US, different elsewhere),
- Validating fields on a field-by-field basis (e.g. between various
  postal code standards--depends on [jQuery.validate](http://jqueryvalidation.org/)),
- Providing placeholder text for configured fields (helpful when validating
  above).

## Installation & Usage
Include the script after your jQuery include (unless you're packaging scripts
in some other magical way):

```html
<script src="/path/to/jquery.js"></script>
<!-- Optionally, install jquery validation to handle field validation. -->
<script src="/path/to/jquery.validate.js"></script>
<script src="/path/to/jquery.addressfield.js"></script>
```

#### Usage
Using jquery.addressfield is easy! Instantiate the plugin against a form or form
wrapper with a few special configuration keys and the plugin takes care of the
rest:

```javascript
$('#my-address-form').addressfield({
  json: '/path/to/addressfield.json',
  fields: {
    country: 'select#country-field',
    administrativearea: '.state',
    postalcode: '.zipcode'
  },
});
```

Where `json` is a path to addressfield.json (packaged with this plugin) or any
endpoint serving JSON in the same configuration schema. And where `fields` is
an object mapping xNAL field names to jQuery selectors of form field elements
that correspond. At a bare minimum, the `country` field is required.

Once instantiated, this plugin binds a change handler to the country element.
The change handler will trigger a mutation process on the form that handles all
of the features outlined above based on the configuration provided in the `json`
key.

The above example would work on sample markup like the following:

```html
<form id="my-address-form">
  <div class="field-wrapper">
    <label for="country-field">Country</label>
    <select id="country-field" name="address[country]">
      <option value="AA">AA Value</option>
    </select>
  </div>
  <div class="field-wrapper">
    <label for="state-field">State</label>
    <input id="state-field" class="state" name="address[state]" />
  </div>
  <div class="field-wrapper">
    <label for="zip-field">ZIP Code</label>
    <input id="zip-field" class="zipcode" name="address[zip]" />
  </div>
</form>
```

#### Additional configuration

You can pass an `async` parameter when you instantiate this plugin to specify
whether or not the JSON is retrieved and bound asynchronously. By default, this
is true (performed async), but you could do so synchronously:

```javascript
$('my-address-form').addressfield({
  // ...
  async: false
});
}
```

You may choose to provide the JSON configuration yourself, rather than making an
extra HTTP request. To do so, instead of passing in the path of the JSON config
file on the `json` key, pass in the complete configuration:

```javascript
$('my-address-form').addressfield({
  // ...
  json: {
    options: [{
      iso: 'AA',
      fields: []
    }, {
      iso: 'BB',
      fields: []
    }]
  }
});
```

#### Providing your own form configurations

Although jquery.addressfield comes packaged with a copy of addressfield.json,
you can provide your own JSON so long as it matches the configuration schema of
addressfield.json. For more details, see the config schema definition in
[addressfield.json's README](https://github.com/tableau-mkt/addressfield.json).

## Events
This plugin will fire an event named `addressfield:after` on the provided form
or wrapper after each form manipulation is performed. This can be useful when
you need custom behavior right after addressfield does its thing.

## Contributing
Check out the [Contributing guidelines](CONTRIBUTING.md)
