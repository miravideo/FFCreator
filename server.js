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
let burnProcessLastMessage = {}
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
    burnProcessLastMessage[task_id] = msg;
  });
  burnProcess.on('exit', () => {
    console.log("===burnProcess exit===");
    s?.push(null);
    delete burnProcessMap[task_id];
    delete burnProcessLastMessage[task_id];
  });
  burnProcess.send({
    value,
    task_id,
    outputDir,
  });
  burnProcessMap[task_id] = burnProcess;

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

router.get('/status', async (ctx) => {
  const sync = "sync" in ctx.request.query ? (ctx.request.query.sync).toLowerCase() === "true" : true;
  const task_id = ctx.request.query.task_id;
  const s = sync ? new PassThrough() : null;

  const lastMessage = burnProcessLastMessage[task_id];
  if (lastMessage) {
    s?.push(JSON.stringify(lastMessage) + "\n");
  }
  const burnProcess = burnProcessMap[task_id];
  if (!burnProcess) {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = `task_id(${task_id}) not found`;
    return
  }
  burnProcess.on('message', (msg) => {
    if (task_id) msg = {...msg, task_id}
    s?.push(JSON.stringify(msg) + "\n");
  });
  burnProcess.on('exit', () => {
    s?.push(null);
  });

  if (sync) {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = s
  } else {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = JSON.stringify(lastMessage) + "\n";
  }
});

router.get('/cancel', async (ctx) => {
  const task_id = ctx.request.query.task_id;
  if (task_id in burnProcessMap) {
    burnProcessMap[task_id].kill("SIGTERM");
  } else if (task_id === "all") {
    for (const key in burnProcessMap) {
      const burnProcess = burnProcessMap[key];
      burnProcess.kill("SIGTERM");
    }
  } else {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = `task_id(${task_id}) not found`;
    return;
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


