# Using jquery.addressfield
[Back](../README.md)

### Expected markup

This plugin makes certain assumptions about the structure of your form markup.
To ensure the plugin is able to do its thing, please make sure of the following:

- Fields and their associated labels must both be bound by a common wrapping
  element (e.g. `<div>`, `<section>`, etc. This wrapper is used to show and hide
  unused/irrelevant fields _completely_ for specific countries.
- Be sure that locality fields (e.g. city, administrative division, and postal
  code) are themselves wrapped within a container and that you specify a
  selector for that container. This is necessary because some countries display
  a locality field _set_ with different weight with respect to other fields.
- Optionally you can specify which country is selected by default. Just add a
  data attribute to the country select.

Here's example markup that encompasses the above recommendations:

```html
<form>
  <div class="field-wrapper">
    <div class="field-wrapper">
      <label for="country">Country</label>
      <select id="country" data-country-selected="US"></select>
    </div>
  </div>
  <div id="locality-fields">
    <div class="field-wrapper">
      <label for="city">City</label>
      <input type="text" id="city" />
    </div>
    <div class="field-wrapper">
      <label for="state">Administrative Area</label>
      <input type="text" id="state" />
    </div>
    <div class="field-wrapper">
      <label for="zip">Postal Code</label>
      <input type="text" id="zip" />
    </div>
  </div>
</form>

<script type="text/javascript">
$('form').addressfield({
  json: '/*...*/',
  fields: {
    country: '#country',
    locality: '#locality-fields',
    localityname: '#city',
    administrativearea: '#state',
    postalcode: '#zip'
  }
});
</script>
```

### Running jquery.addressfield synchronously

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

### Providing configuration JSON inline

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

### Providing your own form configurations

Although jquery.addressfield comes packaged with a copy of addressfield.json,
you can provide your own JSON so long as it matches the configuration schema of
addressfield.json. For more details, see the config schema definition in
[addressfield.json's README](https://github.com/tableau-mkt/addressfield.json).
