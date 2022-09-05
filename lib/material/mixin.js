'use strict';

const { getRemote } = require("../utils/xhr");
const Queue = require("../utils/queue");
const VideoMaterial = require('./video');
const { isBrowser } = require("browser-or-node");

class MixinMaterial extends VideoMaterial {
  constructor(conf) {
    super(conf);
    this.OFFSET_TIME = 0;
    const { width, height } = conf;
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
        url = new URL(`./${this.conf.mixin}.js`, this.creator.getConf('mns'));
      }
      this.worker = new Worker(url);
    } else {
      const Mixin = require(`../../mixin/src/${this.conf.mixin}.js`);
      this.worker = new Mixin();
    }
    const res = await this.exec(
      { method: 'init', fps, ...this.conf }, 
      Number(this.conf.timeout) || 30*1000); // , [canvas]
    this.info = res || {};
    const { width=0, height=0, duration=1, speed, loop } = this.info;
    if (width && height) this.resize(width, height);
    this.length = Number(duration) || 1;
    if (loop !== undefined) this.loop = loop;
    if (speed > 0) this.setSpeed(speed);
  }

  exec(msg, timeout=10*1000, args = []) {
    const ss = Date.now();
    return new Promise(async (resolve, reject) => {
      const controller = new AbortController();
      // set callback
      if (isBrowser) {
        this.worker.addEventListener('message', e => {
          // console.log('on resp', {req: msg, resp: e.data, time: Date.now() - ss});
          if (typeof(e.data) === 'object' && e.data.err) {
            return reject(e.data);
          }
          resolve(e.data);
        }, { once: true, signal: controller.signal });
        // call
        this.worker.postMessage(msg, args);
        // timeout
        setTimeout(() => {
          reject();
          controller.abort();
        }, timeout);
      } else {
        const resp = await this.worker[msg.method](msg);
        // console.log('on resp', {req: msg, resp, time: Date.now() - ss});
        resolve(resp);
      }
    });
  }

  resize(w, h) {
    // console.log('resize', {w, h});
    this.canvas.width = this.info.width = w;
    this.canvas.height = this.info.height = h;
    // todo: re-render
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
    ctx.drawImage(image, 0, 0, width, height);
    // 这里不能return，因为是走的canvas直接怼进sprite里，不然烧制会有问题
    // return canvas;
  }

  destroy() {
    super.destroy();
    this.workerCtx = null;
    if (this.queue) this.queue.destroy();
    this.queue = null;
  }
}

module.exports = MixinMaterial;