'use strict';

/**
 * Timeline - A timeline class to manage scenes and animations
 *
 * ####Example:
 *
 *     const timeline = new Timeline(60);
 *     timeline.annotate(scenes);
 *     timeline.nextFrame();
 *
 * @class
 */

const forEach = require('lodash/forEach');
const FFSpine = require('../node/spine');
const FFLogger = require('../utils/logger');

class Timeline {
  constructor(creator) {
    this.creator = creator;
    this.fps = creator.getConf('fps');
    this.frame = 0;
    this.frameInFloat = 0.0;
    this.duration = 0;
    this.framesNum = 0;
  }

  update() {
    this.duration = this.creator.duration
    this.framesNum = Math.round(this.duration * this.fps);
  }

  annotate() {
    this.creator.annotate();

    // log info
    FFLogger.info({ pos: 'Timeline', msg: `annotate creator duration ${this.duration}` });
    this.creator.allNodes.map(node => {
      FFLogger.info({ 
        pos: 'Timeline', 
        msg: `annotate ${node.id.padEnd(10, ' ')}: ` + 
             `time:[${node.absStartTime.toFixed(2).padStart(6, ' ')}, ${node.absEndTime.toFixed(2).padStart(6, ' ')})  ` +
             `zIndex:${node.zIndex.toFixed(0).padStart(8, ' ')}`
      });
    });
  }

  isOver() {
    const { frame } = this;
    return frame > this.framesNum - 1;
  }

  /**
   * update the next frameData
   * @param {Number} deltaTimeMs
   * @public
   */
  nextFrame(deltaTimeMs) {
    if (deltaTimeMs === undefined) deltaTimeMs = 1000 / this.fps;
    if (deltaTimeMs <= 0) return this.pause();
    const { fps } = this;
    if (!this.isOver()) {
      const deltaFrame = deltaTimeMs * fps / 1000;
      this.frameInFloat += deltaFrame;
      this.frame = this.frameInFloat >> 0;
      return this.creator.timeUpdate(deltaTimeMs);
    }
  }

  pause() {
    return this.creator.timeUpdate(0);
  }

  async jumpTo(timeInMs) {
    const { fps } = this;
    this.frameInFloat = timeInMs * fps / 1000;
    this.frame = this.frameInFloat >> 0;
    return await this.creator.timeUpdate(0, timeInMs);
  }

  setFps(fps) {
    this.fps = fps;
  }

  destroy() {
    this.creator = null;
  }
}

module.exports = Timeline;
