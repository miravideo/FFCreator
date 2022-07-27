'use strict';
const { isBrowser } = require("browser-or-node");
const { nodeRequire, genUuid } = require('./utils');
const fetch = nodeRequire("./node-fetch");

const md5 = require('md5');
const __req = {};
const __xhrs = {};
if (global) {
  global.MIRAP_XHRS = __xhrs;
  global.MIRAP_RESP_CACHE = __req;
}
const XhrUtil = {
  async cancel(cid) {
    for (const [k, x] of Object.entries(__xhrs)) {
      if (cid === x._cid) x.abort();
    }
    for (const [k, x] of Object.entries(__req)) {
      const r = await x;
      if (cid === r.cid) delete __req[k];
    }
  },
  async getRemote(url, cid, progress=null) {
    const key = md5(url);
    if (__req[key]) return __req[key];
    __req[key] = new Promise(function (resolve) {
      if (isBrowser) {
        const uuid = genUuid();
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
          delete __xhrs[uuid];
          const type = xhr.getResponseHeader('Content-Type');
          resolve({ data: xhr.response, type, cid });
        });
        xhr.addEventListener("error", e => {
          delete __xhrs[uuid];
          resolve({ url, cid });
        });
        xhr.addEventListener("abort", e => {
          delete __xhrs[uuid];
          resolve({ url, cid });
        });
        xhr.addEventListener("progress", p => {
          progress && progress(p);
        })
        // console.log('get remote!!', url);
        xhr.open("get", url);
        xhr.responseType = "blob";
        xhr._cid = cid;
        xhr.send();
        __xhrs[uuid] = xhr;
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