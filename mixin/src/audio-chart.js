const Mixin = require('./base');
const { isWebWorker } = require("browser-or-node");

function clamp(num, min, max) {
  return num < min ? min : num > max ? max : num;
}

class AudioChartMixin extends Mixin {
  constructor() {
    super();
    this.gains = [];
    this.smoothing = null;
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
    this.conf.r = conf.r || 0.25;
    this.conf.color = conf.color || "#FFFFFF";
    this.conf.barWidth = conf.barWidth || 2;
    this.conf.barHeight = conf.barHeight || 0.5;
    this.conf.barSpacing = conf.barSpacing || 2;
    this.conf.baseColor =  conf.baseColor || "#FFFFFF";
    this.conf.baseWidth = conf.baseWidth || 2;
    this.conf.minBarHeight = conf.minBarHeight || 1;
    this.conf.step = conf.step || 1;
    this.conf.shadowColor = conf.shadowColor || '#00f';
    this.conf.shadowBlur = conf.shadowBlur || 0;
    this.conf.circleAngle = conf.circleAngle || 90;
    this.conf.smooth = conf.smooth || 0;
    this.conf.barHeight = conf.barHeight || 1;
    this.conf.minFrequency = conf.minFrequency || 0;
    this.conf.maxFrequency = conf.maxFrequency || 2048;
  }

  smooth() {
    if (!this.conf.smooth) return
    if (!this.smoothing) {
      this.smoothing = new Float32Array(this.fft);
      return
    }
    for (let i = 0, n = this.fft.length; i < n; i++) {
        this.smoothing[i] = this.conf.smooth * this.smoothing[i] + this.fft[i] * (1 - this.conf.smooth);
        this.fft[i] = this.smoothing[i];
    }
  }

  async update(conf) {
    if (conf.width) this.containerWidth = conf.width;
    if (conf.height) this.containerHeight = conf.height;
    if ((conf.width && conf.width !== this.width) || (conf.height && conf.height !== this.height)) {
      this.resize(Math.round(conf.width || this.containerWidth), Math.round(conf.height || this.containerHeight));
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

    const {color, minBarHeight, step, barWidth, barSpacing, barHeight} = this.conf;
    const width = this.containerWidth;
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
        const val = Math.max(this.gains[i] * barHeight * this.containerHeight / 10, minBarHeight);
        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height, barWidth, -val);
      }
    }
  }

  drawSpectrum() {
    if (!this.fft) return
    this.smooth();
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    const {color, minBarHeight, step, barWidth, barSpacing, barHeight, minFrequency, maxFrequency} = this.conf;
    const width = this.containerWidth;
    const barSize = barWidth + barSpacing;
    const bars = Math.floor(width / barSize);

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    for (let i = 0, x = 0; i < bars && x < width; i += step, x += barSize) {
      const index = minFrequency + Math.round((i / bars) * (maxFrequency - minFrequency));
      const val = Math.max(this.fft[index] * barHeight * this.containerHeight / 10, minBarHeight);
      ctx.fillStyle = color;
      ctx.fillRect(x, canvas.height, barWidth, -val);
    }
  }

  drawCircleBar() {
    if (!this.fft) return
    this.smooth();
    const dx = (angle, value) => {
      return Math.sin((angle) / 180 * Math.PI) * (value)
    }
    const dy = (angle, value) => {
      return Math.cos((angle) / 180 * Math.PI) * (value)
    }

    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    const {color, minBarHeight, barWidth, barSpacing, circleAngle, step, barHeight, maxFrequency, minFrequency, r: _r} = this.conf;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    let index = 0;
    for (let angle = 0; angle <= circleAngle; angle+= barSpacing) {
      // 柱的高度
      const _index = minFrequency + Math.round((index / circleAngle) * (maxFrequency - minFrequency));
      const h = Math.max((this.fft[_index] || 0) * barHeight * this.containerHeight / 10, minBarHeight);
      const r = _r / 10 * ((this.containerWidth > this.containerHeight) ? this.containerHeight: this.containerWidth);

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
