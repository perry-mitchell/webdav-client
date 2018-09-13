"use strict";

const path = require("path");
const ws = require("webdav-server").v2;

function createServer(dir, authType) {
    if (!dir) {
        throw new Error("Expected target directory");
    }
    const userManager = new ws.SimpleUserManager();
    const user = userManager.addUser("webdav-user", "pa$$w0rd!");
    const auth =
        !authType || authType === "basic"
            ? new ws.HTTPBasicAuthentication(userManager)
            : new ws.HTTPDigestAuthentication(userManager, "test");
    const privilegeManager = new ws.SimplePathPrivilegeManager();
    privilegeManager.setRights(user, "/", ["all"]);
    const server = new ws.WebDAVServer({
        port: 9988,
        httpAuthentication: auth,
        privilegeManager: privilegeManager
    });
    console.log("Created server on with config:", 9988, authType);
    return {
        start: function start() {
            return new Promise(function(resolve) {
                console.log("Starting WebDAV server at directory:", dir);
                server.setFileSystem("/webdav/server", new ws.PhysicalFileSystem(dir), function() {
                    server.start(resolve);
                });
            });
        },

        stop: function stop() {
            return new Promise(function(resolve) {
                console.log("Stopping WebDAV server");
                server.stop(resolve);
            });
        }
    };
}

createServer.test = {
    username: "webdav-user",
    password: "pa$$w0rd!",
    port: 9988
};

createServer.webdavClient = function(authType) {
    return createServer(path.resolve(__dirname, "../testContents"), authType);
};

module.exports = createServer;
