const path = require("path");
const fs = require("fs");
const bufferEquals = require("buffer-equals");
const getPatcher = require("../../dist/node/index.js").getPatcher;

const SOURCE_BIN = path.resolve(__dirname, "../testContents/alrighty.jpg");
const SOURCE_TXT = path.resolve(__dirname, "../testContents/text document.txt");

describe("getFileContents", function() {
    beforeEach(function() {
        getPatcher().restore("request"); // use default
        this.client = createWebDAVClient("http://localhost:9988/webdav/server", {
            username: createWebDAVServer.test.username,
            password: createWebDAVServer.test.password
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function() {
        return this.server.stop();
    });

    it("reads a remote file into a buffer", function() {
        return this.client.getFileContents("/alrighty.jpg").then(bufferRemote => {
            expect(bufferRemote).to.be.an.instanceof(Buffer);
            const bufferLocal = fs.readFileSync(SOURCE_BIN);
            expect(bufferEquals(bufferRemote, bufferLocal)).to.be.true;
        });
    });

    it("supports returning detailed results (buffer)", function() {
        return this.client.getFileContents("/alrighty.jpg", { details: true }).then(details => {
            expect(details)
                .to.have.property("data")
                .that.is.an.instanceof(Buffer);
            expect(details)
                .to.have.property("headers")
                .that.is.an("object");
        });
    });

    it("reads a remote file into a string", function() {
        return this.client.getFileContents("/text document.txt", { format: "text" }).then(stringRemote => {
            const stringLocal = fs.readFileSync(SOURCE_TXT, "utf8");
            expect(stringRemote).to.equal(stringLocal);
        });
    });

    it("supports returning detailed results (string)", function() {
        return this.client.getFileContents("/text document.txt", { format: "text", details: true }).then(details => {
            expect(details)
                .to.have.property("data")
                .that.is.a("string");
            expect(details)
                .to.have.property("headers")
                .that.is.an("object");
        });
    });
});
