"use strict";

const createServerBase = require("../server/index.js");
const createServer = createServerBase.webdavClient;

const server = createServer("basic");
server.start();

process.on("SIGTERM", function() {
    server.stop();
    process.exit(0);
});
