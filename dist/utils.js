/**
 * Uitls 1.0
 * 
 * @author ysk
 * @create 2015-12-17
 * @update 2015-12-18
 */

(function() {

    var root = this;
    var utils = {};

    utils.VERSION = '1.0';


    // Array
    // --------------------

    // 判断是否为数组
    utils.isArray =  Array.isArray || function(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    
    //转化为数组
    utils.toArray = function(value) {

        if(!value) return [];

        if(utils.isArray(value)) return value;

        try {
            return Array.prototype.slice.call(value);
        } catch (e) {
            var arr = [];
            for (var i = 0,len = value.length; i < len; i++) {
                arr.push(s[i]);
            }
            return arr;
        }
    };

    //判断某个元素在数组里,并返回该元素的key值
    utils.inArray = function(value,arr) {
        var status = -1;

        for (var i=0, len=arr.length; i<len; i++) {
            if(arr[i] == value) {
                status = i;
            }
        }
        return status;
    }

    //判断是否为js对象
    utils.isPlainObject = function (value) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    },
    
    // 清除字符串两边的空格
    utils.trim = function(str) {
        return (!String.prototype.trim) ? str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "") : str.trim();
    };

    //验证
    utils.check = {
        regExps: {
            "require"   : /\S+/,    // 不为空
            "email"     : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,      // 邮箱
            "url"       : /^http(s?):\/\/(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/,   // 链接地址
            "currency"  : /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/,   // 货币
            "number"    : /^\d+$/,                              // 数字
            "zip"       : /^\d{6}$/,                            // 邮编
            "integer"   : /^(0|-?[1-9][0-9]*)$/,                // 整数
            "pinteger"  : /^(0|[1-9][0-9]*)$/,                  // 正整数
            "double"    : /^-?(0|[1-9][0-9]*)\.[0-9]+$/,        // 浮点数
            "pdouble"   : /^(0|[1-9][0-9]*)\.[0-9]+$/,          // 正浮点数
            "english"   : /^[A-Za-z]+$/,                        // 英文字母
            "chinese"   : /^[\u4e00-\u9fa5]+$/                  // 汉字
        },
        empty: function(str) {
            return !this.regExps['require'].test(str);
        },
        email: function(str) {
            return this.regExps['email'].test(str);
        },
        url: function(url) {
            return this.regExps['url'].test(url);
        },
        currency: function(str) {
            return this.regExps['currency'].test(str);
        },
        number: function(str) {
            return this.regExps['number'].test(str);
        },
        zip: function(str) {
            return this.regExps['zip'].test(str);
        },
        en: function(str) {
            return this.regExps['english'].test(str);
        },
        cn: function(str) {
            return this.regExps['chinese'].test(str);
        }
    };











    if (typeof define === 'function' && define.amd) {
        define('utils', [], function() {
          return utils;
        });
    } else if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
          exports = module.exports = utils;
        }
        exports.utils = utils;
    } else {
        root.utils = utils;
    }

}.call(this));