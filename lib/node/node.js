'use strict';

/**
 * FFNode Class - FFCreator displays the basic class of the object,
 * Other display objects need to inherit from this class.
 *
 * ####Example:
 *
 *     const node = new FFNode({ x: 10, y: 20 });
 *
 * @class
 */

const FFClip = require('../core/clip');
const { BLEND_MODES } = require('../../inkpaint/lib/index');
const KeyFrames = require('../animate/keyFrame');

class FFNode extends FFClip {
  /**
   * FFNode constructor
   *
   * @constructor
   * @param {object} conf - FFNode related configuration items
   * @param {number} conf.x - x coordinate of FFNode
   * @param {number} conf.y - y coordinate of FFNode
   * @param {number} conf.scale - scale of FFNode
   * @param {number} conf.rotate - rotation of FFNode
   * @param {number} conf.opacity - opacity of FFNode
   * @param {object} conf.keyframes - keyframes of FFNode
   */
  constructor(conf = {}) {
    super({ type: 'node', ...conf });
    this.preload = !!conf.preload;
    this.setScale(this.confAttr.scale || 1);
    this.updateAttr();
    // 初始化宽高为相对值
    if (conf.width) this.conf.width = this.vu(conf.width);
    if (conf.height) this.conf.height = this.vu(conf.height);
    if (conf.keyframes) this.keyFrame = new KeyFrames(conf.keyframes);
  }

  updateMaterialTime() {
    return;
  }

  get confAttr() {
    const _conf = {...this.conf};
    _conf.width = this.px(_conf.width);
    _conf.height = this.px(_conf.height);
    _conf.x = this.px(_conf.x);
    _conf.y = this.px(_conf.y);
    _conf.scale = this.initScale || 1;
    _conf.rotation = (_conf.rotation !== undefined) ? Number(_conf.rotation) : 0;
    _conf.opacity = (_conf.opacity !== undefined) ? Number(_conf.opacity) : 1;
    _conf.speed = (_conf.speed !== undefined) ? Number(_conf.speed) : 1;
    return _conf
  }

  set audio(audio) {
    // do nothing..
  }

  get audio() {
    return false;
  }

  get blend() {
    return this.conf.blend || 'NORMAL';
  }

  keyFrameAttr(t, node) {
    return this.keyFrame.renderAttr(t, node)
  }

  async drawing(timeInMs, nextDeltaInMS) {
    const texture = await super.drawing(timeInMs, nextDeltaInMS);
    if (texture && this.keyFrame) {
      const attr = this.keyFrameAttr(timeInMs / 1000, this);
      this.display && this.display.attr(attr);
    }
    return texture
  }

  updateAttr() {
    const { x = 0, y = 0, rotate = 0, opacity = 1, anchor = 0.5, blend } = this.confAttr;
    this.setXY(x, y);
    this.setRotate(rotate);
    this.setAnchor(anchor);
    this.addBlend(blend);
    this.setChromaKey();
    this.setColor();
    this.setOpacity(opacity);
    // todo: 啥时候需要??
    // this.setScale(this.scale);
  }

  show() {
    super.show();
  }

  hide() {
    super.hide();
  }

  /**
   * Set display object registration center
   * @param {number} anchor
   * @public
   */
  setAnchor(anchorX, anchorY) {
    if (!this.display?.anchor) return;
    if (Array.isArray(anchorX)) {
      anchorY = anchorX[1];
      anchorX = anchorX[0];
    }
    anchorY = anchorY === undefined ? anchorX : anchorY;
    this.display.anchor.set(anchorX, anchorY);
    if (anchorX == 0.5 && anchorY == 0.5) delete this.conf.anchor;
    else this.conf.anchor = [anchorX, anchorY];
  }

  /**
   * Set display object scale
   * @param {number} scale
   * @public
   */
  setScale(scale = 1) {
    if (isNaN(scale) || !this.display) return;
    this.scale = scale;
    this.display.scale.set(scale, scale);
    this.initScale = this.display.scale.x;
  }

  /**
   * Set display object rotation
   * @param {number} rotation
   * @public
   */
  setRotate(rotation = 0) {
    if (isNaN(rotation) || !this.display) return;
    if (Math.abs(rotation) < 0.0001) rotation = 0;
    // rotation = rotation * (3.1415927 / 180);
    this.display.rotation = rotation;
    if (rotation === 0) delete this.conf.rotate;
    else this.conf.rotate = rotation;
  }

