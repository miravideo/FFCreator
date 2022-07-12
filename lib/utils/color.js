'use strict';

const { utils } = require('../../inkpaint/lib/index');

const ColorUtil = {
  HSL2RGB: (h, s, l) => {
    let  r, g, b;
    if (s == 0){
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }

      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  },
  RGB2HSL: (r, g, b) => {
    return utils.rgb2hsl(r, g, b);
  },
  STR2RGB: (h, dv=null) => {
    let r, g, b;
    if (h.length === 4) {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];
    } else if (h.length === 7) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
    }
    if (isNaN(r) || isNaN(g) || isNaN(b)) return ColorUtil.STR2RGB(dv);
    return [Number(r), Number(g), Number(b)];
  },
  RGB2HEX: (rgb) => {
    return (rgb[0] << 16) + (rgb[1] << 8) + (rgb[2] | 0);
  }
}

module.exports = ColorUtil;