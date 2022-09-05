const fs = require("fs");
const path = require("path");
const { Factory } = require('./lib/index');
const CacheUtil = require('./lib/utils/cache');
const {cacheDir} = require('./burn.js')
CacheUtil.cacheDir = cacheDir;

const annotate = async (opts) => {
  if (!opts['cacheDir']) opts['cacheDir'] = cacheDir
  Factory.debug = true;
  Factory.cacheNode = CacheUtil.cacheNode;

  const {node: creator, cache} = Factory.from(opts.value, opts, (pp) => {
    console.log('burner.js loading...', pp);
  });
  await cache;

  const sliceLen = 30;
  const result = await creator.prepare(sliceLen);
  if ('videos' in result) {
    const {videos, audio} = result
    return {videos, audio};
  } else if (result['type'] === 'canvas') {
    return {videos:[result], audio: null};
  } else {
    throw Error("invalid result return from creator.prepare()")
  }

}

async function parseCommandLineAndAnnotate() {
  let miraml_file = process.argv[2] || './burner.miraml';
  console.log("miraml_file:", miraml_file);
  const value = fs.readFileSync(miraml_file, 'utf8');
  console.log("value:", value);
  return await annotate({value, cacheDir, outputDir: path.dirname(miraml_file)});
}

(async ()=> {
  if (require.main !== module) return //ignore if not executed from commandline
  const {videos, audio} = await parseCommandLineAndAnnotate()
  console.log(videos, audio);
  // for (const i in videos) {
  //   fs.writeFileSync(`anno_v${i}.json`, JSON.stringify(videos[i]));
  // }
  // fs.writeFileSync(`anno_a.json`, JSON.stringify(audio));
})()

module.exports = {annotate, cacheDir};
