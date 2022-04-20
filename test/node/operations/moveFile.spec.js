const path = require("path");
const fileExists = require("exists-file").sync;
const directoryExists = require("directory-exists").sync;
const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer
} = require("../../helpers.node.js");

const TEST_CONTENTS = path.resolve(__dirname, "../../testContents");

describe("moveFile", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function () {
        return this.server.stop();
    });

    it("moves files from one directory to another", function () {
        return this.client.moveFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function () {
            expect(fileExists(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.false;
            expect(fileExists(path.join(TEST_CONTENTS, "./sub1/alrighty.jpg"))).to.be.true;
        });
    });

    it("moves directories from one directory to another", function () {
        return this.client.moveFile("/webdav", "/sub1/webdav").then(function () {
            expect(directoryExists(path.join(TEST_CONTENTS, "./webdav"))).to.be.false;
            expect(directoryExists(path.join(TEST_CONTENTS, "./sub1/webdav"))).to.be.true;
        });
    });

    it("moves files from one name to another", function () {
        return this.client.moveFile("/alrighty.jpg", "/renamed.jpg").then(function () {
            expect(fileExists(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.false;
            expect(fileExists(path.join(TEST_CONTENTS, "./renamed.jpg"))).to.be.true;
        });
    });
});
