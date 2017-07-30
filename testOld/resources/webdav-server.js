var jsDAV = require("jsDAV/lib/jsdav"),
    jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs"),
    jsDAV_Auth_Backend_File = require("jsDAV/lib/DAV/plugins/auth/file");

module.exports = function createServer() {
    var server;

    return {

        start: function() {
            return new Promise(function(resolve) {
                server = jsDAV.createServer({
                    node: __dirname + "/webdav_testing_files/",
                    locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data")
                }, 9999);
                setTimeout(resolve, 250);
            });
        },

        startAuthenticated: function() {
            return new Promise(function(resolve) {
                server = jsDAV.createServer({
                    node: __dirname + "/webdav_testing_files/",
                    locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/data"),
                    authBackend: jsDAV_Auth_Backend_File.new(__dirname + "/htdigest"),
                    realm: "test"
                }, 9999);
                setTimeout(resolve, 250);
            });
        },

        stop: function() {
            return new Promise(function(resolve) {
                server.close(function() {
                    server = undefined;
                    setTimeout(resolve, 100);
                });
            });
        }

    };
};
