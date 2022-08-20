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

const min = require('lodash/min');
const FFClip = require('../core/clip');
const FFAnimations = require('../animate/animations');
const { DisplayObject, BLEND_MODES } = require('../../inkpaint/lib/index');

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
   */
  constructor(conf = {}) {
    super({ type: 'node', ...conf });
    this.preload = !!conf.preload;
    this.setScale(this.conf.scale || 1);
    this.updateAttr();
    this.updateAnimations();
    // 初始化宽高为相对值
    if (conf.width) this.conf.width = this.vu(conf.width);
    if (conf.height) this.conf.height = this.vu(conf.height);
  }

  updateMaterialTime() {
    return;
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

  updateAttr() {
    const { x = 0, y = 0, rotate = 0, opacity = 1, anchor = 0.5, blend } = this.conf;
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

  updateAnimations() {
    if (this.animations) {
      this.animations.destroy();
      this.updateAttr(); // reset
    }
    this.animations = new FFAnimations(this);
    if (Array.isArray(this.conf.animate)) {
      this.conf.animate.map(ani => this.addAnimate(ani));
    } else if (typeof(this.conf.animate) === 'object') {
      this.addAnimate(this.conf.animate);
    }
    if (this.conf.effect) {
      const { effect, effectTime, effectDelay } = this.conf;
      this.addEffect(effect.split(','), effectTime, effectDelay);
    }
  }

  show() {
    super.show();
    this.animations.start();
  }

  hide() {
    super.hide();
    this.animations.stop();
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
    return this.conf.opacity;
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
    let colorConf = this.conf.color;
    if (!Array.isArray(colorConf)) {
      if (colorConf?.key) colorConf = [colorConf];
      else {
        if (this.display) this.display.setColorMatrix(null);
        return;
      }
    }
    const alpha = isNaN(this.conf.colorAlpha) ? 1 : Number(this.conf.colorAlpha);
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

  get chromaKey() { return this.conf.chromaKey; }
  get chromaSimilarity() { return this.conf.chromaSimilarity || 0.2; }
  get chromaSmoothness() { return this.conf.chromaSmoothness || 0.1; }
  get chromaSaturation() { return this.conf.chromaSaturation || 0.1; }
  get chromaShadowness() { return this.conf.chromaShadowness || 0.1; }

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
    return this.display.rotation;
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
    const { width = 0, height = 0 } = this.conf;
    if (width && height) {
      return this.px([width, height]);
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
    let { width, height } = this.conf;
    this.display.attr(this.px({ width, height }));
  }

  fitTexture() {

  }

  /**
   * Add one/multiple animations or effects
   * @public
   */
  setAnimations(animations) {
    this.animations.setAnimations(animations);
  }

  /**
   * Add special animation effects
   * @param {string} type - animation effects name
   * @param {number} time - time of animation
   * @param {number} delay - delay of animation
   * @public
   */
  addEffect(type, time, delay) {
    this.animations.addEffect(type, time, delay);
  }

  addAnimate(animation) {
    return this.animations.addAnimate(animation);
  }

  /**
   * Destroy the component
   * @public
   */
  destroy() {
    if (this.animations) this.animations.destroy();
    super.destroy();

    this.animations = null;
    this.display = null;
    this.parent = null;
  }
}

module.exports = FFNode;