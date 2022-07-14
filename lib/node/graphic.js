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
    const { shape, color="#FFF", opacity=1, width, height } = this.conf;
    this.graph.beginFill(RGB2HEX(STR2RGB(color, '#FFF')), opacity);
    if (Array.isArray(shape)) {
      shape.map(s => this.draw(s));
    } else {
      this.draw(shape);
    }

    const renderer = this.creator().app.renderer;
    const texture = this.graph.generateTexture(renderer);

    const blur = Number(this.conf.blur);
    if (this.conf.asMask && blur) {
      // todo: 用更好的方式实现mask模糊 (羽化)
      const gl = texture.baseTexture._glRenderTargets[0].frameBuffer.gl;
      const [w, h] = [texture.baseTexture.width, texture.baseTexture.height];
      const pixels = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const imgData = createImageData(new Uint8ClampedArray(pixels), w, h);
      const canvas = createCanvas(w, h);
      const ctx = canvas.getContext('2d');
      ctx.putImageData(imgData, 0, 0);

      // todo: 只有drawImage加fitler才有效
      const canvas2 = createCanvas(w + 4 * blur, h + 4 * blur);
      const ctx2 = canvas2.getContext('2d');
      ctx2.filter = `blur(${blur}px)`;
      // 留下2倍blur的空白边距，避免mask的时候出现边缘延伸
      ctx2.drawImage(canvas, 2 * blur, 2 * blur, w, h);

      this.display = new Sprite(Texture.fromCanvas(canvas2));
    } else {
      this.display = new Sprite(texture);
      if (blur) this.display.blur = blur;
    }
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
    const { x, y, width, height } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawRect(this.px(x), this.px(y), this.px(width), this.px(height));
  }

  roundedrect(conf) {
    const { x, y, width, height, radius } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawRoundedRect(this.px(x), this.px(y), this.px(width), this.px(height), this.px(radius));
  }

  circle(conf) {
    let { x, y, radius } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawCircle(this.px(x), this.px(y), this.px(radius));
  }

  ellipse(conf) {
    const { x, y, width, height } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawEllipse(this.px(x), this.px(y), this.px(width), this.px(height));
  }

  polygon(conf) {
    const { points } = conf || this.conf;
    this.graph.drawPolygon(points);
  }

  star(conf) {
    const { x, y, points, radius, innerRadius, rotation } = conf || this.conf;
    if (!conf) x = 0, y = 0;
    this.graph.drawStar(this.px(x), this.px(y), points, this.px(radius), this.px(innerRadius), rotation);
  }
}

module.exports = FFGraphic;