  /**
   * Set the duration of node in the scene
   * @param {number} duration
   * @public
   */
  setDuration(duration) {
    this.duration = duration;
  }

  /**
   * Set display object x,y position
   * @param {number} x - x position
   * @param {number} y - y position
   * @public
   */
  setXY(x = 0, y = 0) {
    if (!this.display) return;
    this.display.x = this.px(x);
    this.display.y = this.px(y);
    this.setConfRpx('x', this.display.x);
    this.setConfRpx('y', this.display.y);
  }

  set opacity(opacity) {
    if (!this.display) return;
    this.display.alpha = opacity;
    if (opacity === 1) delete this.conf.opacity;
    else this.conf.opacity = opacity;
  }

  get opacity() {
    return this.confAttr.opacity;
  }

  /**
   * Set display object width and height
   * @param {number} width - object width
   * @param {number} height - object height
   * @public
   */
  setWH(width, height) {
    this.setSize(width, height);
  }

  /**
   * Set display object width and height
   * @param {number} width - object width
   * @param {number} height - object height
   * @public
   */
  setSize(width, height) {
    this.setConfRpx('width', width);
    this.setConfRpx('height', height);
  }

  /**
   * Add blend filter
   * @param {boolean} blend - blend filter mode
   * @public
   */
  addBlend(blend = '') {
    const blendMode = BLEND_MODES[blend.toUpperCase()];
    if (blendMode) this.display.blendMode = blendMode;
  }

  setOpacity(opacity) {
    this.opacity = opacity;
  }

  setColor() {
    let colorConf = this.confAttr.color;
    if (!Array.isArray(colorConf)) {
      if (colorConf?.key) colorConf = [colorConf];
      else {
        if (this.display) this.display.setColorMatrix(null);
        return;
      }
    }
    const alpha = isNaN(this.confAttr.colorAlpha) ? 1 : Number(this.confAttr.colorAlpha);
    this.display.setColorMatrix(colorConf, Math.min(1, Math.max(alpha, 0)));
  }

  setChromaKey() {
    const { chromaKey, chromaSimilarity, chromaSmoothness, chromaSaturation, chromaShadowness } = this;
    if (!chromaKey || !this.display) {
      if (this.display) this.display.chroma = null;
      return;
    }

    this.display.chroma = {
      color: chromaKey,
      similarity: chromaSimilarity,
      smoothness: chromaSmoothness,
      saturation: chromaSaturation,
      shadowness: chromaShadowness,
    };
  }

  get chromaKey() { return this.confAttr.chromaKey; }
  get chromaSimilarity() { return this.confAttr.chromaSimilarity || 0.2; }
  get chromaSmoothness() { return this.confAttr.chromaSmoothness || 0.1; }
  get chromaSaturation() { return this.confAttr.chromaSaturation || 0.1; }
  get chromaShadowness() { return this.confAttr.chromaShadowness || 0.1; }

  get rotate() {
    return this.getRotation();
  }

  get rotation() {
    return this.getRotation();
  }

  get x() {
    return this.getX();
  }

  get y() {
    return this.getY();
  }

  get width() {
    return this.getWidth();
  }

  get height() {
    return this.getHeight();
  }

  get anchorX() {
    return this.getAnchor().x;
  }

  get anchorY() {
    return this.getAnchor().y;
  }

  getAnchor() {
    return this.display.anchor;
  }

  getRotation() {
    return this.display.rotation || 0;
  }

  /**
   * Get display object x position
   * @return {number} x
   * @public
   */
  getX() {
    return this.display.x;
  }

  /**
   * Get display object y position
   * @return {number} y
   * @public
   */
  getY() {
    return this.display.y;
  }

  getXY() {
    return [this.display.x, this.display.y];
  }

  /**
   * Get display object width and height
   * @return {array} [width, height]
   * @public
   */
  getWH() {
    const { width = 0, height = 0 } = this.confAttr;
    if (width && height) {
      return [width, height];
    } else {
      return [this.display.width, this.display.height];
    }
  }

  getWidth() {
    return this.getWH()[0];
  }

  getHeight() {
    return this.getWH()[1];
  }

  getProp(key) {
    return this.display[key];
  }

  fitSize() {
    let { width, height } = this.confAttr;
    this.display.attr({ width, height });
  }

  fitTexture() {

  }

  /**
   * Destroy the component
   * @public
   */
  destroy() {
    super.destroy();
    this.display = null;
    this.parent = null;
  }
}

module.exports = FFNode;
