var path = require("path"),
    fileExists = require("exists-file").sync,
    directoryExists = require("directory-exists").sync;

describe("moveFile", function() {

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

    it("moves files from one directory to another", function() {
        return this.client.moveFile("/alrighty.jpg", "/sub1/alrighty.jpg")
            .then(function() {
                expect(fileExists(
                    path.resolve(__dirname, "../testContents/alrighty.jpg")
                )).to.be.false;
                expect(fileExists(
                    path.resolve(__dirname, "../testContents/sub1/alrighty.jpg")
                )).to.be.true;
            });
    });

    it("moves directories from one directory to another", function() {
        return this.client.moveFile("/webdav", "/sub1/webdav")
            .then(function() {
                expect(directoryExists(
                    path.resolve(__dirname, "../testContents/webdav")
                )).to.be.false;
                expect(directoryExists(
                    path.resolve(__dirname, "../testContents/sub1/webdav")
                )).to.be.true;
            });
    });

    it("moves files from one name to another", function() {
        return this.client.moveFile("/alrighty.jpg", "/renamed.jpg")
            .then(function() {
                expect(fileExists(
                    path.resolve(__dirname, "../testContents/alrighty.jpg")
                )).to.be.false;
                expect(fileExists(
                    path.resolve(__dirname, "../testContents/renamed.jpg")
                )).to.be.true;
            });
    });

});
