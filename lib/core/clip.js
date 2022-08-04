
const FFBase = require('./base');
const { DisplayObject, createCanvas } = require('../../inkpaint/lib/index');
const { dmap } = require('../utils/utils');

class FFClip extends FFBase {
  constructor(conf = {}) {
    super({ type: 'clip', ...conf });
    this.canvasWidth = conf.canvasWidth;
    this.canvasHeight = conf.canvasHeight;
    this.visible = false;
    this.zIndex = 0;
    this.children = [];
    this.active = conf.active !== undefined ? !!conf.active : true;
    this.onTime = () => false;
    this.createDisplay();
  }

  get muted() {
    for (const parent of this.parents) {
      if (parent.conf.mute) return true;
    }
    return false;
  }

  toJson() {
    const conf = {...this.conf};
    for (const key of Object.keys(conf)) {
      if (key.startsWith('cached') && conf[key].startsWith('blob:http')) delete conf[key];
    }
    delete conf.canvasHeight;
    delete conf.canvasWidth;
    delete conf.innerHTML;
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
    if (this.hasChild(child)) return this;
    child.parent = this;
    if (insertBefore && this.hasChild(insertBefore)) {
      this.children.splice(this.children.findIndex(x => x.id == insertBefore.id), 0, child);
    } else {
      this.children.push(child);
    }
    return this;
  }

  remove() {
    this.parent && this.parent.removeChild(this);
    return this;
  }

  hasChild(child) {
    return !!this.children.find(x => x.id == child.id);
  }

  removeChild(child) {
    if (!this.hasChild(child)) return this;
    this.children = this.children.filter(x => x.id !== child.id);
    child.parent = null;
    return this;
  }

  addDisplayChild(display) {
    this.parent.addDisplayChild(display);
  }

  removeDisplayChild(display) {
    if (!display.parent) return;
    display.parent.removeChild(display);
    display.locked = false; // unlock
  }

  setMask(mask) {
    if (this.display.mask === mask) return;
    this.display.mask = mask;
  }

  removeMask() {
    this.display.mask = null;
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
    this.touch();
    this.addTimelineCallback();
  }

  touch() {
    this.onTime(this.creator().currentTime / 1000);
  }

  addTimelineCallback() {
    if (!this.active) return;
    this.addFrameCallback();
  }

  removeTimelineCallback() {
    this.removeFrameCallback();
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
    if (!this.display) return;
    this.display.zIndex = this.zIndex;
    this.parent.addDisplayChild(this.display);
    if (this.conf.asMask) {
      this.display.binaryMask = !!this.conf.binaryMask;
      this.display.reverseMask = !!this.conf.reverseMask;
      this.parent.setMask(this.display);
    }
  }

  hide() {
    this.visible = false;
    if (!this.display) return;
    this.parent.removeDisplayChild(this.display);
    if (this.conf.asMask) this.parent.removeMask();
  }

  annotate() {
    let [ start, end ] = [ this.absStartTime, this.absEndTime ];
    let [ showStart, showEnd ] = [ start, end ];
    if (this.prevSibling?.type === 'trans') {
      const halfTrans = this.prevSibling.duration * 0.5;
      showStart += halfTrans;
      start -= halfTrans;
    }
    if (this.nextSibling?.type === 'trans') {
      const halfTrans = this.nextSibling.duration * 0.5;
      showEnd -= halfTrans;
      end += halfTrans;
    }
    this.absShowStartTime = showStart;
    this.absShowEndTime = showEnd;
    // console.log('clip.annotate', this.id, {showStart, showEnd, start, end});
    this.addTimelineCallback();
    this.onTime = (absTime, opDisplay=true, returnVal='draw') => {
      // draw: 开始渲染，但不要添加display(转场过程有transition负责);
      // show: 添加display，正式开始绘制
      const show = (absTime >= showStart && absTime < showEnd && this.active);
      const draw = (absTime >= start && absTime < end && this.active);
      if (opDisplay) show ? this.show() : this.hide();
      return returnVal === 'draw' ? draw : show;
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
    return this.rt(Math.max(0, this.parent?.absStartTime + this.startTime));
  }

  get absEndTime() {
    return this.rt(this.parent?.absStartTime + this.endTime);
  }

  get realAbsEndTime() {
    return this.rt(this.parent?.absStartTime + this.realEndTime);
  }

  get default() {
    return {
      startTime: this.prevSibling?.endTime || 0,
      endTime: '100%',
    }
  }

  get startTime() {
    const start = this.time(this.conf.start);
    return this.rt(!isNaN(start) ? start : this.time(this.default.startTime));
  }

  get duration() {
    return this.rt(this.endTime - this.startTime);
  }

  get endTime() {
    const endTime = this.realEndTime;
    if (this.parent?.type !== 'scene') return this.rt(endTime);
    // scene的子元素，会被截到跟它一样长
    return this.rt(Math.min(this.parent.duration, endTime));
  }

  get realEndTime() {
    const end = this.time(this.conf.end);
    if (!isNaN(end)) return end;
    let duration = this.time(this.conf.duration);
    duration = !isNaN(duration) ? duration : this.time(this.default.duration);
    if (!isNaN(duration)) return this.startTime + duration;
    const defaultEnd = this.time(this.default.endTime);
    if (defaultEnd > this.startTime) return defaultEnd;
    return this.startTime + 3; // 默认3秒
  }

  get fps() {
    if (!this._fps) this._fps = this.rootConf('fps');
    return this._fps;
  }

  rt(time) {
    // 不能用floor，不然变化过程中会越减越小
    return Math.round(time * 1000) / 1000;
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

  vu(val, unitReferValue) {
    let [inum, unit] = this.deunit(unitReferValue);
    let valInPx = this.px(val);
    if (!unit) unit = 'rpx'; // todo: 强制rpx
    return this.enunit(valInPx, unit);
  }

  setConfRpx(key, val) {
    this.conf[key] = this.vu(val, this.conf[key]);
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

  /**
   * 把px单位的数值, 转换为给定unit单位的值
   * 返回数字/字符串
   */
  enunit(px, unit) {
    const ut = this.units().filter(ut => ut[0] === unit)[0];
    if (!ut) return px;
    return `${(px * ( ut[2] / ut[1])).toFixed(3)}${unit}`;
  }

  /**
   * 把某单位的数值，转换为px的值
   * 返回数组 [num_px, unit]
   */
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

  subImage(src, frame, { width, height, format='jpeg', fit='cover' }={}) {
    if (!width && !height) {
      width = frame.w;
      height = frame.h;
    } else if (!width) {
      width = (frame.w / frame.h) * height;
    } else if (!height) {
      height = (frame.h / frame.w) * width;
    }
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const f = (fit === 'cover' ? 'max' : 'min');
    const scale = Math[f](width / frame.w, height / frame.h);
    const [vw, vh] = [frame.w * scale, frame.h * scale];
    ctx.drawImage(src, frame.x, frame.y, frame.w, frame.h, 
      (width - vw) / 2, (height - vh) / 2, vw, vh);
    return format === 'canvas' ? canvas : canvas.toDataURL(`image/${format}`);
  }

  get mask() {
    return this.allNodes.find(x => x.conf.asMask);
  }

  get controls() {
    return this.conf.controls;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.removeTimelineCallback();
    this.children.map(child => child.destroy());
    this.children = null;
    if (this.display) this.display.destroy(true);
    this.display = null;
    this.parent = null;
    this.prevSibling = null;
    this.nextSibling = null;
    super.destroy();
  }
}

module.exports = FFClip;