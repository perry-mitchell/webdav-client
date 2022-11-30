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

describe("exists", function () {
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

    it("correctly detects existing files", function () {
        return this.client.exists("/two%20words/file2.txt").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly detects existing directories", function () {
        return this.client.exists("/webdav/server").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly responds for non-existing paths", function () {
        return this.client.exists("/webdav/this/is/not/here.txt").then(doesExist => {
            expect(doesExist).to.be.false;
        });
    });

    it("allows specifying custom headers", async function () {
        await this.client.exists("/test.txt", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });
});
