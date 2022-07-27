'use strict';

/**
 * FFImage - Image component-based display component
 *
 * ####Example:
 *
 *     const img = new FFImage({ path, x: 94, y: 271, width: 375, height: 200, resetXY: true });
 *     img.addEffect("slideInDown", 1.2, 0);
 *     scene.addChild(img);
 *
 * @class
 */
const FFNode = require('./node');
const ImageMaterial = require('../material/image');
const { Sprite, Texture, Rectangle, createCanvas } = require('../../inkpaint/lib/index');
const { isBrowser } = require("browser-or-node");

class FFImage extends FFNode {
  constructor(conf = { animations: [] }) {
    super({ type: 'image', ...conf });
  }

  get audio() {
    return undefined;
  }

  get frame() {
    if (this.conf.pframe) {
      const [ mw, mh ] = [this.material.width(), this.material.height()];
      const [ x, y, w, h ] = [ 
        this.conf.pframe.x * mw, this.conf.pframe.y * mh, 
        this.conf.pframe.w * mw, this.conf.pframe.h * mh ];
      return { x, y, w, h };
    }
    return (this.conf.frame?.w && this.conf.frame?.h) ? {...this.conf.frame} : null;
  }

  set frame(f) {
    const [ mw, mh ] = [this.material.width(), this.material.height()];
    const [ x, y, w, h ] = [ f.x / mw, f.y / mh, f.w / mw, f.h / mh ];
    this.conf.pframe = { x, y, w, h };
  }

  setFrame(x, y, w, h) {
    if (typeof(x) === 'object' && x.x !== undefined) this.frame = x;
    else this.frame = {x, y, w, h};
  }

  getFrame() {
    if (this.frame) return this.frame;
    let [x, y, w, h] = [0, 0, this.material.width(), this.material.height()];
    const { 'object-fit': fit, 'object-position': position } = this.conf;
    if (!fit || fit === 'cover') {
      const [ left, top ] = this.getObjectPosition();
      const [ bw, bh ] = this.getWH();
      const r = Math.min(w / bw, h / bh);
      const fw = bw * r;
      const fh = bh * r;
      x += (w - fw) * left;
      y += (h - fh) * top;
      w = fw;
      h = fh;
    }
    return { x, y, w, h };
  }

  materialTime(absTime, mabs=false) {
    return { time: 0, loops: 0 };
  }

  async getFrameByTime(matTime) {
    return this.material.canvas;
  }

  async getDisplay(time, opt) {
    const canvas = await this.getPreview(time, {...opt, format: "canvas", rawFrame: false});
    if (!canvas) throw new Error('null');
    const display = new Sprite(Texture.fromCanvas(canvas));
    display.copyFromProxy(this.display);
    if (this.animations) {
      const absTimeInMs = ((opt.timing === 'rel' ? time + this.absStartTime : time) * 1000) >> 0;
      this.animations.apply(display, absTimeInMs);
    }
    return display;
  }

  async getPreview(time, { width, height, format='jpeg', timing='mat', rawFrame=false }={}) {
    let matTime = time;
    if (timing === 'abs' || timing === 'rel') {
      matTime = this.materialTime(timing === 'rel' ? time + this.absStartTime : time, true).time;
    }
    const image = await this.getFrameByTime(matTime);
    if (!image) return null;
    let frame = this.getFrame();
    if (rawFrame) {
      frame = { x: 0, y: 0, w: this.material.width(), h: this.material.height() }; 
    }
    const fit = this.type === 'video' ? 'cover' : 'contain';
    return this.subImage(image, frame, { width, height, fit, format });
  }

  getObjectPosition() {
    let { 'object-position': position } = this.conf;
    // position默认跟anchor一样
    const { x: ax, y: ay } = this.getAnchor();
    if (!Array.isArray(position) || position.length != 2) position = [ax, ay];
    let [ left, top ] = position;
    left = isNaN(Number(left)) ? ax : Math.max(0, Math.min(1, Number(left)));
    top = isNaN(Number(top)) ? ay : Math.max(0, Math.min(1, Number(top)));
    return [left, top];
  }

  /**
   * Create Image Material
   * @param {*} conf 
   * @returns {ImageMaterial}
   */
  createMaterial(conf) {
    return new ImageMaterial(conf);
  }

  updateMaterialTime() {
    this.material.parseTimeConf(this.conf);
  }

  /**
   * Create display object.
   * @private
   */
  createDisplay() {
    this.display = new Sprite(Texture.fromCanvas(createCanvas(1, 1)));
  }

  annotate() {
    super.annotate();
    // set material duration
    this.material.duration = this.duration;
    // console.log('annotate', this.id, this.duration);
  }

  async prepareMaterial() {
    await super.prepareMaterial();
  }

  async preProcessing() {
    if (this.material) this.material.destroy();
    this.material = this.createMaterial(this.conf);
    this.material.holderId = this.id;
    this.material.duration = this.duration;
    this.material.creator = this.root();
    const fps = this.rootConf('fps');
    await this.material.init({ fps });
    this.fitSize();
    this.display.texture.destroy(true);
    this.display.attr({ texture: Texture.fromCanvas(this.material.canvas) });
    this.fitTexture();
    await this.setMotion();
  }

