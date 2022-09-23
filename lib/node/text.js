'use strict';

/**
 * FFText - Text component-based display component
 *
 * ####Example:
 *
 *     const text = new FFText({ text: "hello world", x: 400, y: 300 });
 *     text.setColor("#ffffff");
 *     text.setBackgroundColor("#000000");
 *     text.addEffect("fadeIn", 1, 1);
 *     scene.addChild(text);
 *
 * @class
 */
const FFNode = require('./node');
const isArray = require('lodash/isArray');
const CanvasUtil = require('../utils/canvas');
const Queue = require('../utils/queue');
const { ProxyObj, Text } = require('../../inkpaint/lib/index');
const { isBrowser } = require("browser-or-node");
const { nodeRequire } = require('../utils/utils');
const ImageMaterial = require('../material/image');
const { STR2RGB, RGB2HSL } = require('../utils/color');
const fs = nodeRequire('fs-extra');

const FONTS = {};
const ALIGN_MAP = { left: 0, center: 0.5, right: 1 };
const VALIGN_MAP = { top: 0, center: 0.5, bottom: 1 };

class FFText extends FFNode {
  constructor(conf = { text: '', style: { fontSize: 28 } }) {
    if (!conf.text && conf.content) {
      // 考虑到xml转义中可能会丢失\n等信息，所以也接受用innerHTML的形式传入文本
      conf.text = conf.content.innerHTML || `${conf.content}`;
    }
    super({ type: 'text', ...conf });
    this.queue = new Queue();
    this.setAlign(true);

    // reset rpx
    const keys = ['fontSize', 'letterSpacing', 'lineHeight'];
    for (const key of keys) {
      if (conf[key]) this[key] = conf[key];
    }

    if (conf.stroke?.size) this.conf.stroke.size = this.vu(conf.stroke?.size, '1%');
    if (conf.shadow?.blur) this.conf.shadow.blur = this.vu(conf.shadow?.blur, '1%');
    if (conf.shadow?.offset) this.conf.shadow.offset = this.vu(conf.shadow?.offset, '1%');

    // 用作编辑选择 default
    this._selectionBgColor = '#CCC';
    this.editMode = false;
  }

  get confAttr() {
    const conf = {...super.confAttr};
    conf.fontSize = super.px(conf.fontSize);
    conf.padding = `${conf.padding || '0%'}`;
    conf.lineHeight = `${conf.lineHeight || '150%'}`;
    conf.letterSpacing = `${conf.letterSpacing || '0%'}`;
    return conf
  }

  get cursorIndex() {
    return this.display.cursor().ci;
  }

  set cursorIndex(val) {
    this.display.cursor(val);
  }

  get selectionBgColor() {
    return this._selectionBgColor;
  }

  set selectionBgColor(color) {
    this._selectionBgColor = color;
    this.display._style.selectionBgColor = color;
  }

  get material() {
    return this.speech?.material;
  }

  get volume() {
    return this.speech?.volume;
  }

  get buffer() {
    return this.speech?.buffer;
  }

  get speech() {
    const speeches = this.children.filter(x => x.type === 'speech');
    return speeches.length > 0 ? speeches[speeches.length - 1] : null;
  }

  get audio() {
    const speech = this.speech;
    return speech ? speech.audio : false;
  }

  set audio(audio) {
    const speech = this.speech;
    if (speech) speech.audio = audio;
  }

  get wrap() {
    return !!this.confAttr.wrap;
  }

  set wrap(wrap) {
    this.conf.wrap = !!wrap;
  }

  get useFontFamily() {
    return this.cachedFontFamily || this.confAttr.fontFamily;
  }

  get fontFamily() {
    return this.confAttr.fontFamily;
  }

  set fontFamily(fontFamily) {
    this.conf.fontFamily = fontFamily;
  }

  get fontSize() {
    return this.confAttr.fontSize;
  }

  set fontSize(size) {
    this.conf.fontSize = super.vu(size, this.confAttr.fontSize);
  }

  get letterSpacing() {
    return this.px(this.confAttr.letterSpacing, false);
  }

  set letterSpacing(letterSpacing) {
    this.conf.letterSpacing = this.vu(letterSpacing, this.confAttr.letterSpacing);
  }

  get lineHeight() {
    return this.px(this.confAttr.lineHeight, false);
  }

  set lineHeight(lineHeight) {
    this.conf.lineHeight = this.vu(lineHeight, this.confAttr.lineHeight);
  }

  get align() {
    return this.confAttr.align || 'center';
  }

  set align(align) {
    this.conf.align = align;
  }

  get valign() {
    return this.confAttr.valign || 'center';
  }

  set valign(valign) {
    this.conf.valign = valign;
  }

  get color() {
    return this.confAttr.color || '#FFFFFF';
  }

