'use strict';

const FFCon = require('./cons');
const CanvasUtil = require('../utils/canvas');
const { createCanvas, Sprite, Texture } = require('../../inkpaint/lib/index');

class FFCover extends FFCon {
  constructor(conf = {}) {
    super({ type: 'cover', ...conf });
  }

  get canvasEditNode() {
    return this.mask;
  }

  get audio() {
    return undefined;
  }

  async getPreview(time, opts) {
    return await super.getPreview(time, opts);
  }

  createDisplay() {
    super.createDisplay();
    // 背景主要用来撑开container画布，不然尺寸不对
    // todo: 如果不用container，直接sprite用会怎样？
    this.bgCanvas = createCanvas(this.canvasWidth, this.canvasHeight);
    if (this.background) this.display.removeChild(this.background);
    this.background = new Sprite(Texture.fromCanvas(this.bgCanvas));
    this.display.addChild(this.background);
  }

  show() {
    super.show();
    // parent必须在show之后才能拿到
    const parentDisplay = this.display.parent;

    // 在循环里addChild会改变children数组，所以拆开赋值
    for (const x of [...parentDisplay.children]) {
      if (x === this.display || x.zIndex > this.zIndex || x.isMask) continue;
      if (x.parent !== this.display) {
        this.display.addChild(x);
        x.locked = true; // lock
      }
    }
  }

  hide() {
    // parent必须在hide之前才能拿到
    const parentDisplay = this.display.parent;
    super.hide();
    // 在循环里addChild会改变children数组，所以拆开赋值
    for (const x of [...this.display.children]) {
      if (!x.locked) continue;
      parentDisplay.addChild(x);
      x.locked = false; // unlock
    }
  }
}

module.exports = FFCover;
