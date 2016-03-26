/*!
* potatoScroller v1.0
* 
* 2016-3-26
*/

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    return define(['jquery'], function($) {
      return factory($, window, document);
    });
  } else if (typeof exports === 'object') {
    return module.exports = factory(require('jquery'), window, document);
  } else {
    return factory(jQuery, window, document);
  }
})(function($, window, document) {
	"use strict";

	var defaults = {

		/**
	      滚动条面板的class
	      @property panelClass
	      @type String
	      @default 'scrollbar-panel'
	     */
	    panelClass: 'scrollbar-panel',

	    /**
	      滚动条的class
	      @property sliderClass
	      @type String
	      @default 'scrollbar-slider'
	     */
	    sliderClass: 'scrollbar-slider',

	    /**
	      页面内容的class
	      @property contentClass
	      @type String
	      @default 'scrollbar-content'
	     */
	    contentClass: 'scrollbar-content',

	    /**
	      判断是否可以自定义滚动条,如果是，就添加enabledClass
	      @property enabledClass
	      @type String
	      @default 'has-scrollbar'
	     */
	    enabledClass: 'has-scrollbar',

	    /**
	      active模块的class
	      @property activeClass
	      @type String
	      @default 'active'
	     */
	    activeClass: 'active',

	    /**
	      是否总是显示滚动条的设置
	      @property alwaysVisible
	      @type Boolean
	      @default false
	     */
	    alwaysVisible: false,

	    /**
	      滚动条的最小宽度设置
	      @property sliderMinHeight
	      @type Number
	      @default 20
	     */
	    sliderMinHeight: 20,

	    /**
	      滚动条的最大宽度设置
	      @property sliderMaxHeight
	      @type Number
	      @default null
	     */
	    sliderMaxHeight: null,

	    /**
	      document的指针
	      @property documentContext
	      @type Document
	      @default null
	     */
	    documentContext: null,

	    /**
	      window的指针
	      @property windowContext
	      @type Window
	      @default null
	     */
	    windowContext: null
	};

	/**
	    @property BROWSER_IS_IE7
	    @type Boolean
	    @static
	    @final
	    @private
	   */
	var BROWSER_IS_IE7 = window.navigator.appName === 'Microsoft Internet Explorer' && /msie 7./i.test(window.navigator.appVersion) && window.ActiveXObject;

	/**
	  浏览器默认滚动条的宽度
	  @type Number
	  @static
	  @default null
	  @private
	*/
	var BROWSER_SCROLLBAR_WIDTH = null;

	/**
	  返回浏览器默认滚动条的宽度
	  @method getBrowserScrollbarWidth
	  @return {Number} the scrollbar width in pixels
	  @static
	  @private
	*/
	var getBrowserScrollbarWidth = function() {
		var outer, outerStyle, scrollbarWidth;
		outer = document.createElement('div');
		outerStyle = outer.style;
		outerStyle.position = 'absolute';
		outerStyle.top = '-9999px';
		outerStyle.width = '100px';
		outerStyle.height = '100px';
		outerStyle.overflow = 'scroll';
		document.body.appendChild(outer);
		scrollbarWidth = outer.offsetWidth - outer.clientWidth;
		document.body.removeChild(outer);
		return scrollbarWidth;
	};

	/**
	  逐帧动画定时
	  @static
	  @private
	*/
	var rAF = window.requestAnimationFrame;
	var cAF = window.cancelAnimationFrame;
	var _elementStyle = document.createElement('div').style;
	var _vendor = (function() {
		var i, vendor, vendors, transform, _i, _len;
		vendors = ['t', 'webkitT', 'MozT', 'OT', 'msT'];
		for (i = _i = 0, _len = vendors.length; _i < _len; i = ++_i) {
			vendor = vendors[i];
			transform = vendors[i] + 'ransform';
			if (transform in _elementStyle) {
				return vendors[i].substr(0, vendors[i].length-1);
			}
		}
		return false;
	})();
	var _prefixStyle = function(style) {
		if (_vendor === false) return;

		if (_vendor === '') return style;

		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	};
	var transform = _prefixStyle('transform');
	var hasTranform = transform !== false;

	/**
	    @class PotatoScroll
	    @param element {HTMLElement|Node} the main element
	    @param options {Object} nanoScroller's options
	    @constructor
	   */

	var PotatoScroll = (function() {
		var PotatoScroll = function(element,options) {
			this.el = element;
			this.options = options;
			this.$el = $(this.el);
			BROWSER_SCROLLBAR_WIDTH || (BROWSER_SCROLLBAR_WIDTH = getBrowserScrollbarWidth());
			this.doc = $(this.options.document || document);
			this.win = $(this.options.document || window);
			this.body = this.doc.find('body');
			this.$content = this.$el.children('.' + this.options.contentClass);
			this.content = this.$content[0];

			this.previousPosition = 0;

			this.renderBar();

			this.createEvents();

			this.addEvents();

			this.reset();
		};

		PotatoScroll.prototype = {
			/**
		      渲染滚动条HTML元素
		      @method renderBar
		      @chainable
		      @private
		     */
		    renderBar: function() {
		    	var _this = this,
		    		options = _this.options,
		    		panelClass = options.panelClass,
		    		sliderClass = options.sliderClass,
		    		contentClass = options.contentClass,
		    		$panel, $slider;

		    	if (!($panel = _this.$el.children('.' + panelClass)).length && !$panel.children('.' + sliderClass).length) {
		    		_this.$el.append('<div class="' + panelClass + '"><div class="' + sliderClass + '"></div></div>');
		    	}

		    	_this.$panel = _this.$el.children('.' + panelClass);
		    	_this.$slider = _this.$panel.children('.' + sliderClass);

		    	if (BROWSER_SCROLLBAR_WIDTH) {
		    		_this.$content.css('right',-BROWSER_SCROLLBAR_WIDTH);
		    		_this.$el.addClass(options.enabledClass);
		    	}

		    	return _this;
		    },

		    /**
		      更新滚动条当前的位置
		      @method updateScrollValues
		      @private
		     */
		    updateScrollValues: function() {
		    	var content, direction;
		    	content = this.content;
		    	this.maxScrollTop = content.scrollHeight - content.clientHeight;
		    	this.prevScrollTop = this.contentScrollTop || 0;
		    	this.contentScrollTop = content.scrollTop;
		    	direction = this.contentScrollTop > this.previousPosition ? 'down' : this.contentScrollTop < this.previousPosition ? 'up' : 'same';
		    	this.previousPosition = this.contentScrollTop;

		    	this.maxSliderTop = this.panelHeight - this.sliderHeight;
		    	this.sliderTop = this.maxScrollTop === 0 ? 0 : this.contentScrollTop * this.maxSliderTop / this.maxScrollTop;
		    },

		    /**
		      更新滚动的样式
		      @method setOnScrollStyles
		      @private
		     */
		    setOnScrollStyles: function() {
		    	var cssValue;
		    	if (transform) {
		    		cssValue = {};
		    		cssValue[transform] = 'translate(0, ' + this.sliderTop + 'px)';
		    	} else {
		    		cssValue = {
		    			top: this.sliderTop
		    		};
		    	}

		    	if (rAF) {
		    		if (cAF && this.scrollRAF) {
		    			cAF(this.scrollRAF);
		    		}
		    		this.scrollRAF = rAF((function(_this) {
		    			return function() {
		    				_this.scrollRAF = null;
		    				_this.$slider.css(cssValue);
		    			}
		    		})(this));
		    	} else {
		    		this.$slider.css(cssValue);
		    	}
		    },

		    /**
		      @method scroll
		      @private
		      @example
		          $(".nano").nanoScroller({ scroll: 'top' });
		     */

		    scroll: function() {
				if (!this.isActive) return;

				this.sliderY = Math.max(0, this.sliderY);
				this.sliderY = Math.min(this.maxSliderTop, this.sliderY);
				this.$content.scrollTop(this.maxScrollTop * this.sliderY / this.maxSliderTop);
				this.updateScrollValues();
				this.setOnScrollStyles();
				return this;
		    },

		    /**
		      生成绑定事件
		      @method createEvents
		      @private
		     */
		    createEvents: function() {
		    	this.events = {
		    		scroll: (function(_this) {
		    			return function(e) {
		    				_this.updateScrollValues();

		    				if (_this.isBeingDragged) return;

		    				_this.sliderY = _this.sliderTop;
		    				_this.setOnScrollStyles();

		    				if (e==null) return;
		    			};
		    		})(this),
		    		resize: (function(_this) {
		    			return function() {
		    				_this.reset();
		    			};
		    		})(this),
		    		down: (function(_this) {
		    			return function(e) {
		    				_this.isBeingDragged = true;
		    				_this.offsetY = e.pageY - _this.$slider.offset().top; // 鼠标在滚动条上的位置
		    				if (!_this.$slider.is(e.target)) {
		    					_this.offsetY = 0;
		    				}
		    				_this.$panel.addClass(_this.options.activeClass);
		    				_this.doc.on('mousemove',_this.events['drag']).on('mouseup',_this.events['up']);
		    				_this.body.on('mouseenter',_this.events['enter']);
		    				return false;
		    			};
		    		})(this),
		    		drag: (function(_this) {
		    			return function(e) {
		    				_this.sliderY = e.pageY - _this.$el.offset().top - _this.panelTop - (_this.offsetY || _this.sliderHeight/2);
		    				_this.scroll();
		    				return false;
		    			};
		    		})(this),
		    		up: (function(_this) {
		    			return function(e) {
		    				_this.isBeingDragged = false;
		    				_this.$panel.removeClass(_this.options.activeClass);
		    				_this.doc.off('mousemove',_this.events['drag']);
		    				_this.body.off('mouseenter',_this.events['enter']);
		    				return false;
		    			};
		    		})(this),
		    		enter: (function(_this) {
		    			return function(e) {
		    				var _ref;
		    				if (!_this.isBeingDragged) return;

		    				if ((e.buttons || e.which) !== 1) {
				              return (_ref = _this.events)['up'].apply(_ref, arguments);
				            }
		    			};
		    		})(this),
		    		panedown: (function(_this) {
		    			return function(e) {
		    				_this.sliderY = (e.offsetY || e.originalEvent.layerY) - (_this.sliderHeight * 0.5);
				            _this.scroll();
				            _this.events.down(e);
				            return false;
		    			};
		    		})(this),
		    		wheel: (function(_this) {
		    			return function(e) {
		    				var delta;
				            if (e == null) {
				              return;
				            }
				            delta = e.delta || e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail || (e.originalEvent && -e.originalEvent.detail);
				            if (delta) {
				              _this.sliderY += -delta / 3;
				            }
				            _this.scroll();
				            return false;
		    			};
		    		})(this)
		    	};
		    },

		    /**
		      取消绑定事件
		      @method removeEvents
		      @private
		     */
		    removeEvents: function() {
		    	var events = this.events;
		    	this.win.off('resize',events['resize']);
		    	this.$slider.off();
		    	this.$panel.off();
		    	this.$content.off('scroll mousewheel DOMMouseScroll touchmove', events['scroll']);
		    },

		    /**
		      添加事件绑定
		      @method addEvents
		      @private
		     */
		    addEvents: function() {
		    	this.removeEvents();
		    	var events = this.events;

		    	this.win.on('resize',events['resize']);

		    	this.$slider.on('mousedown',events['down']);
		    	this.$panel.on('mousedown', events['panedown']).bind('mousewheel DOMMouseScroll', events['wheel']);

		    	this.$content.on('scroll mousewheel DOMMouseScroll touchmove', events['scroll']);
		    },


		    /**
			  停止所有的事件，隐藏滚动条
			  @method stop
			  @chainable
			  @example
			      $(".potato-scrollbar").potatoScroller({ stop: true });
			 */

			stop: function() {
				if (cAF && this.scrollRAF) {
					cAF(this.scrollRAF);
					this.scrollRAF = null;
				}
				this.stopped = true;
				this.removeEvents();
				this.$panel.hide();
				return this;
			},

			/**
		      @method restore
		      @private
		     */

		    restore: function() {
		      this.stopped = false;
		      this.$panel.show();
		      this.addEvents();
		    },

		    /**
		      Resets  scrollbar.
		      @method reset
		      @chainable
		      @example
		          $(".potato-scrollbar").potatoScroller();
		     */
		    reset: function() {
		    	var _this = this,
		    		content = this.content,
		    		contentStyle = content.style,
		    		contentStyleOverflowY = contentStyle.overflowY;

		    	if (!this.$el.find('.' + this.options.panelClass).length) {
		    		this.renderBar().stop();
		    	}

		    	if (this.stopped) {
		    		this.restore();
		    	}

		    	if (BROWSER_IS_IE7) {
		    		_this.$content.css({
		    			'height': _this.$content.height(),
		    			paddingRight: BROWSER_SCROLLBAR_WIDTH
		    		});
		    	}

		    	var contentHeight = content.scrollHeight + BROWSER_SCROLLBAR_WIDTH;

		    	var parentMaxHeight = parseInt(_this.$el.css('max-height'),10);
		    	if (parentMaxHeight>0) {
		    		_this.$el.height('');
		    		_this.$el.height(content.scrollHeight > parentMaxHeight ? parentMaxHeight : content.scrollHeight);
		    	}

		    	var panelHeight = _this.$panel.outerHeight(false);
		    	var panelTop = parseInt(_this.$panel.css('top'),10);
		    	var panelBottom = parseInt(_this.$panel.css('bottom'),10);
		    	var panelOuterHeight = panelHeight + panelBottom + panelTop;

		    	var sliderHeight = Math.round(panelOuterHeight * panelHeight / contentHeight);
		    	if (sliderHeight < _this.options.sliderMinHeight) {
		    		sliderHeight = _this.options.sliderMinHeight;
		    	} else if ((_this.options.sliderMaxHeight != null) && sliderHeight > _this.options.sliderMaxHeight) {
		    		sliderHeight = _this.options.sliderMaxHeight;
		    	}
		    	if (contentStyleOverflowY == 'scroll' && contentStyle.overflowX != 'scroll') {
		    		sliderHeight += BROWSER_SCROLLBAR_WIDTH;
		    	}

		    	_this.maxSliderTop = panelOuterHeight - panelHeight;
		    	_this.contentHeight = contentHeight;
		    	_this.panelHeight = panelHeight;
		    	_this.panelOuterHeight = panelOuterHeight;
		    	_this.sliderHeight = sliderHeight;
		    	_this.panelTop = panelTop;
		    	_this.$slider.height(sliderHeight);

		    	_this.events.scroll();

		    	_this.$panel.show();
		    	_this.isActive = true;
		    	if ((content.scrollHeight == content.clientHeight) || (_this.$panel.outerHeight(true) >= content.scrollHeight && contentStyleOverflowY != 'scroll')) {
		    		_this.$panel.hide();
		    		_this.isActive = false;
		    	} else if (_this.$el.clientHeight == content.clientHeight && contentStyleOverflowY == 'scroll') {
		    		_this.$panel.hide();
		    	} else {
		    		_this.$panel.show();
		    	}
		    	_this.$panel.css({
		    		opacity: (_this.options.alwaysVisible ? 1 : ''),
		    		visibility: (_this.options.alwaysVisible ? 'visible' : '')
		    	});

		    	var contentPosition = _this.$content.css('position');
		    	if (contentPosition == 'static' && contentPosition == 'relative') {
		    		right = parseInt(_this.$content.css('right'),10);
		    		if (right) {
		    			_this.$content.css({
		    				right: '',
		    				marginRight: right
		    			});
		    		}
		    	}

		    	return this;
		    }


		}

		return PotatoScroll;
	})();

	$.fn.potatoScroller = function(settings) {
		return this.each(function() {
			var options, scrollbar;

			if (!(scrollbar = this.potatoScroll)) {
				options = $.extend({},defaults,settings);
				this.potatoScroller = scrollbar = new PotatoScroll(this,options);
			}

			if (settings && typeof settings === 'object') {
				$.extend(scrollbar.options, settings);
				if (settings.stop) {
		          return scrollbar.stop();
		        }
		        if (settings.destroy) {
		          return scrollbar.destroy();
		        }
			}

			return scrollbar.reset();
		});
	};

	$.fn.potatoScroller.Constructor = PotatoScroll;
});






