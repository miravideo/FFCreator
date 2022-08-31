'use strict';

const Koa = require('koa');
const Router = require('@koa/router');
const koaBody = require('koa-body');

const {annotate, cacheDir} = require('./annotate.js')
const {fork} = require("child_process");

const args = require('minimist')(process.argv.slice(2))
const port = args['port'] || 8000;
console.log('listen on:', port);

const app = new Koa();
const router = new Router();

router.post('/annotate', async (ctx) => {
  const start = new Date();
  const {draft_json: value, output_dir: outputDir, task_id, sync=false} = ctx.request.body;

  const subProcess = fork('annotate_server_subprocess.js', [], {
    stdio: "inherit",
  });

  const p1 = new Promise((resolve, reject)=>{
    setTimeout(()=>{
      subProcess.kill("SIGTERM");
      resolve({
        status: 'fail',
        code: 504,
      })
    }, 110*1000); //koa框架默认2分钟过期，这里设置成一个小雨120秒的值
  });
  const p2 = new Promise((resolve, reject)=>{
    subProcess.on('message', (msg) => {
      const {videos, audio} = msg;
      resolve({
        status: 'ok',
        code: 0,
        data: {videos, audio},
      });
    });
    subProcess.on('exit', () => {
      console.log("===subProcess exit===");
    });
    subProcess.send({value});
  });
  ctx.type = 'text/plain; charset=utf-8';
  const body = await Promise.race([p1, p2]);
  const time = new Date() - start;
  console.log(`It took ${time}ms.`)
  ctx.body = {...body, time};
});

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);


