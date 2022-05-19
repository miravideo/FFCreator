'use strict';

/**
 * VideoMaterial
 * @class
 */

const { isBrowser } = require("browser-or-node");
const ImageMaterial = require('./image');
const min = require('lodash/min');
const FFLogger = require('../utils/logger');

const { nodeRequire, isUA } = require('../utils/utils');
const OpenCVUtil = require("../utils/opencv");
const { times } = require("lodash");
const VideoHolder = require("../utils/video");
const Queue = require("../utils/queue");
const probe = nodeRequire('ffmpeg-probe');
const FFmpegUtil = nodeRequire('../utils/ffmpeg');
const cv = nodeRequire('../utils/opencv');

const K_PLAYER = 'player';
const K_SEEKER = 'seeker';
const K_INIT = 'init';

class VideoMaterial extends ImageMaterial {
  constructor(conf) {
    super(conf);
    this.setSpeed(Number(conf.speed) || 1.0);
    this.setVolume(conf.volume);
    this.setAudio(conf.audio === undefined ? true : !!conf.audio);

    // for frontend player
    this.time = 0;
    this.playing = false;
    this.perpared = false;
    this.queue = new Queue();
    this.$vh = {};

    // for backend burner
    this.codec = conf.codec;
    this.clarity = conf.qscale || conf.clarity || 2;
    this.voImageExtra = conf.voImageExtra === undefined ? 'jpg' : conf.voImageExtra;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setVolume(volume) {
    this.volume = Number(volume);
    if (isNaN(this.volume)) this.volume = 1.0;
  }

  setAudio(audio) { 
    this.useAudio = audio;
    if (this.$video) this.$video.muted = !this.useAudio;
  }

  async init(opts) {
    const { fps } = opts;
    this.fps = fps; // target fps
    if (isBrowser) {
      await this.valloc(K_INIT);
      this.info = await this.$vh[K_INIT].getInfo();
      this.velease(K_INIT); // 拿完之后就释放
      this.creator.mVIDEOS.push(this);
    } else {
      this.info = await probe(this.path);
      this.info.duration /= 1000; // from ms -> s
      this.videoCap = cv.VideoCapture(this.path);
      this.acommand = FFmpegUtil.createCommand();
      this.vcommand = FFmpegUtil.createCommand();
    }

    this.canvas = this.initCanvas(this.info.width, this.info.height);
    this.canvasContext = this.canvas.getContext('2d');
    // todo: check if duration is hms format by probe
    this.length = this.info.duration;
  }

  async grantPlay() {
    // todo: vh!!!!!!!!!!!
    // safari只能在用户点击事件的回调里先play()，"获取权限"之后js才能后续play/pause
    // const video = this.$video;
    // if (this.useAudio) {
    //   if (isUA('chrome')) {
    //     setMediaElement(video, {volume: this.volume});
    //   } else { // 很多浏览器不支持声音变速
    //     video.volume = Math.min(1, this.volume);
    //   }
    // }
    // const muted = video.muted; // 先mute，不出声
    // video.muted = true;
    // await video.play();
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     video.pause(); // 开始play之后，立刻暂停并恢复原先的mute状态
    //     video.muted = muted;
    //     setTimeout(() => resolve(), 1);
    //   }, 1);
    // });
  }

  async valloc(key) {
    if (this.$vh[key]) return this.$vh[key].$video;
    try {
      this.$vh[key] = await VideoHolder.get(this.path, `${this.holderId}-${key}`);
    } catch (e) {
      return null;
    }
    const $video = this.$vh[key].$video;
    // todo: 处理音量、播放速度等
    $video.muted = key !== K_PLAYER || !this.useAudio;
    if (!$video.muted) this.$vh[key].setVolume(this.volume);
    return $video;
  }

  velease(key) {
    if (!this.$vh[key]) {
      throw new Error(`empty key!! can not release: ${this.holderId} ${key}`);
    }
    this.$vh[key].release(); // 暂停后就释放
    this.$vh[key] = null;
    // console.log('velease', this.holderId, key);
  }

  async play(seekTime) {
    if (this.playing) return;
    const $video = await this.valloc(K_PLAYER);
    if (Math.abs($video.currentTime - seekTime) > 0.1) {
      $video.currentTime = seekTime;
    }
    $video.playbackRate = this.creator.playbackRate; // todo: * this.speed
    return new Promise(resolve => {
      $video.addEventListener('playing', resolve, { once: true });
      $video.play();
      this.playing = true;
    });
  }

  pause() {
    if (!this.playing && !this.perpared) return;
    const $video = this.$vh[K_PLAYER].$video;
    $video.pause();
    this.playing = false;
    this.perpared = false;
    this.velease(K_PLAYER); // 暂停后就释放
  }

  async perpare() {
    if (this.perpared || !isBrowser) return;
    this.perpared = true;
    const $video = await this.valloc(K_PLAYER);
    const seekTime = this.seekTime(0);
    if (Math.abs($video.currentTime - seekTime) > 0.1) {
      $video.currentTime = seekTime;
    }
  }

  seekTime(time) {
    return min([this.getDuration(), time]) + this.getStartOffset();
  }

  async seekTo(seekTime, key=K_SEEKER) {
    return new Promise(async (resolve, reject) => {
      const $video = await this.valloc(key);
      if (!$video) return resolve();
      // console.log('alloc!!!', this.holderId, this.$vh[K_SEEKER].id);
      if ($video.currentTime.toFixed(2) == seekTime.toFixed(2)) {
        resolve($video);
        this.velease(key);
      } else {
        $video.currentTime = seekTime;
        $video.addEventListener('seeked', () => {
          resolve($video);
          this.velease(key);
        }, { once: true });
      }
    });
  }

  async queuedSeekTo(seekTime, key=K_SEEKER) {
    return new Promise(async (resolve, reject) => {
      this.queue.enqueue(async () => {
        resolve(await this.seekTo(seekTime, key));
      });
    });
  }

  async getFrameByTime(time, delta=0) {
    this.time = time;
    const seekTime = this.seekTime(time);
    if (isBrowser) {
      delta > 0 ? await this.play(seekTime) : this.pause();
    } else {
      if (!this.videoCap) return this.getFrame((time * this.fps) >> 0);
      return this.cutout(cv.getFrameByTime(this.videoCap, seekTime));
    }
    return new Promise(async (resolve, reject) => {
      // todo: 如果浏览器状态，播放过程中停止了(loading卡住)，这里需要有事件响应
      const width = this.canvas.width;
      const height = this.canvas.height;
      if (delta > 0) {
        const $video = this.$vh[K_PLAYER].$video;
        this.playerDelay = seekTime - $video.currentTime;
        // console.log('playing', (this.$video.currentTime - time - this.getStartOffset()).toFixed(3))
        resolve(this.drawCanvas($video, width, height));
      } else {
        // seek to time + ss (start offset)
        resolve(this.drawCanvas(await this.queuedSeekTo(seekTime), width, height));
      }
    });
  }

  delay() {
    return this.playerDelay;
  }

  getFrame(index) {
    const i = index < this.frames ? index : this.frames - 1; // 保持最后一帧
    return this.vpath.replace('%d', i);
  }

  /**
   * Extract the audio/video file from the movie
   * @public
   */
  async extract(dir, name) {
    if (!this.videoCap) await this.extractVideo(dir, `${name}_video`);
    if (this.useAudio) return await this.extractAudio(dir, `${name}_audio`);
  }

  async extractAudio(dir, name) {
    const output = this.getOutputPath(dir, `${name}.mp3`);
    const outOpts = this.getSliceOpts();
    const command = this.acommand.noVideo().audioCodec('libmp3lame');
    this.apath = await this.ffCmdExec({ command, output, outOpts });
    return this.apath;
  }

  async extractVideo(dir, name) {
    let outOpts = `-loglevel info -pix_fmt rgba -start_number 0`.split(' ');
    outOpts = outOpts.concat(`-vf fps=${this.fps} -qscale:v ${this.clarity}`.split(' '));
    outOpts = outOpts.concat(this.getSliceOpts());
    const inOpts = this.codec ? `-c:v ${this.codec}` : "";
    const output = this.getOutputPath(dir, `${name}_%d.${this.voImageExtra}`);
    const onProgress = (progress) => { this.frames = progress.frames };
    this.vpath = await this.ffCmdExec({ command:this.vcommand, output, inOpts, outOpts, onProgress });
    return this.vpath;
  }

  ffCmdExec({ command, output, inOpts, outOpts, onProgress }) {
    const opt = function(opts) {
      if (typeof opts === "string") opts = opts.split(' ');
      if (opts instanceof Array) opts = opts.filter(a => a !== '');
      return opts;
    }
    inOpts && command.inputOptions(opt(inOpts));
    outOpts && command.outputOptions(opt(outOpts));
    command.addInput(this.path).output(output);
    return new Promise((resolve, reject) => {
      command
        .on('start', commandLine => {
          FFLogger.info({ pos: 'Material', msg: `${this.type} preProcessing start: ${commandLine}` });
        })
        .on('progress', progress => {
          onProgress && onProgress(progress);
        })
        .on('end', () => {
          FFLogger.info({ pos: 'Material', msg: `${this.type} preProcessing completed: ${this}` });
          resolve(output);
        })
        .on('error', error => {
          FFLogger.error({ pos: 'Material', msg: `${this.type} preProcessing error: `, error });
          reject(error);
        });
      command.run();
    });
  }

  destroy() {
    for (const k of Object.keys(this.$vh)) {
      if (this.$vh[k]) this.velease(k);
    }
    if (this.canvas) {
      this.canvas = null;
      this.canvasContext = null;
      this.playing = false;
    }
    this.acommand && FFmpegUtil.destroy(this.acommand);
    this.vcommand && FFmpegUtil.destroy(this.vcommand);
    this.videoCap && OpenCVUtil.destroy(this.videoCap);
    super.destroy();
  }
}

module.exports = VideoMaterial;