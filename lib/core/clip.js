
const FFBase = require('./base');
const { DisplayObject } = require('../../inkpaint/lib/index');
const { dmap } = require('../utils/utils');

class FFClip extends FFBase {
  constructor(conf = {}) {
    super({ type: 'clip', ...conf });
    this.canvasWidth = conf.canvasWidth;
    this.canvasHeight = conf.canvasHeight;
    this.parent = null;
    this.prevSibling = null;
    this.nextSibling = null;
    this.visible = false;
    this.zIndex = 0;
    this.children = [];
    this.active = conf.active !== undefined ? !!conf.active : true;
    this.onTime = () => false;
    this.createDisplay();
  }

  toJson() {
    const conf = {...this.conf};
    if (conf.origSrc && conf.src) {
      // 把cache过的地址还原
      conf.src = conf.origSrc;
      delete conf.origSrc;
    }
    delete conf.canvasHeight;
    delete conf.canvasWidth;
    conf.children = this.children.map(c => c.toJson());
    return conf;
  }

  createDisplay() {
    this.display = new DisplayObject();
  }

  addChild(child, insertBefore=null) {
    if (Array.isArray(child)) {
      child.map(x => this.addChild(x, insertBefore));
      return this;
    }
    if (this.children.includes(child)) return this;
    child.parent = this;
    if (insertBefore && this.children.includes(insertBefore)) {
      this.children.splice(this.children.indexOf(insertBefore), 0, child);
    } else {
      this.children.push(child);
    }
    return this;
  }

  removeChild(child) {
    if (!this.children.includes(child)) return this;
    this.children = this.children.filter(x => x.id !== child.id);
    // child.parent = null; 先不要清掉，可能还需要恢复
    return this;
  }

  addDisplayChild(display) {
    this.parent.addDisplayChild(display);
  }

  removeDisplayChild(display) {
    this.parent.removeDisplayChild(display);
  }

  disable() {
    this.active = this.conf.active = false;
    if (!this.parent) return;
    this.hide();
    this.removeTimelineCallback();
  }

  enable() {
    this.active = this.conf.active = true;
    if (!this.parent) return;
    this.onTime(this.creator().currentTime / 1000);
    this.addTimelineCallback();
  }

  addTimelineCallback() {
    if (!this.active) return;
    if (!this._drawing) {
      // this._drawing = this.drawing.bind(this);
      this._drawing = async (timeInMs, nextDeltaInMS) => {
        // const t = Date.now();
        await this.drawing(timeInMs, nextDeltaInMS);
        // const tt = Date.now() - t;
        // if (tt > 100) console.log(this.id, 'draw', tt);
      }
    }
    this.addFrameCallback(this._drawing);
  }

  removeTimelineCallback() {
    this.removeFrameCallback(this._drawing);
  }

  async drawing(timeInMs = 0, nextDeltaInMS = 0) {
    if (!this.onTime(timeInMs * 0.001)) return false;
    if (nextDeltaInMS === 0) {
      // seek的时候，需要强制动一下
      this.animations && this.animations.start() && timeInMs;
    }
    return true;
  }

  preProcessing() {
    return new Promise(resolve => resolve());
  }

  prepareMaterial() {
    return new Promise(resolve => resolve());
  }

  show() {
    this.visible = true;
    if (Number(this.conf.blur) > 0) this.display.blur = Number(this.conf.blur);
    this.display.zIndex = this.zIndex;
    this.parent.addDisplayChild(this.display);
  }

  hide() {
    this.visible = false;
    this.parent.removeDisplayChild(this.display);
  }

  annotate() {
    const start = this.absStartTime;
    const end = this.absEndTime;
    let [ showStart, showEnd ] = [ start, end ];
    if (this.prevSibling?.type === 'trans') {
      showStart += this.prevSibling.duration;
    }
    if (this.nextSibling?.type === 'trans') {
      showEnd -= this.nextSibling.duration;
    }
    this.absShowStartTime = showStart;
    this.absShowEndTime = showEnd;
    // console.log('clip.annotate', this.id, {showStart, showEnd, start, end});
    this.addTimelineCallback();
    this.onTime = (absTime) => {
      // draw: 开始渲染，但不要添加display(转场过程有transition负责);
      // show: 添加display，正式开始绘制
      const show = (absTime >= showStart && absTime < showEnd);
      const draw = (absTime >= start && absTime < end);
      show ? this.show() : this.hide();
      return draw;
    }
  }

