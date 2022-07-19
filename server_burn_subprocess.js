const {burn} = require("./burn");

let creator = null;

process.on('message', async (msg) => {
  const {value, task_id, outputDir} = msg
  if (!value) return
  creator = await burn({
    value,
    task_id,
    outputDir,
    onMessage: (msg) => {
      process.send(msg);
      if (msg.status === 'finish') {
        console.log("===[subprocess] burn finish, exit()===");
        setTimeout(() => {
          process.exit();
        }, 1000);//wait for cleaning of cache, etc.
      }
    },
  });
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
