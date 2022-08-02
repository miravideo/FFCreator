'use strict';

/*!
 * FFCreator - a lightweight and flexible short video production library
 * Copyright(c) TNFE Team
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

// require('./polyfill/polyfill')();

const { isBrowser } = require("browser-or-node");
const InkPaint = require('../inkpaint/lib/index');

const FFCreator = require('./creator');
const FFSpine = require('./node/spine');
const FFTransition = require('./animate/transition');
const FFNode = require('./node/node');
const FFGraphic = require('./node/graphic');
const FFCover = require('./node/cover');
const FFText = require('./node/text');
const FFRichText = require('./node/richtext');
const FFImage = require('./node/image');
const FFVideo = require('./node/video');
const FFScene = require('./node/scene');
const FFExtras = require('./node/extras');
const FFLottie = require('./node/lottie');
const FFFilter = require('./node/filter');
const FFGifImage = require('./node/gif');
const FFAudio = require('./audio/audio');
const FFSpeech = require('./audio/speech');
const FFTween = require('./animate/tween');
const FFLogger = require('./utils/logger');
const FFCreatorCenter = require('./center/center');

const TYPES = {
  canvas: FFCreator,
  spine: FFSpine,
  trans: FFTransition,
  scene: FFScene,
  node: FFNode,
  text: FFText,
  richtext: FFRichText,
  image: FFImage,
  lottie: FFLottie,
  video: FFVideo,
  audio: FFAudio,
  speech: FFSpeech,
  gif: FFGifImage,
  graph: FFGraphic,
  cover: FFCover,
  filter: FFFilter,
}

const Factory = {
  debug: false,
  cacheNode: null,
  parseAttribute(json, value) {
    const { type, children, ...attrs } = json;
    for (let child of children) {
      attrs[child.type] = this.parseAttribute(child, attrs[child.type]);
    }
    if (value && Array.isArray(value) && value.length > 0) {
      value.push(attrs);
      return value;
    } else if (value) {
      return [value, attrs];
    } else {
      return attrs;
    }
  },
  fromJson(json, cache, progress, parent) {
    const { type, children = [], ...others } = json;
    if (type == 'canvas') {
      // 初始化的时候px计算的依赖, 因为construct的时候就需要计算rpx，但那个时候还没设置parent
      others.canvasWidth = others.width;
      others.canvasHeight = others.height;
    }

    if (this.debug) {
      // console.log('TYPE', type, others);
      if (type == 'canvas') others.log = true;
    }

    // for child xml-node as attribute
    for (let child of children) {
      if (TYPES[child.type]) continue; // 正常node
      // assign as attribute
      others[child.type] = this.parseAttribute(child, others[child.type]);
    }

    if (parent) others.parent = parent;
    const node = new TYPES[type](others);

    // 烧录的时候，inactive的无子node就不需要了
    if (!isBrowser && !node.active && !children.length) return;
    // if (parent) parent.addChild(node);

    for (let child of children) {
      if (!TYPES[child.type]) continue;
      // 把canvas尺寸先传下去，作为初始化的时候px计算的依赖
      child.canvasWidth = others.canvasWidth;
      child.canvasHeight = others.canvasHeight;
      this.fromJson(child, cache, progress, node);
    }

    if (this.cacheNode) cache.push(this.cacheNode(node, progress));
    return node
  },
  genNode(data, opt, progress) {
    const cache = [];
    const node = this.fromJson({ ...data, ...opt }, cache, progress);
    return { node, cache: Promise.all(cache) };
  },
  fromXml(xml, opt, progress) {
    const { parseXml } = require('./utils/xml');
    const data = parseXml(xml);
    if (this.debug) console.log('parser xml -> json', data);
    // if (this.debug) console.log('parser xml -> json', JSON.stringify(data, null, 2));
    return this.genNode(data.children[0], opt, progress);
  },
  from(value, opt, progress=null) {
    if (typeof value === 'string' && value.includes('<miraml>')) { // miraml
      return this.fromXml(value, opt, progress);
    }
    if (typeof value === 'string' && value.trim().startsWith('{')) { // json string
      value = JSON.parse(value);
    }
    if (value instanceof Object && value.type === 'canvas') {
      return this.genNode(value, opt, progress);
    }
    throw new Error('invalid value');
  }
}

module.exports = {
  // echarts,
  InkPaint,
  TYPES,
  Factory,
  FFCreator,
  FFSpine,
  FFNode,
  FFGraphic,
  FFFilter,
  FFRichText,
  FFText,
  FFImage,
  FFVideo,
  FFScene,
  FFAudio,
  FFLottie,
  FFExtras,
  FFGifImage,
  FFCover,
  FFTween,
  FFTransition,
  FFLogger,
  FFCreatorCenter,
};
