const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer
} = require("../helpers.node.js");

describe("getDirectoryContents", function() {
    beforeEach(async function() {
        clean();
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        this.server = createWebDAVServer();
        await this.server.start();
    });

    afterEach(async function() {
        await this.server.stop();
        clean();
    });

    it("returns an array of items", function() {
        return this.client.getDirectoryContents("/").then(function(contents) {
            expect(contents).to.be.an("array");
            expect(contents[0]).to.be.an("object");
        });
    });
});
