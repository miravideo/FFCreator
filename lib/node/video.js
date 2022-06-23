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
    const mat = new VideoMaterial(conf);
    if (this.muted) mat.setAudio(false);
    return mat;
  }

  mute(muted) {
    if (this.material) this.material.setAudio(this.conf.audio && !muted);
  }

  set audio(audio) {
    this.conf.audio = !!audio;
    if (this.material) this.material.setAudio(this.conf.audio);
  }

  get audio() {
    return !!this.material?.useAudio;
  }

  get volume() {
    return isNaN(this.conf.volume) ? 1 : Math.max(Number(this.conf.volume), 0);
  }

  set volume(volume) {
    this.conf.volume = volume;
    if (this.material) this.material.setVolume(this.volume);
  }

  grantPlay() {
    return this.material.grantPlay(); // for safari
  }

  async getFrameByTime(matTime) {
    return await this.material.queuedSeekTo(matTime, 'preview');
  }

  async prepareMaterial() {
    if (!isBrowser) {
      const {start, end} = this.creator().outputTime;
      // 如果不在导出时间范围内，就不做了
      if (!this.active || this.absStartTime > end || this.absEndTime < start) {
        this.disable();
        console.log(`ignore prepareMaterial ${this.id} [${this.absStartTime}, ${this.absEndTime}]`);
        return;
      }
      const dir = this.rootConf('detailedCacheDir');
      await this.material.extract(dir, !this.creator().audioOnly);
      if (this.material.useAudio) {
        // todo: fade out...
        const audio = new FFAudio({
          id: `${this.id}_audio`,
          path: this.material.path,
          loop: this.loop,
          speed: this.speed,
          volume: this.volume,
          duration: this.duration,
          ss: this.conf.ss,
          to: this.conf.to,
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
    if (this.creator().audioOnly) return;
    let texture = await super.drawing(timeInMs, nextDeltaInMS);
    if (!texture) {
      const dt = (timeInMs / 1000) - this.absStartTime;
      if (-1 < dt && dt < 0 && nextDeltaInMS > 0) {
        // 提前seek到位置
        this.material.perpare();
      } else {
        this.material.pause();
      }

      if (!isBrowser && (timeInMs / 1000) > this.absEndTime) {
        // 烧录的时候，过时间的就可以直接回收了
        this.material.destroy();
      }
    }
  }

  get canFastRender() {
    if (!this.active || this.rootConf('fast') === false) return false;
    // todo: 有动画或旋转的，暂时不能快速渲染
    if (this.rotate !== 0 || this.animations.animations.length > 0) return false;
    // 同时有zIndex比它低的node
    const limit = 1 / this.rootConf('fps');
    const overNodes = this.creator().allNodes.filter(n => {
      // todo: 转场考虑scene，且可以切部分来做
      if (n.type === 'trans' && (n.prevSibling === this || n.nextSibling === this)) return true;
      if (['scene', 'video'].includes(n.type) || !n.display || n.zIndex > this.zIndex) return false;
      const start = Math.max(n.absStartTime, this.absStartTime);
      const end = Math.min(n.absEndTime, this.absEndTime);
      if (end - start < limit) return false; // 无时间重叠
      // todo: 考虑遮挡情况
      return true;
    });

    // console.log('xx', this.id, overNodes.map(x => x.id));
    return overNodes.length <= 0;
  }

  addInput(command) {
    command.addInput(this.material.path);
    let opts = ['-an']; // 仅视频，不要音频  todo: 如果也需要音频就不要加了
    const sliceOpts = this.material.getSliceOpts(!this.loop);
    if (sliceOpts) opts = opts.concat(sliceOpts);
    command.addInputOptions(opts);
  }

  toFilters({ input, output, background }) {
    const d = 1;
    const fps = this.rootConf('fps');
    const filters = [];
    let pre = '';

    let [w, h] = this.getWH();
    let [x, y] = this.getXY();

    // x,y 从anchor变换为左上角坐标
    const { x: ax, y: ay } = this.getAnchor();
    x -= ax * w;
    y -= ay * h;

    const { x: fx, y: fy, width: fw, height: fh } = this.display.texture.frame;
    const { width: dw, height: dh } = this.display;

    // object-fit
    const [ left, top ] = this.getObjectPosition();
    x += Math.max(0, w - dw) * left;
    y += Math.max(0, h - dh) * top;

    const fit = this.conf['object-fit'];
    if (['contain', 'scale-down'].includes(fit)) {
      w = dw;
      h = dh;
    }

    // frame => crop
    pre += `crop=w=${fw.toFixed(d)}:h=${fh.toFixed(d)}:x=${fx.toFixed(d)}:y=${fy.toFixed(d)},`;

    // loop
    if (this.loop) {
      let dur = this.material.getEndOffset(true) - this.material.getStartOffset();
      pre += `loop=-1:size=${(dur * fps).toFixed(0)},`;
    }

    // opacity
    if (this.opacity < 1) {
      pre += `format=bgra,colorchannelmixer=aa=${this.opacity.toFixed(2)},`;
    }

    // todo: rotate & anchor
    // if (this.rotate !== 0) {
    //   const r = this.rotate.toFixed(4);
    //   pre += `format=bgra,rotate=${r}:c=#00000000,`; // bgra for transparent bg
    // }

    // start & speed
    if (this.absStartTime > 0) {
      pre += `setpts=${(1/this.speed).toFixed(3)}*PTS-STARTPTS+${this.absStartTime.toFixed(3)}/TB,`;
    } else if (this.speed !== 1) {
      pre += `setpts=${(1/this.speed).toFixed(3)}*PTS,`;
    }

    // size (w,h) => scale
    let tmp = `tmp1_${output}`;
    filters.push(`[${input}]${pre}scale=${w.toFixed(d)}:${h.toFixed(d)}[${tmp}]`);

    // todo: opacity?

    // position (x,y) => overlay
    const overlay = `overlay=${x.toFixed(d)}:${y.toFixed(d)}`;
    const time = `:enable='between(t,${this.absStartTime.toFixed(3)},${this.absEndTime.toFixed(3)})'`;
    filters.push(`[${background}][${tmp}]${overlay}${time},format=yuv420p[${output}]`);

    // 必须disable，用外面的渲染
    this.disable(); 

    return filters;
  }
}

module.exports = FFVideo;
