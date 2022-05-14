
const FFAudio = require('./audio');
const { isBrowser } = require("browser-or-node");

class FFSpeech extends FFAudio {
  constructor(conf) {
    conf = typeof conf === 'string' ? { path: conf } : conf;
    super({ type: 'speech', audio: true, ...conf});
  }
}

module.exports = FFSpeech;