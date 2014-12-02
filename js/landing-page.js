/**
 * Primary address field implementation.
 */
(function ($) {
  // On document ready, instantiate the plugin.
  $(document).ready(function landingPageOnReady() {
    // Initialize jquery.validate (optional).
    $('#address-example').validate({});

    // Initialize jquery.addressfield.
    $('#address-example fieldset').addressfield({
      json: 'js/jquery.addressfield/addressfield.min.json',
      fields: {
        country: '#country',
        thoroughfare: '#address1',
        premise: '#address2',
        localityname: '#city',
        administrativearea: '#state',
        postalcode: '#zip'
      }
    });
  });
})(jQuery);

/**
 * Makes jQuery.validate compatible with Bootstrap.
 * @see http://stackoverflow.com/a/18754780
 */
(function ($) {
  $.validator.setDefaults({
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
      if(element.parent('.input-group').length) {
        error.insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    }
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