  async setMotion(mask) {
    if (!this.conf.motion) {
      if (this.motionMask && this.motionFilter) {
        // todo: destroy
        this.display.setMotion(null);
        this.motionFilter = null;
        this.motionMask = null;
      }
      return;
    }
    if (this.motionMaterial) this.motionMaterial.destroy();
    this.motionMaterial = this.createMaterial(this.conf.motion);
    await this.motionMaterial.init();
    this.motionMask = new Sprite(Texture.fromCanvas(this.motionMaterial.canvas));
    this.motionFilter = this.display.setMotion(this.motionMask);

    // set mask position & size
    const { width, height } = this.motionMaterial.info;
    this.motionMask.x = - width / 2;
    this.motionMask.y = - height / 2;
    this.motionMask.width = width;
    this.motionMask.height = height;
    // 这个一个要addChild，不然没效果
    this.display.addChild(this.motionMask);
  }

  fitSize() {
    let { width, height } = this.conf;
    width = this.px(width);
    height = this.px(height);
    const src = this.display; // resource
    let w = this.material.width();
    let h = this.material.height();
    if (this.frame) {
      w = this.frame.w;
      h = this.frame.h;
    }
    if (!w || !h) return; // 获取原始素材的宽高失败，或已经被设置为0

    let scale;
    if (!width || !height) { // 宽高设置不全，根据源素材比例来适配
      if (width) scale = width / w, height = scale * h;
      else if (height) scale = height / h, width = scale * w;
      else scale = this.scale || 1.0, width = w * scale, height = h * scale;
    } else { // 宽高都设置了，根据fit属性来cover/contain/none/fill
      const fit = this.conf['object-fit'];
      if (!fit || fit === 'cover') scale = Math.max(width/w, height/h);
      else if (fit === 'contain') scale = Math.min(width/w, height/h);
      else if (fit === 'none') scale = 1.0;
      else if (fit === 'scale-down') scale = Math.min(1.0, Math.min(width/w, height/h));
      else if (fit === 'fill') return src.attr({ width, height }); // inkpaint默认是fill, 即宽高拉伸
      width = w * scale, height = h * scale;
    }
    // console.log('fitsize', this.id, {width, height, scale});
    src.attr({ width, height });
    this.setScale(scale); // scale必须设置，是考虑到有动画的情况下宽高设置是不准的
  }

  fitTexture(src) {
    let { 'object-fit': fit } = this.conf;
    // frame重新裁剪过，但canvas还是原图，会影响scale，所以重新再设置一下
    if (this.frame) this.setScale(this.scale);
    let { width, height } = this.conf; // container size with scaled
    let cw = width = this.px(width);
    let ch = height = this.px(height);
    src = src || this.display; // resource
    if (src.scale.x <= 0 || src.scale.y <= 0) return;
    let mw = this.material.width();
    let mh = this.material.height();
    let x = 0, y = 0;
    if (this.frame) {
      x = this.frame.x;
      y = this.frame.y;
      mw = this.frame.w;
      mh = this.frame.h;
    }

    // map to un-scaled size
    width /= src.scale.x;
    height /= src.scale.y;

    if (!width || !height) {
      return src.texture.frame = new Rectangle(x, y, mw, mh);
    }

    // frame with ori-size
    const [ left, top ] = this.getObjectPosition();
    if (fit === 'fill') {
      src.texture.frame = new Rectangle(x, y, mw, mh);
      src.width = cw; // 必须重新设置一下，不然被上面的改变就无效了
      src.height = ch;
    } else {
      const w = Math.min(width, mw);
      const h = Math.min(height, mh);
      x += (mw - w) * left;
      y += (mh - h) * top;
      src.texture.frame = new Rectangle(x, y, w, h);
      // console.log('fitTexture', this.id, src.texture.frame);
      // todo: obj-position 和 anchor 不一致的问题！
    }
  }

  /**
   * Functions for drawing images
   * @private
   */
  draw({ display, texture, useCache = false }) {
    if (!texture || isBrowser) return;
    display = display || this.display;
    if (texture.constructor.name === 'ImageData') {
      display.texture.baseTexture.source = texture;
      display.texture.baseTexture.update();
    } else if (texture instanceof Texture) {
      display.texture.destroy(true);
      display.texture = texture;
      this.fitTexture(display); // 因为替换了texture, 所以需要再适配一下
    } else {
      display.texture.updateSource(texture, useCache);
    }
  }

  /**
   * Delete historical texture Image
   * @private
   */
  deleteTexture(display) {
    if (!this.parent) return;
    if (!display.texture) return;
    // layer.deleteTexture(display.texture);
  }

  async drawing(timeInMs, nextDeltaInMS) {
    let texture = await super.drawing(timeInMs, nextDeltaInMS);
    if (!texture) return false;

    if (this.conf.motion && this.motionFilter) {
      // todo: motion -> implement as animation
      const dt = Math.pow(this.absEndTime - (timeInMs * 0.001), this.conf.motion.curve);
      const [x, y] = [this.px(this.conf.motion.x) * dt, this.px(this.conf.motion.y) * dt];
      this.motionFilter.setScale(x, y);
    }
    return texture;
  }

  destroy() {
    super.destroy();
    if (this.material) this.material.destroy();
  }
}

module.exports = FFImage;
