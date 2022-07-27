'use strict';

const Queue = require("./queue");
const { genUuid } = require("./utils");
const { isBrowser } = require("browser-or-node");
const { isUA } = require('../utils/utils');

const POOL_DEFAULT = 'default';
const POOL_PREVIEW = 'preview';
const VPOOL = { [POOL_DEFAULT]: [], [POOL_PREVIEW]: [] };
if (global) global.MIRAP_VPOOL = VPOOL;

const VQ = new Queue();
const VSIZE = 300; // todo: 好像这个尺寸并不影响渲染清晰度，默认300先
const PREVIEW_LIMIT = 2;

class VideoHolder {

  constructor(src, cid, userId=null) {
    this.loaded = false;
    this.uses = {};
    this.cid = cid;
    this.id = genUuid();
    if (src instanceof VideoHolder) {
      if (src.loaded) {
        this.url = src.url;
        this.info = src.info;
        this.$video = src.$video.cloneNode(false);
        this.loaded = true;
      } else {
        src = src.url;
      }
    }
    if (!this.loaded && typeof(src) === 'string') {
      this.$video = this.createVideo(src);
      this.url = src;
    }
    if (!this.url) {
      throw new Error(`VideoHolder.create with src error: ${src}`);
    }
    this.assignTo(userId);
  }

  connectGainNode() {
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(this.$video);
    this.gainNode = ctx.createGain();
    source.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);
  }

  setVolume(volume) {
    if (isUA('chrome')) {
      if (!this.gainNode) this.connectGainNode();
      this.gainNode.gain.value = volume;
    } else { // 很多浏览器不支持声音变大
      this.$video.volume = Math.min(1, volume);
    }
  }

  assignTo(userId) {
    if (!userId) return;
    this.userId = userId;
    if (!this.uses[userId]) this.uses[userId] = 0;
    this.uses[userId]++;
    if (!this.createBy) this.createBy = userId;
  }

  createVideo(src) {
    if (!isBrowser) return { src };
    const video = document.createElement('video');
    video.playsinline = true; // for iOS
    video.crossOrigin = 'Anonymous'; // 必须设置，不然可能*污染*canvas
    video.src = src;
    video.id = this.id;
    video.width = VSIZE;
    video.height = VSIZE;
    const debugCtr = document.getElementById('mira-player-debug-container');
    if (debugCtr) { // for debug view
      video.controls = "controls";
      video.style = "background:#000";
      debugCtr.appendChild(video);
    }
    return video;
  }

  release() {
    this.userId = null;
  }

  getInfo() {
    return new Promise((resolve, reject) => {
      if (this.loaded) return this.info ? resolve(this.info) : reject();
      this.metaCb = (e) => {
        this.loaded = true;
        if (!this.$video) return reject();
        const { duration, videoWidth, videoHeight } = this.$video;
        this.info = { width: videoWidth, height: videoHeight, duration };
        resolve(this.info);
      };
      this.errorCb = (e) => {
        this.loaded = true;
        reject();
      }
      this.$video.addEventListener('loadedmetadata', this.metaCb);
      this.$video.addEventListener('error', this.errorCb);
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (this.loaded) return;
        // this.loaded = true;
        reject();
      }, 60000); // 60s timeout
    });
  }

  destroy() {
    if (this.$video) {
      this.metaCb && this.$video.removeEventListener('loadedmetadata', this.metaCb);
      this.errorCb && this.$video.removeEventListener('error', this.errorCb);
      this.metaCb = null;
      this.errorCb = null;
      // cancel request
      this.$video.src = '';
      this.$video.srcObject = null;
      this.$video.remove();
    }
    if (this.timeout) clearTimeout(this.timeout);
    this.$video = null;
    this.userId = null;
  }

  static release(cid) {
    for (const [key, pool] of Object.entries(VPOOL)) {
      VPOOL[key] = pool.filter(vh => {
        if (vh.cid !== cid) return true;
        vh.destroy();
        return false;
      });
    }
  }

  static get(url, cid, userId) {
    return new Promise((resolve, reject) => {
      VQ.enqueue(async () => { // 用Queue避免并发导致重复
        try {
          resolve(await this._get_(url, cid, userId));
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  static _get_(url, cid, userId) {
    return new Promise((resolve, reject) => {
      const poolKey = userId.endsWith('preview') ? POOL_PREVIEW : POOL_DEFAULT;
      const vs = VPOOL[poolKey].filter(vh => (vh.url === url && vh.cid === cid));
      // 先找已经分配给这个user的（同一个user同时不能申请2个）
      let vh = vs.filter(vh => vh.userId === userId)[0];
      if (vh) return resolve(vh);
      // 再找目前无主的
      vh = vs.filter(vh => !vh.userId)[0];
      if (vh) {
        vh.assignTo(userId);
        return resolve(vh);
      }

      // preview的pool限制大小
      if (poolKey === POOL_PREVIEW && vs.length >= PREVIEW_LIMIT) {
        return reject('pool is busy');
      }

      // 新建一个
      vh = new VideoHolder(vs[0] || url, cid, userId);
      VPOOL[poolKey].push(vh);
      resolve(vh);
    });
  }
}

module.exports = VideoHolder;