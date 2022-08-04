'use strict';

/**
 * Material - A abstract material base class
 * 素材类，设计的目的是把原始素材的【时间/画面】处理封装起来，供外部使用
 * 比如：视频素材，可以用ss/to做时间上的裁剪，也可以用rect做画面上的裁剪
 *      外面使用的时候，就直接用处理过的素材，不需要再考虑时间、空间上的偏移(offset)
 *
 * @class
 */

const min = require('lodash/min');
const path = require('path');
const DateUtil = require('../utils/date');
const { genUuid } = require('../utils/utils');
const { Rectangle } = require('../../inkpaint/lib/index');

const { nodeRequire } = require('../utils/utils');
const FS = nodeRequire('../utils/fs');

const DEFAULT_TIME = -1;

class Material {
  constructor(conf) {
    this.creator = null;
    this.info = {};
    this.path = '';
    this.forceTrim = false; // 强制遵守ss/to，转场时不用隐藏部分来补
    this.start = DEFAULT_TIME; // ss
    this.end = DEFAULT_TIME; // to
    this.length = NaN; // orig material length in time (seconds)
    this.fps = 30; // target fps
    this.duration = NaN; // target container duration (seconds)
    this.setSpeed(Number(conf.speed) || 1.0);
    this.parseConf(conf);
  }

  static playing(dom) {
    return !!(dom.currentTime > 0 && !dom.paused && !dom.ended && dom.readyState > 2);
  }

  setSpeed(speed) {
    this.speed = Math.round(speed * 100) / 100;
  }

  seekTime(time, opt={}) {
    const mt = time * this.speed + this.getStartOffset();
    const min = this.forceTrim ? this.getStartOffset() : 0.01; // 0会导致黑屏
    const max = this.forceTrim ? this.getEndOffset() : this.length;
    if (mt < min || mt > max) opt.overflow = true;
    return Math.min(max, Math.max(min, mt));
  }

  parseConf(conf) {
    this.conf = conf;
    this.type = conf.type;
    this.path = conf.cachedSrc || conf.src || conf.path || conf.image || conf.url;
    this.parseTimeConf(conf);
  }

  parseTimeConf(conf) {
    this.start = this.parseTimeNumber(conf.ss);
    this.end = this.parseTimeNumber(conf.to);
  }

  parseTimeNumber(time) {
    if (typeof time === 'string' && time.includes(':')) return DateUtil.hmsToSeconds(time);
    time = Number(time)
    return isNaN(time) ? DEFAULT_TIME : time;
  }

  getStartOffset() {
    return this.start == DEFAULT_TIME ? 0 : this.start;
  }

  getEndOffset(withConainer=false) {
    const ends = [];
    const end = this.getStartOffset() + (this.duration * this.speed);
    if (withConainer && !isNaN(end)) ends.push(end);
    if (!isNaN(this.length)) ends.push(this.length);
    if (this.end !== DEFAULT_TIME) ends.push(this.end);
    return ends.length > 0 ? min(ends) : NaN;
  }

  getStartHms() {
    return DateUtil.secondsToHms(this.getStartOffset());
  }

  getEndHms() {
    return DateUtil.secondsToHms(this.getEndOffset(true));
  }

  getSliceOpts(withTo=true) {
    let opts = [];
    if (this.getStartOffset() > 0) opts = opts.concat(['-ss', this.getStartHms()]);
    if (this.getEndOffset(true) < this.length && withTo) {
      opts = opts.concat(['-to', this.getEndHms()]);
    }
    return opts;
  }

  getOutputPath(dir, fname) {
    FS.ensureDir(dir);
    return path.join(dir, fname);
  }

  /**
   * Obtain duration based on movie information
   * @return {number} movie information duration
   * @public
   */
  getDuration(withConainer=false) {
    return Math.max(0, (this.getEndOffset(withConainer) - this.getStartOffset()) / this.speed);
  }

  toString() {
    return `${this.type}:${this.path}-length:${this.length}`;
  }

  destroy() {
    this.creator = null;
    this.info = null;
    this.path = '';
    this.length = 0;
  }
}

module.exports = Material;