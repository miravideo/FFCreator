const Mixin = require('./base');
const { isWebWorker } = require("browser-or-node");

class Timeline extends Mixin {
  async init(conf) {
    await super.init(conf);
    this.resize(conf.width || 700, 10);
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  async update(conf) {
    this.process = conf.process;
  }

  render(time, delta) {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f2edf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4a454d';
    ctx.fillRect(0, 0, Math.floor(canvas.width * this.process), canvas.height);
  }
}

if (isWebWorker) new Timeline().start();

module.exports = Timeline;
