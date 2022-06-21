'use strict';
const md5 = require('md5');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');

let cv_available = false;
try {
  const cv = require('opencv4nodejs');
  cv_available = cv && cv.VideoCapture;
} catch (e) {}

// node-fetch from v3 is an ESM-only module - you are not able to import it with require().
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cacheLock = {};

const CacheUtil = {
  cacheDir: null,
  async cachedResource(src, progress, cacheDir) {
    cacheDir = cacheDir || CacheUtil.cacheDir;
    fs.ensureDir(cacheDir);
    const key = md5(src);
    const ext = url.parse(src).pathname.split('.').slice(-1)[0];
    const cacheFile = path.join(cacheDir, `${key}.${ext}`);
    if (fs.existsSync(cacheFile) || cacheLock[key]) return cacheFile;
    // 锁一下，防止并发导致多次下载同一个文件
    cacheLock[key] = src;
    const total = 1024 * 1024;
    progress && progress({ key, total, loaded: 1 });
    const res = await fetch(src);
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(cacheFile);
      res.body.pipe(fileStream);
      res.body.on("error", (err) => {
        reject(err);
      });
      fileStream.on("finish", function() {
        progress && progress({ key, total, loaded: total });
        resolve(cacheFile);
      });
    });
  },
  async cacheNode(node, progress) {
    let { type, src, path, url, fontFamily, font, preload } = node.conf;
    let source = src || path || url;
    // opencv读取video只能是本地的文件
    let cacheDir = null;
    if (!cv_available && type === 'video') {
      cacheDir = node.rootConf('detailedCacheDir');
      preload = true;
    }
    if (type === 'text' && fontFamily?.startsWith('http')) { // must preload
      const fontPath = await CacheUtil.cachedResource(fontFamily, progress);
      node.cachedFontFamily = fontPath;
    } else if (type === 'richtext' && font) { // default preload=true
      const fonts = Array.isArray(font) ? font : [font];
      for (const ft of fonts) {
        ft.format = node.fontFormat(ft);
        const path = await CacheUtil.cachedResource(ft.src, progress);
        ft.src = node.base64path(path);
      }
      node.conf.font = fonts
    } else if (['image', 'gif'].includes(type) && source && preload) { // default preload=false
      node.conf.src = await CacheUtil.cachedResource(source, progress);
    } else if (['audio', 'video'].includes(type) && source && preload) { // default preload=false
      node.conf.src = await CacheUtil.cachedResource(source, progress, cacheDir);
      const paths = source.split('/');
      node.conf.srcFile = paths[paths.length - 1];
    } else {
      source = null;
    }
    if (source) node.conf.origSrc = source;
  },
}

module.exports = CacheUtil;