'use strict';

/**
 * FFAudio - audio component-can be used to play sound
 *
 * ####Example:
 *
 *     const audio = new FFAudio(args);
 *
 * ####Note:
 *     Adding multiple audio inputs to video with ffmpeg not working?
 *     https://superuser.com/questions/1191642/adding-multiple-audio-inputs-to-video-with-ffmpeg-not-working
 *
 * @class
 * @param {object} conf FFAudio component related configuration
 */

const FFClip = require('../core/clip');
const Material = require('../material/material');
const { Howl, Howler } = require('howler');
const { isBrowser } = require("browser-or-node");
const AudioUtil = require('../utils/audio');

class FFAudio extends FFClip {
  constructor(conf) {
    conf = typeof conf === 'string' ? { path: conf } : conf;
    super({ type: 'audio', audio: true, ...conf});
    if (this.conf.active === false) this.audio = false;
  }

  get default() {
    const _default = super.default;
    return {
      startTime: _default.startTime,
      endTime: this.loop ? _default.endTime : undefined,
      duration: this.loop ? undefined : this.material?.getDuration(),
    }
  }

  updateMaterialTime() {
    this.material.parseTimeConf(this.conf);
  }

  disable() {
    this.audio = false;
    // super.disable();
  }

  enable() {
    this.audio = true;
    // super.enable();
  }

  set audio(audio) {
    this.conf.audio = !!audio;
    this.conf.audio ? super.enable() : super.disable();
    if (!this.conf.audio) this.pause(); // 不然可能停不下来
  }

  get audio() {
    return !!this.conf.audio;
  }

  get loop() {
    return !!this.conf.loop;
  }

  set loop(loop) {
    this.conf.loop = !!loop;
  }

  get speed() {
    return this.conf.speed;
  }

  set speed(speed) {
    this.conf.speed = speed;
    // todo: setHowl
  }

  get volume() {
    return isNaN(this.conf.volume) ? 1 : Math.max(Number(this.conf.volume), 0);
  }

  set volume(volume) {
    this.conf.volume = volume;
  }

  get fadeIn() {
    return isNaN(this.conf.fadeIn) ? 0 : Number(this.conf.fadeIn);
  }

  set fadeIn(fadeIn) {
    this.conf.fadeIn = fadeIn;
  }

  get fadeOut() {
    return isNaN(this.conf.fadeOut) ? 0 : Number(this.conf.fadeOut);
  }

  set fadeOut(fadeOut) {
    this.conf.fadeOut = fadeOut;
  }

  async setHowl(onprogress) {
    let path = this.material.path;
    if (!this.buffer) {
      this.buffer = await AudioUtil.getBuffer(path);
    }

    if (this.speed > 1.01 || this.speed < 0.99) {
      const opts = { speed: this.speed, onprogress };
      const url = await AudioUtil.apply(this.buffer, opts);
      if (this.prevPath) URL.revokeObjectURL(this.prevPath);
      this.prevPath = url; // 如果变速，之前的url需要revoke
      path = url;
    }

    this.howl = new Howl({ src: [path], format: ['mp3'], autoSuspend: false });
    return new Promise((resolve, reject) => {
      const onload = async () => {
        this.material.length = this.howl.duration();
        this.howl.volume(this.volume);
        resolve();
      }
      const state = this.howl.state();
      if (state === 'loaded') {
        onload();
      } else if (state === 'loading') {
        this.howl.once('load', onload);
        this.howl.once('loaderror', e => reject(e));
      } else {
        reject('state error!')
      }
    });
  }

  async preProcessing(onprogress) {
    this.material = new Material(this.conf);
    this.material.duration = this.parent.duration;
    this.material.length = 10;
    if (!isBrowser) return; // todo: probe length
    await this.setHowl(onprogress);
  }

  pause() {
    if (!isBrowser || !this.playing) return;
    this.fading = false; // unlock
    this.playing = false;
    this.howl.pause();
  }

  seekTime(time) {
    const speed = this.buffer.duration / this.material.length;
    const ss = this.material.getStartOffset() / speed;
    return Math.min(this.material.getDuration(), time) + ss;
  }

