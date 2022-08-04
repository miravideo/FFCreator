'use strict';

/**
 * FFCon - display object container.
 *
 * ####Example:
 *
 *     class FFScene extends FFCon
 *
 * @class
 */

const { awaitMap } = require('../utils/utils');
const FFClip = require('../core/clip');
const FFAudio = require('../audio/audio');
const CanvasUtil = require('../utils/canvas');
const Utils = require('../utils/utils');
const { Sprite, Texture, Container, WebGLRenderer, CanvasRenderer, createCanvas } = require('../../inkpaint/lib/index');

class FFCon extends FFClip {

  get audio() {
    return !this.conf.mute;
  }

  set audio(audio) {
    this.conf.mute = !audio;
    this.mute(!audio);
  }

  mute(muted) {
    this.allNodes.map(n => n.mute && n.mute(muted));
  }

  resetMute() {
    this.mute(!this.audio);
  }

  /**
   * Create display object
   * @private
   */
  createDisplay() {
    this.display = new Container();
    this.display.sortableChildren = true;
  }

  updateDisplay() {
    this.display.sortDirty = true;
  }

  addDisplayChild(childDisplay) {
    // may lock by cover
    if (childDisplay.locked) return;
    if (childDisplay.parent === this.display
       && this.display.children.includes(childDisplay)) {
      return;
    }

    this.display.addChild(childDisplay);
  }

  // removeDisplayChild(childDisplay) {
  //   this.display.removeChild(childDisplay);
  // }

  get previewRenderer() {
    if (this.pvRenderer) return this.pvRenderer;
    const width = this.rootConf('width');
    const height = this.rootConf('height');
    if (this.rootConf('useGL')) {
      this.pvRenderer = new WebGLRenderer({ width, height });
    } else {
      this.pvRenderer = new CanvasRenderer({ width, height });
    }
    return this.pvRenderer;
  }

  async getDisplay(time, opt) {
    const canvas = await this.getPreview(time, {...opt, format: "canvas" });
    if (!canvas) throw new Error('null');
    const display = new Sprite(Texture.fromCanvas(canvas));
    return display;
  }

  async getPreview(time, { width, height, format='jpeg'}={}) {
    const [w, h] = [this.rootConf('width'), this.rootConf('height')];
    const display = new Container();
    display.sortableChildren = true;
    if (this.bgColor) {
      try {
        const bgCanvas = createCanvas(w, h);
        CanvasUtil.fillRect({ canvas: bgCanvas, color: this.bgColor });
        const background = new Sprite(Texture.fromCanvas(bgCanvas));
        display.addChildAt(background, 0);
      } catch (e) {
        return null;
      }
    }

    const covers = [];
    const draw = async (node, parentDisplay, maskObjet=null) => {
      let _display = parentDisplay;
      let _maskObj = null;
      if (node && node.onTime(time, false, 'show')) {
        if (node.type === 'filter') {
          const filter = node.addFilterTo(parentDisplay);
          filter.enabled = true;
          filter.setTime(time - node.absStartTime, node.duration);
          _maskObj = filter;
        } else if (node.getDisplay) {
          _display = await node.getDisplay(time, { timing: 'abs' });
          _display.zIndex = node.zIndex;
          // todo: motion / blur ...
          if (node.display.chroma) _display.chroma = node.display.chroma;
          const { matrix, alpha } = node.display.colorMatrix;
          if (matrix && alpha) _display.setColorMatrix(matrix, alpha);
          // child都应该加到根display上
          display.addChild(_display);
          if (node.conf.asMask) {
            const mask = _display;
            if (!maskObjet) maskObjet = parentDisplay;
            maskObjet.mask = mask;
            mask.renderable = false;
            mask.isMask = true;
            mask.binaryMask = !!node.conf.binaryMask;
            mask.reverseMask = !!node.conf.reverseMask;
            _display = null;
          }
          if (node.type === 'cover') covers.push(_display);
        }
      }
      if (_display && node.type !== 'scene' && node.children) {
        for (const n of node.children) {
          await draw(n, _display, _maskObj);
        }
      }
    }

    try {
      for (const n of this.children) {
        await draw(n, display);
      }

      covers.sort((a, b) => a.zIndex - b.zIndex)
        .map(cover => {
          // 在循环里addChild会改变children数组，所以拆开赋值
          for (const x of [...display.children]) {
            if (x === cover || x.zIndex > cover.zIndex || x.isMask) continue;
            if (x.parent !== cover) cover.addChild(x);
          }
        });

    } catch (e) {
      console.error(e);
      return null;
    }

    if (display?.texture?.baseTexture) {
      // update canvas
      display.texture.baseTexture.update();
    }
    this.previewRenderer.render(display);

    // MUST destroy!!
    display.destroy(true);
    const frame = { x: 0, y: 0, w, h };
    return this.subImage(this.previewRenderer.view, frame, { width, height, format });
  }

  destroy() {
    if (this.pvRenderer) this.pvRenderer.destroy(true, true);
    this.pvRenderer = null;
    super.destroy();
  }
  
}

module.exports = FFCon;
