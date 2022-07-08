'use strict';

const path = require('path');
const fs = require("fs");
const { Factory } = require('./lib/index');
const CacheUtil = require('./lib/utils/cache');

const cacheDir = path.join(__dirname, './cache/');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}
CacheUtil.cacheDir = cacheDir;

function round(x) {
  const PROGRESS_PRECISION = 3;
  const m = Math.pow(10, PROGRESS_PRECISION);
  return Math.round(x * m) / m;
}

const burn = async (opts) => {
  Factory.debug = true;
  Factory.cacheNode = CacheUtil.cacheNode;

  if (!opts['cacheDir']) opts['cacheDir'] = cacheDir

  const {creator, cache} = Factory.from(opts.value, opts, (pp) => {
    console.log('burner.js loading...', pp);
  });
  await cache;

  const onMessage = typeof opts['onMessage'] === 'function'
    ? opts['onMessage']
    : ()=>{};
  const onComplete = typeof opts['onComplete'] === 'function'
    ? opts['onComplete']
    : ()=>{};
  const task_id = opts['task_id'];

  let t = Date.now();
  creator.on('start', () => {
    console.log(`Burn start.`);
    console.log(`Burn start timestamp: ${Date.now() - t}ms`);
    onMessage({
      task_id,
      status: "task_start",
    });
  }).on('error', e => {
    console.error("creator error", e);
  }).on('progress', e => {
    let number = e.percent || 0;
    console.log(`Burn progress: ${(number * 100) >> 0}%`);
    console.log(`Burn progress timestamp: ${Date.now() - t}ms`);
    onMessage({
      task_id,
      step: "synthesis",
      progress: round(number),
    });
  }).on('preloading', (evt) => {
    console.log(`Burn preloading: ${evt.id}: ${evt.loaded}/${evt.total}`);
    console.log(`Burn preloading timestamp: ${Date.now() - t}ms`);
    onMessage({
      task_id,
      step: "preloading",
      progress: round(evt.loaded / evt.total),
    });
  }).on('prepareMaterial', (evt) => {
    console.log(`Burn prepareMaterial: ${evt.id}: ${evt.prepared}/${evt.total}`);
    console.log(`Burn prepareMaterial timestamp: ${Date.now() - t}ms`);
    onMessage({
      task_id,
      step: "prepareMaterial",
      progress: round(evt.prepared / evt.total),
    });
  }).on('complete', e => {
    console.log(`Burn completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `);
    console.log(`Burn completed timestamp: ${Date.now() - t}ms`);
    onMessage({
      task_id,
      status: "finish",
      result: e.output,
    });
    onComplete();
  }).generateOutput().start();
}

module.exports = {
  burn,
}
