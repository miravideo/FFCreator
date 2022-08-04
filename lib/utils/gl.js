'use strict';

/**
 * GLUtil - A OpenGl tool function library
 *
 * ####Example:
 *
 *
 *
 * @object
 */
const ndarray = require('ndarray');
const Utils = require('./utils');
const { gl } = require('../../inkpaint/lib/index');

const GLUtil = {
  byteArray: null,
  cache: {},
  getContext(creator) {
    const key = creator.uuid;
    if (!GLUtil.cache[key]) {
      GLUtil.cache[key] = gl(creator.width, creator.height);
    }
    return GLUtil.cache[key];
  },
  release(key) {
    delete GLUtil.cache[key];
  },
  getPixelsByteArray({ gl, width, height, flip, bgr }) {
    const byteArray = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, byteArray);
    if (!flip) return byteArray;
    const m = bgr ? [2, 1, 0, 3] : [0, 1, 2, 3];
    const flippedArray = new Uint8Array(width * height * 4);
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const col = j;
        const row = height - i - 1;
        for (let k = 0; k < 4; k++) {
          const idx = 4 * (row * width + col) + m[k];
          const idx2 = 4 * (i * width + col) + k;
          flippedArray[idx] = byteArray[idx2];
        }
      }
    }
    return flippedArray;
  },

  enableBlendMode(gl) {
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
  },

  /**
   * Get the pixel data of the image
   * https://github.com/stackgl/gl-texture2d/issues/16
   * @public
   */
  async getPixels({ type, data, width, height }) {
    if (type === 'raw') {
      return ndarray(data, [width, height, 4], [4, width * 4, 1]);
    } else {
      const { pixels } = await Utils.getPixels(data, `image/${type}`);
      return pixels;
    }
  },
};

module.exports = GLUtil;
