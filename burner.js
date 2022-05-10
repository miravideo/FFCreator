'use strict';

const path = require('path');
const fs = require("fs");
const { Factory } = require('./lib/index');
const CacheUtil = require('./lib/utils/cache');

const outputDir = path.join(__dirname, './output/');
const cacheDir = path.join(__dirname, './cache/');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}
CacheUtil.cacheDir = cacheDir;

const burn = async (opts) => {
  Factory.debug = true;
  Factory.cacheNode = CacheUtil.cacheNode;

  const creator = await Factory.from(opts.value, opts, (pp) => {
    console.log(pp);
  });

  creator.on('start', () => {
    console.log(`Burn start`);
  }).on('error', e => {
    console.error(e);
  }).on('progress', e => {
    console.log(`Burn progress: ${(e.percent * 100) >> 0}%`);
  }).on('preloading', (evt) => {
    console.log(`Burn preloading ${evt.id}: ${evt.loaded}/${evt.total}`);
  }).on('complete', e => {
    console.log(`Burn completed: \n USEAGE: ${e.useage} \n PATH: ${e.output} `);
  }).generateOutput().start();
}

let miraml_file = process.argv[2] || './burner.miraml';
console.log("miraml_file:", miraml_file);
const value = fs.readFileSync(miraml_file, 'utf8');
console.log("value:", value);
burn({ value, cacheDir, outputDir });
