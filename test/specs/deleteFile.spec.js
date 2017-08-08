"use strict";

const path = require("path");
const fileExists = require("exists-file").sync;
const directoryExists = require("directory-exists").sync;

const localFilePath = path.resolve(
    __dirname,
    "../testContents/text document.txt"
);
const localDirPath = path.resolve(__dirname, "../testContents/sub1");

describe("deleteFile", function() {
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

    it("deletes a remote file", function() {
        expect(fileExists(localFilePath)).to.be.true;
        return this.client.deleteFile("/text document.txt").then(() => {
            expect(fileExists(localFilePath)).to.be.false;
        });
    });

    it("deletes a remote file", function() {
        expect(fileExists(localFilePath)).to.be.true;
        return this.client.deleteFile("/text document.txt").then(() => {
            expect(fileExists(localFilePath)).to.be.false;
        });
    });

    it("deletes a remote directory", function() {
        expect(directoryExists(localDirPath)).to.be.true;
        return this.client.deleteFile("/sub1").then(() => {
            expect(directoryExists(localDirPath)).to.be.false;
        });
    });
});
