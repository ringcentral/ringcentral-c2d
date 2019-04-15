(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("libphonenumber-js"));
	else if(typeof define === 'function' && define.amd)
		define(["libphonenumber-js"], factory);
	else if(typeof exports === 'object')
		exports["RingCentralC2DInject"] = factory(require("libphonenumber-js"));
	else
		root["RingCentralC2DInject"] = factory(root["libphonenumber"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var libphonenumber_js_1 = __webpack_require__(1);
var RC_C2D_TAGNAME = 'RC-WIDGET-C2D';
var RC_C2D_ELEM_TAGNAME = 'RC-WIDGET-C2D-MENU';
var RC_C2D_ELEM_ATTRIBUTE = 'DATA_PHONE_NUMBER';
var RC_C2D_MENU_HEIGHT = 30;
var NODE_TEYPE_EXCLUDES = ['STYLE', 'OPTION', 'SCRIPT', 'TEXT', 'TEXTAREA', RC_C2D_ELEM_TAGNAME];
function isTelLinkNode(node) {
    return node.tagName === 'A' && (node.matches('a[href^="tel:"]') || node.matches('a[href^="sms:"]'));
}
function getAllNumberNodes(rootNode) {
    var numberNodes = [];
    if (!rootNode ||
        NODE_TEYPE_EXCLUDES.indexOf(rootNode.tagName) > -1 ||
        rootNode.nodeType === Node.COMMENT_NODE) {
        return numberNodes;
    }
    if (rootNode.tagName === 'INPUT' && rootNode.type === 'text' && rootNode.value) {
        if (rootNode.value.replace(/[^\d]/g, '').length > 1) {
            numberNodes.push(rootNode);
        }
        return numberNodes;
    }
    if (rootNode.nodeType === Node.TEXT_NODE) {
        if (rootNode.data && rootNode.data.replace(/[^\d]/g, '').length > 1) {
            numberNodes.push(rootNode);
        }
        return numberNodes;
    }
    if (isTelLinkNode(rootNode)) {
        numberNodes.push(rootNode);
        return numberNodes;
    }
    var node = rootNode.firstChild;
    while (!!node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.data && node.data.replace(/[^\d]/g, '').length > 1) {
                numberNodes.push(node);
            }
        }
        else if (isTelLinkNode(node)) {
            numberNodes.push(node);
        }
        else {
            numberNodes = numberNodes.concat(getAllNumberNodes(node));
        }
        node = node.nextSibling;
    }
    return numberNodes;
}
var ClickToDialInject = /** @class */ (function () {
    function ClickToDialInject(_a) {
        var onSmsClick = _a.onSmsClick, onCallClick = _a.onCallClick, _b = _a.countryCode, countryCode = _b === void 0 ? 'US' : _b, _c = _a.bubbleInIframe, bubbleInIframe = _c === void 0 ? true : _c, _d = _a.enabled, enabled = _d === void 0 ? true : _d;
        var _this = this;
        this._onC2DNumberMouseEnter = function (e) {
            if (e.rcHandled || !_this._enabled) {
                return;
            }
            e.rcHandled = true;
            _this._c2dNumberHover = true;
            if (e.currentTarget.tagName === 'A') {
                var telLink = e.currentTarget.href;
                _this._currentNumber = telLink.replace(/[^\d+*-]/g, '');
            }
            else if (e.currentTarget.tagName === 'INPUT') {
                _this._currentNumber = e.currentTarget.value.replace(/[^\d+*-]/g, '');
            }
            else {
                _this._currentNumber = e.currentTarget.getAttribute(RC_C2D_ELEM_ATTRIBUTE);
            }
            if (_this._currentNumber) {
                var rect = e.currentTarget.getBoundingClientRect();
                _this._c2dMenuEl.style.top = rect.top -
                    (RC_C2D_MENU_HEIGHT - rect.bottom + rect.top) / 2 + "px";
                _this._c2dMenuLeft = window.innerWidth - rect.right < 90;
                if (_this._c2dMenuLeft) {
                    _this._c2dMenuEl.style.left = 'inherit';
                    _this._c2dMenuEl.style.right = window.innerWidth - rect.left + "px";
                }
                else {
                    _this._c2dMenuEl.style.left = rect.right + "px";
                    _this._c2dMenuEl.style.right = 'inherit';
                }
                if (_this._c2dMenuLeft) {
                    _this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu left');
                }
                else {
                    _this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu');
                }
                _this._updateC2DMenuDisplay();
            }
        };
        this._onC2DNumberMouseLeave = function (e) {
            if (e.rcHandled || !_this._enabled) {
                return;
            }
            e.rcHandled = true;
            _this._c2dNumberHover = false;
            _this._updateC2DMenuDisplay();
        };
        this._onSmsClickFuncs = [];
        this._onCallClickFuncs = [];
        if (onSmsClick) {
            this._onSmsClickFuncs.push(onSmsClick);
        }
        if (onCallClick) {
            this._onCallClickFuncs.push(onCallClick);
        }
        this._enabled = enabled;
        this._countryCode = countryCode;
        this._bubblePhoneNumber = bubbleInIframe && window !== window.parent;
        this._elemObserver = null;
        this._c2dMenuEl = null;
        this._c2dNumberHover = false;
        this._currentNumber = null;
        if (this._enabled) {
            this.start();
        }
        if (bubbleInIframe) {
            this._initIframeBubblePhoneNumberListener();
        }
    }
    ClickToDialInject.prototype._initObserver = function () {
        var _this = this;
        this._elemObserver = new MutationObserver(function (mutations) {
            var addedNumberNodes = [];
            var removedNodes = [];
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    addedNumberNodes = addedNumberNodes.concat(getAllNumberNodes(node));
                });
                mutation.removedNodes.forEach(function (node) {
                    removedNodes = removedNodes.concat(getAllNumberNodes(node));
                });
            });
            _this._handlePhoneNumberNodes(addedNumberNodes);
            _this._removeC2Dhandler(removedNodes);
        });
        this._elemObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
        this._C2DMenuObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (!mutation.removedNodes || mutation.removedNodes.length === 0) {
                    return;
                }
                mutation.removedNodes.forEach(function (node) {
                    if (_this._c2dMenuEl && node === _this._c2dMenuEl && !_this._c2dMenuEl.parentElement) {
                        document.body.appendChild(_this._c2dMenuEl);
                    }
                });
            });
        });
        this._C2DMenuObserver.observe(document.body, { childList: true });
        var numberNodes = getAllNumberNodes(document.body);
        this._handlePhoneNumberNodes(numberNodes);
    };
    ClickToDialInject.prototype._stopObserver = function () {
        if (this._elemObserver) {
            this._elemObserver.disconnect();
            this._elemObserver = null;
        }
        if (this._C2DMenuObserver) {
            this._C2DMenuObserver.disconnect();
            this._C2DMenuObserver = null;
        }
    };
    ClickToDialInject.prototype._handlePhoneNumberNodes = function (nodes) {
        var _this = this;
        nodes.forEach(function (node) {
            if (node.tagName === 'INPUT') {
                var numbers = libphonenumber_js_1.findNumbers(node.value, { defaultCountry: _this._countryCode, v2: true });
                if (numbers.length > 0) {
                    _this._createHoverEventListener(node);
                }
                return;
            }
            var parentNode = node.parentNode;
            if (parentNode && parentNode.tagName === RC_C2D_TAGNAME) {
                _this._createHoverEventListener(parentNode);
                return;
            }
            if (isTelLinkNode(node)) {
                _this._createHoverEventListener(node);
                return;
            }
            if (!node.data) {
                return;
            }
            var results = libphonenumber_js_1.findNumbers(node.data, { defaultCountry: _this._countryCode, v2: true });
            if (results.length === 0) {
                return;
            }
            var result = results[0];
            var originPhoneNumber = node.data.slice(result.startsAt, result.endsAt);
            var newTextNode = node.splitText(result.startsAt);
            newTextNode.data = newTextNode.data.substr(result.endsAt - result.startsAt);
            var el = document.createElement(RC_C2D_TAGNAME);
            el.textContent = originPhoneNumber;
            el.setAttribute(RC_C2D_ELEM_ATTRIBUTE, result['number'].number);
            parentNode.insertBefore(el, node.nextSibling);
            _this._createHoverEventListener(el);
            _this._handlePhoneNumberNodes([newTextNode]); // next handle loop
        });
    };
    ClickToDialInject.prototype._removeC2Dhandler = function (nodes) {
        var _this = this;
        nodes.forEach(function (node) {
            var parentNode = node.parentNode;
            if (parentNode && parentNode.tagName === RC_C2D_TAGNAME) {
                _this._cleanHoverEventListener(parentNode);
            }
            if (isTelLinkNode(node)) {
                _this._cleanHoverEventListener(node);
            }
        });
    };
    ClickToDialInject.prototype._cleanHoverEventListener = function (node) {
        node.removeEventListener('mouseenter', this._onC2DNumberMouseEnter);
        node.removeEventListener('mouseleave', this._onC2DNumberMouseLeave);
        if (node.tagName === 'INPUT') {
            node.removeEventListener('keydown', this._onC2DNumberMouseLeave);
        }
    };
    ClickToDialInject.prototype._createHoverEventListener = function (node) {
        this._cleanHoverEventListener(node);
        node.addEventListener('mouseenter', this._onC2DNumberMouseEnter);
        node.addEventListener('mouseleave', this._onC2DNumberMouseLeave);
        if (node.tagName === 'INPUT') {
            node.addEventListener('keydown', this._onC2DNumberMouseLeave);
        }
    };
    ClickToDialInject.prototype._injectC2DMenu = function () {
        var _this = this;
        if (this._c2dMenuEl) {
            return;
        }
        this._c2dMenuEl = document.createElement(RC_C2D_ELEM_TAGNAME);
        this._c2dMenuEl.innerHTML = "\n      <div class=\"rc-widget-c2d-menu-wrapper\">\n        <div class=\"rc-widget-c2d-logo\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + RC_C2D_MENU_HEIGHT + "\" height=\"" + RC_C2D_MENU_HEIGHT + "\" viewBox=\"0 0 16 16\">\n            <g fill=\"none\" fill-rule=\"evenodd\">\n              <rect width=\"16\" height=\"16\" fill=\"#F80\" rx=\"3.75\"/>\n              <path fill=\"#FFF\" d=\"M5.846 2h4.308c1.337 0 1.822.14 2.311.4.49.262.873.646 1.134 1.135.262.489.401.974.401 2.31v7.976c0 .062-.006.085-.019.108a.127.127 0 0 1-.052.052c-.023.013-.046.019-.108.019H5.846c-1.337 0-1.822-.14-2.311-.4A2.726 2.726 0 0 1 2.4 12.464c-.262-.489-.401-.974-.401-2.31v-4.31c0-1.336.14-1.821.4-2.31A2.726 2.726 0 0 1 3.536 2.4C4.024 2.139 4.509 2 5.845 2z\"/>\n              <path fill=\"#0684BD\" d=\"M5.078 3.813h5.84c.7 0 1.266.566 1.266 1.265v2.953c0 .925-.874 1.505-1.511 1.692.285.54.733 1.356 1.343 2.449H9.953L8.592 9.815h-.088a.28.28 0 0 1-.28-.28V7.883h1.898V5.873H5.881v3.604c0 .6.118 1.64 1.025 2.695H4.843c-.758-.555-1.03-1.689-1.03-2.357V5.078c0-.699.566-1.266 1.265-1.266z\"/>\n            </g>\n          </svg>\n        </div>\n        <div class=\"rc-widget-action-icon rc-widget-c2d-icon\" title=\"Call with RingCentral\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 26\">\n            <path fill=\"#0083BF\" fill-rule=\"evenodd\" stroke=\"#0684BD\" stroke-width=\".9\" d=\"M6.656 17.651C.942 10.547.28 4.627 2.545 2.607c.592-.522 2.16-1.323 2.892-1.427.801-.14 1.602.243 2.02 1.01.802 1.636 1.777 3.238 2.788 4.805.452.697.348 1.567-.244 2.16-.349.348-.767.557-1.15.765a3.18 3.18 0 0 0-.801.523s-.105.104-.105.313c-.035.453.035 1.707 2.02 4.214 2.16 2.647 3.45 2.82 3.798 2.82.14 0 .244-.034.244-.034.244-.21.453-.453.662-.697.314-.348.593-.696 1.01-.975.697-.452 1.638-.348 2.16.21 1.325 1.323 2.753 2.576 4.112 3.76.662.557.906 1.428.557 2.16-.244.66-1.359 2.02-2.02 2.541-.558.488-1.324.697-2.195.697-3.345 0-7.7-2.925-11.637-7.8z\"/>\n          </svg>\n        </div>\n        <div class=\"rc-widget-c2d-separator-line\"></div>\n        <div class=\"rc-widget-action-icon rc-widget-c2sms-icon\" title=\"SMS with RingCentral\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 22 21\">\n            <path fill=\"#0684BD\" fill-rule=\"nonzero\" d=\"M10.944.014C4.91.014.007 4.068.007 9.316c0 2.86 1.54 5.626 4.085 7.417-.094.534-.377 1.257-1.162 2.64l-.692 1.131h1.383a6.976 6.976 0 0 0 4.84-1.917c.817.157 1.634.252 2.483.252 6.034 0 10.936-4.275 10.936-9.523 0-5.28-4.902-9.302-10.936-9.302z\"/>\n          </svg>\n        </div>\n      </div>\n      <div class=\"rc-widget-c2d-arrow\">\n        <div class=\"rc-widget-c2d-inner-arrow\"></div>\n      </div>\n    ";
        this._c2dMenuEl.setAttribute('class', 'rc-widget-c2d-menu');
        this._c2dMenuEl.addEventListener('mouseenter', function () {
            return _this._onC2DMenuMouseEnter();
        });
        this._c2dMenuEl.addEventListener('mouseleave', function () {
            return _this._onC2DMenuMouseLeave();
        });
        this._callBtn = this._c2dMenuEl.querySelector('.rc-widget-c2d-icon');
        this._callBtn.addEventListener('click', function () { return _this._onCallClick(); });
        this._smsBtn = this._c2dMenuEl.querySelector('.rc-widget-c2sms-icon');
        this._smsBtn.addEventListener('click', function () { return _this._onSmsClick(); });
        document.body.appendChild(this._c2dMenuEl);
    };
    ClickToDialInject.prototype._cleanC2DMenu = function () {
        if (this._c2dMenuEl) {
            this._callBtn = null;
            this._smsBtn = null;
            this._c2dMenuEl.remove();
            this._c2dMenuEl = null;
        }
    };
    ClickToDialInject.prototype._onC2DMenuMouseEnter = function () {
        this._c2dMenuHover = true;
        this._updateC2DMenuDisplay();
    };
    ClickToDialInject.prototype._onC2DMenuMouseLeave = function () {
        this._c2dMenuHover = false;
        this._updateC2DMenuDisplay();
    };
    ClickToDialInject.prototype._updateC2DMenuDisplay = function () {
        if (this._c2dMenuHover || this._c2dNumberHover) {
            this._c2dMenuEl.style.display = 'block';
            return;
        }
        this._c2dMenuEl.style.display = 'none';
    };
    ClickToDialInject.prototype._onCallClick = function () {
        var _this = this;
        if (this._bubblePhoneNumber) {
            this._postPhoneNumberToTop(this._currentNumber, 'Call');
            return;
        }
        this._onCallClickFuncs.forEach(function (func) {
            func(_this._currentNumber);
        });
    };
    ClickToDialInject.prototype._onSmsClick = function () {
        var _this = this;
        if (this._bubblePhoneNumber) {
            this._postPhoneNumberToTop(this._currentNumber, 'SMS');
            return;
        }
        this._onSmsClickFuncs.forEach(function (func) {
            func(_this._currentNumber);
        });
    };
    ClickToDialInject.prototype.onCallClick = function (func) {
        this._onCallClickFuncs.push(func);
    };
    ClickToDialInject.prototype.onSmsClick = function (func) {
        this._onSmsClickFuncs.push(func);
    };
    ClickToDialInject.prototype._initIframeBubblePhoneNumberListener = function () {
        var _this = this;
        window.addEventListener('message', function (event) {
            var message = event.data;
            if (message.type !== 'rc-c2d-phone-number-bubble') {
                return;
            }
            _this._currentNumber = message.phoneNumber;
            if (message.eventType === 'Call') {
                _this._onCallClick();
                return;
            }
            if (message.eventType === 'SMS') {
                _this._onSmsClick();
            }
        });
    };
    ClickToDialInject.prototype._postPhoneNumberToTop = function (phoneNumber, type) {
        window.top.postMessage({
            type: 'rc-c2d-phone-number-bubble',
            eventType: type,
            phoneNumber: phoneNumber,
        }, '*');
    };
    ClickToDialInject.prototype.dispose = function () {
        this._enabled = false;
        this._stopObserver();
        this._cleanC2DMenu();
    };
    ClickToDialInject.prototype.start = function () {
        this._enabled = true;
        this._initObserver();
        this._injectC2DMenu();
    };
    return ClickToDialInject;
}());
exports.default = ClickToDialInject;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__1__;

/***/ })
/******/ ])["default"];
});