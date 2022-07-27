'use strict';

/**
 * LottieMaterial
 * 
 * Lottie-node is an API for runnig Lottie with the canvas renderer in Node.js, with the help of node-canvas.
 * This is intended for rendering Lottie animations to images or video.

 * #### Note
 *     https://github.com/drawcall/lottie-node
 * 
 */

const lottie = require('lottie-nodejs');
const { getRemote } = require("../utils/xhr");
const Queue = require("../utils/queue");
const VideoMaterial = require('./video');
const { createCanvas, Canvas, Image: _image } = require('../../inkpaint/lib/index');
const { isBrowser } = require("browser-or-node");

class LottieMaterial extends VideoMaterial {
  constructor(conf) {
    super(conf);
    this.queue = new Queue();
  }

  async init(opts) {
    const { fps } = opts;
    this.fps = fps; // target fps

    const res = await getRemote(this.path, this.creator.uuid);
    const json = await res.data.text();
    const animationData = JSON.parse(json);

    let { w, h, nm, fr, ip, op } = animationData;
    this.info.name = nm;
    this.frames = op - ip;
    this.length = this.info.duration = this.frames / fr;
    this.info.oriWidth = this.info.width = w;
    this.info.oriHeight = this.info.height = h;

    this.container = this.initCanvas(w, h);
    if (isBrowser) lottie.setCanvas({ Canvas, Image });
    else lottie.setCanvas({ Canvas, Image: _image });
    this.ani = lottie.loadAnimation({ container: this.container, animationData }, true); // isLoadNow = true

    // 需要转一下，然后resize
    this.canvas = this.initCanvas(w, h);
    this.canvasContext = this.canvas.getContext('2d');
    // document.getElementById('mira-player-debug-container1')?.append(this.container);
  }

  resize(w, h) {
    // 在scale-down(缩小)的时候，可能会导致渲染alpha变化，所以需要resize
    this.canvas.width = this.info.width = w;
    this.canvas.height = this.info.height = h;
    // redraw
    this.render();
  }

  async getFrameByTime(time) {
    return await this.queuedGetFrameByTime(time);
  }

  async queuedGetFrameByTime(time, canvas=null) {
    return new Promise(async (resolve, reject) => {
      this.queue.enqueue(async () => {
        this.ani.goToAndStop(time * 1000, false); // isFrame = false
        this.render(canvas);
        resolve();
      });
    });
  }

  render(canvas) {
    if (!canvas) canvas = this.canvas;
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(this.container, 0, 0, width, height);
  }

  /**
   * Modify the Image in the lottie json data.
   * @param {number|string} id - id of the material
   * @param {string} path - new material path
   * @param {boolean} absolute - absolute path or relative path
   * @public
   */
   replaceAsset(id, path, absolute = true) {
    this.ani.replaceAsset(id, path, absolute);
  }

  /**
   * Modify the Text in the lottie json data.
   * @param {string} target - the target value
   * @param {string} path - new txt value
   * @public
   */
  replaceText(target, txt) {
    this.ani.replaceText(target, txt);
  }

  /**
   * Find a specific layer element
   * @param {string} key - the key value
   * @public
   */
  findElements(key) {
    return this.ani.findElements(key);
  }

  /**
   * get lottie-api instance
   * @public
   */
  getApi() {
    return this.ani.api;
  }

  destroy() {
    super.destroy();
    if (this.ani) this.ani.destroy();
    this.ani = null;
    this.container = null;
    if (this.queue) this.queue.destroy();
    this.queue = null;
  }
}

module.exports = LottieMaterial;