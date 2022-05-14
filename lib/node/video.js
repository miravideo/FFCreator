'use strict';

/**
 * FFVideo - Video component-based display component
 *
 * ####Example:
 *
 *     const video = new FFVideo({ path, width: 500, height: 350 });
 *     video.setAudio(true);
 *     scene.addChild(video);
 *
 * @class
 */

const FFGifImage = require('./gif');
const FFAudio = require('../audio/audio');
const VideoMaterial = require('../material/video');
const FFLogger = require('../utils/logger');
const { isBrowser } = require('browser-or-node');
const CanvasUtil = require('../utils/canvas');

class FFVideo extends FFGifImage {
  constructor(conf) {
    super({ type: 'video', loop: false, audio: true, ...conf });
    this.useCache = false;
  }

  /**
   * Create Material, called by super.constructor
   * @return {Material} material
   * @protected
   */
  createMaterial(conf) {
    return new VideoMaterial(conf);
  }

  /**
   * Whether to play sound
   * @param {boolean} audio - Whether to play sound
   * @public
   */
  set audio(audio) {
    this.conf.audio = !!audio;
    if (this.material) this.material.setAudio(this.conf.audio);
  }

  get audio() {
    return !!this.material?.useAudio;
  }

  grantPlay() {
    return this.material.grantPlay(); // for safari
  }

  async getFrameByTime(matTime) {
    return await this.material.seekTo(matTime);
  }

  async prepareMaterial() {
    if (!isBrowser) {
      const dir = this.rootConf('detailedCacheDir');
      const audioPath = await this.material.extract(dir, this.id);
      if (audioPath) {
        // todo: fade out...
        const audio = new FFAudio({
          id: `${this.id}_audio`,
          path: audioPath,
          loop: this.loop,
          volume: this.volume,
          duration: this.duration,
          //这里不需要再带上ss/to，因为已经切过了
        });
        this.addChild(audio);
        await audio.preProcessing();
        audio.annotate();
        FFLogger.info({ 
          pos: 'Video', 
          msg: `Add audio track ${audio.id.padEnd(10, ' ')}: ` + 
               `time:[${audio.absStartTime.toFixed(2).padStart(6, ' ')}, ${audio.absEndTime.toFixed(2).padStart(6, ' ')})  `
        });
      }
    }
    await super.prepareMaterial();
  }

  async drawing(timeInMs, nextDeltaInMS) {
    let texture = await super.drawing(timeInMs, nextDeltaInMS);
    if (!texture) {
      this.material.pause();
      // 提前seek到位置
      this.material.getFrameByTime(0, 0);
    }
  }
}

module.exports = FFVideo;
