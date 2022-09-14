const echarts = require('echarts');
const ejs = require('ejs');
const Mixin = require('./base');
const { isWebWorker } = require("browser-or-node");

const COLORS = [
  '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#E062AE', '#fb7293', '#ff9f7f',
  '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3', '#dd6b66', '#759aa0', '#e69d87',
  '#8dc1a9', '#ea7e53', '#eedd78', '#73a373', '#73b9bc', '#7289ab', '#91ca8c', '#749f83',
];

class EChartMixin extends Mixin {
  async init(conf) {
    await super.init(conf);
    let { width=128, height=128, duration, theme="light", 
      speed, ani=true, movieType='start', colors,
      option, src, template, data } = conf;
    this.resize(width, height);
    this.dataTimer = -1; // set to -1 if update at begin is needed
    this.movieType = movieType;
    this.color = colors || COLORS;

    echarts.Model.prototype.isAnimationEnabled = () => ani;
    echarts.SeriesModel.prototype.isAnimationEnabled = () => ani;

    if (option) {
      try {
        if (typeof(option) === 'object' && option.innerHTML) {
          option = option.innerHTML;
        }
      } catch (e) { return; }
    } else if ((src && src.startsWith('http')) || (template && template.startsWith('http'))) {
      src = src || template;
      option = await this.getRemoteData(src, false);
    }

    if (typeof(option) !== 'string') {
      // todo: error!
      return;
    }

    if (data) {
      data = await this.parseData(data);
      // render template
      if (Array.isArray(data) && Array.isArray(data[0])) {
        this.data = data; // todo: clone?
        this.template = option;
        this.length = data[0].length;
        option = this.updateData(0, false);
        // const xs = this.xs(data[0]);
        // option = ejs.render(option, {xs, ys: data}); // title, label...
      }
    }

    // todo: check valid data
    if (typeof(option) === 'string') {
      try {
        option = JSON.parse(option);
        this.length = option.series[0].data.length;
      } catch(e) {
        console.error(e);
        console.error(option);
        return;
      }
    }
    if (!option.series) return;

    // todo: 根据duration反算speed
    this.speed = Number(speed) || (this.length / duration);

    option = { 
      animationDuration: movieType === 'start' ? 1000 : 0,
      animationDurationUpdate: 1000,
      animationEasing: 'linear',
      animationEasingUpdate: 'linear',
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
    return { width: this.width, height: this.height, duration: this.length, 
      speed: this.speed, loop: false, data };
  }

  async update(conf) {
    this.conf = {...this.conf, ...conf};
    let { duration, speed } = this.conf;
    if (conf.data) {
      conf.data = await this.parseData(conf.data);
      if (this.data) this.data = conf.data;
      this.length = this.data[0].length;
      this.speed = Number(speed) || (this.length / duration);
      this.dataTimer = -1; // reset
    }
    if (conf.width !== this.width || conf.height !== this.height) {
      const {width, height} = conf;
      this.chart.resize({width, height});
      this.resize(width, height);
    }
    return { width: this.width, height: this.height, duration: this.length, 
      speed: this.speed, loop: false, data: this.data };
  }

  async parseData(data) {
    try {
      if (typeof(data) === 'object' && data.innerHTML) {
        data = JSON.parse(data.innerHTML);
      } else if (typeof(data) === 'string' && data.startsWith('http')) {
        data = await this.getRemoteData(data);
      } else if (typeof(data) === 'string') {
        data = JSON.parse(data);
      }
    } catch (e) { }
    return data;
  }

  render(time, delta) {
    const { chart } = this;
    const animation = chart._zr.animation;

    const timer = time >> 0; // update every second
    if (timer !== this.dataTimer) {
      this.updateData(timer);
      this.dataTimer = timer;
    }

    // todo: seek到小于1的时候，如何恢复开场的动画？
    if (delta <= 0) { // && time > 0.02
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

  updateData(ti, update=true) {
    if (!this.data) return; // 只支持套模板的
    const { chart } = this;
    let xs, ys;
    if (this.movieType === 'add') {
      // 第一列，合并后，前N个之后，add
      const start = this.conf.moiveStart || 2; // 除了head, 至少1个数
      xs = this.xs(this.data[0]);
      ys = this.ys(this.data, xs.slice(0, start + ti));
    } else if (this.movieType === 'move') {
      // 第一列，合并后，按表格顺序往下走
      const x = this.xs(this.data[0])[ti + 1];
      if (x === undefined) return; // at end
      xs = this.data.map(x => x[0]);
      ys = this.ys(this.data, [x]).map(y => y[0]);
    // } else if (this.movieType === 'swap') {
    //   return;
    } else {
      return;
    }
    const option = JSON.parse(ejs.render(this.template, {xs, ys}));
    if (this.color) {
      option.series[0].itemStyle = { color: (p) => {
        return this.color[p.dataIndex];
      }}
    }
    if (update) chart.setOption(option);
    return option;
  }

  xs(data) {
    const xs = [];
    for (let i of data) {
      if (!xs.includes(i)) xs.push(i);
    }
    return xs;
  }

  ys(data, xs) {
    const ys = [];
    for (let _ in data) {
      ys.push([]);
    }

    for (let i in data[0]) {
      const x = data[0][i];
      if (!xs.includes(x)) continue;
      for (let j in data) {
        ys[j].push(data[j][i]);
      }
    }
    return ys;
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