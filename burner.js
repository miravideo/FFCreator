'use strict';

const path = require('path');
const fs = require("fs");
const { SocketClient } = require("./socket_client");
const {burn} = require("./burn");

const client = new SocketClient(process.env.TASK_ID, process.env.SERVER_PORT, process.env.SERVER_HOST);

async function parseCommandLineAndBurn() {
  let miraml_file = process.argv[2] || './burner.miraml';
  console.log("miraml_file:", miraml_file);
  const value = fs.readFileSync(miraml_file, 'utf8');
  console.log("value:", value);
  await burn({
    value,
    task_id: process.env.TASK_ID,
    outputDir: path.dirname(miraml_file),
    onMessage: (msg) => {
      client.sendMessage(msg);
    },
  });
}

function connectSocketAndBurn() {
  client.connect().then(async () => {
    client.sendMessage({
      status: "start",
    });

    await parseCommandLineAndBurn();
  }).catch((e)=>{
    console.error(e);
    setTimeout(connectSocketAndBurn, 1000);
  });
}
process.on('uncaughtException', err => {
  client.sendMessage({
    status: "error",
    error: err.message,
  });
  client.destroy();
  console.error('uncaughtException', err);
  process.exit(1); // mandatory (as per the Node.js docs)
});

if (process.env.SERVER_HOST) {
  connectSocketAndBurn();
} else {
  parseCommandLineAndBurn();
}

