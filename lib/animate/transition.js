'use strict';

/**
 * FFTransition - Class used to handle scene transition animation
 *
 * ####Example:
 *
 *     const transition = new FFTransition({ key, duration, params });
 *
 * @object
 */
const createBuffer = require('gl-buffer');
const createTexture = require('gl-texture2d');
const createTransition = require('./gl-transition').default;

const FFClip = require('../core/clip');
const GLUtil = require('../utils/gl');
const ShaderManager = require('../shader/shader');
const { createCanvas, createImageData, Texture, Sprite, gl } = require('../../inkpaint/lib/index');
const CanvasUtil = require('../utils/canvas');
const { isBrowser } = require('browser-or-node');
const md5 = require('md5');
const RenderUtil = require('../utils/render');

class FFTransition extends FFClip {
  constructor(conf) {
    super({ type: 'trans', duration: 1, ...conf });
    this.key = this.conf.key;
    this.refresh();
  }

  get name() {
    return this.conf.name;
  }

  get uuid() {
    return md5(`${this.key}-${JSON.stringify(this.params)}`).substring(0, 16);
  }

  createDisplay() {
    this.display = new Sprite(Texture.fromCanvas(createCanvas(1, 1)));
  }

  refresh(delta) {
    const { params, resizeMode = 'stretch' } = this.conf;
    this.params = params;
    this.resizeMode = resizeMode;

    if (!this.parent) {
      this.prevSibling = null;
      this.nextSibling = null;
    } else if (this.parent.type !== 'spine') {
      const prevSibling = this.prevRefId && this.prevRefId != this.refId ? 
                          this.root().getByRefId(this.prevRefId) : null;
      if (prevSibling) {
        this.prevSibling = prevSibling;
        this.prevSibling.nextSibling = this;
      }
      const nextSibling = this.nextRefId && this.nextRefId != this.refId ? 
                          this.root().getByRefId(this.nextRefId) : null;
      if (nextSibling && nextSibling != this.prevSibling) {
        this.nextSibling = nextSibling;
        this.nextSibling.prevSibling = this;
      }
    }
    // console.log('refresh!!', this.id, this.zIndex);
  }

  async preProcessing() {
    this.width = this.rootConf('width');
    this.height = this.rootConf('height');
    this.canvas = createCanvas(this.width, this.height);
    this.display.texture.destroy(true);
    this.display.attr({ texture: Texture.fromCanvas(this.canvas) });
    this.gl = GLUtil.getContext(this.creator());
    this.createTransitionSource(this.key);
    this.createTransition(this.gl);
  }

  annotate() {
    this._duration = this.duration;
    this._absStartTime = this.absStartTime;
    this._absEndTime = this._absStartTime + this._duration;
    this.addTimelineCallback();
    this.onTime = (absTime) => {
      const show = (absTime >= this._absStartTime && absTime < this._absEndTime);
      show ? this.show() : this.hide();
      return show;
    }

    // 设置zIndex为前后2个node最高的+1
    this.zIndex = Math.max(this.prevSibling?.zIndex || 0, this.nextSibling?.zIndex || 0) + 1;
    if (this.display) this.display.zIndex = this.zIndex;

    // todo: frame by merged rect of prev & next
  }

  get prevRefId() {
    return this.conf.prevRefId;
  }

  set prevRefId(refId) {
    this.conf.prevRefId = refId;
  }

  get nextRefId() {
    return this.conf.nextRefId;
  }

  set nextRefId(refId) {
    this.conf.nextRefId = refId;
  }

  get default() {
    return {
      startTime: this.prevSibling?.endTime || 0,
      duration: 1
    };
  }

  get duration() {
    let duration = this.time(this.conf.duration);
    return !isNaN(duration) ? duration : this.time(this.default.duration);
  }

  get startTime() {
    if (!this.prevSibling) return super.startTime;
    // 相对前一个sibling的结束，往前倒 0.5*duration 作为开始
    return Math.max(0, (this.relativeEndTime - this.duration * 0.5) || 0);
  }

  get endTime() {
    if (!this.prevSibling) return super.startTime;
    // 让后面的node, 也同时开始
    return Math.max(0, (this.relativeEndTime || 0));
  }

  get relativeEndTime() {
    // 考虑spine外面的情况，需要用absEndTime
    return (this.prevSibling?.absEndTime - this.parent.absStartTime);
  }

  prepareMaterial() {
    // 烧制的时候，分开播放前后clip音频，避免声音重叠
    const centerTime = this._absStartTime + this._duration * 0.5;
    this.prevSibling?.allNodes.map(x => {
      if (!['audio', 'speech'].includes(x.type)) return;
      x.audioEndTime = centerTime;
    });
    this.nextSibling?.allNodes.map(x => {
      if (!['audio', 'speech'].includes(x.type)) return;
      x.audioStartTime = centerTime;
    });
  }

