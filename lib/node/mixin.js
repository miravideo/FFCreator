'use strict';

const FFGifImage = require('./gif');
const MixinMaterial = require('../material/mixin');
const { Rectangle, Texture, createCanvas } = require('../../inkpaint/lib/index');

class FFMixin extends FFGifImage {
  constructor(conf = {}) {
    super({ type: 'mixin', ...conf });
    this.mixin = conf.mixin;
  }

  async preProcessing() {
    await super.preProcessing();
    // set loop with material;
    this.loop = this.material.loop;
  }

  createMaterial(conf) {
    // todo: x, y, startTime ?
    const width = this.px(this.conf.width);
    const height = this.px(this.conf.height);
    return new MixinMaterial({...conf, width, height});
  }

  async drawing(timeInMs, nextDeltaInMS) {
    const texture = await super.drawing(timeInMs, nextDeltaInMS);
    if (!texture) return;
    if (this.animationAttr) {
      this.material.update(this.animationAttr);
    }
  }

  async fitSize() {
    await this.update();
    return super.fitSize();
  }

  async update() {
    let { width, height, 'object-fit': fit } = this.confAttr;
    width = this.px(width), height = this.px(height);
    const { width: w, height: h } = this.material.info;

    if (this.material.info.keepRatioWhenResize) {
      if (!width || !height) { // 宽高设置不全，根据源素材比例来适配
        if (width) height = width * (h / w);
        else if (height) width = height * (w / h);
      }
      // 在scale-down(缩小)的时候，可能会导致渲染alpha变化，所以尽量避免
      const func = ['fill', 'contain'].includes(fit) ? Math.min : Math.max;
      const scale = func(width / w, height / h);
      // 必须要取整，不然之后frame可能会报错
      [width, height] = [Math.round(w * scale), Math.round(h * scale)];
      // console.log('resize', {width, height});
    }

    await this.material.update({...this.conf, width, height});
    this.creator().refresh();
  }

  getParam(key) {
    if (key.startsWith('conf.')) {
      key = key.substring(5);
      return this.conf[key];
    }
    return super.getParam(key);
  }

  async setParam(key, value) {
    if (key.startsWith('conf.')) {
      key = key.substring(5);
      this.conf[key] = value;
    }
    return super.setParam(key, value);
  }

  materialTime(absTime, mabs=true) { // default mabs = true
    return super.materialTime(absTime, mabs);
  }

  async getFrameByTime(matTime) { // for snapshot
    const { width, height } = this.material.canvas;
    const canvas = createCanvas(width, height);
    await this.material.queuedGetFrameByTime(matTime, 0, canvas);
    return canvas;
  }

  toJson(asTemplate=false) {
    const conf = super.toJson(asTemplate);
    conf['type'] = this.conf._type;
    delete conf['mixin'];
    return conf;
  }

}

module.exports = FFMixin;
