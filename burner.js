'use strict';

const path = require('path');
const fs = require("fs");
const os = require("os");
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

  const { node: creator, cache } = Factory.from(opts.value, opts, (pp) => {
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
    let number = e.percent || 0;
    console.log(`Burn progress: ${(number * 100) >> 0}%`);
    console.log(`Burn progress timestamp: ${Date.now() - t}ms`);
    client.sendMessage({
      step: "synthesis",
      progress: round(number),
    });
  }).on('preloading', (evt) => {
    console.log(`Burn preloading: ${evt.id}: ${evt.loaded}/${evt.total}`);
    console.log(`Burn preloading timestamp: ${Date.now() - t}ms`);
    client.sendMessage({
      step: "preloading",
      progress: round(evt.loaded / evt.total),
    });
  }).on('prepareMaterial', (evt) => {
    console.log(`Burn prepareMaterial: ${evt.id}: ${evt.prepared}/${evt.total}`);
    console.log(`Burn prepareMaterial timestamp: ${Date.now() - t}ms`);
    client.sendMessage({
      step: "prepareMaterial",
      progress: round(evt.prepared / evt.total),
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

async function parseCommandLineAndBurn() {
  let miraml_file = process.argv[2] || './burner.miraml';
  console.log("miraml_file:", miraml_file);
  const value = fs.readFileSync(miraml_file, 'utf8');
  console.log("value:", value);
  await burn({value, cacheDir, outputDir: path.dirname(miraml_file)});
}

function connectSocketAndBurn() {
  client.connect().then(async () => {
    client.sendMessage({
      status: "start",
    });

    await parseCommandLineAndBurn();
  }).catch((e)=>{
    console.error(e);
    setTimeout(connectSocketAndBurn, 1000);
  });
}
process.on('uncaughtException', err => {
  client.sendMessage({
    status: "error",
    error: err.message,
  });
  client.destroy();
  console.error('uncaughtException', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});

if (process.env.SERVER_HOST) {
  connectSocketAndBurn();
} else {
  parseCommandLineAndBurn();
}

// setInterval(() => {
//   let memoryUsage = process.memoryUsage();
//   const roundToMB = (bytes) => { return Math.round(bytes / 1024 / 1024) }
//   const mem_info = {
//     "os.free": os.freemem(),
//     "os.total": os.totalmem(),
//     "process.rss" : memoryUsage['rss'],
//     "process.heapTotal" : memoryUsage['heapTotal'],
//     "process.heapUsed" : memoryUsage['heapUsed'],
//     "process.external" : memoryUsage['external'],
//     "process.arrayBuffers" : memoryUsage['arrayBuffers'],
//     // rss":"916","heapTotal":"29","heapUsed":"23","external":"746","arrayBuffers":"167"
//   }
//   Object.keys(mem_info).map(function(key) {
//     mem_info[key] = roundToMB(mem_info[key]);
//   });
//   console.log(`=== mem_info in MB: ${JSON.stringify(mem_info)}`)
// }, 1000);
