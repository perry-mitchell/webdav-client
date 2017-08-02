var path = require("path"),
    fs = require("fs"),
    WritableStream = require("stream").Writable,
    waitOn = require("wait-on");

var SOURCE_FILENAME = path.resolve(__dirname, "../testContents/alrighty.jpg");

function waitOnFile(filename) {
    return new Promise(function(resolve, reject) {
        waitOn(
            {
                resources: [ filename ],
                interval: 50,
                timeout: 500,
                window: 0
            }, function(err) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            }
        );
    });
}

describe("createWriteStream", function() {

    beforeEach(function() {
        this.client = createWebDAVClient(
            "http://localhost:9988/webdav/server",
            createWebDAVServer.test.username,
            createWebDAVServer.test.password
        );
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function() {
        return this.server.stop();
    });

    it("writes the file to the remote", function() {
        var targetFile = path.resolve(__dirname, "../testContents/alrighty2.jpg");
        var writeStream = this.client.createWriteStream("/alrighty2.jpg"),
            readStream = fs.createReadStream(SOURCE_FILENAME);
        expect(writeStream instanceof WritableStream).to.be.true;
        return new Promise(function(resolve, reject) {
            writeStream.on("end", function() {
                // stupid stream needs time to close probably..
                waitOnFile(targetFile)
                    .then(resolve, reject);
            });
            writeStream.on("error", reject);
            readStream.pipe(writeStream);
        });
    });

});
