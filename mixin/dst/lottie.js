(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["mixin"] = factory();
	else
		root["mixin"] = factory();
})(this, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const lottie = __webpack_require__(1);

const Mixin = __webpack_require__(5);

const {
  isWebWorker
} = __webpack_require__(6);

class LottieMixin extends Mixin {
  async init(conf) {
    await super.init(conf); // set class

    lottie.setCanvas(this.klassHolder); // load json

    const animationData = await this.getRemoteData(conf.src);
    let {
      w,
      h,
      nm,
      fr,
      ip,
      op
    } = animationData; // resize canvas

    this.resize(w, h);
    this.name = nm;
    this.frames = op - ip;
    this.length = this.frames / fr;
    this.ani = lottie.loadAnimation({
      container: this.canvas,
      animationData
    }, true); // isLoadNow = true

    return {
      width: w,
      height: h,
      duration: this.length
    };
  }

  render(time, delta) {
    // console.log({time, delta});
    this.ani.goToAndStop(time * 1000, false); // isFrame = false
  }

}

if (isWebWorker) new LottieMixin().start();
module.exports = LottieMixin;

/***/ }),
/* 1 */
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return factory(root);
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(__webpack_require__.g || {}, function (global) {
  'use strict';

  var svgNS = 'http://www.w3.org/2000/svg';
  var locationHref = '';
  var initialDefaultFrame = -999999;
  var Logger = {
    num: 10,
    index: 0,
    setNum: function (num) {
      this.num = num;
      return this;
    },
    log: function (...rest) {
      if (this.index < this.num) {
        this.index++;
        console.log('++++++++++++++++++++++++++++++++++++++++++++');
        console.log.apply(console, rest);
        console.log('\n');
      }

      return this;
    },
    json: function (data) {
      if (typeof data !== 'object') {
        this.log(data);
      } else {
        this.log(JSON.stringify(data, null, 4));
      }

      return this;
    }
  };
  var subframeEnabled = true;
  var expressionsPlugin;
  var isSafari = false;
  var cachedColors = {};
  var bm_rounder = Math.round;
  var bm_rnd;
  var bm_pow = Math.pow;
  var bm_sqrt = Math.sqrt;
  var bm_abs = Math.abs;
  var bm_floor = Math.floor;
  var bm_max = Math.max;
  var bm_min = Math.min;
  var blitter = 10;
  var BMMath = {};

  (function () {
    var propertyNames = ["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "cbrt", "expm1", "clz32", "cos", "cosh", "exp", "floor", "fround", "hypot", "imul", "log", "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"];
    var i,
        len = propertyNames.length;

    for (i = 0; i < len; i += 1) {
      BMMath[propertyNames[i]] = Math[propertyNames[i]];
    }
  })();

  function ProjectInterface() {
    return {};
  }

  BMMath.random = Math.random;

  BMMath.abs = function (val) {
    var tOfVal = typeof val;

    if (tOfVal === 'object' && val.length) {
      var absArr = createSizedArray(val.length);
      var i,
          len = val.length;

      for (i = 0; i < len; i += 1) {
        absArr[i] = Math.abs(val[i]);
      }

      return absArr;
    }

    return Math.abs(val);
  };

  var defaultCurveSegments = 150;
  var degToRads = Math.PI / 180;
  var roundCorner = 0.5519;

  function roundValues(flag) {
    if (flag) {
      bm_rnd = Math.round;
    } else {
      bm_rnd = function (val) {
        return val;
      };
    }
  }

  roundValues(false);

  function styleDiv(element) {
    element.style.position = 'absolute';
    element.style.top = 0;
    element.style.left = 0;
    element.style.display = 'block';
    element.style.transformOrigin = element.style.webkitTransformOrigin = '0 0';
    element.style.backfaceVisibility = element.style.webkitBackfaceVisibility = 'visible';
    element.style.transformStyle = element.style.webkitTransformStyle = element.style.mozTransformStyle = "preserve-3d";
  }

  function BMEnterFrameEvent(type, currentTime, totalTime, frameMultiplier) {
    this.type = type;
    this.currentTime = currentTime;
    this.totalTime = totalTime;
    this.direction = frameMultiplier < 0 ? -1 : 1;
  }

  function BMCompleteEvent(type, frameMultiplier) {
    this.type = type;
    this.direction = frameMultiplier < 0 ? -1 : 1;
  }

  function BMCompleteLoopEvent(type, totalLoops, currentLoop, frameMultiplier) {
    this.type = type;
    this.currentLoop = currentLoop;
    this.totalLoops = totalLoops;
    this.direction = frameMultiplier < 0 ? -1 : 1;
  }

  function BMSegmentStartEvent(type, firstFrame, totalFrames) {
    this.type = type;
    this.firstFrame = firstFrame;
    this.totalFrames = totalFrames;
  }

  function BMDestroyEvent(type, target) {
    this.type = type;
    this.target = target;
  }

  function BMRenderFrameErrorEvent(nativeError, currentTime) {
    this.type = 'renderFrameError';
    this.nativeError = nativeError;
    this.currentTime = currentTime;
  }

  function BMConfigErrorEvent(nativeError) {
    this.type = 'configError';
    this.nativeError = nativeError;
  }

  function BMAnimationConfigErrorEvent(type, nativeError) {
    this.type = type;
    this.nativeError = nativeError;
    this.currentTime = currentTime;
  }

  var createElementID = function () {
    var _count = 0;
    return function createID() {
      return '__lottie_element_' + ++_count;
    };
  }();

  function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;

      case 1:
        r = q;
        g = v;
        b = p;
        break;

      case 2:
        r = p;
        g = v;
        b = t;
        break;

      case 3:
        r = p;
        g = q;
        b = v;
        break;

      case 4:
        r = t;
        g = p;
        b = v;
        break;

      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }

    return [r, g, b];
  }

  function RGBtoHSV(r, g, b) {
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        d = max - min,
        h,
        s = max === 0 ? 0 : d / max,
        v = max / 255;

    switch (max) {
      case min:
        h = 0;
        break;

      case r:
        h = g - b + d * (g < b ? 6 : 0);
        h /= 6 * d;
        break;

      case g:
        h = b - r + d * 2;
        h /= 6 * d;
        break;

      case b:
        h = r - g + d * 4;
        h /= 6 * d;
        break;
    }

    return [h, s, v];
  }

  function addSaturationToRGB(color, offset) {
    var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
    hsv[1] += offset;

    if (hsv[1] > 1) {
      hsv[1] = 1;
    } else if (hsv[1] <= 0) {
      hsv[1] = 0;
    }

    return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
  }

  function addBrightnessToRGB(color, offset) {
    var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
    hsv[2] += offset;

    if (hsv[2] > 1) {
      hsv[2] = 1;
    } else if (hsv[2] < 0) {
      hsv[2] = 0;
    }

    return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
  }

  function addHueToRGB(color, offset) {
    var hsv = RGBtoHSV(color[0] * 255, color[1] * 255, color[2] * 255);
    hsv[0] += offset / 360;

    if (hsv[0] > 1) {
      hsv[0] -= 1;
    } else if (hsv[0] < 0) {
      hsv[0] += 1;
    }

    return HSVtoRGB(hsv[0], hsv[1], hsv[2]);
  }

  var rgbToHex = function () {
    var colorMap = [];
    var i;
    var hex;

    for (i = 0; i < 256; i += 1) {
      hex = i.toString(16);
      colorMap[i] = hex.length == 1 ? '0' + hex : hex;
    }

    return function (r, g, b) {
      if (r < 0) {
        r = 0;
      }

      if (g < 0) {
        g = 0;
      }

      if (b < 0) {
        b = 0;
      }

      return '#' + colorMap[r] + colorMap[g] + colorMap[b];
    };
  }();

  function BaseEvent() {}

  BaseEvent.prototype = {
    triggerEvent: function (eventName, args) {
      if (this._cbs[eventName]) {
        var len = this._cbs[eventName].length;

        for (var i = 0; i < len; i++) {
          this._cbs[eventName][i](args);
        }
      }
    },
    addEventListener: function (eventName, callback) {
      if (!this._cbs[eventName]) {
        this._cbs[eventName] = [];
      }

      this._cbs[eventName].push(callback);

      return function () {
        this.removeEventListener(eventName, callback);
      }.bind(this);
    },
    removeEventListener: function (eventName, callback) {
      if (!callback) {
        this._cbs[eventName] = null;
      } else if (this._cbs[eventName]) {
        var i = 0,
            len = this._cbs[eventName].length;

        while (i < len) {
          if (this._cbs[eventName][i] === callback) {
            this._cbs[eventName].splice(i, 1);

            i -= 1;
            len -= 1;
          }

          i += 1;
        }

        if (!this._cbs[eventName].length) {
          this._cbs[eventName] = null;
        }
      }
    }
  };

  var createTypedArray = function () {
    function createRegularArray(type, len) {
      var i = 0,
          arr = [],
          value;

      switch (type) {
        case 'int16':
        case 'uint8c':
          value = 1;
          break;

        default:
          value = 1.1;
          break;
      }

      for (i = 0; i < len; i += 1) {
        arr.push(value);
      }

      return arr;
    }

    function createTypedArray(type, len) {
      if (type === 'float32') {
        return new Float32Array(len);
      } else if (type === 'int16') {
        return new Int16Array(len);
      } else if (type === 'uint8c') {
        return new Uint8ClampedArray(len);
      }
    }

    if (typeof Uint8ClampedArray === 'function' && typeof Float32Array === 'function') {
      return createTypedArray;
    } else {
      return createRegularArray;
    }
  }();

  function createSizedArray(len) {
    return Array.apply(null, {
      length: len
    });
  }

  function createTag(type) {
    switch (type) {
      case "img":
      case "image":
        return new lottiejs.canvas.Image();

      default:
        return new lottiejs.canvas.Canvas(1, 1);
    }
  }

  function DynamicPropertyContainer() {}

  ;
  DynamicPropertyContainer.prototype = {
    addDynamicProperty: function (prop) {
      if (this.dynamicProperties.indexOf(prop) === -1) {
        this.dynamicProperties.push(prop);
        this.container.addDynamicProperty(this);
        this._isAnimated = true;
      }
    },
    iterateDynamicProperties: function () {
      this._mdf = false;
      var i,
          len = this.dynamicProperties.length;

      for (i = 0; i < len; i += 1) {
        this.dynamicProperties[i].getValue();

        if (this.dynamicProperties[i]._mdf) {
          this._mdf = true;
        }
      }
    },
    initDynamicPropertyContainer: function (container) {
      this.container = container;
      this.dynamicProperties = [];
      this._mdf = false;
      this._isAnimated = false;
    }
  };

  var getBlendMode = function () {
    var blendModeEnums = {
      0: 'source-over',
      1: 'multiply',
      2: 'screen',
      3: 'overlay',
      4: 'darken',
      5: 'lighten',
      6: 'color-dodge',
      7: 'color-burn',
      8: 'hard-light',
      9: 'soft-light',
      10: 'difference',
      11: 'exclusion',
      12: 'hue',
      13: 'saturation',
      14: 'color',
      15: 'luminosity'
    };
    return function (mode) {
      return blendModeEnums[mode] || '';
    };
  }();
  /*!
   Transformation Matrix v2.0
   (c) Epistemex 2014-2015
   www.epistemex.com
   By Ken Fyrstenberg
   Contributions by leeoniya.
   License: MIT, header required.
   */

  /**
   * 2D transformation matrix object initialized with identity matrix.
   *
   * The matrix can synchronize a canvas context by supplying the context
   * as an argument, or later apply current absolute transform to an
   * existing context.
   *
   * All values are handled as floating point values.
   *
   * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
   * @prop {number} a - scale x
   * @prop {number} b - shear y
   * @prop {number} c - shear x
   * @prop {number} d - scale y
   * @prop {number} e - translate x
   * @prop {number} f - translate y
   * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
   * @constructor
   */


  var Matrix = function () {
    var _cos = Math.cos;
    var _sin = Math.sin;
    var _tan = Math.tan;
    var _rnd = Math.round;

    function reset() {
      this.props[0] = 1;
      this.props[1] = 0;
      this.props[2] = 0;
      this.props[3] = 0;
      this.props[4] = 0;
      this.props[5] = 1;
      this.props[6] = 0;
      this.props[7] = 0;
      this.props[8] = 0;
      this.props[9] = 0;
      this.props[10] = 1;
      this.props[11] = 0;
      this.props[12] = 0;
      this.props[13] = 0;
      this.props[14] = 0;
      this.props[15] = 1;
      return this;
    }

    function rotate(angle) {
      if (angle === 0) {
        return this;
      }

      var mCos = _cos(angle);

      var mSin = _sin(angle);

      return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }

    function rotateX(angle) {
      if (angle === 0) {
        return this;
      }

      var mCos = _cos(angle);

      var mSin = _sin(angle);

      return this._t(1, 0, 0, 0, 0, mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1);
    }

    function rotateY(angle) {
      if (angle === 0) {
        return this;
      }

      var mCos = _cos(angle);

      var mSin = _sin(angle);

      return this._t(mCos, 0, mSin, 0, 0, 1, 0, 0, -mSin, 0, mCos, 0, 0, 0, 0, 1);
    }

    function rotateZ(angle) {
      if (angle === 0) {
        return this;
      }

      var mCos = _cos(angle);

      var mSin = _sin(angle);

      return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }

    function shear(sx, sy) {
      return this._t(1, sy, sx, 1, 0, 0);
    }

    function skew(ax, ay) {
      return this.shear(_tan(ax), _tan(ay));
    }

    function skewFromAxis(ax, angle) {
      var mCos = _cos(angle);

      var mSin = _sin(angle);

      return this._t(mCos, mSin, 0, 0, -mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, _tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); //return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, _tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
    }

    function scale(sx, sy, sz) {
      if (!sz && sz !== 0) {
        sz = 1;
      }

      if (sx === 1 && sy === 1 && sz === 1) {
        return this;
      }

      return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
    }

    function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
      this.props[0] = a;
      this.props[1] = b;
      this.props[2] = c;
      this.props[3] = d;
      this.props[4] = e;
      this.props[5] = f;
      this.props[6] = g;
      this.props[7] = h;
      this.props[8] = i;
      this.props[9] = j;
      this.props[10] = k;
      this.props[11] = l;
      this.props[12] = m;
      this.props[13] = n;
      this.props[14] = o;
      this.props[15] = p;
      return this;
    }

    function translate(tx, ty, tz) {
      tz = tz || 0;

      if (tx !== 0 || ty !== 0 || tz !== 0) {
        return this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1);
      }

      return this;
    }

    function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {
      var _p = this.props;

      if (a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0) {
        //NOTE: commenting this condition because TurboFan deoptimizes code when present
        //if(m2 !== 0 || n2 !== 0 || o2 !== 0){
        _p[12] = _p[12] * a2 + _p[15] * m2;
        _p[13] = _p[13] * f2 + _p[15] * n2;
        _p[14] = _p[14] * k2 + _p[15] * o2;
        _p[15] = _p[15] * p2; //}

        this._identityCalculated = false;
        return this;
      }

      var a1 = _p[0];
      var b1 = _p[1];
      var c1 = _p[2];
      var d1 = _p[3];
      var e1 = _p[4];
      var f1 = _p[5];
      var g1 = _p[6];
      var h1 = _p[7];
      var i1 = _p[8];
      var j1 = _p[9];
      var k1 = _p[10];
      var l1 = _p[11];
      var m1 = _p[12];
      var n1 = _p[13];
      var o1 = _p[14];
      var p1 = _p[15];
      /* matrix order (canvas compatible):
       * ace
       * bdf
       * 001
       */

      _p[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
      _p[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2;
      _p[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2;
      _p[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2;
      _p[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2;
      _p[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2;
      _p[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2;
      _p[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2;
      _p[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2;
      _p[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2;
      _p[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2;
      _p[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2;
      _p[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2;
      _p[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2;
      _p[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2;
      _p[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2;
      this._identityCalculated = false;
      return this;
    }

    function isIdentity() {
      if (!this._identityCalculated) {
        this._identity = !(this.props[0] !== 1 || this.props[1] !== 0 || this.props[2] !== 0 || this.props[3] !== 0 || this.props[4] !== 0 || this.props[5] !== 1 || this.props[6] !== 0 || this.props[7] !== 0 || this.props[8] !== 0 || this.props[9] !== 0 || this.props[10] !== 1 || this.props[11] !== 0 || this.props[12] !== 0 || this.props[13] !== 0 || this.props[14] !== 0 || this.props[15] !== 1);
        this._identityCalculated = true;
      }

      return this._identity;
    }

    function equals(matr) {
      var i = 0;

      while (i < 16) {
        if (matr.props[i] !== this.props[i]) {
          return false;
        }

        i += 1;
      }

      return true;
    }

    function clone(matr) {
      var i;

      for (i = 0; i < 16; i += 1) {
        matr.props[i] = this.props[i];
      }
    }

    function cloneFromProps(props) {
      var i;

      for (i = 0; i < 16; i += 1) {
        this.props[i] = props[i];
      }
    }

    function applyToPoint(x, y, z) {
      return {
        x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
        y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
        z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]
      };
      /*return {
       x: x * me.a + y * me.c + me.e,
       y: x * me.b + y * me.d + me.f
       };*/
    }

    function applyToX(x, y, z) {
      return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
    }

    function applyToY(x, y, z) {
      return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
    }

    function applyToZ(x, y, z) {
      return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
    }

    function inversePoint(pt) {
      var determinant = this.props[0] * this.props[5] - this.props[1] * this.props[4];
      var a = this.props[5] / determinant;
      var b = -this.props[1] / determinant;
      var c = -this.props[4] / determinant;
      var d = this.props[0] / determinant;
      var e = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / determinant;
      var f = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / determinant;
      return [pt[0] * a + pt[1] * c + e, pt[0] * b + pt[1] * d + f, 0];
    }

    function inversePoints(pts) {
      var i,
          len = pts.length,
          retPts = [];

      for (i = 0; i < len; i += 1) {
        retPts[i] = inversePoint(pts[i]);
      }

      return retPts;
    }

    function applyToTriplePoints(pt1, pt2, pt3) {
      var arr = createTypedArray('float32', 6);

      if (this.isIdentity()) {
        arr[0] = pt1[0];
        arr[1] = pt1[1];
        arr[2] = pt2[0];
        arr[3] = pt2[1];
        arr[4] = pt3[0];
        arr[5] = pt3[1];
      } else {
        var p0 = this.props[0],
            p1 = this.props[1],
            p4 = this.props[4],
            p5 = this.props[5],
            p12 = this.props[12],
            p13 = this.props[13];
        arr[0] = pt1[0] * p0 + pt1[1] * p4 + p12;
        arr[1] = pt1[0] * p1 + pt1[1] * p5 + p13;
        arr[2] = pt2[0] * p0 + pt2[1] * p4 + p12;
        arr[3] = pt2[0] * p1 + pt2[1] * p5 + p13;
        arr[4] = pt3[0] * p0 + pt3[1] * p4 + p12;
        arr[5] = pt3[0] * p1 + pt3[1] * p5 + p13;
      }

      return arr;
    }

    function applyToPointArray(x, y, z) {
      var arr;

      if (this.isIdentity()) {
        arr = [x, y, z];
      } else {
        arr = [x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12], x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13], x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]];
      }

      return arr;
    }

    function applyToPointStringified(x, y) {
      if (this.isIdentity()) {
        return x + ',' + y;
      }

      var _p = this.props;
      return Math.round((x * _p[0] + y * _p[4] + _p[12]) * 100) / 100 + ',' + Math.round((x * _p[1] + y * _p[5] + _p[13]) * 100) / 100;
    }

    function toCSS() {
      //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.

      /*if(this.isIdentity()) {
          return '';
      }*/
      var i = 0;
      var props = this.props;
      var cssValue = 'matrix3d(';
      var v = 10000;

      while (i < 16) {
        cssValue += _rnd(props[i] * v) / v;
        cssValue += i === 15 ? ')' : ',';
        i += 1;
      }

      return cssValue;
    }

    function roundMatrixProperty(val) {
      var v = 10000;

      if (val < 0.000001 && val > 0 || val > -0.000001 && val < 0) {
        return _rnd(val * v) / v;
      }

      return val;
    }

    function to2dCSS() {
      //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.

      /*if(this.isIdentity()) {
          return '';
      }*/
      var props = this.props;

      var _a = roundMatrixProperty(props[0]);

      var _b = roundMatrixProperty(props[1]);

      var _c = roundMatrixProperty(props[4]);

      var _d = roundMatrixProperty(props[5]);

      var _e = roundMatrixProperty(props[12]);

      var _f = roundMatrixProperty(props[13]);

      return "matrix(" + _a + ',' + _b + ',' + _c + ',' + _d + ',' + _e + ',' + _f + ")";
    }

    return function () {
      this.reset = reset;
      this.rotate = rotate;
      this.rotateX = rotateX;
      this.rotateY = rotateY;
      this.rotateZ = rotateZ;
      this.skew = skew;
      this.skewFromAxis = skewFromAxis;
      this.shear = shear;
      this.scale = scale;
      this.setTransform = setTransform;
      this.translate = translate;
      this.transform = transform;
      this.applyToPoint = applyToPoint;
      this.applyToX = applyToX;
      this.applyToY = applyToY;
      this.applyToZ = applyToZ;
      this.applyToPointArray = applyToPointArray;
      this.applyToTriplePoints = applyToTriplePoints;
      this.applyToPointStringified = applyToPointStringified;
      this.toCSS = toCSS;
      this.to2dCSS = to2dCSS;
      this.clone = clone;
      this.cloneFromProps = cloneFromProps;
      this.equals = equals;
      this.inversePoints = inversePoints;
      this.inversePoint = inversePoint;
      this._t = this.transform;
      this.isIdentity = isIdentity;
      this._identity = true;
      this._identityCalculated = false;
      this.props = createTypedArray('float32', 16);
      this.reset();
    };
  }();
  /*
   Copyright 2014 David Bau.
  
   Permission is hereby granted, free of charge, to any person obtaining
   a copy of this software and associated documentation files (the
   "Software"), to deal in the Software without restriction, including
   without limitation the rights to use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software, and to
   permit persons to whom the Software is furnished to do so, subject to
   the following conditions:
  
   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.
  
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
   IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
   CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
   TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
   SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
   */


  (function (pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //
    var global = this,
        width = 256,
        // each RC4 output is 0 <= x < 256
    chunks = 6,
        // at least six RC4 outputs for each double
    digits = 52,
        // there are 52 significant digits in a double
    rngname = 'random',
        // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
        significance = math.pow(2, digits),
        overflow = significance * 2,
        mask = width - 1,
        nodecrypto; // node.js crypto module, initialized at the bottom.
    //
    // seedrandom()
    // This is the seedrandom function described above.
    //

    function seedrandom(seed, options, callback) {
      var key = [];
      options = options === true ? {
        entropy: true
      } : options || {}; // Flatten the seed string or build one from local entropy if needed.

      var shortseed = mixkey(flatten(options.entropy ? [seed, tostring(pool)] : seed === null ? autoseed() : seed, 3), key); // Use the seed to initialize an ARC4 generator.

      var arc4 = new ARC4(key); // This function returns a random double in [0, 1) that contains
      // randomness in every bit of the mantissa of the IEEE 754 value.

      var prng = function () {
        var n = arc4.g(chunks),
            // Start with a numerator n < 2 ^ 48
        d = startdenom,
            //   and denominator d = 2 ^ 48.
        x = 0; //   and no 'extra last byte'.

        while (n < significance) {
          // Fill up all significant digits by
          n = (n + x) * width; //   shifting numerator and

          d *= width; //   denominator and generating a

          x = arc4.g(1); //   new least-significant-byte.
        }

        while (n >= overflow) {
          // To avoid rounding up, before adding
          n /= 2; //   last byte, shift everything

          d /= 2; //   right using integer math until

          x >>>= 1; //   we have exactly the desired bits.
        }

        return (n + x) / d; // Form the number within [0, 1).
      };

      prng.int32 = function () {
        return arc4.g(4) | 0;
      };

      prng.quick = function () {
        return arc4.g(4) / 0x100000000;
      };

      prng.double = prng; // Mix the randomness into accumulated entropy.

      mixkey(tostring(arc4.S), pool); // Calling convention: what to return as a function of prng, seed, is_math.

      return (options.pass || callback || function (prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) {
            copy(state, arc4);
          } // Only provide the .state method if requested via options.state.


          prng.state = function () {
            return copy(arc4, {});
          };
        } // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.


        if (is_math_call) {
          math[rngname] = prng;
          return seed;
        } // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(prng, shortseed, 'global' in options ? options.global : this == math, options.state);
    }

    math['seed' + rngname] = seedrandom; //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //

    function ARC4(key) {
      var t,
          keylen = key.length,
          me = this,
          i = 0,
          j = me.i = me.j = 0,
          s = me.S = []; // The empty key [] is treated as [0].

      if (!keylen) {
        key = [keylen++];
      } // Set up S using the standard key scheduling algorithm.


      while (i < width) {
        s[i] = i++;
      }

      for (i = 0; i < width; i++) {
        s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
        s[j] = t;
      } // The "g" method returns the next (count) outputs as one number.


      me.g = function (count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t,
            r = 0,
            i = me.i,
            j = me.j,
            s = me.S;

        while (count--) {
          t = s[i = mask & i + 1];
          r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];
        }

        me.i = i;
        me.j = j;
        return r; // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
      };
    } //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //


    function copy(f, t) {
      t.i = f.i;
      t.j = f.j;
      t.S = f.S.slice();
      return t;
    } //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //


    function flatten(obj, depth) {
      var result = [],
          typ = typeof obj,
          prop;

      if (depth && typ == 'object') {
        for (prop in obj) {
          try {
            result.push(flatten(obj[prop], depth - 1));
          } catch (e) {}
        }
      }

      return result.length ? result : typ == 'string' ? obj : obj + '\0';
    } //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //


    function mixkey(seed, key) {
      var stringseed = seed + '',
          smear,
          j = 0;

      while (j < stringseed.length) {
        key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
      }

      return tostring(key);
    }

    function autoseed() {
      try {
        if (nodecrypto) {
          return tostring(nodecrypto.randomBytes(width));
        }

        var out = new Uint8Array(width);
        (global.crypto || global.msCrypto).getRandomValues(out);
        return tostring(out);
      } catch (e) {
        var browser = global.navigator,
            plugins = browser && browser.plugins;
        return [+new Date(), global, plugins, global.screen, tostring(pool)];
      }
    } //
    // tostring()
    // Converts an array of charcodes to a string
    //


    function tostring(a) {
      return String.fromCharCode.apply(0, a);
    } //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //


    mixkey(math.random(), pool); //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //
    // End anonymous scope, and pass initial values.
  })([], // pool: entropy pool starts empty
  BMMath // math: package containing random, pow, and seedrandom
  );

  var BezierFactory = function () {
    /**
     * BezierEasing - use bezier curve for transition easing function
     * by Gaëtan Renaudeau 2014 - 2015 – MIT License
     *
     * Credits: is based on Firefox's nsSMILKeySpline.cpp
     * Usage:
     * var spline = BezierEasing([ 0.25, 0.1, 0.25, 1.0 ])
     * spline.get(x) => returns the easing value | x must be in [0, 1] range
     *
     */
    var ob = {};
    ob.getBezierEasing = getBezierEasing;
    var beziers = {};

    function getBezierEasing(a, b, c, d, nm) {
      var str = nm || ('bez_' + a + '_' + b + '_' + c + '_' + d).replace(/\./g, 'p');

      if (beziers[str]) {
        return beziers[str];
      }

      var bezEasing = new BezierEasing([a, b, c, d]);
      beziers[str] = bezEasing;
      return bezEasing;
    } // These values are established by empiricism with tests (tradeoff: performance VS precision)


    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;
    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
    var float32ArraySupported = typeof Float32Array === 'function';

    function A(aA1, aA2) {
      return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }

    function B(aA1, aA2) {
      return 3.0 * aA2 - 6.0 * aA1;
    }

    function C(aA1) {
      return 3.0 * aA1;
    } // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.


    function calcBezier(aT, aA1, aA2) {
      return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    } // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.


    function getSlope(aT, aA1, aA2) {
      return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }

    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      var currentX,
          currentT,
          i = 0;

      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;

        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

      return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) return aGuessT;
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }

      return aGuessT;
    }
    /**
     * points is an array of [ mX1, mY1, mX2, mY2 ]
     */


    function BezierEasing(points) {
      this._p = points;
      this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
      this._precomputed = false;
      this.get = this.get.bind(this);
    }

    BezierEasing.prototype = {
      get: function (x) {
        var mX1 = this._p[0],
            mY1 = this._p[1],
            mX2 = this._p[2],
            mY2 = this._p[3];
        if (!this._precomputed) this._precompute();
        if (mX1 === mY1 && mX2 === mY2) return x; // linear
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.

        if (x === 0) return 0;
        if (x === 1) return 1;
        return calcBezier(this._getTForX(x), mY1, mY2);
      },
      // Private part
      _precompute: function () {
        var mX1 = this._p[0],
            mY1 = this._p[1],
            mX2 = this._p[2],
            mY2 = this._p[3];
        this._precomputed = true;
        if (mX1 !== mY1 || mX2 !== mY2) this._calcSampleValues();
      },
      _calcSampleValues: function () {
        var mX1 = this._p[0],
            mX2 = this._p[2];

        for (var i = 0; i < kSplineTableSize; ++i) {
          this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      },

      /**
       * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
       */
      _getTForX: function (aX) {
        var mX1 = this._p[0],
            mX2 = this._p[2],
            mSampleValues = this._mSampleValues;
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }

        --currentSample; // Interpolate to provide an initial guess for t

        var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
        var initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
      }
    };
    return ob;
  }();

  function extendPrototype(sources, destination) {
    var i,
        len = sources.length,
        sourcePrototype;

    for (i = 0; i < len; i += 1) {
      sourcePrototype = sources[i].prototype;

      for (var attr in sourcePrototype) {
        if (sourcePrototype.hasOwnProperty(attr)) destination.prototype[attr] = sourcePrototype[attr];
      }
    }
  }

  function getDescriptor(object, prop) {
    return Object.getOwnPropertyDescriptor(object, prop);
  }

  function createProxyFunction(prototype) {
    function ProxyFunction() {}

    ProxyFunction.prototype = prototype;
    return ProxyFunction;
  }

  function bezFunction() {
    var easingFunctions = [];
    var math = Math;

    function pointOnLine2D(x1, y1, x2, y2, x3, y3) {
      var det1 = x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1;
      return det1 > -0.001 && det1 < 0.001;
    }

    function pointOnLine3D(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
      if (z1 === 0 && z2 === 0 && z3 === 0) {
        return pointOnLine2D(x1, y1, x2, y2, x3, y3);
      }

      var dist1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
      var dist2 = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2) + Math.pow(z3 - z1, 2));
      var dist3 = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2) + Math.pow(z3 - z2, 2));
      var diffDist;

      if (dist1 > dist2) {
        if (dist1 > dist3) {
          diffDist = dist1 - dist2 - dist3;
        } else {
          diffDist = dist3 - dist2 - dist1;
        }
      } else if (dist3 > dist2) {
        diffDist = dist3 - dist2 - dist1;
      } else {
        diffDist = dist2 - dist1 - dist3;
      }

      return diffDist > -0.0001 && diffDist < 0.0001;
    }

    var getBezierLength = function () {
      return function (pt1, pt2, pt3, pt4) {
        var curveSegments = defaultCurveSegments;
        var k;
        var i, len;
        var ptCoord,
            perc,
            addedLength = 0;
        var ptDistance;
        var point = [],
            lastPoint = [];
        var lengthData = bezier_length_pool.newElement();
        len = pt3.length;

        for (k = 0; k < curveSegments; k += 1) {
          perc = k / (curveSegments - 1);
          ptDistance = 0;

          for (i = 0; i < len; i += 1) {
            ptCoord = bm_pow(1 - perc, 3) * pt1[i] + 3 * bm_pow(1 - perc, 2) * perc * pt3[i] + 3 * (1 - perc) * bm_pow(perc, 2) * pt4[i] + bm_pow(perc, 3) * pt2[i];
            point[i] = ptCoord;

            if (lastPoint[i] !== null) {
              ptDistance += bm_pow(point[i] - lastPoint[i], 2);
            }

            lastPoint[i] = point[i];
          }

          if (ptDistance) {
            ptDistance = bm_sqrt(ptDistance);
            addedLength += ptDistance;
          }

          lengthData.percents[k] = perc;
          lengthData.lengths[k] = addedLength;
        }

        lengthData.addedLength = addedLength;
        return lengthData;
      };
    }();

    function getSegmentsLength(shapeData) {
      var segmentsLength = segments_length_pool.newElement();
      var closed = shapeData.c;
      var pathV = shapeData.v;
      var pathO = shapeData.o;
      var pathI = shapeData.i;
      var i,
          len = shapeData._length;
      var lengths = segmentsLength.lengths;
      var totalLength = 0;

      for (i = 0; i < len - 1; i += 1) {
        lengths[i] = getBezierLength(pathV[i], pathV[i + 1], pathO[i], pathI[i + 1]);
        totalLength += lengths[i].addedLength;
      }

      if (closed && len) {
        lengths[i] = getBezierLength(pathV[i], pathV[0], pathO[i], pathI[0]);
        totalLength += lengths[i].addedLength;
      }

      segmentsLength.totalLength = totalLength;
      return segmentsLength;
    }

    function BezierData(length) {
      this.segmentLength = 0;
      this.points = new Array(length);
    }

    function PointData(partial, point) {
      this.partialLength = partial;
      this.point = point;
    }

    var buildBezierData = function () {
      var storedData = {};
      return function (pt1, pt2, pt3, pt4) {
        var bezierName = (pt1[0] + '_' + pt1[1] + '_' + pt2[0] + '_' + pt2[1] + '_' + pt3[0] + '_' + pt3[1] + '_' + pt4[0] + '_' + pt4[1]).replace(/\./g, 'p');

        if (!storedData[bezierName]) {
          var curveSegments = defaultCurveSegments;
          var k, i, len;
          var ptCoord,
              perc,
              addedLength = 0;
          var ptDistance;
          var point,
              lastPoint = null;

          if (pt1.length === 2 && (pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt1[0] + pt3[0], pt1[1] + pt3[1]) && pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt2[0] + pt4[0], pt2[1] + pt4[1])) {
            curveSegments = 2;
          }

          var bezierData = new BezierData(curveSegments);
          len = pt3.length;

          for (k = 0; k < curveSegments; k += 1) {
            point = createSizedArray(len);
            perc = k / (curveSegments - 1);
            ptDistance = 0;

            for (i = 0; i < len; i += 1) {
              ptCoord = bm_pow(1 - perc, 3) * pt1[i] + 3 * bm_pow(1 - perc, 2) * perc * (pt1[i] + pt3[i]) + 3 * (1 - perc) * bm_pow(perc, 2) * (pt2[i] + pt4[i]) + bm_pow(perc, 3) * pt2[i];
              point[i] = ptCoord;

              if (lastPoint !== null) {
                ptDistance += bm_pow(point[i] - lastPoint[i], 2);
              }
            }

            ptDistance = bm_sqrt(ptDistance);
            addedLength += ptDistance;
            bezierData.points[k] = new PointData(ptDistance, point);
            lastPoint = point;
          }

          bezierData.segmentLength = addedLength;
          storedData[bezierName] = bezierData;
        }

        return storedData[bezierName];
      };
    }();

    function getDistancePerc(perc, bezierData) {
      var percents = bezierData.percents;
      var lengths = bezierData.lengths;
      var len = percents.length;
      var initPos = bm_floor((len - 1) * perc);
      var lengthPos = perc * bezierData.addedLength;
      var lPerc = 0;

      if (initPos === len - 1 || initPos === 0 || lengthPos === lengths[initPos]) {
        return percents[initPos];
      } else {
        var dir = lengths[initPos] > lengthPos ? -1 : 1;
        var flag = true;

        while (flag) {
          if (lengths[initPos] <= lengthPos && lengths[initPos + 1] > lengthPos) {
            lPerc = (lengthPos - lengths[initPos]) / (lengths[initPos + 1] - lengths[initPos]);
            flag = false;
          } else {
            initPos += dir;
          }

          if (initPos < 0 || initPos >= len - 1) {
            //FIX for TypedArrays that don't store floating point values with enough accuracy
            if (initPos === len - 1) {
              return percents[initPos];
            }

            flag = false;
          }
        }

        return percents[initPos] + (percents[initPos + 1] - percents[initPos]) * lPerc;
      }
    }

    function getPointInSegment(pt1, pt2, pt3, pt4, percent, bezierData) {
      var t1 = getDistancePerc(percent, bezierData);
      var u0 = 1;
      var u1 = 1 - t1;
      var ptX = Math.round((u1 * u1 * u1 * pt1[0] + (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[0] + (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[0] + t1 * t1 * t1 * pt2[0]) * 1000) / 1000;
      var ptY = Math.round((u1 * u1 * u1 * pt1[1] + (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[1] + (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[1] + t1 * t1 * t1 * pt2[1]) * 1000) / 1000;
      return [ptX, ptY];
    }

    function getSegmentArray() {}

    var bezier_segment_points = createTypedArray('float32', 8);

    function getNewSegment(pt1, pt2, pt3, pt4, startPerc, endPerc, bezierData) {
      startPerc = startPerc < 0 ? 0 : startPerc > 1 ? 1 : startPerc;
      var t0 = getDistancePerc(startPerc, bezierData);
      endPerc = endPerc > 1 ? 1 : endPerc;
      var t1 = getDistancePerc(endPerc, bezierData);
      var i,
          len = pt1.length;
      var u0 = 1 - t0;
      var u1 = 1 - t1;
      var u0u0u0 = u0 * u0 * u0;
      var t0u0u0_3 = t0 * u0 * u0 * 3;
      var t0t0u0_3 = t0 * t0 * u0 * 3;
      var t0t0t0 = t0 * t0 * t0; //

      var u0u0u1 = u0 * u0 * u1;
      var t0u0u1_3 = t0 * u0 * u1 + u0 * t0 * u1 + u0 * u0 * t1;
      var t0t0u1_3 = t0 * t0 * u1 + u0 * t0 * t1 + t0 * u0 * t1;
      var t0t0t1 = t0 * t0 * t1; //

      var u0u1u1 = u0 * u1 * u1;
      var t0u1u1_3 = t0 * u1 * u1 + u0 * t1 * u1 + u0 * u1 * t1;
      var t0t1u1_3 = t0 * t1 * u1 + u0 * t1 * t1 + t0 * u1 * t1;
      var t0t1t1 = t0 * t1 * t1; //

      var u1u1u1 = u1 * u1 * u1;
      var t1u1u1_3 = t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1;
      var t1t1u1_3 = t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1;
      var t1t1t1 = t1 * t1 * t1;

      for (i = 0; i < len; i += 1) {
        bezier_segment_points[i * 4] = Math.round((u0u0u0 * pt1[i] + t0u0u0_3 * pt3[i] + t0t0u0_3 * pt4[i] + t0t0t0 * pt2[i]) * 1000) / 1000;
        bezier_segment_points[i * 4 + 1] = Math.round((u0u0u1 * pt1[i] + t0u0u1_3 * pt3[i] + t0t0u1_3 * pt4[i] + t0t0t1 * pt2[i]) * 1000) / 1000;
        bezier_segment_points[i * 4 + 2] = Math.round((u0u1u1 * pt1[i] + t0u1u1_3 * pt3[i] + t0t1u1_3 * pt4[i] + t0t1t1 * pt2[i]) * 1000) / 1000;
        bezier_segment_points[i * 4 + 3] = Math.round((u1u1u1 * pt1[i] + t1u1u1_3 * pt3[i] + t1t1u1_3 * pt4[i] + t1t1t1 * pt2[i]) * 1000) / 1000;
      }

      return bezier_segment_points;
    }

    return {
      getSegmentsLength: getSegmentsLength,
      getNewSegment: getNewSegment,
      getPointInSegment: getPointInSegment,
      buildBezierData: buildBezierData,
      pointOnLine2D: pointOnLine2D,
      pointOnLine3D: pointOnLine3D
    };
  }

  var bez = bezFunction();

  function dataFunctionManager() {
    function completeLayers(layers, comps, fontManager) {
      var layerData;
      var animArray, lastFrame;
      var i,
          len = layers.length;
      var j, jLen, k, kLen;

      for (i = 0; i < len; i += 1) {
        layerData = layers[i];

        if (!('ks' in layerData) || layerData.completed) {
          continue;
        }

        layerData.completed = true;

        if (layerData.tt) {
          layers[i - 1].td = layerData.tt;
        }

        animArray = [];
        lastFrame = -1;

        if (layerData.hasMask) {
          var maskProps = layerData.masksProperties;
          jLen = maskProps.length;

          for (j = 0; j < jLen; j += 1) {
            if (maskProps[j].pt.k.i) {
              convertPathsToAbsoluteValues(maskProps[j].pt.k);
            } else {
              kLen = maskProps[j].pt.k.length;

              for (k = 0; k < kLen; k += 1) {
                if (maskProps[j].pt.k[k].s) {
                  convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
                }

                if (maskProps[j].pt.k[k].e) {
                  convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
                }
              }
            }
          }
        }

        if (layerData.ty === 0) {
          layerData.layers = findCompLayers(layerData.refId, comps);
          completeLayers(layerData.layers, comps, fontManager);
        } else if (layerData.ty === 4) {
          completeShapes(layerData.shapes);
        } else if (layerData.ty == 5) {
          completeText(layerData, fontManager);
        }
      }
    }

    function findCompLayers(id, comps) {
      var i = 0,
          len = comps.length;

      while (i < len) {
        if (comps[i].id === id) {
          if (!comps[i].layers.__used) {
            comps[i].layers.__used = true;
            return comps[i].layers;
          }

          return JSON.parse(JSON.stringify(comps[i].layers));
        }

        i += 1;
      }
    }

    function completeShapes(arr) {
      var i,
          len = arr.length;
      var j, jLen;
      var hasPaths = false;

      for (i = len - 1; i >= 0; i -= 1) {
        if (arr[i].ty == 'sh') {
          if (arr[i].ks.k.i) {
            convertPathsToAbsoluteValues(arr[i].ks.k);
          } else {
            jLen = arr[i].ks.k.length;

            for (j = 0; j < jLen; j += 1) {
              if (arr[i].ks.k[j].s) {
                convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
              }

              if (arr[i].ks.k[j].e) {
                convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
              }
            }
          }

          hasPaths = true;
        } else if (arr[i].ty == 'gr') {
          completeShapes(arr[i].it);
        }
      }
    }

    function convertPathsToAbsoluteValues(path) {
      var i,
          len = path.i.length;

      for (i = 0; i < len; i += 1) {
        path.i[i][0] += path.v[i][0];
        path.i[i][1] += path.v[i][1];
        path.o[i][0] += path.v[i][0];
        path.o[i][1] += path.v[i][1];
      }
    }

    function checkVersion(minimum, animVersionString) {
      var animVersion = animVersionString ? animVersionString.split('.') : [100, 100, 100];

      if (minimum[0] > animVersion[0]) {
        return true;
      } else if (animVersion[0] > minimum[0]) {
        return false;
      }

      if (minimum[1] > animVersion[1]) {
        return true;
      } else if (animVersion[1] > minimum[1]) {
        return false;
      }

      if (minimum[2] > animVersion[2]) {
        return true;
      } else if (animVersion[2] > minimum[2]) {
        return false;
      }
    }

    var checkText = function () {
      var minimumVersion = [4, 4, 14];

      function updateTextLayer(textLayer) {
        var documentData = textLayer.t.d;
        textLayer.t.d = {
          k: [{
            s: documentData,
            t: 0
          }]
        };
      }

      function iterateLayers(layers) {
        var i,
            len = layers.length;

        for (i = 0; i < len; i += 1) {
          if (layers[i].ty === 5) {
            updateTextLayer(layers[i]);
          }
        }
      }

      return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
          iterateLayers(animationData.layers);

          if (animationData.assets) {
            var i,
                len = animationData.assets.length;

            for (i = 0; i < len; i += 1) {
              if (animationData.assets[i].layers) {
                iterateLayers(animationData.assets[i].layers);
              }
            }
          }
        }
      };
    }();

    var checkChars = function () {
      var minimumVersion = [4, 7, 99];
      return function (animationData) {
        if (animationData.chars && !checkVersion(minimumVersion, animationData.v)) {
          var i,
              len = animationData.chars.length,
              j,
              jLen,
              k,
              kLen;
          var pathData, paths;

          for (i = 0; i < len; i += 1) {
            if (animationData.chars[i].data && animationData.chars[i].data.shapes) {
              paths = animationData.chars[i].data.shapes[0].it;
              jLen = paths.length;

              for (j = 0; j < jLen; j += 1) {
                pathData = paths[j].ks.k;

                if (!pathData.__converted) {
                  convertPathsToAbsoluteValues(paths[j].ks.k);
                  pathData.__converted = true;
                }
              }
            }
          }
        }
      };
    }();

    var checkColors = function () {
      var minimumVersion = [4, 1, 9];

      function iterateShapes(shapes) {
        var i,
            len = shapes.length;
        var j, jLen;

        for (i = 0; i < len; i += 1) {
          if (shapes[i].ty === 'gr') {
            iterateShapes(shapes[i].it);
          } else if (shapes[i].ty === 'fl' || shapes[i].ty === 'st') {
            if (shapes[i].c.k && shapes[i].c.k[0].i) {
              jLen = shapes[i].c.k.length;

              for (j = 0; j < jLen; j += 1) {
                if (shapes[i].c.k[j].s) {
                  shapes[i].c.k[j].s[0] /= 255;
                  shapes[i].c.k[j].s[1] /= 255;
                  shapes[i].c.k[j].s[2] /= 255;
                  shapes[i].c.k[j].s[3] /= 255;
                }

                if (shapes[i].c.k[j].e) {
                  shapes[i].c.k[j].e[0] /= 255;
                  shapes[i].c.k[j].e[1] /= 255;
                  shapes[i].c.k[j].e[2] /= 255;
                  shapes[i].c.k[j].e[3] /= 255;
                }
              }
            } else {
              shapes[i].c.k[0] /= 255;
              shapes[i].c.k[1] /= 255;
              shapes[i].c.k[2] /= 255;
              shapes[i].c.k[3] /= 255;
            }
          }
        }
      }

      function iterateLayers(layers) {
        var i,
            len = layers.length;

        for (i = 0; i < len; i += 1) {
          if (layers[i].ty === 4) {
            iterateShapes(layers[i].shapes);
          }
        }
      }

      return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
          iterateLayers(animationData.layers);

          if (animationData.assets) {
            var i,
                len = animationData.assets.length;

            for (i = 0; i < len; i += 1) {
              if (animationData.assets[i].layers) {
                iterateLayers(animationData.assets[i].layers);
              }
            }
          }
        }
      };
    }();

    var checkShapes = function () {
      var minimumVersion = [4, 4, 18];

      function completeShapes(arr) {
        var i,
            len = arr.length;
        var j, jLen;
        var hasPaths = false;

        for (i = len - 1; i >= 0; i -= 1) {
          if (arr[i].ty == 'sh') {
            if (arr[i].ks.k.i) {
              arr[i].ks.k.c = arr[i].closed;
            } else {
              jLen = arr[i].ks.k.length;

              for (j = 0; j < jLen; j += 1) {
                if (arr[i].ks.k[j].s) {
                  arr[i].ks.k[j].s[0].c = arr[i].closed;
                }

                if (arr[i].ks.k[j].e) {
                  arr[i].ks.k[j].e[0].c = arr[i].closed;
                }
              }
            }

            hasPaths = true;
          } else if (arr[i].ty == 'gr') {
            completeShapes(arr[i].it);
          }
        }
      }

      function iterateLayers(layers) {
        var layerData;
        var i,
            len = layers.length;
        var j, jLen, k, kLen;

        for (i = 0; i < len; i += 1) {
          layerData = layers[i];

          if (layerData.hasMask) {
            var maskProps = layerData.masksProperties;
            jLen = maskProps.length;

            for (j = 0; j < jLen; j += 1) {
              if (maskProps[j].pt.k.i) {
                maskProps[j].pt.k.c = maskProps[j].cl;
              } else {
                kLen = maskProps[j].pt.k.length;

                for (k = 0; k < kLen; k += 1) {
                  if (maskProps[j].pt.k[k].s) {
                    maskProps[j].pt.k[k].s[0].c = maskProps[j].cl;
                  }

                  if (maskProps[j].pt.k[k].e) {
                    maskProps[j].pt.k[k].e[0].c = maskProps[j].cl;
                  }
                }
              }
            }
          }

          if (layerData.ty === 4) {
            completeShapes(layerData.shapes);
          }
        }
      }

      return function (animationData) {
        if (checkVersion(minimumVersion, animationData.v)) {
          iterateLayers(animationData.layers);

          if (animationData.assets) {
            var i,
                len = animationData.assets.length;

            for (i = 0; i < len; i += 1) {
              if (animationData.assets[i].layers) {
                iterateLayers(animationData.assets[i].layers);
              }
            }
          }
        }
      };
    }();

    function completeData(animationData, fontManager) {
      if (animationData.__complete) {
        return;
      }

      checkColors(animationData);
      checkText(animationData);
      checkChars(animationData);
      checkShapes(animationData);
      completeLayers(animationData.layers, animationData.assets, fontManager);
      animationData.__complete = true; //blitAnimation(animationData, animationData.assets, fontManager);
    }

    function completeText(data, fontManager) {
      if (data.t.a.length === 0 && !('m' in data.t.p)) {
        data.singleShape = true;
      }
    }

    var moduleOb = {};
    moduleOb.completeData = completeData;
    return moduleOb;
  }

  var dataManager = dataFunctionManager();

  var FontManager = function () {
    var emptyChar = {
      w: 0,
      size: 0,
      shapes: []
    };
    var combinedCharacters = []; //Hindi characters

    combinedCharacters = combinedCharacters.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403]);

    function addFonts(fontData) {
      if (!fontData) {
        this.isLoaded = true;
        return;
      }

      if (this.chars) {
        this.isLoaded = true;
        this.fonts = fontData.list;
        return;
      }

      var fontArr = fontData.list;
      var i;
      var len = fontArr.length;

      for (i = 0; i < len; i += 1) {
        fontArr[i].loaded = false;
        fontArr[i].monoCase = null;
        fontArr[i].sansCase = null;
        fontArr[i].loaded = true;
        fontArr[i].helper = null;
        fontArr[i].cache = {};
        this.fonts.push(fontArr[i]);
      }

      this.isLoaded = true;
    }

    function addChars(chars) {
      if (!chars) {
        return;
      }

      if (!this.chars) {
        this.chars = [];
      }

      var i,
          len = chars.length;
      var j,
          jLen = this.chars.length,
          found;

      for (i = 0; i < len; i += 1) {
        j = 0;
        found = false;

        while (j < jLen) {
          if (this.chars[j].style === chars[i].style && this.chars[j].fFamily === chars[i].fFamily && this.chars[j].ch === chars[i].ch) {
            found = true;
          }

          j += 1;
        }

        if (!found) {
          this.chars.push(chars[i]);
          jLen += 1;
        }
      }
    }

    function getCharData(char, style, font, size) {
      if (!this.chars) {
        this.chars = [];
      }

      var i = 0,
          len = this.chars.length;

      while (i < len) {
        if (this.chars[i].ch === char && this.chars[i].style === style && this.chars[i].fFamily === font) {
          return this.chars[i];
        }

        i += 1;
      }

      return Object.assign(emptyChar, {
        size,
        w: size
      });
    }

    function measureText(char, fontName, size) {
      var fontData = this.getFontByName(fontName);
      var index = char.charCodeAt(0);

      if (!fontData.cache[index + 1]) {
        // var tHelper = fontData.helper;
        // if (char === ' ') {
        //   tHelper.textContent = '|' + char + '|';
        //   var doubleSize = tHelper.getComputedTextLength();
        //   tHelper.textContent = '||';
        //   var singleSize = tHelper.getComputedTextLength();
        //   fontData.cache[index + 1] = (doubleSize - singleSize) / 100;
        // } else {
        //   tHelper.textContent = char;
        //   fontData.cache[index + 1] = tHelper.getComputedTextLength() / 100;
        // }
        fontData.cache[index + 1] = 1;
      }

      return fontData.cache[index + 1] * size;
    }

    function getFontByName(fontName) {
      var i = 0,
          len = this.fonts.length;

      while (i < len) {
        if (this.fonts[i].fName === fontName) {
          return this.fonts[i];
        }

        i += 1;
      }

      return {
        cache: {}
      };
    }

    function getCombinedCharacterCodes() {
      return combinedCharacters;
    }

    function loaded() {
      return this.isLoaded;
    }

    var Font = function () {
      this.fonts = [];
      this.chars = null;
      this.typekitLoaded = 0;
      this.isLoaded = true;
    }; //TODO: for now I'm adding these methods to the Class and not the prototype. Think of a better way to implement it.


    Font.getCombinedCharacterCodes = getCombinedCharacterCodes;
    Font.prototype.addChars = addChars;
    Font.prototype.addFonts = addFonts;
    Font.prototype.getCharData = getCharData;
    Font.prototype.getFontByName = getFontByName;
    Font.prototype.measureText = measureText;
    Font.prototype.loaded = loaded;
    return Font;
  }();

  var PropertyFactory = function () {
    var initFrame = initialDefaultFrame;
    var math_abs = Math.abs;

    function interpolateValue(frameNum, caching) {
      var offsetTime = this.offsetTime;
      var newValue;

      if (this.propType === 'multidimensional') {
        newValue = createTypedArray('float32', this.pv.length);
      }

      var iterationIndex = caching.lastIndex;
      var i = iterationIndex;
      var len = this.keyframes.length - 1,
          flag = true;
      var keyData, nextKeyData;

      while (flag) {
        keyData = this.keyframes[i];
        nextKeyData = this.keyframes[i + 1];

        if (i === len - 1 && frameNum >= nextKeyData.t - offsetTime) {
          if (keyData.h) {
            keyData = nextKeyData;
          }

          iterationIndex = 0;
          break;
        }

        if (nextKeyData.t - offsetTime > frameNum) {
          iterationIndex = i;
          break;
        }

        if (i < len - 1) {
          i += 1;
        } else {
          iterationIndex = 0;
          flag = false;
        }
      }

      var k, kLen, perc, jLen, j, fnc;
      var nextKeyTime = nextKeyData.t - offsetTime;
      var keyTime = keyData.t - offsetTime;
      var endValue;

      if (keyData.to) {
        if (!keyData.bezierData) {
          keyData.bezierData = bez.buildBezierData(keyData.s, nextKeyData.s || keyData.e, keyData.to, keyData.ti);
        }

        var bezierData = keyData.bezierData;

        if (frameNum >= nextKeyTime || frameNum < keyTime) {
          var ind = frameNum >= nextKeyTime ? bezierData.points.length - 1 : 0;
          kLen = bezierData.points[ind].point.length;

          for (k = 0; k < kLen; k += 1) {
            newValue[k] = bezierData.points[ind].point[k];
          } // caching._lastKeyframeIndex = -1;

        } else {
          if (keyData.__fnct) {
            fnc = keyData.__fnct;
          } else {
            fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y, keyData.n).get;
            keyData.__fnct = fnc;
          }

          perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
          var distanceInLine = bezierData.segmentLength * perc;
          var segmentPerc;
          var addedLength = caching.lastFrame < frameNum && caching._lastKeyframeIndex === i ? caching._lastAddedLength : 0;
          j = caching.lastFrame < frameNum && caching._lastKeyframeIndex === i ? caching._lastPoint : 0;
          flag = true;
          jLen = bezierData.points.length;

          while (flag) {
            addedLength += bezierData.points[j].partialLength;

            if (distanceInLine === 0 || perc === 0 || j === bezierData.points.length - 1) {
              kLen = bezierData.points[j].point.length;

              for (k = 0; k < kLen; k += 1) {
                newValue[k] = bezierData.points[j].point[k];
              }

              break;
            } else if (distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j + 1].partialLength) {
              segmentPerc = (distanceInLine - addedLength) / bezierData.points[j + 1].partialLength;
              kLen = bezierData.points[j].point.length;

              for (k = 0; k < kLen; k += 1) {
                newValue[k] = bezierData.points[j].point[k] + (bezierData.points[j + 1].point[k] - bezierData.points[j].point[k]) * segmentPerc;
              }

              break;
            }

            if (j < jLen - 1) {
              j += 1;
            } else {
              flag = false;
            }
          }

          caching._lastPoint = j;
          caching._lastAddedLength = addedLength - bezierData.points[j].partialLength;
          caching._lastKeyframeIndex = i;
        }
      } else {
        var outX, outY, inX, inY, keyValue;
        len = keyData.s.length;
        endValue = nextKeyData.s || keyData.e;

        if (this.sh && keyData.h !== 1) {
          if (frameNum >= nextKeyTime) {
            newValue[0] = endValue[0];
            newValue[1] = endValue[1];
            newValue[2] = endValue[2];
          } else if (frameNum <= keyTime) {
            newValue[0] = keyData.s[0];
            newValue[1] = keyData.s[1];
            newValue[2] = keyData.s[2];
          } else {
            var quatStart = createQuaternion(keyData.s);
            var quatEnd = createQuaternion(endValue);
            var time = (frameNum - keyTime) / (nextKeyTime - keyTime);
            quaternionToEuler(newValue, slerp(quatStart, quatEnd, time));
          }
        } else {
          for (i = 0; i < len; i += 1) {
            if (keyData.h !== 1) {
              if (frameNum >= nextKeyTime) {
                perc = 1;
              } else if (frameNum < keyTime) {
                perc = 0;
              } else {
                if (keyData.o.x.constructor === Array) {
                  if (!keyData.__fnct) {
                    keyData.__fnct = [];
                  }

                  if (!keyData.__fnct[i]) {
                    outX = typeof keyData.o.x[i] === 'undefined' ? keyData.o.x[0] : keyData.o.x[i];
                    outY = typeof keyData.o.y[i] === 'undefined' ? keyData.o.y[0] : keyData.o.y[i];
                    inX = typeof keyData.i.x[i] === 'undefined' ? keyData.i.x[0] : keyData.i.x[i];
                    inY = typeof keyData.i.y[i] === 'undefined' ? keyData.i.y[0] : keyData.i.y[i];
                    fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
                    keyData.__fnct[i] = fnc;
                  } else {
                    fnc = keyData.__fnct[i];
                  }
                } else {
                  if (!keyData.__fnct) {
                    outX = keyData.o.x;
                    outY = keyData.o.y;
                    inX = keyData.i.x;
                    inY = keyData.i.y;
                    fnc = BezierFactory.getBezierEasing(outX, outY, inX, inY).get;
                    keyData.__fnct = fnc;
                  } else {
                    fnc = keyData.__fnct;
                  }
                }

                perc = fnc((frameNum - keyTime) / (nextKeyTime - keyTime));
              }
            }

            endValue = nextKeyData.s || keyData.e;
            keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i] + (endValue[i] - keyData.s[i]) * perc;

            if (this.propType === 'multidimensional') {
              newValue[i] = keyValue;
            } else {
              newValue = keyValue;
            }
          }
        }
      }

      caching.lastIndex = iterationIndex;
      return newValue;
    } //based on @Toji's https://github.com/toji/gl-matrix/


    function slerp(a, b, t) {
      var out = [];
      var ax = a[0],
          ay = a[1],
          az = a[2],
          aw = a[3],
          bx = b[0],
          by = b[1],
          bz = b[2],
          bw = b[3];
      var omega, cosom, sinom, scale0, scale1;
      cosom = ax * bx + ay * by + az * bz + aw * bw;

      if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }

      if (1.0 - cosom > 0.000001) {
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
      } else {
        scale0 = 1.0 - t;
        scale1 = t;
      }

      out[0] = scale0 * ax + scale1 * bx;
      out[1] = scale0 * ay + scale1 * by;
      out[2] = scale0 * az + scale1 * bz;
      out[3] = scale0 * aw + scale1 * bw;
      return out;
    }

    function quaternionToEuler(out, quat) {
      var qx = quat[0];
      var qy = quat[1];
      var qz = quat[2];
      var qw = quat[3];
      var heading = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy * qy - 2 * qz * qz);
      var attitude = Math.asin(2 * qx * qy + 2 * qz * qw);
      var bank = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx * qx - 2 * qz * qz);
      out[0] = heading / degToRads;
      out[1] = attitude / degToRads;
      out[2] = bank / degToRads;
    }

    function createQuaternion(values) {
      var heading = values[0] * degToRads;
      var attitude = values[1] * degToRads;
      var bank = values[2] * degToRads;
      var c1 = Math.cos(heading / 2);
      var c2 = Math.cos(attitude / 2);
      var c3 = Math.cos(bank / 2);
      var s1 = Math.sin(heading / 2);
      var s2 = Math.sin(attitude / 2);
      var s3 = Math.sin(bank / 2);
      var w = c1 * c2 * c3 - s1 * s2 * s3;
      var x = s1 * s2 * c3 + c1 * c2 * s3;
      var y = s1 * c2 * c3 + c1 * s2 * s3;
      var z = c1 * s2 * c3 - s1 * c2 * s3;
      return [x, y, z, w];
    }

    function getValueAtCurrentTime() {
      var frameNum = this.comp.renderedFrame - this.offsetTime;
      var initTime = this.keyframes[0].t - this.offsetTime;
      var endTime = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;

      if (!(frameNum === this._caching.lastFrame || this._caching.lastFrame !== initFrame && (this._caching.lastFrame >= endTime && frameNum >= endTime || this._caching.lastFrame < initTime && frameNum < initTime))) {
        if (this._caching.lastFrame >= frameNum) {
          this._caching._lastKeyframeIndex = -1;
          this._caching.lastIndex = 0;
        }

        var renderResult = this.interpolateValue(frameNum, this._caching);
        this.pv = renderResult;
      }

      this._caching.lastFrame = frameNum;
      return this.pv;
    }

    function setVValue(val) {
      var multipliedValue;

      if (this.propType === 'unidimensional') {
        multipliedValue = val * this.mult;

        if (math_abs(this.v - multipliedValue) > 0.00001) {
          this.v = multipliedValue;
          this._mdf = true;
        }
      } else {
        var i = 0,
            len = this.v.length;

        while (i < len) {
          multipliedValue = val[i] * this.mult;

          if (math_abs(this.v[i] - multipliedValue) > 0.00001) {
            this.v[i] = multipliedValue;
            this._mdf = true;
          }

          i += 1;
        }
      }
    }

    function processEffectsSequence() {
      if (this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) {
        return;
      }

      if (this.lock) {
        this.setVValue(this.pv);
        return;
      }

      this.lock = true;
      this._mdf = this._isFirstFrame;
      var multipliedValue;
      var i,
          len = this.effectsSequence.length;
      var finalValue = this.kf ? this.pv : this.data.k;

      for (i = 0; i < len; i += 1) {
        finalValue = this.effectsSequence[i](finalValue);
      }

      this.setVValue(finalValue);
      this._isFirstFrame = false;
      this.lock = false;
      this.frameId = this.elem.globalData.frameId;
    }

    function addEffect(effectFunction) {
      this.effectsSequence.push(effectFunction);
      this.container.addDynamicProperty(this);
    }

    function ValueProperty(elem, data, mult, container) {
      this.propType = 'unidimensional';
      this.mult = mult || 1;
      this.data = data;
      this.v = mult ? data.k * mult : data.k;
      this.pv = data.k;
      this._mdf = false;
      this.elem = elem;
      this.container = container;
      this.comp = elem.comp;
      this.k = false;
      this.kf = false;
      this.vel = 0;
      this.effectsSequence = [];
      this._isFirstFrame = true;
      this.getValue = processEffectsSequence;
      this.setVValue = setVValue;
      this.addEffect = addEffect;
    }

    function MultiDimensionalProperty(elem, data, mult, container) {
      this.propType = 'multidimensional';
      this.mult = mult || 1;
      this.data = data;
      this._mdf = false;
      this.elem = elem;
      this.container = container;
      this.comp = elem.comp;
      this.k = false;
      this.kf = false;
      this.frameId = -1;
      var i,
          len = data.k.length;
      this.v = createTypedArray('float32', len);
      this.pv = createTypedArray('float32', len);
      var arr = createTypedArray('float32', len);
      this.vel = createTypedArray('float32', len);

      for (i = 0; i < len; i += 1) {
        this.v[i] = data.k[i] * this.mult;
        this.pv[i] = data.k[i];
      }

      this._isFirstFrame = true;
      this.effectsSequence = [];
      this.getValue = processEffectsSequence;
      this.setVValue = setVValue;
      this.addEffect = addEffect;
    }

    function KeyframedValueProperty(elem, data, mult, container) {
      this.propType = 'unidimensional';
      this.keyframes = data.k;
      this.offsetTime = elem.data.st;
      this.frameId = -1;
      this._caching = {
        lastFrame: initFrame,
        lastIndex: 0,
        value: 0,
        _lastKeyframeIndex: -1
      };
      this.k = true;
      this.kf = true;
      this.data = data;
      this.mult = mult || 1;
      this.elem = elem;
      this.container = container;
      this.comp = elem.comp;
      this.v = initFrame;
      this.pv = initFrame;
      this._isFirstFrame = true;
      this.getValue = processEffectsSequence;
      this.setVValue = setVValue;
      this.interpolateValue = interpolateValue;
      this.effectsSequence = [getValueAtCurrentTime.bind(this)];
      this.addEffect = addEffect;
    }

    function KeyframedMultidimensionalProperty(elem, data, mult, container) {
      this.propType = 'multidimensional';
      var i,
          len = data.k.length;
      var s, e, to, ti;

      for (i = 0; i < len - 1; i += 1) {
        if (data.k[i].to && data.k[i].s && data.k[i].e) {
          s = data.k[i].s;
          e = data.k[i].e;
          to = data.k[i].to;
          ti = data.k[i].ti;

          if (s.length === 2 && !(s[0] === e[0] && s[1] === e[1]) && bez.pointOnLine2D(s[0], s[1], e[0], e[1], s[0] + to[0], s[1] + to[1]) && bez.pointOnLine2D(s[0], s[1], e[0], e[1], e[0] + ti[0], e[1] + ti[1]) || s.length === 3 && !(s[0] === e[0] && s[1] === e[1] && s[2] === e[2]) && bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], s[0] + to[0], s[1] + to[1], s[2] + to[2]) && bez.pointOnLine3D(s[0], s[1], s[2], e[0], e[1], e[2], e[0] + ti[0], e[1] + ti[1], e[2] + ti[2])) {
            data.k[i].to = null;
            data.k[i].ti = null;
          }

          if (s[0] === e[0] && s[1] === e[1] && to[0] === 0 && to[1] === 0 && ti[0] === 0 && ti[1] === 0) {
            if (s.length === 2 || s[2] === e[2] && to[2] === 0 && ti[2] === 0) {
              data.k[i].to = null;
              data.k[i].ti = null;
            }
          }
        }
      }

      this.effectsSequence = [getValueAtCurrentTime.bind(this)];
      this.keyframes = data.k;
      this.offsetTime = elem.data.st;
      this.k = true;
      this.kf = true;
      this._isFirstFrame = true;
      this.mult = mult || 1;
      this.elem = elem;
      this.container = container;
      this.comp = elem.comp;
      this.getValue = processEffectsSequence;
      this.setVValue = setVValue;
      this.interpolateValue = interpolateValue;
      this.frameId = -1;
      var arrLen = data.k[0].s.length;
      this.v = createTypedArray('float32', arrLen);
      this.pv = createTypedArray('float32', arrLen);

      for (i = 0; i < arrLen; i += 1) {
        this.v[i] = initFrame;
        this.pv[i] = initFrame;
      }

      this._caching = {
        lastFrame: initFrame,
        lastIndex: 0,
        value: createTypedArray('float32', arrLen)
      };
      this.addEffect = addEffect;
    }

    function getProp(elem, data, type, mult, container) {
      var p;

      if (!data.k.length) {
        p = new ValueProperty(elem, data, mult, container);
      } else if (typeof data.k[0] === 'number') {
        p = new MultiDimensionalProperty(elem, data, mult, container);
      } else {
        switch (type) {
          case 0:
            p = new KeyframedValueProperty(elem, data, mult, container);
            break;

          case 1:
            p = new KeyframedMultidimensionalProperty(elem, data, mult, container);
            break;
        }
      }

      if (p.effectsSequence.length) {
        container.addDynamicProperty(p);
      }

      return p;
    }

    var ob = {
      getProp: getProp
    };
    return ob;
  }();

  var TransformPropertyFactory = function () {
    function applyToMatrix(mat) {
      var _mdf = this._mdf;
      this.iterateDynamicProperties();
      this._mdf = this._mdf || _mdf;

      if (this.a) {
        mat.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
      }

      if (this.s) {
        mat.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
      }

      if (this.sk) {
        mat.skewFromAxis(-this.sk.v, this.sa.v);
      }

      if (this.r) {
        mat.rotate(-this.r.v);
      } else {
        mat.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
      }

      if (this.data.p.s) {
        if (this.data.p.z) {
          mat.translate(this.px.v, this.py.v, -this.pz.v);
        } else {
          mat.translate(this.px.v, this.py.v, 0);
        }
      } else {
        mat.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
      }
    }

    function processKeys(forceRender) {
      if (this.elem.globalData.frameId === this.frameId) {
        return;
      }

      if (this._isDirty) {
        this.precalculateMatrix();
        this._isDirty = false;
      }

      this.iterateDynamicProperties();

      if (this._mdf || forceRender) {
        this.v.cloneFromProps(this.pre.props);

        if (this.appliedTransformations < 1) {
          this.v.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
        }

        if (this.appliedTransformations < 2) {
          this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
        }

        if (this.sk && this.appliedTransformations < 3) {
          this.v.skewFromAxis(-this.sk.v, this.sa.v);
        }

        if (this.r && this.appliedTransformations < 4) {
          this.v.rotate(-this.r.v);
        } else if (!this.r && this.appliedTransformations < 4) {
          this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
        }

        if (this.autoOriented) {
          var v1,
              v2,
              frameRate = this.elem.globalData.frameRate;

          if (this.p && this.p.keyframes && this.p.getValueAtTime) {
            if (this.p._caching.lastFrame + this.p.offsetTime <= this.p.keyframes[0].t) {
              v1 = this.p.getValueAtTime((this.p.keyframes[0].t + 0.01) / frameRate, 0);
              v2 = this.p.getValueAtTime(this.p.keyframes[0].t / frameRate, 0);
            } else if (this.p._caching.lastFrame + this.p.offsetTime >= this.p.keyframes[this.p.keyframes.length - 1].t) {
              v1 = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t / frameRate, 0);
              v2 = this.p.getValueAtTime((this.p.keyframes[this.p.keyframes.length - 1].t - 0.05) / frameRate, 0);
            } else {
              v1 = this.p.pv;
              v2 = this.p.getValueAtTime((this.p._caching.lastFrame + this.p.offsetTime - 0.01) / frameRate, this.p.offsetTime);
            }
          } else if (this.px && this.px.keyframes && this.py.keyframes && this.px.getValueAtTime && this.py.getValueAtTime) {
            v1 = [];
            v2 = [];
            var px = this.px,
                py = this.py,
                frameRate;

            if (px._caching.lastFrame + px.offsetTime <= px.keyframes[0].t) {
              v1[0] = px.getValueAtTime((px.keyframes[0].t + 0.01) / frameRate, 0);
              v1[1] = py.getValueAtTime((py.keyframes[0].t + 0.01) / frameRate, 0);
              v2[0] = px.getValueAtTime(px.keyframes[0].t / frameRate, 0);
              v2[1] = py.getValueAtTime(py.keyframes[0].t / frameRate, 0);
            } else if (px._caching.lastFrame + px.offsetTime >= px.keyframes[px.keyframes.length - 1].t) {
              v1[0] = px.getValueAtTime(px.keyframes[px.keyframes.length - 1].t / frameRate, 0);
              v1[1] = py.getValueAtTime(py.keyframes[py.keyframes.length - 1].t / frameRate, 0);
              v2[0] = px.getValueAtTime((px.keyframes[px.keyframes.length - 1].t - 0.01) / frameRate, 0);
              v2[1] = py.getValueAtTime((py.keyframes[py.keyframes.length - 1].t - 0.01) / frameRate, 0);
            } else {
              v1 = [px.pv, py.pv];
              v2[0] = px.getValueAtTime((px._caching.lastFrame + px.offsetTime - 0.01) / frameRate, px.offsetTime);
              v2[1] = py.getValueAtTime((py._caching.lastFrame + py.offsetTime - 0.01) / frameRate, py.offsetTime);
            }
          }

          this.v.rotate(-Math.atan2(v1[1] - v2[1], v1[0] - v2[0]));
        }

        if (this.data.p && this.data.p.s) {
          if (this.data.p.z) {
            this.v.translate(this.px.v, this.py.v, -this.pz.v);
          } else {
            this.v.translate(this.px.v, this.py.v, 0);
          }
        } else {
          this.v.translate(this.p.v[0], this.p.v[1], -this.p.v[2]);
        }
      }

      this.frameId = this.elem.globalData.frameId;
    }

    function precalculateMatrix() {
      if (!this.a.k) {
        this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[2]);
        this.appliedTransformations = 1;
      } else {
        return;
      }

      if (!this.s.effectsSequence.length) {
        this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]);
        this.appliedTransformations = 2;
      } else {
        return;
      }

      if (this.sk) {
        if (!this.sk.effectsSequence.length && !this.sa.effectsSequence.length) {
          this.pre.skewFromAxis(-this.sk.v, this.sa.v);
          this.appliedTransformations = 3;
        } else {
          return;
        }
      }

      if (this.r) {
        if (!this.r.effectsSequence.length) {
          this.pre.rotate(-this.r.v);
          this.appliedTransformations = 4;
        } else {
          return;
        }
      } else if (!this.rz.effectsSequence.length && !this.ry.effectsSequence.length && !this.rx.effectsSequence.length && !this.or.effectsSequence.length) {
        this.pre.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
        this.appliedTransformations = 4;
      }
    }

    function autoOrient() {//
      //var prevP = this.getValueAtTime();
    }

    function addDynamicProperty(prop) {
      this._addDynamicProperty(prop);

      this.elem.addDynamicProperty(prop);
      this._isDirty = true;
    }

    function TransformProperty(elem, data, container) {
      this.elem = elem;
      this.frameId = -1;
      this.propType = 'transform';
      this.data = data;
      this.v = new Matrix(); //Precalculated matrix with non animated properties

      this.pre = new Matrix();
      this.appliedTransformations = 0;
      this.initDynamicPropertyContainer(container || elem);

      if (data.p && data.p.s) {
        this.px = PropertyFactory.getProp(elem, data.p.x, 0, 0, this);
        this.py = PropertyFactory.getProp(elem, data.p.y, 0, 0, this);

        if (data.p.z) {
          this.pz = PropertyFactory.getProp(elem, data.p.z, 0, 0, this);
        }
      } else {
        this.p = PropertyFactory.getProp(elem, data.p || {
          k: [0, 0, 0]
        }, 1, 0, this);
      }

      if (data.rx) {
        this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, this);
        this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, this);
        this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, this);

        if (data.or.k[0].ti) {
          var i,
              len = data.or.k.length;

          for (i = 0; i < len; i += 1) {
            data.or.k[i].to = data.or.k[i].ti = null;
          }
        }

        this.or = PropertyFactory.getProp(elem, data.or, 1, degToRads, this); //sh Indicates it needs to be capped between -180 and 180

        this.or.sh = true;
      } else {
        this.r = PropertyFactory.getProp(elem, data.r || {
          k: 0
        }, 0, degToRads, this);
      }

      if (data.sk) {
        this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, this);
        this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, this);
      }

      this.a = PropertyFactory.getProp(elem, data.a || {
        k: [0, 0, 0]
      }, 1, 0, this);
      this.s = PropertyFactory.getProp(elem, data.s || {
        k: [100, 100, 100]
      }, 1, 0.01, this); // Opacity is not part of the transform properties, that's why it won't use this.dynamicProperties. That way transforms won't get updated if opacity changes.

      if (data.o) {
        this.o = PropertyFactory.getProp(elem, data.o, 0, 0.01, elem);
      } else {
        this.o = {
          _mdf: false,
          v: 1
        };
      }

      this._isDirty = true;

      if (!this.dynamicProperties.length) {
        this.getValue(true);
      }
    }

    TransformProperty.prototype = {
      applyToMatrix: applyToMatrix,
      getValue: processKeys,
      precalculateMatrix: precalculateMatrix,
      autoOrient: autoOrient
    };
    extendPrototype([DynamicPropertyContainer], TransformProperty);
    TransformProperty.prototype.addDynamicProperty = addDynamicProperty;
    TransformProperty.prototype._addDynamicProperty = DynamicPropertyContainer.prototype.addDynamicProperty;

    function getTransformProperty(elem, data, container) {
      return new TransformProperty(elem, data, container);
    }

    return {
      getTransformProperty: getTransformProperty
    };
  }();

  function ShapePath() {
    this.c = false;
    this._length = 0;
    this._maxLength = 8;
    this.v = createSizedArray(this._maxLength);
    this.o = createSizedArray(this._maxLength);
    this.i = createSizedArray(this._maxLength);
  }

  ShapePath.prototype.setPathData = function (closed, len) {
    this.c = closed;
    this.setLength(len);
    var i = 0;

    while (i < len) {
      this.v[i] = point_pool.newElement();
      this.o[i] = point_pool.newElement();
      this.i[i] = point_pool.newElement();
      i += 1;
    }
  };

  ShapePath.prototype.setLength = function (len) {
    while (this._maxLength < len) {
      this.doubleArrayLength();
    }

    this._length = len;
  };

  ShapePath.prototype.doubleArrayLength = function () {
    this.v = this.v.concat(createSizedArray(this._maxLength));
    this.i = this.i.concat(createSizedArray(this._maxLength));
    this.o = this.o.concat(createSizedArray(this._maxLength));
    this._maxLength *= 2;
  };

  ShapePath.prototype.setXYAt = function (x, y, type, pos, replace) {
    var arr;
    this._length = Math.max(this._length, pos + 1);

    if (this._length >= this._maxLength) {
      this.doubleArrayLength();
    }

    switch (type) {
      case 'v':
        arr = this.v;
        break;

      case 'i':
        arr = this.i;
        break;

      case 'o':
        arr = this.o;
        break;
    }

    if (!arr[pos] || arr[pos] && !replace) {
      arr[pos] = point_pool.newElement();
    }

    arr[pos][0] = x;
    arr[pos][1] = y;
  };

  ShapePath.prototype.setTripleAt = function (vX, vY, oX, oY, iX, iY, pos, replace) {
    this.setXYAt(vX, vY, 'v', pos, replace);
    this.setXYAt(oX, oY, 'o', pos, replace);
    this.setXYAt(iX, iY, 'i', pos, replace);
  };

  ShapePath.prototype.reverse = function () {
    var newPath = new ShapePath();
    newPath.setPathData(this.c, this._length);
    var vertices = this.v,
        outPoints = this.o,
        inPoints = this.i;
    var init = 0;

    if (this.c) {
      newPath.setTripleAt(vertices[0][0], vertices[0][1], inPoints[0][0], inPoints[0][1], outPoints[0][0], outPoints[0][1], 0, false);
      init = 1;
    }

    var cnt = this._length - 1;
    var len = this._length;
    var i;

    for (i = init; i < len; i += 1) {
      newPath.setTripleAt(vertices[cnt][0], vertices[cnt][1], inPoints[cnt][0], inPoints[cnt][1], outPoints[cnt][0], outPoints[cnt][1], i, false);
      cnt -= 1;
    }

    return newPath;
  };

  var ShapePropertyFactory = function () {
    var initFrame = -999999;

    function interpolateShape(frameNum, previousValue, caching) {
      var iterationIndex = caching.lastIndex;
      var keyPropS, keyPropE, isHold, j, k, jLen, kLen, perc, vertexValue;
      var kf = this.keyframes;

      if (frameNum < kf[0].t - this.offsetTime) {
        keyPropS = kf[0].s[0];
        isHold = true;
        iterationIndex = 0;
      } else if (frameNum >= kf[kf.length - 1].t - this.offsetTime) {
        keyPropS = kf[kf.length - 1].s ? kf[kf.length - 1].s[0] : kf[kf.length - 2].e[0];
        isHold = true;
      } else {
        var i = iterationIndex;
        var len = kf.length - 1,
            flag = true,
            keyData,
            nextKeyData;

        while (flag) {
          keyData = kf[i];
          nextKeyData = kf[i + 1];

          if (nextKeyData.t - this.offsetTime > frameNum) {
            break;
          }

          if (i < len - 1) {
            i += 1;
          } else {
            flag = false;
          }
        }

        isHold = keyData.h === 1;
        iterationIndex = i;

        if (!isHold) {
          if (frameNum >= nextKeyData.t - this.offsetTime) {
            perc = 1;
          } else if (frameNum < keyData.t - this.offsetTime) {
            perc = 0;
          } else {
            var fnc;

            if (keyData.__fnct) {
              fnc = keyData.__fnct;
            } else {
              fnc = BezierFactory.getBezierEasing(keyData.o.x, keyData.o.y, keyData.i.x, keyData.i.y).get;
              keyData.__fnct = fnc;
            }

            perc = fnc((frameNum - (keyData.t - this.offsetTime)) / (nextKeyData.t - this.offsetTime - (keyData.t - this.offsetTime)));
          }

          keyPropE = nextKeyData.s ? nextKeyData.s[0] : keyData.e[0];
        }

        keyPropS = keyData.s[0];
      }

      jLen = previousValue._length;
      kLen = keyPropS.i[0].length;
      caching.lastIndex = iterationIndex;

      for (j = 0; j < jLen; j += 1) {
        for (k = 0; k < kLen; k += 1) {
          vertexValue = isHold ? keyPropS.i[j][k] : keyPropS.i[j][k] + (keyPropE.i[j][k] - keyPropS.i[j][k]) * perc;
          previousValue.i[j][k] = vertexValue;
          vertexValue = isHold ? keyPropS.o[j][k] : keyPropS.o[j][k] + (keyPropE.o[j][k] - keyPropS.o[j][k]) * perc;
          previousValue.o[j][k] = vertexValue;
          vertexValue = isHold ? keyPropS.v[j][k] : keyPropS.v[j][k] + (keyPropE.v[j][k] - keyPropS.v[j][k]) * perc;
          previousValue.v[j][k] = vertexValue;
        }
      }
    }

    function interpolateShapeCurrentTime() {
      var frameNum = this.comp.renderedFrame - this.offsetTime;
      var initTime = this.keyframes[0].t - this.offsetTime;
      var endTime = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
      var lastFrame = this._caching.lastFrame;

      if (!(lastFrame !== initFrame && (lastFrame < initTime && frameNum < initTime || lastFrame > endTime && frameNum > endTime))) {
        ////
        this._caching.lastIndex = lastFrame < frameNum ? this._caching.lastIndex : 0;
        this.interpolateShape(frameNum, this.pv, this._caching); ////
      }

      this._caching.lastFrame = frameNum;
      return this.pv;
    }

    function resetShape() {
      this.paths = this.localShapeCollection;
    }

    function shapesEqual(shape1, shape2) {
      if (shape1._length !== shape2._length || shape1.c !== shape2.c) {
        return false;
      }

      var i,
          len = shape1._length;

      for (i = 0; i < len; i += 1) {
        if (shape1.v[i][0] !== shape2.v[i][0] || shape1.v[i][1] !== shape2.v[i][1] || shape1.o[i][0] !== shape2.o[i][0] || shape1.o[i][1] !== shape2.o[i][1] || shape1.i[i][0] !== shape2.i[i][0] || shape1.i[i][1] !== shape2.i[i][1]) {
          return false;
        }
      }

      return true;
    }

    function setVValue(newPath) {
      if (!shapesEqual(this.v, newPath)) {
        this.v = shape_pool.clone(newPath);
        this.localShapeCollection.releaseShapes();
        this.localShapeCollection.addShape(this.v);
        this._mdf = true;
        this.paths = this.localShapeCollection;
      }
    }

    function processEffectsSequence() {
      if (this.elem.globalData.frameId === this.frameId) {
        return;
      } else if (!this.effectsSequence.length) {
        this._mdf = false;
        return;
      }

      if (this.lock) {
        this.setVValue(this.pv);
        return;
      }

      this.lock = true;
      this._mdf = false;
      var finalValue = this.kf ? this.pv : this.data.ks ? this.data.ks.k : this.data.pt.k;
      var i,
          len = this.effectsSequence.length;

      for (i = 0; i < len; i += 1) {
        finalValue = this.effectsSequence[i](finalValue);
      }

      this.setVValue(finalValue);
      this.lock = false;
      this.frameId = this.elem.globalData.frameId;
    }

    function ShapeProperty(elem, data, type) {
      this.propType = 'shape';
      this.comp = elem.comp;
      this.container = elem;
      this.elem = elem;
      this.data = data;
      this.k = false;
      this.kf = false;
      this._mdf = false;
      var pathData = type === 3 ? data.pt.k : data.ks.k;
      this.v = shape_pool.clone(pathData);
      this.pv = shape_pool.clone(this.v);
      this.localShapeCollection = shapeCollection_pool.newShapeCollection();
      this.paths = this.localShapeCollection;
      this.paths.addShape(this.v);
      this.reset = resetShape;
      this.effectsSequence = [];
    }

    function addEffect(effectFunction) {
      this.effectsSequence.push(effectFunction);
      this.container.addDynamicProperty(this);
    }

    ShapeProperty.prototype.interpolateShape = interpolateShape;
    ShapeProperty.prototype.getValue = processEffectsSequence;
    ShapeProperty.prototype.setVValue = setVValue;
    ShapeProperty.prototype.addEffect = addEffect;

    function KeyframedShapeProperty(elem, data, type) {
      this.propType = 'shape';
      this.comp = elem.comp;
      this.elem = elem;
      this.container = elem;
      this.offsetTime = elem.data.st;
      this.keyframes = type === 3 ? data.pt.k : data.ks.k;
      this.k = true;
      this.kf = true;
      var i,
          len = this.keyframes[0].s[0].i.length;
      var jLen = this.keyframes[0].s[0].i[0].length;
      this.v = shape_pool.newElement();
      this.v.setPathData(this.keyframes[0].s[0].c, len);
      this.pv = shape_pool.clone(this.v);
      this.localShapeCollection = shapeCollection_pool.newShapeCollection();
      this.paths = this.localShapeCollection;
      this.paths.addShape(this.v);
      this.lastFrame = initFrame;
      this.reset = resetShape;
      this._caching = {
        lastFrame: initFrame,
        lastIndex: 0
      };
      this.effectsSequence = [interpolateShapeCurrentTime.bind(this)];
    }

    KeyframedShapeProperty.prototype.getValue = processEffectsSequence;
    KeyframedShapeProperty.prototype.interpolateShape = interpolateShape;
    KeyframedShapeProperty.prototype.setVValue = setVValue;
    KeyframedShapeProperty.prototype.addEffect = addEffect;

    var EllShapeProperty = function () {
      var cPoint = roundCorner;

      function EllShapeProperty(elem, data) {
        this.v = shape_pool.newElement();
        this.v.setPathData(true, 4);
        this.localShapeCollection = shapeCollection_pool.newShapeCollection();
        this.paths = this.localShapeCollection;
        this.localShapeCollection.addShape(this.v);
        this.d = data.d;
        this.elem = elem;
        this.comp = elem.comp;
        this.frameId = -1;
        this.initDynamicPropertyContainer(elem);
        this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
        this.s = PropertyFactory.getProp(elem, data.s, 1, 0, this);

        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.k = false;
          this.convertEllToPath();
        }
      }

      EllShapeProperty.prototype = {
        reset: resetShape,
        getValue: function () {
          if (this.elem.globalData.frameId === this.frameId) {
            return;
          }

          this.frameId = this.elem.globalData.frameId;
          this.iterateDynamicProperties();

          if (this._mdf) {
            this.convertEllToPath();
          }
        },
        convertEllToPath: function () {
          var p0 = this.p.v[0],
              p1 = this.p.v[1],
              s0 = this.s.v[0] / 2,
              s1 = this.s.v[1] / 2;

          var _cw = this.d !== 3;

          var _v = this.v;
          _v.v[0][0] = p0;
          _v.v[0][1] = p1 - s1;
          _v.v[1][0] = _cw ? p0 + s0 : p0 - s0;
          _v.v[1][1] = p1;
          _v.v[2][0] = p0;
          _v.v[2][1] = p1 + s1;
          _v.v[3][0] = _cw ? p0 - s0 : p0 + s0;
          _v.v[3][1] = p1;
          _v.i[0][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
          _v.i[0][1] = p1 - s1;
          _v.i[1][0] = _cw ? p0 + s0 : p0 - s0;
          _v.i[1][1] = p1 - s1 * cPoint;
          _v.i[2][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
          _v.i[2][1] = p1 + s1;
          _v.i[3][0] = _cw ? p0 - s0 : p0 + s0;
          _v.i[3][1] = p1 + s1 * cPoint;
          _v.o[0][0] = _cw ? p0 + s0 * cPoint : p0 - s0 * cPoint;
          _v.o[0][1] = p1 - s1;
          _v.o[1][0] = _cw ? p0 + s0 : p0 - s0;
          _v.o[1][1] = p1 + s1 * cPoint;
          _v.o[2][0] = _cw ? p0 - s0 * cPoint : p0 + s0 * cPoint;
          _v.o[2][1] = p1 + s1;
          _v.o[3][0] = _cw ? p0 - s0 : p0 + s0;
          _v.o[3][1] = p1 - s1 * cPoint;
        }
      };
      extendPrototype([DynamicPropertyContainer], EllShapeProperty);
      return EllShapeProperty;
    }();

    var StarShapeProperty = function () {
      function StarShapeProperty(elem, data) {
        this.v = shape_pool.newElement();
        this.v.setPathData(true, 0);
        this.elem = elem;
        this.comp = elem.comp;
        this.data = data;
        this.frameId = -1;
        this.d = data.d;
        this.initDynamicPropertyContainer(elem);

        if (data.sy === 1) {
          this.ir = PropertyFactory.getProp(elem, data.ir, 0, 0, this);
          this.is = PropertyFactory.getProp(elem, data.is, 0, 0.01, this);
          this.convertToPath = this.convertStarToPath;
        } else {
          this.convertToPath = this.convertPolygonToPath;
        }

        this.pt = PropertyFactory.getProp(elem, data.pt, 0, 0, this);
        this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
        this.r = PropertyFactory.getProp(elem, data.r, 0, degToRads, this);
        this.or = PropertyFactory.getProp(elem, data.or, 0, 0, this);
        this.os = PropertyFactory.getProp(elem, data.os, 0, 0.01, this);
        this.localShapeCollection = shapeCollection_pool.newShapeCollection();
        this.localShapeCollection.addShape(this.v);
        this.paths = this.localShapeCollection;

        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.k = false;
          this.convertToPath();
        }
      }

      StarShapeProperty.prototype = {
        reset: resetShape,
        getValue: function () {
          if (this.elem.globalData.frameId === this.frameId) {
            return;
          }

          this.frameId = this.elem.globalData.frameId;
          this.iterateDynamicProperties();

          if (this._mdf) {
            this.convertToPath();
          }
        },
        convertStarToPath: function () {
          var numPts = Math.floor(this.pt.v) * 2;
          var angle = Math.PI * 2 / numPts;
          var longFlag = true;
          var longRad = this.or.v;
          var shortRad = this.ir.v;
          var longRound = this.os.v;
          var shortRound = this.is.v;
          var longPerimSegment = 2 * Math.PI * longRad / (numPts * 2);
          var shortPerimSegment = 2 * Math.PI * shortRad / (numPts * 2);
          var i,
              rad,
              roundness,
              perimSegment,
              currentAng = -Math.PI / 2;
          currentAng += this.r.v;
          var dir = this.data.d === 3 ? -1 : 1;
          this.v._length = 0;

          for (i = 0; i < numPts; i += 1) {
            rad = longFlag ? longRad : shortRad;
            roundness = longFlag ? longRound : shortRound;
            perimSegment = longFlag ? longPerimSegment : shortPerimSegment;
            var x = rad * Math.cos(currentAng);
            var y = rad * Math.sin(currentAng);
            var ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
            var oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
            x += +this.p.v[0];
            y += +this.p.v[1];
            this.v.setTripleAt(x, y, x - ox * perimSegment * roundness * dir, y - oy * perimSegment * roundness * dir, x + ox * perimSegment * roundness * dir, y + oy * perimSegment * roundness * dir, i, true);
            longFlag = !longFlag;
            currentAng += angle * dir;
          }
        },
        convertPolygonToPath: function () {
          var numPts = Math.floor(this.pt.v);
          var angle = Math.PI * 2 / numPts;
          var rad = this.or.v;
          var roundness = this.os.v;
          var perimSegment = 2 * Math.PI * rad / (numPts * 4);
          var i,
              currentAng = -Math.PI / 2;
          var dir = this.data.d === 3 ? -1 : 1;
          currentAng += this.r.v;
          this.v._length = 0;

          for (i = 0; i < numPts; i += 1) {
            var x = rad * Math.cos(currentAng);
            var y = rad * Math.sin(currentAng);
            var ox = x === 0 && y === 0 ? 0 : y / Math.sqrt(x * x + y * y);
            var oy = x === 0 && y === 0 ? 0 : -x / Math.sqrt(x * x + y * y);
            x += +this.p.v[0];
            y += +this.p.v[1];
            this.v.setTripleAt(x, y, x - ox * perimSegment * roundness * dir, y - oy * perimSegment * roundness * dir, x + ox * perimSegment * roundness * dir, y + oy * perimSegment * roundness * dir, i, true);
            currentAng += angle * dir;
          }

          this.paths.length = 0;
          this.paths[0] = this.v;
        }
      };
      extendPrototype([DynamicPropertyContainer], StarShapeProperty);
      return StarShapeProperty;
    }();

    var RectShapeProperty = function () {
      function RectShapeProperty(elem, data) {
        this.v = shape_pool.newElement();
        this.v.c = true;
        this.localShapeCollection = shapeCollection_pool.newShapeCollection();
        this.localShapeCollection.addShape(this.v);
        this.paths = this.localShapeCollection;
        this.elem = elem;
        this.comp = elem.comp;
        this.frameId = -1;
        this.d = data.d;
        this.initDynamicPropertyContainer(elem);
        this.p = PropertyFactory.getProp(elem, data.p, 1, 0, this);
        this.s = PropertyFactory.getProp(elem, data.s, 1, 0, this);
        this.r = PropertyFactory.getProp(elem, data.r, 0, 0, this);

        if (this.dynamicProperties.length) {
          this.k = true;
        } else {
          this.k = false;
          this.convertRectToPath();
        }
      }

      RectShapeProperty.prototype = {
        convertRectToPath: function () {
          var p0 = this.p.v[0],
              p1 = this.p.v[1],
              v0 = this.s.v[0] / 2,
              v1 = this.s.v[1] / 2;
          var round = bm_min(v0, v1, this.r.v);
          var cPoint = round * (1 - roundCorner);
          this.v._length = 0;

          if (this.d === 2 || this.d === 1) {
            this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, 0, true);
            this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, p0 + v0, p1 + v1 - round, 1, true);

            if (round !== 0) {
              this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, 2, true);
              this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0 + round, p1 + v1, 3, true);
              this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, 4, true);
              this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1 + round, 5, true);
              this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, 6, true);
              this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, p0 + v0 - round, p1 - v1, 7, true);
            } else {
              this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0 + cPoint, p1 + v1, p0 - v0, p1 + v1, 2);
              this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0, p1 - v1 + cPoint, p0 - v0, p1 - v1, 3);
            }
          } else {
            this.v.setTripleAt(p0 + v0, p1 - v1 + round, p0 + v0, p1 - v1 + cPoint, p0 + v0, p1 - v1 + round, 0, true);

            if (round !== 0) {
              this.v.setTripleAt(p0 + v0 - round, p1 - v1, p0 + v0 - round, p1 - v1, p0 + v0 - cPoint, p1 - v1, 1, true);
              this.v.setTripleAt(p0 - v0 + round, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0 + round, p1 - v1, 2, true);
              this.v.setTripleAt(p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + round, p0 - v0, p1 - v1 + cPoint, 3, true);
              this.v.setTripleAt(p0 - v0, p1 + v1 - round, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1 - round, 4, true);
              this.v.setTripleAt(p0 - v0 + round, p1 + v1, p0 - v0 + round, p1 + v1, p0 - v0 + cPoint, p1 + v1, 5, true);
              this.v.setTripleAt(p0 + v0 - round, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0 - round, p1 + v1, 6, true);
              this.v.setTripleAt(p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - round, p0 + v0, p1 + v1 - cPoint, 7, true);
            } else {
              this.v.setTripleAt(p0 - v0, p1 - v1, p0 - v0 + cPoint, p1 - v1, p0 - v0, p1 - v1, 1, true);
              this.v.setTripleAt(p0 - v0, p1 + v1, p0 - v0, p1 + v1 - cPoint, p0 - v0, p1 + v1, 2, true);
              this.v.setTripleAt(p0 + v0, p1 + v1, p0 + v0 - cPoint, p1 + v1, p0 + v0, p1 + v1, 3, true);
            }
          }
        },
        getValue: function (frameNum) {
          if (this.elem.globalData.frameId === this.frameId) {
            return;
          }

          this.frameId = this.elem.globalData.frameId;
          this.iterateDynamicProperties();

          if (this._mdf) {
            this.convertRectToPath();
          }
        },
        reset: resetShape
      };
      extendPrototype([DynamicPropertyContainer], RectShapeProperty);
      return RectShapeProperty;
    }();

    function getShapeProp(elem, data, type) {
      var prop;

      if (type === 3 || type === 4) {
        var dataProp = type === 3 ? data.pt : data.ks;
        var keys = dataProp.k;

        if (keys.length) {
          prop = new KeyframedShapeProperty(elem, data, type);
        } else {
          prop = new ShapeProperty(elem, data, type);
        }
      } else if (type === 5) {
        prop = new RectShapeProperty(elem, data);
      } else if (type === 6) {
        prop = new EllShapeProperty(elem, data);
      } else if (type === 7) {
        prop = new StarShapeProperty(elem, data);
      }

      if (prop.k) {
        elem.addDynamicProperty(prop);
      }

      return prop;
    }

    function getConstructorFunction() {
      return ShapeProperty;
    }

    function getKeyframedConstructorFunction() {
      return KeyframedShapeProperty;
    }

    var ob = {};
    ob.getShapeProp = getShapeProp;
    ob.getConstructorFunction = getConstructorFunction;
    ob.getKeyframedConstructorFunction = getKeyframedConstructorFunction;
    return ob;
  }();

  var ShapeModifiers = function () {
    var ob = {};
    var modifiers = {};
    ob.registerModifier = registerModifier;
    ob.getModifier = getModifier;

    function registerModifier(nm, factory) {
      if (!modifiers[nm]) {
        modifiers[nm] = factory;
      }
    }

    function getModifier(nm, elem, data) {
      return new modifiers[nm](elem, data);
    }

    return ob;
  }();

  function ShapeModifier() {}

  ShapeModifier.prototype.initModifierProperties = function () {};

  ShapeModifier.prototype.addShapeToModifier = function () {};

  ShapeModifier.prototype.addShape = function (data) {
    if (!this.closed) {
      // Adding shape to dynamic properties. It covers the case where a shape has no effects applied, to reset it's _mdf state on every tick.
      data.sh.container.addDynamicProperty(data.sh);
      var shapeData = {
        shape: data.sh,
        data: data,
        localShapeCollection: shapeCollection_pool.newShapeCollection()
      };
      this.shapes.push(shapeData);
      this.addShapeToModifier(shapeData);

      if (this._isAnimated) {
        data.setAsAnimated();
      }
    }
  };

  ShapeModifier.prototype.init = function (elem, data) {
    this.shapes = [];
    this.elem = elem;
    this.initDynamicPropertyContainer(elem);
    this.initModifierProperties(elem, data);
    this.frameId = initialDefaultFrame;
    this.closed = false;
    this.k = false;

    if (this.dynamicProperties.length) {
      this.k = true;
    } else {
      this.getValue(true);
    }
  };

  ShapeModifier.prototype.processKeys = function () {
    if (this.elem.globalData.frameId === this.frameId) {
      return;
    }

    this.frameId = this.elem.globalData.frameId;
    this.iterateDynamicProperties();
  };

  extendPrototype([DynamicPropertyContainer], ShapeModifier);

  function TrimModifier() {}

  extendPrototype([ShapeModifier], TrimModifier);

  TrimModifier.prototype.initModifierProperties = function (elem, data) {
    this.s = PropertyFactory.getProp(elem, data.s, 0, 0.01, this);
    this.e = PropertyFactory.getProp(elem, data.e, 0, 0.01, this);
    this.o = PropertyFactory.getProp(elem, data.o, 0, 0, this);
    this.sValue = 0;
    this.eValue = 0;
    this.getValue = this.processKeys;
    this.m = data.m;
    this._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!this.o.effectsSequence.length;
  };

  TrimModifier.prototype.addShapeToModifier = function (shapeData) {
    shapeData.pathsData = [];
  };

  TrimModifier.prototype.calculateShapeEdges = function (s, e, shapeLength, addedLength, totalModifierLength) {
    var segments = [];

    if (e <= 1) {
      segments.push({
        s: s,
        e: e
      });
    } else if (s >= 1) {
      segments.push({
        s: s - 1,
        e: e - 1
      });
    } else {
      segments.push({
        s: s,
        e: 1
      });
      segments.push({
        s: 0,
        e: e - 1
      });
    }

    var shapeSegments = [];
    var i,
        len = segments.length,
        segmentOb;

    for (i = 0; i < len; i += 1) {
      segmentOb = segments[i];

      if (segmentOb.e * totalModifierLength < addedLength || segmentOb.s * totalModifierLength > addedLength + shapeLength) {} else {
        var shapeS, shapeE;

        if (segmentOb.s * totalModifierLength <= addedLength) {
          shapeS = 0;
        } else {
          shapeS = (segmentOb.s * totalModifierLength - addedLength) / shapeLength;
        }

        if (segmentOb.e * totalModifierLength >= addedLength + shapeLength) {
          shapeE = 1;
        } else {
          shapeE = (segmentOb.e * totalModifierLength - addedLength) / shapeLength;
        }

        shapeSegments.push([shapeS, shapeE]);
      }
    }

    if (!shapeSegments.length) {
      shapeSegments.push([0, 0]);
    }

    return shapeSegments;
  };

  TrimModifier.prototype.releasePathsData = function (pathsData) {
    var i,
        len = pathsData.length;

    for (i = 0; i < len; i += 1) {
      segments_length_pool.release(pathsData[i]);
    }

    pathsData.length = 0;
    return pathsData;
  };

  TrimModifier.prototype.processShapes = function (_isFirstFrame) {
    var s, e;

    if (this._mdf || _isFirstFrame) {
      var o = this.o.v % 360 / 360;

      if (o < 0) {
        o += 1;
      }

      s = (this.s.v > 1 ? 1 : this.s.v < 0 ? 0 : this.s.v) + o;
      e = (this.e.v > 1 ? 1 : this.e.v < 0 ? 0 : this.e.v) + o;

      if (s === e) {}

      if (s > e) {
        var _s = s;
        s = e;
        e = _s;
      }

      s = Math.round(s * 10000) * 0.0001;
      e = Math.round(e * 10000) * 0.0001;
      this.sValue = s;
      this.eValue = e;
    } else {
      s = this.sValue;
      e = this.eValue;
    }

    var shapePaths;
    var i,
        len = this.shapes.length,
        j,
        jLen;
    var pathsData,
        pathData,
        totalShapeLength,
        totalModifierLength = 0;

    if (e === s) {
      for (i = 0; i < len; i += 1) {
        this.shapes[i].localShapeCollection.releaseShapes();
        this.shapes[i].shape._mdf = true;
        this.shapes[i].shape.paths = this.shapes[i].localShapeCollection;
      }
    } else if (!(e === 1 && s === 0 || e === 0 && s === 1)) {
      var segments = [],
          shapeData,
          localShapeCollection;

      for (i = 0; i < len; i += 1) {
        shapeData = this.shapes[i]; // if shape hasn't changed and trim properties haven't changed, cached previous path can be used

        if (!shapeData.shape._mdf && !this._mdf && !_isFirstFrame && this.m !== 2) {
          shapeData.shape.paths = shapeData.localShapeCollection;
        } else {
          shapePaths = shapeData.shape.paths;
          jLen = shapePaths._length;
          totalShapeLength = 0;

          if (!shapeData.shape._mdf && shapeData.pathsData.length) {
            totalShapeLength = shapeData.totalShapeLength;
          } else {
            pathsData = this.releasePathsData(shapeData.pathsData);

            for (j = 0; j < jLen; j += 1) {
              pathData = bez.getSegmentsLength(shapePaths.shapes[j]);
              pathsData.push(pathData);
              totalShapeLength += pathData.totalLength;
            }

            shapeData.totalShapeLength = totalShapeLength;
            shapeData.pathsData = pathsData;
          }

          totalModifierLength += totalShapeLength;
          shapeData.shape._mdf = true;
        }
      }

      var shapeS = s,
          shapeE = e,
          addedLength = 0,
          edges;

      for (i = len - 1; i >= 0; i -= 1) {
        shapeData = this.shapes[i];

        if (shapeData.shape._mdf) {
          localShapeCollection = shapeData.localShapeCollection;
          localShapeCollection.releaseShapes(); //if m === 2 means paths are trimmed individually so edges need to be found for this specific shape relative to whoel group

          if (this.m === 2 && len > 1) {
            edges = this.calculateShapeEdges(s, e, shapeData.totalShapeLength, addedLength, totalModifierLength);
            addedLength += shapeData.totalShapeLength;
          } else {
            edges = [[shapeS, shapeE]];
          }

          jLen = edges.length;

          for (j = 0; j < jLen; j += 1) {
            shapeS = edges[j][0];
            shapeE = edges[j][1];
            segments.length = 0;

            if (shapeE <= 1) {
              segments.push({
                s: shapeData.totalShapeLength * shapeS,
                e: shapeData.totalShapeLength * shapeE
              });
            } else if (shapeS >= 1) {
              segments.push({
                s: shapeData.totalShapeLength * (shapeS - 1),
                e: shapeData.totalShapeLength * (shapeE - 1)
              });
            } else {
              segments.push({
                s: shapeData.totalShapeLength * shapeS,
                e: shapeData.totalShapeLength
              });
              segments.push({
                s: 0,
                e: shapeData.totalShapeLength * (shapeE - 1)
              });
            }

            var newShapesData = this.addShapes(shapeData, segments[0]);

            if (segments[0].s !== segments[0].e) {
              if (segments.length > 1) {
                var lastShapeInCollection = shapeData.shape.paths.shapes[shapeData.shape.paths._length - 1];

                if (lastShapeInCollection.c) {
                  var lastShape = newShapesData.pop();
                  this.addPaths(newShapesData, localShapeCollection);
                  newShapesData = this.addShapes(shapeData, segments[1], lastShape);
                } else {
                  this.addPaths(newShapesData, localShapeCollection);
                  newShapesData = this.addShapes(shapeData, segments[1]);
                }
              }

              this.addPaths(newShapesData, localShapeCollection);
            }
          }

          shapeData.shape.paths = localShapeCollection;
        }
      }
    } else if (this._mdf) {
      for (i = 0; i < len; i += 1) {
        //Releasign Trim Cached paths data when no trim applied in case shapes are modified inbetween.
        //Don't remove this even if it's losing cached info.
        this.shapes[i].pathsData.length = 0;
        this.shapes[i].shape._mdf = true;
      }
    }
  };

  TrimModifier.prototype.addPaths = function (newPaths, localShapeCollection) {
    var i,
        len = newPaths.length;

    for (i = 0; i < len; i += 1) {
      localShapeCollection.addShape(newPaths[i]);
    }
  };

  TrimModifier.prototype.addSegment = function (pt1, pt2, pt3, pt4, shapePath, pos, newShape) {
    shapePath.setXYAt(pt2[0], pt2[1], 'o', pos);
    shapePath.setXYAt(pt3[0], pt3[1], 'i', pos + 1);

    if (newShape) {
      shapePath.setXYAt(pt1[0], pt1[1], 'v', pos);
    }

    shapePath.setXYAt(pt4[0], pt4[1], 'v', pos + 1);
  };

  TrimModifier.prototype.addSegmentFromArray = function (points, shapePath, pos, newShape) {
    shapePath.setXYAt(points[1], points[5], 'o', pos);
    shapePath.setXYAt(points[2], points[6], 'i', pos + 1);

    if (newShape) {
      shapePath.setXYAt(points[0], points[4], 'v', pos);
    }

    shapePath.setXYAt(points[3], points[7], 'v', pos + 1);
  };

  TrimModifier.prototype.addShapes = function (shapeData, shapeSegment, shapePath) {
    var pathsData = shapeData.pathsData;
    var shapePaths = shapeData.shape.paths.shapes;
    var i,
        len = shapeData.shape.paths._length,
        j,
        jLen;
    var addedLength = 0;
    var currentLengthData, segmentCount;
    var lengths;
    var segment;
    var shapes = [];
    var initPos;
    var newShape = true;

    if (!shapePath) {
      shapePath = shape_pool.newElement();
      segmentCount = 0;
      initPos = 0;
    } else {
      segmentCount = shapePath._length;
      initPos = shapePath._length;
    }

    shapes.push(shapePath);

    for (i = 0; i < len; i += 1) {
      lengths = pathsData[i].lengths;
      shapePath.c = shapePaths[i].c;
      jLen = shapePaths[i].c ? lengths.length : lengths.length + 1;

      for (j = 1; j < jLen; j += 1) {
        currentLengthData = lengths[j - 1];

        if (addedLength + currentLengthData.addedLength < shapeSegment.s) {
          addedLength += currentLengthData.addedLength;
          shapePath.c = false;
        } else if (addedLength > shapeSegment.e) {
          shapePath.c = false;
          break;
        } else {
          if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + currentLengthData.addedLength) {
            this.addSegment(shapePaths[i].v[j - 1], shapePaths[i].o[j - 1], shapePaths[i].i[j], shapePaths[i].v[j], shapePath, segmentCount, newShape);
            newShape = false;
          } else {
            segment = bez.getNewSegment(shapePaths[i].v[j - 1], shapePaths[i].v[j], shapePaths[i].o[j - 1], shapePaths[i].i[j], (shapeSegment.s - addedLength) / currentLengthData.addedLength, (shapeSegment.e - addedLength) / currentLengthData.addedLength, lengths[j - 1]);
            this.addSegmentFromArray(segment, shapePath, segmentCount, newShape); // this.addSegment(segment.pt1, segment.pt3, segment.pt4, segment.pt2, shapePath, segmentCount, newShape);

            newShape = false;
            shapePath.c = false;
          }

          addedLength += currentLengthData.addedLength;
          segmentCount += 1;
        }
      }

      if (shapePaths[i].c && lengths.length) {
        currentLengthData = lengths[j - 1];

        if (addedLength <= shapeSegment.e) {
          var segmentLength = lengths[j - 1].addedLength;

          if (shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + segmentLength) {
            this.addSegment(shapePaths[i].v[j - 1], shapePaths[i].o[j - 1], shapePaths[i].i[0], shapePaths[i].v[0], shapePath, segmentCount, newShape);
            newShape = false;
          } else {
            segment = bez.getNewSegment(shapePaths[i].v[j - 1], shapePaths[i].v[0], shapePaths[i].o[j - 1], shapePaths[i].i[0], (shapeSegment.s - addedLength) / segmentLength, (shapeSegment.e - addedLength) / segmentLength, lengths[j - 1]);
            this.addSegmentFromArray(segment, shapePath, segmentCount, newShape); // this.addSegment(segment.pt1, segment.pt3, segment.pt4, segment.pt2, shapePath, segmentCount, newShape);

            newShape = false;
            shapePath.c = false;
          }
        } else {
          shapePath.c = false;
        }

        addedLength += currentLengthData.addedLength;
        segmentCount += 1;
      }

      if (shapePath._length) {
        shapePath.setXYAt(shapePath.v[initPos][0], shapePath.v[initPos][1], 'i', initPos);
        shapePath.setXYAt(shapePath.v[shapePath._length - 1][0], shapePath.v[shapePath._length - 1][1], 'o', shapePath._length - 1);
      }

      if (addedLength > shapeSegment.e) {
        break;
      }

      if (i < len - 1) {
        shapePath = shape_pool.newElement();
        newShape = true;
        shapes.push(shapePath);
        segmentCount = 0;
      }
    }

    return shapes;
  };

  ShapeModifiers.registerModifier('tm', TrimModifier);

  function RoundCornersModifier() {}

  extendPrototype([ShapeModifier], RoundCornersModifier);

  RoundCornersModifier.prototype.initModifierProperties = function (elem, data) {
    this.getValue = this.processKeys;
    this.rd = PropertyFactory.getProp(elem, data.r, 0, null, this);
    this._isAnimated = !!this.rd.effectsSequence.length;
  };

  RoundCornersModifier.prototype.processPath = function (path, round) {
    var cloned_path = shape_pool.newElement();
    cloned_path.c = path.c;
    var i,
        len = path._length;
    var currentV,
        currentI,
        currentO,
        closerV,
        newV,
        newO,
        newI,
        distance,
        newPosPerc,
        index = 0;
    var vX, vY, oX, oY, iX, iY;

    for (i = 0; i < len; i += 1) {
      currentV = path.v[i];
      currentO = path.o[i];
      currentI = path.i[i];

      if (currentV[0] === currentO[0] && currentV[1] === currentO[1] && currentV[0] === currentI[0] && currentV[1] === currentI[1]) {
        if ((i === 0 || i === len - 1) && !path.c) {
          cloned_path.setTripleAt(currentV[0], currentV[1], currentO[0], currentO[1], currentI[0], currentI[1], index);
          /*cloned_path.v[index] = currentV;
          cloned_path.o[index] = currentO;
          cloned_path.i[index] = currentI;*/

          index += 1;
        } else {
          if (i === 0) {
            closerV = path.v[len - 1];
          } else {
            closerV = path.v[i - 1];
          }

          distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
          newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
          vX = iX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
          vY = iY = currentV[1] - (currentV[1] - closerV[1]) * newPosPerc;
          oX = vX - (vX - currentV[0]) * roundCorner;
          oY = vY - (vY - currentV[1]) * roundCorner;
          cloned_path.setTripleAt(vX, vY, oX, oY, iX, iY, index);
          index += 1;

          if (i === len - 1) {
            closerV = path.v[0];
          } else {
            closerV = path.v[i + 1];
          }

          distance = Math.sqrt(Math.pow(currentV[0] - closerV[0], 2) + Math.pow(currentV[1] - closerV[1], 2));
          newPosPerc = distance ? Math.min(distance / 2, round) / distance : 0;
          vX = oX = currentV[0] + (closerV[0] - currentV[0]) * newPosPerc;
          vY = oY = currentV[1] + (closerV[1] - currentV[1]) * newPosPerc;
          iX = vX - (vX - currentV[0]) * roundCorner;
          iY = vY - (vY - currentV[1]) * roundCorner;
          cloned_path.setTripleAt(vX, vY, oX, oY, iX, iY, index);
          index += 1;
        }
      } else {
        cloned_path.setTripleAt(path.v[i][0], path.v[i][1], path.o[i][0], path.o[i][1], path.i[i][0], path.i[i][1], index);
        index += 1;
      }
    }

    return cloned_path;
  };

  RoundCornersModifier.prototype.processShapes = function (_isFirstFrame) {
    var shapePaths;
    var i,
        len = this.shapes.length;
    var j, jLen;
    var rd = this.rd.v;

    if (rd !== 0) {
      var shapeData, newPaths, localShapeCollection;

      for (i = 0; i < len; i += 1) {
        shapeData = this.shapes[i];
        newPaths = shapeData.shape.paths;
        localShapeCollection = shapeData.localShapeCollection;

        if (!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)) {
          localShapeCollection.releaseShapes();
          shapeData.shape._mdf = true;
          shapePaths = shapeData.shape.paths.shapes;
          jLen = shapeData.shape.paths._length;

          for (j = 0; j < jLen; j += 1) {
            localShapeCollection.addShape(this.processPath(shapePaths[j], rd));
          }
        }

        shapeData.shape.paths = shapeData.localShapeCollection;
      }
    }

    if (!this.dynamicProperties.length) {
      this._mdf = false;
    }
  };

  ShapeModifiers.registerModifier('rd', RoundCornersModifier);

  function RepeaterModifier() {}

  extendPrototype([ShapeModifier], RepeaterModifier);

  RepeaterModifier.prototype.initModifierProperties = function (elem, data) {
    this.getValue = this.processKeys;
    this.c = PropertyFactory.getProp(elem, data.c, 0, null, this);
    this.o = PropertyFactory.getProp(elem, data.o, 0, null, this);
    this.tr = TransformPropertyFactory.getTransformProperty(elem, data.tr, this);
    this.so = PropertyFactory.getProp(elem, data.tr.so, 0, 0.01, this);
    this.eo = PropertyFactory.getProp(elem, data.tr.eo, 0, 0.01, this);
    this.data = data;

    if (!this.dynamicProperties.length) {
      this.getValue(true);
    }

    this._isAnimated = !!this.dynamicProperties.length;
    this.pMatrix = new Matrix();
    this.rMatrix = new Matrix();
    this.sMatrix = new Matrix();
    this.tMatrix = new Matrix();
    this.matrix = new Matrix();
  };

  RepeaterModifier.prototype.applyTransforms = function (pMatrix, rMatrix, sMatrix, transform, perc, inv) {
    var dir = inv ? -1 : 1;
    var scaleX = transform.s.v[0] + (1 - transform.s.v[0]) * (1 - perc);
    var scaleY = transform.s.v[1] + (1 - transform.s.v[1]) * (1 - perc);
    pMatrix.translate(transform.p.v[0] * dir * perc, transform.p.v[1] * dir * perc, transform.p.v[2]);
    rMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
    rMatrix.rotate(-transform.r.v * dir * perc);
    rMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
    sMatrix.translate(-transform.a.v[0], -transform.a.v[1], transform.a.v[2]);
    sMatrix.scale(inv ? 1 / scaleX : scaleX, inv ? 1 / scaleY : scaleY);
    sMatrix.translate(transform.a.v[0], transform.a.v[1], transform.a.v[2]);
  };

  RepeaterModifier.prototype.init = function (elem, arr, pos, elemsData) {
    this.elem = elem;
    this.arr = arr;
    this.pos = pos;
    this.elemsData = elemsData;
    this._currentCopies = 0;
    this._elements = [];
    this._groups = [];
    this.frameId = -1;
    this.initDynamicPropertyContainer(elem);
    this.initModifierProperties(elem, arr[pos]);
    var cont = 0;

    while (pos > 0) {
      pos -= 1; //this._elements.unshift(arr.splice(pos,1)[0]);

      this._elements.unshift(arr[pos]);

      cont += 1;
    }

    if (this.dynamicProperties.length) {
      this.k = true;
    } else {
      this.getValue(true);
    }
  };

  RepeaterModifier.prototype.resetElements = function (elements) {
    var i,
        len = elements.length;

    for (i = 0; i < len; i += 1) {
      elements[i]._processed = false;

      if (elements[i].ty === 'gr') {
        this.resetElements(elements[i].it);
      }
    }
  };

  RepeaterModifier.prototype.cloneElements = function (elements) {
    var i,
        len = elements.length;
    var newElements = JSON.parse(JSON.stringify(elements));
    this.resetElements(newElements);
    return newElements;
  };

  RepeaterModifier.prototype.changeGroupRender = function (elements, renderFlag) {
    var i,
        len = elements.length;

    for (i = 0; i < len; i += 1) {
      elements[i]._render = renderFlag;

      if (elements[i].ty === 'gr') {
        this.changeGroupRender(elements[i].it, renderFlag);
      }
    }
  };

  RepeaterModifier.prototype.processShapes = function (_isFirstFrame) {
    var items, itemsTransform, i, dir, cont;

    if (this._mdf || _isFirstFrame) {
      var copies = Math.ceil(this.c.v);

      if (this._groups.length < copies) {
        while (this._groups.length < copies) {
          var group = {
            it: this.cloneElements(this._elements),
            ty: 'gr'
          };
          group.it.push({
            "a": {
              "a": 0,
              "ix": 1,
              "k": [0, 0]
            },
            "nm": "Transform",
            "o": {
              "a": 0,
              "ix": 7,
              "k": 100
            },
            "p": {
              "a": 0,
              "ix": 2,
              "k": [0, 0]
            },
            "r": {
              "a": 1,
              "ix": 6,
              "k": [{
                s: 0,
                e: 0,
                t: 0
              }, {
                s: 0,
                e: 0,
                t: 1
              }]
            },
            "s": {
              "a": 0,
              "ix": 3,
              "k": [100, 100]
            },
            "sa": {
              "a": 0,
              "ix": 5,
              "k": 0
            },
            "sk": {
              "a": 0,
              "ix": 4,
              "k": 0
            },
            "ty": "tr"
          });
          this.arr.splice(0, 0, group);

          this._groups.splice(0, 0, group);

          this._currentCopies += 1;
        }

        this.elem.reloadShapes();
      }

      cont = 0;
      var renderFlag;

      for (i = 0; i <= this._groups.length - 1; i += 1) {
        renderFlag = cont < copies;
        this._groups[i]._render = renderFlag;
        this.changeGroupRender(this._groups[i].it, renderFlag);
        cont += 1;
      }

      this._currentCopies = copies; ////

      var offset = this.o.v;
      var offsetModulo = offset % 1;
      var roundOffset = offset > 0 ? Math.floor(offset) : Math.ceil(offset);
      var k;
      var tMat = this.tr.v.props;
      var pProps = this.pMatrix.props;
      var rProps = this.rMatrix.props;
      var sProps = this.sMatrix.props;
      this.pMatrix.reset();
      this.rMatrix.reset();
      this.sMatrix.reset();
      this.tMatrix.reset();
      this.matrix.reset();
      var iteration = 0;

      if (offset > 0) {
        while (iteration < roundOffset) {
          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false);
          iteration += 1;
        }

        if (offsetModulo) {
          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, offsetModulo, false);
          iteration += offsetModulo;
        }
      } else if (offset < 0) {
        while (iteration > roundOffset) {
          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, true);
          iteration -= 1;
        }

        if (offsetModulo) {
          this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, -offsetModulo, true);
          iteration -= offsetModulo;
        }
      }

      i = this.data.m === 1 ? 0 : this._currentCopies - 1;
      dir = this.data.m === 1 ? 1 : -1;
      cont = this._currentCopies;
      var j, jLen;

      while (cont) {
        items = this.elemsData[i].it;
        itemsTransform = items[items.length - 1].transform.mProps.v.props;
        jLen = itemsTransform.length;
        items[items.length - 1].transform.mProps._mdf = true;
        items[items.length - 1].transform.op._mdf = true;
        items[items.length - 1].transform.op.v = this.so.v + (this.eo.v - this.so.v) * (i / (this._currentCopies - 1));

        if (iteration !== 0) {
          if (i !== 0 && dir === 1 || i !== this._currentCopies - 1 && dir === -1) {
            this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, false);
          }

          this.matrix.transform(rProps[0], rProps[1], rProps[2], rProps[3], rProps[4], rProps[5], rProps[6], rProps[7], rProps[8], rProps[9], rProps[10], rProps[11], rProps[12], rProps[13], rProps[14], rProps[15]);
          this.matrix.transform(sProps[0], sProps[1], sProps[2], sProps[3], sProps[4], sProps[5], sProps[6], sProps[7], sProps[8], sProps[9], sProps[10], sProps[11], sProps[12], sProps[13], sProps[14], sProps[15]);
          this.matrix.transform(pProps[0], pProps[1], pProps[2], pProps[3], pProps[4], pProps[5], pProps[6], pProps[7], pProps[8], pProps[9], pProps[10], pProps[11], pProps[12], pProps[13], pProps[14], pProps[15]);

          for (j = 0; j < jLen; j += 1) {
            itemsTransform[j] = this.matrix.props[j];
          }

          this.matrix.reset();
        } else {
          this.matrix.reset();

          for (j = 0; j < jLen; j += 1) {
            itemsTransform[j] = this.matrix.props[j];
          }
        }

        iteration += 1;
        cont -= 1;
        i += dir;
      }
    } else {
      cont = this._currentCopies;
      i = 0;
      dir = 1;

      while (cont) {
        items = this.elemsData[i].it;
        itemsTransform = items[items.length - 1].transform.mProps.v.props;
        items[items.length - 1].transform.mProps._mdf = false;
        items[items.length - 1].transform.op._mdf = false;
        cont -= 1;
        i += dir;
      }
    }
  };

  RepeaterModifier.prototype.addShape = function () {};

  ShapeModifiers.registerModifier('rp', RepeaterModifier);

  function ShapeCollection() {
    this._length = 0;
    this._maxLength = 4;
    this.shapes = createSizedArray(this._maxLength);
  }

  ShapeCollection.prototype.addShape = function (shapeData) {
    if (this._length === this._maxLength) {
      this.shapes = this.shapes.concat(createSizedArray(this._maxLength));
      this._maxLength *= 2;
    }

    this.shapes[this._length] = shapeData;
    this._length += 1;
  };

  ShapeCollection.prototype.releaseShapes = function () {
    var i;

    for (i = 0; i < this._length; i += 1) {
      shape_pool.release(this.shapes[i]);
    }

    this._length = 0;
  };

  function DashProperty(elem, data, renderer, container) {
    this.elem = elem;
    this.frameId = -1;
    this.dataProps = createSizedArray(data.length);
    this.renderer = renderer;
    this.k = false;
    this.dashStr = '';
    this.dashArray = createTypedArray('float32', data.length ? data.length - 1 : 0);
    this.dashoffset = createTypedArray('float32', 1);
    this.initDynamicPropertyContainer(container);
    var i,
        len = data.length || 0,
        prop;

    for (i = 0; i < len; i += 1) {
      prop = PropertyFactory.getProp(elem, data[i].v, 0, 0, this);
      this.k = prop.k || this.k;
      this.dataProps[i] = {
        n: data[i].n,
        p: prop
      };
    }

    if (!this.k) {
      this.getValue(true);
    }

    this._isAnimated = this.k;
  }

  DashProperty.prototype.getValue = function (forceRender) {
    if (this.elem.globalData.frameId === this.frameId && !forceRender) {
      return;
    }

    this.frameId = this.elem.globalData.frameId;
    this.iterateDynamicProperties();
    this._mdf = this._mdf || forceRender;

    if (this._mdf) {
      var i = 0,
          len = this.dataProps.length;

      if (this.renderer === 'svg') {
        this.dashStr = '';
      }

      for (i = 0; i < len; i += 1) {
        if (this.dataProps[i].n != 'o') {
          if (this.renderer === 'svg') {
            this.dashStr += ' ' + this.dataProps[i].p.v;
          } else {
            this.dashArray[i] = this.dataProps[i].p.v;
          }
        } else {
          this.dashoffset[0] = this.dataProps[i].p.v;
        }
      }
    }
  };

  extendPrototype([DynamicPropertyContainer], DashProperty);

  function GradientProperty(elem, data, container) {
    this.data = data;
    this.c = createTypedArray('uint8c', data.p * 4);
    var cLength = data.k.k[0].s ? data.k.k[0].s.length - data.p * 4 : data.k.k.length - data.p * 4;
    this.o = createTypedArray('float32', cLength);
    this._cmdf = false;
    this._omdf = false;
    this._collapsable = this.checkCollapsable();
    this._hasOpacity = cLength;
    this.initDynamicPropertyContainer(container);
    this.prop = PropertyFactory.getProp(elem, data.k, 1, null, this);
    this.k = this.prop.k;
    this.getValue(true);
  }

  GradientProperty.prototype.comparePoints = function (values, points) {
    var i = 0,
        len = this.o.length / 2,
        diff;

    while (i < len) {
      diff = Math.abs(values[i * 4] - values[points * 4 + i * 2]);

      if (diff > 0.01) {
        return false;
      }

      i += 1;
    }

    return true;
  };

  GradientProperty.prototype.checkCollapsable = function () {
    if (this.o.length / 2 !== this.c.length / 4) {
      return false;
    }

    if (this.data.k.k[0].s) {
      var i = 0,
          len = this.data.k.k.length;

      while (i < len) {
        if (!this.comparePoints(this.data.k.k[i].s, this.data.p)) {
          return false;
        }

        i += 1;
      }
    } else if (!this.comparePoints(this.data.k.k, this.data.p)) {
      return false;
    }

    return true;
  };

  GradientProperty.prototype.getValue = function (forceRender) {
    this.prop.getValue();
    this._mdf = false;
    this._cmdf = false;
    this._omdf = false;

    if (this.prop._mdf || forceRender) {
      var i,
          len = this.data.p * 4;
      var mult, val;

      for (i = 0; i < len; i += 1) {
        mult = i % 4 === 0 ? 100 : 255;
        val = Math.round(this.prop.v[i] * mult);

        if (this.c[i] !== val) {
          this.c[i] = val;
          this._cmdf = !forceRender;
        }
      }

      if (this.o.length) {
        len = this.prop.v.length;

        for (i = this.data.p * 4; i < len; i += 1) {
          mult = i % 2 === 0 ? 100 : 1;
          val = i % 2 === 0 ? Math.round(this.prop.v[i] * 100) : this.prop.v[i];

          if (this.o[i - this.data.p * 4] !== val) {
            this.o[i - this.data.p * 4] = val;
            this._omdf = !forceRender;
          }
        }
      }

      this._mdf = !forceRender;
    }
  };

  extendPrototype([DynamicPropertyContainer], GradientProperty);

  var buildShapeString = function (pathNodes, length, closed, mat) {
    if (length === 0) {
      return '';
    }

    var _o = pathNodes.o;
    var _i = pathNodes.i;
    var _v = pathNodes.v;
    var i,
        shapeString = " M" + mat.applyToPointStringified(_v[0][0], _v[0][1]);

    for (i = 1; i < length; i += 1) {
      shapeString += " C" + mat.applyToPointStringified(_o[i - 1][0], _o[i - 1][1]) + " " + mat.applyToPointStringified(_i[i][0], _i[i][1]) + " " + mat.applyToPointStringified(_v[i][0], _v[i][1]);
    }

    if (closed && length) {
      shapeString += " C" + mat.applyToPointStringified(_o[i - 1][0], _o[i - 1][1]) + " " + mat.applyToPointStringified(_i[0][0], _i[0][1]) + " " + mat.applyToPointStringified(_v[0][0], _v[0][1]);
      shapeString += 'z';
    }

    return shapeString;
  };

  var onlyCanvas;

  var ImagePreloader = function () {
    var createOnlyFakeImg = function () {
      if (!onlyCanvas) {
        onlyCanvas = createTag("canvas");
        onlyCanvas.width = 1;
        onlyCanvas.height = 1;
        var ctx = onlyCanvas.getContext("2d");
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, 1, 1);
      }

      return onlyCanvas;
    };

    function imageLoaded() {
      this.loadedAssets += 1;

      if (this.loadedAssets === this.totalImages) {
        if (this.imagesLoadedCb) {
          this.imagesLoadedCb(null);
        }
      }
    }

    function getAssetsPath(assetData, assetsPath, original_path) {
      var path = "";

      if (assetData.e) {
        path = assetData.p;
      } else if (assetsPath) {
        var imagePath = assetData.p;

        if (imagePath.indexOf("images/") !== -1) {
          imagePath = imagePath.split("/")[1];
        }

        path = assetsPath + imagePath;
      } else {
        path = original_path;
        path += assetData.u ? assetData.u : "";
        path += assetData.p;
      }

      return path;
    }

    function createImageData(assetData) {
      var path = getAssetsPath(assetData, this.assetsPath, this.path);
      var img = createTag("img");
      img.src = path;
      var ob = {
        img: img,
        assetData: assetData
      };
      return ob;
    }

    function loadAssets(assets, cb) {
      this.imagesLoadedCb = cb;

      for (var i = 0; i < assets.length; i++) {
        if (!assets[i].layers) {
          this.totalImages += 1;
        }
      }

      for (var i = 0; i < assets.length; i++) {
        if (!assets[i].layers) {
          var obj = this._createImageData(assets[i]);

          this.images.push(obj);

          this._imageLoaded();
        }
      }
    }

    function setPath(path) {
      this.path = path || "";
    }

    function setAssetsPath(path) {
      this.assetsPath = path || "";
    }

    function getImage(assetData) {
      var i = 0,
          len = this.images.length;

      while (i < len) {
        if (this.images[i].assetData === assetData) {
          return this.images[i].img;
        }

        i += 1;
      }
    }

    function destroy() {
      this.imagesLoadedCb = null;
      this.images.length = 0;
    }

    function loaded() {
      return this.totalImages === this.loadedAssets;
    }

    return function ImagePreloader() {
      this.loadAssets = loadAssets;
      this.setAssetsPath = setAssetsPath;
      this.setPath = setPath;
      this.loaded = loaded;
      this.destroy = destroy;
      this.getImage = getImage;
      this._createImageData = createImageData;
      this._imageLoaded = imageLoaded;
      this.assetsPath = "";
      this.path = "";
      this.totalImages = 0;
      this.loadedAssets = 0;
      this.imagesLoadedCb = null;
      this.images = [];
    };
  }();

  var featureSupport = function () {
    var ob = {
      maskType: true
    };
    return ob;
  }();

  var filtersFactory = function () {
    var ob = {};
    ob.createFilter = createFilter;
    ob.createAlphaToLuminanceFilter = createAlphaToLuminanceFilter;

    function createFilter(filId) {
      var fil = createNS('filter');
      fil.setAttribute('id', filId);
      fil.setAttribute('filterUnits', 'objectBoundingBox');
      fil.setAttribute('x', '0%');
      fil.setAttribute('y', '0%');
      fil.setAttribute('width', '100%');
      fil.setAttribute('height', '100%');
      return fil;
    }

    function createAlphaToLuminanceFilter() {
      var feColorMatrix = createNS('feColorMatrix');
      feColorMatrix.setAttribute('type', 'matrix');
      feColorMatrix.setAttribute('color-interpolation-filters', 'sRGB');
      feColorMatrix.setAttribute('values', '0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1');
      return feColorMatrix;
    }

    return ob;
  }();

  var fs = __webpack_require__(2);

  var assetLoader = function () {
    function loadAsset(path, callback, errorCallback) {
      try {
        var data = fs.readFileSync(path, 'utf-8');
        const body = JSON.parse(data);
        callback(body);
      } catch (err) {
        errorCallback(err);
      }
    }

    return {
      load: loadAsset
    };
  }();

  function TextAnimatorProperty(textData, renderType, elem) {
    this._isFirstFrame = true;
    this._hasMaskedPath = false;
    this._frameId = -1;
    this._textData = textData;
    this._renderType = renderType;
    this._elem = elem;
    this._animatorsData = createSizedArray(this._textData.a.length);
    this._pathData = {};
    this._moreOptions = {
      alignment: {}
    };
    this.renderedLetters = [];
    this.lettersChangedFlag = false;
    this.initDynamicPropertyContainer(elem);
  }

  TextAnimatorProperty.prototype.searchProperties = function () {
    var i,
        len = this._textData.a.length,
        animatorProps;
    var getProp = PropertyFactory.getProp;

    for (i = 0; i < len; i += 1) {
      animatorProps = this._textData.a[i];
      this._animatorsData[i] = new TextAnimatorDataProperty(this._elem, animatorProps, this);
    }

    if (this._textData.p && 'm' in this._textData.p) {
      this._pathData = {
        f: getProp(this._elem, this._textData.p.f, 0, 0, this),
        l: getProp(this._elem, this._textData.p.l, 0, 0, this),
        r: this._textData.p.r,
        m: this._elem.maskManager.getMaskProperty(this._textData.p.m)
      };
      this._hasMaskedPath = true;
    } else {
      this._hasMaskedPath = false;
    }

    this._moreOptions.alignment = getProp(this._elem, this._textData.m.a, 1, 0, this);
  };

  TextAnimatorProperty.prototype.getMeasures = function (documentData, lettersChangedFlag) {
    this.lettersChangedFlag = lettersChangedFlag;

    if (!this._mdf && !this._isFirstFrame && !lettersChangedFlag && (!this._hasMaskedPath || !this._pathData.m._mdf)) {
      return;
    }

    this._isFirstFrame = false;
    var alignment = this._moreOptions.alignment.v;
    var animators = this._animatorsData;
    var textData = this._textData;
    var matrixHelper = this.mHelper;
    var renderType = this._renderType;
    var renderedLettersCount = this.renderedLetters.length;
    var data = this.data;
    var xPos, yPos;
    var i, len;
    var letters = documentData.l,
        pathInfo,
        currentLength,
        currentPoint,
        segmentLength,
        flag,
        pointInd,
        segmentInd,
        prevPoint,
        points,
        segments,
        partialLength,
        totalLength,
        perc,
        tanAngle,
        mask;

    if (this._hasMaskedPath) {
      mask = this._pathData.m;

      if (!this._pathData.n || this._pathData._mdf) {
        var paths = mask.v;

        if (this._pathData.r) {
          paths = paths.reverse();
        } // TODO: release bezier data cached from previous pathInfo: this._pathData.pi


        pathInfo = {
          tLength: 0,
          segments: []
        };
        len = paths._length - 1;
        var bezierData;
        totalLength = 0;

        for (i = 0; i < len; i += 1) {
          bezierData = bez.buildBezierData(paths.v[i], paths.v[i + 1], [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]], [paths.i[i + 1][0] - paths.v[i + 1][0], paths.i[i + 1][1] - paths.v[i + 1][1]]);
          pathInfo.tLength += bezierData.segmentLength;
          pathInfo.segments.push(bezierData);
          totalLength += bezierData.segmentLength;
        }

        i = len;

        if (mask.v.c) {
          bezierData = bez.buildBezierData(paths.v[i], paths.v[0], [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]], [paths.i[0][0] - paths.v[0][0], paths.i[0][1] - paths.v[0][1]]);
          pathInfo.tLength += bezierData.segmentLength;
          pathInfo.segments.push(bezierData);
          totalLength += bezierData.segmentLength;
        }

        this._pathData.pi = pathInfo;
      }

      pathInfo = this._pathData.pi;
      currentLength = this._pathData.f.v;
      segmentInd = 0;
      pointInd = 1;
      segmentLength = 0;
      flag = true;
      segments = pathInfo.segments;

      if (currentLength < 0 && mask.v.c) {
        if (pathInfo.tLength < Math.abs(currentLength)) {
          currentLength = -Math.abs(currentLength) % pathInfo.tLength;
        }

        segmentInd = segments.length - 1;
        points = segments[segmentInd].points;
        pointInd = points.length - 1;

        while (currentLength < 0) {
          currentLength += points[pointInd].partialLength;
          pointInd -= 1;

          if (pointInd < 0) {
            segmentInd -= 1;
            points = segments[segmentInd].points;
            pointInd = points.length - 1;
          }
        }
      }

      points = segments[segmentInd].points;
      prevPoint = points[pointInd - 1];
      currentPoint = points[pointInd];
      partialLength = currentPoint.partialLength;
    }

    len = letters.length;
    xPos = 0;
    yPos = 0;
    var yOff = documentData.finalSize * 1.2 * 0.714;
    var firstLine = true;
    var animatorProps, animatorSelector;
    var j, jLen;
    var letterValue;
    jLen = animators.length;
    var lastLetter;
    var mult,
        ind = -1,
        offf,
        xPathPos,
        yPathPos;
    var initPathPos = currentLength,
        initSegmentInd = segmentInd,
        initPointInd = pointInd,
        currentLine = -1;
    var elemOpacity;
    var sc, sw, fc, k;
    var lineLength = 0;
    var letterSw,
        letterSc,
        letterFc,
        letterM = '',
        letterP = this.defaultPropsArray,
        letterO; //

    if (documentData.j === 2 || documentData.j === 1) {
      var animatorJustifyOffset = 0;
      var animatorFirstCharOffset = 0;
      var justifyOffsetMult = documentData.j === 2 ? -0.5 : -1;
      var lastIndex = 0;
      var isNewLine = true;

      for (i = 0; i < len; i += 1) {
        if (letters[i].n) {
          if (animatorJustifyOffset) {
            animatorJustifyOffset += animatorFirstCharOffset;
          }

          while (lastIndex < i) {
            letters[lastIndex].animatorJustifyOffset = animatorJustifyOffset;
            lastIndex += 1;
          }

          animatorJustifyOffset = 0;
          isNewLine = true;
        } else {
          for (j = 0; j < jLen; j += 1) {
            animatorProps = animators[j].a;

            if (animatorProps.t.propType) {
              if (isNewLine && documentData.j === 2) {
                animatorFirstCharOffset += animatorProps.t.v * justifyOffsetMult;
              }

              animatorSelector = animators[j].s;
              mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);

              if (mult.length) {
                animatorJustifyOffset += animatorProps.t.v * mult[0] * justifyOffsetMult;
              } else {
                animatorJustifyOffset += animatorProps.t.v * mult * justifyOffsetMult;
              }
            }
          }

          isNewLine = false;
        }
      }

      if (animatorJustifyOffset) {
        animatorJustifyOffset += animatorFirstCharOffset;
      }

      while (lastIndex < i) {
        letters[lastIndex].animatorJustifyOffset = animatorJustifyOffset;
        lastIndex += 1;
      }
    } //


    for (i = 0; i < len; i += 1) {
      matrixHelper.reset();
      elemOpacity = 1;

      if (letters[i].n) {
        xPos = 0;
        yPos += documentData.yOffset;
        yPos += firstLine ? 1 : 0;
        currentLength = initPathPos;
        firstLine = false;
        lineLength = 0;

        if (this._hasMaskedPath) {
          segmentInd = initSegmentInd;
          pointInd = initPointInd;
          points = segments[segmentInd].points;
          prevPoint = points[pointInd - 1];
          currentPoint = points[pointInd];
          partialLength = currentPoint.partialLength;
          segmentLength = 0;
        }

        letterO = letterSw = letterFc = letterM = '';
        letterP = this.defaultPropsArray;
      } else {
        if (this._hasMaskedPath) {
          if (currentLine !== letters[i].line) {
            switch (documentData.j) {
              case 1:
                currentLength += totalLength - documentData.lineWidths[letters[i].line];
                break;

              case 2:
                currentLength += (totalLength - documentData.lineWidths[letters[i].line]) / 2;
                break;
            }

            currentLine = letters[i].line;
          }

          if (ind !== letters[i].ind) {
            if (letters[ind]) {
              currentLength += letters[ind].extra;
            }

            currentLength += letters[i].an / 2;
            ind = letters[i].ind;
          }

          currentLength += alignment[0] * letters[i].an / 200;
          var animatorOffset = 0;

          for (j = 0; j < jLen; j += 1) {
            animatorProps = animators[j].a;

            if (animatorProps.p.propType) {
              animatorSelector = animators[j].s;
              mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);

              if (mult.length) {
                animatorOffset += animatorProps.p.v[0] * mult[0];
              } else {
                animatorOffset += animatorProps.p.v[0] * mult;
              }
            }

            if (animatorProps.a.propType) {
              animatorSelector = animators[j].s;
              mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);

              if (mult.length) {
                animatorOffset += animatorProps.a.v[0] * mult[0];
              } else {
                animatorOffset += animatorProps.a.v[0] * mult;
              }
            }
          }

          flag = true;

          while (flag) {
            if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
              perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
              xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
              yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
              matrixHelper.translate(-alignment[0] * letters[i].an / 200, -(alignment[1] * yOff / 100));
              flag = false;
            } else if (points) {
              segmentLength += currentPoint.partialLength;
              pointInd += 1;

              if (pointInd >= points.length) {
                pointInd = 0;
                segmentInd += 1;

                if (!segments[segmentInd]) {
                  if (mask.v.c) {
                    pointInd = 0;
                    segmentInd = 0;
                    points = segments[segmentInd].points;
                  } else {
                    segmentLength -= currentPoint.partialLength;
                    points = null;
                  }
                } else {
                  points = segments[segmentInd].points;
                }
              }

              if (points) {
                prevPoint = currentPoint;
                currentPoint = points[pointInd];
                partialLength = currentPoint.partialLength;
              }
            }
          }

          offf = letters[i].an / 2 - letters[i].add;
          matrixHelper.translate(-offf, 0, 0);
        } else {
          offf = letters[i].an / 2 - letters[i].add;
          matrixHelper.translate(-offf, 0, 0); // Grouping alignment

          matrixHelper.translate(-alignment[0] * letters[i].an / 200, -alignment[1] * yOff / 100, 0);
        }

        lineLength += letters[i].l / 2;

        for (j = 0; j < jLen; j += 1) {
          animatorProps = animators[j].a;

          if (animatorProps.t.propType) {
            animatorSelector = animators[j].s;
            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars); //This condition is to prevent applying tracking to first character in each line. Might be better to use a boolean "isNewLine"

            if (xPos !== 0 || documentData.j !== 0) {
              if (this._hasMaskedPath) {
                if (mult.length) {
                  currentLength += animatorProps.t.v * mult[0];
                } else {
                  currentLength += animatorProps.t.v * mult;
                }
              } else {
                if (mult.length) {
                  xPos += animatorProps.t.v * mult[0];
                } else {
                  xPos += animatorProps.t.v * mult;
                }
              }
            }
          }
        }

        lineLength += letters[i].l / 2;

        if (documentData.strokeWidthAnim) {
          sw = documentData.sw || 0;
        }

        if (documentData.strokeColorAnim) {
          if (documentData.sc) {
            sc = [documentData.sc[0], documentData.sc[1], documentData.sc[2]];
          } else {
            sc = [0, 0, 0];
          }
        }

        if (documentData.fillColorAnim && documentData.fc) {
          fc = [documentData.fc[0], documentData.fc[1], documentData.fc[2]];
        }

        for (j = 0; j < jLen; j += 1) {
          animatorProps = animators[j].a;

          if (animatorProps.a.propType) {
            animatorSelector = animators[j].s;
            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);

            if (mult.length) {
              matrixHelper.translate(-animatorProps.a.v[0] * mult[0], -animatorProps.a.v[1] * mult[1], animatorProps.a.v[2] * mult[2]);
            } else {
              matrixHelper.translate(-animatorProps.a.v[0] * mult, -animatorProps.a.v[1] * mult, animatorProps.a.v[2] * mult);
            }
          }
        }

        for (j = 0; j < jLen; j += 1) {
          animatorProps = animators[j].a;

          if (animatorProps.s.propType) {
            animatorSelector = animators[j].s;
            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);

            if (mult.length) {
              matrixHelper.scale(1 + (animatorProps.s.v[0] - 1) * mult[0], 1 + (animatorProps.s.v[1] - 1) * mult[1], 1);
            } else {
              matrixHelper.scale(1 + (animatorProps.s.v[0] - 1) * mult, 1 + (animatorProps.s.v[1] - 1) * mult, 1);
            }
          }
        }

        for (j = 0; j < jLen; j += 1) {
          animatorProps = animators[j].a;
          animatorSelector = animators[j].s;
          mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);

          if (animatorProps.sk.propType) {
            if (mult.length) {
              matrixHelper.skewFromAxis(-animatorProps.sk.v * mult[0], animatorProps.sa.v * mult[1]);
            } else {
              matrixHelper.skewFromAxis(-animatorProps.sk.v * mult, animatorProps.sa.v * mult);
            }
          }

          if (animatorProps.r.propType) {
            if (mult.length) {
              matrixHelper.rotateZ(-animatorProps.r.v * mult[2]);
            } else {
              matrixHelper.rotateZ(-animatorProps.r.v * mult);
            }
          }

          if (animatorProps.ry.propType) {
            if (mult.length) {
              matrixHelper.rotateY(animatorProps.ry.v * mult[1]);
            } else {
              matrixHelper.rotateY(animatorProps.ry.v * mult);
            }
          }

          if (animatorProps.rx.propType) {
            if (mult.length) {
              matrixHelper.rotateX(animatorProps.rx.v * mult[0]);
            } else {
              matrixHelper.rotateX(animatorProps.rx.v * mult);
            }
          }

          if (animatorProps.o.propType) {
            if (mult.length) {
              elemOpacity += (animatorProps.o.v * mult[0] - elemOpacity) * mult[0];
            } else {
              elemOpacity += (animatorProps.o.v * mult - elemOpacity) * mult;
            }
          }

          if (documentData.strokeWidthAnim && animatorProps.sw.propType) {
            if (mult.length) {
              sw += animatorProps.sw.v * mult[0];
            } else {
              sw += animatorProps.sw.v * mult;
            }
          }

          if (documentData.strokeColorAnim && animatorProps.sc.propType) {
            for (k = 0; k < 3; k += 1) {
              if (mult.length) {
                sc[k] = sc[k] + (animatorProps.sc.v[k] - sc[k]) * mult[0];
              } else {
                sc[k] = sc[k] + (animatorProps.sc.v[k] - sc[k]) * mult;
              }
            }
          }

          if (documentData.fillColorAnim && documentData.fc) {
            if (animatorProps.fc.propType) {
              for (k = 0; k < 3; k += 1) {
                if (mult.length) {
                  fc[k] = fc[k] + (animatorProps.fc.v[k] - fc[k]) * mult[0];
                } else {
                  fc[k] = fc[k] + (animatorProps.fc.v[k] - fc[k]) * mult;
                }
              }
            }

            if (animatorProps.fh.propType) {
              if (mult.length) {
                fc = addHueToRGB(fc, animatorProps.fh.v * mult[0]);
              } else {
                fc = addHueToRGB(fc, animatorProps.fh.v * mult);
              }
            }

            if (animatorProps.fs.propType) {
              if (mult.length) {
                fc = addSaturationToRGB(fc, animatorProps.fs.v * mult[0]);
              } else {
                fc = addSaturationToRGB(fc, animatorProps.fs.v * mult);
              }
            }

            if (animatorProps.fb.propType) {
              if (mult.length) {
                fc = addBrightnessToRGB(fc, animatorProps.fb.v * mult[0]);
              } else {
                fc = addBrightnessToRGB(fc, animatorProps.fb.v * mult);
              }
            }
          }
        }

        for (j = 0; j < jLen; j += 1) {
          animatorProps = animators[j].a;

          if (animatorProps.p.propType) {
            animatorSelector = animators[j].s;
            mult = animatorSelector.getMult(letters[i].anIndexes[j], textData.a[j].s.totalChars);

            if (this._hasMaskedPath) {
              if (mult.length) {
                matrixHelper.translate(0, animatorProps.p.v[1] * mult[0], -animatorProps.p.v[2] * mult[1]);
              } else {
                matrixHelper.translate(0, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
              }
            } else {
              if (mult.length) {
                matrixHelper.translate(animatorProps.p.v[0] * mult[0], animatorProps.p.v[1] * mult[1], -animatorProps.p.v[2] * mult[2]);
              } else {
                matrixHelper.translate(animatorProps.p.v[0] * mult, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
              }
            }
          }
        }

        if (documentData.strokeWidthAnim) {
          letterSw = sw < 0 ? 0 : sw;
        }

        if (documentData.strokeColorAnim) {
          letterSc = 'rgb(' + Math.round(sc[0] * 255) + ',' + Math.round(sc[1] * 255) + ',' + Math.round(sc[2] * 255) + ')';
        }

        if (documentData.fillColorAnim && documentData.fc) {
          letterFc = 'rgb(' + Math.round(fc[0] * 255) + ',' + Math.round(fc[1] * 255) + ',' + Math.round(fc[2] * 255) + ')';
        }

        if (this._hasMaskedPath) {
          matrixHelper.translate(0, -documentData.ls);
          matrixHelper.translate(0, alignment[1] * yOff / 100 + yPos, 0);

          if (textData.p.p) {
            tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
            var rot = Math.atan(tanAngle) * 180 / Math.PI;

            if (currentPoint.point[0] < prevPoint.point[0]) {
              rot += 180;
            }

            matrixHelper.rotate(-rot * Math.PI / 180);
          }

          matrixHelper.translate(xPathPos, yPathPos, 0);
          currentLength -= alignment[0] * letters[i].an / 200;

          if (letters[i + 1] && ind !== letters[i + 1].ind) {
            currentLength += letters[i].an / 2;
            currentLength += documentData.tr / 1000 * documentData.finalSize;
          }
        } else {
          matrixHelper.translate(xPos, yPos, 0);

          if (documentData.ps) {
            //matrixHelper.translate(documentData.ps[0],documentData.ps[1],0);
            matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
          }

          switch (documentData.j) {
            case 1:
              matrixHelper.translate(letters[i].animatorJustifyOffset + documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line]), 0, 0);
              break;

            case 2:
              matrixHelper.translate(letters[i].animatorJustifyOffset + documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line]) / 2, 0, 0);
              break;
          }

          matrixHelper.translate(0, -documentData.ls);
          matrixHelper.translate(offf, 0, 0);
          matrixHelper.translate(alignment[0] * letters[i].an / 200, alignment[1] * yOff / 100, 0);
          xPos += letters[i].l + documentData.tr / 1000 * documentData.finalSize;
        }

        if (renderType === 'html') {
          letterM = matrixHelper.toCSS();
        } else if (renderType === 'svg') {
          letterM = matrixHelper.to2dCSS();
        } else {
          letterP = [matrixHelper.props[0], matrixHelper.props[1], matrixHelper.props[2], matrixHelper.props[3], matrixHelper.props[4], matrixHelper.props[5], matrixHelper.props[6], matrixHelper.props[7], matrixHelper.props[8], matrixHelper.props[9], matrixHelper.props[10], matrixHelper.props[11], matrixHelper.props[12], matrixHelper.props[13], matrixHelper.props[14], matrixHelper.props[15]];
        }

        letterO = elemOpacity;
      }

      if (renderedLettersCount <= i) {
        letterValue = new LetterProps(letterO, letterSw, letterSc, letterFc, letterM, letterP);
        this.renderedLetters.push(letterValue);
        renderedLettersCount += 1;
        this.lettersChangedFlag = true;
      } else {
        letterValue = this.renderedLetters[i];
        this.lettersChangedFlag = letterValue.update(letterO, letterSw, letterSc, letterFc, letterM, letterP) || this.lettersChangedFlag;
      }
    }
  };

  TextAnimatorProperty.prototype.getValue = function () {
    if (this._elem.globalData.frameId === this._frameId) {
      return;
    }

    this._frameId = this._elem.globalData.frameId;
    this.iterateDynamicProperties();
  };

  TextAnimatorProperty.prototype.mHelper = new Matrix();
  TextAnimatorProperty.prototype.defaultPropsArray = [];
  extendPrototype([DynamicPropertyContainer], TextAnimatorProperty);

  function TextAnimatorDataProperty(elem, animatorProps, container) {
    var defaultData = {
      propType: false
    };
    var getProp = PropertyFactory.getProp;
    var textAnimator_animatables = animatorProps.a;
    this.a = {
      r: textAnimator_animatables.r ? getProp(elem, textAnimator_animatables.r, 0, degToRads, container) : defaultData,
      rx: textAnimator_animatables.rx ? getProp(elem, textAnimator_animatables.rx, 0, degToRads, container) : defaultData,
      ry: textAnimator_animatables.ry ? getProp(elem, textAnimator_animatables.ry, 0, degToRads, container) : defaultData,
      sk: textAnimator_animatables.sk ? getProp(elem, textAnimator_animatables.sk, 0, degToRads, container) : defaultData,
      sa: textAnimator_animatables.sa ? getProp(elem, textAnimator_animatables.sa, 0, degToRads, container) : defaultData,
      s: textAnimator_animatables.s ? getProp(elem, textAnimator_animatables.s, 1, 0.01, container) : defaultData,
      a: textAnimator_animatables.a ? getProp(elem, textAnimator_animatables.a, 1, 0, container) : defaultData,
      o: textAnimator_animatables.o ? getProp(elem, textAnimator_animatables.o, 0, 0.01, container) : defaultData,
      p: textAnimator_animatables.p ? getProp(elem, textAnimator_animatables.p, 1, 0, container) : defaultData,
      sw: textAnimator_animatables.sw ? getProp(elem, textAnimator_animatables.sw, 0, 0, container) : defaultData,
      sc: textAnimator_animatables.sc ? getProp(elem, textAnimator_animatables.sc, 1, 0, container) : defaultData,
      fc: textAnimator_animatables.fc ? getProp(elem, textAnimator_animatables.fc, 1, 0, container) : defaultData,
      fh: textAnimator_animatables.fh ? getProp(elem, textAnimator_animatables.fh, 0, 0, container) : defaultData,
      fs: textAnimator_animatables.fs ? getProp(elem, textAnimator_animatables.fs, 0, 0.01, container) : defaultData,
      fb: textAnimator_animatables.fb ? getProp(elem, textAnimator_animatables.fb, 0, 0.01, container) : defaultData,
      t: textAnimator_animatables.t ? getProp(elem, textAnimator_animatables.t, 0, 0, container) : defaultData
    };
    this.s = TextSelectorProp.getTextSelectorProp(elem, animatorProps.s, container);
    this.s.t = animatorProps.s.t;
  }

  function LetterProps(o, sw, sc, fc, m, p) {
    this.o = o;
    this.sw = sw;
    this.sc = sc;
    this.fc = fc;
    this.m = m;
    this.p = p;
    this._mdf = {
      o: true,
      sw: !!sw,
      sc: !!sc,
      fc: !!fc,
      m: true,
      p: true
    };
  }

  LetterProps.prototype.update = function (o, sw, sc, fc, m, p) {
    this._mdf.o = false;
    this._mdf.sw = false;
    this._mdf.sc = false;
    this._mdf.fc = false;
    this._mdf.m = false;
    this._mdf.p = false;
    var updated = false;

    if (this.o !== o) {
      this.o = o;
      this._mdf.o = true;
      updated = true;
    }

    if (this.sw !== sw) {
      this.sw = sw;
      this._mdf.sw = true;
      updated = true;
    }

    if (this.sc !== sc) {
      this.sc = sc;
      this._mdf.sc = true;
      updated = true;
    }

    if (this.fc !== fc) {
      this.fc = fc;
      this._mdf.fc = true;
      updated = true;
    }

    if (this.m !== m) {
      this.m = m;
      this._mdf.m = true;
      updated = true;
    }

    if (p.length && (this.p[0] !== p[0] || this.p[1] !== p[1] || this.p[4] !== p[4] || this.p[5] !== p[5] || this.p[12] !== p[12] || this.p[13] !== p[13])) {
      this.p = p;
      this._mdf.p = true;
      updated = true;
    }

    return updated;
  };

  function TextProperty(elem, data) {
    this._frameId = initialDefaultFrame;
    this.pv = '';
    this.v = '';
    this.kf = false;
    this._isFirstFrame = true;
    this._mdf = false;
    this.data = data;
    this.elem = elem;
    this.comp = this.elem.comp;
    this.keysIndex = 0;
    this.canResize = false;
    this.minimumFontSize = 1;
    this.effectsSequence = [];
    this.currentData = {
      ascent: 0,
      boxWidth: this.defaultBoxWidth,
      f: '',
      fStyle: '',
      fWeight: '',
      fc: '',
      j: '',
      justifyOffset: '',
      l: [],
      lh: 0,
      lineWidths: [],
      ls: '',
      of: '',
      s: '',
      sc: '',
      sw: 0,
      t: 0,
      tr: 0,
      sz: 0,
      ps: null,
      fillColorAnim: false,
      strokeColorAnim: false,
      strokeWidthAnim: false,
      yOffset: 0,
      finalSize: 0,
      finalText: [],
      finalLineHeight: 0,
      __complete: false
    };
    this.copyData(this.currentData, this.data.d.k[0].s);

    if (!this.searchProperty()) {
      this.completeTextData(this.currentData);
    }
  }

  TextProperty.prototype.defaultBoxWidth = [0, 0];

  TextProperty.prototype.copyData = function (obj, data) {
    for (var s in data) {
      if (data.hasOwnProperty(s)) {
        obj[s] = data[s];
      }
    }

    return obj;
  };

  TextProperty.prototype.setCurrentData = function (data) {
    if (!data.__complete) {
      this.completeTextData(data);
    }

    this.currentData = data;
    this.currentData.boxWidth = this.currentData.boxWidth || this.defaultBoxWidth;
    this._mdf = true;
  };

  TextProperty.prototype.searchProperty = function () {
    return this.searchKeyframes();
  };

  TextProperty.prototype.searchKeyframes = function () {
    this.kf = this.data.d.k.length > 1;

    if (this.kf) {
      this.addEffect(this.getKeyframeValue.bind(this));
    }

    return this.kf;
  };

  TextProperty.prototype.addEffect = function (effectFunction) {
    this.effectsSequence.push(effectFunction);
    this.elem.addDynamicProperty(this);
  };

  TextProperty.prototype.getValue = function (_finalValue) {
    if ((this.elem.globalData.frameId === this.frameId || !this.effectsSequence.length) && !_finalValue) {
      return;
    }

    this.currentData.t = this.data.d.k[this.keysIndex].s.t;
    var currentValue = this.currentData;
    var currentIndex = this.keysIndex;

    if (this.lock) {
      this.setCurrentData(this.currentData);
      return;
    }

    this.lock = true;
    this._mdf = false;
    var multipliedValue;
    var i,
        len = this.effectsSequence.length;
    var finalValue = _finalValue || this.data.d.k[this.keysIndex].s;

    for (i = 0; i < len; i += 1) {
      //Checking if index changed to prevent creating a new object every time the expression updates.
      if (currentIndex !== this.keysIndex) {
        finalValue = this.effectsSequence[i](finalValue, finalValue.t);
      } else {
        finalValue = this.effectsSequence[i](this.currentData, finalValue.t);
      }
    }

    if (currentValue !== finalValue) {
      this.setCurrentData(finalValue);
    }

    this.pv = this.v = this.currentData;
    this.lock = false;
    this.frameId = this.elem.globalData.frameId;
  };

  TextProperty.prototype.getKeyframeValue = function () {
    var textKeys = this.data.d.k,
        textDocumentData;
    var frameNum = this.elem.comp.renderedFrame;
    var i = 0,
        len = textKeys.length;

    while (i <= len - 1) {
      textDocumentData = textKeys[i].s;

      if (i === len - 1 || textKeys[i + 1].t > frameNum) {
        break;
      }

      i += 1;
    }

    if (this.keysIndex !== i) {
      this.keysIndex = i;
    }

    return this.data.d.k[this.keysIndex].s;
  };

  TextProperty.prototype.buildFinalText = function (text) {
    var combinedCharacters = FontManager.getCombinedCharacterCodes();
    var charactersArray = [];
    var i = 0,
        len = text.length;
    var charCode;

    while (i < len) {
      charCode = text.charCodeAt(i);

      if (combinedCharacters.indexOf(charCode) !== -1) {
        charactersArray[charactersArray.length - 1] += text.charAt(i);
      } else {
        if (charCode >= 0xd800 && charCode <= 0xdbff) {
          charCode = text.charCodeAt(i + 1);

          if (charCode >= 0xdc00 && charCode <= 0xdfff) {
            charactersArray.push(text.substr(i, 2));
            ++i;
          } else {
            charactersArray.push(text.charAt(i));
          }
        } else {
          charactersArray.push(text.charAt(i));
        }
      }

      i += 1;
    }

    return charactersArray;
  };

  TextProperty.prototype.completeTextData = function (documentData) {
    documentData.__complete = true;
    var fontManager = this.elem.globalData.fontManager;
    var data = this.data;
    var letters = [];
    var i, len;
    var newLineFlag,
        index = 0,
        val;
    var anchorGrouping = data.m.g;
    var currentSize = 0,
        currentPos = 0,
        currentLine = 0,
        lineWidths = [];
    var lineWidth = 0;
    var maxLineWidth = 0;
    var j, jLen;
    var fontData = fontManager.getFontByName(documentData.f);
    var charData,
        cLength = 0;
    var styles = fontData.fStyle ? fontData.fStyle.split(' ') : [];
    var fWeight = 'normal',
        fStyle = 'normal';
    len = styles.length;
    var styleName;

    for (i = 0; i < len; i += 1) {
      styleName = styles[i].toLowerCase();

      switch (styleName) {
        case 'italic':
          fStyle = 'italic';
          break;

        case 'bold':
          fWeight = '700';
          break;

        case 'black':
          fWeight = '900';
          break;

        case 'medium':
          fWeight = '500';
          break;

        case 'regular':
        case 'normal':
          fWeight = '400';
          break;

        case 'light':
        case 'thin':
          fWeight = '200';
          break;
      }
    }

    documentData.fWeight = fontData.fWeight || fWeight;
    documentData.fStyle = fStyle;
    documentData.finalSize = documentData.s;
    documentData.finalText = this.buildFinalText(documentData.t);
    len = documentData.finalText.length;
    documentData.finalLineHeight = documentData.lh;
    var trackingOffset = documentData.tr / 1000 * documentData.finalSize;
    var charCode;

    if (documentData.sz) {
      var flag = true;
      var boxWidth = documentData.sz[0];
      var boxHeight = documentData.sz[1];
      var currentHeight, finalText;

      while (flag) {
        finalText = this.buildFinalText(documentData.t);
        currentHeight = 0;
        lineWidth = 0;
        len = finalText.length;
        trackingOffset = documentData.tr / 1000 * documentData.finalSize;
        var lastSpaceIndex = -1;

        for (i = 0; i < len; i += 1) {
          charCode = finalText[i].charCodeAt(0);
          newLineFlag = false;

          if (finalText[i] === ' ') {
            lastSpaceIndex = i;
          } else if (charCode === 13 || charCode === 3) {
            lineWidth = 0;
            newLineFlag = true;
            currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
          }

          if (fontManager.chars) {
            charData = fontManager.getCharData(finalText[i], fontData.fStyle, fontData.fFamily);
            cLength = newLineFlag ? 0 : charData.w * documentData.finalSize / 100;
          } else {
            //tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
            cLength = fontManager.measureText(finalText[i], documentData.f, documentData.finalSize);
          }

          if (lineWidth + cLength > boxWidth && finalText[i] !== ' ') {
            if (lastSpaceIndex === -1) {
              len += 1;
            } else {
              i = lastSpaceIndex;
            }

            currentHeight += documentData.finalLineHeight || documentData.finalSize * 1.2;
            finalText.splice(i, lastSpaceIndex === i ? 1 : 0, '\r'); //finalText = finalText.substr(0,i) + "\r" + finalText.substr(i === lastSpaceIndex ? i + 1 : i);

            lastSpaceIndex = -1;
            lineWidth = 0;
          } else {
            lineWidth += cLength;
            lineWidth += trackingOffset;
          }
        }

        currentHeight += fontData.ascent * documentData.finalSize / 100;

        if (this.canResize && documentData.finalSize > this.minimumFontSize && boxHeight < currentHeight) {
          documentData.finalSize -= 1;
          documentData.finalLineHeight = documentData.finalSize * documentData.lh / documentData.s;
        } else {
          documentData.finalText = finalText;
          len = documentData.finalText.length;
          flag = false;
        }
      }
    }

    lineWidth = -trackingOffset;
    cLength = 0;
    var uncollapsedSpaces = 0;
    var currentChar;

    for (i = 0; i < len; i += 1) {
      newLineFlag = false;
      currentChar = documentData.finalText[i];
      charCode = currentChar.charCodeAt(0);

      if (currentChar === ' ') {
        val = '\u00A0';
      } else if (charCode === 13 || charCode === 3) {
        uncollapsedSpaces = 0;
        lineWidths.push(lineWidth);
        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
        lineWidth = -2 * trackingOffset;
        val = '';
        newLineFlag = true;
        currentLine += 1;
      } else {
        val = documentData.finalText[i];
      }

      if (fontManager.chars) {
        charData = fontManager.getCharData(currentChar, fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
        cLength = newLineFlag ? 0 : charData.w * documentData.finalSize / 100;
      } else {
        //var charWidth = fontManager.measureText(val, documentData.f, documentData.finalSize);
        //tCanvasHelper.font = documentData.finalSize + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
        cLength = fontManager.measureText(val, documentData.f, documentData.finalSize);
      } //


      if (currentChar === ' ') {
        uncollapsedSpaces += cLength + trackingOffset;
      } else {
        lineWidth += cLength + trackingOffset + uncollapsedSpaces;
        uncollapsedSpaces = 0;
      }

      letters.push({
        l: cLength,
        an: cLength,
        add: currentSize,
        n: newLineFlag,
        anIndexes: [],
        val: val,
        line: currentLine,
        animatorJustifyOffset: 0
      });

      if (anchorGrouping == 2) {
        currentSize += cLength;

        if (val === '' || val === '\u00A0' || i === len - 1) {
          if (val === '' || val === '\u00A0') {
            currentSize -= cLength;
          }

          while (currentPos <= i) {
            letters[currentPos].an = currentSize;
            letters[currentPos].ind = index;
            letters[currentPos].extra = cLength;
            currentPos += 1;
          }

          index += 1;
          currentSize = 0;
        }
      } else if (anchorGrouping == 3) {
        currentSize += cLength;

        if (val === '' || i === len - 1) {
          if (val === '') {
            currentSize -= cLength;
          }

          while (currentPos <= i) {
            letters[currentPos].an = currentSize;
            letters[currentPos].ind = index;
            letters[currentPos].extra = cLength;
            currentPos += 1;
          }

          currentSize = 0;
          index += 1;
        }
      } else {
        letters[index].ind = index;
        letters[index].extra = 0;
        index += 1;
      }
    }

    documentData.l = letters;
    maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
    lineWidths.push(lineWidth);

    if (documentData.sz) {
      documentData.boxWidth = documentData.sz[0];
      documentData.justifyOffset = 0;
    } else {
      documentData.boxWidth = maxLineWidth;

      switch (documentData.j) {
        case 1:
          documentData.justifyOffset = -documentData.boxWidth;
          break;

        case 2:
          documentData.justifyOffset = -documentData.boxWidth / 2;
          break;

        default:
          documentData.justifyOffset = 0;
      }
    }

    documentData.lineWidths = lineWidths;
    var animators = data.a,
        animatorData,
        letterData;
    jLen = animators.length;
    var based,
        ind,
        indexes = [];

    for (j = 0; j < jLen; j += 1) {
      animatorData = animators[j];

      if (animatorData.a.sc) {
        documentData.strokeColorAnim = true;
      }

      if (animatorData.a.sw) {
        documentData.strokeWidthAnim = true;
      }

      if (animatorData.a.fc || animatorData.a.fh || animatorData.a.fs || animatorData.a.fb) {
        documentData.fillColorAnim = true;
      }

      ind = 0;
      based = animatorData.s.b;

      for (i = 0; i < len; i += 1) {
        letterData = letters[i];
        letterData.anIndexes[j] = ind;

        if (based == 1 && letterData.val !== '' || based == 2 && letterData.val !== '' && letterData.val !== '\u00A0' || based == 3 && (letterData.n || letterData.val == '\u00A0' || i == len - 1) || based == 4 && (letterData.n || i == len - 1)) {
          if (animatorData.s.rn === 1) {
            indexes.push(ind);
          }

          ind += 1;
        }
      }

      data.a[j].s.totalChars = ind;
      var currentInd = -1,
          newInd;

      if (animatorData.s.rn === 1) {
        for (i = 0; i < len; i += 1) {
          letterData = letters[i];

          if (currentInd != letterData.anIndexes[j]) {
            currentInd = letterData.anIndexes[j];
            newInd = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
          }

          letterData.anIndexes[j] = newInd;
        }
      }
    }

    documentData.yOffset = documentData.finalLineHeight || documentData.finalSize * 1.2;
    documentData.ls = documentData.ls || 0;
    documentData.ascent = fontData.ascent * documentData.finalSize / 100;
  };

  TextProperty.prototype.updateDocumentData = function (newData, index) {
    index = index === undefined ? this.keysIndex : index;
    var dData = this.copyData({}, this.data.d.k[index].s);
    dData = this.copyData(dData, newData);
    this.data.d.k[index].s = dData;
    this.recalculate(index);
    this.elem.addDynamicProperty(this);
  };

  TextProperty.prototype.recalculate = function (index) {
    var dData = this.data.d.k[index].s;
    dData.__complete = false;
    this.keysIndex = 0;
    this._isFirstFrame = true;
    this.getValue(dData);
  };

  TextProperty.prototype.canResizeFont = function (_canResize) {
    this.canResize = _canResize;
    this.recalculate(this.keysIndex);
    this.elem.addDynamicProperty(this);
  };

  TextProperty.prototype.setMinimumFontSize = function (_fontValue) {
    this.minimumFontSize = Math.floor(_fontValue) || 1;
    this.recalculate(this.keysIndex);
    this.elem.addDynamicProperty(this);
  };

  var TextSelectorProp = function () {
    var max = Math.max;
    var min = Math.min;
    var floor = Math.floor;

    function TextSelectorProp(elem, data) {
      this._currentTextLength = -1;
      this.k = false;
      this.data = data;
      this.elem = elem;
      this.comp = elem.comp;
      this.finalS = 0;
      this.finalE = 0;
      this.initDynamicPropertyContainer(elem);
      this.s = PropertyFactory.getProp(elem, data.s || {
        k: 0
      }, 0, 0, this);

      if ('e' in data) {
        this.e = PropertyFactory.getProp(elem, data.e, 0, 0, this);
      } else {
        this.e = {
          v: 100
        };
      }

      this.o = PropertyFactory.getProp(elem, data.o || {
        k: 0
      }, 0, 0, this);
      this.xe = PropertyFactory.getProp(elem, data.xe || {
        k: 0
      }, 0, 0, this);
      this.ne = PropertyFactory.getProp(elem, data.ne || {
        k: 0
      }, 0, 0, this);
      this.a = PropertyFactory.getProp(elem, data.a, 0, 0.01, this);

      if (!this.dynamicProperties.length) {
        this.getValue();
      }
    }

    TextSelectorProp.prototype = {
      getMult: function (ind) {
        if (this._currentTextLength !== this.elem.textProperty.currentData.l.length) {
          this.getValue();
        } //var easer = bez.getEasingCurve(this.ne.v/100,0,1-this.xe.v/100,1);


        var easer = BezierFactory.getBezierEasing(this.ne.v / 100, 0, 1 - this.xe.v / 100, 1).get;
        var mult = 0;
        var s = this.finalS;
        var e = this.finalE;
        var type = this.data.sh;

        if (type == 2) {
          if (e === s) {
            mult = ind >= e ? 1 : 0;
          } else {
            mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
          }

          mult = easer(mult);
        } else if (type == 3) {
          if (e === s) {
            mult = ind >= e ? 0 : 1;
          } else {
            mult = 1 - max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));
          }

          mult = easer(mult);
        } else if (type == 4) {
          if (e === s) {
            mult = 0;
          } else {
            mult = max(0, min(0.5 / (e - s) + (ind - s) / (e - s), 1));

            if (mult < 0.5) {
              mult *= 2;
            } else {
              mult = 1 - 2 * (mult - 0.5);
            }
          }

          mult = easer(mult);
        } else if (type == 5) {
          if (e === s) {
            mult = 0;
          } else {
            var tot = e - s;
            /*ind += 0.5;
            mult = -4/(tot*tot)*(ind*ind)+(4/tot)*ind;*/

            ind = min(max(0, ind + 0.5 - s), e - s);
            var x = -tot / 2 + ind;
            var a = tot / 2;
            mult = Math.sqrt(1 - x * x / (a * a));
          }

          mult = easer(mult);
        } else if (type == 6) {
          if (e === s) {
            mult = 0;
          } else {
            ind = min(max(0, ind + 0.5 - s), e - s);
            mult = (1 + Math.cos(Math.PI + Math.PI * 2 * ind / (e - s))) / 2;
            /*
             ind = Math.min(Math.max(s,ind),e-1);
             mult = (1+(Math.cos((Math.PI+Math.PI*2*(ind-s)/(e-1-s)))))/2;
             mult = Math.max(mult,(1/(e-1-s))/(e-1-s));*/
          }

          mult = easer(mult);
        } else {
          if (ind >= floor(s)) {
            if (ind - s < 0) {
              mult = 1 - (s - ind);
            } else {
              mult = max(0, min(e - ind, 1));
            }
          }

          mult = easer(mult);
        }

        return mult * this.a.v;
      },
      getValue: function (newCharsFlag) {
        this.iterateDynamicProperties();
        this._mdf = newCharsFlag || this._mdf;
        this._currentTextLength = this.elem.textProperty.currentData.l.length || 0;

        if (newCharsFlag && this.data.r === 2) {
          this.e.v = this._currentTextLength;
        }

        var divisor = this.data.r === 2 ? 1 : 100 / this.data.totalChars;
        var o = this.o.v / divisor;
        var s = this.s.v / divisor + o;
        var e = this.e.v / divisor + o;

        if (s > e) {
          var _s = s;
          s = e;
          e = _s;
        }

        this.finalS = s;
        this.finalE = e;
      }
    };
    extendPrototype([DynamicPropertyContainer], TextSelectorProp);

    function getTextSelectorProp(elem, data, arr) {
      return new TextSelectorProp(elem, data, arr);
    }

    return {
      getTextSelectorProp: getTextSelectorProp
    };
  }();

  var pool_factory = function () {
    return function (initialLength, _create, _release, _clone) {
      var _length = 0;
      var _maxLength = initialLength;
      var pool = createSizedArray(_maxLength);
      var ob = {
        newElement: newElement,
        release: release
      };

      function newElement() {
        var element;

        if (_length) {
          _length -= 1;
          element = pool[_length];
        } else {
          element = _create();
        }

        return element;
      }

      function release(element) {
        if (_length === _maxLength) {
          pool = pooling.double(pool);
          _maxLength = _maxLength * 2;
        }

        if (_release) {
          _release(element);
        }

        pool[_length] = element;
        _length += 1;
      }

      function clone() {
        var clonedElement = newElement();
        return _clone(clonedElement);
      }

      return ob;
    };
  }();

  var pooling = function () {
    function double(arr) {
      return arr.concat(createSizedArray(arr.length));
    }

    return {
      double: double
    };
  }();

  var point_pool = function () {
    function create() {
      return createTypedArray('float32', 2);
    }

    return pool_factory(8, create);
  }();

  var shape_pool = function () {
    function create() {
      return new ShapePath();
    }

    function release(shapePath) {
      var len = shapePath._length,
          i;

      for (i = 0; i < len; i += 1) {
        point_pool.release(shapePath.v[i]);
        point_pool.release(shapePath.i[i]);
        point_pool.release(shapePath.o[i]);
        shapePath.v[i] = null;
        shapePath.i[i] = null;
        shapePath.o[i] = null;
      }

      shapePath._length = 0;
      shapePath.c = false;
    }

    function clone(shape) {
      var cloned = factory.newElement();
      var i,
          len = shape._length === undefined ? shape.v.length : shape._length;
      cloned.setLength(len);
      cloned.c = shape.c;
      var pt;

      for (i = 0; i < len; i += 1) {
        cloned.setTripleAt(shape.v[i][0], shape.v[i][1], shape.o[i][0], shape.o[i][1], shape.i[i][0], shape.i[i][1], i);
      }

      return cloned;
    }

    var factory = pool_factory(4, create, release);
    factory.clone = clone;
    return factory;
  }();

  var shapeCollection_pool = function () {
    var ob = {
      newShapeCollection: newShapeCollection,
      release: release
    };
    var _length = 0;
    var _maxLength = 4;
    var pool = createSizedArray(_maxLength);

    function newShapeCollection() {
      var shapeCollection;

      if (_length) {
        _length -= 1;
        shapeCollection = pool[_length];
      } else {
        shapeCollection = new ShapeCollection();
      }

      return shapeCollection;
    }

    function release(shapeCollection) {
      var i,
          len = shapeCollection._length;

      for (i = 0; i < len; i += 1) {
        shape_pool.release(shapeCollection.shapes[i]);
      }

      shapeCollection._length = 0;

      if (_length === _maxLength) {
        pool = pooling.double(pool);
        _maxLength = _maxLength * 2;
      }

      pool[_length] = shapeCollection;
      _length += 1;
    }

    return ob;
  }();

  var segments_length_pool = function () {
    function create() {
      return {
        lengths: [],
        totalLength: 0
      };
    }

    function release(element) {
      var i,
          len = element.lengths.length;

      for (i = 0; i < len; i += 1) {
        bezier_length_pool.release(element.lengths[i]);
      }

      element.lengths.length = 0;
    }

    return pool_factory(8, create, release);
  }();

  var bezier_length_pool = function () {
    function create() {
      return {
        addedLength: 0,
        percents: createTypedArray('float32', defaultCurveSegments),
        lengths: createTypedArray('float32', defaultCurveSegments)
      };
    }

    return pool_factory(8, create);
  }();

  function BaseRenderer() {}

  BaseRenderer.prototype.checkLayers = function (num) {
    var i,
        len = this.layers.length,
        data;
    this.completeLayers = true;

    for (i = len - 1; i >= 0; i--) {
      if (!this.elements[i]) {
        data = this.layers[i];

        if (data.ip - data.st <= num - this.layers[i].st && data.op - data.st > num - this.layers[i].st) {
          this.buildItem(i);
        }
      }

      this.completeLayers = this.elements[i] ? this.completeLayers : false;
    }

    this.checkPendingElements();
  }; // 2: image，图片
  // 0: comp，合成图层
  // 1: solid;
  // 3: null;
  // 4: shape，形状图层
  // 5: text，文字


  BaseRenderer.prototype.createItem = function (layer) {
    switch (layer.ty) {
      case 2:
        return this.createImage(layer);

      case 0:
        return this.createComp(layer);

      case 1:
        return this.createSolid(layer);

      case 3:
        return this.createNull(layer);

      case 4:
        return this.createShape(layer);

      case 5:
        return this.createText(layer);

      case 13:
        return this.createCamera(layer);
    }

    return this.createNull(layer);
  };

  BaseRenderer.prototype.createCamera = function () {
    throw new Error("You're using a 3d camera. Try the html renderer.");
  };

  BaseRenderer.prototype.buildAllItems = function () {
    var i,
        len = this.layers.length;

    for (i = 0; i < len; i += 1) {
      this.buildItem(i);
    }

    this.checkPendingElements();
  };

  BaseRenderer.prototype.includeLayers = function (newLayers) {
    this.completeLayers = false;
    var i,
        len = newLayers.length;
    var j,
        jLen = this.layers.length;

    for (i = 0; i < len; i += 1) {
      j = 0;

      while (j < jLen) {
        if (this.layers[j].id == newLayers[i].id) {
          this.layers[j] = newLayers[i];
          break;
        }

        j += 1;
      }
    }
  };

  BaseRenderer.prototype.setProjectInterface = function (pInterface) {
    this.globalData.projectInterface = pInterface;
  };

  BaseRenderer.prototype.initItems = function () {
    if (!this.globalData.progressiveLoad) {
      this.buildAllItems();
    }
  };

  BaseRenderer.prototype.buildElementParenting = function (element, parentName, hierarchy) {
    var elements = this.elements;
    var layers = this.layers;
    var i = 0,
        len = layers.length;

    while (i < len) {
      if (layers[i].ind == parentName) {
        if (!elements[i] || elements[i] === true) {
          this.buildItem(i);
          this.addPendingElement(element);
        } else {
          hierarchy.push(elements[i]);
          elements[i].setAsParent();

          if (layers[i].parent !== undefined) {
            this.buildElementParenting(element, layers[i].parent, hierarchy);
          } else {
            element.setHierarchy(hierarchy);
          }
        }
      }

      i += 1;
    }
  };

  BaseRenderer.prototype.addPendingElement = function (element) {
    this.pendingElements.push(element);
  };

  BaseRenderer.prototype.searchExtraCompositions = function (assets) {
    var i,
        len = assets.length;

    for (i = 0; i < len; i += 1) {
      if (assets[i].xt) {
        var comp = this.createComp(assets[i]);
        comp.initExpressions();
        this.globalData.projectInterface.registerComposition(comp);
      }
    }
  };

  BaseRenderer.prototype.setupGlobalData = function (animData, fontsContainer) {
    this.globalData.fontManager = new FontManager();
    this.globalData.fontManager.addChars(animData.chars);
    this.globalData.fontManager.addFonts(animData.fonts, fontsContainer);
    this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
    this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
    this.globalData.imageLoader = this.animationItem.imagePreloader;
    this.globalData.frameId = 0;
    this.globalData.frameRate = animData.fr;
    this.globalData.nm = animData.nm;
    this.globalData.compSize = {
      w: animData.w,
      h: animData.h
    };
  };

  const util = __webpack_require__(3);

  function CanvasRenderer(animationItem, config) {
    this.animationItem = animationItem;
    this.renderConfig = {
      clearCanvas: config && config.clearCanvas !== undefined ? config.clearCanvas : true,
      context: config && config.context || null,
      progressiveLoad: config && config.progressiveLoad || false,
      preserveAspectRatio: config && config.preserveAspectRatio || 'xMidYMid meet',
      imagePreserveAspectRatio: config && config.imagePreserveAspectRatio || 'xMidYMid slice',
      className: config && config.className || ''
    };
    this.renderConfig.dpr = config && config.dpr || 1;

    if (this.animationItem.wrapper) {
      this.renderConfig.dpr = config && config.dpr || 1;
    }

    this.renderedFrame = -1;
    this.globalData = {
      frameNum: -1,
      _mdf: false,
      renderConfig: this.renderConfig,
      currentGlobalAlpha: -1
    };
    this.contextData = new CVContextData();
    this.elements = [];
    this.pendingElements = [];
    this.transformMat = new Matrix();
    this.completeLayers = false;
    this.rendererType = 'canvas';
  }

  extendPrototype([BaseRenderer], CanvasRenderer);

  CanvasRenderer.prototype.createShape = function (data) {
    return new CVShapeElement(data, this.globalData, this);
  };

  CanvasRenderer.prototype.createText = function (data) {
    return new CVTextElement(data, this.globalData, this);
  };

  CanvasRenderer.prototype.createImage = function (data) {
    return new CVImageElement(data, this.globalData, this);
  };

  CanvasRenderer.prototype.createComp = function (data) {
    return new CVCompElement(data, this.globalData, this);
  };

  CanvasRenderer.prototype.createSolid = function (data) {
    return new CVSolidElement(data, this.globalData, this);
  };

  CanvasRenderer.prototype.createNull = function (data) {
    return new NullElement(data, this.globalData, this);
  };

  CanvasRenderer.prototype.fixNodeZeroBug = function (val) {
    return val === 0 ? 0.001 : val;
  };

  CanvasRenderer.prototype.ctxTransform = function (props) {
    if (props[0] === 1 && props[1] === 0 && props[4] === 0 && props[5] === 1 && props[12] === 0 && props[13] === 0) {
      return;
    }

    if (!this.renderConfig.clearCanvas) {
      this.canvasContext.transform(props[0], props[1], props[4], props[5], props[12], props[13]);
      return;
    }

    this.transformMat.cloneFromProps(props);
    var cProps = this.contextData.cTr.props;
    this.transformMat.transform(cProps[0], cProps[1], cProps[2], cProps[3], cProps[4], cProps[5], cProps[6], cProps[7], cProps[8], cProps[9], cProps[10], cProps[11], cProps[12], cProps[13], cProps[14], cProps[15]);
    this.contextData.cTr.cloneFromProps(this.transformMat.props);
    var trProps = this.contextData.cTr.props;
    var a, b, c, d, e, f;
    a = trProps[0];
    b = trProps[1];
    c = trProps[4];
    d = trProps[5];
    e = trProps[12];
    f = trProps[13]; // fix node-canvas setTransform scale zero value bug

    a = this.fixNodeZeroBug(a);
    d = this.fixNodeZeroBug(d); //console.log(a, b, c, d, e, f);

    this.canvasContext.setTransform(a, b, c, d, e, f);
  };

  CanvasRenderer.prototype.ctxOpacity = function (op) {
    if (!this.renderConfig.clearCanvas) {
      this.canvasContext.globalAlpha *= op < 0 ? 0 : op;
      this.globalData.currentGlobalAlpha = this.contextData.cO;
      return;
    }

    this.contextData.cO *= op < 0 ? 0 : op;

    if (this.globalData.currentGlobalAlpha !== this.contextData.cO) {
      this.canvasContext.globalAlpha = this.contextData.cO;
      this.globalData.currentGlobalAlpha = this.contextData.cO;
    }
  };

  CanvasRenderer.prototype.reset = function () {
    if (!this.renderConfig.clearCanvas) {
      this.canvasContext.restore();
      return;
    }

    this.contextData.reset();
  };

  CanvasRenderer.prototype.save = function (actionFlag) {
    if (!this.renderConfig.clearCanvas) {
      this.canvasContext.save();
      return;
    }

    if (actionFlag) {
      this.canvasContext.save();
    }

    var props = this.contextData.cTr.props;

    if (this.contextData._length <= this.contextData.cArrPos) {
      this.contextData.duplicate();
    }

    var i,
        arr = this.contextData.saved[this.contextData.cArrPos];

    for (i = 0; i < 16; i += 1) {
      arr[i] = props[i];
    }

    this.contextData.savedOp[this.contextData.cArrPos] = this.contextData.cO;
    this.contextData.cArrPos += 1;
  };

  CanvasRenderer.prototype.restore = function (actionFlag) {
    if (!this.renderConfig.clearCanvas) {
      this.canvasContext.restore();
      return;
    }

    if (actionFlag) {
      this.canvasContext.restore();
      this.globalData.blendMode = 'source-over';
    }

    this.contextData.cArrPos -= 1;
    var popped = this.contextData.saved[this.contextData.cArrPos];
    var i,
        arr = this.contextData.cTr.props;

    for (i = 0; i < 16; i += 1) {
      arr[i] = popped[i];
    }

    this.canvasContext.setTransform(popped[0], popped[1], popped[4], popped[5], popped[12], popped[13]);
    popped = this.contextData.savedOp[this.contextData.cArrPos];
    this.contextData.cO = popped;

    if (this.globalData.currentGlobalAlpha !== popped) {
      this.canvasContext.globalAlpha = popped;
      this.globalData.currentGlobalAlpha = popped;
    }
  };

  CanvasRenderer.prototype.configAnimation = function (animData) {
    this.animationItem.container = this.animationItem.wrapper;
    this.canvasContext = this.animationItem.container.getContext('2d');
    this.data = animData;
    this.layers = animData.layers;
    this.transformCanvas = {
      w: animData.w,
      h: animData.h,
      sx: 0,
      sy: 0,
      tx: 0,
      ty: 0
    };
    this.setupGlobalData(animData, null);
    this.globalData.canvasContext = this.canvasContext;
    this.globalData.renderer = this;
    this.globalData.isDashed = false;
    this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
    this.globalData.transformCanvas = this.transformCanvas;
    this.elements = createSizedArray(animData.layers.length);
    this.updateContainerSize();
  };

  CanvasRenderer.prototype.updateContainerSize = function () {
    this.reset();
    var elementWidth, elementHeight;
    elementWidth = this.canvasContext.canvas.width * this.renderConfig.dpr;
    elementHeight = this.canvasContext.canvas.height * this.renderConfig.dpr;
    var elementRel, animationRel;

    if (this.renderConfig.preserveAspectRatio.indexOf('meet') !== -1 || this.renderConfig.preserveAspectRatio.indexOf('slice') !== -1) {
      var par = this.renderConfig.preserveAspectRatio.split(' ');
      var fillType = par[1] || 'meet';
      var pos = par[0] || 'xMidYMid';
      var xPos = pos.substr(0, 4);
      var yPos = pos.substr(4);
      elementRel = elementWidth / elementHeight;
      animationRel = this.transformCanvas.w / this.transformCanvas.h;

      if (animationRel > elementRel && fillType === 'meet' || animationRel < elementRel && fillType === 'slice') {
        this.transformCanvas.sx = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
        this.transformCanvas.sy = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
      } else {
        this.transformCanvas.sx = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
        this.transformCanvas.sy = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
      }

      if (xPos === 'xMid' && (animationRel < elementRel && fillType === 'meet' || animationRel > elementRel && fillType === 'slice')) {
        this.transformCanvas.tx = (elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h)) / 2 * this.renderConfig.dpr;
      } else if (xPos === 'xMax' && (animationRel < elementRel && fillType === 'meet' || animationRel > elementRel && fillType === 'slice')) {
        this.transformCanvas.tx = (elementWidth - this.transformCanvas.w * (elementHeight / this.transformCanvas.h)) * this.renderConfig.dpr;
      } else {
        this.transformCanvas.tx = 0;
      }

      if (yPos === 'YMid' && (animationRel > elementRel && fillType === 'meet' || animationRel < elementRel && fillType === 'slice')) {
        this.transformCanvas.ty = (elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w)) / 2 * this.renderConfig.dpr;
      } else if (yPos === 'YMax' && (animationRel > elementRel && fillType === 'meet' || animationRel < elementRel && fillType === 'slice')) {
        this.transformCanvas.ty = (elementHeight - this.transformCanvas.h * (elementWidth / this.transformCanvas.w)) * this.renderConfig.dpr;
      } else {
        this.transformCanvas.ty = 0;
      }
    } else if (this.renderConfig.preserveAspectRatio == 'none') {
      this.transformCanvas.sx = elementWidth / (this.transformCanvas.w / this.renderConfig.dpr);
      this.transformCanvas.sy = elementHeight / (this.transformCanvas.h / this.renderConfig.dpr);
      this.transformCanvas.tx = 0;
      this.transformCanvas.ty = 0;
    } else {
      this.transformCanvas.sx = this.renderConfig.dpr;
      this.transformCanvas.sy = this.renderConfig.dpr;
      this.transformCanvas.tx = 0;
      this.transformCanvas.ty = 0;
    }

    this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy, 0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1];
    this.ctxTransform(this.transformCanvas.props);
    this.canvasContext.beginPath();
    this.canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h);
    this.canvasContext.closePath();
    this.canvasContext.clip();
    this.renderFrame(this.renderedFrame, true);
  };

  CanvasRenderer.prototype.destroy = function () {
    if (this.renderConfig.clearCanvas) {
      this.animationItem.wrapper.innerHTML = '';
    }

    var i,
        len = this.layers ? this.layers.length : 0;

    for (i = len - 1; i >= 0; i -= 1) {
      if (this.elements[i]) {
        this.elements[i].destroy();
      }
    }

    this.elements.length = 0;
    this.globalData.canvasContext = null;
    this.animationItem.container = null;
    this.destroyed = true;
  };

  CanvasRenderer.prototype.drawRect = function () {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const color = this.canvasContext.fillStyle;
    this.canvasContext.fillStyle = randomColor;
    this.canvasContext.fillRect(0, 0, this.transformCanvas.w / 2, this.transformCanvas.h / 2);
  };

  CanvasRenderer.prototype.renderFrame = function (num, forceRender) {
    if (this.renderedFrame === num && this.renderConfig.clearCanvas === true && !forceRender || this.destroyed || num === -1) {
      //console.log("结束~");
      return;
    }

    this.renderedFrame = num;
    this.globalData.frameNum = num - this.animationItem._isFirstFrame;
    this.globalData.frameId += 1;
    this.globalData._mdf = !this.renderConfig.clearCanvas || forceRender;
    this.globalData.projectInterface.currentFrame = num;
    var i,
        len = this.layers.length;

    if (!this.completeLayers) {
      this.checkLayers(num);
    } //// 1. prepareFrame ////


    for (i = 0; i < len; i++) {
      if (this.completeLayers || this.elements[i]) {
        this.elements[i].prepareFrame(num - this.layers[i].st); // prepareRenderableFrame(frame) - checkLayerLimits - show/hide
        // prepareProperties(frame, this.isInRange) - dynamicProperties[i].getValue()
      }
    }

    if (this.globalData._mdf) {
      //// 2. clearRect ////
      if (this.renderConfig.clearCanvas === true) {
        this.canvasContext.clearRect(0, 0, this.transformCanvas.w, this.transformCanvas.h); //this.drawRect();
      } else {
        this.save();
      } //// 3. renderFrame ////


      for (i = len - 1; i >= 0; i -= 1) {
        if (this.completeLayers || this.elements[i]) {
          this.elements[i].renderFrame();
        }
      }

      if (this.renderConfig.clearCanvas !== true) {
        this.restore();
      }
    }
  };

  CanvasRenderer.prototype.buildItem = function (pos) {
    var elements = this.elements;

    if (elements[pos] || this.layers[pos].ty == 99) {
      return;
    }

    var element = this.createItem(this.layers[pos], this, this.globalData);
    elements[pos] = element;
    element.initExpressions();
  };

  CanvasRenderer.prototype.checkPendingElements = function () {
    while (this.pendingElements.length) {
      var element = this.pendingElements.pop();
      element.checkParenting();
    }
  };

  CanvasRenderer.prototype.hide = function () {
    this.animationItem.container.style.display = 'none';
  };

  CanvasRenderer.prototype.show = function () {
    this.animationItem.container.style.display = 'block';
  };
  /**
   * @file 
   * Handles AE's layer parenting property.
   *
   */


  function HierarchyElement() {}

  HierarchyElement.prototype = {
    /**
        * @function 
        * Initializes hierarchy properties
        *
        */
    initHierarchy: function () {
      //element's parent list
      this.hierarchy = []; //if element is parent of another layer _isParent will be true

      this._isParent = false;
      this.checkParenting();
    },

    /**
        * @function 
        * Sets layer's hierarchy.
        * @param {array} hierarch
        * layer's parent list
        *
        */
    setHierarchy: function (hierarchy) {
      this.hierarchy = hierarchy;
    },

    /**
        * @function 
        * Sets layer as parent.
        *
        */
    setAsParent: function () {
      this._isParent = true;
    },

    /**
        * @function 
        * Searches layer's parenting chain
        *
        */
    checkParenting: function () {
      if (this.data.parent !== undefined) {
        this.comp.buildElementParenting(this, this.data.parent, []);
      }
    }
  };

  function FrameElement() {}

  FrameElement.prototype = {
    initFrame: function () {
      // 渲染 inpoint 时设置为 true
      this._isFirstFrame = false; // 动画属性列表

      this.dynamicProperties = []; // 如果图层在当前刻度中已被修改，这将是 true

      this._mdf = false;
    },
    prepareProperties: function (num, isVisible) {
      var i,
          len = this.dynamicProperties.length;

      for (i = 0; i < len; i += 1) {
        if (isVisible || this._isParent && this.dynamicProperties[i].propType === 'transform') {
          this.dynamicProperties[i].getValue();

          if (this.dynamicProperties[i]._mdf) {
            this.globalData._mdf = true;
            this._mdf = true;
          }
        }
      }
    },
    addDynamicProperty: function (prop) {
      if (this.dynamicProperties.indexOf(prop) === -1) {
        this.dynamicProperties.push(prop);
      }
    }
  };

  function TransformElement() {}

  TransformElement.prototype = {
    initTransform: function () {
      this.finalTransform = {
        mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this, this.data.ks, this) : {
          o: 0
        },
        _matMdf: false,
        _opMdf: false,
        mat: new Matrix()
      };

      if (this.data.ao) {
        this.finalTransform.mProp.autoOriented = true;
      } //TODO: check TYPE 11: Guided elements


      if (this.data.ty !== 11) {//this.createElements();
      }
    },
    renderTransform: function () {
      this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this._isFirstFrame;
      this.finalTransform._matMdf = this.finalTransform.mProp._mdf || this._isFirstFrame;

      if (this.hierarchy) {
        var mat;
        var finalMat = this.finalTransform.mat;
        var i = 0,
            len = this.hierarchy.length; //Checking if any of the transformation matrices in the hierarchy chain has changed.

        if (!this.finalTransform._matMdf) {
          while (i < len) {
            if (this.hierarchy[i].finalTransform.mProp._mdf) {
              this.finalTransform._matMdf = true;
              break;
            }

            i += 1;
          }
        }

        if (this.finalTransform._matMdf) {
          mat = this.finalTransform.mProp.v.props;
          finalMat.cloneFromProps(mat);

          for (i = 0; i < len; i += 1) {
            mat = this.hierarchy[i].finalTransform.mProp.v.props;
            finalMat.transform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5], mat[6], mat[7], mat[8], mat[9], mat[10], mat[11], mat[12], mat[13], mat[14], mat[15]);
          }
        }
      }
    },
    globalToLocal: function (pt) {
      var transforms = [];
      transforms.push(this.finalTransform);
      var flag = true;
      var comp = this.comp;

      while (flag) {
        if (comp.finalTransform) {
          if (comp.data.hasMask) {
            transforms.splice(0, 0, comp.finalTransform);
          }

          comp = comp.comp;
        } else {
          flag = false;
        }
      }

      var i,
          len = transforms.length,
          ptNew;

      for (i = 0; i < len; i += 1) {
        ptNew = transforms[i].mat.applyToPointArray(0, 0, 0); //ptNew = transforms[i].mat.applyToPointArray(pt[0],pt[1],pt[2]);

        pt = [pt[0] - ptNew[0], pt[1] - ptNew[1], 0];
      }

      return pt;
    },
    mHelper: new Matrix()
  };

  function RenderableElement() {}

  RenderableElement.prototype = {
    initRenderable: function () {
      //layer's visibility related to inpoint and outpoint. Rename isVisible to isInRange
      this.isInRange = false; //layer's display state

      this.hidden = false; // If layer's transparency equals 0, it can be hidden

      this.isTransparent = false; //list of animated components

      this.renderableComponents = [];
    },
    addRenderableComponent: function (component) {
      if (this.renderableComponents.indexOf(component) === -1) {
        this.renderableComponents.push(component);
      }
    },
    removeRenderableComponent: function (component) {
      if (this.renderableComponents.indexOf(component) !== -1) {
        this.renderableComponents.splice(this.renderableComponents.indexOf(component), 1);
      }
    },
    prepareRenderableFrame: function (num) {
      this.checkLayerLimits(num);
    },
    checkTransparency: function () {
      if (this.finalTransform.mProp.o.v <= 0) {
        if (!this.isTransparent && this.globalData.renderConfig.hideOnTransparent) {
          this.isTransparent = true;
          this.hide();
        }
      } else if (this.isTransparent) {
        this.isTransparent = false;
        this.show();
      }
    },
    checkLayerLimits: function (num) {
      // ip-开始帧 | st-开始时间 | op-持续帧长
      // [a-num-b]
      if (this.data.ip - this.data.st <= num && this.data.op - this.data.st > num) {
        if (this.isInRange !== true) {
          this.globalData._mdf = true;
          this._mdf = true;
          this.isInRange = true;
          this.show();
        }
      } else {
        if (this.isInRange !== false) {
          this.globalData._mdf = true;
          this.isInRange = false;
          this.hide();
        }
      }
    },
    renderRenderable: function () {
      var i,
          len = this.renderableComponents.length;

      for (i = 0; i < len; i += 1) {
        this.renderableComponents[i].renderFrame(this._isFirstFrame);
      }
    },
    sourceRectAtTime: function () {
      return {
        top: 0,
        left: 0,
        width: 100,
        height: 100
      };
    },
    getLayerSize: function () {
      if (this.data.ty === 5) {
        return {
          w: this.data.textData.width,
          h: this.data.textData.height
        };
      } else {
        return {
          w: this.data.width,
          h: this.data.height
        };
      }
    }
  };

  function RenderableDOMElement() {}

  (function () {
    var _prototype = {
      initElement: function (data, globalData, comp) {
        this.initFrame();
        this.initBaseData(data, globalData, comp);
        this.initTransform(data, globalData, comp);
        this.initHierarchy();
        this.initRenderable();
        this.initRendererElement();
        this.createContainerElements();
        this.createRenderableComponents();
        this.createContent();
        this.hide();
      },
      hide: function () {
        if (!this.hidden && (!this.isInRange || this.isTransparent)) {
          var elem = this.baseElement || this.layerElement;
          elem.style.display = 'none';
          this.hidden = true;
        }
      },
      show: function () {
        if (this.isInRange && !this.isTransparent) {
          if (!this.data.hd) {
            var elem = this.baseElement || this.layerElement;
            elem.style.display = 'block';
          }

          this.hidden = false;
          this._isFirstFrame = true;
        }
      },
      renderFrame: function () {
        //If it is exported as hidden (data.hd === true) no need to render
        //If it is not visible no need to render
        if (this.data.hd || this.hidden) {
          return;
        }

        this.renderTransform();
        this.renderRenderable();
        this.renderElement();
        this.renderInnerContent();

        if (this._isFirstFrame) {
          this._isFirstFrame = false;
        }
      },
      renderInnerContent: function () {},
      prepareFrame: function (num) {
        this._mdf = false;
        this.prepareRenderableFrame(num);
        this.prepareProperties(num, this.isInRange);
        this.checkTransparency();
      },
      destroy: function () {
        this.innerElem = null;
        this.destroyBaseElement();
      }
    };
    extendPrototype([RenderableElement, createProxyFunction(_prototype)], RenderableDOMElement);
  })();

  function ProcessedElement(element, position) {
    this.elem = element;
    this.pos = position;
  }

  function SVGShapeData(transformers, level, shape) {
    this.caches = [];
    this.styles = [];
    this.transformers = transformers;
    this.lStr = '';
    this.sh = shape;
    this.lvl = level; //TODO find if there are some cases where _isAnimated can be false.
    // For now, since shapes add up with other shapes. They have to be calculated every time.
    // One way of finding out is checking if all styles associated to this shape depend only of this shape

    this._isAnimated = !!shape.k; // TODO: commenting this for now since all shapes are animated

    var i = 0,
        len = transformers.length;

    while (i < len) {
      if (transformers[i].mProps.dynamicProperties.length) {
        this._isAnimated = true;
        break;
      }

      i += 1;
    }
  }

  SVGShapeData.prototype.setAsAnimated = function () {
    this._isAnimated = true;
  };

  function ShapeGroupData() {
    this.it = [];
    this.prevViewData = [];
    this.gr = createNS('g');
  }

  function ShapeTransformManager() {
    this.sequences = {};
    this.sequenceList = [];
    this.transform_key_count = 0;
  }

  ShapeTransformManager.prototype = {
    addTransformSequence: function (transforms) {
      var i,
          len = transforms.length;
      var key = '_';

      for (i = 0; i < len; i += 1) {
        key += transforms[i].transform.key + '_';
      }

      var sequence = this.sequences[key];

      if (!sequence) {
        sequence = {
          transforms: [].concat(transforms),
          finalTransform: new Matrix(),
          _mdf: false
        };
        this.sequences[key] = sequence;
        this.sequenceList.push(sequence);
      }

      return sequence;
    },
    processSequence: function (sequence, isFirstFrame) {
      var i = 0,
          len = sequence.transforms.length,
          _mdf = isFirstFrame;

      while (i < len && !isFirstFrame) {
        if (sequence.transforms[i].transform.mProps._mdf) {
          _mdf = true;
          break;
        }

        i += 1;
      }

      if (_mdf) {
        var props;
        sequence.finalTransform.reset();

        for (i = len - 1; i >= 0; i -= 1) {
          props = sequence.transforms[i].transform.mProps.v.props;
          sequence.finalTransform.transform(props[0], props[1], props[2], props[3], props[4], props[5], props[6], props[7], props[8], props[9], props[10], props[11], props[12], props[13], props[14], props[15]);
        }
      }

      sequence._mdf = _mdf;
    },
    processSequences: function (isFirstFrame) {
      var i,
          len = this.sequenceList.length;

      for (i = 0; i < len; i += 1) {
        this.processSequence(this.sequenceList[i], isFirstFrame);
      }
    },
    getNewKey: function () {
      return '_' + this.transform_key_count++;
    }
  };

  function CVShapeData(element, data, styles, transformsManager) {
    this.styledShapes = [];
    this.tr = [0, 0, 0, 0, 0, 0];
    var ty = 4;

    if (data.ty == 'rc') {
      ty = 5;
    } else if (data.ty == 'el') {
      ty = 6;
    } else if (data.ty == 'sr') {
      ty = 7;
    }

    this.sh = ShapePropertyFactory.getShapeProp(element, data, ty, element);
    var i,
        len = styles.length,
        styledShape;

    for (i = 0; i < len; i += 1) {
      if (!styles[i].closed) {
        styledShape = {
          transforms: transformsManager.addTransformSequence(styles[i].transforms),
          trNodes: []
        };
        this.styledShapes.push(styledShape);
        styles[i].elements.push(styledShape);
      }
    }
  }

  CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated;

  function BaseElement() {}

  BaseElement.prototype = {
    checkMasks: function () {
      if (!this.data.hasMask) {
        return false;
      }

      var i = 0,
          len = this.data.masksProperties.length;

      while (i < len) {
        if (this.data.masksProperties[i].mode !== 'n' && this.data.masksProperties[i].cl !== false) {
          return true;
        }

        i += 1;
      }

      return false;
    },
    initExpressions: function () {
      this.layerInterface = LayerExpressionInterface(this);

      if (this.data.hasMask && this.maskManager) {
        this.layerInterface.registerMaskInterface(this.maskManager);
      }

      var effectsInterface = EffectsExpressionInterface.createEffectsInterface(this, this.layerInterface);
      this.layerInterface.registerEffectsInterface(effectsInterface);

      if (this.data.ty === 0 || this.data.xt) {
        this.compInterface = CompExpressionInterface(this);
      } else if (this.data.ty === 4) {
        this.layerInterface.shapeInterface = ShapeExpressionInterface(this.shapesData, this.itemsData, this.layerInterface);
        this.layerInterface.content = this.layerInterface.shapeInterface;
      } else if (this.data.ty === 5) {
        this.layerInterface.textInterface = TextExpressionInterface(this);
        this.layerInterface.text = this.layerInterface.textInterface;
      }
    },
    setBlendMode: function () {
      var blendModeValue = getBlendMode(this.data.bm);
      var elem = this.baseElement || this.layerElement;
      elem.style['mix-blend-mode'] = blendModeValue;
    },
    initBaseData: function (data, globalData, comp) {
      this.globalData = globalData;
      this.comp = comp;
      this.data = data;
      this.layerId = createElementID(); //Stretch factor for old animations missing this property.

      if (!this.data.sr) {
        this.data.sr = 1;
      } // effects manager


      this.effectsManager = new EffectsManager(this.data, this, this.dynamicProperties);
    },
    getType: function () {
      return this.type;
    },
    sourceRectAtTime: function () {}
  };

  function NullElement(data, globalData, comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initFrame();
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
  }

  NullElement.prototype.prepareFrame = function (num) {
    this.prepareProperties(num, true);
  };

  NullElement.prototype.renderFrame = function () {};

  NullElement.prototype.getBaseElement = function () {
    return null;
  };

  NullElement.prototype.destroy = function () {};

  NullElement.prototype.sourceRectAtTime = function () {};

  NullElement.prototype.hide = function () {};

  extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement], NullElement);

  function SVGBaseElement() {}

  SVGBaseElement.prototype = {
    initRendererElement: function () {
      this.layerElement = createNS('g');
    },
    createContainerElements: function () {
      this.matteElement = createNS('g');
      this.transformedElement = this.layerElement;
      this.maskedElement = this.layerElement;
      this._sizeChanged = false;
      var layerElementParent = null; //If this layer acts as a mask for the following layer

      var filId, fil, gg;

      if (this.data.td) {
        if (this.data.td == 3 || this.data.td == 1) {
          var masker = createNS('mask');
          masker.setAttribute('id', this.layerId);
          masker.setAttribute('mask-type', this.data.td == 3 ? 'luminance' : 'alpha');
          masker.appendChild(this.layerElement);
          layerElementParent = masker;
          this.globalData.defs.appendChild(masker); // This is only for IE and Edge when mask if of type alpha

          if (!featureSupport.maskType && this.data.td == 1) {
            masker.setAttribute('mask-type', 'luminance');
            filId = createElementID();
            fil = filtersFactory.createFilter(filId);
            this.globalData.defs.appendChild(fil);
            fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
            gg = createNS('g');
            gg.appendChild(this.layerElement);
            layerElementParent = gg;
            masker.appendChild(gg);
            gg.setAttribute('filter', 'url(' + locationHref + '#' + filId + ')');
          }
        } else if (this.data.td == 2) {
          var maskGroup = createNS('mask');
          maskGroup.setAttribute('id', this.layerId);
          maskGroup.setAttribute('mask-type', 'alpha');
          var maskGrouper = createNS('g');
          maskGroup.appendChild(maskGrouper);
          filId = createElementID();
          fil = filtersFactory.createFilter(filId); ////
          // This solution doesn't work on Android when meta tag with viewport attribute is set

          /*var feColorMatrix = createNS('feColorMatrix');
          feColorMatrix.setAttribute('type', 'matrix');
          feColorMatrix.setAttribute('color-interpolation-filters', 'sRGB');
          feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 -1 1');
          fil.appendChild(feColorMatrix);*/
          ////

          var feCTr = createNS('feComponentTransfer');
          feCTr.setAttribute('in', 'SourceGraphic');
          fil.appendChild(feCTr);
          var feFunc = createNS('feFuncA');
          feFunc.setAttribute('type', 'table');
          feFunc.setAttribute('tableValues', '1.0 0.0');
          feCTr.appendChild(feFunc); ////

          this.globalData.defs.appendChild(fil);
          var alphaRect = createNS('rect');
          alphaRect.setAttribute('width', this.comp.data.w);
          alphaRect.setAttribute('height', this.comp.data.h);
          alphaRect.setAttribute('x', '0');
          alphaRect.setAttribute('y', '0');
          alphaRect.setAttribute('fill', '#ffffff');
          alphaRect.setAttribute('opacity', '0');
          maskGrouper.setAttribute('filter', 'url(' + locationHref + '#' + filId + ')');
          maskGrouper.appendChild(alphaRect);
          maskGrouper.appendChild(this.layerElement);
          layerElementParent = maskGrouper;

          if (!featureSupport.maskType) {
            maskGroup.setAttribute('mask-type', 'luminance');
            fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
            gg = createNS('g');
            maskGrouper.appendChild(alphaRect);
            gg.appendChild(this.layerElement);
            layerElementParent = gg;
            maskGrouper.appendChild(gg);
          }

          this.globalData.defs.appendChild(maskGroup);
        }
      } else if (this.data.tt) {
        this.matteElement.appendChild(this.layerElement);
        layerElementParent = this.matteElement;
        this.baseElement = this.matteElement;
      } else {
        this.baseElement = this.layerElement;
      }

      if (this.data.ln) {
        this.layerElement.setAttribute('id', this.data.ln);
      }

      if (this.data.cl) {
        this.layerElement.setAttribute('class', this.data.cl);
      } //Clipping compositions to hide content that exceeds boundaries. If collapsed transformations is on, component should not be clipped


      if (this.data.ty === 0 && !this.data.hd) {
        var cp = createNS('clipPath');
        var pt = createNS('path');
        pt.setAttribute('d', 'M0,0 L' + this.data.w + ',0' + ' L' + this.data.w + ',' + this.data.h + ' L0,' + this.data.h + 'z');
        var clipId = createElementID();
        cp.setAttribute('id', clipId);
        cp.appendChild(pt);
        this.globalData.defs.appendChild(cp);

        if (this.checkMasks()) {
          var cpGroup = createNS('g');
          cpGroup.setAttribute('clip-path', 'url(' + locationHref + '#' + clipId + ')');
          cpGroup.appendChild(this.layerElement);
          this.transformedElement = cpGroup;

          if (layerElementParent) {
            layerElementParent.appendChild(this.transformedElement);
          } else {
            this.baseElement = this.transformedElement;
          }
        } else {
          this.layerElement.setAttribute('clip-path', 'url(' + locationHref + '#' + clipId + ')');
        }
      }

      if (this.data.bm !== 0) {
        this.setBlendMode();
      }
    },
    renderElement: function () {
      if (this.finalTransform._matMdf) {
        this.transformedElement.setAttribute('transform', this.finalTransform.mat.to2dCSS());
      }

      if (this.finalTransform._opMdf) {
        this.transformedElement.setAttribute('opacity', this.finalTransform.mProp.o.v);
      }
    },
    destroyBaseElement: function () {
      this.layerElement = null;
      this.matteElement = null;
      this.maskManager.destroy();
    },
    getBaseElement: function () {
      if (this.data.hd) {
        return null;
      }

      return this.baseElement;
    },
    createRenderableComponents: function () {
      this.maskManager = new MaskElement(this.data, this, this.globalData);
      this.renderableEffectsManager = new SVGEffects(this);
    },
    setMatte: function (id) {
      if (!this.matteElement) {
        return;
      }

      this.matteElement.setAttribute("mask", "url(" + locationHref + "#" + id + ")");
    }
  };

  function IShapeElement() {}

  IShapeElement.prototype = {
    addShapeToModifiers: function (data) {
      var i,
          len = this.shapeModifiers.length;

      for (i = 0; i < len; i += 1) {
        this.shapeModifiers[i].addShape(data);
      }
    },
    isShapeInAnimatedModifiers: function (data) {
      var i = 0,
          len = this.shapeModifiers.length;

      while (i < len) {
        if (this.shapeModifiers[i].isAnimatedWithShape(data)) {
          return true;
        }
      }

      return false;
    },
    renderModifiers: function () {
      if (!this.shapeModifiers.length) {
        return;
      }

      var i,
          len = this.shapes.length;

      for (i = 0; i < len; i += 1) {
        this.shapes[i].sh.reset();
      }

      len = this.shapeModifiers.length;

      for (i = len - 1; i >= 0; i -= 1) {
        this.shapeModifiers[i].processShapes(this._isFirstFrame);
      }
    },
    lcEnum: {
      1: 'butt',
      2: 'round',
      3: 'square'
    },
    ljEnum: {
      1: 'miter',
      2: 'round',
      3: 'bevel'
    },
    searchProcessedElement: function (elem) {
      var elements = this.processedElements;
      var i = 0,
          len = elements.length;

      while (i < len) {
        if (elements[i].elem === elem) {
          return elements[i].pos;
        }

        i += 1;
      }

      return 0;
    },
    addProcessedElement: function (elem, pos) {
      var elements = this.processedElements;
      var i = elements.length;

      while (i) {
        i -= 1;

        if (elements[i].elem === elem) {
          elements[i].pos = pos;
          return;
        }
      }

      elements.push(new ProcessedElement(elem, pos));
    },
    prepareFrame: function (num) {
      this.prepareRenderableFrame(num);
      this.prepareProperties(num, this.isInRange);
    }
  };

  function ITextElement() {}

  ITextElement.prototype.initElement = function (data, globalData, comp) {
    this.lettersChangedFlag = true;
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.textProperty = new TextProperty(this, data.t, this.dynamicProperties);
    this.textAnimator = new TextAnimatorProperty(data.t, this.renderType, this);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
    this.initRenderable();
    this.initRendererElement();
    this.createContainerElements();
    this.createRenderableComponents();
    this.createContent();
    this.hide();
    this.textAnimator.searchProperties(this.dynamicProperties);
  };

  ITextElement.prototype.prepareFrame = function (num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);

    if (this.textProperty._mdf || this.textProperty._isFirstFrame) {
      this.buildNewText();
      this.textProperty._isFirstFrame = false;
      this.textProperty._mdf = false;
    }
  };

  ITextElement.prototype.createPathShape = function (matrixHelper, shapes) {
    var j,
        jLen = shapes.length;
    var k, kLen, pathNodes;
    var shapeStr = '';

    for (j = 0; j < jLen; j += 1) {
      pathNodes = shapes[j].ks.k;
      shapeStr += buildShapeString(pathNodes, pathNodes.i.length, true, matrixHelper);
    }

    return shapeStr;
  };

  ITextElement.prototype.updateDocumentData = function (newData, index) {
    this.textProperty.updateDocumentData(newData, index);
  };

  ITextElement.prototype.canResizeFont = function (_canResize) {
    this.textProperty.canResizeFont(_canResize);
  };

  ITextElement.prototype.setMinimumFontSize = function (_fontSize) {
    this.textProperty.setMinimumFontSize(_fontSize);
  };

  ITextElement.prototype.applyTextPropertiesToMatrix = function (documentData, matrixHelper, lineNumber, xPos, yPos) {
    if (documentData.ps) {
      matrixHelper.translate(documentData.ps[0], documentData.ps[1] + documentData.ascent, 0);
    }

    matrixHelper.translate(0, -documentData.ls, 0);

    switch (documentData.j) {
      case 1:
        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]), 0, 0);
        break;

      case 2:
        matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[lineNumber]) / 2, 0, 0);
        break;
    }

    matrixHelper.translate(xPos, yPos, 0);
  };

  ITextElement.prototype.buildColor = function (colorData) {
    return 'rgb(' + Math.round(colorData[0] * 255) + ',' + Math.round(colorData[1] * 255) + ',' + Math.round(colorData[2] * 255) + ')';
  };

  ITextElement.prototype.emptyProp = new LetterProps();

  ITextElement.prototype.destroy = function () {};

  function ICompElement() {}

  extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement, RenderableDOMElement], ICompElement);

  ICompElement.prototype.initElement = function (data, globalData, comp) {
    this.initFrame();
    this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initRenderable();
    this.initHierarchy();
    this.initRendererElement();
    this.createContainerElements();
    this.createRenderableComponents();

    if (this.data.xt || !globalData.progressiveLoad) {
      this.buildAllItems();
    }

    this.hide();
  };

  ICompElement.prototype.prepareFrame = function (num) {
    this._mdf = false;
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
    if (!this.isInRange && !this.data.xt) return;

    if (!this.tm._placeholder) {
      var timeRemapped = this.tm.v;

      if (timeRemapped === this.data.op) {
        timeRemapped = this.data.op - 1;
      }

      this.renderedFrame = timeRemapped;
    } else {
      this.renderedFrame = num / this.data.sr;
    }

    var i,
        len = this.elements.length;

    if (!this.completeLayers) {
      this.checkLayers(this.renderedFrame);
    } // 由于表达式彼此之间的连接方式，此迭代需要向后进行


    for (i = len - 1; i >= 0; i -= 1) {
      if (this.completeLayers || this.elements[i]) {
        this.elements[i].prepareFrame(this.renderedFrame - this.layers[i].st);

        if (this.elements[i]._mdf) {
          this._mdf = true;
        }
      }
    }
  };

  ICompElement.prototype.renderInnerContent = function () {
    var i,
        len = this.layers.length;

    for (i = 0; i < len; i += 1) {
      if (this.completeLayers || this.elements[i]) {
        this.elements[i].renderFrame();
      }
    }
  };

  ICompElement.prototype.setElements = function (elems) {
    this.elements = elems;
  };

  ICompElement.prototype.getElements = function () {
    return this.elements;
  };

  ICompElement.prototype.destroyElements = function () {
    var i,
        len = this.layers.length;

    for (i = 0; i < len; i += 1) {
      if (this.elements[i]) {
        this.elements[i].destroy();
      }
    }
  };

  ICompElement.prototype.destroy = function () {
    this.destroyElements();
    this.destroyBaseElement();
  };

  function IImageElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.initElement(data, globalData, comp);
    this.sourceRect = {
      top: 0,
      left: 0,
      width: this.assetData.w,
      height: this.assetData.h
    };
  }

  extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement, RenderableDOMElement], IImageElement);

  IImageElement.prototype.createContent = function () {
    var assetPath = this.globalData.getAssetsPath(this.assetData);
    this.innerElem = createTag('image');
    this.innerElem.width = this.assetData.w;
    this.innerElem.height = this.assetData.h;
    this.layerElement.appendChild(this.innerElem);
  };

  IImageElement.prototype.sourceRectAtTime = function () {
    return this.sourceRect;
  };

  function ISolidElement(data, globalData, comp) {
    this.initElement(data, globalData, comp);
  }

  extendPrototype([IImageElement], ISolidElement);

  ISolidElement.prototype.createContent = function () {
    var rect = createNS('rect');
    rect.setAttribute('width', this.data.sw);
    rect.setAttribute('height', this.data.sh);
    rect.setAttribute('fill', this.data.sc);
    this.layerElement.appendChild(rect);
  };

  function SVGShapeElement(data, globalData, comp) {
    //List of drawable elements
    this.shapes = []; // Full shape data

    this.shapesData = data.shapes; //List of styles that will be applied to shapes

    this.stylesList = []; //List of modifiers that will be applied to shapes

    this.shapeModifiers = []; //List of items in shape tree

    this.itemsData = []; //List of items in previous shape tree

    this.processedElements = []; // List of animated components

    this.animatedContents = [];
    this.initElement(data, globalData, comp); //Moving any property that doesn't get too much access after initialization because of v8 way of handling more than 10 properties.
    // List of elements that have been created

    this.prevViewData = []; //Moving any property that doesn't get too much access after initialization because of v8 way of handling more than 10 properties.
  }

  extendPrototype([BaseElement, TransformElement, SVGBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableDOMElement], SVGShapeElement);

  SVGShapeElement.prototype.initSecondaryElement = function () {};

  SVGShapeElement.prototype.identityMatrix = new Matrix();

  SVGShapeElement.prototype.buildExpressionInterface = function () {};

  SVGShapeElement.prototype.createContent = function () {
    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], true);
    this.filterUniqueShapes();
  };
  /*
  This method searches for multiple shapes that affect a single element and one of them is animated
  */


  SVGShapeElement.prototype.filterUniqueShapes = function () {
    var i,
        len = this.shapes.length,
        shape;
    var j,
        jLen = this.stylesList.length;
    var style,
        count = 0;
    var tempShapes = [];
    var areAnimated = false;

    for (j = 0; j < jLen; j += 1) {
      style = this.stylesList[j];
      areAnimated = false;
      tempShapes.length = 0;

      for (i = 0; i < len; i += 1) {
        shape = this.shapes[i];

        if (shape.styles.indexOf(style) !== -1) {
          tempShapes.push(shape);
          areAnimated = shape._isAnimated || areAnimated;
        }
      }

      if (tempShapes.length > 1 && areAnimated) {
        this.setShapesAsAnimated(tempShapes);
      }
    }
  };

  SVGShapeElement.prototype.setShapesAsAnimated = function (shapes) {
    var i,
        len = shapes.length;

    for (i = 0; i < len; i += 1) {
      shapes[i].setAsAnimated();
    }
  };

  SVGShapeElement.prototype.createStyleElement = function (data, level) {
    //TODO: prevent drawing of hidden styles
    var elementData;
    var styleOb = new SVGStyleData(data, level);
    var pathElement = styleOb.pElem;

    if (data.ty === 'st') {
      elementData = new SVGStrokeStyleData(this, data, styleOb);
    } else if (data.ty === 'fl') {
      elementData = new SVGFillStyleData(this, data, styleOb);
    } else if (data.ty === 'gf' || data.ty === 'gs') {
      var gradientConstructor = data.ty === 'gf' ? SVGGradientFillStyleData : SVGGradientStrokeStyleData;
      elementData = new gradientConstructor(this, data, styleOb);
      this.globalData.defs.appendChild(elementData.gf);

      if (elementData.maskId) {
        this.globalData.defs.appendChild(elementData.ms);
        this.globalData.defs.appendChild(elementData.of);
        pathElement.setAttribute('mask', 'url(' + locationHref + '#' + elementData.maskId + ')');
      }
    }

    if (data.ty === 'st' || data.ty === 'gs') {
      pathElement.setAttribute('stroke-linecap', this.lcEnum[data.lc] || 'round');
      pathElement.setAttribute('stroke-linejoin', this.ljEnum[data.lj] || 'round');
      pathElement.setAttribute('fill-opacity', '0');

      if (data.lj === 1) {
        pathElement.setAttribute('stroke-miterlimit', data.ml);
      }
    }

    if (data.r === 2) {
      pathElement.setAttribute('fill-rule', 'evenodd');
    }

    if (data.ln) {
      pathElement.setAttribute('id', data.ln);
    }

    if (data.cl) {
      pathElement.setAttribute('class', data.cl);
    }

    if (data.bm) {
      pathElement.style['mix-blend-mode'] = getBlendMode(data.bm);
    }

    this.stylesList.push(styleOb);
    this.addToAnimatedContents(data, elementData);
    return elementData;
  };

  SVGShapeElement.prototype.createGroupElement = function (data) {
    var elementData = new ShapeGroupData();

    if (data.ln) {
      elementData.gr.setAttribute('id', data.ln);
    }

    if (data.cl) {
      elementData.gr.setAttribute('class', data.cl);
    }

    if (data.bm) {
      elementData.gr.style['mix-blend-mode'] = getBlendMode(data.bm);
    }

    return elementData;
  };

  SVGShapeElement.prototype.createTransformElement = function (data, container) {
    var transformProperty = TransformPropertyFactory.getTransformProperty(this, data, this);
    var elementData = new SVGTransformData(transformProperty, transformProperty.o, container);
    this.addToAnimatedContents(data, elementData);
    return elementData;
  };

  SVGShapeElement.prototype.createShapeElement = function (data, ownTransformers, level) {
    var ty = 4;

    if (data.ty === 'rc') {
      ty = 5;
    } else if (data.ty === 'el') {
      ty = 6;
    } else if (data.ty === 'sr') {
      ty = 7;
    }

    var shapeProperty = ShapePropertyFactory.getShapeProp(this, data, ty, this);
    var elementData = new SVGShapeData(ownTransformers, level, shapeProperty);
    this.shapes.push(elementData);
    this.addShapeToModifiers(elementData);
    this.addToAnimatedContents(data, elementData);
    return elementData;
  };

  SVGShapeElement.prototype.addToAnimatedContents = function (data, element) {
    var i = 0,
        len = this.animatedContents.length;

    while (i < len) {
      if (this.animatedContents[i].element === element) {
        return;
      }

      i += 1;
    }

    this.animatedContents.push({
      fn: SVGElementsRenderer.createRenderFunction(data),
      element: element,
      data: data
    });
  };

  SVGShapeElement.prototype.setElementStyles = function (elementData) {
    var arr = elementData.styles;
    var j,
        jLen = this.stylesList.length;

    for (j = 0; j < jLen; j += 1) {
      if (!this.stylesList[j].closed) {
        arr.push(this.stylesList[j]);
      }
    }
  };

  SVGShapeElement.prototype.reloadShapes = function () {
    this._isFirstFrame = true;
    var i,
        len = this.itemsData.length;

    for (i = 0; i < len; i += 1) {
      this.prevViewData[i] = this.itemsData[i];
    }

    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0, [], true);
    this.filterUniqueShapes();
    len = this.dynamicProperties.length;

    for (i = 0; i < len; i += 1) {
      this.dynamicProperties[i].getValue();
    }

    this.renderModifiers();
  };

  SVGShapeElement.prototype.searchShapes = function (arr, itemsData, prevViewData, container, level, transformers, render) {
    var ownTransformers = [].concat(transformers);
    var i,
        len = arr.length - 1;
    var j, jLen;
    var ownStyles = [],
        ownModifiers = [],
        styleOb,
        currentTransform,
        modifier,
        processedPos;

    for (i = len; i >= 0; i -= 1) {
      processedPos = this.searchProcessedElement(arr[i]);

      if (!processedPos) {
        arr[i]._render = render;
      } else {
        itemsData[i] = prevViewData[processedPos - 1];
      }

      if (arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs') {
        if (!processedPos) {
          itemsData[i] = this.createStyleElement(arr[i], level);
        } else {
          itemsData[i].style.closed = false;
        }

        if (arr[i]._render) {
          container.appendChild(itemsData[i].style.pElem);
        }

        ownStyles.push(itemsData[i].style);
      } else if (arr[i].ty == 'gr') {
        if (!processedPos) {
          itemsData[i] = this.createGroupElement(arr[i]);
        } else {
          jLen = itemsData[i].it.length;

          for (j = 0; j < jLen; j += 1) {
            itemsData[i].prevViewData[j] = itemsData[i].it[j];
          }
        }

        this.searchShapes(arr[i].it, itemsData[i].it, itemsData[i].prevViewData, itemsData[i].gr, level + 1, ownTransformers, render);

        if (arr[i]._render) {
          container.appendChild(itemsData[i].gr);
        }
      } else if (arr[i].ty == 'tr') {
        if (!processedPos) {
          itemsData[i] = this.createTransformElement(arr[i], container);
        }

        currentTransform = itemsData[i].transform;
        ownTransformers.push(currentTransform);
      } else if (arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr') {
        if (!processedPos) {
          itemsData[i] = this.createShapeElement(arr[i], ownTransformers, level);
        }

        this.setElementStyles(itemsData[i]);
      } else if (arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'ms') {
        if (!processedPos) {
          modifier = ShapeModifiers.getModifier(arr[i].ty);
          modifier.init(this, arr[i]);
          itemsData[i] = modifier;
          this.shapeModifiers.push(modifier);
        } else {
          modifier = itemsData[i];
          modifier.closed = false;
        }

        ownModifiers.push(modifier);
      } else if (arr[i].ty == 'rp') {
        if (!processedPos) {
          modifier = ShapeModifiers.getModifier(arr[i].ty);
          itemsData[i] = modifier;
          modifier.init(this, arr, i, itemsData);
          this.shapeModifiers.push(modifier);
          render = false;
        } else {
          modifier = itemsData[i];
          modifier.closed = true;
        }

        ownModifiers.push(modifier);
      }

      this.addProcessedElement(arr[i], i + 1);
    }

    len = ownStyles.length;

    for (i = 0; i < len; i += 1) {
      ownStyles[i].closed = true;
    }

    len = ownModifiers.length;

    for (i = 0; i < len; i += 1) {
      ownModifiers[i].closed = true;
    }
  };

  SVGShapeElement.prototype.renderInnerContent = function () {
    this.renderModifiers();
    var i,
        len = this.stylesList.length;

    for (i = 0; i < len; i += 1) {
      this.stylesList[i].reset();
    }

    this.renderShape();

    for (i = 0; i < len; i += 1) {
      if (this.stylesList[i]._mdf || this._isFirstFrame) {
        if (this.stylesList[i].msElem) {
          this.stylesList[i].msElem.setAttribute('d', this.stylesList[i].d); //Adding M0 0 fixes same mask bug on all browsers

          this.stylesList[i].d = 'M0 0' + this.stylesList[i].d;
        }

        this.stylesList[i].pElem.setAttribute('d', this.stylesList[i].d || 'M0 0');
      }
    }
  };

  SVGShapeElement.prototype.renderShape = function () {
    var i,
        len = this.animatedContents.length;
    var animatedContent;

    for (i = 0; i < len; i += 1) {
      animatedContent = this.animatedContents[i];

      if ((this._isFirstFrame || animatedContent.element._isAnimated) && animatedContent.data !== true) {
        animatedContent.fn(animatedContent.data, animatedContent.element, this._isFirstFrame);
      }
    }
  };

  SVGShapeElement.prototype.destroy = function () {
    this.destroyBaseElement();
    this.shapesData = null;
    this.itemsData = null;
  };

  function CVContextData() {
    this.saved = [];
    this.cArrPos = 0;
    this.cTr = new Matrix();
    this.cO = 1;
    var i,
        len = 15;
    this.savedOp = createTypedArray('float32', len);

    for (i = 0; i < len; i += 1) {
      this.saved[i] = createTypedArray('float32', 16);
    }

    this._length = len;
  }

  CVContextData.prototype.duplicate = function () {
    var newLength = this._length * 2;
    var currentSavedOp = this.savedOp;
    this.savedOp = createTypedArray('float32', newLength);
    this.savedOp.set(currentSavedOp);
    var i = 0;

    for (i = this._length; i < newLength; i += 1) {
      this.saved[i] = createTypedArray('float32', 16);
    }

    this._length = newLength;
  };

  CVContextData.prototype.reset = function () {
    this.cArrPos = 0;
    this.cTr.reset();
    this.cO = 1;
  };

  function CVBaseElement() {}

  CVBaseElement.prototype = {
    createElements: function () {},
    initRendererElement: function () {},
    createContainerElements: function () {
      this.canvasContext = this.globalData.canvasContext;
      this.renderableEffectsManager = new CVEffects(this);
    },
    createContent: function () {},
    setBlendMode: function () {
      var globalData = this.globalData;

      if (globalData.blendMode !== this.data.bm) {
        globalData.blendMode = this.data.bm;
        var blendModeValue = getBlendMode(this.data.bm);
        globalData.canvasContext.globalCompositeOperation = blendModeValue;
      }
    },
    createRenderableComponents: function () {
      this.maskManager = new CVMaskElement(this.data, this);
    },
    hideElement: function () {
      if (!this.hidden && (!this.isInRange || this.isTransparent)) {
        this.hidden = true;
      }
    },
    showElement: function () {
      if (this.isInRange && !this.isTransparent) {
        this.hidden = false;
        this._isFirstFrame = true;
        this.maskManager._isFirstFrame = true;
      }
    },
    renderFrame: function () {
      if (this.hidden || this.data.hd) {
        return;
      }

      this.renderTransform();
      this.renderRenderable();
      this.setBlendMode();
      var forceRealStack = this.data.ty === 0;
      this.globalData.renderer.save(forceRealStack);
      this.globalData.renderer.ctxTransform(this.finalTransform.mat.props);
      this.globalData.renderer.ctxOpacity(this.finalTransform.mProp.o.v);
      this.renderInnerContent();
      this.globalData.renderer.restore(forceRealStack);

      if (this.maskManager.hasMasks) {
        this.globalData.renderer.restore(true);
      }

      if (this._isFirstFrame) {
        this._isFirstFrame = false;
      }
    },
    destroy: function () {
      this.canvasContext = null;
      this.data = null;
      this.globalData = null;
      this.maskManager.destroy();
    },
    mHelper: new Matrix()
  };
  CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement;
  CVBaseElement.prototype.show = CVBaseElement.prototype.showElement;

  function CVImageElement(data, globalData, comp) {
    this.assetData = globalData.getAssetData(data.refId);
    this.img = globalData.imageLoader.getImage(this.assetData);
    this.initElement(data, globalData, comp);
  }

  extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVImageElement);
  CVImageElement.prototype.initElement = SVGShapeElement.prototype.initElement;
  CVImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

  CVImageElement.prototype.createContent = function () {
    if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img.height)) {
      var canvas = createTag('canvas');
      canvas.width = this.assetData.w;
      canvas.height = this.assetData.h;
      var ctx = canvas.getContext('2d');
      var imgW = this.img.width;
      var imgH = this.img.height;
      var imgRel = imgW / imgH;
      var canvasRel = this.assetData.w / this.assetData.h;
      var widthCrop, heightCrop;
      var par = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;

      if (imgRel > canvasRel && par === 'xMidYMid slice' || imgRel < canvasRel && par !== 'xMidYMid slice') {
        heightCrop = imgH;
        widthCrop = heightCrop * canvasRel;
      } else {
        widthCrop = imgW;
        heightCrop = widthCrop / canvasRel;
      }

      ctx.drawImage(this.img, (imgW - widthCrop) / 2, (imgH - heightCrop) / 2, widthCrop, heightCrop, 0, 0, this.assetData.w, this.assetData.h);
      this.img = canvas;
    }
  };

  CVImageElement.prototype.renderInnerContent = function (parentMatrix) {
    this.canvasContext.drawImage(this.img, 0, 0);
  };

  CVImageElement.prototype.destroy = function () {
    this.img = null;
  };

  function CVCompElement(data, globalData, comp) {
    this.completeLayers = false;
    this.layers = data.layers;
    this.pendingElements = [];
    this.elements = createSizedArray(this.layers.length);
    this.initElement(data, globalData, comp);
    this.tm = data.tm ? PropertyFactory.getProp(this, data.tm, 0, globalData.frameRate, this) : {
      _placeholder: true
    };
  }

  extendPrototype([CanvasRenderer, ICompElement, CVBaseElement], CVCompElement);

  CVCompElement.prototype.renderInnerContent = function () {
    var ctx = this.canvasContext;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.data.w, 0);
    ctx.lineTo(this.data.w, this.data.h);
    ctx.lineTo(0, this.data.h);
    ctx.lineTo(0, 0);
    ctx.clip();
    var i,
        len = this.layers.length;

    for (i = len - 1; i >= 0; i -= 1) {
      if (this.completeLayers || this.elements[i]) {
        this.elements[i].renderFrame();
      }
    }
  };

  CVCompElement.prototype.destroy = function () {
    var i,
        len = this.layers.length;

    for (i = len - 1; i >= 0; i -= 1) {
      if (this.elements[i]) {
        this.elements[i].destroy();
      }
    }

    this.layers = null;
    this.elements = null;
  };

  function CVMaskElement(data, element) {
    this.data = data;
    this.element = element;
    this.masksProperties = this.data.masksProperties || [];
    this.viewData = createSizedArray(this.masksProperties.length);
    var i,
        len = this.masksProperties.length,
        hasMasks = false;

    for (i = 0; i < len; i++) {
      if (this.masksProperties[i].mode !== 'n') {
        hasMasks = true;
      }

      this.viewData[i] = ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[i], 3);
    }

    this.hasMasks = hasMasks;

    if (hasMasks) {
      this.element.addRenderableComponent(this);
    }
  }

  CVMaskElement.prototype.renderFrame = function () {
    if (!this.hasMasks) return;
    var transform = this.element.finalTransform.mat;
    var ctx = this.element.canvasContext;
    var i,
        len = this.masksProperties.length;
    var pt, pts, data;
    ctx.beginPath();

    for (i = 0; i < len; i++) {
      if (this.masksProperties[i].mode !== 'n') {
        if (this.masksProperties[i].inv) {
          ctx.moveTo(0, 0);
          ctx.lineTo(this.element.globalData.compSize.w, 0);
          ctx.lineTo(this.element.globalData.compSize.w, this.element.globalData.compSize.h);
          ctx.lineTo(0, this.element.globalData.compSize.h);
          ctx.lineTo(0, 0);
        }

        data = this.viewData[i].v;
        pt = transform.applyToPointArray(data.v[0][0], data.v[0][1], 0);
        ctx.moveTo(pt[0], pt[1]);
        var j,
            jLen = data._length;

        for (j = 1; j < jLen; j++) {
          pts = transform.applyToTriplePoints(data.o[j - 1], data.i[j], data.v[j]);
          ctx.bezierCurveTo(pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]);
        }

        pts = transform.applyToTriplePoints(data.o[j - 1], data.i[0], data.v[0]);
        ctx.bezierCurveTo(pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]);
      }
    }

    this.element.globalData.renderer.save(true);
    ctx.clip();
  };

  CVMaskElement.prototype.getMaskProperty = function (pos) {
    return this.viewData[pos].prop;
  };

  CVMaskElement.prototype.destroy = function () {
    this.element = null;
  };

  function CVShapeElement(data, globalData, comp) {
    this.shapes = [];
    this.shapesData = data.shapes;
    this.stylesList = [];
    this.itemsData = [];
    this.prevViewData = [];
    this.shapeModifiers = [];
    this.processedElements = [];
    this.transformsManager = new ShapeTransformManager();
    this.initElement(data, globalData, comp);
  }

  extendPrototype([BaseElement, TransformElement, CVBaseElement, IShapeElement, HierarchyElement, FrameElement, RenderableElement], CVShapeElement);
  CVShapeElement.prototype.initElement = RenderableDOMElement.prototype.initElement;
  CVShapeElement.prototype.transformHelper = {
    opacity: 1,
    _opMdf: false
  };
  CVShapeElement.prototype.dashResetter = [];

  CVShapeElement.prototype.createContent = function () {
    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
  };

  CVShapeElement.prototype.createStyleElement = function (data, transforms) {
    var styleElem = {
      data: data,
      type: data.ty,
      preTransforms: this.transformsManager.addTransformSequence(transforms),
      transforms: [],
      elements: [],
      closed: data.hd === true
    };
    var elementData = {};

    if (data.ty == 'fl' || data.ty == 'st') {
      elementData.c = PropertyFactory.getProp(this, data.c, 1, 255, this);

      if (!elementData.c.k) {
        styleElem.co = 'rgb(' + bm_floor(elementData.c.v[0]) + ',' + bm_floor(elementData.c.v[1]) + ',' + bm_floor(elementData.c.v[2]) + ')';
      }
    } else if (data.ty === 'gf' || data.ty === 'gs') {
      elementData.s = PropertyFactory.getProp(this, data.s, 1, null, this);
      elementData.e = PropertyFactory.getProp(this, data.e, 1, null, this);
      elementData.h = PropertyFactory.getProp(this, data.h || {
        k: 0
      }, 0, 0.01, this);
      elementData.a = PropertyFactory.getProp(this, data.a || {
        k: 0
      }, 0, degToRads, this);
      elementData.g = new GradientProperty(this, data.g, this);
    }

    elementData.o = PropertyFactory.getProp(this, data.o, 0, 0.01, this);

    if (data.ty == 'st' || data.ty == 'gs') {
      styleElem.lc = this.lcEnum[data.lc] || 'round';
      styleElem.lj = this.ljEnum[data.lj] || 'round';

      if (data.lj == 1) {
        styleElem.ml = data.ml;
      }

      elementData.w = PropertyFactory.getProp(this, data.w, 0, null, this);

      if (!elementData.w.k) {
        styleElem.wi = elementData.w.v;
      }

      if (data.d) {
        var d = new DashProperty(this, data.d, 'canvas', this);
        elementData.d = d;

        if (!elementData.d.k) {
          styleElem.da = elementData.d.dashArray;
          styleElem.do = elementData.d.dashoffset[0];
        }
      }
    } else {
      styleElem.r = data.r === 2 ? 'evenodd' : 'nonzero';
    }

    this.stylesList.push(styleElem);
    elementData.style = styleElem;
    return elementData;
  };

  CVShapeElement.prototype.createGroupElement = function (data) {
    var elementData = {
      it: [],
      prevViewData: []
    };
    return elementData;
  };

  CVShapeElement.prototype.createTransformElement = function (data) {
    var elementData = {
      transform: {
        opacity: 1,
        _opMdf: false,
        key: this.transformsManager.getNewKey(),
        op: PropertyFactory.getProp(this, data.o, 0, 0.01, this),
        mProps: TransformPropertyFactory.getTransformProperty(this, data, this)
      }
    };
    return elementData;
  };

  CVShapeElement.prototype.createShapeElement = function (data) {
    var elementData = new CVShapeData(this, data, this.stylesList, this.transformsManager);
    this.shapes.push(elementData);
    this.addShapeToModifiers(elementData);
    return elementData;
  };

  CVShapeElement.prototype.reloadShapes = function () {
    this._isFirstFrame = true;
    var i,
        len = this.itemsData.length;

    for (i = 0; i < len; i += 1) {
      this.prevViewData[i] = this.itemsData[i];
    }

    this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, true, []);
    len = this.dynamicProperties.length;

    for (i = 0; i < len; i += 1) {
      this.dynamicProperties[i].getValue();
    }

    this.renderModifiers();
    this.transformsManager.processSequences(this._isFirstFrame);
  };

  CVShapeElement.prototype.addTransformToStyleList = function (transform) {
    var i,
        len = this.stylesList.length;

    for (i = 0; i < len; i += 1) {
      if (!this.stylesList[i].closed) {
        this.stylesList[i].transforms.push(transform);
      }
    }
  };

  CVShapeElement.prototype.removeTransformFromStyleList = function () {
    var i,
        len = this.stylesList.length;

    for (i = 0; i < len; i += 1) {
      if (!this.stylesList[i].closed) {
        this.stylesList[i].transforms.pop();
      }
    }
  };

  CVShapeElement.prototype.closeStyles = function (styles) {
    var i,
        len = styles.length,
        j,
        jLen;

    for (i = 0; i < len; i += 1) {
      styles[i].closed = true;
    }
  };

  CVShapeElement.prototype.searchShapes = function (arr, itemsData, prevViewData, shouldRender, transforms) {
    var i,
        len = arr.length - 1;
    var j, jLen;
    var ownStyles = [],
        ownModifiers = [],
        processedPos,
        modifier,
        currentTransform;
    var ownTransforms = [].concat(transforms);

    for (i = len; i >= 0; i -= 1) {
      processedPos = this.searchProcessedElement(arr[i]);

      if (!processedPos) {
        arr[i]._shouldRender = shouldRender;
      } else {
        itemsData[i] = prevViewData[processedPos - 1];
      }

      if (arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs') {
        if (!processedPos) {
          itemsData[i] = this.createStyleElement(arr[i], ownTransforms);
        } else {
          itemsData[i].style.closed = false;
        }

        ownStyles.push(itemsData[i].style);
      } else if (arr[i].ty == 'gr') {
        if (!processedPos) {
          itemsData[i] = this.createGroupElement(arr[i]);
        } else {
          jLen = itemsData[i].it.length;

          for (j = 0; j < jLen; j += 1) {
            itemsData[i].prevViewData[j] = itemsData[i].it[j];
          }
        }

        this.searchShapes(arr[i].it, itemsData[i].it, itemsData[i].prevViewData, shouldRender, ownTransforms);
      } else if (arr[i].ty == 'tr') {
        if (!processedPos) {
          currentTransform = this.createTransformElement(arr[i]);
          itemsData[i] = currentTransform;
        }

        ownTransforms.push(itemsData[i]);
        this.addTransformToStyleList(itemsData[i]);
      } else if (arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr') {
        if (!processedPos) {
          itemsData[i] = this.createShapeElement(arr[i]);
        }
      } else if (arr[i].ty == 'tm' || arr[i].ty == 'rd') {
        if (!processedPos) {
          modifier = ShapeModifiers.getModifier(arr[i].ty);
          modifier.init(this, arr[i]);
          itemsData[i] = modifier;
          this.shapeModifiers.push(modifier);
        } else {
          modifier = itemsData[i];
          modifier.closed = false;
        }

        ownModifiers.push(modifier);
      } else if (arr[i].ty == 'rp') {
        if (!processedPos) {
          modifier = ShapeModifiers.getModifier(arr[i].ty);
          itemsData[i] = modifier;
          modifier.init(this, arr, i, itemsData);
          this.shapeModifiers.push(modifier);
          shouldRender = false;
        } else {
          modifier = itemsData[i];
          modifier.closed = true;
        }

        ownModifiers.push(modifier);
      }

      this.addProcessedElement(arr[i], i + 1);
    }

    this.removeTransformFromStyleList();
    this.closeStyles(ownStyles);
    len = ownModifiers.length;

    for (i = 0; i < len; i += 1) {
      ownModifiers[i].closed = true;
    }
  };

  CVShapeElement.prototype.renderInnerContent = function () {
    this.transformHelper.opacity = 1;
    this.transformHelper._opMdf = false;
    this.renderModifiers();
    this.transformsManager.processSequences(this._isFirstFrame); // Logger.setNum(40).log(JSON.stringify(this.shapesData))

    this.renderShape(this.transformHelper, this.shapesData, this.itemsData, true);
  };

  CVShapeElement.prototype.renderShapeTransform = function (parentTransform, groupTransform) {
    var props, groupMatrix;

    if (parentTransform._opMdf || groupTransform.op._mdf || this._isFirstFrame) {
      groupTransform.opacity = parentTransform.opacity;
      groupTransform.opacity *= groupTransform.op.v;
      groupTransform._opMdf = true;
    }
  };

  CVShapeElement.prototype.drawLayer = function () {
    var i,
        len = this.stylesList.length;
    var j,
        jLen,
        k,
        kLen,
        elems,
        nodes,
        renderer = this.globalData.renderer,
        ctx = this.globalData.canvasContext,
        type,
        currentStyle;

    for (i = 0; i < len; i += 1) {
      currentStyle = this.stylesList[i];
      type = currentStyle.type; //Logger.setNum(100).json(currentStyle.data);

      if ((type === 'st' || type === 'gs') && currentStyle.wi === 0 || !currentStyle.data._shouldRender || currentStyle.coOp === 0 || this.globalData.currentGlobalAlpha === 0) {
        continue;
      }

      renderer.save();
      elems = currentStyle.elements;

      if (type === 'st' || type === 'gs') {
        ctx.strokeStyle = type === 'st' ? currentStyle.co : currentStyle.grd;
        ctx.lineWidth = currentStyle.wi;
        ctx.lineCap = currentStyle.lc;
        ctx.lineJoin = currentStyle.lj;
        ctx.miterLimit = currentStyle.ml || 0;
      } else {
        ctx.fillStyle = type === 'fl' ? currentStyle.co : currentStyle.grd;
      }

      renderer.ctxOpacity(currentStyle.coOp);

      if (type !== 'st' && type !== 'gs') {
        ctx.beginPath();
      }

      renderer.ctxTransform(currentStyle.preTransforms.finalTransform.props);
      jLen = elems.length;

      for (j = 0; j < jLen; j += 1) {
        if (type === 'st' || type === 'gs') {
          ctx.beginPath();

          if (currentStyle.da) {
            ctx.setLineDash(currentStyle.da);
            ctx.lineDashOffset = currentStyle.do;
          }
        }

        nodes = elems[j].trNodes;
        kLen = nodes.length;

        for (k = 0; k < kLen; k += 1) {
          if (nodes[k].t == 'm') {
            ctx.moveTo(nodes[k].p[0], nodes[k].p[1]);
          } else if (nodes[k].t == 'c') {
            ctx.bezierCurveTo(nodes[k].pts[0], nodes[k].pts[1], nodes[k].pts[2], nodes[k].pts[3], nodes[k].pts[4], nodes[k].pts[5]);
          } else {
            ctx.closePath();
          }
        }

        if (type === 'st' || type === 'gs') {
          ctx.stroke();

          if (currentStyle.da) {
            ctx.setLineDash(this.dashResetter);
          }
        }
      }

      if (type !== 'st' && type !== 'gs') {
        ctx.fill(currentStyle.r);
      }

      renderer.restore();
    }
  };

  CVShapeElement.prototype.renderShape = function (parentTransform, items, data, isMain) {
    var i,
        len = items.length - 1;
    var groupTransform;
    groupTransform = parentTransform;

    for (i = len; i >= 0; i -= 1) {
      if (items[i].ty == 'tr') {
        groupTransform = data[i].transform;
        this.renderShapeTransform(parentTransform, groupTransform);
      } else if (items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc' || items[i].ty == 'sr') {
        this.renderPath(items[i], data[i]);
      } else if (items[i].ty == 'fl') {
        this.renderFill(items[i], data[i], groupTransform);
      } else if (items[i].ty == 'st') {
        this.renderStroke(items[i], data[i], groupTransform);
      } else if (items[i].ty == 'gf' || items[i].ty == 'gs') {
        this.renderGradientFill(items[i], data[i], groupTransform);
      } else if (items[i].ty == 'gr') {
        this.renderShape(groupTransform, items[i].it, data[i].it);
      } else if (items[i].ty == 'tm') {//
      }
    }

    if (isMain) {
      this.drawLayer();
    }
  };

  CVShapeElement.prototype.renderStyledShape = function (styledShape, shape) {
    if (this._isFirstFrame || shape._mdf || styledShape.transforms._mdf) {
      var shapeNodes = styledShape.trNodes;
      var paths = shape.paths;
      var i,
          len,
          j,
          jLen = paths._length;
      shapeNodes.length = 0;
      var groupTransformMat = styledShape.transforms.finalTransform;

      for (j = 0; j < jLen; j += 1) {
        var pathNodes = paths.shapes[j];

        if (pathNodes && pathNodes.v) {
          len = pathNodes._length;

          for (i = 1; i < len; i += 1) {
            if (i === 1) {
              shapeNodes.push({
                t: 'm',
                p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
              });
            }

            shapeNodes.push({
              t: 'c',
              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[i], pathNodes.v[i])
            });
          }

          if (len === 1) {
            shapeNodes.push({
              t: 'm',
              p: groupTransformMat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
            });
          }

          if (pathNodes.c && len) {
            shapeNodes.push({
              t: 'c',
              pts: groupTransformMat.applyToTriplePoints(pathNodes.o[i - 1], pathNodes.i[0], pathNodes.v[0])
            });
            shapeNodes.push({
              t: 'z'
            });
          }
        }
      }

      styledShape.trNodes = shapeNodes;
    }
  };

  CVShapeElement.prototype.renderPath = function (pathData, itemData) {
    if (pathData.hd !== true && pathData._shouldRender) {
      var i,
          len = itemData.styledShapes.length;

      for (i = 0; i < len; i += 1) {
        this.renderStyledShape(itemData.styledShapes[i], itemData.sh);
      }
    }
  };

  CVShapeElement.prototype.renderFill = function (styleData, itemData, groupTransform) {
    var styleElem = itemData.style;

    if (itemData.c._mdf || this._isFirstFrame) {
      styleElem.co = 'rgb(' + bm_floor(itemData.c.v[0]) + ',' + bm_floor(itemData.c.v[1]) + ',' + bm_floor(itemData.c.v[2]) + ')';
    }

    if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
      styleElem.coOp = itemData.o.v * groupTransform.opacity;
    }
  };

  CVShapeElement.prototype.renderGradientFill = function (styleData, itemData, groupTransform) {
    var styleElem = itemData.style;

    if (!styleElem.grd || itemData.g._mdf || itemData.s._mdf || itemData.e._mdf || styleData.t !== 1 && (itemData.h._mdf || itemData.a._mdf)) {
      var ctx = this.globalData.canvasContext;
      var grd;
      var pt1 = itemData.s.v,
          pt2 = itemData.e.v;

      if (styleData.t === 1) {
        grd = ctx.createLinearGradient(pt1[0], pt1[1], pt2[0], pt2[1]);
      } else {
        var rad = Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2));
        var ang = Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0]);
        var percent = itemData.h.v >= 1 ? 0.99 : itemData.h.v <= -1 ? -0.99 : itemData.h.v;
        var dist = rad * percent;
        var x = Math.cos(ang + itemData.a.v) * dist + pt1[0];
        var y = Math.sin(ang + itemData.a.v) * dist + pt1[1];
        var grd = ctx.createRadialGradient(x, y, 0, pt1[0], pt1[1], rad);
      }

      var i,
          len = styleData.g.p;
      var cValues = itemData.g.c;
      var opacity = 1;

      for (i = 0; i < len; i += 1) {
        if (itemData.g._hasOpacity && itemData.g._collapsable) {
          opacity = itemData.g.o[i * 2 + 1];
        }

        grd.addColorStop(cValues[i * 4] / 100, 'rgba(' + cValues[i * 4 + 1] + ',' + cValues[i * 4 + 2] + ',' + cValues[i * 4 + 3] + ',' + opacity + ')');
      }

      styleElem.grd = grd;
    }

    styleElem.coOp = itemData.o.v * groupTransform.opacity;
  };

  CVShapeElement.prototype.renderStroke = function (styleData, itemData, groupTransform) {
    var styleElem = itemData.style;
    var d = itemData.d;

    if (d && (d._mdf || this._isFirstFrame)) {
      styleElem.da = d.dashArray;
      styleElem.do = d.dashoffset[0];
    }

    if (itemData.c._mdf || this._isFirstFrame) {
      styleElem.co = 'rgb(' + bm_floor(itemData.c.v[0]) + ',' + bm_floor(itemData.c.v[1]) + ',' + bm_floor(itemData.c.v[2]) + ')';
    }

    if (itemData.o._mdf || groupTransform._opMdf || this._isFirstFrame) {
      styleElem.coOp = itemData.o.v * groupTransform.opacity;
    }

    if (itemData.w._mdf || this._isFirstFrame) {
      styleElem.wi = itemData.w.v;
    }
  };

  CVShapeElement.prototype.destroy = function () {
    this.shapesData = null;
    this.globalData = null;
    this.canvasContext = null;
    this.stylesList.length = 0;
    this.itemsData.length = 0;
  };

  function CVSolidElement(data, globalData, comp) {
    this.initElement(data, globalData, comp);
  }

  extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement);
  CVSolidElement.prototype.initElement = SVGShapeElement.prototype.initElement;
  CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame;

  CVSolidElement.prototype.renderInnerContent = function () {
    var ctx = this.canvasContext;
    ctx.fillStyle = this.data.sc;
    ctx.fillRect(0, 0, this.data.sw, this.data.sh); //
  };

  function CVTextElement(data, globalData, comp) {
    this.textSpans = [];
    this.yOffset = 0;
    this.fillColorAnim = false;
    this.strokeColorAnim = false;
    this.strokeWidthAnim = false;
    this.stroke = false;
    this.fill = false;
    this.justifyOffset = 0;
    this.currentRender = null;
    this.renderType = 'canvas';
    this.values = {
      fill: 'rgba(0,0,0,0)',
      stroke: 'rgba(0,0,0,0)',
      sWidth: 0,
      fValue: ''
    };
    this.initElement(data, globalData, comp);
  }

  extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement, ITextElement], CVTextElement);

  CVTextElement.prototype.tHelper = () => createTag('canvas').getContext('2d');

  CVTextElement.prototype.buildNewText = function () {
    var documentData = this.textProperty.currentData;
    this.renderedLetters = createSizedArray(documentData.l ? documentData.l.length : 0);
    var hasFill = false;

    if (documentData.fc) {
      hasFill = true;
      this.values.fill = this.buildColor(documentData.fc);
    } else {
      this.values.fill = 'rgba(0,0,0,0)';
    }

    this.fill = hasFill;
    var hasStroke = false;

    if (documentData.sc) {
      hasStroke = true;
      this.values.stroke = this.buildColor(documentData.sc);
      this.values.sWidth = documentData.sw;
    }

    var fontData = this.globalData.fontManager.getFontByName(documentData.f);
    var i, len;
    var letters = documentData.l;
    var matrixHelper = this.mHelper;
    this.stroke = hasStroke;
    this.values.fValue = documentData.finalSize + 'px ' + this.globalData.fontManager.getFontByName(documentData.f).fFamily;
    len = documentData.finalText.length; //this.tHelper.font = this.values.fValue;

    var charData,
        shapeData,
        k,
        kLen,
        shapes,
        j,
        jLen,
        pathNodes,
        commands,
        pathArr,
        singleShape = this.data.singleShape;
    var trackingOffset = documentData.tr / 1000 * documentData.finalSize;
    var xPos = 0,
        yPos = 0,
        firstLine = true;
    var cnt = 0;

    for (i = 0; i < len; i += 1) {
      charData = this.globalData.fontManager.getCharData(documentData.finalText[i], fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily, documentData.finalSize);
      shapeData = charData && charData.data || {};
      matrixHelper.reset();

      if (singleShape && letters[i].n) {
        xPos = -trackingOffset;
        yPos += documentData.yOffset;
        yPos += firstLine ? 1 : 0;
        firstLine = false;
      }

      shapes = shapeData.shapes ? shapeData.shapes[0].it : [];
      jLen = shapes.length;
      matrixHelper.scale(documentData.finalSize / 100, documentData.finalSize / 100);

      if (singleShape) {
        this.applyTextPropertiesToMatrix(documentData, matrixHelper, letters[i].line, xPos, yPos);
      }

      commands = createSizedArray(jLen);

      for (j = 0; j < jLen; j += 1) {
        kLen = shapes[j].ks.k.i.length;
        pathNodes = shapes[j].ks.k;
        pathArr = [];

        for (k = 1; k < kLen; k += 1) {
          if (k == 1) {
            pathArr.push(matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0), matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0));
          }

          pathArr.push(matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToX(pathNodes.i[k][0], pathNodes.i[k][1], 0), matrixHelper.applyToY(pathNodes.i[k][0], pathNodes.i[k][1], 0), matrixHelper.applyToX(pathNodes.v[k][0], pathNodes.v[k][1], 0), matrixHelper.applyToY(pathNodes.v[k][0], pathNodes.v[k][1], 0));
        }

        pathArr.push(matrixHelper.applyToX(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToY(pathNodes.o[k - 1][0], pathNodes.o[k - 1][1], 0), matrixHelper.applyToX(pathNodes.i[0][0], pathNodes.i[0][1], 0), matrixHelper.applyToY(pathNodes.i[0][0], pathNodes.i[0][1], 0), matrixHelper.applyToX(pathNodes.v[0][0], pathNodes.v[0][1], 0), matrixHelper.applyToY(pathNodes.v[0][0], pathNodes.v[0][1], 0));
        commands[j] = pathArr;
      }

      if (singleShape) {
        xPos += letters[i].l;
        xPos += trackingOffset;
      }

      if (this.textSpans[cnt]) {
        this.textSpans[cnt].elem = commands;
      } else {
        this.textSpans[cnt] = {
          elem: commands
        };
      }

      cnt += 1;
    }
  };

  CVTextElement.prototype.renderInnerContent = function () {
    var ctx = this.canvasContext;
    var finalMat = this.finalTransform.mat.props;
    ctx.font = this.values.fValue;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 4;

    if (!this.data.singleShape) {
      this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag);
    }

    var i, len, j, jLen, k, kLen;
    var renderedLetters = this.textAnimator.renderedLetters;
    var letters = this.textProperty.currentData.l;
    len = letters.length;
    var renderedLetter;
    var lastFill = null,
        lastStroke = null,
        lastStrokeW = null,
        commands,
        pathArr;

    for (i = 0; i < len; i += 1) {
      if (letters[i].n) {
        continue;
      }

      renderedLetter = renderedLetters[i];

      if (renderedLetter) {
        this.globalData.renderer.save();
        this.globalData.renderer.ctxTransform(renderedLetter.p);
        this.globalData.renderer.ctxOpacity(renderedLetter.o);
      }

      if (this.fill) {
        if (renderedLetter && renderedLetter.fc) {
          if (lastFill !== renderedLetter.fc) {
            lastFill = renderedLetter.fc;
            ctx.fillStyle = renderedLetter.fc;
          }
        } else if (lastFill !== this.values.fill) {
          lastFill = this.values.fill;
          ctx.fillStyle = this.values.fill;
        }

        commands = this.textSpans[i].elem;
        jLen = commands.length;
        this.globalData.canvasContext.beginPath();

        for (j = 0; j < jLen; j += 1) {
          pathArr = commands[j];
          kLen = pathArr.length;
          this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);

          for (k = 2; k < kLen; k += 6) {
            this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
          }
        }

        this.globalData.canvasContext.closePath();
        this.globalData.canvasContext.fill(); ///ctx.fillText(this.textSpans[i].val,0,0);
      }

      if (this.stroke) {
        if (renderedLetter && renderedLetter.sw) {
          if (lastStrokeW !== renderedLetter.sw) {
            lastStrokeW = renderedLetter.sw;
            ctx.lineWidth = renderedLetter.sw;
          }
        } else if (lastStrokeW !== this.values.sWidth) {
          lastStrokeW = this.values.sWidth;
          ctx.lineWidth = this.values.sWidth;
        }

        if (renderedLetter && renderedLetter.sc) {
          if (lastStroke !== renderedLetter.sc) {
            lastStroke = renderedLetter.sc;
            ctx.strokeStyle = renderedLetter.sc;
          }
        } else if (lastStroke !== this.values.stroke) {
          lastStroke = this.values.stroke;
          ctx.strokeStyle = this.values.stroke;
        }

        commands = this.textSpans[i].elem;
        jLen = commands.length;
        this.globalData.canvasContext.beginPath();

        for (j = 0; j < jLen; j += 1) {
          pathArr = commands[j];
          kLen = pathArr.length;
          this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);

          for (k = 2; k < kLen; k += 6) {
            this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
          }
        }

        this.globalData.canvasContext.closePath();
        this.globalData.canvasContext.stroke(); ///ctx.strokeText(letters[i].val,0,0);
      }

      if (renderedLetter) {
        this.globalData.renderer.restore();
      }
    }
  };

  function CVEffects() {}

  CVEffects.prototype.renderFrame = function () {};

  var animationManager = function () {
    var moduleOb = {};
    var registeredAnimations = [];
    var initTime = 0;
    var len = 0;
    var playingAnimationsNum = 0;
    var _stopped = true;
    var _isFrozen = false;

    function removeElement(ev) {
      var i = 0;
      var animItem = ev.target;

      while (i < len) {
        if (registeredAnimations[i].animation === animItem) {
          registeredAnimations.splice(i, 1);
          i -= 1;
          len -= 1;

          if (!animItem.isPaused) {
            subtractPlayingCount();
          }
        }

        i += 1;
      }
    }

    function getRegisteredAnimations() {
      var i,
          len = registeredAnimations.length;
      var animations = [];

      for (i = 0; i < len; i += 1) {
        animations.push(registeredAnimations[i].animation);
      }

      return animations;
    }

    function addPlayingCount() {
      playingAnimationsNum += 1;
      activate();
    }

    function subtractPlayingCount() {
      playingAnimationsNum -= 1;
    }

    function setupAnimation(animItem, element) {
      animItem.addEventListener('destroy', removeElement);
      animItem.addEventListener('_active', addPlayingCount);
      animItem.addEventListener('_idle', subtractPlayingCount);
      registeredAnimations.push({
        elem: element,
        animation: animItem
      });
      len += 1;
    }

    function loadAnimation(params, isLoadNow = true) {
      var animItem = new AnimationItem();
      setupAnimation(animItem, null);
      animItem.isLoadNow = isLoadNow;
      animItem.setParams(params);
      return animItem;
    }

    function setSpeed(val, animation) {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.setSpeed(val, animation);
      }
    }

    function setDirection(val, animation) {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.setDirection(val, animation);
      }
    }

    function play(animation) {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.play(animation);
      }
    }

    function resume(nowTime) {
      var elapsedTime = nowTime - initTime;
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.advanceTime(elapsedTime);
      }

      initTime = nowTime;

      if (playingAnimationsNum && !_isFrozen) {
        global.requestAnimationFrame(resume);
      } else {
        _stopped = true;
      }
    }

    function first(nowTime) {
      initTime = nowTime;
      global.requestAnimationFrame(resume);
    }

    function pause(animation) {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.pause(animation);
      }
    }

    function goToAndStop(value, isFrame, animation) {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.goToAndStop(value, isFrame, animation);
      }
    }

    function stop(animation) {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.stop(animation);
      }
    }

    function togglePause(animation) {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.togglePause(animation);
      }
    }

    function destroy(animation) {
      var i;

      for (i = len - 1; i >= 0; i -= 1) {
        registeredAnimations[i].animation.destroy(animation);
      }
    }

    function resize() {
      var i;

      for (i = 0; i < len; i += 1) {
        registeredAnimations[i].animation.resize();
      }
    }

    function activate() {
      if (!_isFrozen && playingAnimationsNum) {
        if (_stopped) {
          //global.requestAnimationFrame(first);
          _stopped = false;
        }
      }
    }

    function freeze() {
      _isFrozen = true;
    }

    function unfreeze() {
      _isFrozen = false;
      activate();
    }

    moduleOb.loadAnimation = loadAnimation;
    moduleOb.setSpeed = setSpeed;
    moduleOb.setDirection = setDirection;
    moduleOb.play = play;
    moduleOb.pause = pause;
    moduleOb.stop = stop;
    moduleOb.togglePause = togglePause;
    moduleOb.resize = resize; //moduleOb.start = start;

    moduleOb.goToAndStop = goToAndStop;
    moduleOb.destroy = destroy;
    moduleOb.freeze = freeze;
    moduleOb.unfreeze = unfreeze;
    moduleOb.getRegisteredAnimations = getRegisteredAnimations;
    return moduleOb;
  }();

  const lottieApi = __webpack_require__(4);

  var AnimationItem = function () {
    this._cbs = [];
    this.name = '';
    this.path = '';
    this.isLoaded = false;
    this.currentFrame = 0;
    this.currentRawFrame = 0;
    this.totalFrames = 0;
    this.frameRate = 0;
    this.frameMult = 0;
    this.playSpeed = 1;
    this.playDirection = 1;
    this.playCount = 0;
    this.isLoadNow = true;
    this.animationData = {};
    this.assets = [];
    this.segments = [];
    this.isPaused = true;
    this.autoplay = false;
    this.loop = true;
    this.params = null;
    this.renderer = null;
    this.assetsPath = '';
    this.timeCompleted = 0;
    this.segmentPos = 0;
    this.animationID = createElementID();
    this.subframeEnabled = subframeEnabled;
    this._idle = true;
    this._completedLoop = false;
    this.projectInterface = ProjectInterface();
    this.imagePreloader = new ImagePreloader();
  };

  extendPrototype([BaseEvent], AnimationItem);

  AnimationItem.prototype.setParams = function (params) {
    if (params.context) this.context = params.context;
    this.wrapper = params.wrapper || params.container || params.canvas;
    this.params = params;
    var animType = 'canvas';
    this.renderer = new CanvasRenderer(this, params.rendererSettings);
    this.renderer.setProjectInterface(this.projectInterface);
    this.animType = animType;

    if (params.loop === '' || params.loop === null) {} else if (params.loop === false) {
      this.loop = false;
    } else if (params.loop === true) {
      this.loop = true;
    } else {
      this.loop = parseInt(params.loop);
    }

    this.autoplay = 'autoplay' in params ? params.autoplay : true;
    this.name = params.name ? params.name : '';
    this.autoloadSegments = params.hasOwnProperty('autoloadSegments') ? params.autoloadSegments : true;
    this.assetsPath = params.assetsPath;

    if (params.animationData) {
      this.configAnimation(params.animationData);
    } else if (params.path) {
      if (params.path.lastIndexOf('\\') !== -1) {
        this.path = params.path.substr(0, params.path.lastIndexOf('\\') + 1);
      } else {
        this.path = params.path.substr(0, params.path.lastIndexOf('/') + 1);
      }

      this.fileName = params.path.substr(params.path.lastIndexOf('/') + 1);
      this.fileName = this.fileName.substr(0, this.fileName.lastIndexOf('.json'));
      assetLoader.load(params.path, this.configAnimation.bind(this), function () {
        this.trigger('data_failed');
      }.bind(this));
    }
  };

  AnimationItem.prototype.loadNow = function () {
    try {
      this.preloadImages();
      this.loadSegments();
      this.updaFrameModifier();
      this.waitForFontsLoaded(); //this.setupApi();
    } catch (err) {
      console.error(err);
    }
  };

  AnimationItem.prototype.includeLayers = function (data) {
    if (data.op > this.animationData.op) {
      this.animationData.op = data.op;
      this.totalFrames = Math.floor(data.op - this.animationData.ip);
    }

    var layers = this.animationData.layers;
    var i,
        len = layers.length;
    var newLayers = data.layers;
    var j,
        jLen = newLayers.length;

    for (j = 0; j < jLen; j += 1) {
      i = 0;

      while (i < len) {
        if (layers[i].id == newLayers[j].id) {
          layers[i] = newLayers[j];
          break;
        }

        i += 1;
      }
    }

    if (data.chars || data.fonts) {
      this.renderer.globalData.fontManager.addChars(data.chars);
      this.renderer.globalData.fontManager.addFonts(data.fonts, this.renderer.globalData.defs);
    }

    if (data.assets) {
      len = data.assets.length;

      for (i = 0; i < len; i += 1) {
        this.animationData.assets.push(data.assets[i]);
      }
    }

    this.animationData.__complete = false;
    dataManager.completeData(this.animationData, this.renderer.globalData.fontManager);
    this.renderer.includeLayers(data.layers);
    if (expressionsPlugin) expressionsPlugin.initExpressions(this);
    this.loadNextSegment();
  };

  AnimationItem.prototype.loadNextSegment = function () {
    var segments = this.animationData.segments;

    if (!segments || segments.length === 0 || !this.autoloadSegments) {
      this.trigger('data_ready');
      this.timeCompleted = this.totalFrames;
      return;
    }

    var segment = segments.shift();
    this.timeCompleted = segment.time * this.frameRate;
    var segmentPath = this.path + this.fileName + '_' + this.segmentPos + '.json';
    this.segmentPos += 1;
    assetLoader.load(segmentPath, this.includeLayers.bind(this), function () {
      this.trigger('data_failed');
    }.bind(this));
  };

  AnimationItem.prototype.loadSegments = function () {
    var segments = this.animationData.segments;

    if (!segments) {
      this.timeCompleted = this.totalFrames;
    }

    this.loadNextSegment();
  };

  AnimationItem.prototype.imagesLoaded = function () {
    this.trigger('loaded_images');
    this.checkLoaded();
  };

  AnimationItem.prototype.preloadImages = function () {
    this.imagePreloader.setAssetsPath(this.assetsPath);
    this.imagePreloader.setPath(this.path);
    this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this));
  };

  AnimationItem.prototype.replaceAsset = function (id, path, local = true) {
    const data = this.animationData;
    const asset = data.assets.find(a => a.id === id);

    if (asset) {
      asset.u = '';
      asset.p = path;
      asset.e = local;
    }
  };

  AnimationItem.prototype.replaceText = function (target, txt) {
    let data = JSON.stringify(this.animationData);
    data = data.replace(target, txt);
    this.animationData = JSON.parse(data);
  };

  AnimationItem.prototype.findElements = function (key) {
    const api = this.getApi();
    const elements = api.getKeyPath(key);
    return elements.getElements();
  };

  AnimationItem.prototype.configAnimation = function (animData) {
    if (!this.renderer) return;

    try {
      this.animationData = animData;
      this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip);
      this.renderer.configAnimation(animData);
      if (!animData.assets) animData.assets = [];
      this.assets = this.animationData.assets;
      this.frameRate = this.animationData.fr;
      this.firstFrame = Math.round(this.animationData.ip);
      this.frameMult = this.animationData.fr / 1000;
      this.renderer.searchExtraCompositions(animData.assets);
      this.trigger('config_ready');
      if (this.isLoadNow) this.loadNow();
    } catch (error) {
      console.error(error);
      this.triggerConfigError(error);
    }
  };

  AnimationItem.prototype.waitForFontsLoaded = function () {
    if (!this.renderer) return;
    this.checkLoaded();
  };

  AnimationItem.prototype.getApi = function () {
    if (!this.api) {
      this.api = lottieApi.createAnimationApi(this);
    }

    return this.api;
  };

  AnimationItem.prototype.checkLoaded = function () {
    if (!this.isLoaded && this.imagePreloader.loaded()) {
      this.isLoaded = true;
      dataManager.completeData(this.animationData, this.renderer.globalData.fontManager);
      if (expressionsPlugin) expressionsPlugin.initExpressions(this);
      this.renderer.initItems();
      this.gotoFrame(); // if (this.autoplay) this.play();
    }
  };

  AnimationItem.prototype.resize = function () {
    this.renderer.updateContainerSize();
  };

  AnimationItem.prototype.setSubframe = function (flag) {
    this.subframeEnabled = flag ? true : false;
  };

  AnimationItem.prototype.gotoFrame = function () {
    this.currentFrame = this.subframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame;

    if (this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted) {
      this.currentFrame = this.timeCompleted;
    }

    this.trigger('enterFrame');
    this.renderFrame();
  };

  AnimationItem.prototype.renderFrame = function () {
    if (this.isLoaded === false) return;

    try {
      this.renderer.renderFrame(this.currentFrame + this.firstFrame);
    } catch (error) {
      console.log(error);
      this.triggerRenderFrameError(error);
    }
  };

  AnimationItem.prototype.play = function (name) {
    if (name && this.name != name) {
      return;
    }

    if (this.isPaused === true) {
      this.isPaused = false;

      if (this._idle) {
        this._idle = false;
        this.trigger('_active');
      }
    }
  };

  AnimationItem.prototype.pause = function (name) {
    if (name && this.name != name) {
      return;
    }

    if (this.isPaused === false) {
      this.isPaused = true;
      this._idle = true;
      this.trigger('_idle');
    }
  };

  AnimationItem.prototype.togglePause = function (name) {
    if (name && this.name != name) {
      return;
    }

    if (this.isPaused === true) {
      this.play();
    } else {
      this.pause();
    }
  };

  AnimationItem.prototype.stop = function (name) {
    if (name && this.name != name) {
      return;
    }

    this.pause();
    this.playCount = 0;
    this._completedLoop = false;
    this.setCurrentRawFrameAndGoto(0);
  };

  AnimationItem.prototype.goToAndStop = function (value, isFrame, name) {
    if (name && this.name != name) {
      return;
    }

    if (isFrame) {
      this.setCurrentRawFrameAndGoto(value);
    } else {
      this.setCurrentRawFrameAndGoto(value * this.frameModifier);
    }

    this.pause();
  };

  AnimationItem.prototype.goToAndPlay = function (value, isFrame, name) {
    this.goToAndStop(value, isFrame, name);
    this.play();
  };

  AnimationItem.prototype.advanceTime = function (value) {
    if (this.isPaused === true || this.isLoaded === false) {
      return;
    }

    var nextValue = this.currentRawFrame + value * this.frameModifier;
    var _isComplete = false; // 检查 nextValue > totalFrames - 1 是否用于处理非循环和循环动画。
    // 如果动画不循环，它应该在 totalFrames - 1 处停止。如果它会循环，它应该完成最后一帧然后循环。

    if (nextValue >= this.totalFrames - 1 && this.frameModifier > 0) {
      if (!this.loop || this.playCount === this.loop) {
        if (!this.checkSegments(nextValue > this.totalFrames ? nextValue % this.totalFrames : 0)) {
          _isComplete = true;
          nextValue = this.totalFrames - 1;
        }
      } else if (nextValue >= this.totalFrames) {
        this.playCount += 1;

        if (!this.checkSegments(nextValue % this.totalFrames)) {
          this.setCurrentRawFrameAndGoto(nextValue % this.totalFrames);
          this._completedLoop = true;
          this.trigger('loopComplete');
        }
      } else {
        this.setCurrentRawFrameAndGoto(nextValue);
      }
    } else if (nextValue < 0) {
      if (!this.checkSegments(nextValue % this.totalFrames)) {
        if (this.loop && !(this.playCount-- <= 0 && this.loop !== true)) {
          this.setCurrentRawFrameAndGoto(this.totalFrames + nextValue % this.totalFrames);

          if (!this._completedLoop) {
            this._completedLoop = true;
          } else {
            this.trigger('loopComplete');
          }
        } else {
          _isComplete = true;
          nextValue = 0;
        }
      }
    } else {
      this.setCurrentRawFrameAndGoto(nextValue);
    }

    if (_isComplete) {
      this.setCurrentRawFrameAndGoto(nextValue);
      this.pause();
      this.trigger('complete');
    }
  };

  AnimationItem.prototype.adjustSegment = function (arr, offset) {
    this.playCount = 0;

    if (arr[1] < arr[0]) {
      if (this.frameModifier > 0) {
        if (this.playSpeed < 0) {
          this.setSpeed(-this.playSpeed);
        } else {
          this.setDirection(-1);
        }
      }

      this.timeCompleted = this.totalFrames = arr[0] - arr[1];
      this.firstFrame = arr[1];
      this.setCurrentRawFrameAndGoto(this.totalFrames - 0.001 - offset);
    } else if (arr[1] > arr[0]) {
      if (this.frameModifier < 0) {
        if (this.playSpeed < 0) {
          this.setSpeed(-this.playSpeed);
        } else {
          this.setDirection(1);
        }
      }

      this.timeCompleted = this.totalFrames = arr[1] - arr[0];
      this.firstFrame = arr[0];
      this.setCurrentRawFrameAndGoto(0.001 + offset);
    }

    this.trigger('segmentStart');
  };

  AnimationItem.prototype.setSegment = function (init, end) {
    var pendingFrame = -1;

    if (this.isPaused) {
      if (this.currentRawFrame + this.firstFrame < init) {
        pendingFrame = init;
      } else if (this.currentRawFrame + this.firstFrame > end) {
        pendingFrame = end - init;
      }
    }

    this.firstFrame = init;
    this.timeCompleted = this.totalFrames = end - init;

    if (pendingFrame !== -1) {
      this.goToAndStop(pendingFrame, true);
    }
  };

  AnimationItem.prototype.playSegments = function (arr, forceFlag) {
    if (forceFlag) {
      this.segments.length = 0;
    }

    if (typeof arr[0] === 'object') {
      var i,
          len = arr.length;

      for (i = 0; i < len; i += 1) {
        this.segments.push(arr[i]);
      }
    } else {
      this.segments.push(arr);
    }

    if (this.segments.length && forceFlag) {
      this.adjustSegment(this.segments.shift(), 0);
    }

    if (this.isPaused) {
      this.play();
    }
  };

  AnimationItem.prototype.resetSegments = function (forceFlag) {
    this.segments.length = 0;
    this.segments.push([this.animationData.ip, this.animationData.op]); //this.segments.push([this.animationData.ip*this.frameRate,Math.floor(this.animationData.op - this.animationData.ip+this.animationData.ip*this.frameRate)]);

    if (forceFlag) {
      this.checkSegments(0);
    }
  };

  AnimationItem.prototype.checkSegments = function (offset) {
    if (this.segments.length) {
      this.adjustSegment(this.segments.shift(), offset);
      return true;
    }

    return false;
  };

  AnimationItem.prototype.destroy = function (name) {
    if (name && this.name != name || !this.renderer) {
      return;
    }

    this.renderer.destroy();
    this.imagePreloader.destroy();
    this.trigger('destroy');
    this.onEnterFrame = this.onLoopComplete = this.onComplete = this.onSegmentStart = this.onDestroy = null;
    this.renderer = null;
    this.imagePreloader = null;
    this.animationData = null;
    this.params = null;
    this._cbs = null;
  };

  AnimationItem.prototype.setCurrentRawFrameAndGoto = function (value) {
    this.currentRawFrame = value;
    this.gotoFrame();
  };

  AnimationItem.prototype.setSpeed = function (val) {
    this.playSpeed = val;
    this.updaFrameModifier();
  };

  AnimationItem.prototype.nextFrame = function () {
    this.currentRawFrame++;
    this.gotoFrame();
  };

  AnimationItem.prototype.render = function (delta) {
    this.isPaused = false;
    this.advanceTime(delta);
  };

  AnimationItem.prototype.setDirection = function (val) {
    this.playDirection = val < 0 ? -1 : 1;
    this.updaFrameModifier();
  };

  AnimationItem.prototype.updaFrameModifier = function () {
    // 0.03 0.03 1 1
    this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;
  };

  AnimationItem.prototype.getPath = function () {
    return this.path;
  };

  AnimationItem.prototype.getAssetsPath = function (assetData) {
    var path = '';

    if (assetData.e) {
      path = assetData.p;
    } else if (this.assetsPath) {
      var imagePath = assetData.p;

      if (imagePath.indexOf('images/') !== -1) {
        imagePath = imagePath.split('/')[1];
      }

      path = this.assetsPath + imagePath;
    } else {
      path = this.path;
      path += assetData.u ? assetData.u : '';
      path += assetData.p;
    }

    return path;
  };

  AnimationItem.prototype.getAssetData = function (id) {
    var i = 0,
        len = this.assets.length;

    while (i < len) {
      if (id == this.assets[i].id) {
        return this.assets[i];
      }

      i += 1;
    }
  };

  AnimationItem.prototype.hide = function () {
    this.renderer.hide();
  };

  AnimationItem.prototype.show = function () {
    this.renderer.show();
  };

  AnimationItem.prototype.getDuration = function (isFrame) {
    return isFrame ? this.totalFrames : this.totalFrames / this.frameRate;
  };

  AnimationItem.prototype.trigger = function (name) {
    if (this._cbs && this._cbs[name]) {
      switch (name) {
        case 'enterFrame':
          this.triggerEvent(name, new BMEnterFrameEvent(name, this.currentFrame, this.totalFrames, this.frameModifier));
          break;

        case 'loopComplete':
          this.triggerEvent(name, new BMCompleteLoopEvent(name, this.loop, this.playCount, this.frameMult));
          break;

        case 'complete':
          this.triggerEvent(name, new BMCompleteEvent(name, this.frameMult));
          break;

        case 'segmentStart':
          this.triggerEvent(name, new BMSegmentStartEvent(name, this.firstFrame, this.totalFrames));
          break;

        case 'destroy':
          this.triggerEvent(name, new BMDestroyEvent(name, this));
          break;

        default:
          this.triggerEvent(name);
      }
    }

    if (name === 'enterFrame' && this.onEnterFrame) {
      this.onEnterFrame.call(this, new BMEnterFrameEvent(name, this.currentFrame, this.totalFrames, this.frameMult));
    }

    if (name === 'loopComplete' && this.onLoopComplete) {
      this.onLoopComplete.call(this, new BMCompleteLoopEvent(name, this.loop, this.playCount, this.frameMult));
    }

    if (name === 'complete' && this.onComplete) {
      this.onComplete.call(this, new BMCompleteEvent(name, this.frameMult));
    }

    if (name === 'segmentStart' && this.onSegmentStart) {
      this.onSegmentStart.call(this, new BMSegmentStartEvent(name, this.firstFrame, this.totalFrames));
    }

    if (name === 'destroy' && this.onDestroy) {
      this.onDestroy.call(this, new BMDestroyEvent(name, this));
    }
  };

  AnimationItem.prototype.triggerRenderFrameError = function (nativeError) {
    var error = new BMRenderFrameErrorEvent(nativeError, this.currentFrame);
    this.triggerEvent('error', error);

    if (this.onError) {
      this.onError.call(this, error);
    }
  };

  AnimationItem.prototype.triggerConfigError = function (nativeError) {
    var error = new BMConfigErrorEvent(nativeError, this.currentFrame);
    this.triggerEvent('error', error);

    if (this.onError) {
      this.onError.call(this, error);
    }
  };

  var Expressions = function () {
    var ob = {};
    ob.initExpressions = initExpressions;

    function initExpressions(animation) {
      var stackCount = 0;
      var registers = [];

      function pushExpression() {
        stackCount += 1;
      }

      function popExpression() {
        stackCount -= 1;

        if (stackCount === 0) {
          releaseInstances();
        }
      }

      function registerExpressionProperty(expression) {
        if (registers.indexOf(expression) === -1) {
          registers.push(expression);
        }
      }

      function releaseInstances() {
        var i,
            len = registers.length;

        for (i = 0; i < len; i += 1) {
          registers[i].release();
        }

        registers.length = 0;
      }

      animation.renderer.compInterface = CompExpressionInterface(animation.renderer);
      animation.renderer.globalData.projectInterface.registerComposition(animation.renderer);
      animation.renderer.globalData.pushExpression = pushExpression;
      animation.renderer.globalData.popExpression = popExpression;
      animation.renderer.globalData.registerExpressionProperty = registerExpressionProperty;
    }

    return ob;
  }();

  expressionsPlugin = Expressions;

  var ExpressionManager = function () {
    'use strict';

    var ob = {};
    var Math = BMMath;
    var document = null;

    function $bm_isInstanceOfArray(arr) {
      return arr.constructor === Array || arr.constructor === Float32Array;
    }

    function isNumerable(tOfV, v) {
      return tOfV === 'number' || tOfV === 'boolean' || tOfV === 'string' || v instanceof Number;
    }

    function $bm_neg(a) {
      var tOfA = typeof a;

      if (tOfA === 'number' || tOfA === 'boolean' || a instanceof Number) {
        return -a;
      }

      if ($bm_isInstanceOfArray(a)) {
        var i,
            lenA = a.length;
        var retArr = [];

        for (i = 0; i < lenA; i += 1) {
          retArr[i] = -a[i];
        }

        return retArr;
      }

      if (a.propType) {
        return a.v;
      }
    }

    var easeInBez = BezierFactory.getBezierEasing(0.333, 0, .833, .833, 'easeIn').get;
    var easeOutBez = BezierFactory.getBezierEasing(0.167, 0.167, .667, 1, 'easeOut').get;
    var easeInOutBez = BezierFactory.getBezierEasing(.33, 0, .667, 1, 'easeInOut').get;

    function sum(a, b) {
      var tOfA = typeof a;
      var tOfB = typeof b;

      if (tOfA === 'string' || tOfB === 'string') {
        return a + b;
      }

      if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
        return a + b;
      }

      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
        a = a.slice(0);
        a[0] = a[0] + b;
        return a;
      }

      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
        b = b.slice(0);
        b[0] = a + b[0];
        return b;
      }

      if ($bm_isInstanceOfArray(a) && $bm_isInstanceOfArray(b)) {
        var i = 0,
            lenA = a.length,
            lenB = b.length;
        var retArr = [];

        while (i < lenA || i < lenB) {
          if ((typeof a[i] === 'number' || a[i] instanceof Number) && (typeof b[i] === 'number' || b[i] instanceof Number)) {
            retArr[i] = a[i] + b[i];
          } else {
            retArr[i] = b[i] === undefined ? a[i] : a[i] || b[i];
          }

          i += 1;
        }

        return retArr;
      }

      return 0;
    }

    var add = sum;

    function sub(a, b) {
      var tOfA = typeof a;
      var tOfB = typeof b;

      if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
        if (tOfA === 'string') {
          a = parseInt(a);
        }

        if (tOfB === 'string') {
          b = parseInt(b);
        }

        return a - b;
      }

      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
        a = a.slice(0);
        a[0] = a[0] - b;
        return a;
      }

      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
        b = b.slice(0);
        b[0] = a - b[0];
        return b;
      }

      if ($bm_isInstanceOfArray(a) && $bm_isInstanceOfArray(b)) {
        var i = 0,
            lenA = a.length,
            lenB = b.length;
        var retArr = [];

        while (i < lenA || i < lenB) {
          if ((typeof a[i] === 'number' || a[i] instanceof Number) && (typeof b[i] === 'number' || b[i] instanceof Number)) {
            retArr[i] = a[i] - b[i];
          } else {
            retArr[i] = b[i] === undefined ? a[i] : a[i] || b[i];
          }

          i += 1;
        }

        return retArr;
      }

      return 0;
    }

    function mul(a, b) {
      var tOfA = typeof a;
      var tOfB = typeof b;
      var arr;

      if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
        return a * b;
      }

      var i, len;

      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
        len = a.length;
        arr = createTypedArray('float32', len);

        for (i = 0; i < len; i += 1) {
          arr[i] = a[i] * b;
        }

        return arr;
      }

      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
        len = b.length;
        arr = createTypedArray('float32', len);

        for (i = 0; i < len; i += 1) {
          arr[i] = a * b[i];
        }

        return arr;
      }

      return 0;
    }

    function div(a, b) {
      var tOfA = typeof a;
      var tOfB = typeof b;
      var arr;

      if (isNumerable(tOfA, a) && isNumerable(tOfB, b)) {
        return a / b;
      }

      var i, len;

      if ($bm_isInstanceOfArray(a) && isNumerable(tOfB, b)) {
        len = a.length;
        arr = createTypedArray('float32', len);

        for (i = 0; i < len; i += 1) {
          arr[i] = a[i] / b;
        }

        return arr;
      }

      if (isNumerable(tOfA, a) && $bm_isInstanceOfArray(b)) {
        len = b.length;
        arr = createTypedArray('float32', len);

        for (i = 0; i < len; i += 1) {
          arr[i] = a / b[i];
        }

        return arr;
      }

      return 0;
    }

    function mod(a, b) {
      if (typeof a === 'string') {
        a = parseInt(a);
      }

      if (typeof b === 'string') {
        b = parseInt(b);
      }

      return a % b;
    }

    var $bm_sum = sum;
    var $bm_sub = sub;
    var $bm_mul = mul;
    var $bm_div = div;
    var $bm_mod = mod;

    function clamp(num, min, max) {
      if (min > max) {
        var mm = max;
        max = min;
        min = mm;
      }

      return Math.min(Math.max(num, min), max);
    }

    function radiansToDegrees(val) {
      return val / degToRads;
    }

    var radians_to_degrees = radiansToDegrees;

    function degreesToRadians(val) {
      return val * degToRads;
    }

    var degrees_to_radians = radiansToDegrees;
    var helperLengthArray = [0, 0, 0, 0, 0, 0];

    function length(arr1, arr2) {
      if (typeof arr1 === 'number' || arr1 instanceof Number) {
        arr2 = arr2 || 0;
        return Math.abs(arr1 - arr2);
      }

      if (!arr2) {
        arr2 = helperLengthArray;
      }

      var i,
          len = Math.min(arr1.length, arr2.length);
      var addedLength = 0;

      for (i = 0; i < len; i += 1) {
        addedLength += Math.pow(arr2[i] - arr1[i], 2);
      }

      return Math.sqrt(addedLength);
    }

    function normalize(vec) {
      return div(vec, length(vec));
    }

    function rgbToHsl(val) {
      var r = val[0];
      var g = val[1];
      var b = val[2];
      var max = Math.max(r, g, b),
          min = Math.min(r, g, b);
      var h,
          s,
          l = (max + min) / 2;

      if (max == min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;

          case g:
            h = (b - r) / d + 2;
            break;

          case b:
            h = (r - g) / d + 4;
            break;
        }

        h /= 6;
      }

      return [h, s, l, val[3]];
    }

    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    function hslToRgb(val) {
      var h = val[0];
      var s = val[1];
      var l = val[2];
      var r, g, b;

      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return [r, g, b, val[3]];
    }

    function linear(t, tMin, tMax, value1, value2) {
      if (value1 === undefined || value2 === undefined) {
        value1 = tMin;
        value2 = tMax;
        tMin = 0;
        tMax = 1;
      }

      if (tMax < tMin) {
        var _tMin = tMax;
        tMax = tMin;
        tMin = _tMin;
      }

      if (t <= tMin) {
        return value1;
      } else if (t >= tMax) {
        return value2;
      }

      var perc = tMax === tMin ? 0 : (t - tMin) / (tMax - tMin);

      if (!value1.length) {
        return value1 + (value2 - value1) * perc;
      }

      var i,
          len = value1.length;
      var arr = createTypedArray('float32', len);

      for (i = 0; i < len; i += 1) {
        arr[i] = value1[i] + (value2[i] - value1[i]) * perc;
      }

      return arr;
    }

    function random(min, max) {
      if (max === undefined) {
        if (min === undefined) {
          min = 0;
          max = 1;
        } else {
          max = min;
          min = undefined;
        }
      }

      if (max.length) {
        var i,
            len = max.length;

        if (!min) {
          min = createTypedArray('float32', len);
        }

        var arr = createTypedArray('float32', len);
        var rnd = BMMath.random();

        for (i = 0; i < len; i += 1) {
          arr[i] = min[i] + rnd * (max[i] - min[i]);
        }

        return arr;
      }

      if (min === undefined) {
        min = 0;
      }

      var rndm = BMMath.random();
      return min + rndm * (max - min);
    }

    function createPath(points, inTangents, outTangents, closed) {
      var i,
          len = points.length;
      var path = shape_pool.newElement();
      path.setPathData(!!closed, len);
      var arrPlaceholder = [0, 0],
          inVertexPoint,
          outVertexPoint;

      for (i = 0; i < len; i += 1) {
        inVertexPoint = inTangents && inTangents[i] ? inTangents[i] : arrPlaceholder;
        outVertexPoint = outTangents && outTangents[i] ? outTangents[i] : arrPlaceholder;
        path.setTripleAt(points[i][0], points[i][1], outVertexPoint[0] + points[i][0], outVertexPoint[1] + points[i][1], inVertexPoint[0] + points[i][0], inVertexPoint[1] + points[i][1], i, true);
      }

      return path;
    }

    function initiateExpression(elem, data, property) {
      var val = data.x;
      var needsVelocity = /velocity(?![\w\d])/.test(val);

      var _needsRandom = val.indexOf('random') !== -1;

      var elemType = elem.data.ty;
      var transform, $bm_transform, content, effect;
      var thisProperty = property;
      thisProperty.valueAtTime = thisProperty.getValueAtTime;
      Object.defineProperty(thisProperty, 'value', {
        get: function () {
          return thisProperty.v;
        }
      });
      elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate;
      elem.comp.displayStartTime = 0;
      var inPoint = elem.data.ip / elem.comp.globalData.frameRate;
      var outPoint = elem.data.op / elem.comp.globalData.frameRate;
      var width = elem.data.sw ? elem.data.sw : 0;
      var height = elem.data.sh ? elem.data.sh : 0;
      var name = elem.data.nm;
      var loopIn, loop_in, loopOut, loop_out, smooth;
      var toWorld, fromWorld, fromComp, toComp, fromCompToSurface, position, rotation, anchorPoint, scale, thisLayer, thisComp, mask, valueAtTime, velocityAtTime;
      var __expression_functions = [];

      if (data.xf) {
        var i,
            len = data.xf.length;

        for (i = 0; i < len; i += 1) {
          __expression_functions[i] = eval('(function(){ return ' + data.xf[i] + '}())');
        }
      }

      var scoped_bm_rt;
      var expression_function = eval('[function _expression_function(){' + val + ';scoped_bm_rt=$bm_rt}' + ']')[0];
      var numKeys = property.kf ? data.k.length : 0;
      var active = !this.data || this.data.hd !== true;

      var wiggle = function wiggle(freq, amp) {
        var i,
            j,
            len = this.pv.length ? this.pv.length : 1;
        var addedAmps = createTypedArray('float32', len);
        freq = 5;
        var iterations = Math.floor(time * freq);
        i = 0;
        j = 0;

        while (i < iterations) {
          //var rnd = BMMath.random();
          for (j = 0; j < len; j += 1) {
            addedAmps[j] += -amp + amp * 2 * BMMath.random(); //addedAmps[j] += -amp + amp*2*rnd;
          }

          i += 1;
        } //var rnd2 = BMMath.random();


        var periods = time * freq;
        var perc = periods - Math.floor(periods);
        var arr = createTypedArray('float32', len);

        if (len > 1) {
          for (j = 0; j < len; j += 1) {
            arr[j] = this.pv[j] + addedAmps[j] + (-amp + amp * 2 * BMMath.random()) * perc; //arr[j] = this.pv[j] + addedAmps[j] + (-amp + amp*2*rnd)*perc;
            //arr[i] = this.pv[i] + addedAmp + amp1*perc + amp2*(1-perc);
          }

          return arr;
        } else {
          return this.pv + addedAmps[0] + (-amp + amp * 2 * BMMath.random()) * perc;
        }
      }.bind(this);

      if (thisProperty.loopIn) {
        loopIn = thisProperty.loopIn.bind(thisProperty);
        loop_in = loopIn;
      }

      if (thisProperty.loopOut) {
        loopOut = thisProperty.loopOut.bind(thisProperty);
        loop_out = loopOut;
      }

      if (thisProperty.smooth) {
        smooth = thisProperty.smooth.bind(thisProperty);
      }

      function loopInDuration(type, duration) {
        return loopIn(type, duration, true);
      }

      function loopOutDuration(type, duration) {
        return loopOut(type, duration, true);
      }

      if (this.getValueAtTime) {
        valueAtTime = this.getValueAtTime.bind(this);
      }

      if (this.getVelocityAtTime) {
        velocityAtTime = this.getVelocityAtTime.bind(this);
      }

      var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface);

      function lookAt(elem1, elem2) {
        var fVec = [elem2[0] - elem1[0], elem2[1] - elem1[1], elem2[2] - elem1[2]];
        var pitch = Math.atan2(fVec[0], Math.sqrt(fVec[1] * fVec[1] + fVec[2] * fVec[2])) / degToRads;
        var yaw = -Math.atan2(fVec[1], fVec[2]) / degToRads;
        return [yaw, pitch, 0];
      }

      function easeOut(t, tMin, tMax, val1, val2) {
        return applyEase(easeOutBez, t, tMin, tMax, val1, val2);
      }

      function easeIn(t, tMin, tMax, val1, val2) {
        return applyEase(easeInBez, t, tMin, tMax, val1, val2);
      }

      function ease(t, tMin, tMax, val1, val2) {
        return applyEase(easeInOutBez, t, tMin, tMax, val1, val2);
      }

      function applyEase(fn, t, tMin, tMax, val1, val2) {
        if (val1 === undefined) {
          val1 = tMin;
          val2 = tMax;
        } else {
          t = (t - tMin) / (tMax - tMin);
        }

        t = t > 1 ? 1 : t < 0 ? 0 : t;
        var mult = fn(t);

        if ($bm_isInstanceOfArray(val1)) {
          var i,
              len = val1.length;
          var arr = createTypedArray('float32', len);

          for (i = 0; i < len; i += 1) {
            arr[i] = (val2[i] - val1[i]) * mult + val1[i];
          }

          return arr;
        } else {
          return (val2 - val1) * mult + val1;
        }
      }

      function nearestKey(time) {
        var i,
            len = data.k.length,
            index,
            keyTime;

        if (!data.k.length || typeof data.k[0] === 'number') {
          index = 0;
          keyTime = 0;
        } else {
          index = -1;
          time *= elem.comp.globalData.frameRate;

          if (time < data.k[0].t) {
            index = 1;
            keyTime = data.k[0].t;
          } else {
            for (i = 0; i < len - 1; i += 1) {
              if (time === data.k[i].t) {
                index = i + 1;
                keyTime = data.k[i].t;
                break;
              } else if (time > data.k[i].t && time < data.k[i + 1].t) {
                if (time - data.k[i].t > data.k[i + 1].t - time) {
                  index = i + 2;
                  keyTime = data.k[i + 1].t;
                } else {
                  index = i + 1;
                  keyTime = data.k[i].t;
                }

                break;
              }
            }

            if (index === -1) {
              index = i + 1;
              keyTime = data.k[i].t;
            }
          }
        }

        var ob = {};
        ob.index = index;
        ob.time = keyTime / elem.comp.globalData.frameRate;
        return ob;
      }

      function key(ind) {
        var ob, i, len;

        if (!data.k.length || typeof data.k[0] === 'number') {
          throw new Error('The property has no keyframe at index ' + ind);
        }

        ind -= 1;
        ob = {
          time: data.k[ind].t / elem.comp.globalData.frameRate,
          value: []
        };
        var arr = data.k[ind].hasOwnProperty('s') ? data.k[ind].s : data.k[ind - 1].e;
        len = arr.length;

        for (i = 0; i < len; i += 1) {
          ob[i] = arr[i];
          ob.value[i] = arr[i];
        }

        return ob;
      }

      function framesToTime(frames, fps) {
        if (!fps) {
          fps = elem.comp.globalData.frameRate;
        }

        return frames / fps;
      }

      function timeToFrames(t, fps) {
        if (!t && t !== 0) {
          t = time;
        }

        if (!fps) {
          fps = elem.comp.globalData.frameRate;
        }

        return t * fps;
      }

      function seedRandom(seed) {
        BMMath.seedrandom(randSeed + seed);
      }

      function sourceRectAtTime() {
        return elem.sourceRectAtTime();
      }

      function substring(init, end) {
        if (typeof value === 'string') {
          if (end === undefined) {
            return value.substring(init);
          }

          return value.substring(init, end);
        }

        return '';
      }

      function substr(init, end) {
        if (typeof value === 'string') {
          if (end === undefined) {
            return value.substr(init);
          }

          return value.substr(init, end);
        }

        return '';
      }

      var time, velocity, value, text, textIndex, textTotal, selectorValue;
      var index = elem.data.ind;
      var hasParent = !!(elem.hierarchy && elem.hierarchy.length);
      var parent;
      var randSeed = Math.floor(Math.random() * 1000000);
      var globalData = elem.globalData;

      function executeExpression(_value) {
        // globalData.pushExpression();
        value = _value;

        if (_needsRandom) {
          seedRandom(randSeed);
        }

        if (this.frameExpressionId === elem.globalData.frameId && this.propType !== 'textSelector') {
          return value;
        }

        if (this.propType === 'textSelector') {
          textIndex = this.textIndex;
          textTotal = this.textTotal;
          selectorValue = this.selectorValue;
        }

        if (!thisLayer) {
          text = elem.layerInterface.text;
          thisLayer = elem.layerInterface;
          thisComp = elem.comp.compInterface;
          toWorld = thisLayer.toWorld.bind(thisLayer);
          fromWorld = thisLayer.fromWorld.bind(thisLayer);
          fromComp = thisLayer.fromComp.bind(thisLayer);
          toComp = thisLayer.toComp.bind(thisLayer);
          mask = thisLayer.mask ? thisLayer.mask.bind(thisLayer) : null;
          fromCompToSurface = fromComp;
        }

        if (!transform) {
          transform = elem.layerInterface("ADBE Transform Group");
          $bm_transform = transform;

          if (transform) {
            anchorPoint = transform.anchorPoint;
            /*position = transform.position;
            rotation = transform.rotation;
            scale = transform.scale;*/
          }
        }

        if (elemType === 4 && !content) {
          content = thisLayer("ADBE Root Vectors Group");
        }

        if (!effect) {
          effect = thisLayer(4);
        }

        hasParent = !!(elem.hierarchy && elem.hierarchy.length);

        if (hasParent && !parent) {
          parent = elem.hierarchy[0].layerInterface;
        }

        time = this.comp.renderedFrame / this.comp.globalData.frameRate;

        if (needsVelocity) {
          velocity = velocityAtTime(time);
        }

        expression_function();
        this.frameExpressionId = elem.globalData.frameId; //TODO: Check if it's possible to return on ShapeInterface the .v value

        if (scoped_bm_rt.propType === "shape") {
          scoped_bm_rt = scoped_bm_rt.v;
        } // globalData.popExpression();


        return scoped_bm_rt;
      }

      return executeExpression;
    }

    ob.initiateExpression = initiateExpression;
    return ob;
  }();

  var expressionHelpers = function () {
    function searchExpressions(elem, data, prop) {
      if (data.x) {
        prop.k = true;
        prop.x = true;
        prop.initiateExpression = ExpressionManager.initiateExpression;
        prop.effectsSequence.push(prop.initiateExpression(elem, data, prop).bind(prop));
      }
    }

    function getValueAtTime(frameNum) {
      frameNum *= this.elem.globalData.frameRate;
      frameNum -= this.offsetTime;

      if (frameNum !== this._cachingAtTime.lastFrame) {
        this._cachingAtTime.lastIndex = this._cachingAtTime.lastFrame < frameNum ? this._cachingAtTime.lastIndex : 0;
        this._cachingAtTime.value = this.interpolateValue(frameNum, this._cachingAtTime);
        this._cachingAtTime.lastFrame = frameNum;
      }

      return this._cachingAtTime.value;
    }

    function getSpeedAtTime(frameNum) {
      var delta = -0.01;
      var v1 = this.getValueAtTime(frameNum);
      var v2 = this.getValueAtTime(frameNum + delta);
      var speed = 0;

      if (v1.length) {
        var i;

        for (i = 0; i < v1.length; i += 1) {
          speed += Math.pow(v2[i] - v1[i], 2);
        }

        speed = Math.sqrt(speed) * 100;
      } else {
        speed = 0;
      }

      return speed;
    }

    function getVelocityAtTime(frameNum) {
      if (this.vel !== undefined) {
        return this.vel;
      }

      var delta = -0.001; //frameNum += this.elem.data.st;

      var v1 = this.getValueAtTime(frameNum);
      var v2 = this.getValueAtTime(frameNum + delta);
      var velocity;

      if (v1.length) {
        velocity = createTypedArray('float32', v1.length);
        var i;

        for (i = 0; i < v1.length; i += 1) {
          //removing frameRate
          //if needed, don't add it here
          //velocity[i] = this.elem.globalData.frameRate*((v2[i] - v1[i])/delta);
          velocity[i] = (v2[i] - v1[i]) / delta;
        }
      } else {
        velocity = (v2 - v1) / delta;
      }

      return velocity;
    }

    function getStaticValueAtTime() {
      return this.pv;
    }

    function setGroupProperty(propertyGroup) {
      this.propertyGroup = propertyGroup;
    }

    return {
      searchExpressions: searchExpressions,
      getSpeedAtTime: getSpeedAtTime,
      getVelocityAtTime: getVelocityAtTime,
      getValueAtTime: getValueAtTime,
      getStaticValueAtTime: getStaticValueAtTime,
      setGroupProperty: setGroupProperty
    };
  }();

  (function addPropertyDecorator() {
    function loopOut(type, duration, durationFlag) {
      if (!this.k || !this.keyframes) {
        return this.pv;
      }

      type = type ? type.toLowerCase() : '';
      var currentFrame = this.comp.renderedFrame;
      var keyframes = this.keyframes;
      var lastKeyFrame = keyframes[keyframes.length - 1].t;

      if (currentFrame <= lastKeyFrame) {
        return this.pv;
      } else {
        var cycleDuration, firstKeyFrame;

        if (!durationFlag) {
          if (!duration || duration > keyframes.length - 1) {
            duration = keyframes.length - 1;
          }

          firstKeyFrame = keyframes[keyframes.length - 1 - duration].t;
          cycleDuration = lastKeyFrame - firstKeyFrame;
        } else {
          if (!duration) {
            cycleDuration = Math.max(0, lastKeyFrame - this.elem.data.ip);
          } else {
            cycleDuration = Math.abs(lastKeyFrame - elem.comp.globalData.frameRate * duration);
          }

          firstKeyFrame = lastKeyFrame - cycleDuration;
        }

        var i, len, ret;

        if (type === 'pingpong') {
          var iterations = Math.floor((currentFrame - firstKeyFrame) / cycleDuration);

          if (iterations % 2 !== 0) {
            return this.getValueAtTime((cycleDuration - (currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
          }
        } else if (type === 'offset') {
          var initV = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
          var endV = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
          var current = this.getValueAtTime(((currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
          var repeats = Math.floor((currentFrame - firstKeyFrame) / cycleDuration);

          if (this.pv.length) {
            ret = new Array(initV.length);
            len = ret.length;

            for (i = 0; i < len; i += 1) {
              ret[i] = (endV[i] - initV[i]) * repeats + current[i];
            }

            return ret;
          }

          return (endV - initV) * repeats + current;
        } else if (type === 'continue') {
          var lastValue = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
          var nextLastValue = this.getValueAtTime((lastKeyFrame - 0.001) / this.comp.globalData.frameRate, 0);

          if (this.pv.length) {
            ret = new Array(lastValue.length);
            len = ret.length;

            for (i = 0; i < len; i += 1) {
              ret[i] = lastValue[i] + (lastValue[i] - nextLastValue[i]) * ((currentFrame - lastKeyFrame) / this.comp.globalData.frameRate) / 0.0005;
            }

            return ret;
          }

          return lastValue + (lastValue - nextLastValue) * ((currentFrame - lastKeyFrame) / 0.001);
        }

        return this.getValueAtTime(((currentFrame - firstKeyFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
      }
    }

    function loopIn(type, duration, durationFlag) {
      if (!this.k) {
        return this.pv;
      }

      type = type ? type.toLowerCase() : '';
      var currentFrame = this.comp.renderedFrame;
      var keyframes = this.keyframes;
      var firstKeyFrame = keyframes[0].t;

      if (currentFrame >= firstKeyFrame) {
        return this.pv;
      } else {
        var cycleDuration, lastKeyFrame;

        if (!durationFlag) {
          if (!duration || duration > keyframes.length - 1) {
            duration = keyframes.length - 1;
          }

          lastKeyFrame = keyframes[duration].t;
          cycleDuration = lastKeyFrame - firstKeyFrame;
        } else {
          if (!duration) {
            cycleDuration = Math.max(0, this.elem.data.op - firstKeyFrame);
          } else {
            cycleDuration = Math.abs(elem.comp.globalData.frameRate * duration);
          }

          lastKeyFrame = firstKeyFrame + cycleDuration;
        }

        var i, len, ret;

        if (type === 'pingpong') {
          var iterations = Math.floor((firstKeyFrame - currentFrame) / cycleDuration);

          if (iterations % 2 === 0) {
            return this.getValueAtTime(((firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
          }
        } else if (type === 'offset') {
          var initV = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
          var endV = this.getValueAtTime(lastKeyFrame / this.comp.globalData.frameRate, 0);
          var current = this.getValueAtTime((cycleDuration - (firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
          var repeats = Math.floor((firstKeyFrame - currentFrame) / cycleDuration) + 1;

          if (this.pv.length) {
            ret = new Array(initV.length);
            len = ret.length;

            for (i = 0; i < len; i += 1) {
              ret[i] = current[i] - (endV[i] - initV[i]) * repeats;
            }

            return ret;
          }

          return current - (endV - initV) * repeats;
        } else if (type === 'continue') {
          var firstValue = this.getValueAtTime(firstKeyFrame / this.comp.globalData.frameRate, 0);
          var nextFirstValue = this.getValueAtTime((firstKeyFrame + 0.001) / this.comp.globalData.frameRate, 0);

          if (this.pv.length) {
            ret = new Array(firstValue.length);
            len = ret.length;

            for (i = 0; i < len; i += 1) {
              ret[i] = firstValue[i] + (firstValue[i] - nextFirstValue[i]) * (firstKeyFrame - currentFrame) / 0.001;
            }

            return ret;
          }

          return firstValue + (firstValue - nextFirstValue) * (firstKeyFrame - currentFrame) / 0.001;
        }

        return this.getValueAtTime((cycleDuration - (firstKeyFrame - currentFrame) % cycleDuration + firstKeyFrame) / this.comp.globalData.frameRate, 0);
      }
    }

    function smooth(width, samples) {
      if (!this.k) {
        return this.pv;
      }

      width = (width || 0.4) * 0.5;
      samples = Math.floor(samples || 5);

      if (samples <= 1) {
        return this.pv;
      }

      var currentTime = this.comp.renderedFrame / this.comp.globalData.frameRate;
      var initFrame = currentTime - width;
      var endFrame = currentTime + width;
      var sampleFrequency = samples > 1 ? (endFrame - initFrame) / (samples - 1) : 1;
      var i = 0,
          j = 0;
      var value;

      if (this.pv.length) {
        value = createTypedArray('float32', this.pv.length);
      } else {
        value = 0;
      }

      var sampleValue;

      while (i < samples) {
        sampleValue = this.getValueAtTime(initFrame + i * sampleFrequency);

        if (this.pv.length) {
          for (j = 0; j < this.pv.length; j += 1) {
            value[j] += sampleValue[j];
          }
        } else {
          value += sampleValue;
        }

        i += 1;
      }

      if (this.pv.length) {
        for (j = 0; j < this.pv.length; j += 1) {
          value[j] /= samples;
        }
      } else {
        value /= samples;
      }

      return value;
    }

    function getValueAtTime(frameNum) {
      frameNum *= this.elem.globalData.frameRate;
      frameNum -= this.offsetTime;

      if (frameNum !== this._cachingAtTime.lastFrame) {
        this._cachingAtTime.lastIndex = this._cachingAtTime.lastFrame < frameNum ? this._cachingAtTime.lastIndex : 0;
        this._cachingAtTime.value = this.interpolateValue(frameNum, this._cachingAtTime);
        this._cachingAtTime.lastFrame = frameNum;
      }

      return this._cachingAtTime.value;
    }

    function getTransformValueAtTime(time) {
      console.warn('Transform at time not supported');
    }

    function getTransformStaticValueAtTime(time) {}

    var getTransformProperty = TransformPropertyFactory.getTransformProperty;

    TransformPropertyFactory.getTransformProperty = function (elem, data, container) {
      var prop = getTransformProperty(elem, data, container);

      if (prop.dynamicProperties.length) {
        prop.getValueAtTime = getTransformValueAtTime.bind(prop);
      } else {
        prop.getValueAtTime = getTransformStaticValueAtTime.bind(prop);
      }

      prop.setGroupProperty = expressionHelpers.setGroupProperty;
      return prop;
    };

    var propertyGetProp = PropertyFactory.getProp;

    PropertyFactory.getProp = function (elem, data, type, mult, container) {
      var prop = propertyGetProp(elem, data, type, mult, container); //prop.getVelocityAtTime = getVelocityAtTime;
      //prop.loopOut = loopOut;
      //prop.loopIn = loopIn;

      if (prop.kf) {
        prop.getValueAtTime = expressionHelpers.getValueAtTime.bind(prop);
      } else {
        prop.getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(prop);
      }

      prop.setGroupProperty = expressionHelpers.setGroupProperty;
      prop.loopOut = loopOut;
      prop.loopIn = loopIn;
      prop.smooth = smooth;
      prop.getVelocityAtTime = expressionHelpers.getVelocityAtTime.bind(prop);
      prop.getSpeedAtTime = expressionHelpers.getSpeedAtTime.bind(prop);
      prop.numKeys = data.a === 1 ? data.k.length : 0;
      prop.propertyIndex = data.ix;
      var value = 0;

      if (type !== 0) {
        value = createTypedArray('float32', data.a === 1 ? data.k[0].s.length : data.k.length);
      }

      prop._cachingAtTime = {
        lastFrame: initialDefaultFrame,
        lastIndex: 0,
        value: value
      };
      expressionHelpers.searchExpressions(elem, data, prop);

      if (prop.k) {
        container.addDynamicProperty(prop);
      }

      return prop;
    };

    function getShapeValueAtTime(frameNum) {
      //For now this caching object is created only when needed instead of creating it when the shape is initialized.
      if (!this._cachingAtTime) {
        this._cachingAtTime = {
          shapeValue: shape_pool.clone(this.pv),
          lastIndex: 0,
          lastTime: initialDefaultFrame
        };
      }

      frameNum *= this.elem.globalData.frameRate;
      frameNum -= this.offsetTime;

      if (frameNum !== this._cachingAtTime.lastTime) {
        this._cachingAtTime.lastIndex = this._cachingAtTime.lastTime < frameNum ? this._caching.lastIndex : 0;
        this._cachingAtTime.lastTime = frameNum;
        this.interpolateShape(frameNum, this._cachingAtTime.shapeValue, this._cachingAtTime);
      }

      return this._cachingAtTime.shapeValue;
    }

    var ShapePropertyConstructorFunction = ShapePropertyFactory.getConstructorFunction();
    var KeyframedShapePropertyConstructorFunction = ShapePropertyFactory.getKeyframedConstructorFunction();

    function ShapeExpressions() {}

    ShapeExpressions.prototype = {
      vertices: function (prop, time) {
        if (this.k) {
          this.getValue();
        }

        var shapePath = this.v;

        if (time !== undefined) {
          shapePath = this.getValueAtTime(time, 0);
        }

        var i,
            len = shapePath._length;
        var vertices = shapePath[prop];
        var points = shapePath.v;
        var arr = createSizedArray(len);

        for (i = 0; i < len; i += 1) {
          if (prop === 'i' || prop === 'o') {
            arr[i] = [vertices[i][0] - points[i][0], vertices[i][1] - points[i][1]];
          } else {
            arr[i] = [vertices[i][0], vertices[i][1]];
          }
        }

        return arr;
      },
      points: function (time) {
        return this.vertices('v', time);
      },
      inTangents: function (time) {
        return this.vertices('i', time);
      },
      outTangents: function (time) {
        return this.vertices('o', time);
      },
      isClosed: function () {
        return this.v.c;
      },
      pointOnPath: function (perc, time) {
        var shapePath = this.v;

        if (time !== undefined) {
          shapePath = this.getValueAtTime(time, 0);
        }

        if (!this._segmentsLength) {
          this._segmentsLength = bez.getSegmentsLength(shapePath);
        }

        var segmentsLength = this._segmentsLength;
        var lengths = segmentsLength.lengths;
        var lengthPos = segmentsLength.totalLength * perc;
        var i = 0,
            len = lengths.length;
        var j = 0,
            jLen;
        var accumulatedLength = 0,
            pt;

        while (i < len) {
          if (accumulatedLength + lengths[i].addedLength > lengthPos) {
            var initIndex = i;
            var endIndex = shapePath.c && i === len - 1 ? 0 : i + 1;
            var segmentPerc = (lengthPos - accumulatedLength) / lengths[i].addedLength;
            pt = bez.getPointInSegment(shapePath.v[initIndex], shapePath.v[endIndex], shapePath.o[initIndex], shapePath.i[endIndex], segmentPerc, lengths[i]);
            break;
          } else {
            accumulatedLength += lengths[i].addedLength;
          }

          i += 1;
        }

        if (!pt) {
          pt = shapePath.c ? [shapePath.v[0][0], shapePath.v[0][1]] : [shapePath.v[shapePath._length - 1][0], shapePath.v[shapePath._length - 1][1]];
        }

        return pt;
      },
      vectorOnPath: function (perc, time, vectorType) {
        //perc doesn't use triple equality because it can be a Number object as well as a primitive.
        perc = perc == 1 ? this.v.c ? 0 : 0.999 : perc;
        var pt1 = this.pointOnPath(perc, time);
        var pt2 = this.pointOnPath(perc + 0.001, time);
        var xLength = pt2[0] - pt1[0];
        var yLength = pt2[1] - pt1[1];
        var magnitude = Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2));

        if (magnitude === 0) {
          return [0, 0];
        }

        var unitVector = vectorType === 'tangent' ? [xLength / magnitude, yLength / magnitude] : [-yLength / magnitude, xLength / magnitude];
        return unitVector;
      },
      tangentOnPath: function (perc, time) {
        return this.vectorOnPath(perc, time, 'tangent');
      },
      normalOnPath: function (perc, time) {
        return this.vectorOnPath(perc, time, 'normal');
      },
      setGroupProperty: expressionHelpers.setGroupProperty,
      getValueAtTime: expressionHelpers.getStaticValueAtTime
    };
    extendPrototype([ShapeExpressions], ShapePropertyConstructorFunction);
    extendPrototype([ShapeExpressions], KeyframedShapePropertyConstructorFunction);
    KeyframedShapePropertyConstructorFunction.prototype.getValueAtTime = getShapeValueAtTime;
    KeyframedShapePropertyConstructorFunction.prototype.initiateExpression = ExpressionManager.initiateExpression;
    var propertyGetShapeProp = ShapePropertyFactory.getShapeProp;

    ShapePropertyFactory.getShapeProp = function (elem, data, type, arr, trims) {
      var prop = propertyGetShapeProp(elem, data, type, arr, trims);
      prop.propertyIndex = data.ix;
      prop.lock = false;

      if (type === 3) {
        expressionHelpers.searchExpressions(elem, data.pt, prop);
      } else if (type === 4) {
        expressionHelpers.searchExpressions(elem, data.ks, prop);
      }

      if (prop.k) {
        elem.addDynamicProperty(prop);
      }

      return prop;
    };
  })();

  (function addDecorator() {
    function searchExpressions() {
      if (this.data.d.x) {
        this.calculateExpression = ExpressionManager.initiateExpression.bind(this)(this.elem, this.data.d, this);
        this.addEffect(this.getExpressionValue.bind(this));
        return true;
      }
    }

    TextProperty.prototype.getExpressionValue = function (currentValue, text) {
      var newValue = this.calculateExpression(text);

      if (currentValue.t !== newValue) {
        var newData = {};
        this.copyData(newData, currentValue);
        newData.t = newValue.toString();
        newData.__complete = false;
        return newData;
      }

      return currentValue;
    };

    TextProperty.prototype.searchProperty = function () {
      var isKeyframed = this.searchKeyframes();
      var hasExpressions = this.searchExpressions();
      this.kf = isKeyframed || hasExpressions;
      return this.kf;
    };

    TextProperty.prototype.searchExpressions = searchExpressions;
  })();

  var ShapeExpressionInterface = function () {
    function iterateElements(shapes, view, propertyGroup) {
      var arr = [];
      var i,
          len = shapes ? shapes.length : 0;

      for (i = 0; i < len; i += 1) {
        if (shapes[i].ty == 'gr') {
          arr.push(groupInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'fl') {
          arr.push(fillInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'st') {
          arr.push(strokeInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'tm') {
          arr.push(trimInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'tr') {//arr.push(transformInterfaceFactory(shapes[i],view[i],propertyGroup));
        } else if (shapes[i].ty == 'el') {
          arr.push(ellipseInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'sr') {
          arr.push(starInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'sh') {
          arr.push(pathInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'rc') {
          arr.push(rectInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'rd') {
          arr.push(roundedInterfaceFactory(shapes[i], view[i], propertyGroup));
        } else if (shapes[i].ty == 'rp') {
          arr.push(repeaterInterfaceFactory(shapes[i], view[i], propertyGroup));
        }
      }

      return arr;
    }

    function contentsInterfaceFactory(shape, view, propertyGroup) {
      var interfaces;

      var interfaceFunction = function _interfaceFunction(value) {
        var i = 0,
            len = interfaces.length;

        while (i < len) {
          if (interfaces[i]._name === value || interfaces[i].mn === value || interfaces[i].propertyIndex === value || interfaces[i].ix === value || interfaces[i].ind === value) {
            return interfaces[i];
          }

          i += 1;
        }

        if (typeof value === 'number') {
          return interfaces[value - 1];
        }
      };

      interfaceFunction.propertyGroup = function (val) {
        if (val === 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(val - 1);
        }
      };

      interfaces = iterateElements(shape.it, view.it, interfaceFunction.propertyGroup);
      interfaceFunction.numProperties = interfaces.length;
      interfaceFunction.propertyIndex = shape.cix;
      interfaceFunction._name = shape.nm;
      return interfaceFunction;
    }

    function groupInterfaceFactory(shape, view, propertyGroup) {
      var interfaceFunction = function _interfaceFunction(value) {
        switch (value) {
          case 'ADBE Vectors Group':
          case 'Contents':
          case 2:
            return interfaceFunction.content;
          //Not necessary for now. Keeping them here in case a new case appears
          //case 'ADBE Vector Transform Group':
          //case 3:

          default:
            return interfaceFunction.transform;
        }
      };

      interfaceFunction.propertyGroup = function (val) {
        if (val === 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(val - 1);
        }
      };

      var content = contentsInterfaceFactory(shape, view, interfaceFunction.propertyGroup);
      var transformInterface = transformInterfaceFactory(shape.it[shape.it.length - 1], view.it[view.it.length - 1], interfaceFunction.propertyGroup);
      interfaceFunction.content = content;
      interfaceFunction.transform = transformInterface;
      Object.defineProperty(interfaceFunction, '_name', {
        get: function () {
          return shape.nm;
        }
      }); //interfaceFunction.content = interfaceFunction;

      interfaceFunction.numProperties = shape.np;
      interfaceFunction.propertyIndex = shape.ix;
      interfaceFunction.nm = shape.nm;
      interfaceFunction.mn = shape.mn;
      return interfaceFunction;
    }

    function fillInterfaceFactory(shape, view, propertyGroup) {
      function interfaceFunction(val) {
        if (val === 'Color' || val === 'color') {
          return interfaceFunction.color;
        } else if (val === 'Opacity' || val === 'opacity') {
          return interfaceFunction.opacity;
        }
      }

      Object.defineProperties(interfaceFunction, {
        color: {
          get: ExpressionPropertyInterface(view.c)
        },
        opacity: {
          get: ExpressionPropertyInterface(view.o)
        },
        _name: {
          value: shape.nm
        },
        mn: {
          value: shape.mn
        }
      });
      view.c.setGroupProperty(propertyGroup);
      view.o.setGroupProperty(propertyGroup);
      return interfaceFunction;
    }

    function strokeInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val === 1) {
          return ob;
        } else {
          return propertyGroup(val - 1);
        }
      }

      function _dashPropertyGroup(val) {
        if (val === 1) {
          return dashOb;
        } else {
          return _propertyGroup(val - 1);
        }
      }

      function addPropertyToDashOb(i) {
        Object.defineProperty(dashOb, shape.d[i].nm, {
          get: ExpressionPropertyInterface(view.d.dataProps[i].p)
        });
      }

      var i,
          len = shape.d ? shape.d.length : 0;
      var dashOb = {};

      for (i = 0; i < len; i += 1) {
        addPropertyToDashOb(i);
        view.d.dataProps[i].p.setGroupProperty(_dashPropertyGroup);
      }

      function interfaceFunction(val) {
        if (val === 'Color' || val === 'color') {
          return interfaceFunction.color;
        } else if (val === 'Opacity' || val === 'opacity') {
          return interfaceFunction.opacity;
        } else if (val === 'Stroke Width' || val === 'stroke width') {
          return interfaceFunction.strokeWidth;
        }
      }

      Object.defineProperties(interfaceFunction, {
        color: {
          get: ExpressionPropertyInterface(view.c)
        },
        opacity: {
          get: ExpressionPropertyInterface(view.o)
        },
        strokeWidth: {
          get: ExpressionPropertyInterface(view.w)
        },
        dash: {
          get: function () {
            return dashOb;
          }
        },
        _name: {
          value: shape.nm
        },
        mn: {
          value: shape.mn
        }
      });
      view.c.setGroupProperty(_propertyGroup);
      view.o.setGroupProperty(_propertyGroup);
      view.w.setGroupProperty(_propertyGroup);
      return interfaceFunction;
    }

    function trimInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      interfaceFunction.propertyIndex = shape.ix;
      view.s.setGroupProperty(_propertyGroup);
      view.e.setGroupProperty(_propertyGroup);
      view.o.setGroupProperty(_propertyGroup);

      function interfaceFunction(val) {
        if (val === shape.e.ix || val === 'End' || val === 'end') {
          return interfaceFunction.end;
        }

        if (val === shape.s.ix) {
          return interfaceFunction.start;
        }

        if (val === shape.o.ix) {
          return interfaceFunction.offset;
        }
      }

      interfaceFunction.propertyIndex = shape.ix;
      interfaceFunction.propertyGroup = propertyGroup;
      Object.defineProperties(interfaceFunction, {
        start: {
          get: ExpressionPropertyInterface(view.s)
        },
        end: {
          get: ExpressionPropertyInterface(view.e)
        },
        offset: {
          get: ExpressionPropertyInterface(view.o)
        },
        _name: {
          value: shape.nm
        }
      });
      interfaceFunction.mn = shape.mn;
      return interfaceFunction;
    }

    function transformInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      view.transform.mProps.o.setGroupProperty(_propertyGroup);
      view.transform.mProps.p.setGroupProperty(_propertyGroup);
      view.transform.mProps.a.setGroupProperty(_propertyGroup);
      view.transform.mProps.s.setGroupProperty(_propertyGroup);
      view.transform.mProps.r.setGroupProperty(_propertyGroup);

      if (view.transform.mProps.sk) {
        view.transform.mProps.sk.setGroupProperty(_propertyGroup);
        view.transform.mProps.sa.setGroupProperty(_propertyGroup);
      }

      view.transform.op.setGroupProperty(_propertyGroup);

      function interfaceFunction(value) {
        if (shape.a.ix === value || value === 'Anchor Point') {
          return interfaceFunction.anchorPoint;
        }

        if (shape.o.ix === value || value === 'Opacity') {
          return interfaceFunction.opacity;
        }

        if (shape.p.ix === value || value === 'Position') {
          return interfaceFunction.position;
        }

        if (shape.r.ix === value || value === 'Rotation' || value === 'ADBE Vector Rotation') {
          return interfaceFunction.rotation;
        }

        if (shape.s.ix === value || value === 'Scale') {
          return interfaceFunction.scale;
        }

        if (shape.sk && shape.sk.ix === value || value === 'Skew') {
          return interfaceFunction.skew;
        }

        if (shape.sa && shape.sa.ix === value || value === 'Skew Axis') {
          return interfaceFunction.skewAxis;
        }
      }

      Object.defineProperties(interfaceFunction, {
        opacity: {
          get: ExpressionPropertyInterface(view.transform.mProps.o)
        },
        position: {
          get: ExpressionPropertyInterface(view.transform.mProps.p)
        },
        anchorPoint: {
          get: ExpressionPropertyInterface(view.transform.mProps.a)
        },
        scale: {
          get: ExpressionPropertyInterface(view.transform.mProps.s)
        },
        rotation: {
          get: ExpressionPropertyInterface(view.transform.mProps.r)
        },
        skew: {
          get: ExpressionPropertyInterface(view.transform.mProps.sk)
        },
        skewAxis: {
          get: ExpressionPropertyInterface(view.transform.mProps.sa)
        },
        _name: {
          value: shape.nm
        }
      });
      interfaceFunction.ty = 'tr';
      interfaceFunction.mn = shape.mn;
      interfaceFunction.propertyGroup = propertyGroup;
      return interfaceFunction;
    }

    function ellipseInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      interfaceFunction.propertyIndex = shape.ix;
      var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
      prop.s.setGroupProperty(_propertyGroup);
      prop.p.setGroupProperty(_propertyGroup);

      function interfaceFunction(value) {
        if (shape.p.ix === value) {
          return interfaceFunction.position;
        }

        if (shape.s.ix === value) {
          return interfaceFunction.size;
        }
      }

      Object.defineProperties(interfaceFunction, {
        size: {
          get: ExpressionPropertyInterface(prop.s)
        },
        position: {
          get: ExpressionPropertyInterface(prop.p)
        },
        _name: {
          value: shape.nm
        }
      });
      interfaceFunction.mn = shape.mn;
      return interfaceFunction;
    }

    function starInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
      interfaceFunction.propertyIndex = shape.ix;
      prop.or.setGroupProperty(_propertyGroup);
      prop.os.setGroupProperty(_propertyGroup);
      prop.pt.setGroupProperty(_propertyGroup);
      prop.p.setGroupProperty(_propertyGroup);
      prop.r.setGroupProperty(_propertyGroup);

      if (shape.ir) {
        prop.ir.setGroupProperty(_propertyGroup);
        prop.is.setGroupProperty(_propertyGroup);
      }

      function interfaceFunction(value) {
        if (shape.p.ix === value) {
          return interfaceFunction.position;
        }

        if (shape.r.ix === value) {
          return interfaceFunction.rotation;
        }

        if (shape.pt.ix === value) {
          return interfaceFunction.points;
        }

        if (shape.or.ix === value || 'ADBE Vector Star Outer Radius' === value) {
          return interfaceFunction.outerRadius;
        }

        if (shape.os.ix === value) {
          return interfaceFunction.outerRoundness;
        }

        if (shape.ir && (shape.ir.ix === value || 'ADBE Vector Star Inner Radius' === value)) {
          return interfaceFunction.innerRadius;
        }

        if (shape.is && shape.is.ix === value) {
          return interfaceFunction.innerRoundness;
        }
      }

      Object.defineProperties(interfaceFunction, {
        position: {
          get: ExpressionPropertyInterface(prop.p)
        },
        rotation: {
          get: ExpressionPropertyInterface(prop.r)
        },
        points: {
          get: ExpressionPropertyInterface(prop.pt)
        },
        outerRadius: {
          get: ExpressionPropertyInterface(prop.or)
        },
        outerRoundness: {
          get: ExpressionPropertyInterface(prop.os)
        },
        innerRadius: {
          get: ExpressionPropertyInterface(prop.ir)
        },
        innerRoundness: {
          get: ExpressionPropertyInterface(prop.is)
        },
        _name: {
          value: shape.nm
        }
      });
      interfaceFunction.mn = shape.mn;
      return interfaceFunction;
    }

    function rectInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
      interfaceFunction.propertyIndex = shape.ix;
      prop.p.setGroupProperty(_propertyGroup);
      prop.s.setGroupProperty(_propertyGroup);
      prop.r.setGroupProperty(_propertyGroup);

      function interfaceFunction(value) {
        if (shape.p.ix === value) {
          return interfaceFunction.position;
        }

        if (shape.r.ix === value) {
          return interfaceFunction.roundness;
        }

        if (shape.s.ix === value || value === 'Size' || value === 'ADBE Vector Rect Size') {
          return interfaceFunction.size;
        }
      }

      Object.defineProperties(interfaceFunction, {
        position: {
          get: ExpressionPropertyInterface(prop.p)
        },
        roundness: {
          get: ExpressionPropertyInterface(prop.r)
        },
        size: {
          get: ExpressionPropertyInterface(prop.s)
        },
        _name: {
          value: shape.nm
        }
      });
      interfaceFunction.mn = shape.mn;
      return interfaceFunction;
    }

    function roundedInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      var prop = view;
      interfaceFunction.propertyIndex = shape.ix;
      prop.rd.setGroupProperty(_propertyGroup);

      function interfaceFunction(value) {
        if (shape.r.ix === value || 'Round Corners 1' === value) {
          return interfaceFunction.radius;
        }
      }

      Object.defineProperties(interfaceFunction, {
        radius: {
          get: ExpressionPropertyInterface(prop.rd)
        },
        _name: {
          value: shape.nm
        }
      });
      interfaceFunction.mn = shape.mn;
      return interfaceFunction;
    }

    function repeaterInterfaceFactory(shape, view, propertyGroup) {
      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      var prop = view;
      interfaceFunction.propertyIndex = shape.ix;
      prop.c.setGroupProperty(_propertyGroup);
      prop.o.setGroupProperty(_propertyGroup);

      function interfaceFunction(value) {
        if (shape.c.ix === value || 'Copies' === value) {
          return interfaceFunction.copies;
        } else if (shape.o.ix === value || 'Offset' === value) {
          return interfaceFunction.offset;
        }
      }

      Object.defineProperties(interfaceFunction, {
        copies: {
          get: ExpressionPropertyInterface(prop.c)
        },
        offset: {
          get: ExpressionPropertyInterface(prop.o)
        },
        _name: {
          value: shape.nm
        }
      });
      interfaceFunction.mn = shape.mn;
      return interfaceFunction;
    }

    function pathInterfaceFactory(shape, view, propertyGroup) {
      var prop = view.sh;

      function _propertyGroup(val) {
        if (val == 1) {
          return interfaceFunction;
        } else {
          return propertyGroup(--val);
        }
      }

      prop.setGroupProperty(_propertyGroup);

      function interfaceFunction(val) {
        if (val === 'Shape' || val === 'shape' || val === 'Path' || val === 'path' || val === 'ADBE Vector Shape' || val === 2) {
          return interfaceFunction.path;
        }
      }

      Object.defineProperties(interfaceFunction, {
        path: {
          get: function () {
            if (prop.k) {
              prop.getValue();
            }

            return prop;
          }
        },
        shape: {
          get: function () {
            if (prop.k) {
              prop.getValue();
            }

            return prop;
          }
        },
        _name: {
          value: shape.nm
        },
        ix: {
          value: shape.ix
        },
        propertyIndex: {
          value: shape.ix
        },
        mn: {
          value: shape.mn
        }
      });
      return interfaceFunction;
    }

    return function (shapes, view, propertyGroup) {
      var interfaces;

      function _interfaceFunction(value) {
        if (typeof value === 'number') {
          return interfaces[value - 1];
        } else {
          var i = 0,
              len = interfaces.length;

          while (i < len) {
            if (interfaces[i]._name === value) {
              return interfaces[i];
            }

            i += 1;
          }
        }
      }

      _interfaceFunction.propertyGroup = propertyGroup;
      interfaces = iterateElements(shapes, view, _interfaceFunction);
      _interfaceFunction.numProperties = interfaces.length;
      return _interfaceFunction;
    };
  }();

  var TextExpressionInterface = function () {
    return function (elem) {
      var _prevValue, _sourceText;

      function _thisLayerFunction() {}

      Object.defineProperty(_thisLayerFunction, "sourceText", {
        get: function () {
          elem.textProperty.getValue();
          var stringValue = elem.textProperty.currentData.t;

          if (stringValue !== _prevValue) {
            elem.textProperty.currentData.t = _prevValue;
            _sourceText = new String(stringValue); //If stringValue is an empty string, eval returns undefined, so it has to be returned as a String primitive

            _sourceText.value = stringValue ? stringValue : new String(stringValue);
          }

          return _sourceText;
        }
      });
      return _thisLayerFunction;
    };
  }();

  var LayerExpressionInterface = function () {
    function toWorld(arr, time) {
      var toWorldMat = new Matrix();
      toWorldMat.reset();
      var transformMat;

      if (time) {
        //Todo implement value at time on transform properties
        //transformMat = this._elem.finalTransform.mProp.getValueAtTime(time);
        transformMat = this._elem.finalTransform.mProp;
      } else {
        transformMat = this._elem.finalTransform.mProp;
      }

      transformMat.applyToMatrix(toWorldMat);

      if (this._elem.hierarchy && this._elem.hierarchy.length) {
        var i,
            len = this._elem.hierarchy.length;

        for (i = 0; i < len; i += 1) {
          this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
        }

        return toWorldMat.applyToPointArray(arr[0], arr[1], arr[2] || 0);
      }

      return toWorldMat.applyToPointArray(arr[0], arr[1], arr[2] || 0);
    }

    function fromWorld(arr, time) {
      var toWorldMat = new Matrix();
      toWorldMat.reset();
      var transformMat;

      if (time) {
        //Todo implement value at time on transform properties
        //transformMat = this._elem.finalTransform.mProp.getValueAtTime(time);
        transformMat = this._elem.finalTransform.mProp;
      } else {
        transformMat = this._elem.finalTransform.mProp;
      }

      transformMat.applyToMatrix(toWorldMat);

      if (this._elem.hierarchy && this._elem.hierarchy.length) {
        var i,
            len = this._elem.hierarchy.length;

        for (i = 0; i < len; i += 1) {
          this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
        }

        return toWorldMat.inversePoint(arr);
      }

      return toWorldMat.inversePoint(arr);
    }

    function fromComp(arr) {
      var toWorldMat = new Matrix();
      toWorldMat.reset();

      this._elem.finalTransform.mProp.applyToMatrix(toWorldMat);

      if (this._elem.hierarchy && this._elem.hierarchy.length) {
        var i,
            len = this._elem.hierarchy.length;

        for (i = 0; i < len; i += 1) {
          this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
        }

        return toWorldMat.inversePoint(arr);
      }

      return toWorldMat.inversePoint(arr);
    }

    function sampleImage() {
      return [1, 1, 1, 1];
    }

    return function (elem) {
      var transformInterface;

      function _registerMaskInterface(maskManager) {
        _thisLayerFunction.mask = new MaskManagerInterface(maskManager, elem);
      }

      function _registerEffectsInterface(effects) {
        _thisLayerFunction.effect = effects;
      }

      function _thisLayerFunction(name) {
        switch (name) {
          case "ADBE Root Vectors Group":
          case "Contents":
          case 2:
            return _thisLayerFunction.shapeInterface;

          case 1:
          case 6:
          case "Transform":
          case "transform":
          case "ADBE Transform Group":
            return transformInterface;

          case 4:
          case "ADBE Effect Parade":
          case "effects":
          case "Effects":
            return _thisLayerFunction.effect;
        }
      }

      _thisLayerFunction.toWorld = toWorld;
      _thisLayerFunction.fromWorld = fromWorld;
      _thisLayerFunction.toComp = toWorld;
      _thisLayerFunction.fromComp = fromComp;
      _thisLayerFunction.sampleImage = sampleImage;
      _thisLayerFunction.sourceRectAtTime = elem.sourceRectAtTime.bind(elem);
      _thisLayerFunction._elem = elem;
      transformInterface = TransformExpressionInterface(elem.finalTransform.mProp);
      var anchorPointDescriptor = getDescriptor(transformInterface, 'anchorPoint');
      Object.defineProperties(_thisLayerFunction, {
        hasParent: {
          get: function () {
            return elem.hierarchy.length;
          }
        },
        parent: {
          get: function () {
            return elem.hierarchy[0].layerInterface;
          }
        },
        rotation: getDescriptor(transformInterface, 'rotation'),
        scale: getDescriptor(transformInterface, 'scale'),
        position: getDescriptor(transformInterface, 'position'),
        opacity: getDescriptor(transformInterface, 'opacity'),
        anchorPoint: anchorPointDescriptor,
        anchor_point: anchorPointDescriptor,
        transform: {
          get: function () {
            return transformInterface;
          }
        },
        active: {
          get: function () {
            return elem.isInRange;
          }
        }
      });
      _thisLayerFunction.startTime = elem.data.st;
      _thisLayerFunction.index = elem.data.ind;
      _thisLayerFunction.source = elem.data.refId;
      _thisLayerFunction.height = elem.data.ty === 0 ? elem.data.h : 100;
      _thisLayerFunction.width = elem.data.ty === 0 ? elem.data.w : 100;
      _thisLayerFunction.inPoint = elem.data.ip / elem.comp.globalData.frameRate;
      _thisLayerFunction.outPoint = elem.data.op / elem.comp.globalData.frameRate;
      _thisLayerFunction._name = elem.data.nm;
      _thisLayerFunction.registerMaskInterface = _registerMaskInterface;
      _thisLayerFunction.registerEffectsInterface = _registerEffectsInterface;
      return _thisLayerFunction;
    };
  }();

  var CompExpressionInterface = function () {
    return function (comp) {
      function _thisLayerFunction(name) {
        var i = 0,
            len = comp.layers.length;

        while (i < len) {
          if (comp.layers[i].nm === name || comp.layers[i].ind === name) {
            return comp.elements[i].layerInterface;
          }

          i += 1;
        }

        return null; //return {active:false};
      }

      Object.defineProperty(_thisLayerFunction, "_name", {
        value: comp.data.nm
      });
      _thisLayerFunction.layer = _thisLayerFunction;
      _thisLayerFunction.pixelAspect = 1;
      _thisLayerFunction.height = comp.data.h || comp.globalData.compSize.h;
      _thisLayerFunction.width = comp.data.w || comp.globalData.compSize.w;
      _thisLayerFunction.pixelAspect = 1;
      _thisLayerFunction.frameDuration = 1 / comp.globalData.frameRate;
      _thisLayerFunction.displayStartTime = 0;
      _thisLayerFunction.numLayers = comp.layers.length;
      return _thisLayerFunction;
    };
  }();

  var TransformExpressionInterface = function () {
    return function (transform) {
      function _thisFunction(name) {
        switch (name) {
          case "scale":
          case "Scale":
          case "ADBE Scale":
          case 6:
            return _thisFunction.scale;

          case "rotation":
          case "Rotation":
          case "ADBE Rotation":
          case "ADBE Rotate Z":
          case 10:
            return _thisFunction.rotation;

          case "ADBE Rotate X":
            return _thisFunction.xRotation;

          case "ADBE Rotate Y":
            return _thisFunction.yRotation;

          case "position":
          case "Position":
          case "ADBE Position":
          case 2:
            return _thisFunction.position;

          case 'ADBE Position_0':
            return _thisFunction.xPosition;

          case 'ADBE Position_1':
            return _thisFunction.yPosition;

          case 'ADBE Position_2':
            return _thisFunction.zPosition;

          case "anchorPoint":
          case "AnchorPoint":
          case "Anchor Point":
          case "ADBE AnchorPoint":
          case 1:
            return _thisFunction.anchorPoint;

          case "opacity":
          case "Opacity":
          case 11:
            return _thisFunction.opacity;
        }
      }

      Object.defineProperty(_thisFunction, "rotation", {
        get: ExpressionPropertyInterface(transform.r || transform.rz)
      });
      Object.defineProperty(_thisFunction, "zRotation", {
        get: ExpressionPropertyInterface(transform.rz || transform.r)
      });
      Object.defineProperty(_thisFunction, "xRotation", {
        get: ExpressionPropertyInterface(transform.rx)
      });
      Object.defineProperty(_thisFunction, "yRotation", {
        get: ExpressionPropertyInterface(transform.ry)
      });
      Object.defineProperty(_thisFunction, "scale", {
        get: ExpressionPropertyInterface(transform.s)
      });

      if (transform.p) {
        var _transformFactory = ExpressionPropertyInterface(transform.p);
      }

      Object.defineProperty(_thisFunction, "position", {
        get: function () {
          if (transform.p) {
            return _transformFactory();
          } else {
            return [transform.px.v, transform.py.v, transform.pz ? transform.pz.v : 0];
          }
        }
      });
      Object.defineProperty(_thisFunction, "xPosition", {
        get: ExpressionPropertyInterface(transform.px)
      });
      Object.defineProperty(_thisFunction, "yPosition", {
        get: ExpressionPropertyInterface(transform.py)
      });
      Object.defineProperty(_thisFunction, "zPosition", {
        get: ExpressionPropertyInterface(transform.pz)
      });
      Object.defineProperty(_thisFunction, "anchorPoint", {
        get: ExpressionPropertyInterface(transform.a)
      });
      Object.defineProperty(_thisFunction, "opacity", {
        get: ExpressionPropertyInterface(transform.o)
      });
      Object.defineProperty(_thisFunction, "skew", {
        get: ExpressionPropertyInterface(transform.sk)
      });
      Object.defineProperty(_thisFunction, "skewAxis", {
        get: ExpressionPropertyInterface(transform.sa)
      });
      Object.defineProperty(_thisFunction, "orientation", {
        get: ExpressionPropertyInterface(transform.or)
      });
      return _thisFunction;
    };
  }();

  var ProjectInterface = function () {
    function registerComposition(comp) {
      this.compositions.push(comp);
    }

    return function () {
      function _thisProjectFunction(name) {
        var i = 0,
            len = this.compositions.length;

        while (i < len) {
          if (this.compositions[i].data && this.compositions[i].data.nm === name) {
            if (this.compositions[i].prepareFrame && this.compositions[i].data.xt) {
              this.compositions[i].prepareFrame(this.currentFrame);
            }

            return this.compositions[i].compInterface;
          }

          i += 1;
        }
      }

      _thisProjectFunction.compositions = [];
      _thisProjectFunction.currentFrame = 0;
      _thisProjectFunction.registerComposition = registerComposition;
      return _thisProjectFunction;
    };
  }();

  var EffectsExpressionInterface = function () {
    var ob = {
      createEffectsInterface: createEffectsInterface
    };

    function createEffectsInterface(elem, propertyGroup) {
      if (elem.effectsManager) {
        var effectElements = [];
        var effectsData = elem.data.ef;
        var i,
            len = elem.effectsManager.effectElements.length;

        for (i = 0; i < len; i += 1) {
          effectElements.push(createGroupInterface(effectsData[i], elem.effectsManager.effectElements[i], propertyGroup, elem));
        }

        return function (name) {
          var effects = elem.data.ef || [],
              i = 0,
              len = effects.length;

          while (i < len) {
            if (name === effects[i].nm || name === effects[i].mn || name === effects[i].ix) {
              return effectElements[i];
            }

            i += 1;
          }
        };
      }
    }

    function createGroupInterface(data, elements, propertyGroup, elem) {
      var effectElements = [];
      var i,
          len = data.ef.length;

      for (i = 0; i < len; i += 1) {
        if (data.ef[i].ty === 5) {
          effectElements.push(createGroupInterface(data.ef[i], elements.effectElements[i], elements.effectElements[i].propertyGroup, elem));
        } else {
          effectElements.push(createValueInterface(elements.effectElements[i], data.ef[i].ty, elem, _propertyGroup));
        }
      }

      function _propertyGroup(val) {
        if (val === 1) {
          return groupInterface;
        } else {
          return propertyGroup(val - 1);
        }
      }

      var groupInterface = function (name) {
        var effects = data.ef,
            i = 0,
            len = effects.length;

        while (i < len) {
          if (name === effects[i].nm || name === effects[i].mn || name === effects[i].ix) {
            if (effects[i].ty === 5) {
              return effectElements[i];
            } else {
              return effectElements[i]();
            }
          }

          i += 1;
        }

        return effectElements[0]();
      };

      groupInterface.propertyGroup = _propertyGroup;

      if (data.mn === 'ADBE Color Control') {
        Object.defineProperty(groupInterface, 'color', {
          get: function () {
            return effectElements[0]();
          }
        });
      }

      Object.defineProperty(groupInterface, 'numProperties', {
        get: function () {
          return data.np;
        }
      });
      groupInterface.active = groupInterface.enabled = data.en !== 0;
      return groupInterface;
    }

    function createValueInterface(element, type, elem, propertyGroup) {
      var expressionProperty = ExpressionPropertyInterface(element.p);

      function interfaceFunction() {
        if (type === 10) {
          return elem.comp.compInterface(element.p.v);
        }

        return expressionProperty();
      }

      if (element.p.setGroupProperty) {
        element.p.setGroupProperty(propertyGroup);
      }

      return interfaceFunction;
    }

    return ob;
  }();

  var MaskManagerInterface = function () {
    function MaskInterface(mask, data) {
      this._mask = mask;
      this._data = data;
    }

    Object.defineProperty(MaskInterface.prototype, 'maskPath', {
      get: function () {
        if (this._mask.prop.k) {
          this._mask.prop.getValue();
        }

        return this._mask.prop;
      }
    });
    Object.defineProperty(MaskInterface.prototype, 'maskOpacity', {
      get: function () {
        if (this._mask.op.k) {
          this._mask.op.getValue();
        }

        return this._mask.op.v * 100;
      }
    });

    var MaskManager = function (maskManager, elem) {
      var _maskManager = maskManager;
      var _elem = elem;

      var _masksInterfaces = createSizedArray(maskManager.viewData.length);

      var i,
          len = maskManager.viewData.length;

      for (i = 0; i < len; i += 1) {
        _masksInterfaces[i] = new MaskInterface(maskManager.viewData[i], maskManager.masksProperties[i]);
      }

      var maskFunction = function (name) {
        i = 0;

        while (i < len) {
          if (maskManager.masksProperties[i].nm === name) {
            return _masksInterfaces[i];
          }

          i += 1;
        }
      };

      return maskFunction;
    };

    return MaskManager;
  }();

  var ExpressionPropertyInterface = function () {
    var defaultUnidimensionalValue = {
      pv: 0,
      v: 0,
      mult: 1
    };
    var defaultMultidimensionalValue = {
      pv: [0, 0, 0],
      v: [0, 0, 0],
      mult: 1
    };

    function completeProperty(expressionValue, property, type) {
      Object.defineProperty(expressionValue, 'velocity', {
        get: function () {
          return property.getVelocityAtTime(property.comp.currentFrame);
        }
      });
      expressionValue.numKeys = property.keyframes ? property.keyframes.length : 0;

      expressionValue.key = function (pos) {
        if (!expressionValue.numKeys) {
          return 0;
        } else {
          var value = '';

          if ('s' in property.keyframes[pos - 1]) {
            value = property.keyframes[pos - 1].s;
          } else if ('e' in property.keyframes[pos - 2]) {
            value = property.keyframes[pos - 2].e;
          } else {
            value = property.keyframes[pos - 2].s;
          }

          var valueProp = type === 'unidimensional' ? new Number(value) : Object.assign({}, value);
          valueProp.time = property.keyframes[pos - 1].t / property.elem.comp.globalData.frameRate;
          return valueProp;
        }
      };

      expressionValue.valueAtTime = property.getValueAtTime;
      expressionValue.speedAtTime = property.getSpeedAtTime;
      expressionValue.velocityAtTime = property.getVelocityAtTime;
      expressionValue.propertyGroup = property.propertyGroup;
    }

    function UnidimensionalPropertyInterface(property) {
      if (!property || !('pv' in property)) {
        property = defaultUnidimensionalValue;
      }

      var mult = 1 / property.mult;
      var val = property.pv * mult;
      var expressionValue = new Number(val);
      expressionValue.value = val;
      completeProperty(expressionValue, property, 'unidimensional');
      return function () {
        if (property.k) {
          property.getValue();
        }

        val = property.v * mult;

        if (expressionValue.value !== val) {
          expressionValue = new Number(val);
          expressionValue.value = val;
          completeProperty(expressionValue, property, 'unidimensional');
        }

        return expressionValue;
      };
    }

    function MultidimensionalPropertyInterface(property) {
      if (!property || !('pv' in property)) {
        property = defaultMultidimensionalValue;
      }

      var mult = 1 / property.mult;
      var len = property.pv.length;
      var expressionValue = createTypedArray('float32', len);
      var arrValue = createTypedArray('float32', len);
      expressionValue.value = arrValue;
      completeProperty(expressionValue, property, 'multidimensional');
      return function () {
        if (property.k) {
          property.getValue();
        }

        for (var i = 0; i < len; i += 1) {
          expressionValue[i] = arrValue[i] = property.v[i] * mult;
        }

        return expressionValue;
      };
    } //TODO: try to avoid using this getter


    function defaultGetter() {
      return defaultUnidimensionalValue;
    }

    return function (property) {
      if (!property) {
        return defaultGetter;
      } else if (property.propType === 'unidimensional') {
        return UnidimensionalPropertyInterface(property);
      } else {
        return MultidimensionalPropertyInterface(property);
      }
    };
  }();

  (function () {
    var TextExpressionSelectorProp = function () {
      function getValueProxy(index, total) {
        this.textIndex = index + 1;
        this.textTotal = total;
        this.v = this.getValue() * this.mult;
        return this.v;
      }

      return function TextExpressionSelectorProp(elem, data) {
        this.pv = 1;
        this.comp = elem.comp;
        this.elem = elem;
        this.mult = 0.01;
        this.propType = 'textSelector';
        this.textTotal = data.totalChars;
        this.selectorValue = 100;
        this.lastValue = [1, 1, 1];
        this.k = true;
        this.x = true;
        this.getValue = ExpressionManager.initiateExpression.bind(this)(elem, data, this);
        this.getMult = getValueProxy;
        this.getVelocityAtTime = expressionHelpers.getVelocityAtTime;

        if (this.kf) {
          this.getValueAtTime = expressionHelpers.getValueAtTime.bind(this);
        } else {
          this.getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(this);
        }

        this.setGroupProperty = expressionHelpers.setGroupProperty;
      };
    }();

    var propertyGetTextProp = TextSelectorProp.getTextSelectorProp;

    TextSelectorProp.getTextSelectorProp = function (elem, data, arr) {
      if (data.t === 1) {
        return new TextExpressionSelectorProp(elem, data, arr);
      } else {
        return propertyGetTextProp(elem, data, arr);
      }
    };
  })();

  function SliderEffect(data, elem, container) {
    this.p = PropertyFactory.getProp(elem, data.v, 0, 0, container);
  }

  function AngleEffect(data, elem, container) {
    this.p = PropertyFactory.getProp(elem, data.v, 0, 0, container);
  }

  function ColorEffect(data, elem, container) {
    this.p = PropertyFactory.getProp(elem, data.v, 1, 0, container);
  }

  function PointEffect(data, elem, container) {
    this.p = PropertyFactory.getProp(elem, data.v, 1, 0, container);
  }

  function LayerIndexEffect(data, elem, container) {
    this.p = PropertyFactory.getProp(elem, data.v, 0, 0, container);
  }

  function MaskIndexEffect(data, elem, container) {
    this.p = PropertyFactory.getProp(elem, data.v, 0, 0, container);
  }

  function CheckboxEffect(data, elem, container) {
    this.p = PropertyFactory.getProp(elem, data.v, 0, 0, container);
  }

  function NoValueEffect() {
    this.p = {};
  }

  function EffectsManager() {}

  function EffectsManager(data, element) {
    var effects = data.ef || [];
    this.effectElements = [];
    var i,
        len = effects.length;
    var effectItem;

    for (i = 0; i < len; i++) {
      effectItem = new GroupEffect(effects[i], element);
      this.effectElements.push(effectItem);
    }
  }

  function GroupEffect(data, element) {
    this.init(data, element);
  }

  extendPrototype([DynamicPropertyContainer], GroupEffect);
  GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties;

  GroupEffect.prototype.init = function (data, element) {
    this.data = data;
    this.effectElements = [];
    this.initDynamicPropertyContainer(element);
    var i,
        len = this.data.ef.length;
    var eff,
        effects = this.data.ef;

    for (i = 0; i < len; i += 1) {
      eff = null;

      switch (effects[i].ty) {
        case 0:
          eff = new SliderEffect(effects[i], element, this);
          break;

        case 1:
          eff = new AngleEffect(effects[i], element, this);
          break;

        case 2:
          eff = new ColorEffect(effects[i], element, this);
          break;

        case 3:
          eff = new PointEffect(effects[i], element, this);
          break;

        case 4:
        case 7:
          eff = new CheckboxEffect(effects[i], element, this);
          break;

        case 10:
          eff = new LayerIndexEffect(effects[i], element, this);
          break;

        case 11:
          eff = new MaskIndexEffect(effects[i], element, this);
          break;

        case 5:
          eff = new EffectsManager(effects[i], element, this);
          break;
        //case 6:

        default:
          eff = new NoValueEffect(effects[i], element, this);
          break;
      }

      if (eff) {
        this.effectElements.push(eff);
      }
    }
  };

  var lottiejs = {};
  var _isFrozen = false;

  function setLocationHref(href) {
    locationHref = href;
  }

  function setSubframeRendering(flag) {
    subframeEnabled = flag;
  }

  function loadAnimation(params, isLoadNow) {
    return animationManager.loadAnimation(params, isLoadNow);
  }

  function setQuality(value) {
    if (typeof value === 'string') {
      switch (value) {
        case 'high':
          defaultCurveSegments = 200;
          break;

        case 'medium':
          defaultCurveSegments = 50;
          break;

        case 'low':
          defaultCurveSegments = 10;
          break;
      }
    } else if (!isNaN(value) && value > 1) {
      defaultCurveSegments = value;
    }

    if (defaultCurveSegments >= 50) {
      roundValues(false);
    } else {
      roundValues(true);
    }
  }

  function inBrowser() {
    return true;
  }

  function installPlugin(type, plugin) {
    if (type === 'expressions') {
      expressionsPlugin = plugin;
    }
  }

  function getFactory(name) {
    switch (name) {
      case 'propertyFactory':
        return PropertyFactory;

      case 'shapePropertyFactory':
        return ShapePropertyFactory;

      case 'matrix':
        return Matrix;
    }
  }

  lottiejs.canvas = null;

  lottiejs.setCanvas = function (canvas) {
    lottiejs.canvas = canvas;
  };

  lottiejs.play = animationManager.play;
  lottiejs.pause = animationManager.pause;
  lottiejs.setLocationHref = setLocationHref;
  lottiejs.togglePause = animationManager.togglePause;
  lottiejs.setSpeed = animationManager.setSpeed;
  lottiejs.setDirection = animationManager.setDirection;
  lottiejs.stop = animationManager.stop;
  lottiejs.loadAnimation = loadAnimation;
  lottiejs.setSubframeRendering = setSubframeRendering;
  lottiejs.resize = animationManager.resize;
  lottiejs.goToAndStop = animationManager.goToAndStop;
  lottiejs.destroy = animationManager.destroy;
  lottiejs.setQuality = setQuality;
  lottiejs.inBrowser = inBrowser;
  lottiejs.installPlugin = installPlugin;
  lottiejs.freeze = animationManager.freeze;
  lottiejs.unfreeze = animationManager.unfreeze;
  lottiejs.getRegisteredAnimations = animationManager.getRegisteredAnimations;
  lottiejs.__getFactory = getFactory;
  lottiejs.version = '5.5.101';
  var standalone = '__[STANDALONE]__';
  var animationData = '__[ANIMATIONDATA]__';
  var renderer = '';
  return lottiejs;
});

/***/ }),
/* 2 */
/***/ (() => {

/* (ignored) */

/***/ }),
/* 3 */
/***/ (() => {

/* (ignored) */

/***/ }),
/* 4 */
/***/ ((module) => {

(function (f) {
  if (true) {
    module.exports = f();
  } else { var g; }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = undefined;
            if (!f && c) return require(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }

          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }

        return n[i].exports;
      }

      for (var u = undefined, i = 0; i < t.length; i++) o(t[i]);

      return o;
    }

    return r;
  }()({
    1: [function (require, module, exports) {
      'use strict';

      var Renderer = require('../renderer/Renderer');

      var layer_api = require('../helpers/layerAPIBuilder');

      function AnimationItemFactory(animation) {
        var state = {
          animation: animation,
          elements: animation.renderer.elements.map(function (item) {
            return layer_api(item, animation);
          }),
          boundingRect: null,
          scaleData: null
        };

        function getCurrentFrame() {
          return animation.currentFrame;
        }

        function getCurrentTime() {
          return animation.currentFrame / animation.frameRate;
        }

        function addValueCallback(properties, value) {
          var i,
              len = properties.length;

          for (i = 0; i < len; i += 1) {
            properties.getPropertyAtIndex(i).setValue(value);
          }
        }

        function toKeypathLayerPoint(properties, point) {
          var i,
              len = properties.length;
          var points = [];

          for (i = 0; i < len; i += 1) {
            points.push(properties.getPropertyAtIndex(i).toKeypathLayerPoint(point));
          }

          if (points.length === 1) {
            return points[0];
          }

          return points;
        }

        function fromKeypathLayerPoint(properties, point) {
          var i,
              len = properties.length;
          var points = [];

          for (i = 0; i < len; i += 1) {
            points.push(properties.getPropertyAtIndex(i).fromKeypathLayerPoint(point));
          }

          if (points.length === 1) {
            return points[0];
          }

          return points;
        }

        function calculateScaleData(boundingRect) {
          var compWidth = animation.animationData.w;
          var compHeight = animation.animationData.h;
          var compRel = compWidth / compHeight;
          var elementWidth = boundingRect.width;
          var elementHeight = boundingRect.height;
          var elementRel = elementWidth / elementHeight;
          var scale, scaleXOffset, scaleYOffset;
          var xAlignment, yAlignment, scaleMode;
          var aspectRatio = animation.renderer.renderConfig.preserveAspectRatio.split(' ');

          if (aspectRatio[1] === 'meet') {
            scale = elementRel > compRel ? elementHeight / compHeight : elementWidth / compWidth;
          } else {
            scale = elementRel > compRel ? elementWidth / compWidth : elementHeight / compHeight;
          }

          xAlignment = aspectRatio[0].substr(0, 4);
          yAlignment = aspectRatio[0].substr(4);

          if (xAlignment === 'xMin') {
            scaleXOffset = 0;
          } else if (xAlignment === 'xMid') {
            scaleXOffset = (elementWidth - compWidth * scale) / 2;
          } else {
            scaleXOffset = elementWidth - compWidth * scale;
          }

          if (yAlignment === 'YMin') {
            scaleYOffset = 0;
          } else if (yAlignment === 'YMid') {
            scaleYOffset = (elementHeight - compHeight * scale) / 2;
          } else {
            scaleYOffset = elementHeight - compHeight * scale;
          }

          return {
            scaleYOffset: scaleYOffset,
            scaleXOffset: scaleXOffset,
            scale: scale
          };
        }

        function recalculateSize(container) {
          var container = animation.wrapper;
          state.boundingRect = container.getBoundingClientRect();
          state.scaleData = calculateScaleData(state.boundingRect);
        }

        function toContainerPoint(point) {
          if (!animation.wrapper || !animation.wrapper.getBoundingClientRect) {
            return point;
          }

          if (!state.boundingRect) {
            recalculateSize();
          }

          var boundingRect = state.boundingRect;
          var newPoint = [point[0] - boundingRect.left, point[1] - boundingRect.top];
          var scaleData = state.scaleData;
          newPoint[0] = (newPoint[0] - scaleData.scaleXOffset) / scaleData.scale;
          newPoint[1] = (newPoint[1] - scaleData.scaleYOffset) / scaleData.scale;
          return newPoint;
        }

        function fromContainerPoint(point) {
          if (!animation.wrapper || !animation.wrapper.getBoundingClientRect) {
            return point;
          }

          if (!state.boundingRect) {
            recalculateSize();
          }

          var boundingRect = state.boundingRect;
          var scaleData = state.scaleData;
          var newPoint = [point[0] * scaleData.scale + scaleData.scaleXOffset, point[1] * scaleData.scale + scaleData.scaleYOffset];
          var newPoint = [newPoint[0] + boundingRect.left, newPoint[1] + boundingRect.top];
          return newPoint;
        }

        function getScaleData() {
          return state.scaleData;
        }

        var methods = {
          recalculateSize: recalculateSize,
          getScaleData: getScaleData,
          toContainerPoint: toContainerPoint,
          fromContainerPoint: fromContainerPoint,
          getCurrentFrame: getCurrentFrame,
          getCurrentTime: getCurrentTime,
          addValueCallback: addValueCallback,
          toKeypathLayerPoint: toKeypathLayerPoint,
          fromKeypathLayerPoint: fromKeypathLayerPoint
        };
        return Object.assign({}, Renderer(state), methods);
      }

      module.exports = AnimationItemFactory;
    }, {
      "../helpers/layerAPIBuilder": 6,
      "../renderer/Renderer": 42
    }],
    2: [function (require, module, exports) {
      'use strict';

      module.exports = ',';
    }, {}],
    3: [function (require, module, exports) {
      'use strict';

      module.exports = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        13: 13,
        'comp': 0,
        'composition': 0,
        'solid': 1,
        'image': 2,
        'null': 3,
        'shape': 4,
        'text': 5,
        'camera': 13
      };
    }, {}],
    4: [function (require, module, exports) {
      'use strict';

      module.exports = {
        LAYER_TRANSFORM: 'transform'
      };
    }, {}],
    5: [function (require, module, exports) {
      'use strict';

      var key_path_separator = require('../enums/key_path_separator');

      var sanitizeString = require('./stringSanitizer');

      module.exports = function (propertyPath) {
        var keyPathSplit = propertyPath.split(key_path_separator);
        var selector = keyPathSplit.shift();
        return {
          selector: sanitizeString(selector),
          propertyPath: keyPathSplit.join(key_path_separator)
        };
      };
    }, {
      "../enums/key_path_separator": 2,
      "./stringSanitizer": 7
    }],
    6: [function (require, module, exports) {
      'use strict';

      var TextElement = require('../layer/text/TextElement');

      var ShapeElement = require('../layer/shape/Shape');

      var NullElement = require('../layer/null_element/NullElement');

      var SolidElement = require('../layer/solid/SolidElement');

      var ImageElement = require('../layer/image/ImageElement');

      var CameraElement = require('../layer/camera/Camera');

      var LayerBase = require('../layer/LayerBase');

      module.exports = function getLayerApi(element, parent) {
        var layerType = element.data.ty;

        var Composition = require('../layer/composition/Composition');

        switch (layerType) {
          case 0:
            return Composition(element, parent);

          case 1:
            return SolidElement(element, parent);

          case 2:
            return ImageElement(element, parent);

          case 3:
            return NullElement(element, parent);

          case 4:
            return ShapeElement(element, parent, element.data.shapes, element.itemsData);

          case 5:
            return TextElement(element, parent);

          case 13:
            return CameraElement(element, parent);

          default:
            return LayerBase(element, parent);
        }
      };
    }, {
      "../layer/LayerBase": 13,
      "../layer/camera/Camera": 15,
      "../layer/composition/Composition": 16,
      "../layer/image/ImageElement": 20,
      "../layer/null_element/NullElement": 21,
      "../layer/shape/Shape": 22,
      "../layer/solid/SolidElement": 35,
      "../layer/text/TextElement": 38
    }],
    7: [function (require, module, exports) {
      "use strict";

      function sanitizeString(string) {
        return string.trim();
      }

      module.exports = sanitizeString;
    }, {}],
    8: [function (require, module, exports) {
      'use strict';

      var createTypedArray = require('./typedArrays');
      /*!
       Transformation Matrix v2.0
       (c) Epistemex 2014-2015
       www.epistemex.com
       By Ken Fyrstenberg
       Contributions by leeoniya.
       License: MIT, header required.
       */

      /**
       * 2D transformation matrix object initialized with identity matrix.
       *
       * The matrix can synchronize a canvas context by supplying the context
       * as an argument, or later apply current absolute transform to an
       * existing context.
       *
       * All values are handled as floating point values.
       *
       * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
       * @prop {number} a - scale x
       * @prop {number} b - shear y
       * @prop {number} c - shear x
       * @prop {number} d - scale y
       * @prop {number} e - translate x
       * @prop {number} f - translate y
       * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
       * @constructor
       */


      var Matrix = function () {
        var _cos = Math.cos;
        var _sin = Math.sin;
        var _tan = Math.tan;
        var _rnd = Math.round;

        function reset() {
          this.props[0] = 1;
          this.props[1] = 0;
          this.props[2] = 0;
          this.props[3] = 0;
          this.props[4] = 0;
          this.props[5] = 1;
          this.props[6] = 0;
          this.props[7] = 0;
          this.props[8] = 0;
          this.props[9] = 0;
          this.props[10] = 1;
          this.props[11] = 0;
          this.props[12] = 0;
          this.props[13] = 0;
          this.props[14] = 0;
          this.props[15] = 1;
          return this;
        }

        function rotate(angle) {
          if (angle === 0) {
            return this;
          }

          var mCos = _cos(angle);

          var mSin = _sin(angle);

          return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }

        function rotateX(angle) {
          if (angle === 0) {
            return this;
          }

          var mCos = _cos(angle);

          var mSin = _sin(angle);

          return this._t(1, 0, 0, 0, 0, mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1);
        }

        function rotateY(angle) {
          if (angle === 0) {
            return this;
          }

          var mCos = _cos(angle);

          var mSin = _sin(angle);

          return this._t(mCos, 0, mSin, 0, 0, 1, 0, 0, -mSin, 0, mCos, 0, 0, 0, 0, 1);
        }

        function rotateZ(angle) {
          if (angle === 0) {
            return this;
          }

          var mCos = _cos(angle);

          var mSin = _sin(angle);

          return this._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        }

        function shear(sx, sy) {
          return this._t(1, sy, sx, 1, 0, 0);
        }

        function skew(ax, ay) {
          return this.shear(_tan(ax), _tan(ay));
        }

        function skewFromAxis(ax, angle) {
          var mCos = _cos(angle);

          var mSin = _sin(angle);

          return this._t(mCos, mSin, 0, 0, -mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, _tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); //return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, _tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
        }

        function scale(sx, sy, sz) {
          sz = isNaN(sz) ? 1 : sz;

          if (sx == 1 && sy == 1 && sz == 1) {
            return this;
          }

          return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
        }

        function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
          this.props[0] = a;
          this.props[1] = b;
          this.props[2] = c;
          this.props[3] = d;
          this.props[4] = e;
          this.props[5] = f;
          this.props[6] = g;
          this.props[7] = h;
          this.props[8] = i;
          this.props[9] = j;
          this.props[10] = k;
          this.props[11] = l;
          this.props[12] = m;
          this.props[13] = n;
          this.props[14] = o;
          this.props[15] = p;
          return this;
        }

        function translate(tx, ty, tz) {
          tz = tz || 0;

          if (tx !== 0 || ty !== 0 || tz !== 0) {
            return this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1);
          }

          return this;
        }

        function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {
          var _p = this.props;

          if (a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0) {
            //NOTE: commenting this condition because TurboFan deoptimizes code when present
            //if(m2 !== 0 || n2 !== 0 || o2 !== 0){
            _p[12] = _p[12] * a2 + _p[15] * m2;
            _p[13] = _p[13] * f2 + _p[15] * n2;
            _p[14] = _p[14] * k2 + _p[15] * o2;
            _p[15] = _p[15] * p2; //}

            this._identityCalculated = false;
            return this;
          }

          var a1 = _p[0];
          var b1 = _p[1];
          var c1 = _p[2];
          var d1 = _p[3];
          var e1 = _p[4];
          var f1 = _p[5];
          var g1 = _p[6];
          var h1 = _p[7];
          var i1 = _p[8];
          var j1 = _p[9];
          var k1 = _p[10];
          var l1 = _p[11];
          var m1 = _p[12];
          var n1 = _p[13];
          var o1 = _p[14];
          var p1 = _p[15];
          /* matrix order (canvas compatible):
           * ace
           * bdf
           * 001
           */

          _p[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
          _p[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2;
          _p[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2;
          _p[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2;
          _p[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2;
          _p[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2;
          _p[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2;
          _p[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2;
          _p[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2;
          _p[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2;
          _p[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2;
          _p[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2;
          _p[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2;
          _p[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2;
          _p[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2;
          _p[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2;
          this._identityCalculated = false;
          return this;
        }

        function isIdentity() {
          if (!this._identityCalculated) {
            this._identity = !(this.props[0] !== 1 || this.props[1] !== 0 || this.props[2] !== 0 || this.props[3] !== 0 || this.props[4] !== 0 || this.props[5] !== 1 || this.props[6] !== 0 || this.props[7] !== 0 || this.props[8] !== 0 || this.props[9] !== 0 || this.props[10] !== 1 || this.props[11] !== 0 || this.props[12] !== 0 || this.props[13] !== 0 || this.props[14] !== 0 || this.props[15] !== 1);
            this._identityCalculated = true;
          }

          return this._identity;
        }

        function equals(matr) {
          var i = 0;

          while (i < 16) {
            if (matr.props[i] !== this.props[i]) {
              return false;
            }

            i += 1;
          }

          return true;
        }

        function clone(matr) {
          var i;

          for (i = 0; i < 16; i += 1) {
            matr.props[i] = this.props[i];
          }
        }

        function cloneFromProps(props) {
          var i;

          for (i = 0; i < 16; i += 1) {
            this.props[i] = props[i];
          }
        }

        function applyToPoint(x, y, z) {
          return {
            x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
            y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
            z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]
          };
          /*return {
           x: x * me.a + y * me.c + me.e,
           y: x * me.b + y * me.d + me.f
           };*/
        }

        function applyToX(x, y, z) {
          return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
        }

        function applyToY(x, y, z) {
          return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
        }

        function applyToZ(x, y, z) {
          return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
        }

        function inversePoint(pt) {
          var determinant = this.props[0] * this.props[5] - this.props[1] * this.props[4];
          var a = this.props[5] / determinant;
          var b = -this.props[1] / determinant;
          var c = -this.props[4] / determinant;
          var d = this.props[0] / determinant;
          var e = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / determinant;
          var f = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / determinant;
          return [pt[0] * a + pt[1] * c + e, pt[0] * b + pt[1] * d + f, 0];
        }

        function inversePoints(pts) {
          var i,
              len = pts.length,
              retPts = [];

          for (i = 0; i < len; i += 1) {
            retPts[i] = inversePoint(pts[i]);
          }

          return retPts;
        }

        function applyToTriplePoints(pt1, pt2, pt3) {
          var arr = createTypedArray('float32', 6);

          if (this.isIdentity()) {
            arr[0] = pt1[0];
            arr[1] = pt1[1];
            arr[2] = pt2[0];
            arr[3] = pt2[1];
            arr[4] = pt3[0];
            arr[5] = pt3[1];
          } else {
            var p0 = this.props[0],
                p1 = this.props[1],
                p4 = this.props[4],
                p5 = this.props[5],
                p12 = this.props[12],
                p13 = this.props[13];
            arr[0] = pt1[0] * p0 + pt1[1] * p4 + p12;
            arr[1] = pt1[0] * p1 + pt1[1] * p5 + p13;
            arr[2] = pt2[0] * p0 + pt2[1] * p4 + p12;
            arr[3] = pt2[0] * p1 + pt2[1] * p5 + p13;
            arr[4] = pt3[0] * p0 + pt3[1] * p4 + p12;
            arr[5] = pt3[0] * p1 + pt3[1] * p5 + p13;
          }

          return arr;
        }

        function applyToPointArray(x, y, z) {
          var arr;

          if (this.isIdentity()) {
            arr = [x, y, z];
          } else {
            arr = [x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12], x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13], x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]];
          }

          return arr;
        }

        function applyToPointStringified(x, y) {
          if (this.isIdentity()) {
            return x + ',' + y;
          }

          return x * this.props[0] + y * this.props[4] + this.props[12] + ',' + (x * this.props[1] + y * this.props[5] + this.props[13]);
        }

        function toCSS() {
          //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.

          /*if(this.isIdentity()) {
              return '';
          }*/
          var i = 0;
          var props = this.props;
          var cssValue = 'matrix3d(';
          var v = 10000;

          while (i < 16) {
            cssValue += _rnd(props[i] * v) / v;
            cssValue += i === 15 ? ')' : ',';
            i += 1;
          }

          return cssValue;
        }

        function to2dCSS() {
          //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.

          /*if(this.isIdentity()) {
              return '';
          }*/
          var v = 10000;
          var props = this.props;
          return "matrix(" + _rnd(props[0] * v) / v + ',' + _rnd(props[1] * v) / v + ',' + _rnd(props[4] * v) / v + ',' + _rnd(props[5] * v) / v + ',' + _rnd(props[12] * v) / v + ',' + _rnd(props[13] * v) / v + ")";
        }

        function MatrixInstance() {
          this.reset = reset;
          this.rotate = rotate;
          this.rotateX = rotateX;
          this.rotateY = rotateY;
          this.rotateZ = rotateZ;
          this.skew = skew;
          this.skewFromAxis = skewFromAxis;
          this.shear = shear;
          this.scale = scale;
          this.setTransform = setTransform;
          this.translate = translate;
          this.transform = transform;
          this.applyToPoint = applyToPoint;
          this.applyToX = applyToX;
          this.applyToY = applyToY;
          this.applyToZ = applyToZ;
          this.applyToPointArray = applyToPointArray;
          this.applyToTriplePoints = applyToTriplePoints;
          this.applyToPointStringified = applyToPointStringified;
          this.toCSS = toCSS;
          this.to2dCSS = to2dCSS;
          this.clone = clone;
          this.cloneFromProps = cloneFromProps;
          this.equals = equals;
          this.inversePoints = inversePoints;
          this.inversePoint = inversePoint;
          this._t = this.transform;
          this.isIdentity = isIdentity;
          this._identity = true;
          this._identityCalculated = false;
          this.props = createTypedArray('float32', 16);
          this.reset();
        }

        ;
        return function () {
          return new MatrixInstance();
        };
      }();

      module.exports = Matrix;
    }, {
      "./typedArrays": 9
    }],
    9: [function (require, module, exports) {
      'use strict';

      var createTypedArray = function () {
        function createRegularArray(type, len) {
          var i = 0,
              arr = [],
              value;

          switch (type) {
            case 'int16':
            case 'uint8c':
              value = 1;
              break;

            default:
              value = 1.1;
              break;
          }

          for (i = 0; i < len; i += 1) {
            arr.push(value);
          }

          return arr;
        }

        function createTypedArray(type, len) {
          if (type === 'float32') {
            return new Float32Array(len);
          } else if (type === 'int16') {
            return new Int16Array(len);
          } else if (type === 'uint8c') {
            return new Uint8ClampedArray(len);
          }
        }

        if (typeof Uint8ClampedArray === 'function' && typeof Float32Array === 'function') {
          return createTypedArray;
        } else {
          return createRegularArray;
        }
      }();

      module.exports = createTypedArray;
    }, {}],
    10: [function (require, module, exports) {
      'use strict';

      var AnimationItem = require('./animation/AnimationItem');

      function createAnimationApi(anim) {
        return Object.assign({}, AnimationItem(anim));
      }

      module.exports = {
        createAnimationApi: createAnimationApi
      };
    }, {
      "./animation/AnimationItem": 1
    }],
    11: [function (require, module, exports) {
      'use strict';

      var keyPathBuilder = require('../helpers/keyPathBuilder');

      var layer_types = require('../enums/layer_types');

      function KeyPathList(elements, node_type) {
        function _getLength() {
          return elements.length;
        }

        function _filterLayerByType(elements, type) {
          return elements.filter(function (element) {
            return element.getTargetLayer().data.ty === layer_types[type];
          });
        }

        function _filterLayerByName(elements, name) {
          return elements.filter(function (element) {
            return element.getTargetLayer().data.nm === name;
          });
        }

        function _filterLayerByProperty(elements, name) {
          return elements.filter(function (element) {
            if (element.hasProperty(name)) {
              return element.getProperty(name);
            }

            return false;
          });
        }

        function getLayersByType(selector) {
          return KeyPathList(_filterLayerByType(elements, selector), 'layer');
        }

        function getLayersByName(selector) {
          return KeyPathList(_filterLayerByName(elements, selector), 'layer');
        }

        function getPropertiesBySelector(selector) {
          return KeyPathList(elements.filter(function (element) {
            return element.hasProperty(selector);
          }).map(function (element) {
            return element.getProperty(selector);
          }), 'property');
        }

        function getLayerProperty(selector) {
          var layers = _filterLayerByProperty(elements, selector);

          var properties = layers.map(function (element) {
            return element.getProperty(selector);
          });
          return KeyPathList(properties, 'property');
        }

        function getKeyPath(propertyPath) {
          var keyPathData = keyPathBuilder(propertyPath);
          var selector = keyPathData.selector;
          var nodesByName, nodesByType, selectedNodes;

          if (node_type === 'renderer' || node_type === 'layer') {
            nodesByName = getLayersByName(selector);
            nodesByType = getLayersByType(selector);

            if (nodesByName.length === 0 && nodesByType.length === 0) {
              selectedNodes = getLayerProperty(selector);
            } else {
              selectedNodes = nodesByName.concat(nodesByType);
            }

            if (keyPathData.propertyPath) {
              return selectedNodes.getKeyPath(keyPathData.propertyPath);
            } else {
              return selectedNodes;
            }
          } else if (node_type === 'property') {
            selectedNodes = getPropertiesBySelector(selector);

            if (keyPathData.propertyPath) {
              return selectedNodes.getKeyPath(keyPathData.propertyPath);
            } else {
              return selectedNodes;
            }
          }
        }

        function concat(nodes) {
          var nodesElements = nodes.getElements();
          return KeyPathList(elements.concat(nodesElements), node_type);
        }

        function getElements() {
          return elements;
        }

        function getPropertyAtIndex(index) {
          return elements[index];
        }

        var methods = {
          getKeyPath: getKeyPath,
          concat: concat,
          getElements: getElements,
          getPropertyAtIndex: getPropertyAtIndex
        };
        Object.defineProperty(methods, 'length', {
          get: _getLength
        });
        return methods;
      }

      module.exports = KeyPathList;
    }, {
      "../enums/layer_types": 3,
      "../helpers/keyPathBuilder": 5
    }],
    12: [function (require, module, exports) {
      'use strict';

      var key_path_separator = require('../enums/key_path_separator');

      var property_names = require('../enums/property_names');

      function KeyPathNode(state) {
        function getPropertyByPath(selector, propertyPath) {
          var instanceProperties = state.properties || [];
          var i = 0,
              len = instanceProperties.length;

          while (i < len) {
            if (instanceProperties[i].name === selector) {
              return instanceProperties[i].value;
            }

            i += 1;
          }

          return null;
        }

        function hasProperty(selector) {
          return !!getPropertyByPath(selector);
        }

        function getProperty(selector) {
          return getPropertyByPath(selector);
        }

        function fromKeypathLayerPoint(point) {
          return state.parent.fromKeypathLayerPoint(point);
        }

        function toKeypathLayerPoint(point) {
          return state.parent.toKeypathLayerPoint(point);
        }

        var methods = {
          hasProperty: hasProperty,
          getProperty: getProperty,
          fromKeypathLayerPoint: fromKeypathLayerPoint,
          toKeypathLayerPoint: toKeypathLayerPoint
        };
        return methods;
      }

      module.exports = KeyPathNode;
    }, {
      "../enums/key_path_separator": 2,
      "../enums/property_names": 4
    }],
    13: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../key_path/KeyPathNode');

      var Transform = require('./transform/Transform');

      var Effects = require('./effects/Effects');

      var Matrix = require('../helpers/transformationMatrix');

      function LayerBase(state) {
        var transform = Transform(state.element.finalTransform.mProp, state);
        var effects = Effects(state.element.effectsManager.effectElements || [], state);

        function _buildPropertyMap() {
          state.properties.push({
            name: 'transform',
            value: transform
          }, {
            name: 'Transform',
            value: transform
          }, {
            name: 'Effects',
            value: effects
          }, {
            name: 'effects',
            value: effects
          });
        }

        function getElementToPoint(point) {}

        function toKeypathLayerPoint(point) {
          var element = state.element;

          if (state.parent.toKeypathLayerPoint) {
            point = state.parent.toKeypathLayerPoint(point);
          }

          var toWorldMat = Matrix();
          var transformMat = state.getProperty('Transform').getTargetTransform();
          transformMat.applyToMatrix(toWorldMat);

          if (element.hierarchy && element.hierarchy.length) {
            var i,
                len = element.hierarchy.length;

            for (i = 0; i < len; i += 1) {
              element.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
            }
          }

          return toWorldMat.inversePoint(point);
        }

        function fromKeypathLayerPoint(point) {
          var element = state.element;
          var toWorldMat = Matrix();
          var transformMat = state.getProperty('Transform').getTargetTransform();
          transformMat.applyToMatrix(toWorldMat);

          if (element.hierarchy && element.hierarchy.length) {
            var i,
                len = element.hierarchy.length;

            for (i = 0; i < len; i += 1) {
              element.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
            }
          }

          point = toWorldMat.applyToPointArray(point[0], point[1], point[2] || 0);

          if (state.parent.fromKeypathLayerPoint) {
            return state.parent.fromKeypathLayerPoint(point);
          } else {
            return point;
          }
        }

        function getTargetLayer() {
          return state.element;
        }

        var methods = {
          getTargetLayer: getTargetLayer,
          toKeypathLayerPoint: toKeypathLayerPoint,
          fromKeypathLayerPoint: fromKeypathLayerPoint
        };

        _buildPropertyMap();

        return Object.assign(state, KeyPathNode(state), methods);
      }

      module.exports = LayerBase;
    }, {
      "../helpers/transformationMatrix": 8,
      "../key_path/KeyPathNode": 12,
      "./effects/Effects": 19,
      "./transform/Transform": 39
    }],
    14: [function (require, module, exports) {
      'use strict';

      var layer_types = require('../enums/layer_types');

      var layer_api = require('../helpers/layerAPIBuilder');

      function LayerList(elements) {
        function _getLength() {
          return elements.length;
        }

        function _filterLayerByType(elements, type) {
          return elements.filter(function (element) {
            return element.data.ty === layer_types[type];
          });
        }

        function _filterLayerByName(elements, name) {
          return elements.filter(function (element) {
            return element.data.nm === name;
          });
        }

        function getLayers() {
          return LayerList(elements);
        }

        function getLayersByType(type) {
          var elementsList = _filterLayerByType(elements, type);

          return LayerList(elementsList);
        }

        function getLayersByName(type) {
          var elementsList = _filterLayerByName(elements, type);

          return LayerList(elementsList);
        }

        function layer(index) {
          if (index >= elements.length) {
            return [];
          }

          return layer_api(elements[parseInt(index)]);
        }

        function addIteratableMethods(iteratableMethods, list) {
          iteratableMethods.reduce(function (accumulator, value) {
            var _value = value;

            accumulator[value] = function () {
              var _arguments = arguments;
              return elements.map(function (element) {
                var layer = layer_api(element);

                if (layer[_value]) {
                  return layer[_value].apply(null, _arguments);
                }

                return null;
              });
            };

            return accumulator;
          }, methods);
        }

        function getTargetElements() {
          return elements;
        }

        function concat(list) {
          return elements.concat(list.getTargetElements());
        }

        var methods = {
          getLayers: getLayers,
          getLayersByType: getLayersByType,
          getLayersByName: getLayersByName,
          layer: layer,
          concat: concat,
          getTargetElements: getTargetElements
        };
        addIteratableMethods(['setTranslate', 'getType', 'getDuration']);
        addIteratableMethods(['setText', 'getText', 'setDocumentData', 'canResizeFont', 'setMinimumFontSize']);
        Object.defineProperty(methods, 'length', {
          get: _getLength
        });
        return methods;
      }

      module.exports = LayerList;
    }, {
      "../enums/layer_types": 3,
      "../helpers/layerAPIBuilder": 6
    }],
    15: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function Camera(element, parent) {
        var instance = {};
        var state = {
          element: element,
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Point of Interest',
            value: Property(element.a, parent)
          }, {
            name: 'Zoom',
            value: Property(element.pe, parent)
          }, {
            name: 'Position',
            value: Property(element.p, parent)
          }, {
            name: 'X Rotation',
            value: Property(element.rx, parent)
          }, {
            name: 'Y Rotation',
            value: Property(element.ry, parent)
          }, {
            name: 'Z Rotation',
            value: Property(element.rz, parent)
          }, {
            name: 'Orientation',
            value: Property(element.or, parent)
          }];
        }

        function getTargetLayer() {
          return state.element;
        }

        var methods = {
          getTargetLayer: getTargetLayer
        };
        return Object.assign(instance, KeyPathNode(state), methods);
      }

      module.exports = Camera;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    16: [function (require, module, exports) {
      'use strict';

      var KeyPathList = require('../../key_path/KeyPathList');

      var LayerBase = require('../LayerBase');

      var layer_api = require('../../helpers/layerAPIBuilder');

      var Property = require('../../property/Property');

      var TimeRemap = require('./TimeRemap');

      function Composition(element, parent) {
        var instance = {};
        var state = {
          element: element,
          parent: parent,
          properties: _buildPropertyMap()
        };

        function buildLayerApi(layer, index) {
          var _layerApi = null;
          var ob = {
            name: layer.nm
          };

          function getLayerApi() {
            if (!_layerApi) {
              _layerApi = layer_api(element.elements[index], state);
            }

            return _layerApi;
          }

          Object.defineProperty(ob, 'value', {
            get: getLayerApi
          });
          return ob;
        }

        function _buildPropertyMap() {
          var compositionLayers = element.layers.map(buildLayerApi);
          return [{
            name: 'Time Remap',
            value: TimeRemap(element.tm)
          }].concat(compositionLayers);
        }

        var methods = {};
        return Object.assign(instance, LayerBase(state), KeyPathList(state.elements, 'layer'), methods);
      }

      module.exports = Composition;
    }, {
      "../../helpers/layerAPIBuilder": 6,
      "../../key_path/KeyPathList": 11,
      "../../property/Property": 40,
      "../LayerBase": 13,
      "./TimeRemap": 17
    }],
    17: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var ValueProperty = require('../../property/ValueProperty');

      function TimeRemap(property, parent) {
        var state = {
          property: property,
          parent: parent
        };
        var _isCallbackAdded = false;
        var currentSegmentInit = 0;
        var currentSegmentEnd = 0;
        var previousTime = 0,
            currentTime = 0;
        var initTime = 0;
        var _loop = true;
        var _loopCount = 0;
        var _speed = 1;
        var _paused = false;
        var _isDebugging = false;
        var queuedSegments = [];

        var _destroyFunction;

        var enterFrameCallback = null;
        var enterFrameEvent = {
          time: -1
        };

        function playSegment(init, end, clear) {
          _paused = false;

          if (clear) {
            clearQueue();
            currentTime = init;
          }

          if (_isDebugging) {
            console.log(init, end);
          }

          _loopCount = 0;
          previousTime = Date.now();
          currentSegmentInit = init;
          currentSegmentEnd = end;
          addCallback();
        }

        function playQueuedSegment() {
          var newSegment = queuedSegments.shift();
          playSegment(newSegment[0], newSegment[1]);
        }

        function queueSegment(init, end) {
          queuedSegments.push([init, end]);
        }

        function clearQueue() {
          queuedSegments.length = 0;
        }

        function _segmentPlayer(currentValue) {
          if (currentSegmentInit === currentSegmentEnd) {
            currentTime = currentSegmentInit;
          } else if (!_paused) {
            var nowTime = Date.now();
            var elapsedTime = _speed * (nowTime - previousTime) / 1000;
            previousTime = nowTime;

            if (currentSegmentInit < currentSegmentEnd) {
              currentTime += elapsedTime;

              if (currentTime > currentSegmentEnd) {
                _loopCount += 1;

                if (queuedSegments.length) {
                  playQueuedSegment();
                } else if (!_loop) {
                  currentTime = currentSegmentEnd;
                } else {
                  /*currentTime -= Math.floor(currentTime / (currentSegmentEnd - currentSegmentInit)) * (currentSegmentEnd - currentSegmentInit);
                  currentTime = currentSegmentInit + currentTime;*/
                  currentTime = currentTime % (currentSegmentEnd - currentSegmentInit); //currentTime = currentSegmentInit + (currentTime);
                  //currentTime = currentSegmentInit + (currentTime - currentSegmentEnd);
                  //console.log('CT: ', currentTime) 
                }
              }
            } else {
              currentTime -= elapsedTime;

              if (currentTime < currentSegmentEnd) {
                _loopCount += 1;

                if (queuedSegments.length) {
                  playQueuedSegment();
                } else if (!_loop) {
                  currentTime = currentSegmentEnd;
                } else {
                  currentTime = currentSegmentInit - (currentSegmentEnd - currentTime);
                }
              }
            }

            if (_isDebugging) {
              console.log(currentTime);
            }
          }

          if (instance.onEnterFrame && enterFrameEvent.time !== currentTime) {
            enterFrameEvent.time = currentTime;
            instance.onEnterFrame(enterFrameEvent);
          }

          return currentTime;
        }

        function addCallback() {
          if (!_isCallbackAdded) {
            _isCallbackAdded = true;
            _destroyFunction = instance.setValue(_segmentPlayer, _isDebugging);
          }
        }

        function playTo(end, clear) {
          _paused = false;

          if (clear) {
            clearQueue();
          }

          addCallback();
          currentSegmentEnd = end;
        }

        function getCurrentTime() {
          if (_isCallbackAdded) {
            return currentTime;
          } else {
            return property.v / property.mult;
          }
        }

        function setLoop(flag) {
          _loop = flag;
        }

        function setSpeed(value) {
          _speed = value;
        }

        function setDebugging(flag) {
          _isDebugging = flag;
        }

        function pause() {
          _paused = true;
        }

        function destroy() {
          if (_destroyFunction) {
            _destroyFunction();

            state.property = null;
            state.parent = null;
          }
        }

        var methods = {
          playSegment: playSegment,
          playTo: playTo,
          queueSegment: queueSegment,
          clearQueue: clearQueue,
          setLoop: setLoop,
          setSpeed: setSpeed,
          pause: pause,
          setDebugging: setDebugging,
          getCurrentTime: getCurrentTime,
          onEnterFrame: null,
          destroy: destroy
        };
        var instance = {};
        return Object.assign(instance, methods, ValueProperty(state), KeyPathNode(state));
      }

      module.exports = TimeRemap;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/ValueProperty": 41
    }],
    18: [function (require, module, exports) {
      'use strict';

      var Property = require('../../property/Property');

      function EffectElement(effect, parent) {
        return Property(effect.p, parent);
      }

      module.exports = EffectElement;
    }, {
      "../../property/Property": 40
    }],
    19: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      var EffectElement = require('./EffectElement');

      function Effects(effects, parent) {
        var state = {
          parent: parent,
          properties: buildProperties()
        };

        function getValue(effectData, index) {
          var nm = effectData.data ? effectData.data.nm : index.toString();
          var effectElement = effectData.data ? Effects(effectData.effectElements, parent) : Property(effectData.p, parent);
          return {
            name: nm,
            value: effectElement
          };
        }

        function buildProperties() {
          var i,
              len = effects.length;
          var arr = [];

          for (i = 0; i < len; i += 1) {
            arr.push(getValue(effects[i], i));
          }

          return arr;
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = Effects;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40,
      "./EffectElement": 18
    }],
    20: [function (require, module, exports) {
      'use strict';

      var LayerBase = require('../LayerBase');

      function Image(element) {
        var state = {
          element: element,
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [];
        }

        var methods = {};
        return Object.assign({}, LayerBase(state), methods);
      }

      module.exports = Image;
    }, {
      "../LayerBase": 13
    }],
    21: [function (require, module, exports) {
      'use strict';

      var LayerBase = require('../LayerBase');

      function NullElement(element, parent) {
        var instance = {};
        var state = {
          element: element,
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [];
        }

        var methods = {};
        return Object.assign(instance, LayerBase(state), methods);
      }

      module.exports = NullElement;
    }, {
      "../LayerBase": 13
    }],
    22: [function (require, module, exports) {
      'use strict';

      var LayerBase = require('../LayerBase');

      var ShapeContents = require('./ShapeContents');

      function Shape(element, parent) {
        var state = {
          properties: [],
          parent: parent,
          element: element
        };
        var shapeContents = ShapeContents(element.data.shapes, element.itemsData, state);

        function _buildPropertyMap() {
          state.properties.push({
            name: 'Contents',
            value: shapeContents
          });
        }

        var methods = {};

        _buildPropertyMap();

        return Object.assign(state, LayerBase(state), methods);
      }

      module.exports = Shape;
    }, {
      "../LayerBase": 13,
      "./ShapeContents": 23
    }],
    23: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      var ShapeRectangle = require('./ShapeRectangle');

      var ShapeFill = require('./ShapeFill');

      var ShapeStroke = require('./ShapeStroke');

      var ShapeEllipse = require('./ShapeEllipse');

      var ShapeGradientFill = require('./ShapeGradientFill');

      var ShapeGradientStroke = require('./ShapeGradientStroke');

      var ShapeTrimPaths = require('./ShapeTrimPaths');

      var ShapeRepeater = require('./ShapeRepeater');

      var ShapePolystar = require('./ShapePolystar');

      var ShapeRoundCorners = require('./ShapeRoundCorners');

      var ShapePath = require('./ShapePath');

      var Transform = require('../transform/Transform');

      var Matrix = require('../../helpers/transformationMatrix');

      function ShapeContents(shapesData, shapes, parent) {
        var state = {
          properties: _buildPropertyMap(),
          parent: parent
        };
        var cachedShapeProperties = [];

        function buildShapeObject(shape, index) {
          var ob = {
            name: shape.nm
          };
          Object.defineProperty(ob, 'value', {
            get: function get() {
              if (cachedShapeProperties[index]) {
                return cachedShapeProperties[index];
              } else {
                var property;
              }

              if (shape.ty === 'gr') {
                property = ShapeContents(shapesData[index].it, shapes[index].it, state);
              } else if (shape.ty === 'rc') {
                property = ShapeRectangle(shapes[index], state);
              } else if (shape.ty === 'el') {
                property = ShapeEllipse(shapes[index], state);
              } else if (shape.ty === 'fl') {
                property = ShapeFill(shapes[index], state);
              } else if (shape.ty === 'st') {
                property = ShapeStroke(shapes[index], state);
              } else if (shape.ty === 'gf') {
                property = ShapeGradientFill(shapes[index], state);
              } else if (shape.ty === 'gs') {
                property = ShapeGradientStroke(shapes[index], state);
              } else if (shape.ty === 'tm') {
                property = ShapeTrimPaths(shapes[index], state);
              } else if (shape.ty === 'rp') {
                property = ShapeRepeater(shapes[index], state);
              } else if (shape.ty === 'sr') {
                property = ShapePolystar(shapes[index], state);
              } else if (shape.ty === 'rd') {
                property = ShapeRoundCorners(shapes[index], state);
              } else if (shape.ty === 'sh') {
                property = ShapePath(shapes[index], state);
              } else if (shape.ty === 'tr') {
                property = Transform(shapes[index].transform.mProps, state);
              } else {
                console.log(shape.ty);
              }

              cachedShapeProperties[index] = property;
              return property;
            }
          });
          return ob;
        }

        function _buildPropertyMap() {
          return shapesData.map(function (shape, index) {
            return buildShapeObject(shape, index);
          });
        }

        function fromKeypathLayerPoint(point) {
          if (state.hasProperty('Transform')) {
            var toWorldMat = Matrix();
            var transformMat = state.getProperty('Transform').getTargetTransform();
            transformMat.applyToMatrix(toWorldMat);
            point = toWorldMat.applyToPointArray(point[0], point[1], point[2] || 0);
          }

          return state.parent.fromKeypathLayerPoint(point);
        }

        function toKeypathLayerPoint(point) {
          point = state.parent.toKeypathLayerPoint(point);

          if (state.hasProperty('Transform')) {
            var toWorldMat = Matrix();
            var transformMat = state.getProperty('Transform').getTargetTransform();
            transformMat.applyToMatrix(toWorldMat);
            point = toWorldMat.inversePoint(point);
          }

          return point;
        }

        var methods = {
          fromKeypathLayerPoint: fromKeypathLayerPoint,
          toKeypathLayerPoint: toKeypathLayerPoint //state.properties = _buildPropertyMap();

        };
        return Object.assign(state, KeyPathNode(state), methods);
      }

      module.exports = ShapeContents;
    }, {
      "../../helpers/transformationMatrix": 8,
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40,
      "../transform/Transform": 39,
      "./ShapeEllipse": 24,
      "./ShapeFill": 25,
      "./ShapeGradientFill": 26,
      "./ShapeGradientStroke": 27,
      "./ShapePath": 28,
      "./ShapePolystar": 29,
      "./ShapeRectangle": 30,
      "./ShapeRepeater": 31,
      "./ShapeRoundCorners": 32,
      "./ShapeStroke": 33,
      "./ShapeTrimPaths": 34
    }],
    24: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeEllipse(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Size',
            value: Property(element.sh.s, parent)
          }, {
            name: 'Position',
            value: Property(element.sh.p, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeEllipse;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    25: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeFill(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Color',
            value: Property(element.c, parent)
          }, {
            name: 'Opacity',
            value: {
              setValue: Property(element.o, parent)
            }
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeFill;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    26: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeGradientFill(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Start Point',
            value: Property(element.s, parent)
          }, {
            name: 'End Point',
            value: Property(element.s, parent)
          }, {
            name: 'Opacity',
            value: Property(element.o, parent)
          }, {
            name: 'Highlight Length',
            value: Property(element.h, parent)
          }, {
            name: 'Highlight Angle',
            value: Property(element.a, parent)
          }, {
            name: 'Colors',
            value: Property(element.g.prop, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeGradientFill;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    27: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeGradientStroke(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Start Point',
            value: Property(element.s, parent)
          }, {
            name: 'End Point',
            value: Property(element.e, parent)
          }, {
            name: 'Opacity',
            value: Property(element.o, parent)
          }, {
            name: 'Highlight Length',
            value: Property(element.h, parent)
          }, {
            name: 'Highlight Angle',
            value: Property(element.a, parent)
          }, {
            name: 'Colors',
            value: Property(element.g.prop, parent)
          }, {
            name: 'Stroke Width',
            value: Property(element.w, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeGradientStroke;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    28: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapePath(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function setPath(value) {
          Property(element.sh).setValue(value);
        }

        function _buildPropertyMap() {
          return [{
            name: 'path',
            value: Property(element.sh, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapePath;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    29: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapePolystar(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Points',
            value: Property(element.sh.pt, parent)
          }, {
            name: 'Position',
            value: Property(element.sh.p, parent)
          }, {
            name: 'Rotation',
            value: Property(element.sh.r, parent)
          }, {
            name: 'Inner Radius',
            value: Property(element.sh.ir, parent)
          }, {
            name: 'Outer Radius',
            value: Property(element.sh.or, parent)
          }, {
            name: 'Inner Roundness',
            value: Property(element.sh.is, parent)
          }, {
            name: 'Outer Roundness',
            value: Property(element.sh.os, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapePolystar;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    30: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeRectangle(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Size',
            value: Property(element.sh.s, parent)
          }, {
            name: 'Position',
            value: Property(element.sh.p, parent)
          }, {
            name: 'Roundness',
            value: Property(element.sh.r, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeRectangle;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    31: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      var Transform = require('../transform/Transform');

      function ShapeRepeater(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Copies',
            value: Property(element.c, parent)
          }, {
            name: 'Offset',
            value: Property(element.o, parent)
          }, {
            name: 'Transform',
            value: Transform(element.tr, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeRepeater;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40,
      "../transform/Transform": 39
    }],
    32: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeRoundCorners(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Radius',
            value: Property(element.rd, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeRoundCorners;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    33: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeStroke(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Color',
            value: Property(element.c, parent)
          }, {
            name: 'Stroke Width',
            value: Property(element.w, parent)
          }, {
            name: 'Opacity',
            value: Property(element.o, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeStroke;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    34: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function ShapeTrimPaths(element, parent) {
        var state = {
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Start',
            value: Property(element.s, parent)
          }, {
            name: 'End',
            value: Property(element.e, parent)
          }, {
            name: 'Offset',
            value: Property(element.o, parent)
          }];
        }

        var methods = {};
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = ShapeTrimPaths;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    35: [function (require, module, exports) {
      'use strict';

      var LayerBase = require('../LayerBase');

      function Solid(element, parent) {
        var state = {
          element: element,
          parent: parent,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [];
        }

        var methods = {};
        return Object.assign({}, LayerBase(state), methods);
      }

      module.exports = Solid;
    }, {
      "../LayerBase": 13
    }],
    36: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      var TextAnimator = require('./TextAnimator');

      function Text(element, parent) {
        var instance = {};
        var state = {
          element: element,
          parent: parent,
          properties: _buildPropertyMap()
        };

        function setDocumentData(_function) {
          var previousValue;

          var textDocumentUpdater = function textDocumentUpdater(data) {
            var newValue = _function(element.textProperty.currentData);

            if (previousValue !== newValue) {
              previousValue = newValue;
              return Object.assign({}, data, newValue, {
                __complete: false
              });
            }

            return data;
          };

          element.textProperty.addEffect(textDocumentUpdater);
        }

        function addAnimators() {
          var animatorProperties = [];
          var animators = element.textAnimator._animatorsData;
          var i,
              len = animators.length;
          var textAnimator;

          for (i = 0; i < len; i += 1) {
            textAnimator = TextAnimator(animators[i]);
            animatorProperties.push({
              name: element.textAnimator._textData.a[i].nm || 'Animator ' + (i + 1),
              //Fallback for old animations
              value: textAnimator
            });
          }

          return animatorProperties;
        }

        function _buildPropertyMap() {
          return [{
            name: 'Source',
            value: {
              setValue: setDocumentData
            }
          }].concat(addAnimators());
        }

        var methods = {};
        return Object.assign(instance, methods, KeyPathNode(state));
      }

      module.exports = Text;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40,
      "./TextAnimator": 37
    }],
    37: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function TextAnimator(animator) {
        var instance = {};
        var state = {
          properties: _buildPropertyMap()
        };

        function setAnchorPoint(value) {
          Property(animator.a.a).setValue(value);
        }

        function setFillBrightness(value) {
          Property(animator.a.fb).setValue(value);
        }

        function setFillColor(value) {
          Property(animator.a.fc).setValue(value);
        }

        function setFillHue(value) {
          Property(animator.a.fh).setValue(value);
        }

        function setFillSaturation(value) {
          Property(animator.a.fs).setValue(value);
        }

        function setFillOpacity(value) {
          Property(animator.a.fo).setValue(value);
        }

        function setOpacity(value) {
          Property(animator.a.o).setValue(value);
        }

        function setPosition(value) {
          Property(animator.a.p).setValue(value);
        }

        function setRotation(value) {
          Property(animator.a.r).setValue(value);
        }

        function setRotationX(value) {
          Property(animator.a.rx).setValue(value);
        }

        function setRotationY(value) {
          Property(animator.a.ry).setValue(value);
        }

        function setScale(value) {
          Property(animator.a.s).setValue(value);
        }

        function setSkewAxis(value) {
          Property(animator.a.sa).setValue(value);
        }

        function setStrokeColor(value) {
          Property(animator.a.sc).setValue(value);
        }

        function setSkew(value) {
          Property(animator.a.sk).setValue(value);
        }

        function setStrokeOpacity(value) {
          Property(animator.a.so).setValue(value);
        }

        function setStrokeWidth(value) {
          Property(animator.a.sw).setValue(value);
        }

        function setStrokeBrightness(value) {
          Property(animator.a.sb).setValue(value);
        }

        function setStrokeHue(value) {
          Property(animator.a.sh).setValue(value);
        }

        function setStrokeSaturation(value) {
          Property(animator.a.ss).setValue(value);
        }

        function setTrackingAmount(value) {
          Property(animator.a.t).setValue(value);
        }

        function _buildPropertyMap() {
          return [{
            name: 'Anchor Point',
            value: {
              setValue: setAnchorPoint
            }
          }, {
            name: 'Fill Brightness',
            value: {
              setValue: setFillBrightness
            }
          }, {
            name: 'Fill Color',
            value: {
              setValue: setFillColor
            }
          }, {
            name: 'Fill Hue',
            value: {
              setValue: setFillHue
            }
          }, {
            name: 'Fill Saturation',
            value: {
              setValue: setFillSaturation
            }
          }, {
            name: 'Fill Opacity',
            value: {
              setValue: setFillOpacity
            }
          }, {
            name: 'Opacity',
            value: {
              setValue: setOpacity
            }
          }, {
            name: 'Position',
            value: {
              setValue: setPosition
            }
          }, {
            name: 'Rotation X',
            value: {
              setValue: setRotationX
            }
          }, {
            name: 'Rotation Y',
            value: {
              setValue: setRotationY
            }
          }, {
            name: 'Scale',
            value: {
              setValue: setScale
            }
          }, {
            name: 'Skew Axis',
            value: {
              setValue: setSkewAxis
            }
          }, {
            name: 'Stroke Color',
            value: {
              setValue: setStrokeColor
            }
          }, {
            name: 'Skew',
            value: {
              setValue: setSkew
            }
          }, {
            name: 'Stroke Width',
            value: {
              setValue: setStrokeWidth
            }
          }, {
            name: 'Tracking Amount',
            value: {
              setValue: setTrackingAmount
            }
          }, {
            name: 'Stroke Opacity',
            value: {
              setValue: setStrokeOpacity
            }
          }, {
            name: 'Stroke Brightness',
            value: {
              setValue: setStrokeBrightness
            }
          }, {
            name: 'Stroke Saturation',
            value: {
              setValue: setStrokeSaturation
            }
          }, {
            name: 'Stroke Hue',
            value: {
              setValue: setStrokeHue
            }
          }];
        }

        var methods = {};
        return Object.assign(instance, methods, KeyPathNode(state));
      }

      module.exports = TextAnimator;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    38: [function (require, module, exports) {
      'use strict';

      var LayerBase = require('../LayerBase');

      var Text = require('./Text');

      function TextElement(element) {
        var instance = {};
        var TextProperty = Text(element);
        var state = {
          element: element,
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'text',
            value: TextProperty
          }, {
            name: 'Text',
            value: TextProperty
          }];
        }

        function getText() {
          return element.textProperty.currentData.t;
        }

        function setText(value, index) {
          setDocumentData({
            t: value
          }, index);
        }

        function setDocumentData(data, index) {
          return element.updateDocumentData(data, index);
        }

        function canResizeFont(_canResize) {
          return element.canResizeFont(_canResize);
        }

        function setMinimumFontSize(_fontSize) {
          return element.setMinimumFontSize(_fontSize);
        }

        var methods = {
          getText: getText,
          setText: setText,
          canResizeFont: canResizeFont,
          setDocumentData: setDocumentData,
          setMinimumFontSize: setMinimumFontSize
        };
        return Object.assign(instance, LayerBase(state), methods);
      }

      module.exports = TextElement;
    }, {
      "../LayerBase": 13,
      "./Text": 36
    }],
    39: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../../key_path/KeyPathNode');

      var Property = require('../../property/Property');

      function Transform(props, parent) {
        var state = {
          properties: _buildPropertyMap()
        };

        function _buildPropertyMap() {
          return [{
            name: 'Anchor Point',
            value: Property(props.a, parent)
          }, {
            name: 'Point of Interest',
            value: Property(props.a, parent)
          }, {
            name: 'Position',
            value: Property(props.p, parent)
          }, {
            name: 'Scale',
            value: Property(props.s, parent)
          }, {
            name: 'Rotation',
            value: Property(props.r, parent)
          }, {
            name: 'X Position',
            value: Property(props.px, parent)
          }, {
            name: 'Y Position',
            value: Property(props.py, parent)
          }, {
            name: 'Z Position',
            value: Property(props.pz, parent)
          }, {
            name: 'X Rotation',
            value: Property(props.rx, parent)
          }, {
            name: 'Y Rotation',
            value: Property(props.ry, parent)
          }, {
            name: 'Z Rotation',
            value: Property(props.rz, parent)
          }, {
            name: 'Opacity',
            value: Property(props.o, parent)
          }];
        }

        function getTargetTransform() {
          return props;
        }

        var methods = {
          getTargetTransform: getTargetTransform
        };
        return Object.assign(methods, KeyPathNode(state));
      }

      module.exports = Transform;
    }, {
      "../../key_path/KeyPathNode": 12,
      "../../property/Property": 40
    }],
    40: [function (require, module, exports) {
      'use strict';

      var KeyPathNode = require('../key_path/KeyPathNode');

      var ValueProperty = require('./ValueProperty');

      function Property(property, parent) {
        var state = {
          property: property,
          parent: parent
        };

        function destroy() {
          state.property = null;
          state.parent = null;
        }

        var methods = {
          destroy: destroy
        };
        return Object.assign({}, methods, ValueProperty(state), KeyPathNode(state));
      }

      module.exports = Property;
    }, {
      "../key_path/KeyPathNode": 12,
      "./ValueProperty": 41
    }],
    41: [function (require, module, exports) {
      'use strict';

      var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

      function ValueProperty(state) {
        function setValue(value) {
          var property = state.property;

          if (!property || !property.addEffect) {
            return;
          }

          if (typeof value === 'function') {
            return property.addEffect(value);
          } else if (property.propType === 'multidimensional' && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.length === 2) {
            return property.addEffect(function () {
              return value;
            });
          } else if (property.propType === 'unidimensional' && typeof value === 'number') {
            return property.addEffect(function () {
              return value;
            });
          }
        }

        function getValue() {
          return state.property.v;
        }

        var methods = {
          setValue: setValue,
          getValue: getValue
        };
        return methods;
      }

      module.exports = ValueProperty;
    }, {}],
    42: [function (require, module, exports) {
      'use strict';

      var LayerList = require('../layer/LayerList');

      var KeyPathList = require('../key_path/KeyPathList');

      function Renderer(state) {
        state._type = 'renderer';

        function getRendererType() {
          return state.animation.animType;
        }

        return Object.assign({
          getRendererType: getRendererType
        }, LayerList(state.elements), KeyPathList(state.elements, 'renderer'));
      }

      module.exports = Renderer;
    }, {
      "../key_path/KeyPathList": 11,
      "../layer/LayerList": 14
    }]
  }, {}, [10])(10);
});

/***/ }),
/* 5 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const {
  isWebWorker
} = __webpack_require__(6);

const {
  getRemote
} = __webpack_require__(7);

class Mixin {
  constructor() {
    this.MAX_TIME = 99999;
    this.msgs = {};
    if (isWebWorker) this.initWebWorker();else this.initNode();
  }

  initWebWorker() {
    // canvas用来传入mixin中绘制
    // drawCanvas用来中转渲染过程的图像，避免异步被清掉
    this.canvas = new OffscreenCanvas(1, 1);
    this.drawCanvas = new OffscreenCanvas(1, 1);
    this.ctx = this.drawCanvas.getContext('2d');
    this.klassHolder = {};

    this.createCanvas = (w, h) => new OffscreenCanvas(w, h);
  }

  initNode() {
    const {
      nodeRequire
    } = __webpack_require__(8);

    const {
      createCanvas,
      Canvas,
      Image
    } = nodeRequire('../../inkpaint/lib/index');
    this.canvas = createCanvas(1, 1);
    this.drawCanvas = createCanvas(1, 1);
    this.ctx = this.drawCanvas.getContext('2d');
    this.klassHolder = {
      Canvas,
      Image
    };
    this.createCanvas = createCanvas;
  }

  async update(conf) {}

  async getRemoteData(url, parseJson = true) {
    try {
      const resp = await getRemote(url, 'cid');
      const text = await resp.data.text();
      return parseJson ? JSON.parse(text) : text;
    } catch (e) {
      return null;
    }
  }

  async init(conf) {
    this.conf = conf; // override!

    return {
      width: 1,
      height: 1,
      duration: 1
    };
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.drawCanvas.width = w;
    this.drawCanvas.height = h;
  }

  async render(time, delta) {// override!
  }

  async draw({
    time,
    delta
  }) {
    await this.render(time, delta);
    const {
      width,
      height
    } = this;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.canvas, 0, 0, width, height);
    if (!isWebWorker) return this.drawCanvas;
    return this.drawCanvas.transferToImageBitmap();
  }

  start() {
    addEventListener('message', async e => {
      if (typeof e.data !== 'object') return postMessage({
        err: `invalid request!`
      });
      const msgid = e.data.msgid;

      if (this.msgs[msgid]) {
        const callback = this.msgs[msgid];
        callback(e.data.resp);
        delete this.msgs[msgid];
        return;
      } else if (!e.data.method) {
        return postMessage({
          err: `invalid request!`,
          msgid
        });
      }

      const func = this[e.data.method];

      if (!func || typeof func !== 'function') {
        return postMessage({
          err: `method not found: ${e.data.method}`,
          msgid
        });
      }

      const resp = await func.call(this, e.data);
      postMessage({
        resp,
        msgid
      });
    });
  }

  async getImageData(src) {
    return await this.exec('getImage', {
      src
    });
  }

  exec(method, args, timeout = 10000) {
    return new Promise(async (resolve, reject) => {
      // set callback
      if (isWebWorker) {
        const msgid = this.genUuid();

        this.msgs[msgid] = data => {
          // console.log('on resp!!', {req: args, resp: data});
          if (typeof data === 'object' && data.err) return reject(data);
          resolve(data);
        }; // call


        postMessage({ ...args,
          method,
          msgid
        }); // timeout

        setTimeout(() => {
          delete this.msgs[msgid];
          reject();
        }, timeout);
      } else if (this.execCallback) {
        resolve(await this.execCallback(method, args));
      }
    });
  }

  genUuid() {
    return Math.random().toString(36).substr(-8) + Math.random().toString(36).substr(-8);
  }

  destroy() {
    this.ctx = null;
    this.drawCanvas = null;
    this.canvas = null;
    this.conf = null;
  }

}

module.exports = Mixin;

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};
/* global window self */


var isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
/* eslint-disable no-restricted-globals */

var isWebWorker = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) === 'object' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope';
/* eslint-enable no-restricted-globals */

var isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 */

/* eslint-disable no-undef */

var isJsDom = function isJsDom() {
  return typeof window !== 'undefined' && window.name === 'nodejs' || navigator.userAgent.includes('Node.js') || navigator.userAgent.includes('jsdom');
};

exports.isBrowser = isBrowser;
exports.isWebWorker = isWebWorker;
exports.isNode = isNode;
exports.isJsDom = isJsDom;

/***/ }),
/* 7 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const {
  isBrowser,
  isWebWorker
} = __webpack_require__(6);

const {
  nodeRequire,
  genUuid
} = __webpack_require__(8);

const fetch = nodeRequire("./node-fetch");

const md5 = __webpack_require__(28);

const __req = {};
const __xhrs = {};

if (__webpack_require__.g) {
  __webpack_require__.g.MIRAP_XHRS = __xhrs;
  __webpack_require__.g.MIRAP_RESP_CACHE = __req;
}

const XhrUtil = {
  async cancel(cid) {
    for (const [k, x] of Object.entries(__xhrs)) {
      if (cid === x._cid) x.abort();
    }

    for (const [k, x] of Object.entries(__req)) {
      const r = await x;
      if (cid === r.cid) delete __req[k];
    }
  },

  async getRemote(url, cid, progress = null) {
    const key = md5(url);
    if (__req[key]) return __req[key];
    __req[key] = new Promise(function (resolve) {
      if (isBrowser || isWebWorker) {
        const uuid = genUuid();
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
          delete __xhrs[uuid];
          const type = xhr.getResponseHeader('Content-Type');
          resolve({
            data: xhr.response,
            type,
            cid
          });
        });
        xhr.addEventListener("error", e => {
          delete __xhrs[uuid];
          resolve({
            url,
            cid
          });
        });
        xhr.addEventListener("abort", e => {
          delete __xhrs[uuid];
          resolve({
            url,
            cid
          });
        });
        xhr.addEventListener("progress", p => {
          progress && progress(p);
        }); // console.log('get remote!!', url);

        xhr.open("get", url);
        xhr.responseType = "blob";
        xhr._cid = cid;
        xhr.send();
        __xhrs[uuid] = xhr;
      } else {
        fetch(url).then(resp => {
          const type = resp.headers.get("content-type");
          resolve({
            data: resp,
            type
          });
        });
      }
    });
    return __req[key];
  }

};
module.exports = XhrUtil;

/***/ }),
/* 8 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Utils - Utility function collection
 *
 * ####Example:
 *
 *     const effect = Utils.mergeExclude(effect, conf, ["type"]);
 *     const id = Utils.genId(this.type);
 *
 * @object
 */

const {
  isBrowser
} = __webpack_require__(6);

const cache = {};
const Utils = {
  safeRequire(pkg) {
    try {
      return __webpack_require__(9)(pkg);
    } catch (e) {}
  },

  nodeRequire(pkg) {
    return isBrowser ? null : Utils.safeRequire(pkg);
  },

  isUA(key) {
    return navigator && navigator.userAgent.toLowerCase().includes(key.toLowerCase());
  },

  async getPixels(url, type) {
    const getPixels = __webpack_require__(10);

    return new Promise((resolve, reject) => {
      getPixels(url, type, (err, pixels, frameInfo) => {
        if (err) return reject(err);
        resolve({
          pixels,
          frameInfo
        });
      });
    });
  },

  /**
   * await all func done
   * @public
   */
  awaitMap(arr, func) {
    const res = [];

    for (let j = 0; j < arr.length; j++) {
      res.push(func(arr[j]));
    }

    return Promise.all(res);
  },

  dmap(src, func, keys = []) {
    const dst = Array.isArray(src) ? [] : {};
    const arr = Array.isArray(src) ? src.map((a, i) => [i, a]) : Object.entries(src);

    for (const [key, value] of arr) {
      const _keys = [...keys, key];
      if (typeof value === 'object') dst[key] = DataUtil.dmap(value, func, _keys);else dst[key] = func(value, key, _keys);
    }

    return dst;
  },

  /**
   * Generate auto-increment id based on type
   * @param {string} type - type
   * @return {string} id xxxx_10
   * @public
   */
  genId(type) {
    if (cache[type] === undefined) cache[type] = 1;
    return type + '_' + String(cache[type]++);
  },

  /**
   * Generate 24-bit random number
   * @return {string} uid adsfUsdfn2
   * @public
   */
  genUuid() {
    return Math.random().toString(36).substr(-8) + Math.random().toString(36).substr(-8);
  },

  /**
   * Delete an element of the array
   * @param {array} arr - target array
   * @param {any} elem - an element
   * @return {array} Original array
   * @public
   */
  deleteArrayElement(arr, elem) {
    const index = arr.indexOf(elem);
    if (index > -1) arr.splice(index, 1);
    return arr;
  },

  /**
   * Swap two elements of an array
   * @param {array} arr - target array
   * @param {any} elem1 - an element
   * @param {any} elem1 - other element
   * @return {array} Original array
   * @public
   */
  swapArrayElement(arr, elem1, elem2) {
    const index1 = typeof elem1 === 'number' ? elem1 : arr.indexOf(elem1);
    const index2 = typeof elem2 === 'number' ? elem2 : arr.indexOf(elem2);
    const temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
    return arr;
  },

  /**
   * Determine whether an array is a 2-latitude array
   * @param {array} arr - target array
   * @return {boolean} is a 2-latitude array
   * @public
   */
  isArray2D(arr) {
    if (!arr || !arr.length) return false;
    return Array.isArray(arr[0]);
  },

  /**
   * Remove undefined empty elements
   * @param {object} obj - target object
   * @return {object} target object
   * @public
   */
  deleteUndefined(obj) {
    for (let key in obj) {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    }

    return obj;
  },

  /**
   * Destroy the elements in object
   * @param {object} obj - target object
   * @public
   */
  destroyObj(obj) {
    if (typeof obj !== 'object') return;

    for (let key in obj) {
      delete obj[key];
    }
  },

  /**
   * Merge one object into another object (not including the key to be removed)
   * @param {object} obj1 - target object
   * @param {object} obj2 - source object
   * @return {object} result object
   * @public
   */
  mergeExclude(obj1, obj2 = {}, exclude = []) {
    for (let key in obj2) {
      if (exclude.indexOf(key) < 0 && obj2[key] !== undefined) obj1[key] = obj2[key];
    }

    return obj1;
  },

  insertSubArray(arr, index, itemArr) {
    if (!itemArr) return;
    arr.splice(index, 1);

    for (let i = 0; i < itemArr.length; i++) {
      arr.splice(index, 0, itemArr[0]);
    }
  },

  /**
   * Calculate the even number of the input value
   * @param {object} num - input value
   * @return {object} result value
   * @public
   */
  courtship(num) {
    num = num >> 0;
    return num % 2 === 0 ? num : num - 1;
  },

  floor(n, s = 2) {
    const k = Math.pow(10, s);
    return Math.floor(n * k) / k;
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Fix wrong file directory path // -> /
   * @param {string} path - file directory path
   * @public
   */
  fixFolderPath(path) {
    return path.replace(/\/\//gi, '/');
  },

  /**
   * toHash - Convert string to hash code
   * @param {string} str - Input string
   * @return {string} result hash string
   * @public
   */
  toHash(str) {
    let hash = 0,
        i,
        chr;

    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }

    return hash + '';
  },

  getErrStack(error = {}) {
    error = typeof error === 'string' ? {
      message: error
    } : error;
    error = error.message || error.stack || error;
    return error;
  },

  storage: {}
};
module.exports = Utils;

/***/ }),
/* 9 */
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 9;
module.exports = webpackEmptyContext;

/***/ }),
/* 10 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var path = __webpack_require__(11);

var ndarray = __webpack_require__(12);

var GifReader = (__webpack_require__(15).GifReader);

var Buffer = (__webpack_require__(16).Buffer);

var pack = __webpack_require__(19);

var through = __webpack_require__(25);

var parseDataURI = __webpack_require__(27);

function defaultImage(url, cb) {
  var img = new Image();
  img.crossOrigin = "Anonymous";

  img.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    var pixels = context.getImageData(0, 0, img.width, img.height);
    cb(null, ndarray(new Uint8Array(pixels.data), [img.width, img.height, 4], [4, 4 * img.width, 1], 0));
  };

  img.onerror = function (err) {
    cb(err);
  };

  img.src = url;
} //Animated gif loading


function handleGif(data, cb) {
  var reader;

  try {
    reader = new GifReader(data);
  } catch (err) {
    cb(err);
    return;
  }

  if (reader.numFrames() > 0) {
    var nshape = [reader.numFrames(), reader.height, reader.width, 4];
    var ndata = new Uint8Array(nshape[0] * nshape[1] * nshape[2] * nshape[3]);
    var result = ndarray(ndata, nshape);
    var frameInfo = [];

    try {
      for (var i = 0; i < reader.numFrames(); ++i) {
        reader.decodeAndBlitFrameRGBA(i, ndata.subarray(result.index(i, 0, 0, 0), result.index(i + 1, 0, 0, 0)));
        frameInfo.push(reader.frameInfo(i));
      }
    } catch (err) {
      cb(err);
      return;
    }

    cb(null, result.transpose(0, 2, 1), frameInfo);
  } else {
    var nshape = [reader.height, reader.width, 4];
    var ndata = new Uint8Array(nshape[0] * nshape[1] * nshape[2]);
    var result = ndarray(ndata, nshape);

    try {
      reader.decodeAndBlitFrameRGBA(0, ndata);
    } catch (err) {
      cb(err);
      return;
    }

    cb(null, result.transpose(1, 0));
  }
}

function httpGif(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';

  if (xhr.overrideMimeType) {
    xhr.overrideMimeType('application/binary');
  }

  xhr.onerror = function (err) {
    cb(err);
  };

  xhr.onload = function () {
    if (xhr.readyState !== 4) {
      return;
    }

    var data = new Uint8Array(xhr.response);
    handleGif(data, cb);
    return;
  };

  xhr.send();
}

function copyBuffer(buffer) {
  if (buffer[0] === undefined) {
    var n = buffer.length;
    var result = new Uint8Array(n);

    for (var i = 0; i < n; ++i) {
      result[i] = buffer.get(i);
    }

    return result;
  } else {
    return new Uint8Array(buffer);
  }
}

function dataGif(url, cb) {
  process.nextTick(function () {
    try {
      var buffer = parseDataURI(url);

      if (buffer) {
        handleGif(copyBuffer(buffer), cb);
      } else {
        cb(new Error('Error parsing data URI'));
      }
    } catch (err) {
      cb(err);
    }
  });
}

module.exports = function getPixels(url, type, cb) {
  if (!cb) {
    cb = type;
    type = '';
  }

  var ext = path.extname(url);

  switch (type || ext.toUpperCase()) {
    case '.GIF':
      httpGif(url, cb);
      break;

    default:
      if (Buffer.isBuffer(url)) {
        url = 'data:' + type + ';base64,' + url.toString('base64');
      }

      if (url.indexOf('data:image/gif;') === 0) {
        dataGif(url, cb);
      } else {
        defaultImage(url, cb);
      }

  }
};

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
} // Resolves . and .. elements in a path with directory names


function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;

  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length) code = path.charCodeAt(i);else if (code === 47
    /*/*/
    ) break;else code = 47
    /*/*/
    ;

    if (code === 47
    /*/*/
    ) {
      if (lastSlash === i - 1 || dots === 1) {// NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46
        /*.*/
        || res.charCodeAt(res.length - 2) !== 46
        /*.*/
        ) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');

            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }

              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }

        if (allowAboveRoot) {
          if (res.length > 0) res += '/..';else res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += '/' + path.slice(lastSlash + 1, i);else res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }

      lastSlash = i;
      dots = 0;
    } else if (code === 46
    /*.*/
    && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }

  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');

  if (!dir) {
    return base;
  }

  if (dir === pathObject.root) {
    return dir + base;
  }

  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0) path = arguments[i];else {
        if (cwd === undefined) cwd = process.cwd();
        path = cwd;
      }
      assertPath(path); // Skip empty entries

      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47
      /*/*/
      ;
    } // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path


    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0) return '/' + resolvedPath;else return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },
  normalize: function normalize(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var isAbsolute = path.charCodeAt(0) === 47
    /*/*/
    ;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47
    /*/*/
    ; // Normalize the path

    path = normalizeStringPosix(path, !isAbsolute);
    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';
    if (isAbsolute) return '/' + path;
    return path;
  },
  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47
    /*/*/
    ;
  },
  join: function join() {
    if (arguments.length === 0) return '.';
    var joined;

    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);

      if (arg.length > 0) {
        if (joined === undefined) joined = arg;else joined += '/' + arg;
      }
    }

    if (joined === undefined) return '.';
    return posix.normalize(joined);
  },
  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return '';
    from = posix.resolve(from);
    to = posix.resolve(to);
    if (from === to) return ''; // Trim any leading backslashes

    var fromStart = 1;

    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47
      /*/*/
      ) break;
    }

    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart; // Trim any leading backslashes

    var toStart = 1;

    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47
      /*/*/
      ) break;
    }

    var toEnd = to.length;
    var toLen = toEnd - toStart; // Compare paths to find the longest common path from root

    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;

    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47
          /*/*/
          ) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47
          /*/*/
          ) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }

        break;
      }

      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode) break;else if (fromCode === 47
      /*/*/
      ) lastCommonSep = i;
    }

    var out = ''; // Generate the relative path based on the path difference between `to`
    // and `from`

    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47
      /*/*/
      ) {
        if (out.length === 0) out += '..';else out += '/..';
      }
    } // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts


    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47
      /*/*/
      ) ++toStart;
      return to.slice(toStart);
    }
  },
  _makeLong: function _makeLong(path) {
    return path;
  },
  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47
    /*/*/
    ;
    var end = -1;
    var matchedSlash = true;

    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);

      if (code === 47
      /*/*/
      ) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },
  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;

      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);

        if (code === 47
        /*/*/
        ) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }

          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47
        /*/*/
        ) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },
  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true; // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find

    var preDotState = 0;

    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);

      if (code === 47
      /*/*/
      ) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }

        continue;
      }

      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }

      if (code === 46
      /*.*/
      ) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
    preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }

    return path.slice(startDot, end);
  },
  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }

    return _format('/', pathObject);
  },
  parse: function parse(path) {
    assertPath(path);
    var ret = {
      root: '',
      dir: '',
      base: '',
      ext: '',
      name: ''
    };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47
    /*/*/
    ;
    var start;

    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }

    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1; // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find

    var preDotState = 0; // Get non-dir info

    for (; i >= start; --i) {
      code = path.charCodeAt(i);

      if (code === 47
      /*/*/
      ) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }

        continue;
      }

      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }

      if (code === 46
      /*.*/
      ) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
    preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }

      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';
    return ret;
  },
  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};
posix.posix = posix;
module.exports = posix;

/***/ }),
/* 12 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var iota = __webpack_require__(13);

var isBuffer = __webpack_require__(14);

var hasTypedArrays = typeof Float64Array !== "undefined";

function compare1st(a, b) {
  return a[0] - b[0];
}

function order() {
  var stride = this.stride;
  var terms = new Array(stride.length);
  var i;

  for (i = 0; i < terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i];
  }

  terms.sort(compare1st);
  var result = new Array(terms.length);

  for (i = 0; i < result.length; ++i) {
    result[i] = terms[i][1];
  }

  return result;
}

function compileConstructor(dtype, dimension) {
  var className = ["View", dimension, "d", dtype].join("");

  if (dimension < 0) {
    className = "View_Nil" + dtype;
  }

  var useGetters = dtype === "generic";

  if (dimension === -1) {
    //Special case for trivial arrays
    var code = "function " + className + "(a){this.data=a;};\
var proto=" + className + ".prototype;\
proto.dtype='" + dtype + "';\
proto.index=function(){return -1};\
proto.size=0;\
proto.dimension=-1;\
proto.shape=proto.stride=proto.order=[];\
proto.lo=proto.hi=proto.transpose=proto.step=\
function(){return new " + className + "(this.data);};\
proto.get=proto.set=function(){};\
proto.pick=function(){return null};\
return function construct_" + className + "(a){return new " + className + "(a);}";
    var procedure = new Function(code);
    return procedure();
  } else if (dimension === 0) {
    //Special case for 0d arrays
    var code = "function " + className + "(a,d) {\
this.data = a;\
this.offset = d\
};\
var proto=" + className + ".prototype;\
proto.dtype='" + dtype + "';\
proto.index=function(){return this.offset};\
proto.dimension=0;\
proto.size=1;\
proto.shape=\
proto.stride=\
proto.order=[];\
proto.lo=\
proto.hi=\
proto.transpose=\
proto.step=function " + className + "_copy() {\
return new " + className + "(this.data,this.offset)\
};\
proto.pick=function " + className + "_pick(){\
return TrivialArray(this.data);\
};\
proto.valueOf=proto.get=function " + className + "_get(){\
return " + (useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]") + "};\
proto.set=function " + className + "_set(v){\
return " + (useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v") + "\
};\
return function construct_" + className + "(a,b,c,d){return new " + className + "(a,d)}";
    var procedure = new Function("TrivialArray", code);
    return procedure(CACHED_CONSTRUCTORS[dtype][0]);
  }

  var code = ["'use strict'"]; //Create constructor for view

  var indices = iota(dimension);
  var args = indices.map(function (i) {
    return "i" + i;
  });
  var index_str = "this.offset+" + indices.map(function (i) {
    return "this.stride[" + i + "]*i" + i;
  }).join("+");
  var shapeArg = indices.map(function (i) {
    return "b" + i;
  }).join(",");
  var strideArg = indices.map(function (i) {
    return "c" + i;
  }).join(",");
  code.push("function " + className + "(a," + shapeArg + "," + strideArg + ",d){this.data=a", "this.shape=[" + shapeArg + "]", "this.stride=[" + strideArg + "]", "this.offset=d|0}", "var proto=" + className + ".prototype", "proto.dtype='" + dtype + "'", "proto.dimension=" + dimension); //view.size:

  code.push("Object.defineProperty(proto,'size',{get:function " + className + "_size(){\
return " + indices.map(function (i) {
    return "this.shape[" + i + "]";
  }).join("*"), "}})"); //view.order:

  if (dimension === 1) {
    code.push("proto.order=[0]");
  } else {
    code.push("Object.defineProperty(proto,'order',{get:");

    if (dimension < 4) {
      code.push("function " + className + "_order(){");

      if (dimension === 2) {
        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})");
      } else if (dimension === 3) {
        code.push("var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
if(s0>s1){\
if(s1>s2){\
return [2,1,0];\
}else if(s0>s2){\
return [1,2,0];\
}else{\
return [1,0,2];\
}\
}else if(s0>s2){\
return [2,0,1];\
}else if(s2>s1){\
return [0,1,2];\
}else{\
return [0,2,1];\
}}})");
      }
    } else {
      code.push("ORDER})");
    }
  } //view.set(i0, ..., v):


  code.push("proto.set=function " + className + "_set(" + args.join(",") + ",v){");

  if (useGetters) {
    code.push("return this.data.set(" + index_str + ",v)}");
  } else {
    code.push("return this.data[" + index_str + "]=v}");
  } //view.get(i0, ...):


  code.push("proto.get=function " + className + "_get(" + args.join(",") + "){");

  if (useGetters) {
    code.push("return this.data.get(" + index_str + ")}");
  } else {
    code.push("return this.data[" + index_str + "]}");
  } //view.index:


  code.push("proto.index=function " + className + "_index(", args.join(), "){return " + index_str + "}"); //view.hi():

  code.push("proto.hi=function " + className + "_hi(" + args.join(",") + "){return new " + className + "(this.data," + indices.map(function (i) {
    return ["(typeof i", i, "!=='number'||i", i, "<0)?this.shape[", i, "]:i", i, "|0"].join("");
  }).join(",") + "," + indices.map(function (i) {
    return "this.stride[" + i + "]";
  }).join(",") + ",this.offset)}"); //view.lo():

  var a_vars = indices.map(function (i) {
    return "a" + i + "=this.shape[" + i + "]";
  });
  var c_vars = indices.map(function (i) {
    return "c" + i + "=this.stride[" + i + "]";
  });
  code.push("proto.lo=function " + className + "_lo(" + args.join(",") + "){var b=this.offset,d=0," + a_vars.join(",") + "," + c_vars.join(","));

  for (var i = 0; i < dimension; ++i) {
    code.push("if(typeof i" + i + "==='number'&&i" + i + ">=0){\
d=i" + i + "|0;\
b+=c" + i + "*d;\
a" + i + "-=d}");
  }

  code.push("return new " + className + "(this.data," + indices.map(function (i) {
    return "a" + i;
  }).join(",") + "," + indices.map(function (i) {
    return "c" + i;
  }).join(",") + ",b)}"); //view.step():

  code.push("proto.step=function " + className + "_step(" + args.join(",") + "){var " + indices.map(function (i) {
    return "a" + i + "=this.shape[" + i + "]";
  }).join(",") + "," + indices.map(function (i) {
    return "b" + i + "=this.stride[" + i + "]";
  }).join(",") + ",c=this.offset,d=0,ceil=Math.ceil");

  for (var i = 0; i < dimension; ++i) {
    code.push("if(typeof i" + i + "==='number'){\
d=i" + i + "|0;\
if(d<0){\
c+=b" + i + "*(a" + i + "-1);\
a" + i + "=ceil(-a" + i + "/d)\
}else{\
a" + i + "=ceil(a" + i + "/d)\
}\
b" + i + "*=d\
}");
  }

  code.push("return new " + className + "(this.data," + indices.map(function (i) {
    return "a" + i;
  }).join(",") + "," + indices.map(function (i) {
    return "b" + i;
  }).join(",") + ",c)}"); //view.transpose():

  var tShape = new Array(dimension);
  var tStride = new Array(dimension);

  for (var i = 0; i < dimension; ++i) {
    tShape[i] = "a[i" + i + "]";
    tStride[i] = "b[i" + i + "]";
  }

  code.push("proto.transpose=function " + className + "_transpose(" + args + "){" + args.map(function (n, idx) {
    return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)";
  }).join(";"), "var a=this.shape,b=this.stride;return new " + className + "(this.data," + tShape.join(",") + "," + tStride.join(",") + ",this.offset)}"); //view.pick():

  code.push("proto.pick=function " + className + "_pick(" + args + "){var a=[],b=[],c=this.offset");

  for (var i = 0; i < dimension; ++i) {
    code.push("if(typeof i" + i + "==='number'&&i" + i + ">=0){c=(c+this.stride[" + i + "]*i" + i + ")|0}else{a.push(this.shape[" + i + "]);b.push(this.stride[" + i + "])}");
  }

  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}"); //Add return statement

  code.push("return function construct_" + className + "(data,shape,stride,offset){return new " + className + "(data," + indices.map(function (i) {
    return "shape[" + i + "]";
  }).join(",") + "," + indices.map(function (i) {
    return "stride[" + i + "]";
  }).join(",") + ",offset)}"); //Compile procedure

  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"));
  return procedure(CACHED_CONSTRUCTORS[dtype], order);
}

function arrayDType(data) {
  if (isBuffer(data)) {
    return "buffer";
  }

  if (hasTypedArrays) {
    switch (Object.prototype.toString.call(data)) {
      case "[object Float64Array]":
        return "float64";

      case "[object Float32Array]":
        return "float32";

      case "[object Int8Array]":
        return "int8";

      case "[object Int16Array]":
        return "int16";

      case "[object Int32Array]":
        return "int32";

      case "[object Uint8Array]":
        return "uint8";

      case "[object Uint16Array]":
        return "uint16";

      case "[object Uint32Array]":
        return "uint32";

      case "[object Uint8ClampedArray]":
        return "uint8_clamped";

      case "[object BigInt64Array]":
        return "bigint64";

      case "[object BigUint64Array]":
        return "biguint64";
    }
  }

  if (Array.isArray(data)) {
    return "array";
  }

  return "generic";
}

var CACHED_CONSTRUCTORS = {
  "float32": [],
  "float64": [],
  "int8": [],
  "int16": [],
  "int32": [],
  "uint8": [],
  "uint16": [],
  "uint32": [],
  "array": [],
  "uint8_clamped": [],
  "bigint64": [],
  "biguint64": [],
  "buffer": [],
  "generic": []
};

(function () {
  for (var id in CACHED_CONSTRUCTORS) {
    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1));
  }
});

function wrappedNDArrayCtor(data, shape, stride, offset) {
  if (data === undefined) {
    var ctor = CACHED_CONSTRUCTORS.array[0];
    return ctor([]);
  } else if (typeof data === "number") {
    data = [data];
  }

  if (shape === undefined) {
    shape = [data.length];
  }

  var d = shape.length;

  if (stride === undefined) {
    stride = new Array(d);

    for (var i = d - 1, sz = 1; i >= 0; --i) {
      stride[i] = sz;
      sz *= shape[i];
    }
  }

  if (offset === undefined) {
    offset = 0;

    for (var i = 0; i < d; ++i) {
      if (stride[i] < 0) {
        offset -= (shape[i] - 1) * stride[i];
      }
    }
  }

  var dtype = arrayDType(data);
  var ctor_list = CACHED_CONSTRUCTORS[dtype];

  while (ctor_list.length <= d + 1) {
    ctor_list.push(compileConstructor(dtype, ctor_list.length - 1));
  }

  var ctor = ctor_list[d + 1];
  return ctor(data, shape, stride, offset);
}

module.exports = wrappedNDArrayCtor;

/***/ }),
/* 13 */
/***/ ((module) => {

"use strict";


function iota(n) {
  var result = new Array(n);

  for (var i = 0; i < n; ++i) {
    result[i] = i;
  }

  return result;
}

module.exports = iota;

/***/ }),
/* 14 */
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
};

function isBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
} // For Node v0.10 support. Remove this eventually.


function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0));
}

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";
// (c) Dean McNamee <dean@gmail.com>, 2013.
//
// https://github.com/deanm/omggif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// omggif is a JavaScript implementation of a GIF 89a encoder and decoder,
// including animation and compression.  It does not rely on any specific
// underlying system, so should run in the browser, Node, or Plask.


function GifWriter(buf, width, height, gopts) {
  var p = 0;
  var gopts = gopts === undefined ? {} : gopts;
  var loop_count = gopts.loop === undefined ? null : gopts.loop;
  var global_palette = gopts.palette === undefined ? null : gopts.palette;
  if (width <= 0 || height <= 0 || width > 65535 || height > 65535) throw new Error("Width/Height invalid.");

  function check_palette_and_num_colors(palette) {
    var num_colors = palette.length;

    if (num_colors < 2 || num_colors > 256 || num_colors & num_colors - 1) {
      throw new Error("Invalid code/color length, must be power of 2 and 2 .. 256.");
    }

    return num_colors;
  } // - Header.


  buf[p++] = 0x47;
  buf[p++] = 0x49;
  buf[p++] = 0x46; // GIF

  buf[p++] = 0x38;
  buf[p++] = 0x39;
  buf[p++] = 0x61; // 89a
  // Handling of Global Color Table (palette) and background index.

  var gp_num_colors_pow2 = 0;
  var background = 0;

  if (global_palette !== null) {
    var gp_num_colors = check_palette_and_num_colors(global_palette);

    while (gp_num_colors >>= 1) ++gp_num_colors_pow2;

    gp_num_colors = 1 << gp_num_colors_pow2;
    --gp_num_colors_pow2;

    if (gopts.background !== undefined) {
      background = gopts.background;
      if (background >= gp_num_colors) throw new Error("Background index out of range."); // The GIF spec states that a background index of 0 should be ignored, so
      // this is probably a mistake and you really want to set it to another
      // slot in the palette.  But actually in the end most browsers, etc end
      // up ignoring this almost completely (including for dispose background).

      if (background === 0) throw new Error("Background index explicitly passed as 0.");
    }
  } // - Logical Screen Descriptor.
  // NOTE(deanm): w/h apparently ignored by implementations, but set anyway.


  buf[p++] = width & 0xff;
  buf[p++] = width >> 8 & 0xff;
  buf[p++] = height & 0xff;
  buf[p++] = height >> 8 & 0xff; // NOTE: Indicates 0-bpp original color resolution (unused?).

  buf[p++] = (global_palette !== null ? 0x80 : 0) | // Global Color Table Flag.
  gp_num_colors_pow2; // NOTE: No sort flag (unused?).

  buf[p++] = background; // Background Color Index.

  buf[p++] = 0; // Pixel aspect ratio (unused?).
  // - Global Color Table

  if (global_palette !== null) {
    for (var i = 0, il = global_palette.length; i < il; ++i) {
      var rgb = global_palette[i];
      buf[p++] = rgb >> 16 & 0xff;
      buf[p++] = rgb >> 8 & 0xff;
      buf[p++] = rgb & 0xff;
    }
  }

  if (loop_count !== null) {
    // Netscape block for looping.
    if (loop_count < 0 || loop_count > 65535) throw new Error("Loop count invalid."); // Extension code, label, and length.

    buf[p++] = 0x21;
    buf[p++] = 0xff;
    buf[p++] = 0x0b; // NETSCAPE2.0

    buf[p++] = 0x4e;
    buf[p++] = 0x45;
    buf[p++] = 0x54;
    buf[p++] = 0x53;
    buf[p++] = 0x43;
    buf[p++] = 0x41;
    buf[p++] = 0x50;
    buf[p++] = 0x45;
    buf[p++] = 0x32;
    buf[p++] = 0x2e;
    buf[p++] = 0x30; // Sub-block

    buf[p++] = 0x03;
    buf[p++] = 0x01;
    buf[p++] = loop_count & 0xff;
    buf[p++] = loop_count >> 8 & 0xff;
    buf[p++] = 0x00; // Terminator.
  }

  var ended = false;

  this.addFrame = function (x, y, w, h, indexed_pixels, opts) {
    if (ended === true) {
      --p;
      ended = false;
    } // Un-end.


    opts = opts === undefined ? {} : opts; // TODO(deanm): Bounds check x, y.  Do they need to be within the virtual
    // canvas width/height, I imagine?

    if (x < 0 || y < 0 || x > 65535 || y > 65535) throw new Error("x/y invalid.");
    if (w <= 0 || h <= 0 || w > 65535 || h > 65535) throw new Error("Width/Height invalid.");
    if (indexed_pixels.length < w * h) throw new Error("Not enough pixels for the frame size.");
    var using_local_palette = true;
    var palette = opts.palette;

    if (palette === undefined || palette === null) {
      using_local_palette = false;
      palette = global_palette;
    }

    if (palette === undefined || palette === null) throw new Error("Must supply either a local or global palette.");
    var num_colors = check_palette_and_num_colors(palette); // Compute the min_code_size (power of 2), destroying num_colors.

    var min_code_size = 0;

    while (num_colors >>= 1) ++min_code_size;

    num_colors = 1 << min_code_size; // Now we can easily get it back.

    var delay = opts.delay === undefined ? 0 : opts.delay; // From the spec:
    //     0 -   No disposal specified. The decoder is
    //           not required to take any action.
    //     1 -   Do not dispose. The graphic is to be left
    //           in place.
    //     2 -   Restore to background color. The area used by the
    //           graphic must be restored to the background color.
    //     3 -   Restore to previous. The decoder is required to
    //           restore the area overwritten by the graphic with
    //           what was there prior to rendering the graphic.
    //  4-7 -    To be defined.
    // NOTE(deanm): Dispose background doesn't really work, apparently most
    // browsers ignore the background palette index and clear to transparency.

    var disposal = opts.disposal === undefined ? 0 : opts.disposal;
    if (disposal < 0 || disposal > 3) // 4-7 is reserved.
      throw new Error("Disposal out of range.");
    var use_transparency = false;
    var transparent_index = 0;

    if (opts.transparent !== undefined && opts.transparent !== null) {
      use_transparency = true;
      transparent_index = opts.transparent;
      if (transparent_index < 0 || transparent_index >= num_colors) throw new Error("Transparent color index.");
    }

    if (disposal !== 0 || use_transparency || delay !== 0) {
      // - Graphics Control Extension
      buf[p++] = 0x21;
      buf[p++] = 0xf9; // Extension / Label.

      buf[p++] = 4; // Byte size.

      buf[p++] = disposal << 2 | (use_transparency === true ? 1 : 0);
      buf[p++] = delay & 0xff;
      buf[p++] = delay >> 8 & 0xff;
      buf[p++] = transparent_index; // Transparent color index.

      buf[p++] = 0; // Block Terminator.
    } // - Image Descriptor


    buf[p++] = 0x2c; // Image Seperator.

    buf[p++] = x & 0xff;
    buf[p++] = x >> 8 & 0xff; // Left.

    buf[p++] = y & 0xff;
    buf[p++] = y >> 8 & 0xff; // Top.

    buf[p++] = w & 0xff;
    buf[p++] = w >> 8 & 0xff;
    buf[p++] = h & 0xff;
    buf[p++] = h >> 8 & 0xff; // NOTE: No sort flag (unused?).
    // TODO(deanm): Support interlace.

    buf[p++] = using_local_palette === true ? 0x80 | min_code_size - 1 : 0; // - Local Color Table

    if (using_local_palette === true) {
      for (var i = 0, il = palette.length; i < il; ++i) {
        var rgb = palette[i];
        buf[p++] = rgb >> 16 & 0xff;
        buf[p++] = rgb >> 8 & 0xff;
        buf[p++] = rgb & 0xff;
      }
    }

    p = GifWriterOutputLZWCodeStream(buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);
    return p;
  };

  this.end = function () {
    if (ended === false) {
      buf[p++] = 0x3b; // Trailer.

      ended = true;
    }

    return p;
  };

  this.getOutputBuffer = function () {
    return buf;
  };

  this.setOutputBuffer = function (v) {
    buf = v;
  };

  this.getOutputBufferPosition = function () {
    return p;
  };

  this.setOutputBufferPosition = function (v) {
    p = v;
  };
} // Main compression routine, palette indexes -> LZW code stream.
// |index_stream| must have at least one entry.


function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
  buf[p++] = min_code_size;
  var cur_subblock = p++; // Pointing at the length field.

  var clear_code = 1 << min_code_size;
  var code_mask = clear_code - 1;
  var eoi_code = clear_code + 1;
  var next_code = eoi_code + 1;
  var cur_code_size = min_code_size + 1; // Number of bits per code.

  var cur_shift = 0; // We have at most 12-bit codes, so we should have to hold a max of 19
  // bits here (and then we would write out).

  var cur = 0;

  function emit_bytes_to_buffer(bit_block_size) {
    while (cur_shift >= bit_block_size) {
      buf[p++] = cur & 0xff;
      cur >>= 8;
      cur_shift -= 8;

      if (p === cur_subblock + 256) {
        // Finished a subblock.
        buf[cur_subblock] = 255;
        cur_subblock = p++;
      }
    }
  }

  function emit_code(c) {
    cur |= c << cur_shift;
    cur_shift += cur_code_size;
    emit_bytes_to_buffer(8);
  } // I am not an expert on the topic, and I don't want to write a thesis.
  // However, it is good to outline here the basic algorithm and the few data
  // structures and optimizations here that make this implementation fast.
  // The basic idea behind LZW is to build a table of previously seen runs
  // addressed by a short id (herein called output code).  All data is
  // referenced by a code, which represents one or more values from the
  // original input stream.  All input bytes can be referenced as the same
  // value as an output code.  So if you didn't want any compression, you
  // could more or less just output the original bytes as codes (there are
  // some details to this, but it is the idea).  In order to achieve
  // compression, values greater then the input range (codes can be up to
  // 12-bit while input only 8-bit) represent a sequence of previously seen
  // inputs.  The decompressor is able to build the same mapping while
  // decoding, so there is always a shared common knowledge between the
  // encoding and decoder, which is also important for "timing" aspects like
  // how to handle variable bit width code encoding.
  //
  // One obvious but very important consequence of the table system is there
  // is always a unique id (at most 12-bits) to map the runs.  'A' might be
  // 4, then 'AA' might be 10, 'AAA' 11, 'AAAA' 12, etc.  This relationship
  // can be used for an effecient lookup strategy for the code mapping.  We
  // need to know if a run has been seen before, and be able to map that run
  // to the output code.  Since we start with known unique ids (input bytes),
  // and then from those build more unique ids (table entries), we can
  // continue this chain (almost like a linked list) to always have small
  // integer values that represent the current byte chains in the encoder.
  // This means instead of tracking the input bytes (AAAABCD) to know our
  // current state, we can track the table entry for AAAABC (it is guaranteed
  // to exist by the nature of the algorithm) and the next character D.
  // Therefor the tuple of (table_entry, byte) is guaranteed to also be
  // unique.  This allows us to create a simple lookup key for mapping input
  // sequences to codes (table indices) without having to store or search
  // any of the code sequences.  So if 'AAAA' has a table entry of 12, the
  // tuple of ('AAAA', K) for any input byte K will be unique, and can be our
  // key.  This leads to a integer value at most 20-bits, which can always
  // fit in an SMI value and be used as a fast sparse array / object key.
  // Output code for the current contents of the index buffer.


  var ib_code = index_stream[0] & code_mask; // Load first input index.

  var code_table = {}; // Key'd on our 20-bit "tuple".

  emit_code(clear_code); // Spec says first code should be a clear code.
  // First index already loaded, process the rest of the stream.

  for (var i = 1, il = index_stream.length; i < il; ++i) {
    var k = index_stream[i] & code_mask;
    var cur_key = ib_code << 8 | k; // (prev, k) unique tuple.

    var cur_code = code_table[cur_key]; // buffer + k.
    // Check if we have to create a new code table entry.

    if (cur_code === undefined) {
      // We don't have buffer + k.
      // Emit index buffer (without k).
      // This is an inline version of emit_code, because this is the core
      // writing routine of the compressor (and V8 cannot inline emit_code
      // because it is a closure here in a different context).  Additionally
      // we can call emit_byte_to_buffer less often, because we can have
      // 30-bits (from our 31-bit signed SMI), and we know our codes will only
      // be 12-bits, so can safely have 18-bits there without overflow.
      // emit_code(ib_code);
      cur |= ib_code << cur_shift;
      cur_shift += cur_code_size;

      while (cur_shift >= 8) {
        buf[p++] = cur & 0xff;
        cur >>= 8;
        cur_shift -= 8;

        if (p === cur_subblock + 256) {
          // Finished a subblock.
          buf[cur_subblock] = 255;
          cur_subblock = p++;
        }
      }

      if (next_code === 4096) {
        // Table full, need a clear.
        emit_code(clear_code);
        next_code = eoi_code + 1;
        cur_code_size = min_code_size + 1;
        code_table = {};
      } else {
        // Table not full, insert a new entry.
        // Increase our variable bit code sizes if necessary.  This is a bit
        // tricky as it is based on "timing" between the encoding and
        // decoder.  From the encoders perspective this should happen after
        // we've already emitted the index buffer and are about to create the
        // first table entry that would overflow our current code bit size.
        if (next_code >= 1 << cur_code_size) ++cur_code_size;
        code_table[cur_key] = next_code++; // Insert into code table.
      }

      ib_code = k; // Index buffer to single input k.
    } else {
      ib_code = cur_code; // Index buffer to sequence in code table.
    }
  }

  emit_code(ib_code); // There will still be something in the index buffer.

  emit_code(eoi_code); // End Of Information.
  // Flush / finalize the sub-blocks stream to the buffer.

  emit_bytes_to_buffer(1); // Finish the sub-blocks, writing out any unfinished lengths and
  // terminating with a sub-block of length 0.  If we have already started
  // but not yet used a sub-block it can just become the terminator.

  if (cur_subblock + 1 === p) {
    // Started but unused.
    buf[cur_subblock] = 0;
  } else {
    // Started and used, write length and additional terminator block.
    buf[cur_subblock] = p - cur_subblock - 1;
    buf[p++] = 0;
  }

  return p;
}

function GifReader(buf) {
  var p = 0; // - Header (GIF87a or GIF89a).

  if (buf[p++] !== 0x47 || buf[p++] !== 0x49 || buf[p++] !== 0x46 || buf[p++] !== 0x38 || (buf[p++] + 1 & 0xfd) !== 0x38 || buf[p++] !== 0x61) {
    throw new Error("Invalid GIF 87a/89a header.");
  } // - Logical Screen Descriptor.


  var width = buf[p++] | buf[p++] << 8;
  var height = buf[p++] | buf[p++] << 8;
  var pf0 = buf[p++]; // <Packed Fields>.

  var global_palette_flag = pf0 >> 7;
  var num_global_colors_pow2 = pf0 & 0x7;
  var num_global_colors = 1 << num_global_colors_pow2 + 1;
  var background = buf[p++];
  buf[p++]; // Pixel aspect ratio (unused?).

  var global_palette_offset = null;
  var global_palette_size = null;

  if (global_palette_flag) {
    global_palette_offset = p;
    global_palette_size = num_global_colors;
    p += num_global_colors * 3; // Seek past palette.
  }

  var no_eof = true;
  var frames = [];
  var delay = 0;
  var transparent_index = null;
  var disposal = 0; // 0 - No disposal specified.

  var loop_count = null;
  this.width = width;
  this.height = height;

  while (no_eof && p < buf.length) {
    switch (buf[p++]) {
      case 0x21:
        // Graphics Control Extension Block
        switch (buf[p++]) {
          case 0xff:
            // Application specific block
            // Try if it's a Netscape block (with animation loop counter).
            if (buf[p] !== 0x0b || // 21 FF already read, check block size.
            // NETSCAPE2.0
            buf[p + 1] == 0x4e && buf[p + 2] == 0x45 && buf[p + 3] == 0x54 && buf[p + 4] == 0x53 && buf[p + 5] == 0x43 && buf[p + 6] == 0x41 && buf[p + 7] == 0x50 && buf[p + 8] == 0x45 && buf[p + 9] == 0x32 && buf[p + 10] == 0x2e && buf[p + 11] == 0x30 && // Sub-block
            buf[p + 12] == 0x03 && buf[p + 13] == 0x01 && buf[p + 16] == 0) {
              p += 14;
              loop_count = buf[p++] | buf[p++] << 8;
              p++; // Skip terminator.
            } else {
              // We don't know what it is, just try to get past it.
              p += 12;

              while (true) {
                // Seek through subblocks.
                var block_size = buf[p++]; // Bad block size (ex: undefined from an out of bounds read).

                if (!(block_size >= 0)) throw Error("Invalid block size");
                if (block_size === 0) break; // 0 size is terminator

                p += block_size;
              }
            }

            break;

          case 0xf9:
            // Graphics Control Extension
            if (buf[p++] !== 0x4 || buf[p + 4] !== 0) throw new Error("Invalid graphics extension block.");
            var pf1 = buf[p++];
            delay = buf[p++] | buf[p++] << 8;
            transparent_index = buf[p++];
            if ((pf1 & 1) === 0) transparent_index = null;
            disposal = pf1 >> 2 & 0x7;
            p++; // Skip terminator.

            break;

          case 0xfe:
            // Comment Extension.
            while (true) {
              // Seek through subblocks.
              var block_size = buf[p++]; // Bad block size (ex: undefined from an out of bounds read).

              if (!(block_size >= 0)) throw Error("Invalid block size");
              if (block_size === 0) break; // 0 size is terminator
              // console.log(buf.slice(p, p+block_size).toString('ascii'));

              p += block_size;
            }

            break;

          default:
            throw new Error("Unknown graphic control label: 0x" + buf[p - 1].toString(16));
        }

        break;

      case 0x2c:
        // Image Descriptor.
        var x = buf[p++] | buf[p++] << 8;
        var y = buf[p++] | buf[p++] << 8;
        var w = buf[p++] | buf[p++] << 8;
        var h = buf[p++] | buf[p++] << 8;
        var pf2 = buf[p++];
        var local_palette_flag = pf2 >> 7;
        var interlace_flag = pf2 >> 6 & 1;
        var num_local_colors_pow2 = pf2 & 0x7;
        var num_local_colors = 1 << num_local_colors_pow2 + 1;
        var palette_offset = global_palette_offset;
        var palette_size = global_palette_size;
        var has_local_palette = false;

        if (local_palette_flag) {
          var has_local_palette = true;
          palette_offset = p; // Override with local palette.

          palette_size = num_local_colors;
          p += num_local_colors * 3; // Seek past palette.
        }

        var data_offset = p;
        p++; // codesize

        while (true) {
          var block_size = buf[p++]; // Bad block size (ex: undefined from an out of bounds read).

          if (!(block_size >= 0)) throw Error("Invalid block size");
          if (block_size === 0) break; // 0 size is terminator

          p += block_size;
        }

        frames.push({
          x: x,
          y: y,
          width: w,
          height: h,
          has_local_palette: has_local_palette,
          palette_offset: palette_offset,
          palette_size: palette_size,
          data_offset: data_offset,
          data_length: p - data_offset,
          transparent_index: transparent_index,
          interlaced: !!interlace_flag,
          delay: delay,
          disposal: disposal
        });
        break;

      case 0x3b:
        // Trailer Marker (end of file).
        no_eof = false;
        break;

      default:
        throw new Error("Unknown gif block: 0x" + buf[p - 1].toString(16));
        break;
    }
  }

  this.numFrames = function () {
    return frames.length;
  };

  this.loopCount = function () {
    return loop_count;
  };

  this.frameInfo = function (frame_num) {
    if (frame_num < 0 || frame_num >= frames.length) throw new Error("Frame index out of range.");
    return frames[frame_num];
  };

  this.decodeAndBlitFrameBGRA = function (frame_num, pixels) {
    var frame = this.frameInfo(frame_num);
    var num_pixels = frame.width * frame.height;
    var index_stream = new Uint8Array(num_pixels); // At most 8-bit indices.

    GifReaderLZWOutputIndexStream(buf, frame.data_offset, index_stream, num_pixels);
    var palette_offset = frame.palette_offset; // NOTE(deanm): It seems to be much faster to compare index to 256 than
    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
    // the profile, not sure if it's related to using a Uint8Array.

    var trans = frame.transparent_index;
    if (trans === null) trans = 256; // We are possibly just blitting to a portion of the entire frame.
    // That is a subrect within the framerect, so the additional pixels
    // must be skipped over after we finished a scanline.

    var framewidth = frame.width;
    var framestride = width - framewidth;
    var xleft = framewidth; // Number of subrect pixels left in scanline.
    // Output indicies of the top left and bottom right corners of the subrect.

    var opbeg = (frame.y * width + frame.x) * 4;
    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
    var op = opbeg;
    var scanstride = framestride * 4; // Use scanstride to skip past the rows when interlacing.  This is skipping
    // 7 rows for the first two passes, then 3 then 1.

    if (frame.interlaced === true) {
      scanstride += width * 4 * 7; // Pass 1.
    }

    var interlaceskip = 8; // Tracking the row interval in the current pass.

    for (var i = 0, il = index_stream.length; i < il; ++i) {
      var index = index_stream[i];

      if (xleft === 0) {
        // Beginning of new scan line
        op += scanstride;
        xleft = framewidth;

        if (op >= opend) {
          // Catch the wrap to switch passes when interlacing.
          scanstride = framestride * 4 + width * 4 * (interlaceskip - 1); // interlaceskip / 2 * 4 is interlaceskip << 1.

          op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
          interlaceskip >>= 1;
        }
      }

      if (index === trans) {
        op += 4;
      } else {
        var r = buf[palette_offset + index * 3];
        var g = buf[palette_offset + index * 3 + 1];
        var b = buf[palette_offset + index * 3 + 2];
        pixels[op++] = b;
        pixels[op++] = g;
        pixels[op++] = r;
        pixels[op++] = 255;
      }

      --xleft;
    }
  }; // I will go to copy and paste hell one day...


  this.decodeAndBlitFrameRGBA = function (frame_num, pixels) {
    var frame = this.frameInfo(frame_num);
    var num_pixels = frame.width * frame.height;
    var index_stream = new Uint8Array(num_pixels); // At most 8-bit indices.

    GifReaderLZWOutputIndexStream(buf, frame.data_offset, index_stream, num_pixels);
    var palette_offset = frame.palette_offset; // NOTE(deanm): It seems to be much faster to compare index to 256 than
    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
    // the profile, not sure if it's related to using a Uint8Array.

    var trans = frame.transparent_index;
    if (trans === null) trans = 256; // We are possibly just blitting to a portion of the entire frame.
    // That is a subrect within the framerect, so the additional pixels
    // must be skipped over after we finished a scanline.

    var framewidth = frame.width;
    var framestride = width - framewidth;
    var xleft = framewidth; // Number of subrect pixels left in scanline.
    // Output indicies of the top left and bottom right corners of the subrect.

    var opbeg = (frame.y * width + frame.x) * 4;
    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
    var op = opbeg;
    var scanstride = framestride * 4; // Use scanstride to skip past the rows when interlacing.  This is skipping
    // 7 rows for the first two passes, then 3 then 1.

    if (frame.interlaced === true) {
      scanstride += width * 4 * 7; // Pass 1.
    }

    var interlaceskip = 8; // Tracking the row interval in the current pass.

    for (var i = 0, il = index_stream.length; i < il; ++i) {
      var index = index_stream[i];

      if (xleft === 0) {
        // Beginning of new scan line
        op += scanstride;
        xleft = framewidth;

        if (op >= opend) {
          // Catch the wrap to switch passes when interlacing.
          scanstride = framestride * 4 + width * 4 * (interlaceskip - 1); // interlaceskip / 2 * 4 is interlaceskip << 1.

          op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
          interlaceskip >>= 1;
        }
      }

      if (index === trans) {
        op += 4;
      } else {
        var r = buf[palette_offset + index * 3];
        var g = buf[palette_offset + index * 3 + 1];
        var b = buf[palette_offset + index * 3 + 2];
        pixels[op++] = r;
        pixels[op++] = g;
        pixels[op++] = b;
        pixels[op++] = 255;
      }

      --xleft;
    }
  };
}

function GifReaderLZWOutputIndexStream(code_stream, p, output, output_length) {
  var min_code_size = code_stream[p++];
  var clear_code = 1 << min_code_size;
  var eoi_code = clear_code + 1;
  var next_code = eoi_code + 1;
  var cur_code_size = min_code_size + 1; // Number of bits per code.
  // NOTE: This shares the same name as the encoder, but has a different
  // meaning here.  Here this masks each code coming from the code stream.

  var code_mask = (1 << cur_code_size) - 1;
  var cur_shift = 0;
  var cur = 0;
  var op = 0; // Output pointer.

  var subblock_size = code_stream[p++]; // TODO(deanm): Would using a TypedArray be any faster?  At least it would
  // solve the fast mode / backing store uncertainty.
  // var code_table = Array(4096);

  var code_table = new Int32Array(4096); // Can be signed, we only use 20 bits.

  var prev_code = null; // Track code-1.

  while (true) {
    // Read up to two bytes, making sure we always 12-bits for max sized code.
    while (cur_shift < 16) {
      if (subblock_size === 0) break; // No more data to be read.

      cur |= code_stream[p++] << cur_shift;
      cur_shift += 8;

      if (subblock_size === 1) {
        // Never let it get to 0 to hold logic above.
        subblock_size = code_stream[p++]; // Next subblock.
      } else {
        --subblock_size;
      }
    } // TODO(deanm): We should never really get here, we should have received
    // and EOI.


    if (cur_shift < cur_code_size) break;
    var code = cur & code_mask;
    cur >>= cur_code_size;
    cur_shift -= cur_code_size; // TODO(deanm): Maybe should check that the first code was a clear code,
    // at least this is what you're supposed to do.  But actually our encoder
    // now doesn't emit a clear code first anyway.

    if (code === clear_code) {
      // We don't actually have to clear the table.  This could be a good idea
      // for greater error checking, but we don't really do any anyway.  We
      // will just track it with next_code and overwrite old entries.
      next_code = eoi_code + 1;
      cur_code_size = min_code_size + 1;
      code_mask = (1 << cur_code_size) - 1; // Don't update prev_code ?

      prev_code = null;
      continue;
    } else if (code === eoi_code) {
      break;
    } // We have a similar situation as the decoder, where we want to store
    // variable length entries (code table entries), but we want to do in a
    // faster manner than an array of arrays.  The code below stores sort of a
    // linked list within the code table, and then "chases" through it to
    // construct the dictionary entries.  When a new entry is created, just the
    // last byte is stored, and the rest (prefix) of the entry is only
    // referenced by its table entry.  Then the code chases through the
    // prefixes until it reaches a single byte code.  We have to chase twice,
    // first to compute the length, and then to actually copy the data to the
    // output (backwards, since we know the length).  The alternative would be
    // storing something in an intermediate stack, but that doesn't make any
    // more sense.  I implemented an approach where it also stored the length
    // in the code table, although it's a bit tricky because you run out of
    // bits (12 + 12 + 8), but I didn't measure much improvements (the table
    // entries are generally not the long).  Even when I created benchmarks for
    // very long table entries the complexity did not seem worth it.
    // The code table stores the prefix entry in 12 bits and then the suffix
    // byte in 8 bits, so each entry is 20 bits.


    var chase_code = code < next_code ? code : prev_code; // Chase what we will output, either {CODE} or {CODE-1}.

    var chase_length = 0;
    var chase = chase_code;

    while (chase > clear_code) {
      chase = code_table[chase] >> 8;
      ++chase_length;
    }

    var k = chase;
    var op_end = op + chase_length + (chase_code !== code ? 1 : 0);

    if (op_end > output_length) {
      console.log("Warning, gif stream longer than expected.");
      return;
    } // Already have the first byte from the chase, might as well write it fast.


    output[op++] = k;
    op += chase_length;
    var b = op; // Track pointer, writing backwards.

    if (chase_code !== code) // The case of emitting {CODE-1} + k.
      output[op++] = k;
    chase = chase_code;

    while (chase_length--) {
      chase = code_table[chase];
      output[--b] = chase & 0xff; // Write backwards.

      chase >>= 8; // Pull down to the prefix code.
    }

    if (prev_code !== null && next_code < 4096) {
      code_table[next_code++] = prev_code << 8 | k; // TODO(deanm): Figure out this clearing vs code growth logic better.  I
      // have an feeling that it should just happen somewhere else, for now it
      // is awkward between when we grow past the max and then hit a clear code.
      // For now just check if we hit the max 12-bits (then a clear code should
      // follow, also of course encoded in 12-bits).

      if (next_code >= code_mask + 1 && cur_code_size < 12) {
        ++cur_code_size;
        code_mask = code_mask << 1 | 1;
      }
    }

    prev_code = code;
  }

  if (op !== output_length) {
    console.log("Warning, gif stream shorter than expected.");
  }

  return output;
} // CommonJS.


try {
  exports.GifWriter = GifWriter;
  exports.GifReader = GifReader;
} catch (e) {}

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

/* eslint-disable no-proto */


const base64 = __webpack_require__(17);

const ieee754 = __webpack_require__(18);

const customInspectSymbol = typeof Symbol === 'function' && typeof Symbol['for'] === 'function' // eslint-disable-line dot-notation
? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
: null;
exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;
const K_MAX_LENGTH = 0x7fffffff;
exports.kMaxLength = K_MAX_LENGTH;
/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */

Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
  console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
}

function typedArraySupport() {
  // Can typed array instances can be augmented?
  try {
    const arr = new Uint8Array(1);
    const proto = {
      foo: function () {
        return 42;
      }
    };
    Object.setPrototypeOf(proto, Uint8Array.prototype);
    Object.setPrototypeOf(arr, proto);
    return arr.foo() === 42;
  } catch (e) {
    return false;
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined;
    return this.buffer;
  }
});
Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined;
    return this.byteOffset;
  }
});

function createBuffer(length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"');
  } // Return an augmented `Uint8Array` instance


  const buf = new Uint8Array(length);
  Object.setPrototypeOf(buf, Buffer.prototype);
  return buf;
}
/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */


function Buffer(arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError('The "string" argument must be of type string. Received type number');
    }

    return allocUnsafe(arg);
  }

  return from(arg, encodingOrOffset, length);
}

Buffer.poolSize = 8192; // not used by this implementation

function from(value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset);
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value);
  }

  if (value == null) {
    throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
  }

  if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
    return fromArrayBuffer(value, encodingOrOffset, length);
  }

  if (typeof SharedArrayBuffer !== 'undefined' && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length);
  }

  if (typeof value === 'number') {
    throw new TypeError('The "value" argument must not be of type number. Received type number');
  }

  const valueOf = value.valueOf && value.valueOf();

  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length);
  }

  const b = fromObject(value);
  if (b) return b;

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
  }

  throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' + 'or Array-like Object. Received type ' + typeof value);
}
/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/


Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length);
}; // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148


Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
Object.setPrototypeOf(Buffer, Uint8Array);

function assertSize(size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number');
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"');
  }
}

function alloc(size, fill, encoding) {
  assertSize(size);

  if (size <= 0) {
    return createBuffer(size);
  }

  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
  }

  return createBuffer(size);
}
/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/


Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding);
};

function allocUnsafe(size) {
  assertSize(size);
  return createBuffer(size < 0 ? 0 : checked(size) | 0);
}
/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */


Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */


Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size);
};

function fromString(string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding);
  }

  const length = byteLength(string, encoding) | 0;
  let buf = createBuffer(length);
  const actual = buf.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual);
  }

  return buf;
}

function fromArrayLike(array) {
  const length = array.length < 0 ? 0 : checked(array.length) | 0;
  const buf = createBuffer(length);

  for (let i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255;
  }

  return buf;
}

function fromArrayView(arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    const copy = new Uint8Array(arrayView);
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
  }

  return fromArrayLike(arrayView);
}

function fromArrayBuffer(array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds');
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds');
  }

  let buf;

  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array);
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset);
  } else {
    buf = new Uint8Array(array, byteOffset, length);
  } // Return an augmented `Uint8Array` instance


  Object.setPrototypeOf(buf, Buffer.prototype);
  return buf;
}

function fromObject(obj) {
  if (Buffer.isBuffer(obj)) {
    const len = checked(obj.length) | 0;
    const buf = createBuffer(len);

    if (buf.length === 0) {
      return buf;
    }

    obj.copy(buf, 0, 0, len);
    return buf;
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0);
    }

    return fromArrayLike(obj);
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data);
  }
}

function checked(length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
  }

  return length | 0;
}

function SlowBuffer(length) {
  if (+length != length) {
    // eslint-disable-line eqeqeq
    length = 0;
  }

  return Buffer.alloc(+length);
}

Buffer.isBuffer = function isBuffer(b) {
  return b != null && b._isBuffer === true && b !== Buffer.prototype; // so Buffer.isBuffer(Buffer.prototype) will be false
};

Buffer.compare = function compare(a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);

  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
  }

  if (a === b) return 0;
  let x = a.length;
  let y = b.length;

  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;

    default:
      return false;
  }
};

Buffer.concat = function concat(list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }

  if (list.length === 0) {
    return Buffer.alloc(0);
  }

  let i;

  if (length === undefined) {
    length = 0;

    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  const buffer = Buffer.allocUnsafe(length);
  let pos = 0;

  for (i = 0; i < list.length; ++i) {
    let buf = list[i];

    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
        buf.copy(buffer, pos);
      } else {
        Uint8Array.prototype.set.call(buffer, buf, pos);
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    } else {
      buf.copy(buffer, pos);
    }

    pos += buf.length;
  }

  return buffer;
};

function byteLength(string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length;
  }

  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength;
  }

  if (typeof string !== 'string') {
    throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + 'Received type ' + typeof string);
  }

  const len = string.length;
  const mustMatch = arguments.length > 2 && arguments[2] === true;
  if (!mustMatch && len === 0) return 0; // Use a for loop to avoid recursion

  let loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len;

      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length;

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;

      case 'hex':
        return len >>> 1;

      case 'base64':
        return base64ToBytes(string).length;

      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
        }

        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}

Buffer.byteLength = byteLength;

function slowToString(encoding, start, end) {
  let loweredCase = false; // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.
  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.

  if (start === undefined || start < 0) {
    start = 0;
  } // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.


  if (start > this.length) {
    return '';
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return '';
  } // Force coercion to uint32. This will also coerce falsey/NaN values to 0.


  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return '';
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
} // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154


Buffer.prototype._isBuffer = true;

function swap(b, n, m) {
  const i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16() {
  const len = this.length;

  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits');
  }

  for (let i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }

  return this;
};

Buffer.prototype.swap32 = function swap32() {
  const len = this.length;

  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits');
  }

  for (let i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }

  return this;
};

Buffer.prototype.swap64 = function swap64() {
  const len = this.length;

  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits');
  }

  for (let i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }

  return this;
};

Buffer.prototype.toString = function toString() {
  const length = this.length;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer.prototype.toLocaleString = Buffer.prototype.toString;

Buffer.prototype.equals = function equals(b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};

Buffer.prototype.inspect = function inspect() {
  let str = '';
  const max = exports.INSPECT_MAX_BYTES;
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
  if (this.length > max) str += ' ... ';
  return '<Buffer ' + str + '>';
};

if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
}

Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength);
  }

  if (!Buffer.isBuffer(target)) {
    throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + 'Received type ' + typeof target);
  }

  if (start === undefined) {
    start = 0;
  }

  if (end === undefined) {
    end = target ? target.length : 0;
  }

  if (thisStart === undefined) {
    thisStart = 0;
  }

  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index');
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }

  if (thisStart >= thisEnd) {
    return -1;
  }

  if (start >= end) {
    return 1;
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target) return 0;
  let x = thisEnd - thisStart;
  let y = end - start;
  const len = Math.min(x, y);
  const thisCopy = this.slice(thisStart, thisEnd);
  const targetCopy = target.slice(start, end);

  for (let i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
}; // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf


function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1; // Normalize byteOffset

  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }

  byteOffset = +byteOffset; // Coerce to Number.

  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
  } // Normalize byteOffset: negative offsets start from the end of the buffer


  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

  if (byteOffset >= buffer.length) {
    if (dir) return -1;else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;else return -1;
  } // Normalize val


  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  } // Finally, search either indexOf (if dir is true) or lastIndexOf


  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }

    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]

    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }

    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }

  throw new TypeError('val must be string, number or Buffer');
}

function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  let indexSize = 1;
  let arrLength = arr.length;
  let valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();

    if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }

      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read(buf, i) {
    if (indexSize === 1) {
      return buf[i];
    } else {
      return buf.readUInt16BE(i * indexSize);
    }
  }

  let i;

  if (dir) {
    let foundIndex = -1;

    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

    for (i = byteOffset; i >= 0; i--) {
      let found = true;

      for (let j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break;
        }
      }

      if (found) return i;
    }
  }

  return -1;
}

Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};

Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};

Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  const remaining = buf.length - offset;

  if (!length) {
    length = remaining;
  } else {
    length = Number(length);

    if (length > remaining) {
      length = remaining;
    }
  }

  const strLen = string.length;

  if (length > strLen / 2) {
    length = strLen / 2;
  }

  let i;

  for (i = 0; i < length; ++i) {
    const parsed = parseInt(string.substr(i * 2, 2), 16);
    if (numberIsNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }

  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer.prototype.write = function write(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0; // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0; // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0;

    if (isFinite(length)) {
      length = length >>> 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  } else {
    throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
  }

  const remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';
  let loweredCase = false;

  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length);

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf);
  } else {
    return base64.fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  const res = [];
  let i = start;

  while (i < end) {
    const firstByte = buf[i];
    let codePoint = null;
    let bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }

          break;

        case 2:
          secondByte = buf[i + 1];

          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }

          break;

        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];

          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }

      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
} // Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety


const MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  const len = codePoints.length;

  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  } // Decode in chunks to avoid "call stack size exceeded".


  let res = '';
  let i = 0;

  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }

  return res;
}

function asciiSlice(buf, start, end) {
  let ret = '';
  end = Math.min(buf.length, end);

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }

  return ret;
}

function latin1Slice(buf, start, end) {
  let ret = '';
  end = Math.min(buf.length, end);

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }

  return ret;
}

function hexSlice(buf, start, end) {
  const len = buf.length;
  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;
  let out = '';

  for (let i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]];
  }

  return out;
}

function utf16leSlice(buf, start, end) {
  const bytes = buf.slice(start, end);
  let res = ''; // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)

  for (let i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }

  return res;
}

Buffer.prototype.slice = function slice(start, end) {
  const len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;
  const newBuf = this.subarray(start, end); // Return an augmented `Uint8Array` instance

  Object.setPrototypeOf(newBuf, Buffer.prototype);
  return newBuf;
};
/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */


function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  let val = this[offset];
  let mul = 1;
  let i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  let val = this[offset + --byteLength];
  let mul = 1;

  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  const first = this[offset];
  const last = this[offset + 7];

  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }

  const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
  const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
});
Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  const first = this[offset];
  const last = this[offset + 7];

  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }

  const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
  const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
  return (BigInt(hi) << BigInt(32)) + BigInt(lo);
});

Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  let val = this[offset];
  let mul = 1;
  let i = 0;

  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);
  let i = byteLength;
  let mul = 1;
  let val = this[offset + --i];

  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }

  mul *= 0x80;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength);
  return val;
};

Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  const val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  const val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  const first = this[offset];
  const last = this[offset + 7];

  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }

  const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24); // Overflow

  return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
});
Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, 'offset');
  const first = this[offset];
  const last = this[offset + 7];

  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8);
  }

  const val = (first << 24) + // Overflow
  this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
  return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
});

Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, true, 23, 4);
};

Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, false, 23, 4);
};

Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, true, 52, 8);
};

Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
}

Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  let mul = 1;
  let i = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;

  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  let i = byteLength - 1;
  let mul = 1;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};

Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 0xff;
  return offset + 2;
};

Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  this[offset + 3] = value >>> 24;
  this[offset + 2] = value >>> 16;
  this[offset + 1] = value >>> 8;
  this[offset] = value & 0xff;
  return offset + 4;
};

Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 0xff;
  return offset + 4;
};

function wrtBigUInt64LE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  let lo = Number(value & BigInt(0xffffffff));
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  return offset;
}

function wrtBigUInt64BE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  let lo = Number(value & BigInt(0xffffffff));
  buf[offset + 7] = lo;
  lo = lo >> 8;
  buf[offset + 6] = lo;
  lo = lo >> 8;
  buf[offset + 5] = lo;
  lo = lo >> 8;
  buf[offset + 4] = lo;
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
  buf[offset + 3] = hi;
  hi = hi >> 8;
  buf[offset + 2] = hi;
  hi = hi >> 8;
  buf[offset + 1] = hi;
  hi = hi >> 8;
  buf[offset] = hi;
  return offset + 8;
}

Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'));
});
Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'));
});

Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    const limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  let i = 0;
  let mul = 1;
  let sub = 0;
  this[offset] = value & 0xFF;

  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    const limit = Math.pow(2, 8 * byteLength - 1);
    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  let i = byteLength - 1;
  let mul = 1;
  let sub = 0;
  this[offset + i] = value & 0xFF;

  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }

    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value & 0xff;
  return offset + 1;
};

Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};

Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 0xff;
  return offset + 2;
};

Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  this[offset] = value & 0xff;
  this[offset + 1] = value >>> 8;
  this[offset + 2] = value >>> 16;
  this[offset + 3] = value >>> 24;
  return offset + 4;
};

Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 0xff;
  return offset + 4;
};

Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'));
});
Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'));
});

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range');
  if (offset < 0) throw new RangeError('Index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  ieee754.write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;

  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  ieee754.write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
}; // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)


Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start; // Copy 0 bytes; we're done

  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0; // Fatal error conditions

  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }

  if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
  if (end < 0) throw new RangeError('sourceEnd out of bounds'); // Are we oob?

  if (end > this.length) end = this.length;

  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  const len = end - start;

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end);
  } else {
    Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
  }

  return len;
}; // Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])


Buffer.prototype.fill = function fill(val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }

    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string');
    }

    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding);
    }

    if (val.length === 1) {
      const code = val.charCodeAt(0);

      if (encoding === 'utf8' && code < 128 || encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code;
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  } else if (typeof val === 'boolean') {
    val = Number(val);
  } // Invalid ranges are not set to a default, so can range check early.


  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index');
  }

  if (end <= start) {
    return this;
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;
  if (!val) val = 0;
  let i;

  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
    const len = bytes.length;

    if (len === 0) {
      throw new TypeError('The value "' + val + '" is invalid for argument "value"');
    }

    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this;
}; // CUSTOM ERRORS
// =============
// Simplified versions from Node, changed for Buffer-only usage


const errors = {};

function E(sym, getMessage, Base) {
  errors[sym] = class NodeError extends Base {
    constructor() {
      super();
      Object.defineProperty(this, 'message', {
        value: getMessage.apply(this, arguments),
        writable: true,
        configurable: true
      }); // Add the error code to the name to include it in the stack trace.

      this.name = `${this.name} [${sym}]`; // Access the stack to generate the error message including the error code
      // from the name.

      this.stack; // eslint-disable-line no-unused-expressions
      // Reset the name to the actual name.

      delete this.name;
    }

    get code() {
      return sym;
    }

    set code(value) {
      Object.defineProperty(this, 'code', {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      });
    }

    toString() {
      return `${this.name} [${sym}]: ${this.message}`;
    }

  };
}

E('ERR_BUFFER_OUT_OF_BOUNDS', function (name) {
  if (name) {
    return `${name} is outside of buffer bounds`;
  }

  return 'Attempt to access memory outside buffer bounds';
}, RangeError);
E('ERR_INVALID_ARG_TYPE', function (name, actual) {
  return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
}, TypeError);
E('ERR_OUT_OF_RANGE', function (str, range, input) {
  let msg = `The value of "${str}" is out of range.`;
  let received = input;

  if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
    received = addNumericalSeparator(String(input));
  } else if (typeof input === 'bigint') {
    received = String(input);

    if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
      received = addNumericalSeparator(received);
    }

    received += 'n';
  }

  msg += ` It must be ${range}. Received ${received}`;
  return msg;
}, RangeError);

function addNumericalSeparator(val) {
  let res = '';
  let i = val.length;
  const start = val[0] === '-' ? 1 : 0;

  for (; i >= start + 4; i -= 3) {
    res = `_${val.slice(i - 3, i)}${res}`;
  }

  return `${val.slice(0, i)}${res}`;
} // CHECK FUNCTIONS
// ===============


function checkBounds(buf, offset, byteLength) {
  validateNumber(offset, 'offset');

  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
    boundsError(offset, buf.length - (byteLength + 1));
  }
}

function checkIntBI(value, min, max, buf, offset, byteLength) {
  if (value > max || value < min) {
    const n = typeof min === 'bigint' ? 'n' : '';
    let range;

    if (byteLength > 3) {
      if (min === 0 || min === BigInt(0)) {
        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
      } else {
        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` + `${(byteLength + 1) * 8 - 1}${n}`;
      }
    } else {
      range = `>= ${min}${n} and <= ${max}${n}`;
    }

    throw new errors.ERR_OUT_OF_RANGE('value', range, value);
  }

  checkBounds(buf, offset, byteLength);
}

function validateNumber(value, name) {
  if (typeof value !== 'number') {
    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value);
  }
}

function boundsError(value, length, type) {
  if (Math.floor(value) !== value) {
    validateNumber(value, type);
    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value);
  }

  if (length < 0) {
    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
  }

  throw new errors.ERR_OUT_OF_RANGE(type || 'offset', `>= ${type ? 1 : 0} and <= ${length}`, value);
} // HELPER FUNCTIONS
// ================


const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

function base64clean(str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]; // Node strips out invalid characters like \n and \t from the string, base64-js does not

  str = str.trim().replace(INVALID_BASE64_RE, ''); // Node converts strings with length < 2 to ''

  if (str.length < 2) return ''; // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not

  while (str.length % 4 !== 0) {
    str = str + '=';
  }

  return str;
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  let codePoint;
  const length = string.length;
  let leadSurrogate = null;
  const bytes = [];

  for (let i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i); // is surrogate component

    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } // valid lead


        leadSurrogate = codePoint;
        continue;
      } // 2 leads in a row


      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      } // valid surrogate pair


      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null; // encode utf8

    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  const byteArray = [];

  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }

  return byteArray;
}

function utf16leToBytes(str, units) {
  let c, hi, lo;
  const byteArray = [];

  for (let i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return base64.toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  let i;

  for (i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }

  return i;
} // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166


function isInstance(obj, type) {
  return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}

function numberIsNaN(obj) {
  // For IE11 support
  return obj !== obj; // eslint-disable-line no-self-compare
} // Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219


const hexSliceLookupTable = function () {
  const alphabet = '0123456789abcdef';
  const table = new Array(256);

  for (let i = 0; i < 16; ++i) {
    const i16 = i * 16;

    for (let j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j];
    }
  }

  return table;
}(); // Return not function with Error if BigInt not supported


function defineBigIntMethod(fn) {
  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn;
}

function BufferBigIntNotDefined() {
  throw new Error('BigInt not supported');
}

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.byteLength = byteLength;
exports.toByteArray = toByteArray;
exports.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
} // Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications


revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens(b64) {
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  } // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42


  var validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
} // base64 is 4/3 + up to two characters of the original data


function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}

function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}

function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0; // if there are placeholders, only get up to the last complete 4 chars

  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i;

  for (i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = tmp >> 16 & 0xFF;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }

  return arr;
}

function tripletToBase64(num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];

  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
    output.push(tripletToBase64(tmp));
  }

  return output.join('');
}

function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes

  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3
  // go through the array every three bytes, we'll deal with trailing stuff later

  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  } // pad the end with zeros, but make sure to not forget the extra bytes


  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 0x3F] + '==');
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3F] + lookup[tmp << 2 & 0x3F] + '=');
  }

  return parts.join('');
}

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;

  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;

  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }

  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);

    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }

    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }

    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;

  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
};

/***/ }),
/* 19 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ndarray = __webpack_require__(12);

var do_convert = __webpack_require__(20);

module.exports = function convert(arr, result) {
  var shape = [],
      c = arr,
      sz = 1;

  while (Array.isArray(c)) {
    shape.push(c.length);
    sz *= c.length;
    c = c[0];
  }

  if (shape.length === 0) {
    return ndarray();
  }

  if (!result) {
    result = ndarray(new Float64Array(sz), shape);
  }

  do_convert(result, arr);
  return result;
};

/***/ }),
/* 20 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(21)({
  "args": ["array", "scalar", "index"],
  "pre": {
    "body": "{}",
    "args": [],
    "thisVars": [],
    "localVars": []
  },
  "body": {
    "body": "{\nvar _inline_1_v=_inline_1_arg1_,_inline_1_i\nfor(_inline_1_i=0;_inline_1_i<_inline_1_arg2_.length-1;++_inline_1_i) {\n_inline_1_v=_inline_1_v[_inline_1_arg2_[_inline_1_i]]\n}\n_inline_1_arg0_=_inline_1_v[_inline_1_arg2_[_inline_1_arg2_.length-1]]\n}",
    "args": [{
      "name": "_inline_1_arg0_",
      "lvalue": true,
      "rvalue": false,
      "count": 1
    }, {
      "name": "_inline_1_arg1_",
      "lvalue": false,
      "rvalue": true,
      "count": 1
    }, {
      "name": "_inline_1_arg2_",
      "lvalue": false,
      "rvalue": true,
      "count": 4
    }],
    "thisVars": [],
    "localVars": ["_inline_1_i", "_inline_1_v"]
  },
  "post": {
    "body": "{}",
    "args": [],
    "thisVars": [],
    "localVars": []
  },
  "funcName": "convert",
  "blockSize": 64
});

/***/ }),
/* 21 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createThunk = __webpack_require__(22);

function Procedure() {
  this.argTypes = [];
  this.shimArgs = [];
  this.arrayArgs = [];
  this.arrayBlockIndices = [];
  this.scalarArgs = [];
  this.offsetArgs = [];
  this.offsetArgIndex = [];
  this.indexArgs = [];
  this.shapeArgs = [];
  this.funcName = "";
  this.pre = null;
  this.body = null;
  this.post = null;
  this.debug = false;
}

function compileCwise(user_args) {
  //Create procedure
  var proc = new Procedure(); //Parse blocks

  proc.pre = user_args.pre;
  proc.body = user_args.body;
  proc.post = user_args.post; //Parse arguments

  var proc_args = user_args.args.slice(0);
  proc.argTypes = proc_args;

  for (var i = 0; i < proc_args.length; ++i) {
    var arg_type = proc_args[i];

    if (arg_type === "array" || typeof arg_type === "object" && arg_type.blockIndices) {
      proc.argTypes[i] = "array";
      proc.arrayArgs.push(i);
      proc.arrayBlockIndices.push(arg_type.blockIndices ? arg_type.blockIndices : 0);
      proc.shimArgs.push("array" + i);

      if (i < proc.pre.args.length && proc.pre.args[i].count > 0) {
        throw new Error("cwise: pre() block may not reference array args");
      }

      if (i < proc.post.args.length && proc.post.args[i].count > 0) {
        throw new Error("cwise: post() block may not reference array args");
      }
    } else if (arg_type === "scalar") {
      proc.scalarArgs.push(i);
      proc.shimArgs.push("scalar" + i);
    } else if (arg_type === "index") {
      proc.indexArgs.push(i);

      if (i < proc.pre.args.length && proc.pre.args[i].count > 0) {
        throw new Error("cwise: pre() block may not reference array index");
      }

      if (i < proc.body.args.length && proc.body.args[i].lvalue) {
        throw new Error("cwise: body() block may not write to array index");
      }

      if (i < proc.post.args.length && proc.post.args[i].count > 0) {
        throw new Error("cwise: post() block may not reference array index");
      }
    } else if (arg_type === "shape") {
      proc.shapeArgs.push(i);

      if (i < proc.pre.args.length && proc.pre.args[i].lvalue) {
        throw new Error("cwise: pre() block may not write to array shape");
      }

      if (i < proc.body.args.length && proc.body.args[i].lvalue) {
        throw new Error("cwise: body() block may not write to array shape");
      }

      if (i < proc.post.args.length && proc.post.args[i].lvalue) {
        throw new Error("cwise: post() block may not write to array shape");
      }
    } else if (typeof arg_type === "object" && arg_type.offset) {
      proc.argTypes[i] = "offset";
      proc.offsetArgs.push({
        array: arg_type.array,
        offset: arg_type.offset
      });
      proc.offsetArgIndex.push(i);
    } else {
      throw new Error("cwise: Unknown argument type " + proc_args[i]);
    }
  } //Make sure at least one array argument was specified


  if (proc.arrayArgs.length <= 0) {
    throw new Error("cwise: No array arguments specified");
  } //Make sure arguments are correct


  if (proc.pre.args.length > proc_args.length) {
    throw new Error("cwise: Too many arguments in pre() block");
  }

  if (proc.body.args.length > proc_args.length) {
    throw new Error("cwise: Too many arguments in body() block");
  }

  if (proc.post.args.length > proc_args.length) {
    throw new Error("cwise: Too many arguments in post() block");
  } //Check debug flag


  proc.debug = !!user_args.printCode || !!user_args.debug; //Retrieve name

  proc.funcName = user_args.funcName || "cwise"; //Read in block size

  proc.blockSize = user_args.blockSize || 64;
  return createThunk(proc);
}

module.exports = compileCwise;

/***/ }),
/* 22 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
 // The function below is called when constructing a cwise function object, and does the following:
// A function object is constructed which accepts as argument a compilation function and returns another function.
// It is this other function that is eventually returned by createThunk, and this function is the one that actually
// checks whether a certain pattern of arguments has already been used before and compiles new loops as needed.
// The compilation passed to the first function object is used for compiling new functions.
// Once this function object is created, it is called with compile as argument, where the first argument of compile
// is bound to "proc" (essentially containing a preprocessed version of the user arguments to cwise).
// So createThunk roughly works like this:
// function createThunk(proc) {
//   var thunk = function(compileBound) {
//     var CACHED = {}
//     return function(arrays and scalars) {
//       if (dtype and order of arrays in CACHED) {
//         var func = CACHED[dtype and order of arrays]
//       } else {
//         var func = CACHED[dtype and order of arrays] = compileBound(dtype and order of arrays)
//       }
//       return func(arrays and scalars)
//     }
//   }
//   return thunk(compile.bind1(proc))
// }

var compile = __webpack_require__(23);

function createThunk(proc) {
  var code = ["'use strict'", "var CACHED={}"];
  var vars = [];
  var thunkName = proc.funcName + "_cwise_thunk"; //Build thunk

  code.push(["return function ", thunkName, "(", proc.shimArgs.join(","), "){"].join(""));
  var typesig = [];
  var string_typesig = [];
  var proc_args = [["array", proc.arrayArgs[0], ".shape.slice(", // Slice shape so that we only retain the shape over which we iterate (which gets passed to the cwise operator as SS).
  Math.max(0, proc.arrayBlockIndices[0]), proc.arrayBlockIndices[0] < 0 ? "," + proc.arrayBlockIndices[0] + ")" : ")"].join("")];
  var shapeLengthConditions = [],
      shapeConditions = []; // Process array arguments

  for (var i = 0; i < proc.arrayArgs.length; ++i) {
    var j = proc.arrayArgs[i];
    vars.push(["t", j, "=array", j, ".dtype,", "r", j, "=array", j, ".order"].join(""));
    typesig.push("t" + j);
    typesig.push("r" + j);
    string_typesig.push("t" + j);
    string_typesig.push("r" + j + ".join()");
    proc_args.push("array" + j + ".data");
    proc_args.push("array" + j + ".stride");
    proc_args.push("array" + j + ".offset|0");

    if (i > 0) {
      // Gather conditions to check for shape equality (ignoring block indices)
      shapeLengthConditions.push("array" + proc.arrayArgs[0] + ".shape.length===array" + j + ".shape.length+" + (Math.abs(proc.arrayBlockIndices[0]) - Math.abs(proc.arrayBlockIndices[i])));
      shapeConditions.push("array" + proc.arrayArgs[0] + ".shape[shapeIndex+" + Math.max(0, proc.arrayBlockIndices[0]) + "]===array" + j + ".shape[shapeIndex+" + Math.max(0, proc.arrayBlockIndices[i]) + "]");
    }
  } // Check for shape equality


  if (proc.arrayArgs.length > 1) {
    code.push("if (!(" + shapeLengthConditions.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same dimensionality!')");
    code.push("for(var shapeIndex=array" + proc.arrayArgs[0] + ".shape.length-" + Math.abs(proc.arrayBlockIndices[0]) + "; shapeIndex-->0;) {");
    code.push("if (!(" + shapeConditions.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same shape!')");
    code.push("}");
  } // Process scalar arguments


  for (var i = 0; i < proc.scalarArgs.length; ++i) {
    proc_args.push("scalar" + proc.scalarArgs[i]);
  } // Check for cached function (and if not present, generate it)


  vars.push(["type=[", string_typesig.join(","), "].join()"].join(""));
  vars.push("proc=CACHED[type]");
  code.push("var " + vars.join(","));
  code.push(["if(!proc){", "CACHED[type]=proc=compile([", typesig.join(","), "])}", "return proc(", proc_args.join(","), ")}"].join(""));

  if (proc.debug) {
    console.log("-----Generated thunk:\n" + code.join("\n") + "\n----------");
  } //Compile thunk


  var thunk = new Function("compile", code.join("\n"));
  return thunk(compile.bind(undefined, proc));
}

module.exports = createThunk;

/***/ }),
/* 23 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var uniq = __webpack_require__(24); // This function generates very simple loops analogous to how you typically traverse arrays (the outermost loop corresponds to the slowest changing index, the innermost loop to the fastest changing index)
// TODO: If two arrays have the same strides (and offsets) there is potential for decreasing the number of "pointers" and related variables. The drawback is that the type signature would become more specific and that there would thus be less potential for caching, but it might still be worth it, especially when dealing with large numbers of arguments.


function innerFill(order, proc, body) {
  var dimension = order.length,
      nargs = proc.arrayArgs.length,
      has_index = proc.indexArgs.length > 0,
      code = [],
      vars = [],
      idx = 0,
      pidx = 0,
      i,
      j;

  for (i = 0; i < dimension; ++i) {
    // Iteration variables
    vars.push(["i", i, "=0"].join(""));
  } //Compute scan deltas


  for (j = 0; j < nargs; ++j) {
    for (i = 0; i < dimension; ++i) {
      pidx = idx;
      idx = order[i];

      if (i === 0) {
        // The innermost/fastest dimension's delta is simply its stride
        vars.push(["d", j, "s", i, "=t", j, "p", idx].join(""));
      } else {
        // For other dimensions the delta is basically the stride minus something which essentially "rewinds" the previous (more inner) dimension
        vars.push(["d", j, "s", i, "=(t", j, "p", idx, "-s", pidx, "*t", j, "p", pidx, ")"].join(""));
      }
    }
  }

  if (vars.length > 0) {
    code.push("var " + vars.join(","));
  } //Scan loop


  for (i = dimension - 1; i >= 0; --i) {
    // Start at largest stride and work your way inwards
    idx = order[i];
    code.push(["for(i", i, "=0;i", i, "<s", idx, ";++i", i, "){"].join(""));
  } //Push body of inner loop


  code.push(body); //Advance scan pointers

  for (i = 0; i < dimension; ++i) {
    pidx = idx;
    idx = order[i];

    for (j = 0; j < nargs; ++j) {
      code.push(["p", j, "+=d", j, "s", i].join(""));
    }

    if (has_index) {
      if (i > 0) {
        code.push(["index[", pidx, "]-=s", pidx].join(""));
      }

      code.push(["++index[", idx, "]"].join(""));
    }

    code.push("}");
  }

  return code.join("\n");
} // Generate "outer" loops that loop over blocks of data, applying "inner" loops to the blocks by manipulating the local variables in such a way that the inner loop only "sees" the current block.
// TODO: If this is used, then the previous declaration (done by generateCwiseOp) of s* is essentially unnecessary.
//       I believe the s* are not used elsewhere (in particular, I don't think they're used in the pre/post parts and "shape" is defined independently), so it would be possible to make defining the s* dependent on what loop method is being used.


function outerFill(matched, order, proc, body) {
  var dimension = order.length,
      nargs = proc.arrayArgs.length,
      blockSize = proc.blockSize,
      has_index = proc.indexArgs.length > 0,
      code = [];

  for (var i = 0; i < nargs; ++i) {
    code.push(["var offset", i, "=p", i].join(""));
  } //Generate loops for unmatched dimensions
  // The order in which these dimensions are traversed is fairly arbitrary (from small stride to large stride, for the first argument)
  // TODO: It would be nice if the order in which these loops are placed would also be somehow "optimal" (at the very least we should check that it really doesn't hurt us if they're not).


  for (var i = matched; i < dimension; ++i) {
    code.push(["for(var j" + i + "=SS[", order[i], "]|0;j", i, ">0;){"].join("")); // Iterate back to front

    code.push(["if(j", i, "<", blockSize, "){"].join("")); // Either decrease j by blockSize (s = blockSize), or set it to zero (after setting s = j).

    code.push(["s", order[i], "=j", i].join(""));
    code.push(["j", i, "=0"].join(""));
    code.push(["}else{s", order[i], "=", blockSize].join(""));
    code.push(["j", i, "-=", blockSize, "}"].join(""));

    if (has_index) {
      code.push(["index[", order[i], "]=j", i].join(""));
    }
  }

  for (var i = 0; i < nargs; ++i) {
    var indexStr = ["offset" + i];

    for (var j = matched; j < dimension; ++j) {
      indexStr.push(["j", j, "*t", i, "p", order[j]].join(""));
    }

    code.push(["p", i, "=(", indexStr.join("+"), ")"].join(""));
  }

  code.push(innerFill(order, proc, body));

  for (var i = matched; i < dimension; ++i) {
    code.push("}");
  }

  return code.join("\n");
} //Count the number of compatible inner orders
// This is the length of the longest common prefix of the arrays in orders.
// Each array in orders lists the dimensions of the correspond ndarray in order of increasing stride.
// This is thus the maximum number of dimensions that can be efficiently traversed by simple nested loops for all arrays.


function countMatches(orders) {
  var matched = 0,
      dimension = orders[0].length;

  while (matched < dimension) {
    for (var j = 1; j < orders.length; ++j) {
      if (orders[j][matched] !== orders[0][matched]) {
        return matched;
      }
    }

    ++matched;
  }

  return matched;
} //Processes a block according to the given data types
// Replaces variable names by different ones, either "local" ones (that are then ferried in and out of the given array) or ones matching the arguments that the function performing the ultimate loop will accept.


function processBlock(block, proc, dtypes) {
  var code = block.body;
  var pre = [];
  var post = [];

  for (var i = 0; i < block.args.length; ++i) {
    var carg = block.args[i];

    if (carg.count <= 0) {
      continue;
    }

    var re = new RegExp(carg.name, "g");
    var ptrStr = "";
    var arrNum = proc.arrayArgs.indexOf(i);

    switch (proc.argTypes[i]) {
      case "offset":
        var offArgIndex = proc.offsetArgIndex.indexOf(i);
        var offArg = proc.offsetArgs[offArgIndex];
        arrNum = offArg.array;
        ptrStr = "+q" + offArgIndex;
      // Adds offset to the "pointer" in the array

      case "array":
        ptrStr = "p" + arrNum + ptrStr;
        var localStr = "l" + i;
        var arrStr = "a" + arrNum;

        if (proc.arrayBlockIndices[arrNum] === 0) {
          // Argument to body is just a single value from this array
          if (carg.count === 1) {
            // Argument/array used only once(?)
            if (dtypes[arrNum] === "generic") {
              if (carg.lvalue) {
                pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")); // Is this necessary if the argument is ONLY used as an lvalue? (keep in mind that we can have a += something, so we would actually need to check carg.rvalue)

                code = code.replace(re, localStr);
                post.push([arrStr, ".set(", ptrStr, ",", localStr, ")"].join(""));
              } else {
                code = code.replace(re, [arrStr, ".get(", ptrStr, ")"].join(""));
              }
            } else {
              code = code.replace(re, [arrStr, "[", ptrStr, "]"].join(""));
            }
          } else if (dtypes[arrNum] === "generic") {
            pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")); // TODO: Could we optimize by checking for carg.rvalue?

            code = code.replace(re, localStr);

            if (carg.lvalue) {
              post.push([arrStr, ".set(", ptrStr, ",", localStr, ")"].join(""));
            }
          } else {
            pre.push(["var ", localStr, "=", arrStr, "[", ptrStr, "]"].join("")); // TODO: Could we optimize by checking for carg.rvalue?

            code = code.replace(re, localStr);

            if (carg.lvalue) {
              post.push([arrStr, "[", ptrStr, "]=", localStr].join(""));
            }
          }
        } else {
          // Argument to body is a "block"
          var reStrArr = [carg.name],
              ptrStrArr = [ptrStr];

          for (var j = 0; j < Math.abs(proc.arrayBlockIndices[arrNum]); j++) {
            reStrArr.push("\\s*\\[([^\\]]+)\\]");
            ptrStrArr.push("$" + (j + 1) + "*t" + arrNum + "b" + j); // Matched index times stride
          }

          re = new RegExp(reStrArr.join(""), "g");
          ptrStr = ptrStrArr.join("+");

          if (dtypes[arrNum] === "generic") {
            /*if(carg.lvalue) {
              pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")) // Is this necessary if the argument is ONLY used as an lvalue? (keep in mind that we can have a += something, so we would actually need to check carg.rvalue)
              code = code.replace(re, localStr)
              post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""))
            } else {
              code = code.replace(re, [arrStr, ".get(", ptrStr, ")"].join(""))
            }*/
            throw new Error("cwise: Generic arrays not supported in combination with blocks!");
          } else {
            // This does not produce any local variables, even if variables are used multiple times. It would be possible to do so, but it would complicate things quite a bit.
            code = code.replace(re, [arrStr, "[", ptrStr, "]"].join(""));
          }
        }

        break;

      case "scalar":
        code = code.replace(re, "Y" + proc.scalarArgs.indexOf(i));
        break;

      case "index":
        code = code.replace(re, "index");
        break;

      case "shape":
        code = code.replace(re, "shape");
        break;
    }
  }

  return [pre.join("\n"), code, post.join("\n")].join("\n").trim();
}

function typeSummary(dtypes) {
  var summary = new Array(dtypes.length);
  var allEqual = true;

  for (var i = 0; i < dtypes.length; ++i) {
    var t = dtypes[i];
    var digits = t.match(/\d+/);

    if (!digits) {
      digits = "";
    } else {
      digits = digits[0];
    }

    if (t.charAt(0) === 0) {
      summary[i] = "u" + t.charAt(1) + digits;
    } else {
      summary[i] = t.charAt(0) + digits;
    }

    if (i > 0) {
      allEqual = allEqual && summary[i] === summary[i - 1];
    }
  }

  if (allEqual) {
    return summary[0];
  }

  return summary.join("");
} //Generates a cwise operator


function generateCWiseOp(proc, typesig) {
  //Compute dimension
  // Arrays get put first in typesig, and there are two entries per array (dtype and order), so this gets the number of dimensions in the first array arg.
  var dimension = typesig[1].length - Math.abs(proc.arrayBlockIndices[0]) | 0;
  var orders = new Array(proc.arrayArgs.length);
  var dtypes = new Array(proc.arrayArgs.length);

  for (var i = 0; i < proc.arrayArgs.length; ++i) {
    dtypes[i] = typesig[2 * i];
    orders[i] = typesig[2 * i + 1];
  } //Determine where block and loop indices start and end


  var blockBegin = [],
      blockEnd = []; // These indices are exposed as blocks

  var loopBegin = [],
      loopEnd = []; // These indices are iterated over

  var loopOrders = []; // orders restricted to the loop indices

  for (var i = 0; i < proc.arrayArgs.length; ++i) {
    if (proc.arrayBlockIndices[i] < 0) {
      loopBegin.push(0);
      loopEnd.push(dimension);
      blockBegin.push(dimension);
      blockEnd.push(dimension + proc.arrayBlockIndices[i]);
    } else {
      loopBegin.push(proc.arrayBlockIndices[i]); // Non-negative

      loopEnd.push(proc.arrayBlockIndices[i] + dimension);
      blockBegin.push(0);
      blockEnd.push(proc.arrayBlockIndices[i]);
    }

    var newOrder = [];

    for (var j = 0; j < orders[i].length; j++) {
      if (loopBegin[i] <= orders[i][j] && orders[i][j] < loopEnd[i]) {
        newOrder.push(orders[i][j] - loopBegin[i]); // If this is a loop index, put it in newOrder, subtracting loopBegin, to make sure that all loopOrders are using a common set of indices.
      }
    }

    loopOrders.push(newOrder);
  } //First create arguments for procedure


  var arglist = ["SS"]; // SS is the overall shape over which we iterate

  var code = ["'use strict'"];
  var vars = [];

  for (var j = 0; j < dimension; ++j) {
    vars.push(["s", j, "=SS[", j, "]"].join("")); // The limits for each dimension.
  }

  for (var i = 0; i < proc.arrayArgs.length; ++i) {
    arglist.push("a" + i); // Actual data array

    arglist.push("t" + i); // Strides

    arglist.push("p" + i); // Offset in the array at which the data starts (also used for iterating over the data)

    for (var j = 0; j < dimension; ++j) {
      // Unpack the strides into vars for looping
      vars.push(["t", i, "p", j, "=t", i, "[", loopBegin[i] + j, "]"].join(""));
    }

    for (var j = 0; j < Math.abs(proc.arrayBlockIndices[i]); ++j) {
      // Unpack the strides into vars for block iteration
      vars.push(["t", i, "b", j, "=t", i, "[", blockBegin[i] + j, "]"].join(""));
    }
  }

  for (var i = 0; i < proc.scalarArgs.length; ++i) {
    arglist.push("Y" + i);
  }

  if (proc.shapeArgs.length > 0) {
    vars.push("shape=SS.slice(0)"); // Makes the shape over which we iterate available to the user defined functions (so you can use width/height for example)
  }

  if (proc.indexArgs.length > 0) {
    // Prepare an array to keep track of the (logical) indices, initialized to dimension zeroes.
    var zeros = new Array(dimension);

    for (var i = 0; i < dimension; ++i) {
      zeros[i] = "0";
    }

    vars.push(["index=[", zeros.join(","), "]"].join(""));
  }

  for (var i = 0; i < proc.offsetArgs.length; ++i) {
    // Offset arguments used for stencil operations
    var off_arg = proc.offsetArgs[i];
    var init_string = [];

    for (var j = 0; j < off_arg.offset.length; ++j) {
      if (off_arg.offset[j] === 0) {
        continue;
      } else if (off_arg.offset[j] === 1) {
        init_string.push(["t", off_arg.array, "p", j].join(""));
      } else {
        init_string.push([off_arg.offset[j], "*t", off_arg.array, "p", j].join(""));
      }
    }

    if (init_string.length === 0) {
      vars.push("q" + i + "=0");
    } else {
      vars.push(["q", i, "=", init_string.join("+")].join(""));
    }
  } //Prepare this variables


  var thisVars = uniq([].concat(proc.pre.thisVars).concat(proc.body.thisVars).concat(proc.post.thisVars));
  vars = vars.concat(thisVars);

  if (vars.length > 0) {
    code.push("var " + vars.join(","));
  }

  for (var i = 0; i < proc.arrayArgs.length; ++i) {
    code.push("p" + i + "|=0");
  } //Inline prelude


  if (proc.pre.body.length > 3) {
    code.push(processBlock(proc.pre, proc, dtypes));
  } //Process body


  var body = processBlock(proc.body, proc, dtypes);
  var matched = countMatches(loopOrders);

  if (matched < dimension) {
    code.push(outerFill(matched, loopOrders[0], proc, body)); // TODO: Rather than passing loopOrders[0], it might be interesting to look at passing an order that represents the majority of the arguments for example.
  } else {
    code.push(innerFill(loopOrders[0], proc, body));
  } //Inline epilog


  if (proc.post.body.length > 3) {
    code.push(processBlock(proc.post, proc, dtypes));
  }

  if (proc.debug) {
    console.log("-----Generated cwise routine for ", typesig, ":\n" + code.join("\n") + "\n----------");
  }

  var loopName = [proc.funcName || "unnamed", "_cwise_loop_", orders[0].join("s"), "m", matched, typeSummary(dtypes)].join("");
  var f = new Function(["function ", loopName, "(", arglist.join(","), "){", code.join("\n"), "} return ", loopName].join(""));
  return f();
}

module.exports = generateCWiseOp;

/***/ }),
/* 24 */
/***/ ((module) => {

"use strict";


function unique_pred(list, compare) {
  var ptr = 1,
      len = list.length,
      a = list[0],
      b = list[0];

  for (var i = 1; i < len; ++i) {
    b = a;
    a = list[i];

    if (compare(a, b)) {
      if (i === ptr) {
        ptr++;
        continue;
      }

      list[ptr++] = a;
    }
  }

  list.length = ptr;
  return list;
}

function unique_eq(list) {
  var ptr = 1,
      len = list.length,
      a = list[0],
      b = list[0];

  for (var i = 1; i < len; ++i, b = a) {
    b = a;
    a = list[i];

    if (a !== b) {
      if (i === ptr) {
        ptr++;
        continue;
      }

      list[ptr++] = a;
    }
  }

  list.length = ptr;
  return list;
}

function unique(list, compare, sorted) {
  if (list.length === 0) {
    return list;
  }

  if (compare) {
    if (!sorted) {
      list.sort(compare);
    }

    return unique_pred(list, compare);
  }

  if (!sorted) {
    list.sort();
  }

  return unique_eq(list);
}

module.exports = unique;

/***/ }),
/* 25 */
/***/ ((module, exports, __webpack_require__) => {

var Stream = __webpack_require__(26); // through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)


exports = module.exports = through;
through.through = through; //create a readable writable stream.

function through(write, end, opts) {
  write = write || function (data) {
    this.queue(data);
  };

  end = end || function () {
    this.queue(null);
  };

  var ended = false,
      destroyed = false,
      buffer = [],
      _ended = false;
  var stream = new Stream();
  stream.readable = stream.writable = true;
  stream.paused = false; //  stream.autoPause   = !(opts && opts.autoPause   === false)

  stream.autoDestroy = !(opts && opts.autoDestroy === false);

  stream.write = function (data) {
    write.call(this, data);
    return !stream.paused;
  };

  function drain() {
    while (buffer.length && !stream.paused) {
      var data = buffer.shift();
      if (null === data) return stream.emit('end');else stream.emit('data', data);
    }
  }

  stream.queue = stream.push = function (data) {
    //    console.error(ended)
    if (_ended) return stream;
    if (data === null) _ended = true;
    buffer.push(data);
    drain();
    return stream;
  }; //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'


  stream.on('end', function () {
    stream.readable = false;
    if (!stream.writable && stream.autoDestroy) process.nextTick(function () {
      stream.destroy();
    });
  });

  function _end() {
    stream.writable = false;
    end.call(stream);
    if (!stream.readable && stream.autoDestroy) stream.destroy();
  }

  stream.end = function (data) {
    if (ended) return;
    ended = true;
    if (arguments.length) stream.write(data);

    _end(); // will emit or queue


    return stream;
  };

  stream.destroy = function () {
    if (destroyed) return;
    destroyed = true;
    ended = true;
    buffer.length = 0;
    stream.writable = stream.readable = false;
    stream.emit('close');
    return stream;
  };

  stream.pause = function () {
    if (stream.paused) return;
    stream.paused = true;
    return stream;
  };

  stream.resume = function () {
    if (stream.paused) {
      stream.paused = false;
      stream.emit('resume');
    }

    drain(); //may have become paused again,
    //as drain emits 'data'.

    if (!stream.paused) stream.emit('drain');
    return stream;
  };

  return stream;
}

/***/ }),
/* 26 */
/***/ (() => {

/* (ignored) */

/***/ }),
/* 27 */
/***/ ((module) => {

/**
 * Module exports.
 */
module.exports = dataUriToBuffer;
/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 * @return {Buffer} Buffer instance from Data URI
 * @api public
 */

function dataUriToBuffer(uri) {
  if (!/^data\:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  } // strip newlines


  uri = uri.replace(/\r?\n/g, ''); // split the URI up into the "metadata" and the "data" portions

  var firstComma = uri.indexOf(',');
  if (-1 === firstComma || firstComma <= 4) throw new TypeError('malformed data: URI'); // remove the "data:" scheme and parse the metadata

  var meta = uri.substring(5, firstComma).split(';');
  var base64 = false;
  var charset = 'US-ASCII';

  for (var i = 0; i < meta.length; i++) {
    if ('base64' == meta[i]) {
      base64 = true;
    } else if (0 == meta[i].indexOf('charset=')) {
      charset = meta[i].substring(8);
    }
  } // get the encoded data portion and decode URI-encoded chars


  var data = unescape(uri.substring(firstComma + 1));
  var encoding = base64 ? 'base64' : 'ascii';
  var buffer = new Buffer(data, encoding); // set `.type` property to MIME type

  buffer.type = meta[0] || 'text/plain'; // set the `.charset` property

  buffer.charset = charset;
  return buffer;
}

/***/ }),
/* 28 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function () {
  var crypt = __webpack_require__(29),
      utf8 = (__webpack_require__(30).utf8),
      isBuffer = __webpack_require__(14),
      bin = (__webpack_require__(30).bin),
      // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String) {
      if (options && options.encoding === 'binary') message = bin.stringToBytes(message);else message = utf8.stringToBytes(message);
    } else if (isBuffer(message)) message = Array.prototype.slice.call(message, 0);else if (!Array.isArray(message) && message.constructor !== Uint8Array) message = message.toString(); // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a = 1732584193,
        b = -271733879,
        c = -1732584194,
        d = 271733878; // Swap endian

    for (var i = 0; i < m.length; i++) {
      m[i] = (m[i] << 8 | m[i] >>> 24) & 0x00FF00FF | (m[i] << 24 | m[i] >>> 8) & 0xFF00FF00;
    } // Padding


    m[l >>> 5] |= 0x80 << l % 32;
    m[(l + 64 >>> 9 << 4) + 14] = l; // Method shortcuts

    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {
      var aa = a,
          bb = b,
          cc = c,
          dd = d;
      a = FF(a, b, c, d, m[i + 0], 7, -680876936);
      d = FF(d, a, b, c, m[i + 1], 12, -389564586);
      c = FF(c, d, a, b, m[i + 2], 17, 606105819);
      b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i + 4], 7, -176418897);
      d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
      c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i + 7], 22, -45705983);
      a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
      d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i + 10], 17, -42063);
      b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
      a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
      d = FF(d, a, b, c, m[i + 13], 12, -40341101);
      c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
      b = FF(b, c, d, a, m[i + 15], 22, 1236535329);
      a = GG(a, b, c, d, m[i + 1], 5, -165796510);
      d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
      c = GG(c, d, a, b, m[i + 11], 14, 643717713);
      b = GG(b, c, d, a, m[i + 0], 20, -373897302);
      a = GG(a, b, c, d, m[i + 5], 5, -701558691);
      d = GG(d, a, b, c, m[i + 10], 9, 38016083);
      c = GG(c, d, a, b, m[i + 15], 14, -660478335);
      b = GG(b, c, d, a, m[i + 4], 20, -405537848);
      a = GG(a, b, c, d, m[i + 9], 5, 568446438);
      d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
      c = GG(c, d, a, b, m[i + 3], 14, -187363961);
      b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
      a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
      d = GG(d, a, b, c, m[i + 2], 9, -51403784);
      c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
      b = GG(b, c, d, a, m[i + 12], 20, -1926607734);
      a = HH(a, b, c, d, m[i + 5], 4, -378558);
      d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
      b = HH(b, c, d, a, m[i + 14], 23, -35309556);
      a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
      d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
      c = HH(c, d, a, b, m[i + 7], 16, -155497632);
      b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
      a = HH(a, b, c, d, m[i + 13], 4, 681279174);
      d = HH(d, a, b, c, m[i + 0], 11, -358537222);
      c = HH(c, d, a, b, m[i + 3], 16, -722521979);
      b = HH(b, c, d, a, m[i + 6], 23, 76029189);
      a = HH(a, b, c, d, m[i + 9], 4, -640364487);
      d = HH(d, a, b, c, m[i + 12], 11, -421815835);
      c = HH(c, d, a, b, m[i + 15], 16, 530742520);
      b = HH(b, c, d, a, m[i + 2], 23, -995338651);
      a = II(a, b, c, d, m[i + 0], 6, -198630844);
      d = II(d, a, b, c, m[i + 7], 10, 1126891415);
      c = II(c, d, a, b, m[i + 14], 15, -1416354905);
      b = II(b, c, d, a, m[i + 5], 21, -57434055);
      a = II(a, b, c, d, m[i + 12], 6, 1700485571);
      d = II(d, a, b, c, m[i + 3], 10, -1894986606);
      c = II(c, d, a, b, m[i + 10], 15, -1051523);
      b = II(b, c, d, a, m[i + 1], 21, -2054922799);
      a = II(a, b, c, d, m[i + 8], 6, 1873313359);
      d = II(d, a, b, c, m[i + 15], 10, -30611744);
      c = II(c, d, a, b, m[i + 6], 15, -1560198380);
      b = II(b, c, d, a, m[i + 13], 21, 1309151649);
      a = II(a, b, c, d, m[i + 4], 6, -145523070);
      d = II(d, a, b, c, m[i + 11], 10, -1120210379);
      c = II(c, d, a, b, m[i + 2], 15, 718787259);
      b = II(b, c, d, a, m[i + 9], 21, -343485551);
      a = a + aa >>> 0;
      b = b + bb >>> 0;
      c = c + cc >>> 0;
      d = d + dd >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  }; // Auxiliary functions


  md5._ff = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  };

  md5._gg = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  };

  md5._hh = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  };

  md5._ii = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return (n << s | n >>> 32 - s) + b;
  }; // Package private blocksize


  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null) throw new Error('Illegal argument ' + message);
    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
  };
})();

/***/ }),
/* 29 */
/***/ ((module) => {

(function () {
  var base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      crypt = {
    // Bit-wise rotation left
    rotl: function (n, b) {
      return n << b | n >>> 32 - b;
    },
    // Bit-wise rotation right
    rotr: function (n, b) {
      return n << 32 - b | n >>> b;
    },
    // Swap big-endian to little-endian and vice versa
    endian: function (n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      } // Else, assume array and swap all items


      for (var i = 0; i < n.length; i++) n[i] = crypt.endian(n[i]);

      return n;
    },
    // Generate an array of any length of random bytes
    randomBytes: function (n) {
      for (var bytes = []; n > 0; n--) bytes.push(Math.floor(Math.random() * 256));

      return bytes;
    },
    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function (bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8) words[b >>> 5] |= bytes[i] << 24 - b % 32;

      return words;
    },
    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function (words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8) bytes.push(words[b >>> 5] >>> 24 - b % 32 & 0xFF);

      return bytes;
    },
    // Convert a byte array to a hex string
    bytesToHex: function (bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }

      return hex.join('');
    },
    // Convert a hex string to a byte array
    hexToBytes: function (hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));

      return bytes;
    },
    // Convert a byte array to a base-64 string
    bytesToBase64: function (bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];

        for (var j = 0; j < 4; j++) if (i * 8 + j * 6 <= bytes.length * 8) base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 0x3F));else base64.push('=');
      }

      return base64.join('');
    },
    // Convert a base-64 string to a byte array
    base64ToBytes: function (base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
      }

      return bytes;
    }
  };
  module.exports = crypt;
})();

/***/ }),
/* 30 */
/***/ ((module) => {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function (str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },
    // Convert a byte array to a string
    bytesToString: function (bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },
  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function (str) {
      for (var bytes = [], i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 0xFF);

      return bytes;
    },
    // Convert a byte array to a string
    bytesToString: function (bytes) {
      for (var str = [], i = 0; i < bytes.length; i++) str.push(String.fromCharCode(bytes[i]));

      return str.join('');
    }
  }
};
module.exports = charenc;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	__webpack_exports__ = __webpack_exports__["default"];
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});