'use strict';

const FFCon = require('./cons');
const CanvasUtil = require('../utils/canvas');
const { createCanvas, Sprite, Texture } = require('../../inkpaint/lib/index');

class FFCover extends FFCon {
  constructor(conf = {}) {
    super({ type: 'cover', ...conf });
  }

  createDisplay() {
    super.createDisplay();
    this.bgCanvas = createCanvas(this.canvasWidth, this.canvasHeight);
    CanvasUtil.fillRect({ canvas: this.bgCanvas, color: '#00000000' });
    if (this.background) this.display.removeChild(this.background);
    this.background = new Sprite(Texture.fromCanvas(this.bgCanvas));
    this.background.zIndex = 10000;
    this.display.addChild(this.background);
    this.setFilter();
  }

  show() {
    super.show();
    // parent必须在show之后才能拿到
    const parentDisplay = this.display.parent;

    const displays = [];
    parentDisplay.children.map(x => {
      if (x === this.display || x.zIndex > this.zIndex) return;
      displays.push(x);
    });

    if (displays.length > 0) {
      this.creator().allNodes.map(n => {
        if (displays.includes(n.display)) {
          n._origParent = n.parent;
          n.parent.removeChild(n);
          this.addChild(n);
          n.touch();
        }
      });
    }
  }

  hide() {
    // parent必须在hide前才能拿到
    const parentDisplay = this.display.parent;
    super.hide();
    if (parentDisplay) {
      this.children.map(n => {
        if (n._origParent) {
          this.removeChild(n);
          n._origParent.addChild(n);
          n.touch();
        }
      });
    }
  }
}

module.exports = FFCover;
