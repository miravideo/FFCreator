const Mixin = require('./base');
const { getRemote } = require("../../lib/utils/xhr");
const { isWebWorker } = require("browser-or-node");

class DemoMixin extends Mixin {
  async init(conf) {
    await super.init(conf);

    this.resize(200, 200);
    const ctx = this.canvas.getContext('2d');
    ctx.scale(2.0, 2.0);
    ctx.font = 'normal normal normal 13px';
    ctx.lineJoin = "round";
    ctx.miterLimit = 10;
    ctx.strokeStyle = "black";

    return { width: this.width, height: this.height, duration: 10 };
  }

  render(time, delta) {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1FB0F9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(10 + (time * 3), 10, 10, 10);
    ctx.fillText(time, 10, 50);
    ctx.fillText(delta, 10, 70);
  }
}

if (isWebWorker) new DemoMixin().start();

module.exports = DemoMixin;