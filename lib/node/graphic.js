'use strict';

const FFNode = require('./node');
const { createCanvas, createImageData, Texture, Graphics, Sprite, RenderTexture, CanvasRenderer } = require('../../inkpaint/lib/index');
const { STR2RGB, RGB2HEX } = require('../utils/color');

class FFGraphic extends FFNode {
  constructor(conf = {}) {
    super({ type: 'graph', ...conf });
  }

  createDisplay() {
    this.graph = new Graphics();
    const { shape, color="#FFF", opacity=1 } = this.conf;
    this.graph.beginFill(RGB2HEX(STR2RGB(color, '#FFF')), opacity);
    if (Array.isArray(shape)) {
      shape.map(s => this.draw(s));
    } else {
      this.draw(shape);
    }

    this.display = this.getSprite();
  }

  async getDisplay(time, opt) {
    const display = this.getSprite();
    display.copyFromProxy(this.display);
    if (this.animations) {
      const absTimeInMs = ((opt.timing === 'rel' ? time + this.absStartTime : time) * 1000) >> 0;
      this.animations.apply(display, absTimeInMs);
    }
    return display;
  }

  getSprite() {
    const blur = Number(this.conf.blur);
    const renderer = this.creator().app.renderer;
    const r = 2; // resolution 2x 避免锯齿
    const texture = this.graph.generateTexture(renderer, 0, r);

    const gl = texture.baseTexture._glRenderTargets[0].frameBuffer.gl;
    const [w, h] = [texture.baseTexture.width * r, texture.baseTexture.height * r];
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const imgData = createImageData(new Uint8ClampedArray(pixels), w, h);
    let canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imgData, 0, 0);

    if (blur) {
      // 留下2倍blur的空白边距，避免羽化蒙版时候出现明显边缘
      const margin = 2 * blur;
      const canvas2 = createCanvas(w + 2 * margin, h + 2 * margin);
      const ctx2 = canvas2.getContext('2d');
      // todo: 只有drawImage加fitler才有效
      ctx2.filter = `blur(${blur}px)`;
      ctx2.drawImage(canvas, margin, margin, w, h);
      canvas = canvas2;
    }

    const sprite = new Sprite(Texture.fromCanvas(canvas));
    return sprite;
  }

  draw(shape) {
    let func = null;
    let args = [];
    if (typeof(shape) === 'string') {
      func = this[shape];
    } else if (typeof(shape) === 'object') {
      func = this[shape.shape];
      args.push(shape);
      const { color, opacity=(this.conf.opacity || 1) } = shape;
      const rgb = STR2RGB(color);
      if (!isNaN(rgb[0])) this.graph.beginFill(RGB2HEX(rgb), opacity);
    }
    if (func && typeof func === 'function') func.call(this, ...args);
  }

  rect(conf) {
    let { x, y, width, height } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawRect(this.px(x), this.px(y), this.px(width), this.px(height));
  }

  roundedrect(conf) {
    let { x, y, width, height, radius } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawRoundedRect(this.px(x), this.px(y), this.px(width), this.px(height), this.px(radius));
  }

  circle(conf) {
    let { x, y, radius } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawCircle(this.px(x), this.px(y), this.px(radius));
  }

  ellipse(conf) {
    let { x, y, width, height } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawEllipse(this.px(x), this.px(y), this.px(width), this.px(height));
  }

  polygon(conf) {
    let { points } = conf || this.conf;
    this.graph.drawPolygon(points);
  }

  star(conf) {
    let { x, y, points, radius, innerRadius, rotation } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawStar(this.px(x), this.px(y), points, this.px(radius), this.px(innerRadius), rotation);
  }

  async drawing(timeInMs, nextDeltaInMS) {
    let texture = await super.drawing(timeInMs, nextDeltaInMS);
    let { width, height } = this;
    // 根据宽高适配
    if (this.display.width !== width || this.display.height !== height) {
      this.display.attr({ width, height });
    }
    return texture;
  }
}

module.exports = FFGraphic;