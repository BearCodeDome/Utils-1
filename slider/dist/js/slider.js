/**
 * Slider 1.0
 * 
 * @author ysk
 * @create 2015-12-10
 * @update 2015-12-17
 */

(function() {
    'use strict';
    /*===========================
    Slider
    ===========================*/
    var Slider = function(container, params) {
        if (!(this instanceof Slider)) return new Slider(container, params);

        if (!container) return;

        var defaults = {
            startSlide: 0,
            auto: 0,
            speed: 300,
            continuous: true,
            pagination: true,
            button: true,
            stopPropagation: true,
            callback: function(index, element) {},
            transitionEnd: function(index, element) {}
        }

        params = params || {};

        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            } else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    params[def][deepDef] = defaults[def][deepDef];
                }
            }
        }

        var s = this;
        s.params = params;
        s.params.startSlide = parseInt(s.params.startSlide,10);
        s.container = container;
        s.wrapper = container.children[0];

        //分页器
        if (s.params.pagination) {
            s.pagination = document.createElement('div');
            s.pagination.setAttribute('class','slider-pagination');
            s.container.appendChild(s.pagination);
            var pageCache = 0;
            for (var i = 0, len = s.wrapper.children.length; i < len; i++) {
                var spanChild = document.createElement('span');
                if (s.params.startSlide == i) {
                    spanChild.setAttribute('class','active');
                    pageCache = s.params.startSlide;
                }
                s.pagination.appendChild(spanChild);
            }
        }

        // 按钮
        if (s.params.button) {
            s.nextBtn = document.createElement('div');
            s.nextBtn.setAttribute('class','slider-button-next');
            s.container.appendChild(s.nextBtn);

            s.prevBtn = document.createElement('div');
            s.prevBtn.setAttribute('class','slider-button-prev');
            s.container.appendChild(s.prevBtn);
        }

        var offloadFn = function(fn) { setTimeout(fn || function() {}, 0); };

        s.setup = function() {
            //存储slides
            s.slides = s.wrapper.children;

            var index = s.currentIndex = s.params.startSlide;

            if (s.slides.length < 2) s.params.continuous = false;

            //只有两个或者小于两个的slide的特殊情况
            if (s.browser.transitions && s.params.continuous && s.slides.length < 3) {
                s.prevLen = s.slides.length;
                s.wrapper.appendChild(s.slides[0].cloneNode(true));
                s.wrapper.appendChild(s.slides[1].cloneNode(true));
                s.slides = s.wrapper.children;
            }

            //存储每个slide的当前位置
            s.slidesPros = new Array(s.slides.length);

            //获取每个slide的宽度
            s.width = s.container.getBoundingClientRect().width || s.container.offsetWidth;
            
            //设置wrapper的宽度
            s.wrapper.style.width = (s.slides.length * s.width) + 'px';

            //开始堆栈
            var pos = s.slides.length;
            while (pos--) {
                var slide = s.slides[pos];

                slide.style.width = s.width + 'px';
                slide.setAttribute('data-index',pos);

                if (s.browser.transitions) {
                    slide.style.left = (pos * -s.width) + 'px';
                    move(pos, index > pos ? -s.width : (index < pos ? s.width : 0), 0);
                }
            }

            //对当前显示的slide的左右slide进行定位
            if (s.browser.transitions && s.params.continuous) {
                move(circle(index-1), -s.width, 0);
                move(circle(index+1), s.width, 0);
            }

            if (!s.browser.transitions) s.wrapper.style.left = (index * -s.width) + 'px';

            s.container.style.visibility = 'visible';
        };

        s.prev = function() {
            s.stop();
            if (s.params.continuous) s.slide(s.currentIndex-1);
            else if (s.currentIndex) s.slide(s.currentIndex-1);
        };

        s.next = function() {
            s.stop();
            if (s.params.continuous) s.slide(s.currentIndex+1); 
            else if (s.currentIndex < s.slides.length -1) s.slide(s.currentIndex+1);
        }

        s.slide = function(to,slideSpeed) {

            if (s.currentIndex == to) return;

            if (s.browser.transitions) {
                
                var direction = Math.abs(s.currentIndex-to) / (s.currentIndex-to); // 1:backword  -1:forward

                if (s.params.continuous) {

                    var natural_direction = direction;
                    direction = -s.slidesPros[circle(to)] / s.width;

                    if (direction !== natural_direction) to = -direction * s.slides.length + to;
                }

                var diff = Math.abs(s.currentIndex - to) - 1;
                while (diff--) move(circle((to > s.currentIndex ? to : s.currentIndex) - diff - 1), s.width * direction, 0);

                to = circle(to);

                move(s.currentIndex, s.width * direction, slideSpeed || s.params.speed);
                move(to, 0, slideSpeed || s.params.speed);

                if (s.params.continuous) move(circle(to - direction), -(s.width * direction), 0);

            } else {
                to = circle(to);
                animate(s.currentIndex * -s.width, to * -s.width, slideSpeed || s.params.speed);

                if(s.params.auto) s.begin();
            }

            s.currentIndex = to;

            if (s.params.pagination) {
                if (s.prevLen < 3) {
                    if (to%2 == 0) {
                        s.pagination.children[0].setAttribute('class','active');
                        s.pagination.children[1].removeAttribute('class');
                    } else {
                        s.pagination.children[1].setAttribute('class','active');
                        s.pagination.children[0].removeAttribute('class');
                    }
                } else {
                    s.pagination.children[to].setAttribute('class','active');
                    s.pagination.children[pageCache].removeAttribute('class');
                }
                
                pageCache = to;
            }
            offloadFn(s.params.callback && s.params.callback(s.currentIndex, s.slides[s.currentIndex]));
        };

        var move = function(index, dist, speed) {
            translate(index, dist, speed);
            s.slidesPros[index] = dist;
        };

        //获取当前显示的左右的下标
        var circle = function(index) {
            return (s.slides.length + (index % s.slides.length)) % s.slides.length;
        };

        var translate = function(index, dist, speed) {
            
            var slide = s.slides[index];
            var style = slide && slide.style;

            if(!style) return;

            style.webkitTransitionDuration = 
            style.mozTransitionDuration = 
            style.msTransitionDuration = 
            style.oTransitionDuration = 
            style.transitionDuration = speed + 'ms';

            style.webkitTransform = 'translate(' + dist + 'px, 0)' + 'translateZ(0)';
            style.msTransform = 
            style.MozTransform = 
            style.OTransform = 'translateX(' + dist + 'px)';
        };

        var animate = function(from, to, speed) {

            if (!speed) {
                s.wrapper.style.left = to + 'px';
                return;
            }

            var start = +new Date;

            var timer = setInterval(function() {

                var timeElap = +new Date - start;

                if(timeElap > speed) {

                    s.wrapper.style.left = to + 'px';

                    if(s.params.auto) s.begin();

                    s.params.transitionEnd && s.params.transitionEnd.call(event, s.currentIndex, s.slides[s.currentIndex]);

                    clearInterval(timer);
                    return;
                }

                s.wrapper.style.left = (( (to -from) * (Math.floor((timeElap / speed) * 100) / 100)) + from) + 'px';

            },4);
        };

        var interval;
        s.begin = function() {
            interval = setTimeout(s.next, s.params.auto);
        };

        s.stop = function() {
            clearTimeout(interval);
        }


        // setup initial vars
        var start = {};
        var delta = {};
        var isScrolling;

        var events = {
            handleEvent: function(event) {

                switch (event.type) {
                    case 'touchstart': this.start(event); break;
                    case 'touchmove': this.move(event); break;
                    case 'touchend': offloadFn(this.end(event)); break;
                    case 'webkitTransitionEnd':
                    case 'msTransitionEnd':
                    case 'oTransitionEnd':
                    case 'otransitionend':
                    case 'transitionend': offloadFn(this.transitionEnd(event)); break;
                    case 'resize': offloadFn(s.setup); break;
                }

                if (s.params.stopPropagation) event.stopPropagation();

            },
            start: function(event) {

                var touches = event.touches[0];

                // measure start values
                start = {

                    // get initial touch coords
                    x: touches.pageX,
                    y: touches.pageY,

                    // store time to determine touch duration
                    time: +new Date

                };

                // used for testing first move event
                isScrolling = undefined;

                // reset delta and end measurements
                delta = {};

                // attach touchmove and touchend listeners
                s.wrapper.addEventListener('touchmove', this, false);
                s.wrapper.addEventListener('touchend', this, false);

            },
            move: function(event) {

                // ensure swiping with one touch and not pinching
                if ( event.touches.length > 1 || event.scale && event.scale !== 1) return

                event.preventDefault();

                var touches = event.touches[0];

                // measure change in x and y
                delta = {
                    x: touches.pageX - start.x,
                    y: touches.pageY - start.y
                }

                // determine if scrolling test has run - one time test
                if ( typeof isScrolling == 'undefined') {
                    isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
                }

              // if user is not trying to scroll vertically
              if (!isScrolling) {

                // prevent native scrolling
                event.preventDefault();

                // stop slideshow
                s.stop();

                // increase resistance if first or last slide
                if (s.params.continuous) { // we don't add resistance at the end

                  translate(circle(s.currentIndex-1), delta.x + s.slidesPros[circle(s.currentIndex-1)], 0);
                  translate(s.currentIndex, delta.x + s.slidesPros[s.currentIndex], 0);
                  translate(circle(s.currentIndex+1), delta.x + s.slidesPros[circle(s.currentIndex+1)], 0);

                } else {

                  delta.x =
                    delta.x /
                      ( (!s.currentIndex && delta.x > 0               // if first slide and sliding left
                        || s.currentIndex == s.slides.length - 1        // or if last slide and sliding right
                        && delta.x < 0                       // and if sliding at all
                      ) ?
                      ( Math.abs(delta.x) / width + 1 )      // determine resistance level
                      : 1 );                                 // no resistance if false

                  // translate 1:1
                  translate(s.currentIndex-1, delta.x + s.slidesPros[s.currentIndex-1], 0);
                  translate(s.currentIndex, delta.x + s.slidesPros[s.currentIndex], 0);
                  translate(s.currentIndex+1, delta.x + s.slidesPros[s.currentIndex+1], 0);
                }

              }

            },
            end: function(event) {

                // measure duration
                var duration = +new Date - start.time;
                var width = s.width;

                // determine if slide attempt triggers next/prev slide
                var isValidSlide =
                    Number(duration) < 250               // if slide duration is less than 250ms
                    && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
                    || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

                // determine if slide attempt is past start and end
                var isPastBounds =
                    !s.currentIndex && delta.x > 0                            // if first slide and slide amt is greater than 0
                    || s.currentIndex == s.slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

                if (s.params.continuous) isPastBounds = false;

                // determine direction of swipe (true:right, false:left)
                var direction = delta.x < 0;

                // if not scrolling vertically
                if (!isScrolling) {

                    if (isValidSlide && !isPastBounds) {

                        if (direction) {

                            if (s.params.continuous) { // we need to get the next in this direction in place

                              move(circle(s.currentIndex-1), -width, 0);
                              move(circle(s.currentIndex+2), width, 0);

                            } else {
                              move(s.currentIndex-1, -width, 0);
                            }

                            move(s.currentIndex, s.slidesPros[s.currentIndex]-width, s.params.speed);
                            move(circle(s.currentIndex+1), s.slidesPros[circle(s.currentIndex+1)]-width, s.params.speed);
                            s.currentIndex = circle(s.currentIndex+1);

                        } else {
                            if (s.params.continuous) { // we need to get the next in this direction in place

                              move(circle(s.currentIndex+1), width, 0);
                              move(circle(s.currentIndex-2), -width, 0);

                            } else {
                              move(s.currentIndex+1, width, 0);
                            }

                            move(s.currentIndex, s.slidesPros[s.currentIndex]+width, s.params.speed);
                            move(circle(s.currentIndex-1), s.slidesPros[circle(s.currentIndex-1)]+width, s.params.speed);
                            s.currentIndex = circle(s.currentIndex-1);

                        }

                        s.params.callback && s.params.callback(s.currentIndex, s.slides[s.currentIndex]);

                    } else {

                        if (s.params.continuous) {

                            move(circle(s.currentIndex-1), -width, s.params.speed);
                            move(s.currentIndex, 0, s.params.speed);
                            move(circle(s.currentIndex+1), width, s.params.speed);

                        } else {

                            move(s.currentIndex-1, -width, s.params.speed);
                            move(s.currentIndex, 0, s.params.speed);
                            move(s.currentIndex+1, width, s.params.speed);
                        }

                    }

                }

                if (s.params.pagination) {
                    if (s.prevLen < 3) {
                        if (s.currentIndex%2 == 0) {
                            s.pagination.children[0].setAttribute('class','active');
                            s.pagination.children[1].removeAttribute('class');
                        } else {
                            s.pagination.children[1].setAttribute('class','active');
                            s.pagination.children[0].removeAttribute('class');
                        }
                    } else {
                        s.pagination.children[s.currentIndex].setAttribute('class','active');
                        s.pagination.children[pageCache].removeAttribute('class');
                    }
                    pageCache = s.currentIndex;
                }

                // kill touchmove and touchend event listeners until touchstart called again
                s.wrapper.removeEventListener('touchmove', events, false)
                s.wrapper.removeEventListener('touchend', events, false)

            },
            transitionEnd: function(event) {

                if (parseInt(event.target.getAttribute('data-index'), 10) == s.currentIndex) {

                    if (s.params.auto) s.begin();

                    s.params.transitionEnd && s.params.transitionEnd.call(event, s.currentIndex, s.slides[s.currentIndex]);

                }

            }
        };

        s.init = function () {
            s.setup();

            if (s.params.auto) s.begin();

            if (s.browser.addEventListener) {

                if (s.browser.touch) s.wrapper.addEventListener('touchstart', events, false); 

                if (s.browser.transitions) {
                    s.wrapper.addEventListener('webkitTransitionEnd', events, false);
                    s.wrapper.addEventListener('msTransitionEnd', events, false);
                    s.wrapper.addEventListener('oTransitionEnd', events, false);
                    s.wrapper.addEventListener('otransitionend', events, false);
                    s.wrapper.addEventListener('transitionend', events, false);
                }
                window.addEventListener('resize', events, false);
                if (s.params.button) {
                    s.nextBtn.addEventListener('click',function() {
                        s.next();
                    }, false);
                    s.prevBtn.addEventListener('click',function() {
                        s.prev();
                    }, false);
                }
            } else {
                window.onresize = function () { s.setup() };
                if (s.params.button) {
                    s.nextBtn.onClick = function() {
                        s.next();
                    };
                    s.prevBtn.onClick = function() {
                        s.prev();
                    };
                }
            }
        };

        s.init();
    }

    Slider.prototype = {
        browser: {
            addEventListener: !!window.addEventListener,
            touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
            transitions: (function(temp) {
                var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
                for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
                return false;
            })(document.createElement('slider'))
        },
    }

    if ( window.jQuery || window.Zepto ) {
        (function($) {
            $.fn.slider = function(params) {
              return this.each(function() {
                $(this).data('Slider', new Slider($(this)[0], params));
              });
            }
        })( window.jQuery || window.Zepto )
    }

    window.Slider = Slider;

})();

/*===========================
Slider AMD Export
===========================*/
if (typeof(module) !== 'undefined')
{
    module.exports = window.Slider;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return window.Slider;
    });
}