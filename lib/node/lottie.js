'use strict';

const FFGifImage = require('./gif');
const LottieMaterial = require('../material/lottie');
const { Rectangle, Texture, createCanvas } = require('../../inkpaint/lib/index');

class FFLottie extends FFGifImage {
  constructor(conf = {}) {
    super({ type: 'lottie', ...conf });
  }

  createMaterial(conf) {
    const speed = Number(this.conf.speed) || 1.0;
    const width = this.px(this.conf.width);
    const height = this.px(this.conf.height);
    return new LottieMaterial({speed, width, height, ...conf});
  }

  fitSize() {
    let { width, height, 'object-fit': fit } = this.conf;
    width = this.px(width), height = this.px(height);
    const { oriWidth: w, oriHeight: h } = this.material.info;
    if (!width || !height) { // 宽高设置不全，根据源素材比例来适配
      if (width) height = width * (h / w);
      else if (height) width = height * (w / h);
    }

    // 在scale-down(缩小)的时候，可能会导致渲染alpha变化，所以尽量避免
    const func = ['fill', 'contain'].includes(fit) ? Math.min : Math.max;
    const scale = func(width / w, height / h);

    // 必须要取整，不然之后frame会报错
    this.material.resize(Math.round(w * scale), Math.round(h * scale));
    if (this.display.texture.baseTexture.source === this.material.canvas) {
      this.display.texture.baseTexture.update();
    }

    super.fitSize();
  }

  materialTime(absTime, mabs=true) { // default mabs = true
    return super.materialTime(absTime, mabs);
  }

  async getFrameByTime(matTime) { // for snapshot
    const { width, height } = this.material.canvas;
    const canvas = createCanvas(width, height);
    await this.material.queuedGetFrameByTime(matTime, canvas);
    return canvas;
  }
}

module.exports = FFLottie;
