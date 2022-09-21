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
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  async update(conf) {
    const { spd, amp } = conf;
    if (spd !== undefined) this.siriWave.setSpeed(spd);
    if (amp !== undefined) this.siriWave.setAmplitude(amp);
    // console.log({spd, amp});
  }

  async render(time, delta) {
    this.siriWave.render(time);
  }
}

if (isWebWorker) new SiriCurveMixin().start();

module.exports = SiriCurveMixin;
