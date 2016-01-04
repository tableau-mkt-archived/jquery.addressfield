/**
 * Polyfill for .detach(), jQuery < 1.4
 *
 * The .detach() method is the same as .remove(), except that .detach() keeps
 * all jQuery data associated with the removed elements. This method is useful
 * when removed elements are to be reinserted into the DOM at a later time.
 */
(function ($) {
  if (!$.fn.detach) {
    $.fn.detach = function (selector) {
      for (var i = 0, elem; (elem = this[i]) != null; i++) {
        if (!selector || jQuery.filter(selector, [elem]).length) {
          if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
          }
        }
      }

      return this;
    };
  }
}(jQuery));
