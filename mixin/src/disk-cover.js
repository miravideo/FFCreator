const Mixin = require('./base');
const { getRemote } = require("../../lib/utils/xhr");
const { isWebWorker } = require("browser-or-node");
const jsmediatags = require("jsmediatags");

class DiskCoverMixin extends Mixin {
  async init(conf) {
    await super.init(conf);
    try {
      this.meta = await this.readMeta(conf.src);
    } catch (e) {
      console.log('e', e)
    }

    this.speed = this.conf.speed || 1.0;
    if (this.meta?.image?.width && this.meta?.image?.height) {
      const {width, height} = this.meta.image;
      const min = Math.min(width, height);
      this.resize(min, min);

      const canvas = this.createCanvas(min, min);
      const ctx = canvas.getContext('2d');

      // draw circle as mask
      let radius = min / 2;
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.clip();

      // draw image
      const imgCanvas = this.createCanvas(min, min);
      const imgCtx = imgCanvas.getContext('2d');
      const x = (this.width - width) / 2;
      const y = (this.height - height) / 2;
      imgCtx.putImageData(this.meta.image, x, y);
      ctx.drawImage(imgCanvas, 0, 0);
      this.coverCanvas = canvas;
    }
    return { width: this.width, height: this.height, duration: this.MAX_TIME };
  }

  async update(conf) {
    if (conf?.speed !== undefined) {
      this.speed = conf.speed;
    }
  }

  async readMeta(src) {
    return new Promise((resolve, reject) => {
      jsmediatags.read(src, {
        onSuccess: async (tag) => {
          const { title, artist, album } = tag.tags;
          const meta = { title, artist, album };
          const image = tag.tags.picture;
          if (image) {
            let base64String = "";
            for (let i = 0; i < image.data.length; i++) {
              base64String += String.fromCharCode(image.data[i]);
            }
            const src = "data:" + image.format + ";base64," + btoa(base64String);
            meta.image = await this.getImageData(src);
          }
          resolve(meta);
        },
        onError: function(error) {
          console.log(':(', error.type, error.info);
          reject(error);
        }
      });
    });
  }

  render(time, delta) {
    if (!this.coverCanvas) return;
    const ctx = this.canvas.getContext('2d');
    ctx.save();
    const r = this.width / 2;
    ctx.translate(r, r);
    ctx.rotate(time * this.speed);
    ctx.translate(-r, -r);
    ctx.drawImage(this.coverCanvas, 0, 0);
    ctx.restore();
  }
}

if (isWebWorker) new DiskCoverMixin().start();

module.exports = DiskCoverMixin;
