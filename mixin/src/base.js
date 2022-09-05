'use strict';
const { isWebWorker } = require("browser-or-node");
const { getRemote } = require("../../lib/utils/xhr");

class Mixin {
  constructor() {
    this.MAX_TIME = 99999;
    if (isWebWorker) this.initWebWorker();
    else this.initNode();
  }

  initWebWorker() {
    // canvas用来传入mixin中绘制
    // drawCanvas用来中转渲染过程的图像，避免异步被清掉
    this.canvas = new OffscreenCanvas(1, 1);
    this.drawCanvas = new OffscreenCanvas(1, 1);
    this.ctx = this.drawCanvas.getContext('2d');
    this.klassHolder = { };
    this.createCanvas = (w, h) => new OffscreenCanvas(w, h);
  }

  initNode() {
    const { nodeRequire } = require('../../lib/utils/utils');
    const { createCanvas, Canvas, Image } = nodeRequire('../../inkpaint/lib/index');
    this.canvas = createCanvas(1, 1);
    this.drawCanvas = createCanvas(1, 1);
    this.ctx = this.drawCanvas.getContext('2d');
    this.klassHolder = { Canvas, Image };
    this.createCanvas = createCanvas;
  }

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
    this.conf = conf;
    // override!
    return { width: 1, height: 1, duration: 1 };
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.drawCanvas.width = w;
    this.drawCanvas.height = h;
  }

  async render(time, delta) {
    // override!
  }

  async draw({ time, delta }) {
    await this.render(time, delta);
    const { width, height } = this;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(this.canvas, 0, 0, width, height);
    if (!isWebWorker) return this.drawCanvas;
    return this.drawCanvas.transferToImageBitmap();
  }

  start() {
    addEventListener('message', async (e) => {
      if (typeof(e.data) !== 'object' || !e.data.method) {
        return postMessage({ err: `invalid request!` });
      }

      const func = this[e.data.method];
      if (!func || typeof func !== 'function') {
        return postMessage({ err: `method not found: ${e.data.method}` });
      }

      const resp = await func.call(this, e.data);
      postMessage(resp);
    });
  }

  destroy() {
    this.ctx = null;
    this.drawCanvas = null;
    this.canvas = null;
    this.conf = null;
  }
}

module.exports = Mixin;