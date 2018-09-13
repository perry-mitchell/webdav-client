"use strict";

const path = require("path");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;
const createServerBase = require("../server/index.js");
const createServer = createServerBase.webdavClient;

rimraf(path.resolve(__dirname, "../testContents"));
copyDir(path.resolve(__dirname, "../serverContents"), path.resolve(__dirname, "../testContents"));

const server = createServer("basic");
server.start();

process.on("SIGTERM", function() {
    server.stop();
    process.exit(0);
});
process.on("SIGINT", function() {
    server.stop();
    process.exit(0);
});
