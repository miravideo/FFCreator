'use strict';
const { isBrowser } = require("browser-or-node");
const { nodeRequire } = require('./utils');
const fetch = nodeRequire("./node-fetch");

const md5 = require('md5');
const __req = {};
const XhrUtil = {
  async getRemote(url, progress=null) {
    const key = md5(url);
    if (__req[key]) return __req[key];
    __req[key] = new Promise(function (resolve) {
      if (isBrowser) {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
          const type = xhr.getResponseHeader('Content-Type');
          resolve({ data: xhr.response, type });
        });
        xhr.addEventListener("error", e => resolve({ url }));
        xhr.addEventListener("progress", p => {
          progress && progress(p);
        })
        // console.log('get remote!!', url);
        xhr.open("get", url);
        xhr.responseType = "blob";
        xhr.send();
      } else {
        fetch(url).then(resp => {
          const type = resp.headers.get("content-type");
          resolve({ data: resp, type });
        });
      }
    });
    return __req[key];
  },
}

module.exports = XhrUtil;