# jquery.addressfield [![Build Status](https://travis-ci.org/tableau-mkt/jquery.addressfield.svg?branch=master)](https://travis-ci.org/tableau-mkt/jquery.addressfield) [![Coverage](https://codeclimate.com/github/tableau-mkt/jquery.addressfield/coverage.png)](https://codeclimate.com/github/tableau-mkt/jquery.addressfield) [![Code Climate](https://codeclimate.com/github/tableau-mkt/jquery.addressfield.png)](https://codeclimate.com/github/tableau-mkt/jquery.addressfield)

The simple, configurable, dynamic address field plugin.

## Features
This plugin enhances user experience on your address (shipping/PO) forms by
dynamically...
- Updating field labels (e.g. "ZIP code" vs. "Postcode"),
- Adding or removing fields that are irrelevant (e.g. for a particular locales),
- Converting fields between select lists and text fields (e.g. US States vs.
  counties in the UK),
- Updating select options (e.g. US states vs. Canadian provinces)
- Updating field order (e.g. city, state, zip for US, different elsewhere),
- Validating fields on a field-by-field basis (e.g. between various
  postal code standards--depends on [jQuery.validate](http://jqueryvalidation.org/)),
- Providing placeholder text for configured fields (helpful when validating
  above).

## Installation
Include the script after your jQuery include (unless you're packaging scripts
in some other magical way):

```html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery.addressfield.js"></script>
```

## Usage
This plugin expects you have a form with a set of fields that represent an
address (e.g. for shipping/billing or generating POs), but you want the fields
to be displayed dynamically, based on some configuration (e.g. different labels
or select options based on the selected country).

At a high level, all you're doing is calling jQuery.addressfield on a fieldset
or other field/form wrapper, with a given configuration mapping and a list of
fields you want to be dynamic.

```javascript
$('#address-form').addressfield(config, dynamicFields);
```

Where `config` is an object that fits this format:

```json
{
  "_comment" : "Note that field order will be respected.",
  "fields" : [{
    "fieldname1" : {
      "_comment" : "All fields must include labels.",
      "label" : "Label for field1"
    }
  }, {
    "fieldname2" : {
      "label" : "Label for field2"
      "_comment" : "Fields with options will be converted to selects.",
      "options" : [{
        "AA" : "AA Value"
      }, {
        "BB" : "BB Value"
      }]
    }
  }]
}
```

And `dynamicFields` is just an array of fields you care about.

```javascript
dynamicFields = ['fieldname1', 'fieldname2', 'fieldname3'];
```

And the input elements include their respective field names as classes, e.g.

```html
<form id="address-form">
  <input class="fieldname1" />
  <select class="fieldname2 some-other-class">
    <option value="AA">AA Value</option>
  </select>
</form>
```


## A more realistic usage example
Here's a sample configuration for Canada, which has a known, distinct list of
_provinces_, and the United Kingdom, which doesn't have a list of administrative
regions. Also note the labels for province/county and postal code/postcode.

```json
{
  "CA" : {
    "fields" : [{
      "administrativearea" : {
        "label" : "Province",
        "options" : [{
          "" : "--"
        }, {
          "AB" : "Alberta"
        }, {
          "BC" : "British Columbia"
        }, {
          "MB" : "Manitoba"
        }, {
          "NB" : "New Brunswick"
        }, {
          "NL" : "Newfoundland"
        }, {
          "NT" : "Northwest Territories"
        }, {
          "NS" : "Nova Scotia"
        }, {
          "NU" : "Nunavut"
        }, {
          "ON" : "Ontario"
        }, {
          "PE" : "Prince Edward Island"
        }, {
          "QC" : "Quebec"
        }, {
          "SK" : "Saskatchewan"
        }, {
          "YT" : "Yukon Territory"
        }]
      }
    }, {
      "postalcode" : {
        "label" : "Postal code"
      }
    }]
  },
  "GB" : {
    "fields" : [{
      "administrativearea" : {
        "label" : "County"
      }
    }, {
      "postalcode" : {
        "label" : "Postcode"
      }
    }]
  }
}
```

And here's some sample markup:

```html
<form class="shipping">
  <div class="country-wrapper">
    <label for="address-country">Country</label>
    <select class="country" id="address-country" name="address[country]">
      <option value="CA">Canada</option>
      <option value="GB" selected>United Kingdom</option>
    </select>
  </div>
  <div class="thoroughfare-wrapper">
    <label for="address-thoroughfare">Address 1</label>
    <input class="thoroughfare" type="text" id="address-thoroughfare" name="address[thoroughfare]" value="">
  </div>
  <div class="premise-wrapper">
    <label for="address-premise">Address 2 </label>
    <input class="premise" type="text" id="address-premise" name="address[premise]" value="">
  </div>
  <div class="locality">
    <div class="localityname-wrapper">
      <label for="address-localityname">City</label>
      <input class="localityname" type="text" id="address-localityname" name="address[localityname]" value="">
    </div>
    <div class="administrativearea-wrapper">
      <label for="address-administrativearea">State</label>
      <input class="administrativearea" type="text" id="address-administrativearea" name="address[administrativearea]" value="">
    </div>
    <div class="postalcode-wrapper">
      <label for="address-postalcode">ZIP code</label>
      <input class="postalcode" type="text" id="address-postalcode" name="address[postalcode]" value="">
    </div>
  </div>
</form>
```

You might write some JavaScript like this to make it very simply dynamic:
```javascript
// Load the JSON asynchronously.
$.getJSON('path/to/above.json', function(config) {
  // On country change...
  $('.country').bind('change', function () {
    // Trigger the addressfield plugin with the country's data.
    $('.shipping').addressfield(config[this.value], [
      'administrativearea',
      'postalcode'
    ]);
  });
});
```

Looking for a full, compatible dataset of field configurations by country? You
might be interested in v1.x of [addressfield.json](https://github.com/tableau-mkt/addressfield.json).

## Contributing
Check out the [Contributing guidelines](CONTRIBUTING.md)
