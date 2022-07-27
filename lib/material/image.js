'use strict';

/**
 * ImageMaterial
 * @class
 */

const Material = require('./material');
const { isBrowser } = require("browser-or-node");
const { getRemote } = require("../utils/xhr");
const { getPixels } = require('../utils/utils');
const { utils, createCanvas, createImageData } = require('../../inkpaint/lib/index');

class ImageMaterial extends Material {

  async init() {
    if (!this.path) return;
    let src = this.path;
    if (isBrowser && src.startsWith('http')) {
      const res = await getRemote(src, this.creator.uuid);
      src = URL.createObjectURL(res.data);
    }
    const { pixels } = await getPixels(src);
    if (!pixels || !pixels.shape || pixels.shape.length < 3) return;
    let shape = pixels.shape;
    if (shape.length > 3) shape = shape.slice(shape.length - 3);
    const width = this.info.width = shape[0];
    const height = this.info.height = shape[1];
    const buffer = new Uint8ClampedArray(pixels.data.buffer).slice(0, width*height*4);
    // this.imageData = new ImageData(buffer, width, height);
    this.imageData = createImageData(buffer, width, height);
    this.canvas = this.initCanvas(width, height);
    this.canvasContext = this.canvas.getContext('2d');
    this.drawCanvas(this.imageData, width, height);
  }

  drawCanvas(img, width, height) {
    if (!this.canvasContext) return; // may destroyed
    if (this.conf.blur && this.creator) {
      const blur = this.creator.px(this.conf.blur);
      if (blur > 0) this.canvasContext.filter = `blur(${blur}px)`;
    }
    this.canvasContext.drawImage(this.getImage(img), 0, 0, width, height);
    return this.canvas;
  }

  getImage(imgData) {
    if (imgData.constructor.name !== 'ImageData') return imgData;
    const canvas = createCanvas(imgData.width, imgData.height);
    canvas.getContext('2d').putImageData(imgData, 0, 0);
    return canvas;
  }

  initCanvas(w, h) {
    return createCanvas(w, h);
  }

  clearCanvas() {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getImageData(imgSource) {
    const { width, height } = this.info;
    if (!this.tmpCanvas || !this.tmpCanvasContext) {
      this.tmpCanvas = this.initCanvas(width, height);
      this.tmpCanvasContext = this.tmpCanvas.getContext('2d');
    }
    this.tmpCanvasContext.drawImage(imgSource, 0, 0, width, height);
    return this.tmpCanvasContext.getImageData(0, 0, width, height);
  }

  width() {
    // todo: 处理 crop rect 逻辑
    return this.info.width || 0;
  }

  height() {
    return this.info.height || 0;
  }

  destroy() {
    super.destroy();
    if (this.tmpCanvas) {
      this.tmpCanvas = null;
      this.tmpCanvasContext = null;
    }
  }
}

module.exports = ImageMaterial;