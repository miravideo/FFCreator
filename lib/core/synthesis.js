'use strict';

/**
 * Synthesis - A class for video synthesis.
 * Mainly rely on the function of ffmpeg to synthesize video and audio.
 *
 * ####Example:
 *
 *     const synthesis = new Synthesis(conf);
 *     synthesis.addStream(stream);
 *     synthesis.addAudios(audios);
 *     synthesis.start();
 *
 *
 * @class
 */
const path = require('path');
const isEmpty = require('lodash/isEmpty');
const forEach = require('lodash/forEach');

const FS = require('../utils/fs');
const Utils = require('../utils/utils');
const FFLogger = require('../utils/logger');
const FFmpegUtil = require('../utils/ffmpeg');
const FFEventer = require('../event/eventer');

class Synthesis extends FFEventer {
  constructor(conf) {
    super();

    this.conf = conf;
    this.cover = null;
    this.audios = [];
    this.videos = [];
    this.duration = 0;
    this.framesNum = 100;
    this.outputOptions = [];
    const threads = conf.getVal('threads');
    this.command = FFmpegUtil.createCommand({ threads });
  }

  /**
   * Set the ffcreator total duration
   * @param {number} duration - total duration time
   * @public
   */
  setDuration(duration) {
    this.duration = duration;
    this.framesNum = Math.round(duration * this.conf.getVal('fps'));
  }

  /**
   * Add the intermediate pictures processed in the cache directory to ffmpeg input
   * @param {Stream} stream - A readability stream
   * @public
   */
  addStream(stream) {
    const { conf, command } = this;
    const type = conf.getVal('cacheFormat');
    command.addInput(stream);
    if (type === 'raw') command.inputFormat('rawvideo');
    this.addStreamInputOptions();
    this.stream = stream;
  }

  /**
   * Add input options for image input stream
   * @private
   */
  addStreamInputOptions() {
    const { conf, command } = this;
    const size = conf.getWH('x');
    const fps = conf.getVal('fps');
    const type = conf.getVal('cacheFormat');
    // format = RGBA if use webgl
    const format = this.conf.getVal('useGL') ? 'rgba' : 'bgra';

    const opts = ['-framerate', fps];
    // raw (unencoded data in BGRA order on little-endian (most) systems, ARGB on big-endian systems; top-to-bottom)
    const newOpts =
      type === 'raw'
        ? ['-s', size, '-vcodec', 'rawvideo', '-pixel_format', format, '-video_size', size]
        : [];

    command.inputOptions(opts.concat(newOpts));
  }

  /**
   * Add ordinary ffmpeg cover input elements
   * @param {string} input - A input elements
   * @public
   */
  addCover(cover) {
    this.cover = cover;
  }

  /**
   * add audios to ffmpeg config
   * @public
   */
  addAudios(audios) {
    if (isEmpty(audios)) return;

    const { command } = this;
    forEach(audios, audio => {
      if (!audio.audio) return;
      audio.addInput(command);
      this.audios.push(audio);
    });
  }

  addNullAudio() {
    const { command } = this;
    command.addInput('anullsrc');
    command.addInputOptions(['-f', 'lavfi']);
  }

  /**
   * Add one or more background sounds
   * ##Note: Usage of adelay/volume filter
   * [1]adelay=5000|5000,volume=1[a];
   * [2]adelay=10000|10000,volume=10[b];
   * [3]adelay=15000|15000,volume=2[c];
   * [a][b][c]amix=3[a]
   * @param {array} audios - background sounds
   * @private
   */
  addAudioFilter() {
    this.audioFilters = [];
    const { conf, audios } = this;
    if (isEmpty(audios)) return;

    const normalizeAudio = conf.getVal('normalizeAudio');
    const length = audios.length;
    let outputs = '';

    let index = this.videos.length + (this.stream ? 1 : 0);
    forEach(audios, audio => {
      if (!audio.audio) return;
      const input = `${index}`;
      const output = `audio${index}`;
      const audioCommand = audio.toFilterCommand({ input, output });
      this.audioFilters.push(audioCommand);
      outputs += `[${output}]`;
      index++;
    });

    if (!outputs) return;
    if (normalizeAudio) {
      // 默认为true，否则多个音频的音量会被等分，导致最后的音量太小
      this.audioFilters.push(`${outputs}amix=inputs=${length}:normalize=0[aout]`);
    } else {
      this.audioFilters.push(`${outputs}amix=${length}[aout]`);
    }
  }

