const Mixin = require('./base');
const { isWebWorker } = require("browser-or-node");

function clamp(num, min, max) {
  return num < min ? min : num > max ? max : num;
}

class AudioChartMixin extends Mixin {
  constructor() {
    super();
    this.gains = [];
  }
  async init(conf) {
    await super.init(conf);
    let { width=128, height=128 } = conf;
    this.resize(width, height);
    this.containerWidth = width;
    this.containerHeight = height;
    this.initConf(conf);
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  initConf(conf) {
    this.conf.r = conf.r || Math.floor(Math.min(this.containerWidth, this.containerHeight) / 4);
    this.conf.color = conf.color || "#FFFFFF";
    this.conf.barWidth = conf.barWidth || 2;
    this.conf.barHeight = conf.barHeight || 150;
    this.conf.barSpacing = conf.barSpacing || 2;
    this.conf.baseColor =  conf.baseColor || "#FFFFFF";
    this.conf.baseWidth = conf.baseWidth || 2;
    this.conf.minBarHeight = conf.minBarHeight || 1;
    this.conf.step = conf.step || 1;
    this.conf.shadowColor = conf.shadowColor || '#00f';
    this.conf.shadowBlur = conf.shadowBlur || 0;
    this.conf.circleAngle = conf.circleAngle || 90;
  }

  async update(conf) {
    if (conf.width) this.containerWidth = conf.width;
    if (conf.height) this.containerHeight = conf.height;
    if ((conf.width && conf.width !== this.width) || (conf.height && conf.height !== this.height)) {
      this.resize(conf.width || this.containerWidth, conf.height || this.containerHeight);
    }
    Object.assign(this.conf, conf);
    const { fft, gain } = conf;
    this.fft = fft;
    this.gain = gain;
    return {width: this.containerWidth, height: this.containerHeight}
  }

  drawMove(delta) {
    if (!this.gain && this.gains.length === 0) return
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const {color, minBarHeight, step, barWidth, barSpacing} = this.conf;
    const width = this.containerWidth;
    const barHeight = this.containerHeight * 0.8;
    const barSize = barWidth + barSpacing;

    if (delta) {
      this.gains.push(this.gain);
    }
    let x = width - barSize;
    ctx.shadowColor = this.conf.shadowColor;
    ctx.shadowBlur = this.conf.shadowBlur;
    for (let i = this.gains.length; i > 0; i--) {
      if (x < 0) {
        break
      }
      if (i % step === 0 || i === this.gains.length) {
        x -= barSize;
        const val = clamp(this.gains[i] / 100 * barHeight, minBarHeight, barHeight);
        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height, barWidth, -val);
      }
    }
  }

  drawSpectrum() {
    if (!this.fft) return
    const canvas = this.canvas;
    const bars = this.fft.length;
    const ctx = canvas.getContext('2d');
    const {color, minBarHeight, step, barWidth, barSpacing} = this.conf;
    const width = this.containerWidth;
    const barHeight = this.containerHeight * 0.8;
    const barSize = barWidth + barSpacing;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    for (let i = 0, x = 0, last = null; i < bars && x < width; i += step, x += barSize) {
        const val = clamp(this.fft[i] * barHeight, minBarHeight, barHeight);
        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height, barWidth, -val);
    }
  }

  drawCircleBar() {
    if (!this.fft) return
    const dx = (angle, value) => {
      return Math.sin((angle) / 180 * Math.PI) * (value)
    }
    const dy = (angle, value) => {
      return Math.cos((angle) / 180 * Math.PI) * (value)
    }

    const canvas = this.canvas;
    const r = (this.containerWidth > this.containerHeight) ? this.containerHeight / 4 : this.containerWidth / 4;
    const barHeight = r * 0.8;
    const ctx = canvas.getContext('2d');
    const {color, minBarHeight, barWidth, barSpacing, circleAngle, step} = this.conf;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    let index = 0;
    for (let angle = 0; angle <= circleAngle; angle+= barSpacing) {
      // 柱的高度
      const h = clamp((this.fft[index] || 0) * barHeight, minBarHeight, barHeight);
      const value = h + r;
      ctx.beginPath();
      ctx.lineWidth = this.barWidth;
      ctx.moveTo(canvas.width/2 - dx(angle, r), canvas.height/2 - dy(angle,r));
      ctx.lineTo(canvas.width/2 - dx(angle,value), (canvas.height/2- dy(angle,value)));
      ctx.stroke();
      ctx.beginPath();
      ctx.lineWidth = this.barWidth;
      ctx.moveTo(canvas.width/2 + dx(angle,r), canvas.height/2 - dy(angle,r));
      ctx.lineTo(canvas.width/2 + dx(angle,value), (canvas.height/2 - dy(angle,value)));
      ctx.stroke();

      if (circleAngle === 90) {
        ctx.beginPath();
        ctx.lineWidth = this.barWidth;
        ctx.moveTo(canvas.width/2 + dx(angle, r), canvas.height/2 + dy(angle, r));
        ctx.lineTo(canvas.width/2 + dx(angle, value), (canvas.height/2 + dy(angle, value)));
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = this.barWidth;
        ctx.moveTo(canvas.width/2 - dx(angle, r), canvas.height/2 + dy(angle, r));
        ctx.lineTo(canvas.width/2 - dx(angle, value), (canvas.height/2 + dy(angle, value)));
        ctx.stroke();
      }
      index += step;
    }
    ctx.lineWidth = barWidth;
    ctx.stroke();
  }

  async render(time, delta) {
    switch (this.conf.style) {
      case 'spectrum':
        this.drawSpectrum()
        break
      case 'move':
        this.drawMove(delta)
        break
      case 'circle':
        this.drawCircleBar()
        break
      default:
        this.drawSpectrum()
    }
  }
}

if (isWebWorker) new AudioChartMixin().start();

module.exports = AudioChartMixin;
