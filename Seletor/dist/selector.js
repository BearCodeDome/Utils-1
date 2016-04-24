/**
 * Selector 1.0
 * 
 * @author ysk
 * @create 2015-12-10
 * @update 2015-12-17
 */

(function() {
    'use strict';
    /*===========================
    Selector
    ===========================*/
    var Selector = function(container, params) {
        
    }



    if ( window.jQuery || window.Zepto ) {
        (function($) {
            $.fn.selector = function(params) {
              return this.each(function() {
                $(this).data('Selector', new Selector($(this)[0], params));
              });
            }
        })( window.jQuery || window.Zepto )
    }

    window.Selector = Selector;

})();

/*===========================
Slider AMD Export
===========================*/
if (typeof(module) !== 'undefined')
{
    module.exports = window.Selector;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return window.Selector;
    });
}