  addVideos(videos) {
    if (isEmpty(videos)) return;

    const { command } = this;
    videos.sort((a, b) => a.zIndex - b.zIndex);
    forEach(videos, video => {
      const canFastRender = video.canFastRender();
      FFLogger.log({ pos: 'Synthesis', msg: `Video: ${video.id}  canFastRender: ${canFastRender}` });
      if (!canFastRender) return;
      video.addInput(command);
      this.videos.push(video);
    });
  }

  addVideoFilter() {
    this.videoFilters = [];
    let index = this.stream ? 1 : 0;
    const format = 'colormatrix=bt601:bt709,format=yuv420p';
    const useGL = this.conf.getVal('useGL');
    if (!this.videos || !this.videos.length) {
      if (this.stream) this.videoFilters.push(`[0:v]${format}${useGL ? ',vflip' : ''}[vout]`);
      return;
    }

    // todo: creator/scene background color
    this.command.addInput(`color=s=${this.conf.getWH('x')}:c=${this.conf.getVal('bgColor')}`);
    this.command.addInputOptions(['-f', 'lavfi']);
    let background = 'bg';
    this.videoFilters.push(`[${index+this.audios.length+this.videos.length}]copy[${background}]`);

    this.videos.map(video => {
      const input = `${index}:v`;
      const output = `video${index}`;
      const filters = video.toFilters({ input, output, background });
      if (!filters || !filters.length) return;
      this.videoFilters = this.videoFilters.concat(filters);
      index++;
      background = output;
    });

    if (this.stream && useGL) {
      let filter = `[${background}][0:v]overlay=0:0,${format}[vout]`;
      if (useGL) filter = `[0:v]vflip[vsm];[${background}][vsm]overlay=0:0,${format}[vout]`;
      this.videoFilters.push(filter);
    } else {
      this.videoFilters.push(`[${background}]${format}[vout]`);
    }
  }

  /**
   * Add ffmpeg input configuration
   * @private
   */
  addInputOptions() {
    const { conf, command } = this;
    const customOpts = conf.getVal('inputOptions');
    customOpts && command.inputOptions(customOpts);
  }

  /**
   * Get default ffmpeg output configuration
   * @private
   */
  getDefaultOutputOptions(configs) {
    const { merge, options = [] } = configs || {};
    const { conf } = this;
    const vb = conf.getVal('vb');
    const fps = conf.getVal('fps');
    const crf = conf.getVal('crf');
    const preset = conf.getVal('preset');

    let opts = []
      // misc
      .concat([
        '-hide_banner', // hide_banner - parameter, you can display only meta information
        '-map_metadata', '-1',
        '-map_chapters', '-1',
      ]);

    if (this.audioFilters.length > 0) {
      opts = opts.concat(['-map', '[aout]']);
    }

    if (this.videoFilters.length > 0) {
      opts = opts.concat([
        '-map', '[vout]',
        '-c:v', 'libx264', // c:v - H.264
        '-profile:v', 'main', // profile:v - main profile: mainstream image quality. Provide I / P / B frames
        '-preset', preset, // preset - compromised encoding speed
        '-crf', crf, // crf - The range of quantization ratio is 0 ~ 51, where 0 is lossless mode, 23 is the default value, 51 may be the worst
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-r', fps,
      ]);
    }

    //---- vb -----
    if (vb) {
      opts = opts.concat(['-vb', vb]);
    }
    if (merge) {
      opts = opts.concat(options);
    } else {
      opts = options;
    }

    return opts;
  }

