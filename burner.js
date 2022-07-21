'use strict';

const path = require('path');
const fs = require("fs");
const {burn} = require("./burn");

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
      console.log("msg:", msg);
    },
  });
}

parseCommandLineAndBurn();

