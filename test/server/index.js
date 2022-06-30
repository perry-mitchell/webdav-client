const path = require("path");
const ws = require("webdav-server").v2;
const { PASSWORD, PORT, USERNAME } = require("./credentials.js");

function createServer(dir, authType) {
    if (!dir) {
        throw new Error("Expected target directory");
    }
    const userManager = new ws.SimpleUserManager();
    const user = userManager.addUser(USERNAME, PASSWORD);
    let auth;
    switch (authType) {
        case "digest":
            auth = new ws.HTTPDigestAuthentication(userManager, "test");
            break;
        case "basic":
        /* falls-through */
        default:
            auth = new ws.HTTPBasicAuthentication(userManager);
            break;
    }
    const privilegeManager = new ws.SimplePathPrivilegeManager();
    privilegeManager.setRights(user, "/", ["all"]);
    const server = new ws.WebDAVServer({
        port: PORT,
        httpAuthentication: auth,
        privilegeManager: privilegeManager,
        maxRequestDepth: Infinity,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
                "HEAD, GET, PUT, PROPFIND, DELETE, OPTIONS, MKCOL, MOVE, COPY",
            "Access-Control-Allow-Headers":
                "Accept, Authorization, Content-Type, Content-Length, Depth"
        }
    });
    // console.log(`Created server on localhost with port: 9988, and authType: ${authType}`);
    return {
        start: function start() {
            return new Promise(function (resolve) {
                server.setFileSystem("/webdav/server", new ws.PhysicalFileSystem(dir), function () {
                    server.start(resolve);
                });
            });
        },

        stop: function stop() {
            return new Promise(function (resolve) {
                server.stop(resolve);
            });
        }
    };
}

function createWebDAVServer(authType) {
    return createServer(path.resolve(__dirname, "../testContents"), authType);
}

module.exports = {
    createServer,
    createWebDAVServer
};
