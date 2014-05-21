/**
 * Primary address field implementation.
 */
(function ($) {
  var configuredFields = [
      'thoroughfare',
      'localityname',
      'administrativearea',
      'postalcode'
    ];

  // On country change...
  $('#country').change(function landingPageCountryChange() {
    // Trigger the addressfield plugin with the country's data.
    $('#address-example fieldset').addressfield(_countryConfig[this.value], configuredFields);
  });

  // On document load, apply the configuration.
  $(document).ready(function landingPageOnReady() {
    $('#address-example fieldset').addressfield(_countryConfig[$('#country').val()], configuredFields);
  });
})(jQuery);


/**
 * Smooth scroller...
 */
(function ($) {
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 500);
        return false;
      }
    }
  });
})(jQuery);


/**
 * Things that should really be improved in the plugin...
 */
(function ($) {
  $.fn.addressfield.updateLabel = function (label) {
    if ($('label[for="' + $(this).attr('name') + '"]').length) {
      $('label[for="' + $(this).attr('name') + '"]').text(label);
    }
  };
  $.fn.addressfield.hideField = function() {
    $(this).val('');
    $(this).closest('.form-group').hide();
  };
  $.fn.addressfield.showField = function() {
    $(this).closest('.form-group').show();
  };
  $.fn.addressfield.orderFields = function(order) {
    var length = order.length,
      i = 0,
      $element;

    // Iterate through the fields to be ordered.
    for (i; i < length; ++i) {
      if (i in order) {
        // Save off the element container over its class selector in order.
        $element = $(this).find('.' + order[i]).closest('.form-group');
        order[i] = {
          'element': $element.clone(),
          'class': order[i],
          'value': $(this).find('.' + order[i]).val()
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
        $element.find('.' + order[i].class).val(order[i].value).change();
      }
    }
  };
})(jQuery);
