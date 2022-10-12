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

class FFTParser {
  static defaultProperties = {
    fftSize: 1024,
    sampleRate: 44100,
    smoothingTimeConstant: 0.9,
    minDecibels: -100,
    maxDecibels: -10,
    minFrequency: 0,
    maxFrequency: 9000,
  };

  constructor() {
    this.properties = FFTParser.defaultProperties;
    this.init();
  }

  init() {
    const { fftSize, sampleRate, minFrequency, maxFrequency } = this.properties;

    const range = sampleRate / fftSize;
    this.startBin = floor(minFrequency / range);
    this.endBin = floor(maxFrequency / range);
    this.totalBins = this.endBin - this.startBin;
  }

  getValue(fft) {
    const { minDecibels, maxDecibels } = this.properties;
    const db = minDecibels * (1 - fft / 256);

    return normalize(db2mag(db), db2mag(minDecibels), db2mag(maxDecibels));
  }

  parseFFT(fft, bins) {
    let { output, buffer } = this;
    const { startBin, endBin, totalBins } = this;
    const { smoothingTimeConstant } = this.properties;
    const size = bins || totalBins;

    // Resize data arrays
    if (output?.length !== size) {
      output = new Float32Array(size);
      buffer = new Float32Array(size);
      this.output = output;
      this.buffer = buffer;
    }

    // Straight conversion
    if (size === totalBins) {
      for (let i = startBin, k = 0; i < endBin; i += 1, k += 1) {
        output[k] = this.getValue(fft[i]);
      }
    }
    // Compress data
    else if (size < totalBins) {
      const step = totalBins / size;

      for (let i = startBin, k = 0; i < endBin; i += 1, k += 1) {
        const start = ~~(i * step);
        const end = ~~(start + step);
        let max = 0;

        // Find max value within range
        for (let j = start, n = ~~(step / 10) || 1; j < end; j += n) {
          const val = fft[j];

          if (val > max) {
            max = val;
          } else if (-val > max) {
            max = -val;
          }
        }

        output[k] = this.getValue(max);
      }
    }
    // Expand data
    else if (size > totalBins) {
      const step = size / totalBins;

      for (let i = startBin, j = 0; i < endBin; i += 1, j += 1) {
        const val = this.getValue(fft[i]);
        const start = ~~(j * step);
        const end = start + step;

        for (let k = start; k < end; k += 1) {
          output[k] = val;
        }
      }
    }

    // Apply smoothing
    if (smoothingTimeConstant > 0) {
      for (let i = 0; i < size; i += 1) {
        output[i] = buffer[i] * smoothingTimeConstant + output[i] * (1.0 - smoothingTimeConstant);
        buffer[i] = output[i];
      }
    }

    return output;
  }
}


class Analyser {
  static defaultProperties = {
    fftSize: 1024,
  };

  constructor(fftSize) {
    this.properties = Analyser.defaultProperties;
    this.properties.fftSize = fftSize;
    this.init();
  }

  minute (time) {
    const min = Math.floor(time / 60);
    return (min < 10) ? '0' +  min : min
  }

  second (time) {
    const second = Math.floor(time % 60);
    return (second < 10) ? '0' +  second : second
  };

  init() {
    const {
      properties: { fftSize },
    } = this;

    // this.FFTParser = new FFTParser();
    this.oriFFT = new Float32Array(fftSize / 2);
    this.td = new Float32Array(fftSize);

    this.blackmanTable = new Float32Array(fftSize);

    for (let i = 0; i < fftSize; i++) {
      this.blackmanTable[i] = blackman(i, fftSize);
    }

    this.buffer = new Float32Array(fftSize);

    this.smoothing = new Float32Array(fftSize / 2);
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
      array[i] = spectrum[i];
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
    const { fftSize } = this.properties;
    const spectrum = new Float32Array(fftSize/2);

    this.getFloatFrequencyData(spectrum);

    for (let i = 0, n = spectrum.length; i < n; i++) {
      array[i] = spectrum[i] * 255 / 2;
    }
  }

  process(input) {
    const { fftSize } = this.properties;
    const merged = new Float32Array(fftSize);

    // 把所有chanel都相加，并根据fftSize切片
    for (let chanelData of input) {
      for (let i = 0; i < fftSize; i++) {
        merged[i] += chanelData[i] || 0;
      }
    }

    this.buffer = merged;
    this.updateTimeData();
    this.updateFrequencyData();
    let max = this.td[0], min = this.td[0], total = 0;
    for (let i = 0; i < this.td.length; i++) {
      if (this.td[i] > max) {
        max = this.td[i];
      }

      if (this.td[i] < min) {
        min = this.td[i];
      }

      total += this.td[i];
    }
    this.max = max;
    this.min = min;
    this.avg = total / this.td.length;
    this.fft = this.oriFFT;
    this.gain = this.oriFFT.reduce((a, b) => a + b) / this.oriFFT.length;
  }

  updateFrequencyData() {
    this.getByteFrequencyData(this.oriFFT);
  }

  updateTimeData() {
    this.td = this.buffer;
  }

  reset() {
    this.fft.fill(0);
    this.oriFFT.fill(0);
    this.td.fill(0);
    this.smoothing.fill(0);
  }
}

const AudioUtil = {
  getBuffer: async (path, cid, sampleRate, tail, onprogress) => {
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
        if (tail > 0) {
          // 在音频末尾补上一段静音，避免SoundTouch播放的时候把尾巴吞掉了
          const tailLen = Math.round(tail * buffer.sampleRate);
          const n = buffer.numberOfChannels;
          const _buffer = ctx.createBuffer(n, buffer.length + tailLen, buffer.sampleRate);
          const _tail = new Float32Array(tailLen);
          for (var i = 0; i < n; i++) {
            const channel = _buffer.getChannelData(i);
            channel.set(buffer.getChannelData(i), 0);
            channel.set(_tail, buffer.length);
          }
          buffer = _buffer;
        }
        resolve(buffer);
      });
    });
  },
  Analyser
}

module.exports = AudioUtil;