  set color(color) {
    this.conf.color = color;
  }

  get backgroundColor() {
    return this.confAttr.backgroundColor;
  }

  set backgroundColor(color) {
    this.conf.backgroundColor = color;
  }

  get styleStroke() {
    return {
      stroke: this.confAttr.stroke?.color,
      strokeThickness: this.px(this.confAttr.stroke?.size) || 0,
    };
  }

  get stroke() {
    return this.confAttr.stroke;
  }

  set stroke(stroke) {
    this.conf.stroke = stroke;
  }

  get styleShadow() {
    const angle = this.confAttr.shadow?.angle !== undefined ? Number(this.confAttr.shadow?.angle) : 45;
    return {
      dropShadow: this.confAttr.shadow && this.confAttr.shadow?.color,
      dropShadowColor: this.confAttr.shadow?.color,
      dropShadowAlpha: Number(this.confAttr.shadow?.alpha) || 0,
      dropShadowBlur: this.px(this.confAttr.shadow?.blur) || 0,
      dropShadowDistance: this.px(this.confAttr.shadow?.offset) || 0,
      dropShadowAngle: angle * (Math.PI / 180),
    };
  }

  get padding() {
    return this.px(this.confAttr.padding, false);
  }

  set padding(padding) {
    this.conf.padding = this.vu(padding, this.confAttr.padding);
  }

  get shadow() {
    return this.confAttr.shadow;
  }

  set shadow(shadow) {
    this.conf.shadow = shadow;
  }

  get text() {
    return this.confAttr.text;
  }

  set text(text) {
    this.conf.text = text;
    this.display.text = text;
    // 文字更改之后，可能紧接着要设置cursorIndex，所以先updateText一下
    this.display.updateText(false); // force update
  }

  toJson(asTemplate=false) {
    const conf = super.toJson(asTemplate);
    if (asTemplate) {
      delete conf['height'];
      delete conf['viewWidth'];
      delete conf['viewHeight'];
      if (!this.wrap) delete conf['width'];
    }
    return conf;
  }

  px(val, needRound= true) {
    if (typeof(val) === 'string' && val.endsWith('%') && !isNaN(val.replace('%', ''))) {
      const res = this.fontSize * Number(val.replace('%', '')) * 0.01;
      return needRound? Math.round(res) : res;
    }
    return super.px(val);
  }

  vu(val, unitReferValue) {
    if (typeof(val) === 'string' && val.endsWith('%')) return val;
    const px = this.px(val);
    if (typeof(unitReferValue) === 'string' && unitReferValue.endsWith('%') && !isNaN(px)) {
      return `${Math.round(100 * (px / this.fontSize))}%`;
    } else {
      return super.vu(val, unitReferValue);
    }
  }

  /**
   * Functions for drawing images
   * @private
   */
  createDisplay() {
    let { text, fontSize } = this;
    this.display = new Text();
    this.display.text = text;
  }

  async getDisplay(time, opt) {
    const display = new Text();
    display.copyFromProxy(this.display);
    if (this.animations) {
      const absTimeInMs = ((opt.timing === 'rel' ? time + this.absStartTime : time) * 1000) >> 0;
      this.animations.apply(display, absTimeInMs);
    }
    return display;
  }

  /**
   * load font file
   * @return {Promise}
   * @public
   */
  async preProcessing() {
    if (this.confAttr.image && this.confAttr.image !== this.imageMat?.path) {
      if (this.imageMat) this.material.destroy();
      this.imageMat = new ImageMaterial({src: this.confAttr.image});
      await this.imageMat.init();
      this.image = this.imageMat.canvas;
    }

    if (!isBrowser) {
      if (!this.useFontFamily || this.useFontFamily.startsWith('http') || !fs.existsSync(this.useFontFamily)) {
        throw new Error(`Font not exists: ${this.useFontFamily}`);
      }
      try {
        await this.setFont(this.useFontFamily);
      } catch (e) {
        if (!this.useFontFamily.startsWith('http') && fs.existsSync(this.useFontFamily)) {
          fs.unlinkSync(this.useFontFamily);
          throw new Error(`Set font fail: ${this.useFontFamily}`);
        }
      }
      this.updateStyle();
      // 可能是因为regFont必须在创建Text之前，所以要先用proxyObj转一下
      const proxyObj = this.display;
      this.display = new Text();
      this.display.substitute(proxyObj);
      // display change, need reset!
      this.setChromaKey();
      this.setColor();
      this.display.updateText(false); // force update
      proxyObj.destroy();
    } else {
      await this.queuedFitSize('preProcessing');
    }
  }

  setColor() {
  }

  /**
   * Set text font file path
   * @param {string} font - text font file path
   * @public
   */
  async setFont(font) {
    // if (!isBrowser && font.startsWith('http')) return;
    return new Promise((resolve) => {
      CanvasUtil.setFont(font, fontFamily => {
        // this.setStyle({ fontFamily });
        this.font = { font, fontFamily };
        resolve();
      });
    })
  }

