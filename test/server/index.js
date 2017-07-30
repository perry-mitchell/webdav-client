var path = require("path"),
    ws = require("webdav-server").v2;

function createServer(dir, authType) {
    if (!dir) {
        throw new Error("Expected target directory");
    }
    var userManager = new ws.SimpleUserManager();
    var user = userManager.addUser("webdav-user", "pa$$w0rd!");
    var auth = (!authType || authType === "basic") ?
        new ws.HTTPBasicAuthentication(userManager) :
        new ws.HTTPDigestAuthentication(userManager, "test");
    var privilegeManager = new ws.SimplePathPrivilegeManager();
    privilegeManager.setRights(user, "/", [ "all" ]);
    var server = new ws.WebDAVServer({
        port: 9988,
        httpAuthentication: auth,
        privilegeManager: privilegeManager
    });
    return {

        start: function start() {
            return new Promise(function(resolve) {
                server.setFileSystem("/webdav/server", new ws.PhysicalFileSystem(dir), function() {
                    server.start(resolve);
                });
            });
        },

        stop: function stop() {
            return new Promise(function(resolve) {
                server.stop(resolve);
            });
        }

    };
};

createServer.test = {
    username: "webdav-user",
    password: "pa$$w0rd!",
    port: 9988
};

createServer.webdavClient = function(authType) {
    return createServer(
        path.resolve(__dirname, "../testContents"),
        authType
    );
};

module.exports = createServer;
