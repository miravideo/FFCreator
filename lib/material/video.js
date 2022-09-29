'use strict';

/**
 * VideoMaterial
 * @class
 */

const { isBrowser } = require("browser-or-node");
const ImageMaterial = require('./image');
const min = require('lodash/min');
const FFLogger = require('../utils/logger');
const md5 = require('md5');
const { nodeRequire, isUA } = require('../utils/utils');
const { times } = require("lodash");
const VideoHolder = require("../utils/video");
const Queue = require("../utils/queue");
const probe = nodeRequire('ffmpeg-probe');
const FFmpegUtil = nodeRequire('../utils/ffmpeg');
const cv = nodeRequire('../utils/opencv');
const FS = nodeRequire('../utils/fs');

const K_PLAYER = 'player';
const K_SEEKER = 'seeker';
const K_INIT = 'init';
const ADJ_STEP = 0.02;

const PROBE_CACHE = {};

class VideoMaterial extends ImageMaterial {
  constructor(conf) {
    super(conf);
    this.setVolume(conf.volume);
    this.setAudio(conf.audio === undefined ? true : !!conf.audio);

    // todo: 实测下来视频播放都有0.05秒左右的延迟
    this.OFFSET_TIME = 0.05;

    // for frontend player
    this.adjustTime = 0;
    this.adjustRate = 1.0;
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

  setVolume(volume) {
    this.volume = Number(volume);
    if (isNaN(this.volume)) this.volume = 1.0;
  }

  setAudio(audio) {
    this.useAudio = audio;
    const $video = this.$vh && this.$vh[K_PLAYER]?.$video;
    if ($video && $video.muted === this.useAudio) {
      $video.muted = !this.useAudio;
      if (this.useAudio) this.$vh[K_PLAYER].setVolume(this.volume);
      // console.log(this.creator.currentTime * 0.001, this.holderId, 'mute:', $video.muted);
    }
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
      if (!PROBE_CACHE[this.path]) {
        PROBE_CACHE[this.path] = await probe(this.path);
      }
      this.info = {...PROBE_CACHE[this.path]};
      this.info.duration /= 1000; // from ms -> s
      try {
        this.videoCap = cv.VideoCapture(this.path);
      } catch (e) {}
      this.acommand = FFmpegUtil.createCommand();
      this.vcommand = FFmpegUtil.createCommand();
    }

    // this.info.width *= 0.5;
    // this.info.height *= 0.5;

    this.canvas = this.initCanvas(this.info.width, this.info.height);
    this.canvasContext = this.canvas.getContext('2d');
    // todo: check if duration is hms format by probe
    this.length = this.info.duration;
  }

  get hasAudio() {
    return this.info?.streams && this.info.streams.some(x => x.codec_type === 'audio');
  }

  async valloc(key) {
    if (this.$vh[key]) return this.$vh[key].$video;
    try {
      this.$vh[key] = await VideoHolder.get(this.path,
        this.creator.uuid, `${this.holderId}-${key}`);
    } catch (e) {
      return null;
    }
    const $video = this.$vh[key].$video;
    // todo: 处理播放速度等
    // 先都静音，drawing里会再根据情况设置是否发声
    $video.muted = true;
    return $video;
  }

  velease(key) {
    if (!this.$vh[key]) return;
    this.$vh[key].release(); // 暂停后就释放
    this.$vh[key] = null;
    // console.log('velease', this.holderId, key);
  }

  async play(seekTime) {
    if (this.playing) return;
    const $video = await this.valloc(K_PLAYER);
    // 时间差在0.1秒内，就不重新seek里，留给adjust
    if (Math.abs(seekTime - $video.currentTime) > 0.1
       || !this.creator.getConf('adjustPlaySpeed')) {
      $video.currentTime = seekTime;
      // console.log('play', this.holderId, seekTime);
    }
    this.adjustRate = 1.0; // reset
    this.adjustTime = this.creator.currentTime;
    $video.playbackRate = this.playrate;
    return new Promise(resolve => {
      if (VideoMaterial.playing($video)) {
        this.playing = true;
        resolve();
      } else {
        $video.addEventListener('playing', () => {
          this.playing = true;
          resolve();
        }, { once: true });
        $video.play();
      }
    });
  }

  pause() {
    if (!this.playing && !this.perpared) return;
    const $video = this.$vh[K_PLAYER]?.$video;
    const clear = () => {
      this.playing = false;
      this.perpared = false;
      this.velease(K_PLAYER); // 暂停后就释放
    }
    if (!$video || !VideoMaterial.playing($video)) {
      clear();
    } else {
      $video.addEventListener('pause', (e) => clear(), { once: true });
      $video.pause();
    }
  }

