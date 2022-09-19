'use strict';

/**
 * AudioUtil - Utils functions related to audio
 *
 * @object
 */
const { isBrowser } = require("browser-or-node");
const { getRemote } = require("./xhr");
const { nodeRequire } = require('./utils');
const fft = require('fourier-transform');
const {db2mag, floor, mag2db, normalize, blackman} = require('./math');
const fs = require('fs');

let AudioContext;
if (isBrowser) {
  AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
} else {
  AudioContext = nodeRequire('web-audio-api').AudioContext;
}

class Analyser {
  static defaultProperties = {
    fftSize: 1024,
    minDecibels: -100,
    maxDecibels: 0,
    smoothingTimeConstant: 0,
  };

  constructor() {
    this.properties = Analyser.defaultProperties;
    this.init();
  }

  init() {
    const {
      properties: { fftSize },
    } = this;

    this.fft = new Float32Array(fftSize / 2);
    this.td = new Float32Array(fftSize);

    this.blackmanTable = new Float32Array(fftSize);

    for (let i = 0; i < fftSize; i++) {
      this.blackmanTable[i] = blackman(i, fftSize);
    }

    this.buffer = new Float32Array(fftSize);

    this.smoothing = new Float32Array(fftSize / 2);
  }

  get gain() {
    const { fft } = this;
    return fft.reduce((a, b) => a + b) / fft.length;
  }

  getFloatTimeDomainData(array) {
    array.set(this.buffer);
  }

  getFloatFrequencyData(array) {
    const { fftSize, smoothingTimeConstant } = this.properties;
    const waveform = new Float32Array(fftSize);

    // Get waveform from buffer
    this.getFloatTimeDomainData(waveform);

    // Apply blackman function
    for (let i = 0; i < fftSize; i++) {
      waveform[i] = waveform[i] * this.blackmanTable[i] || 0;
    }

    // Get FFT
    const spectrum = fft(waveform);

    for (let i = 0, n = fftSize / 2; i < n; i++) {
      let db = mag2db(spectrum[i]);

      if (smoothingTimeConstant) {
        this.smoothing[i] =
          spectrum[i] * smoothingTimeConstant * this.smoothing[i] + (1 - smoothingTimeConstant);

        db = mag2db(this.smoothing[i]);
      }
      array[i] = Number.isFinite(db) ? db : -Infinity;
    }
  }

  getByteTimeDomainData(array) {
    const { fftSize } = this.properties;
    const waveform = new Float32Array(fftSize);

    this.getFloatTimeDomainData(waveform);

    for (let i = 0, n = waveform.length; i < n; i++) {
      array[i] = Math.round(normalize(waveform[i], -1, 1) * 255);
    }
  }

  getByteFrequencyData(array) {
    const { minDecibels, maxDecibels, fftSize } = this.properties;
    const spectrum = new Float32Array(fftSize/2);

    this.getFloatFrequencyData(spectrum);

    for (let i = 0, n = spectrum.length; i < n; i++) {
      array[i] = Math.round(normalize(spectrum[i], minDecibels, maxDecibels) * 255);
    }
  }

  process(input) {
    this.buffer = input;
    this.updateTimeData();
    this.updateFrequencyData();
  }

  updateFrequencyData() {
    this.getByteFrequencyData(this.fft);
  }

  updateTimeData() {
    this.getFloatTimeDomainData(this.td);
  }

  reset() {
    this.fft.fill(0);
    this.td.fill(0);
    this.smoothing.fill(0);
  }
}

const AudioUtil = {
  getBuffer: async (path, cid, sampleRate, onprogress) => {
    const ctx = new AudioContext({sampleRate});
    let fileData;
    if (isBrowser) {
      const res = await getRemote(path, cid, (p) => {
        const { total, loaded } = p;
        total && onprogress && onprogress(loaded / total);
      });
      fileData = await res.data.arrayBuffer();
    } else {
      fileData = fs.readFileSync(path);
    }

    return new Promise((resolve) => {
      ctx.decodeAudioData(fileData, (buffer) => {
        resolve(buffer);
      });
    });
  },
  Analyser
}

module.exports = AudioUtil;





