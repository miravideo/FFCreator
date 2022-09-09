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

// todo: remove it!
const createBuffer = require('gl-buffer');
const createTexture = require('gl-texture2d');

const FFClip = require('../core/clip');
const GLUtil = require('../utils/gl');
const ShaderManager = require('../shader/shader');
const { createCanvas, createImageData, Texture, Sprite, RenderTexture } = require('../../inkpaint/lib/index');
const CanvasUtil = require('../utils/canvas');
const { isBrowser } = require('browser-or-node');
const md5 = require('md5');
const RenderUtil = require('../utils/render');

class FFTransition extends FFClip {
  constructor(conf) {
    super({ type: 'trans', duration: 1, ...conf });
    this.key = this.conf.key;
  }

  get name() {
    return this.conf.name;
  }

  get uuid() {
    return md5(`${this.key}-${JSON.stringify(this.params)}`).substring(0, 16);
  }

  set fit(fit) {
    this.conf.fit = !!fit;
  }

  get fit() {
    return !!this.conf.fit;
  }

  createDisplay() {
    this.display = new Sprite(Texture.fromCanvas(createCanvas(1, 1)));
  }

  refresh(delta) {
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

    if (!this.display) return

    let rect1, rect2;
    if (this.conf.fit) {
      rect1 = this.prevSibling?.display ? this.prevSibling.display.getBounds() : null;
      rect2 = this.nextSibling?.display ? this.nextSibling.display.getBounds() : null;
    }
    // console.log('rect1', this.id, `${this.prevSibling?.id} ${rect1}`);
    // console.log('rect2', this.id, `${this.nextSibling?.id} ${rect2}`);
    const rect = rect1 || rect2;
    if (rect1 && rect2) rect.enlarge(rect2);
    const [rootWidth, rootHeight] = [this.rootConf('width'), this.rootConf('height')];
    this.display.width = rect ? rect.width : rootWidth;
    this.display.height = rect ? rect.height : rootHeight;
    this.display.x = rect ? rect.left : 0;
    this.display.y = rect ? rect.top : 0;
    // console.log('rect', this.id, rect, this.display.getBounds());

    this.filter.params = this.conf.params || {};
    this.filter.offset = [
      - ((rootWidth * 0.5) - (this.display.x + (this.display.width * 0.5))) / rootWidth,
      ((rootHeight * 0.5) - (this.display.y + (this.display.height * 0.5))) / rootHeight,
    ];
    // console.log('offset', this.id, this.filter.offset);
  }

  async preProcessing() {
    const rootWidth = this.rootConf('width');
    const rootHeight = this.rootConf('height');

    this.createTransitionFilter(this.key);
    this.render = this.creator().app.renderer;
    // 只能用root的ratio，否则可能会被拉伸
    this.filter.ratio = rootWidth / rootHeight;

    // 需要用Sprite来承接渲染
    this.prevTexture = RenderTexture.create(rootWidth, rootHeight);
    this.nextTexture = RenderTexture.create(rootWidth, rootHeight);
    this.filter.prev = new Sprite(this.prevTexture);
    this.filter.next = new Sprite(this.nextTexture);
  }

  async prepareMaterial() {
    this.refresh();
  }

  createTransitionFilter(key) {
    const source = ShaderManager.getShaderByName(key);
    this.filter = this.display.setTransition(source);
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

  async drawing(timeInMs = 0, nextDeltaInMS = 0) {
    if (!this.display) return false;
    const time = timeInMs * 0.001;
    if (!this.onTime(time)) return false;
    if (this.prevSibling && this.prevSibling.display) {
      this.render.render(this.prevSibling.display, this.prevTexture);
    }
    if (this.nextSibling && this.nextSibling.display) {
      this.render.render(this.nextSibling.display, this.nextTexture);
    }
    this.filter.updateProgress((time - this._absStartTime) / this._duration);
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
    const imgData = await this._render({ prevDisplay, nextDisplay, time });
    const { width, height } = this;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (imgData) ctx.putImageData(imgData, 0, 0);
    const frame = { x: 0, y: 0, w: width, h: height };
    return this.subImage(canvas, frame, opt);
  }

  async getSnapshotBuffer(display) {
    if (!display) return;
    if (display?.texture?.baseTexture) {
      // update canvas
      display.texture.baseTexture.update();
    }
    const type = isBrowser ? 'canvas' : 'raw';
    return await RenderUtil.getView('trans', display, this.creator(), {type});
  }

  /**
   * Rendering function
   * @private
   */
  async _render({ prevDisplay, nextDisplay, time }) {
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

    this.prevTexture = null;
    this.nextTexture = null;
    this.filter?.prev?.destroy();
    this.filter?.next?.destroy();
    this.filter = null;
    this.render = null;
    super.destroy();
  }
}

module.exports = FFTransition;
