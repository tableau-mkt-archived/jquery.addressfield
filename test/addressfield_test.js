(function($) {

  module('jQuery#addressfield default methods', {
    setup: function() {
      this.address = $('#qunit-fixture');
      this.country = this.address.find('select.country');
      this.adminregion = this.address.find('input.administrativearea');
      this.postalcode = this.address.find('input.postalcode');
    }
  });

  test('default label update', function() {
    var label = 'Postcode';

    // Call the default updateLabel method; assert it had the right effect.
    $.fn.addressfield.updateLabel.call(this.postalcode, label);
    equal(this.postalcode.prev('label').text(), label, 'should update label');

    expect(1);
  });

  test('default select conversion', function() {
    var expectedData = this.adminregion.val(),
        $response;

    // Call the default convertToSelect method; assert the correct effects.
    $response = $.fn.addressfield.convertToSelect.call(this.adminregion);
    ok($response.is('select'), 'should return a select element');
    equal($response.attr('name'), this.adminregion.attr('name'), 'should maintain name');
    equal($response.attr('id'), this.adminregion.attr('id'), 'should maintain html id');
    equal($response.attr('class'), this.adminregion.attr('class'), 'should maintain classes');
    equal($response.data('_saved'), expectedData, 'should save original value to data attr');

    expect(5);
  });

  test('default text conversion', function() {
    var expectedValue = this.country.val(),
        $response;

    // Call the default convertToText method; assert it had the right effect.
    $response = $.fn.addressfield.convertToText.call(this.country);
    ok($response.is('input'), 'should return an input element');
    equal($response.attr('type'), 'text', 'should return a text input');
    equal($response.attr('name'), this.country.attr('name'), 'should maintain name');
    equal($response.attr('id'), this.country.attr('id'), 'should maintain html id');
    equal($response.attr('class'), this.country.attr('class'), 'should maintain classes');
    equal($response.val(), expectedValue, 'should maintain original input value');

    expect(6);
  });

  test('default options update', function() {
    var oldOptions = this.country.clone().get(0).options,
        options = {
          "XX" : "Foo",
          "YY" : "Bar",
          "ZZ" : "Baz",
          "US" : "Default"
        },
        parent = this,
        oldData = $.fn.data,
        mockDataData = [],
        oldRemoveData = $.fn.removeData,
        mockRemoveDataData = [],
        i;

    // Override the core data method.
    $.fn.data = function(key) {
      mockDataData.push(key);
      return oldData.call(this, key);
    };

    // Override the core removeData method.
    $.fn.removeData = function(key) {
      mockRemoveDataData.push(key);
      return oldRemoveData.call(this, key);
    };

    // Call the default updateOptions method, and assert the correct effects.
    $.fn.addressfield.updateOptions.call(this.country, options);

    // Ensure the data and removeData methods are called with the correct keys.
    strictEqual(mockDataData.length, 1, 'should call $.data() exactly once');
    equal(mockDataData[0], '_saved', 'should call $.data() with key "_saved"');
    strictEqual(mockRemoveDataData.length, 1, 'should call $.removeData() exactly once');
    equal(mockRemoveDataData[0], '_saved', 'should call $.removeData() with key "_saved"');

    // Iterate through the old options, ensure they're gone.
    for (i = 0; i < oldOptions.length; ++i) {
      if (i in oldOptions && oldOptions[i].value !== 'US') {
        strictEqual(this.country.find('option[value="' + oldOptions[i].value + '"]').length, 0, 'should remove old options');
      }
    }

    // Iterate through expected options, ensure they're there.
    $.each(options, function(value, text) {
      strictEqual(parent.country.find('option[value="' + value + '"]').length, 1, 'should add new options');
      strictEqual(parent.country.find('option[value="' + value + '"]').text(), text, 'should add proper label for each value');
    });

    // Ensure the old value is maintained.
    equal(this.country.val(), parent.country.val(), 'should maintain value after update');
    equal(this.country.find('option:selected').text(), options.US, 'should have new option text, though');

    expect(6 + oldOptions.length - 1 + Object.keys(options).length * 2);
  });

  test('default field hide', function() {
    // Set a value on the postal code field.
    this.postalcode.val('foo');

    // Call the default hideField method and assert the correct effects.
    $.fn.addressfield.hideField.call(this.postalcode);
    ok(this.postalcode.not(':visible'), 'should hide the field itself');
    ok(this.postalcode.parent().not(':visible'), 'should hide the parent wrapper');
    strictEqual(this.postalcode.val(), '', 'should unset the value');

    expect(3);
  });

  test('default field show', function() {
    // Hide the postalcode field to begin with.
    $.fn.addressfield.hideField.call(this.postalcode);
    ok(this.postalcode.not(':visible'), 'postal code field hidden');

    // Call the default showField method and assert the correct effects.
    $.fn.addressfield.showField.call(this.postalcode);
    ok(this.postalcode.is(':visible'), 'should show the field itself');
    ok(this.postalcode.parent().is(':visible'), 'should show the parent wrapper');

    expect(3);
  });

  test('default field order', function() {
    var expectedOrder = ['postalcode', 'localityname', 'administrativearea'],
        expectedVals = {
          'postalcode': 90210,
          'localityname': 'Beverly Hills',
          'administrativearea': 'CA'
        },
        oldOrder = [],
        newOrder = [],
        mockCloneData = [],
        mockRemoveData = [],
        oldClone = $.fn.clone,
        oldRemove = $.fn.remove,
        $wrapper = this.address.find('.locality');

    // Override the core clone method.
    $.fn.clone = function() {
      mockCloneData.push($(this).find('input, select').attr('class'));
      return oldClone.call(this);
    };

    // Override the core remove method.
    $.fn.remove = function() {
      mockRemoveData.push($(this).find('input, select').attr('class'));
      return oldRemove.call(this);
    };

    // Get the existing order of the locality fields.
    $('.locality').find('input').each(function() {
      oldOrder.push($(this).attr('class'));

      // While we're at it, add expected values that should be maintained.
      $(this).val(expectedVals[$(this).attr('class')]);
    });

    // Call the default orderFields method and assert the correct effects.
    $.fn.addressfield.orderFields.call($wrapper, expectedOrder.slice(0));

    // Get the new order of the locality fields.
    $('.locality').find('input').each(function() {
      newOrder.push($(this).attr('class'));

      // Ensure the values provided match those expected.
      equal($(this).val(), expectedVals[$(this).attr('class')], 'Value maintained through re-order.');
    });

    deepEqual(newOrder, expectedOrder, 'Order of fields updated as expected.');
    equal(mockCloneData.length, expectedOrder.length, 'Clone method called the correct number of times.');
    deepEqual(mockCloneData, expectedOrder, 'Clone method called for each field in the expected order.');
    equal(mockRemoveData.length, expectedOrder.length, 'Remove method called the correct number of times.');
    deepEqual(mockRemoveData, expectedOrder, 'Remove method called for each field in the expected order.');

    expect(5 + Object.keys(expectedVals).length);
  });

  module('jQuery#addressfield plugin behavior', {
    setup: function() {
      this.address = $('#qunit-fixture');
    }
  });

  test('is chainable', function() {
    strictEqual(this.address.addressfield({}, []), this.address, 'should be chainable');
    expect(1);
  });


  test('attempts to order fields', function() {
    var orderFieldsMethodCalled = 0,
        mockData = {};

    // Override the orderFields method.
    $.fn.addressfield.orderFields = function(field_order) {
      orderFieldsMethodCalled++;
      mockData = {
        "order": field_order,
        "container": this
      };
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield({}, []);
    equal(orderFieldsMethodCalled, 1, 'should call orderFields exactly once');
    deepEqual(mockData.order, [], 'should be called with an empty array');
    deepEqual(mockData.container, this.address, 'should be called with the address container');

    expect(3);
  });

  test('attempts to hide disabled fields', function() {
    var mockData = [],
        shouldBeShown = {'postalcode' : ""},
        attemptToHide = ['administrativearea', 'locality', 'postalcode'];

    // Override the hideField method.
    $.fn.addressfield.hideField = function() {
      mockData.push(this.attr('class'));
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(shouldBeShown, attemptToHide);
    equal(mockData.length, 2, 'should only be called twice, despite passing 3 fields');
    strictEqual(mockData.indexOf('postalcode'), -1, 'postal code should not have been hidden');

    expect(2);
  });

  test('attempts to update field labels', function() {
    var updateLabelMethodCalled = 0,
        mockData = '',
        expectedLabel = 'Foobar',
        config = {'postalcode' : {'label': expectedLabel}},
        enabledFields = ['postalcode'];

    // Override the updateLabel method.
    $.fn.addressfield.updateLabel = function(label) {
      updateLabelMethodCalled++;
      mockData = label;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(updateLabelMethodCalled, 1, 'should only be called once');
    equal(mockData, expectedLabel, 'should be called with the expected label');

    expect(2);
  });

  test('does not attempt to update label for disabled field', function() {
    var updateLabelMethodCalled = 0,
        mockData = '',
        expectedLabel = 'Foobar',
        config = {'postalcode' : {'label': expectedLabel}},
        enabledFields = ['notpostalcode'];

    // Override the updateLabel method.
    $.fn.addressfield.updateLabel = function(label) {
      updateLabelMethodCalled++;
      mockData = label;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(updateLabelMethodCalled, 0, 'should not be called');

    expect(1);
  });

  test('attempts to call itself recursively', function() {
    var updateLabelMethodCalled = 0,
        mockData = '',
        expectedLabel = 'Foobar',
        config = {"locality" : {'postalcode' : {'label': expectedLabel}}},
        enabledFields = ['postalcode', 'locality'];

    // Override the updateLabel method.
    $.fn.addressfield.updateLabel = function(label) {
      updateLabelMethodCalled++;
      mockData = label;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(updateLabelMethodCalled, 1, 'should only be called once');
    equal(mockData, expectedLabel, 'should be called with the expected label');

    expect(2);
  });

  test('attempts to show a hidden, enabled field', function() {
    var mockData = [],
        config = {'postalcode' : {'label': 'Postcode'}},
        enabledFields = ['postalcode'];

    // Override the showField method.
    $.fn.addressfield.showField = function() {
      mockData.push(this.attr('class'));
    };

    // Hide the postalcode field to begin with.
    $.fn.addressfield.hideField.call(this.address.find('.postalcode'));
    ok(this.address.find('.postalcode').not(':visible'), 'postal code field hidden');

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(mockData.length, 1, 'should be called exactly once');
    equal(mockData[0], 'postalcode', 'postal code should have been shown');

    expect(3);
  });

  test('does not attempt to show a hidden, but disabled field', function() {
    var mockData = [],
      config = {'postalcode' : {'label': 'Postcode'}},
      enabledFields = [];

    // Override the showField method.
    $.fn.addressfield.showField = function() {
      mockData.push(this.attr('class'));
    };

    // Hide the postalcode field to begin with.
    $.fn.addressfield.hideField.call(this.address.find('.postalcode'));
    ok(this.address.find('.postalcode').not(':visible'), 'postal code field hidden');

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(mockData.length, 0, 'should not be called');

    expect(2);
  });

  test('field order attempted is as expected', function() {
    var mockData = [],
        config = {
          'postalcode' : {'label': 'Postcode'},
          'localityname' : {'label' : 'City'}
        },
        enabledFields = ['localityname', 'postalcode'],
        expectedOrder = [],
        field;

    // Determine the expected order from the config above.
    for (field in config) {
      expectedOrder.push(field);
    }

    // Override the orderFields method.
    $.fn.addressfield.orderFields = function(field_order) {
      mockData = field_order;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    deepEqual(mockData, expectedOrder, 'should order fields as expected');

    expect(1);
  });

  test('converts select fields to text', function() {
    var convertToTextMethodCalled = 0,
        config = {'country' : {'label' : 'Country/Region'}},
        enabledFields = ['country'];

    // Override the convertToText method.
    $.fn.addressfield.convertToText = function() {
      convertToTextMethodCalled++;
      return this;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(convertToTextMethodCalled, 1, 'should be called exactly once');

    expect(1);
  });

  test('does not convert disabled select fields to text', function() {
    var convertToTextMethodCalled = 0,
        config = {'country' : {'label' : 'Country/Region'}},
        enabledFields = [];

    // Override the convertToText method.
    $.fn.addressfield.convertToText = function() {
      convertToTextMethodCalled++;
      return this;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(convertToTextMethodCalled, 0, 'should not be called');

    expect(1);
  });

  test('updates options for existing select', function() {
    var updateOptionsMethodCalled = 0,
        convertToSelectMethodCalled = 0,
        config = {
          'country' : {
            'label' : 'Country/Region',
            'options' : {
              "foo" : "bar",
              "baz" : "fizz"
            }
          }
        },
        enabledFields = ['country'],
        updatedOptions = {};

    // Override the convertToText method.
    $.fn.addressfield.updateOptions = function(options) {
      updateOptionsMethodCalled++;
      updatedOptions = options;
    };

    // Override the convertToSelect method.
    $.fn.addressfield.convertToSelect = function() {
      convertToSelectMethodCalled++;
      return this;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(updateOptionsMethodCalled, 1, 'should be called');
    deepEqual(updatedOptions, config.country.options, 'options should match');
    equal(convertToSelectMethodCalled, 0, 'should not convert to select');

    expect(3);
  });

  test('updates options and converts to select', function() {
    var updateOptionsMethodCalled = 0,
        convertToSelectMethodCalled = 0,
        config = {
        'administrativearea' : {
          'label' : 'Province',
          'options' : {
            "foo" : "bar",
            "baz" : "fizz"
          }
        }
      },
      enabledFields = ['administrativearea'],
      updatedOptions = {};

    // Override the convertToText method.
    $.fn.addressfield.updateOptions = function(options) {
      updateOptionsMethodCalled++;
      updatedOptions = options;
    };

    // Override the convertToSelect method.
    $.fn.addressfield.convertToSelect = function() {
      convertToSelectMethodCalled++;
      return this;
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(config, enabledFields);
    equal(updateOptionsMethodCalled, 1, 'should be called');
    deepEqual(updatedOptions, config.administrativearea.options, 'options should match');
    equal(convertToSelectMethodCalled, 1, 'should convert to select');

    expect(3);
  });

}(jQuery));
