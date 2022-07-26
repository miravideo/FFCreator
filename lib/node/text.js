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
    if (!conf.text && conf.content?.innerHTML) {
      // 考虑到xml转义中可能会丢失\n等信息，所以也接受用innerHTML的形式传入文本
      conf.text = conf.content.innerHTML;
    }
    super({ type: 'text', ...conf });
    this.queue = new Queue();
    this.setAlign(true);

    // reset rpx
    const keys = ['fontSize', 'letterSpacing', 'lineHeight', 'letterSpacing'];
    for (const key of keys) {
      if (conf[key]) this[key] = conf[key];
    }

    if (conf.stroke?.size) this.conf.stroke.size = this.vu(conf.stroke?.size, '1%');
    if (conf.shadow?.blur) this.conf.shadow.blur = this.vu(conf.shadow?.blur, '1%');
    if (conf.shadow?.offset) this.conf.shadow.offset = this.vu(conf.shadow?.offset, '1%');
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
    return !!this.conf.wrap;
  }

  set wrap(wrap) {
    this.conf.wrap = !!wrap;
  }

  get useFontFamily() {
    return this.cachedFontFamily || this.conf.fontFamily;
  }

  get fontFamily() {
    return this.conf.fontFamily;
  }

  set fontFamily(fontFamily) {
    this.conf.fontFamily = fontFamily;
  }

  get fontSize() {
    return super.px(this.conf.fontSize);
  }

  set fontSize(size) {
    this.conf.fontSize = super.vu(size, this.conf.fontSize);
  }

  get letterSpacing() {
    let lh = this.conf.letterSpacing || '0%';
    if (lh.endsWith('%') && !isNaN(lh.replace('%', ''))) {
      return this.fontSize * Number(lh.replace('%', '')) * 0.01;
    }
    return this.px(this.conf.letterSpacing);
  }

  set letterSpacing(letterSpacing) {
    this.conf.letterSpacing = this.vu(letterSpacing, this.conf.letterSpacing || '0%');
  }

  get lineHeight() {
    let lh = this.conf.lineHeight || '150%';
    if (lh.endsWith('%') && !isNaN(lh.replace('%', ''))) {
      return this.fontSize * Number(lh.replace('%', '')) * 0.01;
    }
    return this.px(this.conf.lineHeight);
  }

  set lineHeight(lineHeight) {
    this.conf.lineHeight = this.vu(lineHeight, this.conf.lineHeight || '150%');
  }

  get align() {
    return this.conf.align || 'center';
  }

  set align(align) {
    this.conf.align = align;
  }

  get valign() {
    return this.conf.valign || 'center';
  }

  set valign(valign) {
    this.conf.valign = valign;
  }

  get color() {
    return this.conf.color || '#FFFFFF';
  }

  set color(color) {
    this.conf.color = color;
  }

  get backgroundColor() {
    return this.conf.backgroundColor;
  }

  set backgroundColor(color) {
    this.conf.backgroundColor = color;
  }

  get styleStroke() {
    return {
      stroke: this.conf.stroke?.color,
      strokeThickness: this.px(this.conf.stroke?.size) || 0,
    };
  }

  get stroke() {
    return this.conf.stroke;
  }

  set stroke(stroke) {
    this.conf.stroke = stroke;
  }

  get styleShadow() {
    const angle = this.conf.shadow?.angle !== undefined ? Number(this.conf.shadow?.angle) : 45;
    return {
      dropShadow: this.conf.shadow && this.conf.shadow?.color,
      dropShadowColor: this.conf.shadow?.color,
      dropShadowAlpha: Number(this.conf.shadow?.alpha) || 0,
      dropShadowBlur: this.px(this.conf.shadow?.blur) || 0,
      dropShadowDistance: this.px(this.conf.shadow?.offset) || 0,
      dropShadowAngle: angle * (Math.PI / 180),
    };
  }

  get shadow() {
    return this.conf.shadow;
  }

  set shadow(shadow) {
    this.conf.shadow = shadow;
  }

  get text() {
    return this.conf.text;
  }

  set text(text) {
    this.conf.text = text;
    this.display.text = text;
  }

  px(val) {
    if (typeof(val) === 'string' && val.endsWith('%') && !isNaN(val.replace('%', ''))) {
      return Math.round(this.fontSize * Number(val.replace('%', '')) * 0.01);
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
    if (this.conf.image && this.conf.image !== this.imageMat?.path) {
      if (this.imageMat) this.material.destroy();
      this.imageMat = new ImageMaterial({src: this.conf.image});
      await this.imageMat.init();
      this.image = this.imageMat.canvas;
    }

    if (!isBrowser) {
      if (this.useFontFamily.startsWith('http') || !fs.existsSync(this.useFontFamily)) {
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
    const { fontSize, color, image, backgroundColor, wrap, align, lineHeight, styleStroke, styleShadow, letterSpacing } = this;
    const wordWrapWidth = this.px(this.conf.width);
    const fontFamily = this.font?.fontFamily;
    const style = {
      fontFamily, fontSize, color, image, backgroundColor, align, lineHeight, letterSpacing,
      wordWrapWidth, wordWrap: (wrap && wordWrapWidth > 0), breakWords: true, lineJoin: 'round', // 否则描边会有尖刺
      ...styleStroke, ...styleShadow
    }

    this.setStyle(style);
    // change as line breaks
    this.setConfRpx('height', this.display.height);
    if (!this.conf.width) {
      // 如果没有宽，就设置一下，避免之后一直变动
      this.setConfRpx('width', this.display.width);
    }

    // node-canvas的字体大小渲染跟浏览器并不一致，这里保存下前端渲染的参数，矫正后端
    if (isBrowser) {
      this.conf.viewWidth = this.vu(this.display.width, '0%');
      this.conf.viewHeight = this.vu(this.display.height, '0%');
    } else if (this.conf.viewWidth && this.conf.viewHeight) {
      const x = this.px(this.conf.viewWidth) / this.display.width;
      const y = this.px(this.conf.viewHeight) / this.display.height;
      this.display.scale = { x, y };
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

  destroy() {
    this.display.text = '';
    super.destroy();
  }
}

module.exports = FFText;
