'use strict';

const { getRemote } = require("../utils/xhr");
const Queue = require("../utils/queue");
const VideoMaterial = require('./video');
const { isBrowser } = require("browser-or-node");
const { genUuid, nodeRequire } = require("../utils/utils");
const { canvasRGBA } = require('stackblur-canvas');
const { createCanvas, Image: NodeImage } = require("../../inkpaint/lib");

class MixinMaterial extends VideoMaterial {
  constructor(conf) {
    super(conf);
    this.OFFSET_TIME = 0;
    const { width, height } = conf;
    this.msgs = {};
    this.queue = new Queue();
    // 需要转一下，然后resize
    this.canvas = this.initCanvas(1, 1);
    this.canvasContext = this.canvas.getContext('2d');
    // const debugCtr = document.getElementById('mira-player-debug-container');
    // if (!debugCtr) return; // for debug view
    // debugCtr.appendChild(this.canvas);
  }

  async init(opts) {
    const { fps } = opts;
    if (isBrowser) {
      let url;
      if (this.conf.mixin.startsWith('http') || this.conf.mixin.startsWith('blob:http')) {
        url = this.conf.mixin;
      } else {
        url = new URL(`./${this.conf.mixin}.js`, this.conf.mns || this.creator.getConf('mns'));
      }
      this.worker = new Worker(url);
      this.worker.addEventListener('message', async (e) => {
        if (typeof(e.data) === 'object' && e.data.msgid) {
          if (this.msgs[e.data.msgid]) {
            const callback = this.msgs[e.data.msgid];
            callback(e.data.resp);
            delete this.msgs[e.data.msgid];
          } else if (['getImageData'].includes(e.data.method)) {
            const func = this[e.data.method];
            const resp = await func.call(this, e.data);
            this.worker.postMessage({resp, msgid: e.data.msgid});
          }
        }
      });
    } else {
      const Mixin = nodeRequire(`../../mixin/src/${this.conf.mixin}.js`);
      this.worker = new Mixin();
      this.worker.execCallback = async (method, args) => {
        if (['getImageData'].includes(method)) {
          return await this[method](args);
        }
      };
    }
    const res = await this.exec(
      { method: 'init', fps, ...this.conf },
      Number(this.conf.timeout) || 30*1000);
    this.info = res || {};
    const { width=0, height=0, duration=1, speed, loop } = this.info;
    if (width && height) this.resize(width, height);
    this.length = Number(duration) || 1;
    if (loop !== undefined) this.loop = loop;
    if (speed > 0) this.setSpeed(speed);
  }

  async getImageData({src}) {
    if (!src) return;
    return new Promise((resolve, reject) => {
      const image = isBrowser ? new Image() : new NodeImage();
      image.onload = () => {
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        resolve(imageData);
      }
      image.onerror = (e) => resolve();
      image.src = src;
    });
  }

  async update(conf) {
    const res = await this.exec({ method: 'update', ...conf }, 30*1000);
    // console.log('mat.update', conf, res);
    this.info = {...this.info, ...(res || {})};
    const { width=0, height=0, duration=1, speed, loop } = this.info;
    if (width && height) this.resize(width, height);
    this.length = Number(duration) || 1;
    if (loop !== undefined) this.loop = loop;
    if (speed > 0) this.setSpeed(speed);
  }

  exec(msg, timeout=10*1000, args = []) {
    const ss = Date.now();
    return new Promise(async (resolve, reject) => {
      // set callback
      if (isBrowser) {
        const msgid = genUuid();
        this.msgs[msgid] = (data) => {
          // console.log('on resp', {req: msg, resp: data, time: Date.now() - ss});
          if (typeof(data) === 'object' && data.err) return reject(data);
          resolve(data);
        }
        // call
        this.worker.postMessage({...msg, msgid}, args);
        // timeout
        setTimeout(() => {
          delete this.msgs[msgid];
          reject();
        }, timeout);
      } else {
        const resp = await this.worker[msg.method](msg);
        // console.log('on resp', {req: msg, resp, time: Date.now() - ss});
        resolve(resp);
      }
    });
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    // 需要从canvas上重新取一下, 可能不完全跟w/h一样
    this.info.width = this.canvas.width;
    this.info.height = this.canvas.height;
  }

  async getFrameByTime(time, delta) {
    return await this.queuedGetFrameByTime(time, delta);
  }

  async queuedGetFrameByTime(time, delta, canvas=null) {
    return new Promise(async (resolve, reject) => {
      this.queue.enqueue(async () => {
        const image = await this.exec({ method: 'draw', time, delta });
        resolve(this.render(image, canvas));
      });
    });
  }

  render(image, canvas=null) {
    if (!canvas) canvas = this.canvas;
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    // ctx.drawImage(image, 0, 0, width, height);
    this.drawCanvas(image, width, height, canvas);
    // 这里不能return，因为是走的canvas直接怼进sprite里，不然烧制会有问题
    // return canvas;
  }

  destroy() {
    super.destroy();
    this.workerCtx = null;
    if (this.queue) this.queue.destroy();
    if (this.updateQueue) this.updateQueue.destroy();
    this.queue = null;
    this.updateQueue = null;
    this.msgs = null;
    if (isBrowser) {
      if (this.worker) this.worker.terminate();
      this.worker = null;
    }
  }
}

module.exports = MixinMaterial;
