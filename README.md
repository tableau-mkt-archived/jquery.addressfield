# jquery.addressfield [![Build Status](https://travis-ci.org/tableau-mkt/jquery.addressfield.svg?branch=master)](https://travis-ci.org/tableau-mkt/jquery.addressfield) [![Test Coverage](https://codeclimate.com/github/tableau-mkt/jquery.addressfield/badges/coverage.svg)](https://codeclimate.com/github/tableau-mkt/jquery.addressfield) [![Code Climate](https://codeclimate.com/github/tableau-mkt/jquery.addressfield/badges/gpa.svg)](https://codeclimate.com/github/tableau-mkt/jquery.addressfield) [![Dependency Status](https://gemnasium.com/tableau-mkt/jquery.addressfield.svg)](https://gemnasium.com/tableau-mkt/jquery.addressfield)

The simple, configurable, dynamic postal address field plugin.

## Features
This plugin helps you enhance user experience and data quality on your address
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

## Installation and usage
Include the script after your jQuery include (unless you're packaging scripts
in some other magical way):

```html
<script src="/path/to/jquery.js"></script>
<!-- Optionally, install jquery validation to handle field validation. -->
<script src="/path/to/jquery.validate.js"></script>
<script src="/path/to/jquery.addressfield.js"></script>
```

Also available on NPM, for [browserified](http://browserify.org/) builds.

Install into `node_modules`:

```shell
$ npm install jquery.addressfield
```

In your application module;

```javascript
var $ = require('jquery');
require('jquery.addressfield');

$(...).addressfield(...);
```

#### Basic usage
Using jquery.addressfield is easy! Instantiate the plugin against a form or form
wrapper with a few special configuration keys and the plugin takes care of the
rest:

```javascript
// If jquery.validate is in use, instantiate it here with your options:
$('#my-address-form').validate({/* ... */});

// Instantiate jquery.addressfield with your configs:
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

#### Expected markup

Note that this plugin makes certain assumptions about the structure of your form
markup. Please be sure to see the [usage and configuration](docs/usage.md) guide
for complete details.

### Detailed documentation
More detailed, topic-based documentation on usage and configuration options is
available here below.

- [Usage and configuration](docs/usage.md)
- [Extending and altering](docs/extend.md)

## Contributing
Check out the [Contributing guidelines](CONTRIBUTING.md)
