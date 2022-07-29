const FFClip = require('../core/clip');

class FFTrack extends FFClip {
  constructor(conf = {}) {
    super({ type: 'track', ...conf });
  }

  get isTrack() {
    return true;
  }

  addChild(child, insertBefore=null) {
    super.addChild(child, insertBefore);
    this.refreshSibling();
  }

  removeChild(child) {
    super.removeChild(child);
    this.refreshSibling();
  }

  refreshSibling() {
    // set prev/next sibling.
    for (let i = 0; i < this.children.length; i++) {
      if (i == 0) {
        this.children[i].prevSibling = null; // clear
        continue;
      }
      const prevSibling = this.children[i - 1];
      this.children[i].prevSibling = prevSibling;
      prevSibling.nextSibling = this.children[i];
      this.children[i].nextSibling = null; // clear
    }
  }

  createDisplay() { }

  annotate() {
    const lastChild = this.children[this.children.length - 1];
    this.lastChildEndTime = lastChild ? lastChild.endTime : 0;
  }

  get absStartTime() {
    return 0;
  }

  get absEndTime() {
    return this.endTime;
  }

  get startTime() {
    return 0;
  }

  get duration() {
    return this.endTime - this.startTime;
  }

  get endTime() {
    return this.lastChildEndTime;
  }

}

module.exports = FFTrack;