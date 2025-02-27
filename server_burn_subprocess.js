const {burn} = require("./burn");

let creator = null;

process.on('message', async (msg) => {
  const {value, task_id, outputDir} = msg
  if (!value) {
    setTimeout(() => { process.exit(1);}, 20);
    return
  }
  console.log('calling burn()');
  try {
    creator = await burn({
      value,
      task_id,
      outputDir,
      onMessage: (msg) => {
        process.send(msg);
        if (msg.step === 'finish') {
          console.log("===[subprocess] burn finish, exit()===");
          setTimeout(() => {
            process.exit();
          }, 1000);//wait for cleaning of cache, etc.
        }
      },
    });
  } catch (e) {
    process.send({
      task_id,
      step:"error",
      result: {error: e.toString()},
    });
    setTimeout(() => {
      process.exit(1);
    }, 20);
  }
});

process.on("SIGTERM", async () => {
  console.log("burn subprocess.on(SIGTERM)");
  process.send({
    "status": "SIGTERM",
  });
  await creator.renderer.removeCacheFiles();
  setTimeout(() => {
    process.exit(1);
  }, 20);
});
