import path from "path";
import { fileURLToPath } from "url";
import fileExists from "exists-file";
import directoryExists from "directory-exists";
import { expect } from "chai";
import {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    restoreRequests,
    useRequestSpy
} from "../../helpers.node.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const TEST_CONTENTS = path.resolve(dirname, "../../testContents");

describe("copyFile", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        this.requestSpy = useRequestSpy();
        return this.server.start();
    });

    afterEach(function () {
        restoreRequests();
        return this.server.stop();
    });

    it("copies files from one directory to another", function () {
        return this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.true;
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/alrighty.jpg"))).to.be.true;
        });
    });

    it("copies directories from one directory to another", function () {
        return this.client.copyFile("/webdav", "/sub1/webdav").then(function () {
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./webdav"))).to.be.true;
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./sub1/webdav"))).to.be.true;
        });
    });

    it("copies files with special characters", function () {
        return this.client.copyFile("/sub1/ยากจน #1.txt", "/sub1/ยากจน #2.txt").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/ยากจน #2.txt"))).to.be.true;
        });
    });

    it("allows specifying custom headers", async function () {
        await this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    it("creates deep copy by default", async function () {
        await this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg");
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("Depth", "infinity");
    });

    it("creates deep copy if shallow copy is disabled", async function () {
        await this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", { shallow: false });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("Depth", "infinity");
    });

    it("creates shallow copy if enabled", async function () {
        await this.client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", { shallow: true });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("Depth", "0");
    });
});
