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
// const GLUtil = require('../utils/gl');
const Utils = require('../utils/utils');
const forEach = require('lodash/forEach');
const { Container, WebGLRenderer, CanvasRenderer } = require('../../inkpaint/lib/index');

class FFCon extends FFClip {

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

  async getPreview(time, { width, height, format='jpeg', timing='rel' }={}) {
    if (timing !== 'abs' && timing !== 'rel') return;
    return;
    const absTime = timing === 'rel' ? time + this.absStartTime : time;
    await awaitMap(this.allNodes, (node) => {
      return node.drawing(Math.floor(absTime * 1000), 0);
    });
    const display = this.display;
    if (display?.texture?.baseTexture) {
      // update canvas
      display.texture.baseTexture.update();
    }
    this.previewRenderer.render(display);
    const canvas = this.previewRenderer.view;
    // const type = isBrowser ? 'canvas' : 'raw';
    // canvas.rgbReverse = true; // 否则颜色是BGR，很奇怪
    // return CanvasUtil.toBuffer({ type, canvas });
    return format === 'canvas' ? canvas : canvas.toDataURL(`image/${format}`);
  }

  destroy() {
    if (this.pvRenderer) this.pvRenderer.destroy(true, true);
    this.pvRenderer = null;
    super.destroy();
  }
  
}

module.exports = FFCon;
