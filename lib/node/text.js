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
    return this.px(this.conf.fontSize);
  }

  set fontSize(size) {
    this.setConfRpx('fontSize', size);
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

  get stroke() {
    return this.conf.stroke;
  }

  set stroke(stroke) {
    this.conf.stroke = stroke;
  }

  get strokeThickness() {
    return this.px(this.conf.strokeThickness);
  }

  set strokeThickness(size) {
    this.setConfRpx('strokeThickness', size);
  }

  get text() {
    return this.conf.text;
  }

  set text(text) {
    this.conf.text = text;
    this.display.text = text;
  }

  /**
   * Functions for drawing images
   * @private
   */
  createDisplay() {
    let { text, fontSize } = this;
    this.display = new Text();
    this.display.text = text;
    this.display.updateStyle({ fontSize });
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
    if (!isBrowser) {
      this.updateStyle();
    } else {
      await this.queuedFitSize('preProcessing');
    }
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
    if (style.color) style.fill = style.color;
    if (isArray(style.padding)) style.padding = style.padding[0];
    for (const [k, v] of Object.entries(style)) {
      // 必须过滤掉没有设置的，不然渲染会出错
      if (v === undefined) delete style[k];
    }
    this.display.updateStyle(style);
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
      // change as line breaks
      this.setConfRpx('height', this.display.height);
      if (!this.conf.width) {
        // 如果没有宽，就设置一下，避免之后一直变动
        this.setConfRpx('width', this.display.width);
      }

      this.setAlign();
    });
  }

  updateStyle() {
    const { width, fontSize, color, stroke, strokeThickness, backgroundColor, wrap, align } = this;
    const fontFamily = this.font?.fontFamily;
    const style = {
      fontFamily, fontSize, color, stroke, strokeThickness, backgroundColor, align,
      wordWrapWidth: width, wordWrap: wrap, breakWords: true,
    }
    this.setStyle(style);
    this.display.updateText(true);
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
