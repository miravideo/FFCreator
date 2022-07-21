'use strict';

const {fork} = require('child_process');
const Koa = require('koa');
const Router = require('@koa/router');
const koaBody = require('koa-body');
const {request} = require("http");
const PassThrough = require('stream').PassThrough;

const args = require('minimist')(process.argv.slice(2))
const port = args['port'] || 8000;
console.log('listen on:', port);

const app = new Koa();
const router = new Router();

let burnProcessMap = {};
let burnProcessLastMessage = {}
const updateLastMessage = (task_id, msg) => {
  delete burnProcessLastMessage[task_id];
  burnProcessLastMessage[task_id] = msg;
  if (Object.keys(burnProcessLastMessage).length > 100) {
    delete burnProcessLastMessage[Object.keys(burnProcessLastMessage)[0]];
  }
}

router.post('/burn', async (ctx) => {
  const {draft_json: value, output_dir: outputDir, task_id, sync=false} = ctx.request.body;
  const s = sync ? new PassThrough() : null;

  const burnProcess = fork('server_burn_subprocess.js', [], {
    stdio: "inherit",
  });
  burnProcess.on('message', (msg) => {
    console.log('burnProcess.msg:', msg);
    if (task_id) msg = {...msg, task_id}
    s?.push(JSON.stringify(msg) + "\n");
    updateLastMessage(task_id, msg);
  });
  burnProcess.on('exit', () => {
    console.log("===burnProcess exit===");
    s?.push(null);
    delete burnProcessMap[task_id];
    sendReadyState();
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

router.all('/status', async (ctx) => {
  const sync = "sync" in ctx.request.query
    ? (ctx.request.query.sync).toLowerCase() === "true"
    : ("sync" in ctx.request.body ? ctx.request.body.sync : true);
  const task_id = ctx.request.query.task_id;

  const lastMessage = burnProcessLastMessage[task_id];

  // if not sync, return last message or 404
  if (!sync) {
    if (lastMessage) {
      ctx.type = 'text/plain; charset=utf-8';
      ctx.body = JSON.stringify(lastMessage) + "\n";
    } else {
      ctx.type = 'text/plain; charset=utf-8';
      ctx.status = 404;
      ctx.body = {code: -1, msg: `task_id(${task_id}) not found`};
    }
    return
  }

  const s = new PassThrough();
  if (lastMessage) {
    s.push(JSON.stringify(lastMessage) + "\n");
  }

  const burnProcess = burnProcessMap[task_id];

  // deal with burnProcess not found, and return
  if (!burnProcess) {
    if (lastMessage) {
      s.push(null);
      ctx.type = 'text/plain; charset=utf-8';
      ctx.body = s;
    } else {
      ctx.type = 'text/plain; charset=utf-8';
      ctx.status = 404;
      ctx.body = {code: -1, msg: `task_id(${task_id}) not found`};
    }
    return
  }

  burnProcess.on('message', (msg) => {
    if (task_id) msg = {...msg, task_id}
    s.push(JSON.stringify(msg) + "\n");
  });
  burnProcess.on('exit', () => {
    s.push(null);
  });

  ctx.type = 'text/plain; charset=utf-8';
  ctx.body = s;
});

const kill = (task_id) => {
  if (task_id in burnProcessMap) {
    burnProcessMap[task_id].kill("SIGTERM");
    return true;
  } else if (task_id === "all") {
    for (const key in burnProcessMap) {
      const burnProcess = burnProcessMap[key];
      burnProcess.kill("SIGTERM");
    }
    return true;
  }
  return false;
}

router.all('/cancel', async (ctx) => {
  const task_id = ctx.request.query.task_id || ctx.request.body.task_id;
  if (kill(task_id)) {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = {
      status: 'ok',
    };
  } else {
    ctx.type = 'text/plain; charset=utf-8';
    ctx.body = `task_id(${task_id}) not found`;
  }
});

router.all('/time', async (ctx) => {
  const s = new PassThrough();
  let count = ctx.request.query.count || ctx.request.body.count || 5;
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

const destroy = async (callback) => {
  if (burnProcessMap.length > 0) {
    kill("all");
    setTimeout(() => {
      destroy(callback);
    }, 100);
  } else {
    callback();
  }
}

router.get('/destroy', async (ctx) => {
  await destroy(() => {
    ctx.body = {
      status: 'ok',
    };
    // after response returned.
    setTimeout(() => {
      process.exit(0);
    }, 10);
  });
});

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);

const sendReadyState = () => {
  console.log("sendReadyState()");
  const data = JSON.stringify({
    "state": "READY"
  });
  const options = {
    hostname: 'localhost',
    port: 9000,
    path: '/api/v1/task/state',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    }
  }
  const req = request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      console.log("retry in 1s");
      setTimeout(sendReadyState, 1000);
    }
    res.on('data', d => {
      console.log(d.toString());
    });
  });
  req.on('error', (err) => {
    console.log("on error:", err);
    console.log("retry in 1s");
    setTimeout(sendReadyState, 1000);
  });
  req.write(data);
  req.end();
}

sendReadyState();


