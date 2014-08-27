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
