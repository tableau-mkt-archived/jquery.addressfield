(function($) {

  module('jQuery#addressfield default methods', {
    setup: function() {
      this.address = $('#qunit-fixture');
      this.country = this.address.find('select.country');
      this.adminregion = this.address.find('input.administrativearea');
      this.postalcode = this.address.find('input.postalcode');
    }
  });

  test('default only key', function() {
    var object = {onlyKey: 'value'},
        returnedKey;

    // Call the default onlyKey method; assert it returns the expected value.
    returnedKey = $.fn.addressfield.onlyKey(object);
    equal(returnedKey, 'onlyKey', 'should return only key in object');

    expect(1);
  });

  test('default has field', function() {
    var config = {fields: [{
        premise: {}
      }, {
        locality: [{
          administrativearea: {}
        }]
      }]},
      testFields = {
        'premise' : true,
        'thoroughfare': false,
        'administrativearea': true,
        'postalcode': false
      },
      testField,
      response;

    // Call the default hasField method; assert it returns as expected.
    for (testField in testFields) {
      response = $.fn.addressfield.hasField(config, testField);
      strictEqual(response, testFields[testField], 'should respond whether config has field');
    }

    expect(Object.keys(testFields).length);
  });

  test('default example placeholder', function() {
    var postExamplesExpecteds = {
          "98103": "e.g. 98103",
          "": ""
        },
        example;

    // Call the default updateEg method; assert it had the desired effect.
    for (example in postExamplesExpecteds) {
      $.fn.addressfield.updateEg.call(this.postalcode, example);
      equal(this.postalcode.attr('placeholder'), postExamplesExpecteds[example]);
    }

    expect(Object.keys(postExamplesExpecteds).length);
  });

  test('default validator no format', function() {
    var fieldName = 'postalcode',
        expectedMethodName = 'isValid_' + fieldName,
        addMethodValues = {};

    // Stub out jQuery.validator.
    $.validator = {
      "messages": {},
      "addMethod": function (methodName, callable, message) {
        addMethodValues.methodName = methodName;
        addMethodValues.callable = callable;
        addMethodValues.message = message;
      }
    };

    // Call the default validate method with no format; assert desired effects.
    $.fn.addressfield.validate.call(this.postalcode, fieldName, {});
    equal(addMethodValues.methodName, expectedMethodName, 'should use expected validation method name');
    equal(addMethodValues.message, 'Please check your formatting.', 'should use default message when not previously defined');
    equal(addMethodValues.callable(), true, 'should set validation method to function that always returns true');

    // Do the same, but provide an alternate message.
    addMethodValues = {};
    $.validator.messages[expectedMethodName] = 'Overridden message.';
    $.fn.addressfield.validate.call(this.postalcode, fieldName, {});
    equal(addMethodValues.methodName, expectedMethodName, 'should use expected validation method name');
    equal(addMethodValues.message, $.validator.messages[expectedMethodName], 'should use pre-defined message when provided');
    equal(addMethodValues.callable(), true, 'should set validation method to function that always returns true');

    // "Unset" jQuery.validator.
    delete $.validator;
    expect(6);
  });

  test('default validator with format', function() {
    var fieldName = 'postalcode',
        format = {format: "^\\d{1}$"},
        expectedMethodName = 'isValid_' + fieldName,
        expectedRule = {},
        addMethodValues = {},
        rulesValues = {};

    // Stub out jQuery.validator.
    $.validator = {
      "messages": {},
      "addMethod": function (methodName, callable, message) {
        addMethodValues.methodName = methodName;
        addMethodValues.callable = callable;
        addMethodValues.message = message;
      }
    };

    // Mock jQuery.rules, define expected rule.
    expectedRule[expectedMethodName] = true;
    $.fn.rules = function(method, rule) {
      rulesValues.method = method;
      rulesValues.rule = rule;
    };

    // Call the default validate method with a format; assert desired effects.
    $.fn.addressfield.validate.call(this.postalcode, fieldName, format);
    equal(addMethodValues.methodName, expectedMethodName, 'should use expected validation method name');
    equal(addMethodValues.message, 'Please check your formatting.', 'should use default message when not previously defined');
    equal(addMethodValues.callable(1), true, 'should set validation method to evaluate true when appropriate');
    equal(addMethodValues.callable('d'), false, 'should set validation method to evaluate false when appropriate');
    equal(rulesValues.method, 'add', 'should call $.rules with add method');
    deepEqual(rulesValues.rule, expectedRule, 'should call $.rules with expected rule');

    // Do the same, but provide an alternate message.
    addMethodValues = {};
    rulesValues = {};
    $.validator.messages[expectedMethodName] = 'Overridden message.';
    $.fn.addressfield.validate.call(this.postalcode, fieldName, format);
    equal(addMethodValues.methodName, expectedMethodName, 'should use expected validation method name');
    equal(addMethodValues.message, $.validator.messages[expectedMethodName], 'should use pre-defined message when provided');
    equal(addMethodValues.callable(1), true, 'should set validation method to evaluate true when appropriate');
    equal(addMethodValues.callable(' 1  '), true, 'should allow leading/trailing whitespace');
    equal(addMethodValues.callable('d'), false, 'should set validation method to evaluate false when appropriate');
    equal(rulesValues.method, 'add', 'should call $.rules with add method');
    deepEqual(rulesValues.rule, expectedRule, 'should call $.rules with expected rule');

    // "Unset" jQuery.validator and the rules method.
    delete $.validator;
    delete $.fn.rules;
    expect(13);
  });

  test('default label update prev', function() {
    var postLabel = 'Postcode',
        countryLabel = 'Country/region';

    // Call the default updateLabel method; assert it had the right effect.
    $.fn.addressfield.updateLabel.call(this.postalcode, postLabel);
    equal(this.postalcode.prev('label').text(), postLabel, 'should update post label');

    // Call the default updateLabel method on a field whose label is not
    // directly adjacent to the field; assert it had the right effect.
    $.fn.addressfield.updateLabel.call(this.country, countryLabel);
    equal($('label[for="' + this.country.attr('id') + '"]').text(), countryLabel, 'should update label');

    expect(2);
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
        options = [
          {"XX" : "Foo"},
          {"YY" : "Bar"},
          {"ZZ" : "Baz"},
          {"US" : "Default"}
        ],
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
    $.each(options, function(optionPos) {
      var value = $.fn.addressfield.onlyKey(options[optionPos]);
      strictEqual(parent.country.find('option[value="' + value + '"]').length, 1, 'should add new options');
      strictEqual(parent.country.find('option[value="' + value + '"]').text(), options[optionPos][value], 'should add proper label for each value');
    });

    // Ensure the old value is maintained.
    equal(this.country.val(), parent.country.val(), 'should maintain value after update');
    equal(this.country.find('option:selected').text(), options[3].US, 'should have new option text, though');

    expect(6 + oldOptions.length - 1 + Object.keys(options).length * 2);
  });

  test('empty country population', function() {
    var $cloneAddress = this.address.clone(),
        $emptyCountry = $cloneAddress.find('.country'),
        oldAjax = $.ajax,
        mockJsonData = {
          "label": "Country",
          "options": [
            {
              "label": "United States",
              "iso": "US"
            },
            {
              "label": "Canada",
              "iso": "CA"
            },
            {
              "label": "Japan",
              "iso": "JA"
            }
          ]
        },
        expectedResponseData = $.extend(true, {}, mockJsonData);

    // Init with mock inline JSON data. This should be a no-op because the <select> is already
    // populated with options.
    $cloneAddress.addressfield({json: mockJsonData, fields: {country: '.country'}});

    strictEqual($cloneAddress.find('.country option').length, $(this.address).find('.country option').length, 'Same number of options exist as initial country select element.');

    // Now empty out the cloned <select>.
    $emptyCountry.find('option').remove();

    // Init again with mock inline JSON data.
    $cloneAddress.addressfield({json: mockJsonData, fields: {country: '.country'}});

    strictEqual($emptyCountry.find('option').length, mockJsonData.options.length, 'Correct number of options appended to country select element.');

    // Check that the new values match up.
    $.each(mockJsonData.options, function(optionPos, value) {
      strictEqual($emptyCountry.find('option[value="' + value.iso + '"]').length, 1, 'Should add new option');
      strictEqual($emptyCountry.find('option[value="' + value.iso + '"]').text(), mockJsonData.options[optionPos]['label'], 'Should add proper label for each value');
    });

    // Test against mock ajax retrieved data.

    // First. Push another option into the mock ajax repsponse to differentiate it from the mock JSON string.
    expectedResponseData.options.push({
      "label": "Germany",
      "iso": "DE"
    });

    // Mock an ajax request.
    $.ajax = function(options) {
      options.success(expectedResponseData);
      // Override so any real AJAX results in a no-op.
      options.success = function() {};
      return oldAjax(options);
    };

    // Now empty out the cloned <select> again.
    $emptyCountry.find('option').remove();

    // Init a synchronous mock ajax request.
    $cloneAddress.addressfield({
      json: '/foo/bar/baz.json',
      fields: {country: '.country'},
      async: false
    });

    strictEqual($emptyCountry.find('option').length, expectedResponseData.options.length, 'Correct number of options appended to country select element via ajax request.');

    // Check that the new values match up.
    $.each(expectedResponseData.options, function(optionPos, value) {
      strictEqual($emptyCountry.find('option[value="' + value.iso + '"]').length, 1, 'Should add new option');
      strictEqual($emptyCountry.find('option[value="' + value.iso + '"]').text(), expectedResponseData.options[optionPos]['label'], 'Should add proper label for each value');
    });

    // Reset methods.
    $.ajax = oldAjax;

    expect(17);
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
    this.postalcode.hide();
    ok(this.postalcode.not(':visible'), 'postal code field hidden');

    // Call the default showField method and assert the correct effects.
    $.fn.addressfield.showField.call(this.postalcode);
    ok(this.postalcode.is(':visible'), 'should show the field itself');
    ok(this.postalcode.parent().is(':visible'), 'should show the parent wrapper');

    expect(3);
  });

  test('default field hidden', function() {
    // Hide the postalcode field, assert that it is hidden.
    $.fn.addressfield.hideField.call(this.postalcode);
    strictEqual($.fn.addressfield.isVisible.call(this.postalcode), false, 'postal code field is hidden');

    // Call the default showField method and assert that it is not hidden.
    $.fn.addressfield.showField.call(this.postalcode);
    strictEqual($.fn.addressfield.isVisible.call(this.postalcode), true, 'postal code field is not hidden');

    expect(2);
  });

  test('default field container', function() {
    var mockParentsData = {},
        oldParents = $.fn.parents,
        oldHas = $.fn.has,
        oldFirst = $.fn.first,
        mockHasData = {},
        mockFirstExpected = 'expected',
        actualResponse;

    // Override the core parents method.
    $.fn.parents = function() {
      mockParentsData = $(this);
      return mockParentsData;
    };

    // Override the core has method.
    $.fn.has = function($elements) {
      mockHasData = $elements;
      return $(this);
    };

    // Override the core first method.
    $.fn.first = function() {
      return mockFirstExpected;
    };

    // Call the default container method and assert its expected behavior.
    actualResponse = $.fn.addressfield.container.call(this.postalcode);

    // Ensure .parents() is called with $(this)
    strictEqual(mockParentsData.attr('id'), this.postalcode.attr('id'), 'find parents of element');

    // Ensure has is called on $(this) with appropriate label (using for)
    strictEqual(mockHasData.attr('for'), this.postalcode.attr('id'), 'filter by elements containing label (for)');

    // Ensure the method returns as expected.
    strictEqual(actualResponse, mockFirstExpected, 'returned expected container');

    expect(3);

    // Reset methods.
    $.fn.parents = oldParents;
    $.fn.has = oldHas;
    $.fn.first = oldFirst;
  });

  test('default copy attrs to', function() {
    var $mock = $('<input id="bar" name="baz" other="fizz" />'),
        mockAttrData = [],
        oldAttr = $.fn.attr,
        $target = $('<input />'),
        attribute = document.createAttribute('propdescname');

    // Mock the core attr method.
    $.fn.attr = function(name, value) {
      oldAttr.call($target, name, value);
      mockAttrData.push(name);
    };

    // Run the copy attrs method.
    $.fn.addressfield.copyAttrsTo.call($mock, $target);

    // Ensure expected behavior.
    strictEqual(mockAttrData.length, 2, 'called exactly 3 times');
    ok($.inArray('id', mockAttrData) > -1, 'id copied');
    ok($.inArray('name', mockAttrData) > -1, 'name copied');
    strictEqual($.inArray('class', mockAttrData), -1, 'class not copied');
    strictEqual($.inArray('other', mockAttrData), -1, 'class not copied');

    // Fake IE8 test: add a propdescname attribute to the DOM element.
    mockAttrData = [];
    $target = $('<input />');
    $mock = $('<input id="bar" other="fizz" />');
    attribute.nodeValue= 'ie8baz';
    $mock[0].attributes.setNamedItem(attribute);

    // Then make sure it gets copied over as a "name" attr.
    $.fn.addressfield.copyAttrsTo.call($mock, $target);
    ok($.inArray('name', mockAttrData) > -1, 'name copied for IE8');

    expect(6);

    // Reset methods.
    $.fn.attr = oldAttr;
  });

  test('default transform', function() {
    var givenInput = {options: [{
          iso: 'US',
          label: 'United States'
        }, {
          iso: 'CA',
          label: 'Canada'
        }]},
        expectedOutput = {US: givenInput.options[0], CA: givenInput.options[1]},
        returnedOutput;

    // Call the default binder method; assert it returns the expected value.
    returnedOutput = $.fn.addressfield.transform(givenInput);
    deepEqual(expectedOutput, returnedOutput, 'should transform data as expected');

    expect(1);
  });

  test('default binder', function() {
    var fieldMap = {country: 'select.country'},
        countryVal = 'US',
        countryConfig = {US: {key: 'value'}},
        oldApply = $.fn.addressfield.apply,
        savedContainer,
        savedConfig,
        savedFieldMap;

    // Mock our own apply call.
    $.fn.addressfield.apply = function (config, fieldMap) {
      savedContainer = this;
      savedConfig = config;
      savedFieldMap = fieldMap;
      return oldApply.call(this, config, fieldMap);
    };

    // Call the default binder method; assert it had the expected affects.
    $.fn.addressfield.binder.call(this.address, fieldMap, countryConfig);
    this.country.val(countryVal).change();
    deepEqual(savedContainer, this.address, 'change triggered bound event on expected container');
    deepEqual(savedConfig, countryConfig[countryVal], 'bound apply used expected field config');
    deepEqual(savedFieldMap, fieldMap, 'bound apply used expected field map');

    // Reset.
    $.fn.addressfield.apply = oldApply;

    expect(3);
  });

  test('default field order', function() {
    var expectedOrder = ['.postalcode', '.localityname', '.administrativearea'],
        expectedVals = {
          'postalcode': 90210,
          'localityname': 'Beverly Hills',
          'administrativearea': 'CA'
        },
        oldOrder = [],
        newOrder = [],
        mockDetachData = [],
        oldDetach = $.fn.detach,
        $wrapper = this.address.find('.locality');

    // Override the core detach method.
    $.fn.detach = function() {
      mockDetachData = $.map(this, function (element) {
        return '.' + $(element).find('input, select').attr('class');
      });
      return oldDetach.call(this);
    };

    // Get the existing order of the locality fields.
    $('.locality').find('input').each(function() {
      oldOrder.push('.' + $(this).attr('class'));

      // While we're at it, add expected values that should be maintained.
      $(this).val(expectedVals[$(this).attr('class')]);
    });

    // Call the default orderFields method and assert the correct effects.
    $.fn.addressfield.orderFields.call($wrapper, expectedOrder.slice(0));

    // Get the new order of the locality fields.
    $('.locality').find('input').each(function() {
      newOrder.push('.' + $(this).attr('class'));

      // Ensure the values provided match those expected.
      equal($(this).val(), expectedVals[$(this).attr('class')], 'Value maintained through re-order.');
    });

    deepEqual(newOrder, expectedOrder, 'Order of fields updated as expected.');
    equal(mockDetachData.length, expectedOrder.length, 'Detach method called with the correct number of elements.');
    deepEqual(mockDetachData, expectedOrder, 'Detach method called for each field in the expected order.');

    expect(3 + Object.keys(expectedVals).length);
  });

  module('jQuery#addressfield plugin behavior', {
    setup: function() {
      this.address = $('#qunit-fixture');
      this.country = $('#address-country');
    }
  });

  test('is chainable', function() {
    var oldBinder = $.fn.addressfield.binder;

    // Stub the binder method.
    $.fn.addressfield.binder = function() {};

    strictEqual(this.address.addressfield(), this.address, 'should be chainable');
    strictEqual(this.address.addressfield({json:''}), this.address, 'should be chainable');
    strictEqual(this.address.addressfield({json:{},fields:{country:'.country'}}), this.address, 'should be chainable');
    expect(3);

    // Clean everything up.
    $.fn.addressfield.binder = oldBinder;
  });

  test('extends default configurations', function () {
    var oldExtend = $.extend,
        expectedOptions = {
          foo: 'bar',
          baz: 'fizz',
          defs: {},
          fields: {}
        },
        expectedDefaults = {
          fields: {},
          json: null,
          async: true,
          defs: {fields: {}}
        },
        mockData = {};

    // Override the core extend method.
    $.extend = function(arg1, arg2) {
      mockData.defaults = JSON.parse(JSON.stringify(arg1));
      mockData.options = JSON.parse(JSON.stringify(arg2));
      return oldExtend.call(this, arg1, arg2);
    };

    // Call the addressfield plugin and assert the correct effects.
    this.address.addressfield(expectedOptions);
    deepEqual(mockData.defaults, expectedDefaults, 'should be called with expected defaults');
    deepEqual(mockData.options, expectedOptions, 'should be called with passed options');

    // Reset methods.
    $.extend = oldExtend;

    expect(2);
  });

  test('loads and binds when passed a string', function() {
    var oldAjax = $.ajax,
        oldChange = $.fn.change,
        oldBinder = $.fn.addressfield.binder,
        oldTransform = $.fn.addressfield.transform,
        mockTransformedData = {transformed: 'data'},
        expectedFields = {foo: 'bar', country: '#address-country'},
        expectedResponseData = {fizz: 'bizz'},
        expectedDataType = 'json',
        expectedUrl = '/foo/bar/baz.json',
        expectedAsync = false,
        changeWasTriggeredOn = null,
        ajaxDataType,
        ajaxUrl,
        ajaxAsync,
        binderContainer,
        binderFields,
        binderData,
        transformData;

    // Mock the core ajax/change and addressfield binder and transform methods.
    $.ajax = function(options) {
      ajaxDataType = options.dataType;
      ajaxUrl = options.url;
      ajaxAsync = options.async;
      options.success(expectedResponseData);
      // Override so any real AJAX results in a no-op.
      options.success = function() {};
      return oldAjax(options);
    };
    $.fn.change = function() {
      changeWasTriggeredOn = this;
    };
    $.fn.addressfield.binder = function(fields, data) {
      binderContainer = this;
      binderFields = fields;
      binderData = data;
    };
    $.fn.addressfield.transform = function(data) {
      transformData = data;
      return mockTransformedData;
    };

    // Instantiate the addressfield plugin and assert the correct effects.
    this.address.addressfield({
      json: expectedUrl,
      fields: expectedFields,
      async: expectedAsync
    });

    strictEqual(ajaxDataType, expectedDataType, 'passed expected data type');
    strictEqual(ajaxUrl, expectedUrl, 'passed expected url');
    strictEqual(ajaxAsync, expectedAsync, 'passed expected async value');
    strictEqual(transformData, expectedResponseData, 'transformed ajax json response data');
    strictEqual(binderContainer, this.address, 'bound to expected container');
    strictEqual(binderFields, expectedFields, 'bound with expected fields');
    strictEqual(binderData, mockTransformedData, 'bound with transformed data');
    deepEqual(changeWasTriggeredOn, this.country, 'change triggered on country');

    // Reset methods.
    $.ajax = oldAjax;
    $.fn.change = oldChange;
    $.fn.addressfield.binder = oldBinder;
    $.fn.addressfield.transform = oldTransform;

    expect(8);
  });

  test('binds when passed data object', function() {
    var oldBinder = $.fn.addressfield.binder,
        oldTransform = $.fn.addressfield.transform,
        oldChange = $.fn.change,
        mockFields = {foo: 'bar', country: '#address-country'},
        mockJsonData = {some: 'thing'},
        mockTransformedData = {fizz: 'buzz'},
        changeWasTriggeredOn = null,
        binderContainer,
        binderFields,
        binderData,
        transformData;

    // Mock the core change and addressfield binder and transform methods.
    $.fn.change = function() {
      changeWasTriggeredOn = this;
    };
    $.fn.addressfield.binder = function(fields, data) {
      binderContainer = this;
      binderFields = fields;
      binderData = data;
    };
    $.fn.addressfield.transform = function(data) {
      transformData = data;
      return mockTransformedData;
    };

    // Instantiate the plugin and assert the correct effects.
    this.address.addressfield({
      fields: mockFields,
      json: mockJsonData
    });

    strictEqual(transformData, mockJsonData, 'transformed data as expected');
    strictEqual(binderData, mockTransformedData, 'received transformed data');
    strictEqual(binderFields, mockFields, 'received expected fields');
    strictEqual(binderContainer, this.address, 'bound context is as expected');
    deepEqual(changeWasTriggeredOn, this.country, 'change triggered on country');

    // Reset methods.
    $.fn.change = oldChange;
    $.fn.addressfield.binder = oldBinder;
    $.fn.addressfield.transform = oldTransform;

    expect(5);
  });

  test('applies when null data is passed in', function() {
    var oldApply = $.fn.addressfield.apply,
        expectedFields = {foo: 'bar'},
        expectedDefs = {fizz: 'buzz'},
        applyContainer,
        passedDefs,
        passedFields;

    // Mock the apply method.
    $.fn.addressfield.apply = function(defs, fields) {
      applyContainer = this;
      passedDefs = defs;
      passedFields = fields;
    };

    // Instantiate the plugin and assert the correct effects.
    this.address.addressfield({
      json: null,
      fields: expectedFields,
      defs: expectedDefs
    });

    strictEqual(applyContainer, this.address, 'applied to expected container');
    strictEqual(passedDefs, expectedDefs, 'applied expected field definitions');
    strictEqual(passedFields, expectedFields, 'applied expected fields');

    // Reset methods.
    $.fn.addressfield.apply = oldApply;
    expect(3);
  });

  module('jQuery#addressfield apply behavior', {
    setup: function() {
      this.address = $('#qunit-fixture');
      this.emptyConfig = {fields: {}};
      this.emptyFieldMap = {};
    }
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

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, this.emptyConfig, this.emptyFieldMap);
    equal(orderFieldsMethodCalled, 1, 'should call orderFields exactly once');
    deepEqual(mockData.order, [], 'should be called with an empty array');
    deepEqual(mockData.container, this.address, 'should be called with the address container');

    expect(3);
  });

  test('attempts to hide disabled fields', function() {
    var mockData = [],
        shouldBeShown = {fields: [{'postalcode' : ""}]},
        attemptToHide = {
          administrativearea: '.administrativearea',
          locality: '.locality',
          postalcode: '.postalcode'
        };

    // Override the hideField method.
    $.fn.addressfield.hideField = function() {
      mockData.push(this.attr('class'));
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, shouldBeShown, attemptToHide);
    equal(mockData.length, 2, 'should only be called twice, despite passing 3 fields');
    strictEqual(mockData.indexOf('postalcode'), -1, 'postal code should not have been hidden');

    expect(2);
  });

  test('attempts to update field labels', function() {
    var updateLabelMethodCalled = 0,
        mockData = '',
        expectedLabel = 'Foobar',
        config = {fields: [{'postalcode' : {'label': expectedLabel}}]},
        enabledFields = {postalcode: '.postalcode'};

    // Override the updateLabel method.
    $.fn.addressfield.updateLabel = function(label) {
      updateLabelMethodCalled++;
      mockData = label;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(updateLabelMethodCalled, 1, 'should only be called once');
    equal(mockData, expectedLabel, 'should be called with the expected label');

    expect(2);
  });

  test('does not attempt to update label for disabled field', function() {
    var updateLabelMethodCalled = 0,
        mockData = '',
        expectedLabel = 'Foobar',
        config = {fields: [{'postalcode' : {'label': expectedLabel}}]},
        enabledFields = {notpostalcode: '.notpostalcode'};

    // Override the updateLabel method.
    $.fn.addressfield.updateLabel = function(label) {
      updateLabelMethodCalled++;
      mockData = label;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(updateLabelMethodCalled, 0, 'should not be called');

    expect(1);
  });

  test('attempts to call itself recursively', function() {
    var updateLabelMethodCalled = 0,
        mockData = '',
        expectedLabel = 'Foobar',
        config = {fields: [{"locality" : [{'postalcode' : {'label': expectedLabel}}]}]},
        enabledFields = {postalcode: '.postalcode', locality: '.locality'};

    // Override the updateLabel method.
    $.fn.addressfield.updateLabel = function(label) {
      updateLabelMethodCalled++;
      mockData = label;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(updateLabelMethodCalled, 1, 'should only be called once');
    equal(mockData, expectedLabel, 'should be called with the expected label');

    expect(2);
  });

  test('attempts to show a hidden, enabled field', function() {
    var mockData = [],
        config = {fields: [{'postalcode' : {'label': 'Postcode'}}]},
        enabledFields = {postalcode: '.postalcode'};

    // Override the showField method.
    $.fn.addressfield.showField = function() {
      mockData.push(this.attr('class'));
    };

    // Hide the postalcode field to begin with.
    $('.postalcode').hide();
    ok(this.address.find('.postalcode').not(':visible'), 'postal code field hidden');

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(mockData.length, 1, 'should be called exactly once');
    equal(mockData[0], 'postalcode', 'postal code should have been shown');

    expect(3);
  });

  test('does not attempt to show a hidden, but disabled field', function() {
    var mockData = [],
      config = {fields: [{'postalcode' : {'label': 'Postcode'}}]};

    // Override the showField method.
    $.fn.addressfield.showField = function() {
      mockData.push(this.attr('class'));
    };

    // Hide the postalcode field to begin with.
    $.fn.addressfield.hideField.call(this.address.find('.postalcode'));
    ok(this.address.find('.postalcode').not(':visible'), 'postal code field hidden');

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, this.emptyFieldMap);
    equal(mockData.length, 0, 'should not be called');

    expect(2);
  });

  test('field order attempted is as expected', function() {
    var mockData = [],
        config = {fields: [{
          'postalcode': {'label': 'Postcode'}
        }, {
          'localityname' : {'label' : 'City'}
        }]},
        enabledFields = {localityname: '.localityname', postalcode: '.postalcode'},
        expectedOrder = [],
        field;

    // Determine the expected order from the config above.
    for (field in config.fields) {
      expectedOrder.push('.' + $.fn.addressfield.onlyKey(config.fields[field]));
    }

    // Override the orderFields method.
    $.fn.addressfield.orderFields = function(field_order) {
      mockData = field_order;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    deepEqual(mockData, expectedOrder, 'should order fields as expected');

    expect(1);
  });

  test('converts select fields to text', function() {
    var convertToTextMethodCalled = 0,
        config = {fields: [{'country' : {'label' : 'Country/Region'}}]},
        enabledFields = {country: '.country'};

    // Override the convertToText method.
    $.fn.addressfield.convertToText = function() {
      convertToTextMethodCalled++;
      return this;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(convertToTextMethodCalled, 1, 'should be called exactly once');

    expect(1);
  });

  test('does not convert disabled select fields to text', function() {
    var convertToTextMethodCalled = 0,
        config = {fields: [{'country' : {'label' : 'Country/Region'}}]};

    // Override the convertToText method.
    $.fn.addressfield.convertToText = function() {
      convertToTextMethodCalled++;
      return this;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, this.emptyFieldMap);
    equal(convertToTextMethodCalled, 0, 'should not be called');

    expect(1);
  });

  test('updates options for existing select', function() {
    var updateOptionsMethodCalled = 0,
        convertToSelectMethodCalled = 0,
        config = {fields: [{
          'country' : {
            'label' : 'Country/Region',
            'options' : [{
              "foo": "bar"
            }, {
              "baz" : "fizz"
            }]
          }
        }]},
        enabledFields = {country: '.country'},
        updatedOptions = [];

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

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(updateOptionsMethodCalled, 1, 'should be called');
    deepEqual(updatedOptions, config.fields[0].country.options, 'options should match');
    equal(convertToSelectMethodCalled, 0, 'should not convert to select');

    expect(3);
  });

  test('updates options and converts to select', function() {
    var updateOptionsMethodCalled = 0,
        convertToSelectMethodCalled = 0,
        config = {fields: [{
        'administrativearea' : {
          'label' : 'Province',
          'options' : [{
            "foo": "bar"
          }, {
            "baz" : "fizz"
          }]
        }
      }]},
      enabledFields = {administrativearea: '.administrativearea'},
      updatedOptions = [];

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

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(updateOptionsMethodCalled, 1, 'should be called');
    deepEqual(updatedOptions, config.fields[0].administrativearea.options, 'options should match');
    equal(convertToSelectMethodCalled, 1, 'should convert to select');

    expect(3);
  });

  test('updates placeholder empty or not', function() {
    var config = {fields: [{'postalcode': {'label': 'Postcode', 'eg': '98103'}}]},
        enabledFields = {postalcode: '.postalcode'},
        passedPlaceholder = '';

    // Override the updateEg method.
    $.fn.addressfield.updateEg = function(placeholder) {
      passedPlaceholder = placeholder;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(passedPlaceholder, config.fields[0].postalcode.eg, 'should be called with passed example');
    delete config.fields[0].postalcode.eg;
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(passedPlaceholder, '', 'should be called with empty string');

    expect(2);
  });

  test('do not update placeholder on options list', function() {
    var config = {fields: [{'administrativearea' : {'label' : 'Province', 'options' : []}}]},
        enabledFields = {administrativearea: '.administrativearea'},
        updateEgCalled = 0;

    // Override the updateEg method.
    $.fn.addressfield.updateEg = function() {
      updateEgCalled++;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(updateEgCalled, 0, 'should not be called on an option list');

    expect(1);
  });

  test('call validate handling', function() {
    var config = {fields: [{'postalcode': {'label': 'Postcode', 'eg': '98103'}}]},
        enabledFields = {postalcode: '.postalcode'},
        validateValues = {};

    // Override the validate method.
    $.fn.addressfield.validate = function(field, format) {
      validateValues.field = field;
      validateValues.format = format;
    };

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);
    equal(validateValues.field, 'postalcode', 'should be called with given field name');
    deepEqual(validateValues.format, config.fields[0].postalcode, 'should be called with given field config');

    expect(2);
  });

  test('check event fired', function() {
    var config = {fields: [{'postalcode': {'label': 'Postcode', 'eg': '98103'}}]},
        enabledFields = {postalcode: '.postalcode'},
        fired = false;

    // Bind an event listener for addressfield:after to the document element.
    $(document).bind('addressfield:after', function (event, data) {
      if (event.type === 'addressfield:after' && data && data.hasOwnProperty('config') && data.hasOwnProperty('fieldMap')) {
        fired = true;
      }
    });

    // Call addressfield apply and assert the correct effects.
    $.fn.addressfield.apply.call(this.address, config, enabledFields);

    ok(fired, 'should fire addressfield:after event with data object');
    expect(1);
  });

}(jQuery));
