const path = require("path");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;
const { createWebDAVServer } = require("./server/index.js");

rimraf(path.resolve(__dirname, "./testContents"));
copyDir(path.resolve(__dirname, "./serverContents"), path.resolve(__dirname, "./testContents"));

const server = createWebDAVServer("basic");
server.start().then(() => {
    console.log("Server started");
});

process.on("SIGTERM", function () {
    server.stop();
    process.exit(0);
});
process.on("SIGINT", function () {
    server.stop();
    process.exit(0);
});
