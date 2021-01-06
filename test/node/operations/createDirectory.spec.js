const path = require("path");
const directoryExists = require("directory-exists").sync;
const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer
} = require("../../helpers.node.js");

describe("createDirectory", function() {
    beforeEach(function() {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function() {
        return this.server.stop();
    });

    it("creates directories", async function() {
        const newDir = path.resolve(__dirname, "../../testContents/sub2");
        expect(directoryExists(newDir)).to.be.false;
        await this.client.createDirectory("/sub2");
        expect(directoryExists(newDir)).to.be.true;
    });
});
