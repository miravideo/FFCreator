const functions = require("js-easing-functions");

class KeyFrame {
  constructor({ss, to, start, end, key, func}) {
    this.ss = (ss !== undefined)? ss : 0;
    this.to = to;
    this.start = (ss !== undefined)? start : end;
    this.end = end;
    this.key = key;
    this.func = (func && functions[func]) || this.default;
  }

  default(t, start, delta, duration) {
    return start + delta * (t / duration)
  }

  get(t, speed) {
    const duration = (this.to - this.ss) / speed;
    return this.func((t - this.ss / speed) * 1000, this.start, (this.end - this.start), duration * 1000)
  }
}

const P_LIST = ['scale', 'opacity'];

class KeyFrames {
  constructor(conf) {
    this.conf = conf;
    this.keyFrames = {};
    this.parser();
  }

  /**
   *
   * @param key 需要关键帧动画变化的key
   * @param end 关键帧动画的值, 例如x为300
   * @param index 关键帧的index
   * @param time 关键帧的时间
   * @param func 关键帧动画func的名字
   * @returns {KeyFrame}
   */
  keyFrame(key, end, index, time, func) {
    const start = this.conf[index - 1] && this.conf[index - 1][key];
    const conf = {ss: this.conf[index - 1]?.time, to: time, end, key, start, func};
    return new KeyFrame(conf)
  }

  parser() {
    return this.conf.map((item, index) => {
      Object.entries(item).forEach(entry => {
        const [key, end] = entry;
        if (key === 'time' || key === 'innerHTML') return
        const keyFrame = this.keyFrame(key, end, index, item.time, item.easing);
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
        if (t >= keyFrame.ss / speed && t <= keyFrame.to / speed) {
          newValue = keyFrame.get(t, speed);
          break
        }
      }

      // 第一个keyframe之前坐标和第一个keyframe的值一样，最后一个和最后一个keyframe的值一样
      if (newValue === undefined && keyFrames.length > 0) {
        if (t < keyFrames[0].ss / speed) {
          newValue = keyFrames[0].start;
        } else {
          newValue = keyFrames[keyFrames.length -1].end;
        }
      }

      if (newValue !== undefined) {
        // d-开头的key说明是相对坐标
        if (key.includes('d-')) {
          key = key.replace('d-', '');
          if (attr[key] !== undefined) continue // 如果有绝对坐标的话，以绝对坐标为准
          if (P_LIST.includes(key)) {
            // 透明度和scale一直是相对值
            attr[key] = node.confAttr[key] * newValue;
          } else {
            attr[key] = node.confAttr[key] + newValue;
          }
        } else {
          if (P_LIST.includes(key)) {
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
