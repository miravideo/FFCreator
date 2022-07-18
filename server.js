'use strict';

const {fork} = require('child_process');
const Koa = require('koa');
const Router = require('@koa/router');
const koaBody = require('koa-body');
const {SocketClient} = require("./socket_client");
const PassThrough = require('stream').PassThrough;

const args = require('minimist')(process.argv.slice(2))
const port = args['port'] || 8000;
console.log('listen on:', port);

const app = new Koa();
const router = new Router();

const client = new SocketClient(process.env.TASK_ID, process.env.SOCKET_PORT, process.env.SOCKET_HOST);

function connectSocket() {
  if (!process.env.SOCKET_HOST) return;
  client.connect().then(async () => {
    client.sendMessage({
      status: "server_start",
    });
  }).catch((e)=>{
    console.error(e);
    setTimeout(connectSocket, 1000);
  });
}
process.on('uncaughtException', err => {
  client.sendMessage({
    status: "error",
    error: err.stack,
  });
  // client.destroy();
  // console.error('uncaughtException', err);
  // process.exit(1); // mandatory (as per the Node.js docs)
});

let burnProcessMap = {};
router.post('/burn', async (ctx) => {
  const {draft_json: value, output_dir: outputDir, task_id, sync=false} = ctx.request.body;
  const s = sync ? new PassThrough() : null;

  const burnProcess = fork('server_burn_subprocess.js', [], {
    stdio: "inherit",
  });
  burnProcess.on('message', (msg) => {
    console.log('burnProcess.msg:', msg);
    if (task_id) msg = {...msg, task_id}
    client.sendMessage(msg);
    s?.push(JSON.stringify(msg) + "\n");
  });
  burnProcess.on('exit', () => {
    console.log("===burnProcess exit===");
    s?.push(null);
    delete burnProcessMap[burnProcess.pid];
  });
  burnProcess.send({
    value,
    task_id,
    outputDir,
  });
  burnProcessMap[burnProcess.pid] = burnProcess;

  if (sync) {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = s
  } else {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = {
      status: 'ok',
    };
  }
});

router.get('/cancel', async (ctx) => {
  for (const key in burnProcessMap) {
    const burnProcess = burnProcessMap[key];
    burnProcess.kill("SIGTERM");
  }
  ctx.type = 'text/plain; charset=utf-8';
  ctx.body = {
    status: 'ok',
  };
});

router.get('/time', async (ctx) => {
  const s = new PassThrough();
  let count = 5;
  const interval = setInterval(() => {
    const pushed = s.push(`${count--}\n`);
    console.log(pushed);
    if (count <= 0) {
      s.push(null);// indicates end of the stream
      clearInterval(interval);
    }
  }, 1000);
  ctx.body = s
})

router.get('/healthy', async (ctx) => {
  ctx.body = {
    status: 'ok',
  };
})

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);

connectSocket();


