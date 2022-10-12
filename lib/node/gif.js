'use strict';

/**
 * FFGIfImage - A Component that supports gif animation
 *
 * ####Example:
 *
 *     const path = path.join(__dirname, './sun.gif');
 *     const gif = new FFGIfImage({ path, x: 320, y: 520 });
 *     gif.setSpeed(2);
 *
 * @class
 */

const { isBrowser } = require("browser-or-node");
const FFImage = require('./image');
const GifMaterial = require('../material/gif');
const Utils = require('../utils/utils');

class FFGifImage extends FFImage {

  constructor(conf = { list: [] }) {
    super({ type: 'gif', ...conf });
    this.currentTime = 0;
    this.loops = 0;
    this.loop = conf.loop === undefined ? true : conf.loop;
  }

  get default() {
    const _default = super.default;
    return {
      startTime: _default.startTime,
      endTime: this.loop ? _default.endTime : undefined,
      duration: this.loop ? undefined : this.material.getDuration(),
    }
  }

  get speed() {
    return this.material.speed;
  }

  set speed(speed) {
    this.conf.speed = speed;
    this.material.setSpeed(speed);
  }

  createMaterial(conf) {
    const speed = this.confAttr.speed;
    return new GifMaterial({speed, ...conf});
  }

  /**
   * Set whether to loop the animation
   * @param {boolean} loop whether loop
   *
   * @public
   */
  setLoop(loop) {
    this.loop = !!loop;
    if (this.material) this.material.loop = this.loop;
  }

  setSpeed(speed) {
    this.conf.speed = Number(speed) || 1.0;
    if (this.material) this.material.speed = this.confAttr.speed;
  }

  materialTime(absTime, mabs=false) {
    return this._materialTime(absTime, mabs)
  }

  async getFrameByTime(matTime) {
    const imgData = await this.material.getFrameByTime(matTime);
    return this.material.getImage(imgData);
  }

  async drawing(timeInMs, nextDeltaInMS) {
    let texture = await super.drawing(timeInMs, nextDeltaInMS);
    if (!texture) return false;

    // timeInMs 是绝对时间，currentTime是当前素材的时间
    const { time, loops } = this.materialTime(timeInMs / 1000);
    this.currentTime = time;

    // console.log(`${this.id} drawing`, {id:this.id, timeInMs, nextDeltaInMS, tt: this.currentTime, pst: this.parent.startTime});
    // loops每次变化的时候，需要seek
    if (this.loops !== loops) {
      // 只有这样才能让video暂停播放，并seek
      await this.material.getFrameByTime(this.currentTime, 0);
      this.loops = loops;
    }

    texture = await this.material.getFrameByTime(this.currentTime, nextDeltaInMS / 1000);
    // canvas->texture binded when preProcessing
    // 必须await前面渲染完成, 才能baseTexture.update, 不然cutout不生效
    if (isBrowser || !texture) this.display.texture.baseTexture.update();
    else this.draw({ texture, useCache: this.useCache });
    // nextDeltaInMS > 0 播放状态，就不让外面等texture渲染了；反之seek状态时，要await确保外面拿到正确的帧
    // return nextDeltaInMS > 0 || await texture;
    return true;
  }
}

module.exports = FFGifImage;
