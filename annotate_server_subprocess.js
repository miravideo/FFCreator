'use strict';

const {annotate, cacheDir} = require('./annotate.js')

process.on('message', async (msg) => {
  const {value} = msg;
  const {videos, audio} = await annotate({value, cacheDir});
  process.send({videos, audio})
  setTimeout(() => {
    process.exit();
  }, 1000);
});
