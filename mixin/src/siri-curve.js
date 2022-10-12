const SiriWave = require('./siri-curve/siriwave.umd.min.js');
// import SiriWave from "./siri-curve/siriwave.umd.min.js";
const Mixin = require('./base');
const { isWebWorker } = require("browser-or-node");

class SiriCurveMixin extends Mixin {
  async init(conf) {
    await super.init(conf);
    let { width=128, height=128, style } = conf;
    this.resize(width, height);
    this.siriWave = new SiriWave({
      style: style === 'ios' ? 'ios' : 'ios9',
      canvas: this.canvas,
      width: this.width,
      height: this.height,
      autostart: false,
    });
    this.containerWidth = width;
    this.containerHeight = height;
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  async update(conf) {
    const { spd, amp, style } = conf;
    if (conf.width) this.containerWidth = conf.width;
    if (conf.height) this.containerHeight = conf.height;
    if ((conf.width && conf.width !== this.width) || (conf.height && conf.height !== this.height)) {
      this.resize(conf.width || this.containerWidth, conf.height || this.containerHeight);
      this.siriWave = new SiriWave({
        style: style === 'ios' ? 'ios' : 'ios9',
        canvas: this.canvas,
        width: this.containerWidth,
        height: this.containerHeight,
        autostart: false,
      });
    }
    if (spd !== undefined) this.siriWave.setSpeed(spd);
    if (amp !== undefined) this.siriWave.setAmplitude(amp / 255 * this.containerHeight);
    return {width: this.containerWidth, height: this.containerHeight}
  }

  async render(time, delta) {
    this.siriWave.render(time);
  }
}

if (isWebWorker) new SiriCurveMixin().start();

module.exports = SiriCurveMixin;
