const Mixin = require('./base');
const { isWebWorker } = require("browser-or-node");

class Timeline extends Mixin {
  async init(conf) {
    await super.init(conf);
    this.resize(conf.width || 700, 10);
    this.initConf(conf);
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  initConf(conf) {
    this.conf.color = conf.color || '#f2edf7';
    this.conf.baseColor =  conf.baseColor || '#4a454d';
  }

  async update(conf) {
    if (conf.width) this.containerWidth = conf.width;
    if (conf.height) this.containerHeight = conf.height;
    if ((conf.width && conf.width !== this.width) || (conf.height && conf.height !== this.height)) {
      this.resize(conf.width || this.containerWidth, conf.height || this.containerHeight);
    }
    Object.assign(this.conf, conf);
    this.process = conf.process;
    return {width: this.containerWidth, height: this.containerHeight}
  }

  render(time, delta) {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    const width = this.containerWidth;
    const height = this.containerHeight;
    const {color, baseColor} = this.conf;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, Math.floor(width * this.process), height);
  }
}

if (isWebWorker) new Timeline().start();

module.exports = Timeline;