  /**
   * Add ffmpeg output configuration
   * @private
   */
  addOutputOptions() {
    const { conf, audios, duration } = this;
    const defaultOutputOptions = conf.getVal('defaultOutputOptions');

    // custom
    const customOpts = conf.getVal('outputOptions');
    if (customOpts) FFmpegUtil.concatOpts(this.outputOptions, customOpts);

    // default
    const defaultOpts = this.getDefaultOutputOptions(defaultOutputOptions);
    if (defaultOutputOptions) FFmpegUtil.concatOpts(this.outputOptions, defaultOpts);

    // audios
    if (this.audios.length > 0) {
      FFmpegUtil.concatOpts(this.outputOptions, ['-c:a', 'aac']);
    }

    this.command.outputOptions(this.outputOptions);

    // set max duration
    this.command.setDuration(duration);
  }

  /**
   * Set ffmpeg input path
   * @private
   */
  addOutput() {
    const finalOutput = this.getOutputPath('final');
    const currOutput = this.getOutputPath('curr');
    FS.ensureDir(finalOutput, true);
    FS.ensureDir(currOutput, true);
    this.command.output(currOutput);
    // this.command.output("/Users/ZhaoJun/Desktop/test/aa_%d.png");
  }

  applyFilters() {
    const filters = [].concat(this.videoFilters).concat(this.audioFilters);
    if (filters.length > 0) this.command.complexFilter(filters);
  }

  /**
   * Open ffmpeg production and processing
   * @public
   */
  start() {
    this.addInputOptions();
    this.addVideoFilter();
    this.addAudioFilter();
    this.applyFilters();
    this.addOutputOptions();
    this.addCommandEvents();
    this.addOutput();
    this.command.run();
  }

  /**
   * Get the final output file path
   * @private
   */
  getOutputPath(real = null) {
    const { conf, cover } = this;
    let output = conf.getVal('output');

    if (cover && real !== 'final') {
      const pathId = conf.getVal('pathId');
      const dir = conf.getVal('detailedCacheDir');
      output = path.join(dir, pathId + '_cover.mp4');
    }

    return path.normalize(output);
  }

  /**
   * Add FFmpeg event to command
   * @private
   */
  addCommandEvents() {
    const { conf, cover, command, framesNum } = this;
    const ffmpeglog = conf.getVal('ffmpeglog');
    const highWaterMark = conf.getVal('highWaterMark');
    const video = this.getOutputPath('curr');
    const output = this.getOutputPath('final');

    // complete and error callback
    const completeFunc = () => {
      this.emit({ type: 'synthesis-complete', output });
      FFLogger.info({ pos: 'Synthesis', msg: 'synthesis complete.' });
    };

    const errorFunc = (error, stdout, stderr) => {
      this.emitError({ error, pos: 'Synthesis' });
      FFLogger.error({
        error,
        pos: 'Synthesis',
        msg: `stdout:${stdout} \n stderr:${stderr}`,
      });
    };

    // start event
    command.on('start', commandLine => {
      FFmpegUtil.setHighWaterMark({ command, highWaterMark });
      this.emit({ type: 'synthesis-start', command: commandLine });
      if (ffmpeglog) {
        command.ffmpegProc.stderr.on('data', data => console.log(data));
      }
      // log info
      FFLogger.info({ pos: 'Synthesis', msg: `synthesis start: ${commandLine}` });
    });

    // progress event
    command.on('progress', progress => {
      let percent = Utils.floor(progress.frames / framesNum, 2);
      percent = Math.min(1, percent);
      this.emitProgress({ percent });
      // log info
      const percent100 = Math.floor(percent * 100);
      FFLogger.info({ pos: 'Synthesis', msg: `synthesis progress: ${percent100}% done.` });
    });

    command.on('end', async () => {
      // check if cover is included
      if (cover) {
        FFmpegUtil.addCoverImage({ video, output, cover })
          .then(completeFunc)
          .catch(([error, stdout, stderr]) => errorFunc(error, stdout, stderr));
      } else {
        completeFunc();
      }
    });

    // error
    command.on('error', (error, stdout, stderr) => errorFunc(error, stdout, stderr));
  }

  destroy() {
    super.destroy();
    FFmpegUtil.destroy(this.command);

    this.conf = null;
    this.cover = null;
    this.audios = null;
    this.command = null;
    this.outputOptions.length = 0;
  }
}

module.exports = Synthesis;
