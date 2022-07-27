'use strict';

/**
 * GifMaterial
 * @class
 */

const { isBrowser } = require("browser-or-node");
const VideoMaterial = require('./video');
const Utils = require('../utils/utils');
const { getRemote } = require("../utils/xhr");
const { createImageData } = require('../../inkpaint/lib/index');

class GifMaterial extends VideoMaterial {

  async init(opts) {
    const { fps } = opts;
    this.disposal = 2; // use 2 as default
    this.fps = fps; // target fps
    let res;
    let src = this.path;
    if (isBrowser && src.startsWith('http')) {
      res = await getRemote(src, this.creator.uuid);
      src = URL.createObjectURL(res.data);
    }
    try {
      res = await Utils.getPixels(this.path, this.conf.srcType || '.GIF');
    } catch (e) {
      res = await Utils.getPixels(this.path);
    }
    const { pixels, frameInfo } = res;
    let offset = 1;
    if (!frameInfo || !frameInfo.length) {
      if (pixels && pixels.shape.length === 3) { // single frame
        this.frameInfo = [{ delay: Math.pow(10, 9), disposal:1 }]; // mock frame info
        offset = 0;
      } else {
        throw new Error('Invalid gif frame info: ', frameInfo);
      }
    } else {
      this.frameInfo = frameInfo;
    }
    const imageData = [];
    const width = this.info.width = pixels.shape[offset + 0];
    const height = this.info.height = pixels.shape[offset + 1];
    const imgDataSize = width * height * pixels.shape[offset + 2];
    for (let i = 0; i < this.frameInfo.length; i++) {
      this.frameInfo[i].delay = this.frameInfo[i].delay / 100; // delay是0.01单位的int，这里统一转成秒
      const frame = pixels.data.slice(i*imgDataSize, (i+1)*imgDataSize);
      const imgData = createImageData(new Uint8ClampedArray(frame.buffer), width, height);
      imageData.push(imgData);
    }
    this.length = this.info.duration = this.frameInfo.reduce((a,x) => a+x.delay, 0);
    this.frames = this.frameInfo.length;
    this.canvas = this.initCanvas(width, height);
    this.canvasContext = this.canvas.getContext('2d');

    this.imageData = [];
    for (let i = 0; i < this.frameInfo.length; i++) {
      let disposal = this.frameInfo[i].disposal > 2 ? 2 : this.frameInfo[i].disposal;
      // browser的imageData存canvas，渲染效率更高，避免播放卡顿
      const canvas = this.initCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (disposal === 1) { // gif.disposal=1 不清空，覆盖
        this.drawCanvas(imageData[i], width, height);
        if (isBrowser) ctx.drawImage(this.canvas, 0, 0, width, height);
        else this.imageData.push(this.canvasContext.getImageData(0, 0, width, height));
      } else {
        if (isBrowser) ctx.putImageData(imageData[i], 0, 0);
        else this.imageData.push(imageData[i]);
      }
      if (isBrowser) this.imageData.push(canvas);
    }
  }

  getFrame(index) {
    const i = index < this.frames ? index : this.frames - 1; // 保持最后一帧
    return this.imageData[i];
  }

  getIndex(time) {
    let tt = 0, ii = 0;
    for (let i = 0; i < this.frameInfo.length; i++) {
      tt += (this.frameInfo[i].delay / this.speed);
      if (tt > time) break;
      ii = i;
    }
    return ii;
  }

  async getFrameByTime(time) {
    const { width, height } = this.canvas || {};
    this.clearCanvas(); // 清空画布(上一帧)
    const imgData = this.getFrame(this.getIndex(time));
    if (imgData) this.drawCanvas(imgData, width, height);
    return imgData;
  }

  destroy() {
    super.destroy();
    this.imageData = null;
    this.frameInfo = null;
  }
}

module.exports = GifMaterial;