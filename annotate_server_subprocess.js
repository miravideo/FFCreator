'use strict';

const {annotate} = require('./annotate.js')

process.on('message', async (msg) => {
  const {value} = msg;
  const {videos, audio} = await annotate({value});
  process.send({videos, audio})
  setTimeout(() => {
    process.exit();
  }, 1000);
});
