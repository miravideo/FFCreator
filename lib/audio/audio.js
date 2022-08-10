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
let PitchShifter;

if (isBrowser) {
  PitchShifter = require('soundtouchjs').PitchShifter;
}

const SAMPLE_RATE = 44100;

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
    if (!this.material) return;
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

  mute(muted) {
    this.muted = muted;
  }

  resetMute() {
    this.muted = false;
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

    // todo: 延长0.2s
    this.buffer = await AudioUtil.getBuffer(this.material.path,
      this.creator().uuid, 0.2, onprogress);
    this.material.length = this.buffer.duration;
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

  initAudioCtx() {
    if (!this.ctx) this.ctx = new AudioContext();
    if (!this.gainNode) {
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
    if (!this.sourceNode) {
      this.sourceNode = new PitchShifter(this.ctx, this.buffer, 1024);
    }
  }

  async destroyAudioCtx() {
    if (!this.ctx) return
    await this.ctx.close();
    this.ctx = null;
    this.gainNode = null;
    this.sourceNode = null;
  }

  async drawing(timeInMs = 0, nextDeltaInMS = 0) {
    if (!isBrowser) return false;
    let res = await super.drawing(timeInMs, nextDeltaInMS);
    if (!res || !this.audio) {
      this.pause();
      await this.destroyAudioCtx()
      return false
    }

    this.initAudioCtx()

    // timeInMs 是绝对时间，需要先相对parent求相对时间 relativeTime
    const relativeTime = (timeInMs / 1000) - this.parent.startTime;
    // currentTime是当前素材的时间
    this.currentTime = relativeTime - this.startTime;

    // fadeIn/fadeOut
    if (nextDeltaInMS) {
      if (this.currentTime < this.fadeIn) {
        const from = this.volume * (this.currentTime / this.fadeIn);
        this.fade(from, this.volume, this.fadeIn - this.currentTime, timeInMs);
      } else if (this.endTime > relativeTime && this.endTime - relativeTime < this.fadeOut) {
        const dur = this.endTime - relativeTime;
        const from = this.volume * (dur / this.fadeOut);
        this.fade(from, 0, dur, timeInMs);
      } else { // 需要重新设置，避免fade到0之后再seek就没声音
        this.gainNode.gain.value = this.volume;
      }
    }

    // loop
    const matDuration = this.material.getDuration();
    let loops = 0;
    while (this.loop && this.currentTime >= matDuration) {
      this.currentTime = Math.max(0.0, this.currentTime - matDuration);
      loops++;
    }

    if (loops > 0 && this.loops != loops) {
      this.loops = loops;
      // loop的时候，每一遍最后的nextTime肯定大于matDuration，就会暂停，下一帧再seek后开始播
      return this.pause();
    }

    if (!nextDeltaInMS) return this.pause();
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
    let opts = ['-vn']; // 仅音频，不要视频
    // loop就不要to了
    const sliceOpts = this.material.getSliceOpts(!this.loop);
    if (sliceOpts) opts = opts.concat(sliceOpts);
    command.addInputOptions(opts);
  }

  toFilterCommand({ input, output }) {
    const loop = this.toLoopFilter();
    const delay = this.toDelayFilter();
    const speed = this.toSpeedFilter();
    // const pitch = this.toPitchFilter(); // 已经在loop里了
    const volume = this.toVolumeFilter();
    const fadeIn = this.toFadeInFilter();
    const fadeOut = this.toFadeOutFilter();

    let trim = '';
    // if (this.audioStartTime && this.audioStartTime > this.absStartTime) {
    //   trim = `[${output}_t];[${output}_t]atrim=${this.audioStartTime-this.absStartTime}:${this.absEndTime-this.absStartTime}`;
    // } else if (this.audioEndTime && this.audioEndTime < this.absEndTime) {
    //   trim = `[${output}_t];[${output}_t]atrim=${this.absStartTime-this.absStartTime}:${this.audioEndTime-this.absStartTime}`;
    // }

    return `[${input}]aformat=sample_rates=${SAMPLE_RATE},${delay}${loop}${speed}${volume}${fadeIn}${fadeOut}${trim}[${output}]`;
  }

  toLoopFilter() {
    let { pitch = 1, loop } = this;
    // size是单次循环时长
    const dur = this.material.getEndOffset(true) - this.material.getStartOffset();
    const sr = SAMPLE_RATE;
    const r = sr * pitch;
    return `,asetrate=${r},aresample=${sr},aloop=${loop ? '-1' : '0'}:size=${dur * sr}`;
  }

  toDelayFilter() {
    let { speed = 1, pitch = 1 } = this;
    speed /= pitch; // atempo的设置会影响这里的时间，但不会影响到fadeIn/Out的时间
    const delay = (this.absStartTime * speed * 1000) >> 0;
    return `adelay=${delay}|${delay}`; // 左|右 声道
  }

  // toPitchFilter() {
  //   let { pitch = 1 } = this;
  //   if (pitch === 1) return '';
  //   let setRate = '';
  //   const r = 44100 * pitch;
  //   if (!this.loop) setRate = `,asetrate=${r.toFixed(2)}`;
  //   return `${setRate},aresample=44100`;
  // }

  toSpeedFilter() {
    let { speed = 1, pitch = 1 } = this;
    speed /= pitch;
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
    if (fadeIn <= 0) return '';
    return `,afade=t=in:st=${absStartTime}:d=${fadeIn}`;
  }

  toFadeOutFilter() {
    const { fadeOut = -1 } = this;
    if (fadeOut <= 0) return '';
    // todo: consider material length < duration
    const start = Math.max(0, this.absEndTime - fadeOut);
    return `,afade=t=out:st=${start}:d=${fadeOut}`;
  }

  destroy() {
    super.destroy();
    this.material?.destroy();
    this.buffer = null;
    this.destroyAudioCtx();
  }
}

module.exports = FFAudio;