  get basezIndex() {
    return Math.min(Number(this.conf.zIndex), 999) * 1000 || this.parent?.basezIndex || 0;
  }

  get allNodes() {
    let nodes = this.children;
    this.children.map(x => {
      nodes = nodes.concat(x.allNodes);
    });
    return nodes;
  }

  get absStartTime() {
    return this.parent.absStartTime + this.startTime;
  }

  get absEndTime() {
    return this.parent.absStartTime + this.endTime;
  }

  get realAbsEndTime() {
    return this.parent.startTime + this.realEndTime;
  }

  get default() {
    return {
      startTime: this.prevSibling?.endTime || 0,
      endTime: '100%',
    }
  }

  get startTime() {
    const start = this.time(this.conf.start);
    return !isNaN(start) ? start : this.time(this.default.startTime);
  }

  get duration() {
    return this.endTime - this.startTime;
  }

  get endTime() {
    const endTime = this.realEndTime;
    if (this.parent.type !== 'scene') return endTime;
    // scene的子元素，会被截到跟它一样长
    return Math.min(this.parent.duration, endTime);
  }

  get realEndTime() {
    const end = this.time(this.conf.end);
    if (!isNaN(end)) return end;
    let duration = this.time(this.conf.duration);
    duration = !isNaN(duration) ? duration : this.time(this.default.duration);
    if (!isNaN(duration)) return this.startTime + duration;
    const defaultEnd = this.time(this.default.endTime);
    if (defaultEnd > this.startTime) return defaultEnd;
    return this.startTime + 1;
  }

  time(time) {
    const parentDuration = this.parent ? this.parent.duration : NaN;
    if (typeof(time) === 'string' && time.endsWith('%') && !isNaN(time.replace('%', ''))) {
      return parentDuration * Number(time.replace('%', '')) * 0.01;
    }
    if (typeof(time) === 'string') {
      time = time.replaceAll(' ', '');
      if (time.includes('%+') && time.split('%+').length === 2) {
        const [ head, tail ] = time.split('%+');
        return Number(head) * 0.01 * parentDuration + Number(tail);
      } else if (time.includes('%-') && time.split('%-').length === 2) {
        const [ head, tail ] = time.split('%-');
        return Number(head) * 0.01 * parentDuration - Number(tail);
      }
    }
    return Number(time);
  }

  px(data) {
    const num = Number(data);
    if (!isNaN(num)) return num;
    if (typeof(data) === 'object') return dmap(data, x => this.px(x));
    const [inum, unit] = this.deunit(data);
    return inum;
  }

  setConfRpx(key, val) {
    const prev = this.conf[key];
    let [inum, unit] = this.deunit(prev);
    if (!unit) unit = 'rpx'; // todo: 强制rpx
    this.conf[key] = this.enunit(val, unit);
  }

  units() {
    const creator = this.creator();
    if (creator) {
      this.canvasWidth = creator.width;
      this.canvasHeight = creator.height;
    }
    return [
      ['rpx', this.canvasWidth, 360],
      ['px', 360, 360],
      ['vw', this.canvasWidth, 100],
      ['vh', this.canvasHeight, 100]
    ];
  }

  enunit(px, unit) {
    const ut = this.units().filter(ut => ut[0] === unit)[0];
    if (!ut) return px;
    return `${(px * ( ut[2] / ut[1])).toFixed(3)}${unit}`;
  }

  deunit(data) {
    if (typeof(data) === 'number' || !data) return [data, null];
    const lower_data = data.toString().toLowerCase().trim();
    const unit = (input, unit, original, target) => {
      if (!input.endsWith(unit)) return null;
      const inum = Number(input.substring(0, input.length - unit.length));
      return isNaN(inum) ? null : inum * (original / target);
    }

    for (const ut of this.units()) {
      const inum = unit(lower_data, ut[0], ut[1], ut[2]);
      if (inum !== null) return [inum, ut[0]];
    }
    return [data, null];
  }

  destroy() {
    this.removeTimelineCallback();
    this.children.map(child => child.destroy());
    this.children = null;
    this.display = null;
    this.parent = null;
    this.prevSibling = null;
    this.nextSibling = null;
    super.destroy();
  }
}

module.exports = FFClip;