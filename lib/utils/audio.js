'use strict';

/**
 * AudioUtil - Utils functions related to audio
 *
 * @object
 */
const { isBrowser } = require("browser-or-node");
const toWav = require('audiobuffer-to-wav');
const { nodeRequire } = require('./utils');
const fs = nodeRequire('fs');
const Sonic = require('./sonic');

let AudioContext;
if (isBrowser) {
  AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
} else {
  AudioContext = nodeRequire('web-audio-api').AudioContext;
}

const CACHE = {};
const AudioUtil = {
  getBuffer: async (path) => {
    if (CACHE[path]) return CACHE[path];
    const ctx = new AudioContext();
    let fileData;
    if (isBrowser) {
      const res = await fetch(path, { method: 'GET', responseType: 'arraybuffer' });
      fileData = await res.arrayBuffer();
    } else {
      fileData = fs.readFileSync(path);
    }

    return new Promise((resolve) => {
      ctx.decodeAudioData(fileData, (buffer) => {
        const data = [];
        data.push(buffer.getChannelData(0));
        if (buffer.numberOfChannels > 1) {
          data.push(buffer.getChannelData(1));
        }

        const buf = { data, sampleRate: buffer.sampleRate,
          length: buffer.length, duration: buffer.duration,
          numberOfChannels: buffer.numberOfChannels };
        CACHE[path] = buf;
        // {length: 3130041, duration: 70.92, sampleRate: 44100, numberOfChannels: 2}
        resolve(buf);
      });
    });
  },

  async apply(buffer, opts={}) {
    const onMessage = (e) => {
      const opts = e.data.opts;
      opts.onprogress = (progress) => postMessage({type: 'progress', progress});
      const outs = syncApply(e.data.buffer, opts);
      postMessage({type: 'done', outs});
    };
    let code = Sonic.toString() + ';\n';
    code += 'function ' + this.syncApply.toString() + ';\n';
    code += `self.onmessage = ${onMessage.toString()};\n`;
    const url = URL.createObjectURL(new Blob([code]));
    const worker = new Worker(url);

    const onprogress = opts.onprogress;
    opts.onprogress = null;
    worker.postMessage({buffer, opts});
    return new Promise((resolve) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'done' && e.data.outs) {
          worker.terminate();
          resolve(this.save(e.data.outs, buffer.sampleRate, opts.output));
        } else if (e.data.type === 'progress' && onprogress) {
          onprogress(e.data.progress);
        }
      }
    });
  },

  syncApply(buffer, opts={}) {
    const { data, sampleRate } = buffer;
    const { speed=1.0, rate=1.0, pitch=1.0, blockSize=9 * 128 * 128, onprogress } = opts;

    const sonic = new Sonic(sampleRate, 1);
    sonic.setSpeed(speed);
    sonic.setRate(rate);
    sonic.setPitch(pitch);

    // let ss = Date.now();
    const outs = [];
    for (let i = 0; i < data[0].length; i += blockSize) {
      if (onprogress) onprogress(0.1 + 0.9 * (i / data[0].length));
      for (let c = 0; c < data.length; c++) {
        const idata = new Int16Array(blockSize);
        for (let j = 0; j < blockSize; j++) {
          idata[j] = Math.floor(data[c][i+j] * 32768);
        }
        sonic.writeShortToStream(idata);
        const out = sonic.readShortFromStream();
        if (!outs[c]) outs[c] = [];
        outs[c].push(out);
      }
    }
    // console.log('process audio', Date.now() - ss);

    return outs;
  },

  save(outs, sampleRate, output) {
    let length = 0;
    for (const out of outs[0]) {
      length += out.length;
    }

    const ctx = new AudioContext();
    const outBuffer = ctx.createBuffer(outs.length, length, sampleRate);
    for (let c = 0; c < outs.length; c++) {
      const channel = outBuffer.getChannelData(c);
      let k = 0;
      for (let i = 0; i < outs[c].length; i++) {
        for (let j = 0; j < outs[c][i].length; j++) {
          channel[k] = outs[c][i][j] / 32768;
          k++;
        }
      }
    }
    const wav = toWav(outBuffer);
    if (!output) return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
    fs.writeFileSync(output, Buffer.from(wav));
    return output;
  }
}

module.exports = AudioUtil;