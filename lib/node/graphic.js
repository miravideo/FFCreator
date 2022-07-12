'use strict';

const FFNode = require('./node');
const { createCanvas, Graphics, Sprite, RenderTexture } = require('../../inkpaint/lib/index');
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
    this.display = new Sprite(texture);
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