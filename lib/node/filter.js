'use strict';

const FFClip = require('../core/clip');
const XML = require('../utils/xml');
const { getRemote } = require("../utils/xhr");

class FFFilter extends FFClip {
  constructor(conf = {}) {
    super({ type: 'filter', ...conf });
  }

  createDisplay() { }

  addDisplayChild(display) {
    // filter不接受除mask以外的子节点
    return;
  }

  removeDisplayChild(display) {
    return;
  }

  show() {
    this.visible = true;
    if (!this.filter) return;
    this.filter.enabled = true;
  }

  hide() {
    this.visible = false;
    if (!this.filter) return;
    this.filter.enabled = false;
  }

  setMask(mask) {
    if (!this.filter || this.filter.mask === mask) return;
    this.filter.mask = mask;
    // mask也需要添加到渲染链上，才可以正常显示
    this.parent.addDisplayChild(mask);
    mask.renderable = false;
    mask.isMask = true;
  }

  removeMask() {
    if (!this.filter || !this.filter.mask) return;
    this.parent.removeDisplayChild(this.filter.mask);
    this.filter.mask = null;
  }

  async preProcessing(onprogress) {
    for (const key of ['vert', 'frag', 'render']) {
      if (typeof(this[key]) !== 'string' || !this[key].startsWith('http')) continue;
      // todo: progress dup
      const res = await getRemote(this[key], this.creator().uuid, (p) => {
        const { total, loaded } = p;
        total && onprogress && onprogress(loaded / total);
      });
      this[`${key}Shader`] = await res.data.text();
    }

    this.filter = this.addFilterTo(this.parent.display);
    this.filter.enabled = false;
  }

  addFilterTo(display) {
    return display.addFilter({ 
      key: this.id, vars: this.vars, 
      // shader code: render
      render: this.render, 
      // shaders
      vert: this.vert, frag: this.frag, 
    });
  }

  get vert() {
    return this.vertShader || XML.getValue(this.conf.vert);
  }

  get frag() {
    return this.fragShader || XML.getValue(this.conf.frag);
  }

  get render() {
    return this.renderShader || XML.getValue(this.conf.render);
  }

  get vars() {
    return this.conf.vars;
  }

  async drawing(timeInMs, nextDeltaInMS) {
    let texture = await super.drawing(timeInMs, nextDeltaInMS);
    const start = (timeInMs / 1000) - this.absStartTime;
    this.filter.setTime(start, this.duration);
    return texture;
  }
}

module.exports = FFFilter;