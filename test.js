'use strict';
const AudioUtil = require('./lib/utils/audio');

(async () => {
  let ss = Date.now();
  const buffer = await AudioUtil.getBuffer('/Users/ZhaoJun/Downloads/titanic.mp3');
  console.log('read buffer', Date.now() - ss);

  const opts = { speed: 2, 
    onprogress: (prog) => {
      console.log(prog);
    }
  };
  ss = Date.now();
  AudioUtil.syncApply(buffer, opts);
  console.log('sonic apply', Date.now() - ss);
})();
