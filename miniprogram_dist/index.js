module.exports =
/******/ (function(modules) { // webpackBootstrap
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


/* eslint-disable no-console */
Component({
  data: {
    height: 0, // 卡片高度
    showChunk: true // 控制是否显示当前的chunk内容
  },
  properties: {
    _chunkPrefix: {
      type: String,
      value: Math.random().toString(36).slice(-8)
    },
    chunkId: {
      type: String,
      value: ''
    },
    chunkObserveHeight: {
      type: Number,
      value: 2000
    },
    showLogInfo: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    detached: function detached() {
      try {
        if (this._chunkIntersectionObserver) this._chunkIntersectionObserver.disconnect();
      } catch (error) {
        console.log(error);
      }
      this._chunkIntersectionObserver = null;
    },
    ready: function ready() {
      var _this = this;

      if (!this.checkCanIUserObserver()) {
        return;
      }
      if (!this.checkCanIUserNextTick()) {
        setTimeout(function () {
          _this.startObserverChunk();
        }, 20);
      } else {
        wx.nextTick(function () {
          _this.startObserverChunk();
        });
      }
    }
  },
  methods: {
    startObserverChunk: function startObserverChunk() {
      var _this2 = this;

      var chunkId = this.data._chunkPrefix + this.data.chunkId;
      try {
        this._chunkIntersectionObserver = this.createIntersectionObserver();
        this._chunkIntersectionObserver.relativeToViewport({
          top: this.data.chunkObserveHeight,
          bottom: this.data.chunkObserveHeight
        }).observe('#' + chunkId, function (res) {
          var intersectionRatio = res.intersectionRatio;
          // 超出预定范围

          if (intersectionRatio === 0) {
            if (_this2.data.showLogInfo) console.log('【卸载】', chunkId, '超过预定范围，从页面卸载');
            _this2.setData({
              showChunk: false
            });
            // 进入预定范围
          } else {
            if (_this2.data.showLogInfo) console.log('【进入】', chunkId, '达到预定范围，渲染进页面');
            _this2.setData({
              showChunk: true,
              height: res.boundingClientRect.height
            });
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    checkCanIUserObserver: function checkCanIUserObserver() {
      var result = wx.canIUse('createIntersectionObserver');
      if (this.data.showLogInfo) {
        if (result) {
          console.log('支持 InteractionObserver API，组件开启监听，开启虚拟长列表模式');
        } else {
          console.warn('不支持 InteractionObserver API，组件不会进行监听，回归普通长列表');
        }
      }
      return result;
    },
    checkCanIUserNextTick: function checkCanIUserNextTick() {
      var result = wx.canIUse('nextTick');
      if (this.data.showLogInfo) {
        if (result) {
          console.log('支持 nextTick API');
        } else {
          console.warn('不支持 nextTick API，使用setTimeout模拟');
        }
      }
      return result;
    }
  }

});

/***/ })
/******/ ]);