  async perpare(time, play=false) {
    if (this.perpared || !isBrowser) return;
    this.perpared = true;
    const $video = await this.valloc(K_PLAYER);
    const seekTime = this.seekTime(time);
    if (Math.abs($video.currentTime - seekTime) > 0.1) {
      $video.currentTime = seekTime;
      if (play) $video.play(); // todo: 先动起来会更不卡一些？
      // console.log('perpare', this.holderId, seekTime);
    }
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

  get playrate() {
    return this.creator.playbackRate * this.speed;
  }

  seekTime(time, opt={}) {
    return super.seekTime(isBrowser ? time + this.OFFSET_TIME : time, opt);
  }

  async getFrameByTime(time, delta=0) {
    this.time = time;
    const opt = {};
    const seekTime = this.seekTime(time, opt);
    if (isBrowser) {
      if (opt.overflow) delta = 0; // 时间溢出了，就暂停
      delta > 0 ? await this.play(seekTime) : this.pause();
    } else {
      if (!this.videoCap) {
        return this.getFrame(Math.max(0, (time * this.fps) >> 0));
      }
      // return this.cutout(cv.getFrameByTime(this.videoCap, seekTime));
      return cv.getFrameByTime(this.videoCap, seekTime);
    }
    return new Promise(async (resolve, reject) => {
      // todo: 如果浏览器状态，播放过程中停止了(loading卡住)，这里需要有事件响应
      const width = this.canvas.width;
      const height = this.canvas.height;
      if (delta > 0) {
        const $video = this.$vh[K_PLAYER]?.$video;
        if (!$video) return resolve();
        this.playerDelay = seekTime - $video.currentTime;
        // console.log('playing', (this.$video.currentTime - time - this.getStartOffset()).toFixed(3))
        if (this.creator.getConf('adjustPlaySpeed') // 只有Chrome可以，Safari这样调整会卡死
         && (this.playrate * this.adjustRate).toFixed(3) === $video.playbackRate.toFixed(3)) { // 确保之前设置的已经生效了
          if (Math.abs(this.playerDelay) > 0.05) {// 时间差太多，改speed
            this.adjustRate += (this.playerDelay > 0 ? ADJ_STEP : -ADJ_STEP);
            this.adjustRate = Math.max(Math.min(this.adjustRate, 1.05), 0.95);
          } else if ($video.playbackRate != this.playrate) {
            this.adjustRate += this.adjustRate > 1 ? -ADJ_STEP : ADJ_STEP;
          }

          const r = this.playrate * this.adjustRate;
          if (r.toFixed(3) !== $video.playbackRate.toFixed(3) // 100ms内不能重复adjust
           && Math.abs(this.creator.currentTime - this.adjustTime) > 100) {
            // console.log('set rate!', this.holderId, (this.creator.currentTime*0.001).toFixed(3), r);
            $video.playbackRate = r;
            this.adjustTime = this.creator.currentTime;
          }
        }
        // console.log('force speed!', this.holderId, this.playerDelay.toFixed(3), $video.playbackRate);
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
    let path = this.vpath.replace('%d', index);
    if (!FS.exists(path)) path = this.lastPath; // 保持最后一帧
    this.lastPath = path;
    return path;
  }

  /**
   * Extract the audio/video file from the movie
   * @public
   */
  async extract(dir, withVideo) {
    const name = md5(`${this.path}-${this.getStartHms()}-${this.getEndHms(true)}`);
    if (!this.videoCap && withVideo) {
      console.log('---------------- extract video ----------------', this.holderId);
      const ss = Date.now();
      await this.extractVideo(dir, `${name}_video`);
      cv.timer += Date.now() - ss;
    }
    if (this.useAudio) {
      console.log('---------------- extract audio ----------------');
      await this.extractAudio(dir, `${name}_audio`);
    }
  }

  async extractAudio(dir, name) {
    const output = this.getOutputPath(dir, `${name}.mp3`);
    // 已经存在就不再导出了
    if (FS.exists(output)) return this.apath = output;
    let outOpts = `-loglevel info`.split(' ');
    outOpts = outOpts.concat(`-af atempo=${this.speed}`.split(' '));
    // outOpts = outOpts.concat(this.getSliceOpts());
    const inOpts = this.getSliceOpts();
    const command = this.acommand.noVideo().audioCodec('libmp3lame');
    this.apath = await this.ffCmdExec({ command, inOpts, output, outOpts });
    return this.apath;
  }

  async extractVideo(dir, name) {
    let outOpts = `-loglevel info -pix_fmt rgba -start_number 0`.split(' ');
    const args = `-qscale:v ${this.clarity} -filter_complex [0:v]setpts=PTS/${this.speed}[sv];[sv]fps=${this.fps}[ov] -map [ov]`;
    outOpts = outOpts.concat(args.split(' '));
    let inOpts = this.codec ? `-c:v ${this.codec}`.split(' ') : [];
    inOpts = inOpts.concat(this.getSliceOpts());
    const output = this.getOutputPath(dir, `${name}_%d.${this.voImageExtra}`);
    // 已经存在就不再导出了
    if (FS.exists(output.replace('%d', '0'))) return this.vpath = output;
    this.vpath = await this.ffCmdExec({ command:this.vcommand, output, inOpts, outOpts });
    return this.vpath;
  }

  ffCmdExec({ command, output, inOpts, outOpts, onProgress }) {
    const opt = function(opts) {
      if (typeof opts === "string") opts = opts.split(' ');
      if (opts instanceof Array) opts = opts.filter(a => a !== '');
      return opts;
    }
    command.addInput(this.path).output(output);
    inOpts && command.inputOptions(opt(inOpts));
    outOpts && command.outputOptions(opt(outOpts));
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
    this.videoCap && cv.destroy(this.videoCap);
    if (this.queue) this.queue.destroy();
    this.queue = null;
    super.destroy();
  }
}

module.exports = VideoMaterial;
