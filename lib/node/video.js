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

  resetMute() {
    if (this.material) this.material.setAudio(this.conf.audio);
  }

  set audio(audio) {
    this.conf.audio = !!audio;
    this.resetMute();
  }

  get audio() {
    return !!this.conf.audio;
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
      if (this.material.useAudio && this.material.hasAudio) {
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

  canFastRender(excludes=[]) {
    if (this.absStartTime === 0 || // todo: 第一段视频不走快速烧制，避免留下封面黑屏
      !this.active || this.rootConf('fast') === false) return false;
    // todo: 有旋转、动画、滤镜、融合或蒙版的，暂时不能快速渲染
    if (this.rotate !== 0 || this.animations.animations.length > 0
       || this.display?.mask || this.display?.hasFilters() || this.display?.blendMode) return false;

    // todo: 在scene里，且scene有滤镜、融合或蒙版的
    const scene = this.parents.find(x => x.type === 'scene');
    if (scene && (scene.display?.mask || scene.display?.hasFilters() || scene.display?.blendMode)) return false;

    // 同时有zIndex比它低的node
    const limit = 1 / this.rootConf('fps');
    const overNodes = this.creator().allNodes.filter(n => {
      if (n === this || excludes.includes(n)) return false;
      // todo: 转场考虑scene，且可以切部分来做
      if (n.type === 'trans' && (n.prevSibling === this || n.nextSibling === this)) return true;
      if (['scene'].includes(n.type) || !n.display) return false;
      if (n.zIndex > this.zIndex && !n.display?.blendMode && n.type !== 'cover') return false; // 上层且无混合
      const start = Math.max(n.absStartTime, this.absStartTime);
      const end = Math.min(n.absEndTime, this.absEndTime);
      if (end - start < limit) return false; // 无时间重叠
      if (n.type === 'video') {
        const ex = [...excludes, this];
        if (n.zIndex < this.zIndex) return !n.canFastRender(ex); // 如果下层的video不能走快速渲染
        else return n.display?.blendMode && !n.canFastRender(ex);// 如果上层有混合且不能走快速渲染
      }
      // todo: 考虑遮挡情况
      return true;
    });

    // console.log('xx', this.id, overNodes.map(x => x.id));
    return overNodes.length <= 0;
  }

  addInput(command) {
    command.addInput(this.material.path);
    let opts = ['-an']; // 仅视频，不要音频
    const sliceOpts = this.material.getSliceOpts(!this.loop);
    if (sliceOpts) opts = opts.concat(sliceOpts);
    command.addInputOptions(opts);
  }

  toFilters({ input, output, background }) {
    const d = 1;
    const fps = this.rootConf('fps');
    const { start: gstart, end: gend } = this.creator().outputTime;
    const start = this.absStartTime - gstart;
    const end = this.absEndTime - gstart;
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

    let formatRGBA;
    // pre += 'format=bgra,';

    // chroma key
    // const { colorkey, colorsimilarity=0.2 } = this.conf;
    // if (typeof(colorkey) === 'string' && colorkey.length === 7 && colorsimilarity) {
    //   if (!formatRGBA) pre += formatRGBA = 'format=bgra,';
    //   pre += `chromakey=0x${colorkey.replace('#', '')}:${colorsimilarity}:0,`;
    // }

    // opacity
    if (this.opacity < 1) {
      if (!formatRGBA) pre += formatRGBA = 'format=bgra,';
      pre += `colorchannelmixer=aa=${this.opacity.toFixed(2)},`;
    }

    // todo: rotate & anchor
    // if (this.rotate !== 0) {
    //   if (!formatRGBA) pre += formatRGBA = 'format=bgra,';
    //   const r = this.rotate.toFixed(4);
    //   pre += `rotate=${r}:c=#00000000,`; // bgra for transparent bg
    // }

    // start & speed
    if (start != 0) {
      pre += `setpts=${(1/this.speed).toFixed(3)}*PTS-STARTPTS${start > 0 ? '+' : '-'}${Math.abs(start).toFixed(3)}/TB,`;
    } else if (this.speed !== 1) {
      pre += `setpts=${(1/this.speed).toFixed(3)}*PTS,`;
    }

    // size (w,h) => scale
    let tmp = `tmp1_${output}`;
    filters.push(`[${input}]${pre}scale=${w.toFixed(d)}:${h.toFixed(d)}[${tmp}]`);

    // position (x,y) => overlay
    const overlay = `overlay=${x.toFixed(d)}:${y.toFixed(d)}`;
    const time = `:enable='between(t,${Math.max(start, 0).toFixed(3)},${end.toFixed(3)})'`;

    // format先不设置, 跟原视频一致, 速度也会块一些
    const format = ''; //',format=yuv420p';

    filters.push(`[${background}][${tmp}]${overlay}${time}${format}[${output}]`);

    // 必须disable，用外面的渲染
    this.disable();

    return filters;
  }
}

module.exports = FFVideo;
