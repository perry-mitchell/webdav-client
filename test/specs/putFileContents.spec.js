var path = require("path"),
    fs = require("fs");

var bufferEquals = require("buffer-equals");

var SOURCE_BIN = path.resolve(__dirname, "../testContents/alrighty.jpg"),
    TARGET_BIN = path.resolve(__dirname, "../testContents/sub1/alrighty.jpg"),
    TARGET_TXT = path.resolve(__dirname, "../testContents/newFile.txt");

describe("getFileContents", function() {

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

    it("writes binary files", function() {
        var imgBin = fs.readFileSync(SOURCE_BIN);
        return this.client.putFileContents("/sub1/alrighty.jpg", imgBin)
            .then(function() {
                var written = fs.readFileSync(TARGET_BIN);
                expect(bufferEquals(written, imgBin)).to.be.true;
            });
    });

    it("writes text files", function() {
        var text = "this is\nsome text\ncontent\t...\n";
        return this.client.putFileContents("/newFile.txt", text)
            .then(function() {
                var written = fs.readFileSync(TARGET_TXT, "utf8");
                expect(written).to.equal(text);
            });
    });

});
