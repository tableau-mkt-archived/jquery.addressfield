# Using jquery.addressfield
[Back](../README.md)

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
