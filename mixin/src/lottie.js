'use strict';

const lottie = require('lottie-nodejs');
const Mixin = require('./base');
const { isWebWorker } = require("browser-or-node");

class LottieMixin extends Mixin {
  async init(conf) {
    await super.init(conf);

    // set class
    lottie.setCanvas(this.klassHolder);

    // load json
    const animationData = await this.getRemoteData(conf.src);
    let { w, h, nm, fr, ip, op } = animationData;

    // resize canvas
    this.resize(w, h);
    this.name = nm;
    this.frames = op - ip;
    this.length = this.frames / fr;
    this.ani = lottie.loadAnimation({ container: this.canvas, animationData }, true); // isLoadNow = true
    return { width: w, height: h, duration: this.length };
  }

  render(time, delta) {
    // console.log({time, delta});
    this.ani.goToAndStop(time * 1000, false); // isFrame = false
  }
}

if (isWebWorker) new LottieMixin().start();

module.exports = LottieMixin;