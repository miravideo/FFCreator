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
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  async update(conf) {
    const { fft, gain } = conf;
    this.fft = fft;
    this.gain = gain;
    // console.log({spd, amp});
  }

  drawMove(delta) {
    if (!this.gain && this.gains.length === 0) return
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { barHeight=canvas.height/2, width=canvas.width, color="#FFFFFF", shadowHeight=50, shadowColor, minHeight=1, step=1 } = this.conf;
    let { barWidth=5, barSpacing=2 } = this.conf;
    const barSize = barWidth + barSpacing;
    this.gains.push(this.gain)
    let x = width - barSize;
    for (let i = this.gains.length; i > 0; i--) {
      if (x < 0) {
        break
      }
      if (i % step === 0 || i === this.gains.length) {
        x -= barSize;
        const val = clamp(this.gains[i] / 100 * barHeight, minHeight, canvas.height/2);
        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height/2, barWidth, -val);
      }
    }

  }

  drawSpectrum() {
    if (!this.fft) return
    const canvas = this.canvas;
    const bars = this.fft.length;
    const ctx = canvas.getContext('2d');
    const { barHeight=canvas.height/2, width=canvas.width, color="#FFFFFF", shadowHeight=50, shadowColor, minHeight=1 } = this.conf;
    let { barWidth=2, barSpacing=-1 } = this.conf;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (barWidth < 0 && barSpacing < 0) {
      barSpacing = width / bars / 2;
      barWidth = barSpacing;
    } else if (barSpacing >= 0 && barWidth < 0) {
      barWidth = (width - bars * barSpacing) / bars;
      if (barWidth <= 0) barWidth = 1;
    } else if (barWidth > 0 && barSpacing < 0) {
      barSpacing = (width - bars * barWidth) / bars;
      if (barSpacing <= 0) barSpacing = 1;
    }

    // Calculate bars to display
    const barSize = barWidth + barSpacing;
    const fullWidth = barSize * bars;

    // Stepping
    const step = fullWidth > width ? fullWidth / width : 1;

    // Canvas setup
    // setColor(context, color, 0, 0, 0, height);

    // Draw bars
    for (let i = 0, x = 0, last = null; i < bars && x < fullWidth; i += step, x += barSize) {
      const index = ~~i;

      if (index !== last) {
        const val = clamp(this.fft[index] * 10 * barHeight, minHeight, canvas.height/2);
        last = index;
        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height/2, barWidth, -val);
      }
    }

    // Draw shadow bars
    if (shadowHeight > 0) {

      for (let i = 0, x = 0, last = null; i < bars && x < fullWidth; i += step, x += barSize) {
        const index = ~~i;

        if (index !== last) {
          const val = this.fft[index] * shadowHeight;
          last = index;

          ctx.fillStyle = 'rgb(0, 0, 0, 0.3)';
          ctx.fillRect(x, canvas.height/2, barWidth, val);
        }
      }
    }
  }

  drawCircleBar() {
    if (!this.fft) return
    const dx = (value) => {
      return Math.sin((i) / 180 * Math.PI) * (value)
    }
    const dy = (value) => {
      return Math.cos((i) / 180 * Math.PI) * (value)
    }

    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    let {r=150, color="#FFFFFF", barWidth=2, barHeight=150, baseColor="#FFFFFF", baseWidth=2} = this.conf;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle=color;
    for (var i = 0; i < 180; i++) {
      var index=i*(this.fft.length/180)>>0;
      var value = (this.fft[index]) * 10 * barHeight + r;
      ctx.beginPath();
      ctx.lineWidth = barWidth;
      ctx.moveTo(canvas.width/2 - dx(r), canvas.height/2 - dy(r));
      ctx.lineTo(canvas.width/2 - dx(value), (canvas.height/2- dy(value)));
      ctx.stroke();
      ctx.beginPath();
      ctx.lineWidth = barWidth;
      ctx.moveTo(canvas.width/2 + dx(r), canvas.height/2 - dy(r));
      ctx.lineTo(canvas.width/2 + dx(value), (canvas.height/2 - dy(value)));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.strokeStyle=baseColor;
    ctx.lineWidth = baseWidth;
    ctx.arc(canvas.width/2, canvas.height/2, 150, 0, 2 * Math.PI, false);
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