  /**
   * Set text style by object
   * @param {object} style - style by object
   * @public
   */
  setStyle(style) {
    if (style.image) style.fillImage = style.image;
    else if (style.color) style.fill = style.color;
    if (isArray(style.padding)) style.padding = style.padding[0];
    for (const [k, v] of Object.entries(style)) {
      // 必须过滤掉没有设置的，不然渲染会出错
      if (v === undefined) delete style[k];
    }
    // console.log('updateStyle', this.id, `${this.text}`, style);
    this.display.updateStyle(style);
    this.display.updateText(false); // force update
  }

  setWH(w, h) {
    let { width, height, fontSize } = this;
    if (width && height && w && h && fontSize) {
      if ((w / width).toFixed(6) === (h / height).toFixed(6)) {
        this.setConfRpx('fontSize', fontSize * (w / width));
      }
    }
    super.setWH(w, h);
  }

  fitSize(info) {
    this.queuedFitSize(info);
  }

  queuedFitSize(info) {
    return this.queue.enqueue(async () => {
      if (this.font?.fontFamily != this.useFontFamily) {
        if (!FONTS[this.useFontFamily]) {
          await this.setFont(this.useFontFamily);
          const fontFace = new FontFace(this.font.fontFamily, `url("${this.font.font}")`);
          const font = await fontFace.load();
          document.fonts.add(font);
          FONTS[this.useFontFamily] = this.font;
          await document.fonts.ready;
        } else {
          this.font = FONTS[this.useFontFamily];
        }
      }

      this.updateStyle();
    });
  }

  updateStyle() {
    const { fontSize, color, image, backgroundColor, wrap, align, lineHeight, styleStroke, styleShadow, letterSpacing, selectionBgColor, padding } = this;
    const wordWrapWidth = this.confAttr.width;
    const fontFamily = this.font?.fontFamily;
    const style = {
      selectionBgColor,
      fontFamily, fontSize, color, image, backgroundColor, align, lineHeight, letterSpacing, padding,
      wordWrapWidth, wordWrap: (wrap && wordWrapWidth > 0), breakWords: true, lineJoin: 'round', // 否则描边会有尖刺
      ...styleStroke, ...styleShadow
    }

    this.setStyle(style);
    // change as line breaks
    this.setConfRpx('height', this.display.height);
    if (!this.confAttr.width) {
      // 如果没有宽，就设置一下，避免之后一直变动
      this.setConfRpx('width', this.display.width);
    }

    this.setAlign();
  }

  setAlign(init=false) {
    const { align, valign } = this;
    const ax = ALIGN_MAP[align] !== undefined ? ALIGN_MAP[align] : 0.5;
    const ay = VALIGN_MAP[valign] !== undefined ? VALIGN_MAP[valign] : 0.5;
    if (this.anchorX != ax || this.anchorY != ay) {
      if (!init) {
        let { x, y, width, height } = this;
        x += (ax - this.anchorX) * width;
        y += (ay - this.anchorY) * height;
        this.setXY(x, y);
      }
      this.setAnchor(ax, ay);
    }
  }

  selectStart(point) {
    // 转换为对display的坐标
    const { dx, dy } = this.displayOffset;
    this.display.selectStart({ x: point.x - dx, y: point.y - dy });
  }

  selectEnd(point) {
    // 转换为对display的坐标
    const { dx, dy } = this.displayOffset;
    this.display.selectEnd({ x: point.x - dx, y: point.y - dy });
    this.creator().render();
  }

  selectMove({x: dx, y: dy}, withShift, withCtrl) {
    // console.log('selectMove', {dx, dy, withShift, withCtrl});
    this.display.selectMove(dx, dy, withShift, withCtrl);
    this.creator().render();
  }

  selectClean() {
    this.display.selectStart({ x: 0, y: 0 });
    this.display.selectEnd({ x: 0, y: 0 });
    this.creator().render();
  }

  delete() {
    return this.display.delete();
  }

  selection() {
    return this.display.selectionText();
  }

  input(text) {
    return this.display.input(text);
  }

  cursor() {
    let { x, y, height } = this.display.cursor();
    // 转换为对view的坐标
    const { dx, dy } = this.displayOffset;
    return { x: x + dx, y: y + dy, height };
  }

  get displayOffset() {
    const { x: ax, y: ay } = this.display.anchor;
    const { width: w, height: h } = this;
    const { width: dw, height: dh } = this.display;
    return { dx: (w - dw) * ax, dy: (h - dh) * ay };
  }

  destroy() {
    this.display.text = '';
    super.destroy();
  }
}

module.exports = FFText;