  async play(time) {
    if (!isBrowser || this.playing) return;
    this.playing = true;
    this.howl.volume(this.volume); // 需要重新设置，避免fade到0之后再seek就没声音
    this.howl.seek(this.seekTime(time));
    this.howl.rate(this.creator().playbackRate);
    const playId = this.howl.play();
    // 用一种hack的方式设置大于1的音量
    this.howl._sounds[0]._node.gain.value = this.volume;
  }

  async drawing(timeInMs = 0, nextDeltaInMS = 0) {
    if (!isBrowser) return false;
    let res = await super.drawing(timeInMs, nextDeltaInMS);
    if (!res || !this.audio) return this.pause();

    // timeInMs 是绝对时间，需要先相对parent求相对时间 relativeTime
    const relativeTime = (timeInMs / 1000) - this.parent.startTime;
    // currentTime是当前素材的时间
    this.currentTime = relativeTime - this.startTime;

    // fadeIn/fadeOut
    if (nextDeltaInMS) {
      if (this.currentTime < this.fadeIn) {
        const from = this.volume * (this.currentTime / this.fadeIn);
        this.fade(from, this.volume, this.fadeIn - this.currentTime, timeInMs);
      } else if (this.endTime - relativeTime < this.fadeOut) {
        const dur = this.endTime - relativeTime;
        const from = this.volume * (dur / this.fadeOut);
        this.fade(from, 0, dur, timeInMs);
      }
    }

    // loop
    const matDuration = this.material.getDuration();
    while (this.loop && this.currentTime >= matDuration) {
      this.currentTime = Math.max(0.0, this.currentTime - matDuration);
    }

    if (!nextDeltaInMS) return this.pause();
    const nextTime = this.currentTime + (nextDeltaInMS / 1000);
    nextTime < matDuration ? this.play(this.currentTime) : this.pause();
  }

  fade(from, to, duration, now) {
    if (this.fading > now) return;
    duration = (duration * 1000) >> 0;
    // console.log('fade', {from, to, duration, fading:this.fading, now});
    this.howl.fade(from, to, duration);
    this.fading = now + duration;
  }

  addInput(command) {
    command.addInput(this.material.path);
    if (this.loop) command.inputOptions(['-stream_loop', '-1']);
    const sliceOpts = this.material.getSliceOpts();
    if (sliceOpts) command.addInputOptions(sliceOpts);
  }

  toFilterCommand({ index }) {
    const input = `${1 + index}`;
    const output = `audio${index}`;
    const delay = this.toDelayFilter();
    const speed = this.toSpeedFilter();
    const volume = this.toVolumeFilter();
    const fadeIn = this.toFadeInFilter();
    const fadeOut = this.toFadeOutFilter();
    return `[${input}]${delay}${speed}${volume}${fadeIn}${fadeOut}[${output}]`;
  }

  toDelayFilter() {
    const delay = (this.absStartTime * 1000) >> 0;
    return `adelay=${delay}|${delay}`; // 左|右 声道
  }

  toSpeedFilter() {
    let { speed = 1 } = this;
    if (speed === 1) return '';
    return `,atempo=${speed}`;
  }

  toVolumeFilter() {
    let { volume = -1 } = this;
    if (volume === -1) return '';
    if (!this.audio) volume = 0;
    return `,volume=${volume}`;
  }

  toFadeInFilter() {
    const { fadeIn = -1, absStartTime = 0 } = this;
    if (fadeIn === -1) return '';
    return `,afade=t=in:st=${absStartTime}:d=${fadeIn}`;
  }

  toFadeOutFilter() {
    const { fadeOut = -1 } = this;
    if (fadeOut === -1) return '';
    // todo: consider material length < duration
    const start = Math.max(0, this.absEndTime - fadeOut);
    return `,afade=t=out:st=${start}:d=${fadeOut}`;
  }

  destroy() {
    super.destroy();
    this.material?.destroy();
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }
  }
}

module.exports = FFAudio;
