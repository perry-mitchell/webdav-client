const path = require("path");
const directoryExists = require("directory-exists").sync;

describe("createDirectory", function() {
    beforeEach(function() {
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

    it("creates directories", function() {
        const newDir = path.resolve(__dirname, "../testContents/sub2");
        expect(directoryExists(newDir)).to.be.false;
        return this.client.createDirectory("/sub2").then(function() {
            expect(directoryExists(newDir)).to.be.true;
        });
    });
});
