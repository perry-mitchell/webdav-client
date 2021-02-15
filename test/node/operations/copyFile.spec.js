const path = require("path");
const fileExists = require("exists-file").sync;
const directoryExists = require("directory-exists").sync;
const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    restoreRequests,
    useRequestSpy
} = require("../../helpers.node.js");

const TEST_CONTENTS = path.resolve(__dirname, "../../testContents");

describe("copyFile", function() {
    beforeEach(function() {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        this.requestSpy = useRequestSpy();
        return this.server.start();
    });

    afterEach(function() {
        restoreRequests();
        return this.server.stop();
    });

    it("copies files from one directory to another", function() {
        return this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function() {
            expect(fileExists(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.true;
            expect(fileExists(path.join(TEST_CONTENTS, "./sub1/alrighty.jpg"))).to.be.true;
        });
    });

    it("copies directories from one directory to another", function() {
        return this.client.copyFile("/webdav", "/sub1/webdav").then(function() {
            expect(directoryExists(path.join(TEST_CONTENTS, "./webdav"))).to.be.true;
            expect(directoryExists(path.join(TEST_CONTENTS, "./sub1/webdav"))).to.be.true;
        });
    });

    it("copies files with special characters", function() {
        return this.client.copyFile("/sub1/ยากจน #1.txt", "/sub1/ยากจน #2.txt").then(function() {
            expect(fileExists(path.join(TEST_CONTENTS, "./sub1/ยากจน #2.txt"))).to.be.true;
        });
    });

    it("allows specifying custom headers", async function() {
        await this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", {
            headers: {
                "X-test": "test"
            }
        });
        const [requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions)
            .to.have.property("headers")
            .that.has.property("X-test", "test");
    });
});
