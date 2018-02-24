const path = require("path");
const fs = require("fs");

const bufferEquals = require("buffer-equals");

const SOURCE_BIN = path.resolve(__dirname, "../testContents/alrighty.jpg");
const TARGET_BIN = path.resolve(__dirname, "../testContents/sub1/alrighty.jpg");
const TARGET_TXT = path.resolve(__dirname, "../testContents/newFile.txt");
const TARGET_TXT_CHARS = path.resolve(__dirname, "../testContents/จะทำลาย.txt");

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
        const imgBin = fs.readFileSync(SOURCE_BIN);
        return this.client.putFileContents("/sub1/alrighty.jpg", imgBin).then(function() {
            const written = fs.readFileSync(TARGET_BIN);
            expect(bufferEquals(written, imgBin)).to.be.true;
        });
    });

    it("writes text files", function() {
        const text = "this is\nsome text\ncontent\t...\n";
        return this.client.putFileContents("/newFile.txt", text).then(function() {
            const written = fs.readFileSync(TARGET_TXT, "utf8");
            expect(written).to.equal(text);
        });
    });

    it("writes files with non-latin characters in the filename", function() {
        const text = "this is\nsome text\ncontent\t...\n";
        return this.client.putFileContents("/จะทำลาย.txt", text).then(function() {
            const written = fs.readFileSync(TARGET_TXT_CHARS, "utf8");
            expect(written).to.equal(text);
        });
    });
});