  async getSnapshotBuffer(display) {
    if (!display) return;
    if (display?.texture?.baseTexture) {
      // update canvas
      display.texture.baseTexture.update();
    }
    const type = isBrowser ? 'canvas' : 'raw';
    return await RenderUtil.getView('trans', display, this.creator(), {type, transparent: true});
  }

  async drawing(timeInMs = 0, nextDeltaInMS = 0) {
    if (!this.display) return false;
    const time = timeInMs * 0.001;
    if (!this.onTime(time)) {
      if (nextDeltaInMS > 0) {
        this.prevSibling?.resetMute && this.prevSibling.resetMute();
        this.nextSibling?.resetMute && this.nextSibling.resetMute();
      }
      return false;
    }
    const prevDisplay = this.prevSibling?.display;
    const nextDisplay = this.nextSibling?.display;
    const imgData = await this.render({ prevDisplay, nextDisplay, time });
    if (imgData) this.canvas.getContext('2d').putImageData(imgData, 0, 0);
    this.display.texture.baseTexture.update();

    // 转场过程分开播放前后clip音频，避免声音重叠
    const progress = (time - this._absStartTime) / this._duration;
    if (progress < 0.5) {
      this.prevSibling?.mute && this.prevSibling.mute(false);
      this.nextSibling?.mute && this.nextSibling.mute(true);
    } else {
      this.prevSibling?.mute && this.prevSibling.mute(true);
      this.nextSibling?.mute && this.nextSibling.mute(false);
    }

    return true;
  }

  async getDisplay(time, opt) {
    const canvas = await this.getPreview(time, {...opt, format: "canvas" });
    if (!canvas) throw new Error('null');
    const display = new Sprite(Texture.fromCanvas(canvas));
    return display;
  }

  async getPreview(time, opt) {
    const prevDisplay = await this.prevSibling?.getDisplay(time, { timing: 'abs' });
    const nextDisplay = await this.nextSibling?.getDisplay(time, { timing: 'abs' });
    const imgData = await this.render({ prevDisplay, nextDisplay, time });
    const { width, height } = this;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (imgData) ctx.putImageData(imgData, 0, 0);
    const frame = { x: 0, y: 0, w: width, h: height };
    return this.subImage(canvas, frame, opt);
  }

  /**
   * Create glsl source file for transition
   * @private
   */
  createTransitionSource(key) {
    const source = ShaderManager.getShaderByName(key);
    this.source = source;
    return source;
  }

  /**
   * Create VBO code
   * @private
   */
  createTransition(gl) {
    if (this.transition) return;
    const { resizeMode } = this;
    this.createBuffer(gl);
    this.transition = createTransition(gl, this.source, { resizeMode });
    return this.transition;
  }

  /**
   * Create VBO
   * @private
   */
  createBuffer(gl) {
    if (this.buffer) return;
    // a-big-triangle covers the whole canvas
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isBrowser);
    const data = [-1, -1, -1, 4, 4, -1]; // 4 = (√2 * 2) * √2
    this.buffer = createBuffer(gl, data, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    // this.buffer.bind();
  }

  /**
   * Rendering function
   * @private
   */
  async render({ prevDisplay, nextDisplay, time }) {
    const progress = (time - this._absStartTime) / this._duration;

    const type = 'raw';
    const { gl, transition, params } = this;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    const prevBuffer = await this.getSnapshotBuffer(prevDisplay) || new Int16Array(width * height * 4);
    const nextBuffer = await this.getSnapshotBuffer(nextDisplay) || new Int16Array(width * height * 4);

    gl.clear(gl.COLOR_BUFFER_BIT);
    const prevPixels = await GLUtil.getPixels({ type, data: prevBuffer, width, height });
    const nextPixels = await GLUtil.getPixels({ type, data: nextBuffer, width, height });

    // prev
    const texturePrev = createTexture(gl, prevPixels);
    texturePrev.minFilter = gl.LINEAR;
    texturePrev.magFilter = gl.LINEAR;

    // next
    const textureNext = createTexture(gl, nextPixels);
    textureNext.minFilter = gl.LINEAR;
    textureNext.magFilter = gl.LINEAR;

    transition.draw(progress, texturePrev, textureNext, width, height, params);

    texturePrev.dispose();
    textureNext.dispose();

    const data = GLUtil.getPixelsByteArray({ gl, width, height, flip: true });
    return createImageData(new Uint8ClampedArray(data.buffer), width, height);
  }

  destroy() {
    this.buffer?.dispose();
    this.transition?.dispose();
    this.gl = null;
    this.source = null;
    this.buffer = null;
    this.transition = null;
    super.destroy();
  }
}

module.exports = FFTransition;
