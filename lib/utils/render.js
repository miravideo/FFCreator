const CanvasUtil = require("./canvas");
const Queue = require("./queue");
const {WebGLRenderer, CanvasRenderer, createCanvas} = require("../../inkpaint/lib/index");

const RenderUtil =  {
  cache: {},
  async queuedGetView(key, display, creator, {type, format}) {
    return new Promise(async (resolve, reject) => {
      const item = RenderUtil.cache[creator.uuid][key];
      await item.queue.enqueue(async () => {
        item.render.render(display);
        item.render.view.rgbReverse = true; // 否则颜色是BGR，很奇怪

        if (format === 'canvas') {
          const canvas = createCanvas(creator.width, creator.height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(item.render.view, 0, 0, creator.width, creator.height);
          resolve(canvas)
        }

        resolve(CanvasUtil.toBuffer({ type, canvas: item.render.view }));
      });
    });
  },
  async getView(key, display, creator, options) {
    if (!RenderUtil.cache[creator.uuid] || !RenderUtil.cache[creator.uuid][key]) {
      const _render = (creator.getConf('useGL'))
        ? new WebGLRenderer({ width: creator.width, height: creator.height })
        : new CanvasRenderer({ width: creator.width, height: creator.height })
      RenderUtil.cache[creator.uuid] = {
        [key]: {
          render: _render,
          queue: new Queue()
        }
      }
    }
    return await RenderUtil.queuedGetView(key, display, creator, options)
  },

  release(creatorId) {
    RenderUtil.cache[creatorId] && Object.values(RenderUtil.cache[creatorId]).forEach(item => {
      item?.render?.destroy();
    });
    delete RenderUtil.cache[creatorId];
  },
}

module.exports = RenderUtil;