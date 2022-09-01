const echarts = require('echarts');
const Mixin = require('./base');
const { getRemote } = require("../../lib/utils/xhr");
const { isWebWorker } = require("browser-or-node");

class EChartMixin extends Mixin {
  async init(conf) {
    await super.init(conf);
    let { width=128, height=128, theme="light", speed=1.0, aniStart=true, option } = conf;
    this.resize(width, height);
    this.speed = Number(speed) || 1.0;
    this.dataTimer = 0; // set to -1 if update at begin is needed

    echarts.Model.prototype.isAnimationEnabled = () => aniStart;
    echarts.SeriesModel.prototype.isAnimationEnabled = () => aniStart;

    // todo: load data-template & data from remote

    try {
      if (typeof(option) === 'object' && option.innerHTML) {
        option = JSON.parse(option.innerHTML);
      } else {
        option = JSON.parse(`${option}` || {});
      }
    } catch (e) { return; }
    // todo: check valid data
    if (!option.series) return;

    option = { 
      animationDuration: 0,
      animationDurationUpdate: 1000,
      animationDuration: 'linear',
      animationDuration: 'linear',
      ...option
    };
    this.aniDuration = option.animationDurationUpdate;

    const canvasCreator = this.createCanvas(128, 128);
    echarts.setCanvasCreator(() => canvasCreator);

    this.option = option;
    this.chart = echarts.init(this.canvas, theme);
    this.fixZRender(); // 必须放在setOption之前
    this.chart.setOption(option);
    this.updateData(0); // 数据归零
    const animation = this.chart._zr.animation;
    animation.stop(); // 之前可能会自动开始动画，需要先停掉
    animation._time = 0; // 时钟归零
    animation.update(false, 0, 0); // init seek & update, will trigger start()
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  render(time, delta) {
    const { chart } = this;
    const animation = chart._zr.animation;

    const timer = time >> 0; // update every second
    if (timer !== this.dataTimer) {
      this.updateData(timer);
      this.dataTimer = timer;
    }

    if (delta <= 0) {
      // seek的时候，需要把动画都重置
      animation.update(true, 0);
      animation.stop();
      animation._time = 0;
      // 完整的周期，让动画测底释放
      animation.update(false, this.aniDuration);
    }

    if (animation._running && !animation._paused) {
      animation.update(false, (time * 1000) >> 0);
    }
  }

  updateData(time) {
    const { option, chart } = this;
    const data = option.series[0].data;
    const src = option.series[1].data;
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.round(src[i] * time);
    }
    chart.setOption(option);
  }

  fixZRender() {
    const { chart } = this;
    const animation = chart._zr.animation;
    animation.start = function () {
      if (this._running) return;
      // this._time = getTime();
      this._time = 0; // set to 0
      this._pausedTime = 0;
      this._startLoop();
    }

    animation._startLoop = function () {
      this._running = true;
      // requestAnimationFrame(step);
    }
    animation.update = function (notTriggerFrameAndStageUpdate, time) {
      if (time === undefined) {
        // console.log('update without time!');
        return;
      }
      let clip = this._clipsHead;
      // const time = getTime() - this._pausedTime;
      const delta = time - this._time;
      this._time = time;

      while (clip) {
        const nextClip = clip.next;
        let finished = clip.step(time, delta);
        if (finished) {
          clip.ondestroy && clip.ondestroy();
          this.removeClip(clip);
          clip = nextClip;
        } else {
          clip = nextClip;
        }
      }

      if (!notTriggerFrameAndStageUpdate) {
        this.onframe(delta);
        this.trigger('frame', delta);
        this.stage.update && this.stage.update();
      }
    };
  }
}

if (isWebWorker) new EChartMixin().start();

module.exports = EChartMixin;