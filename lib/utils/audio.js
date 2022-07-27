'use strict';

/**
 * AudioUtil - Utils functions related to audio
 *
 * @object
 */
const { isBrowser } = require("browser-or-node");
const { getRemote } = require("./xhr");
const { nodeRequire } = require('./utils');

let AudioContext;
if (isBrowser) {
  AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
} else {
  // AudioContext = nodeRequire('web-audio-api').AudioContext;
}

const AudioUtil = {
  getBuffer: async (path, cid, tail=0, onprogress) => {
    const ctx = new AudioContext();
    let fileData;
    if (isBrowser) {
      const res = await getRemote(path, cid, (p) => {
        const { total, loaded } = p;
        total && onprogress && onprogress(loaded / total);
      });
      // const res = await fetch(path, { method: 'GET', responseType: 'arraybuffer' });
      fileData = await res.data.arrayBuffer();
    } else {
      fileData = fs.readFileSync(path);
    }

    return new Promise((resolve) => {
      ctx.decodeAudioData(fileData, (buffer) => {
        // buffer = {length: 3130041, duration: 70.92, sampleRate: 44100, numberOfChannels: 2}
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

  // async apply(buffer, opts={}) {
  //   const onMessage = (e) => {
  //     const opts = e.data.opts;
  //     opts.onprogress = (progress) => postMessage({type: 'progress', progress});
  //     const outs = syncApply(e.data.buffer, opts);
  //     postMessage({type: 'done', outs});
  //   };
  //   let code = Sonic.toString() + ';\n';
  //   code += 'function ' + this.syncApply.toString() + ';\n';
  //   code += `self.onmessage = ${onMessage.toString()};\n`;
  //   const url = URL.createObjectURL(new Blob([code]));

  //   const data = [];
  //   data.push(buffer.getChannelData(0));
  //   if (buffer.numberOfChannels > 1) {
  //     data.push(buffer.getChannelData(1));
  //   }

  //   const wproc = async (buffer, opts) => {
  //     const worker = new Worker(url);
  //     const onprogress = opts.onprogress;
  //     opts.onprogress = null;
  //     worker.postMessage({buffer, opts});
  //     return new Promise((resolve) => {
  //       worker.onmessage = (e) => {
  //         if (e.data.type === 'done' && e.data.outs) {
  //           worker.terminate();
  //           resolve(e.data.outs);
  //         } else if (e.data.type === 'progress' && onprogress) {
  //           onprogress(e.data.progress);
  //         }
  //       }
  //     });
  //   }

  //   const progs = [];
  //   const res = [];
  //   // 把声道拆开，多个worker并行
  //   for (let c = 0; c < buffer.numberOfChannels; c++) {
  //     const _buffer = { data: [data[c]], sampleRate: buffer.sampleRate,
  //       length: buffer.length, duration: buffer.duration, numberOfChannels: 1 };
  //     const _opts = { ...opts, onprogress: (prog) => {
  //       progs[c] = prog;
  //       const p = progs.reduce((a,i) => i+a) / buffer.numberOfChannels;
  //       if (opts.onprogress) opts.onprogress(p);
  //     }};
  //     res[c] = wproc(_buffer, _opts);
  //   }

  //   let outs = await Promise.all(res);
  //   outs = outs.map(out => out[0]);
  //   return this.save(outs, buffer.sampleRate, opts.output);
  // },

  // syncApply(buffer, opts={}) {
  //   const { data, sampleRate, numberOfChannels } = buffer;
  //   const { speed=1.0, rate=1.0, pitch=1.0, blockSize=65536*2, onprogress } = opts;

  //   const outs = [];
  //   const sonic = [];
  //   for (let c = 0; c < numberOfChannels; c++) {
  //     const s = new Sonic(sampleRate, 1); // 单通道xN 处理会更快
  //     s.setSpeed(speed);
  //     s.setRate(rate);
  //     s.setPitch(pitch);
  //     sonic[c] = s;
  //     outs[c] = [];
  //   }

  //   // let ss = Date.now();
  //   for (let i = 0; i < data[0].length; i += blockSize) {
  //     if (onprogress) onprogress(0.1 + 0.9 * (i / data[0].length));
  //     for (let c = 0; c < numberOfChannels; c++) {
  //       const idata = new Int16Array(blockSize);
  //       for (let j = 0; j < blockSize; j++) {
  //         idata[j] = Math.floor(data[c][i+j] * 32768);
  //       }
  //       sonic[c].writeShortToStream(idata);
  //       outs[c].push(sonic[c].readShortFromStream());
  //     }
  //   }

  //   for (let c = 0; c < numberOfChannels; c++) {
  //     sonic[c].flushStream();
  //     outs[c].push(sonic[c].readShortFromStream());
  //   }
  //   // console.log('process audio', Date.now() - ss);

  //   return outs;
  // },

  // save(outs, sampleRate, output) {
  //   let length = 0;
  //   for (const out of outs[0]) {
  //     length += out.length;
  //   }

  //   const ctx = new AudioContext();
  //   const outBuffer = ctx.createBuffer(outs.length, length, sampleRate);
  //   for (let c = 0; c < outs.length; c++) {
  //     const channel = outBuffer.getChannelData(c);
  //     let k = 0;
  //     for (let i = 0; i < outs[c].length; i++) {
  //       for (let j = 0; j < outs[c][i].length; j++) {
  //         channel[k] = outs[c][i][j] / 32768;
  //         k++;
  //       }
  //     }
  //   }
  //   const wav = toWav(outBuffer);
  //   if (!output) return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
  //   fs.writeFileSync(output, Buffer.from(wav));
  //   return output;
  // }
}

module.exports = AudioUtil;