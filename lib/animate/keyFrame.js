const functions = require("js-easing-functions");

class KeyFrame {
  constructor({startTime, endTime, from, to, key, func}) {
    this.startTime = (startTime !== undefined)? startTime : 0;
    this.endTime = endTime;
    this.from = (from !== undefined)? from : to;
    this.to = to;
    this.key = key;
    this.func = (func && functions[func]) || this.default;
  }

  default(t, from, delta, duration) {
    return from + delta * (t / duration)
  }

  get(t, speed) {
    const duration = (this.endTime - this.startTime) / speed;
    return this.func((t - this.startTime / speed) * 1000, this.from, (this.to - this.from), duration * 1000)
  }
}

const D_LIST = ['scale', 'opacity'];

class KeyFrames {
  constructor(conf) {
    this.conf = conf;
    this.keyFrames = {};
    this.parser();
  }

  /**
   *
   * @param key 需要关键帧动画变化的key
   * @param value 关键帧动画的值, 例如x为300
   * @param index 关键帧的index
   * @param time 关键帧的时间
   * @param func 关键帧动画func的名字
   * @returns {KeyFrame}
   */
  keyFrame(key, value, index, time, func) {
    const from = this.conf[index - 1] && this.conf[index - 1][key];
    const conf = {startTime: this.conf[index - 1]?.time, endTime: time, to: value, key, from, func};
    return new KeyFrame(conf)
  }

  parser() {
    return this.conf.map((item, index) => {
      Object.entries(item).forEach(entry => {
        const [key, value] = entry;
        if (key === 'time' || key === 'innerHTML') return
        const keyFrame = this.keyFrame(key, value, index, item.time, item.easing);
        if (!this.keyFrames[key]) {
          this.keyFrames[key] = [];
        }
        this.keyFrames[key].push(keyFrame);
      })
    })
  }

  update(conf) {
    this.conf = conf;
    this.parser();
  }

  renderAttr(t, node) {
    const attr = {};
    const speed = node.speed || 1;
    for (let [key, keyFrames] of Object.entries(this.keyFrames)) {
      let newValue;
      for (const keyFrame of keyFrames) {
        if (t >= keyFrame.startTime / speed && t <= keyFrame.endTime / speed) {
          newValue = keyFrame.get(t, speed);
          break
        }
      }

      // 第一个keyframe之前坐标和第一个keyframe的值一样，最后一个和最后一个keyframe的值一样
      if (newValue === undefined && keyFrames.length > 0) {
        if (t < keyFrames[0].startTime / speed) {
          newValue = keyFrames[0].from;
        } else {
          newValue = keyFrames[keyFrames.length -1].to;
        }
      }

      if (newValue !== undefined) {
        // d-开头的key说明是相对坐标
        if (key.includes('d-')) {
          key = key.replace('d-', '');
          if (attr[key] !== undefined) continue // 如果有绝对坐标的话，以绝对坐标为准
          if (D_LIST.includes(key)) {
            // 透明度和scale一直是相对值
            attr[key] = node.confAttr[key] * newValue;
          } else {
            attr[key] = node.confAttr[key] + newValue;
          }
        } else {
          if (D_LIST.includes(key)) {
            attr[key] = node.confAttr[key] * newValue;
          } else {
            attr[key] = newValue;
          }
        }
      }
    }

    // console.log('attr', attr)
    return attr
  }
}

module.exports = KeyFrames;
