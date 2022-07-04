'use strict';

const path = require('path');
const fs = require("fs");
const { Factory } = require('./lib/index');
const CacheUtil = require('./lib/utils/cache');
const { SocketClient } = require("./socket_client");

const outputDir = path.join(__dirname, './output/');
const cacheDir = path.join(__dirname, './cache/');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}
CacheUtil.cacheDir = cacheDir;

const PROGRESS_PRECISION = 3;
function round(x) {
  const m = Math.pow(10, PROGRESS_PRECISION);
  return Math.round(x * m) / m;
}

const burn = async (opts) => {
  Factory.debug = true;
  Factory.cacheNode = CacheUtil.cacheNode;

  const {creator, cache} = Factory.from(opts.value, opts, (pp) => {
    console.log('burner.js loading...', pp);
  });
  await cache;

  let t = Date.now();
  creator.on('start', () => {
    console.log(`Burn start.`);
    console.log(`Burn start timestamp: ${Date.now() - t}ms`);
  }).on('error', e => {
    console.error("creator error", e);
  }).on('progress', e => {
    console.log(`Burn progress: ${(e.percent * 100) >> 0}%`);
    console.log(`Burn progress timestamp: ${Date.now() - t}ms`);
    client.sendMessage({
      step: "synthesis",
      process: round(e.percent),
    });
  }).on('preloading', (evt) => {
    console.log(`Burn preloading: ${evt.id}: ${evt.loaded}/${evt.total}`);
    console.log(`Burn preloading timestamp: ${Date.now() - t}ms`);
    client.sendMessage({
      step: "preloading",
      process: round(evt.loaded / evt.total),
    });
  }).on('prepareMaterial', (evt) => {
    console.log(`Burn prepareMaterial: ${evt.id}: ${evt.prepared}/${evt.total}`);
    console.log(`Burn prepareMaterial timestamp: ${Date.now() - t}ms`);
    client.sendMessage({
      step: "prepareMaterial",
      process: round(evt.prepared / evt.total),
    });
  }).on('complete', e => {
    console.log(`Burn completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `);
    console.log(`Burn completed timestamp: ${Date.now() - t}ms`);
    client.sendMessage({
      status: "finish",
      result: e.output,
    });
    client.destroy();
  }).generateOutput().start();
}

const client = new SocketClient(process.env.TASK_ID, process.env.SERVER_PORT, process.env.SERVER_HOST);
client.connect().catch(console.error).finally(async () => {
  client.sendMessage({
    status: "start",
  });

  let miraml_file = process.argv[2] || './burner.miraml';
  console.log("miraml_file:", miraml_file);
  const value = fs.readFileSync(miraml_file, 'utf8');
  console.log("value:", value);
  await burn({value, cacheDir, outputDir:path.dirname(miraml_file)});
});
process.on('uncaughtException', err => {
  client.sendMessage({
    status: "error",
    error: err.message,
  });
  client.destroy();
  console.error('uncaughtException', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});
