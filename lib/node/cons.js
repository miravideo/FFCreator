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
    this.allNodes.map(n => n.mute && n.mute(!audio));
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
    if (childDisplay.parent === this.display
       && this.display.children.includes(childDisplay)) {
      return;
    }

    this.display.addChild(childDisplay);
  }

  removeDisplayChild(childDisplay) {
    this.display.removeChild(childDisplay);
  }

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

    const displays = [];
    const draw = async (node) => {
      if (node && node.getDisplay && node.onTime(time)) {
        const child = await node.getDisplay(time, { timing: 'abs' });
        child.zIndex = node.zIndex;
        display.addChild(child);
        displays.push(child);
      }
      if (node.type !== 'scene' && node.children) {
        for (const n of node.children) {
          await draw(n);
        }
      }
    }

    try {
      for (const n of this.children) {
        await draw(n);
      }
    } catch (e) {
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
