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
const { isBrowser } = require("browser-or-node");
const AudioUtil = require('../utils/audio');
const { nodeRequire } = require('../utils/utils');
const probe = nodeRequire('ffmpeg-probe');

class FFAudio extends FFClip {
  constructor(conf) {
    conf = typeof conf === 'string' ? { path: conf } : conf;
    super({ type: 'audio', audio: true, ...conf});
    if (this.conf.active === false) this.audio = false;
    this.active = this.audio;
  }

  createDisplay() {
    this.display = null;
  }

  get default() {
    const _default = super.default;
    return {
      startTime: _default.startTime,
      endTime: this.loop ? _default.endTime : undefined,
      duration: this.loop ? undefined : this.material?.getDuration(),
    }
  }

  annotate() {
    super.annotate();
    // set material duration
    this.material.duration = this.duration;
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
    return !!this.conf.audio && !this.muted;
  }

  get loop() {
    return !!this.conf.loop;
  }

  set loop(loop) {
    this.conf.loop = !!loop;
  }

  get pitch() {
    return Number(this.conf.pitch) || 1.0;
  }

  set pitch(pitch) {
    this.conf.pitch = Number(pitch) || 1.0;
  }

  get speed() {
    return this.material.speed;
  }

  set speed(speed) {
    this.conf.speed = speed;
    this.material.setSpeed(speed);
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

  async preProcessing(onprogress) {
    if (this.material) this.material.destroy();
    this.material = new Material(this.conf);
    this.material.duration = this.duration;
    if (!isBrowser) {
      const info = await probe(this.material.path);
      this.material.length = info.duration / 1000;
      return;
    }

    this.buffer = await AudioUtil.getBuffer(this.material.path, onprogress);
    this.material.length = this.buffer.duration;
    if (!this.ctx) this.ctx = new AudioContext();
    if (!this.gainNode) {
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }

    const { PitchShifter } = require('soundtouchjs');
    this.sourceNode = new PitchShifter(this.ctx, this.buffer, 1024);
    this.sourceNode.on('play', (detail) => {
      // console.log('play', detail);
    });
  }

  pause() {
    if (!isBrowser || !this.playing) return;
    this.fading = false; // unlock
    this.playing = false;
    // PitchShifter的pause就是disconnect
    this.sourceNode.disconnect();
  }

  async play(time) {
    if (!isBrowser || this.playing) return;
    // PitchShifter的seek居然是百分比。。。奇葩
    this.sourceNode.percentagePlayed = this.material.seekTime(time) / this.material.length;
    this.sourceNode.tempo = this.speed;
    this.sourceNode.pitch = this.pitch;
    // PitchShifter的play是connect+ctx.resume
    this.sourceNode.connect(this.gainNode);
    await this.ctx.resume();
    this.playing = true;
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
      } else { // 需要重新设置，避免fade到0之后再seek就没声音
        this.gainNode.gain.value = this.volume;
      }
    }

    // loop
    const matDuration = this.material.getDuration();
    while (this.loop && this.currentTime >= matDuration) {
      this.currentTime = Math.max(0.0, this.currentTime - matDuration);
    }

    // loop的时候，每一遍最后的nextTime肯定大于matDuration，就会暂停，下一帧再seek后开始播
    const nextTime = this.currentTime + (nextDeltaInMS / 1000);
    if (!nextDeltaInMS || nextTime >= matDuration) return this.pause();
    this.play(this.currentTime);
  }

  fade(from, to, duration, now) {
    if (this.fading > now) return;
    // console.log('fade', {from, to, duration, fading:this.fading, now});
    this.gainNode.gain.value = from;
    this.gainNode.gain.linearRampToValueAtTime(to, this.ctx.currentTime + duration);
    this.fading = now + (duration * 1000) >> 0;
  }

  addInput(command) {
    command.addInput(this.material.path);
    // loop就不要to了
    const sliceOpts = this.material.getSliceOpts(!this.loop);
    if (sliceOpts) command.addInputOptions(sliceOpts);
  }

  toFilterCommand({ index }) {
    const input = `${1 + index}`;
    const output = `audio${index}`;
    const loop = this.toLoopFilter();
    const delay = this.toDelayFilter();
    const speed = this.toSpeedFilter();
    const volume = this.toVolumeFilter();
    const fadeIn = this.toFadeInFilter();
    const fadeOut = this.toFadeOutFilter();
    return `[${input}]${delay}${loop}${speed}${volume}${fadeIn}${fadeOut}[${output}]`;
  }

  toLoopFilter() {
    if (!this.loop) return '';
    const dur = this.material.getEndOffset(true) - this.material.getStartOffset();
    const r = '44100';
    return `,asetrate=${r},aloop=-1:size=${dur}*${r}`;
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
    this.sourceNode = null;
    this.gainNode = null;
    this.buffer = null;
    this.ctx = null;
  }
}

module.exports = FFAudio;
