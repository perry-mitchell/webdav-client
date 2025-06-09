import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    FetchSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    useFetchSpy
} from "../../helpers.node.js";
import { WebDAVClient } from "../../../source/types.js";

describe("exists", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: FetchSpy;

    beforeEach(async function () {
        const port = await nextPort();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        server = createWebDAVServer(port);
        requestSpy = useFetchSpy();
        await server.start();
    });

    afterEach(async function () {
        restoreRequests();
        await server.stop();
    });

    it("correctly detects existing files", async function () {
        await client.exists("/two%20words/file2.txt").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly detects existing directories", async function () {
        await client.exists("/webdav/server").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly responds for non-existing paths", async function () {
        await client.exists("/webdav/this/is/not/here.txt").then(doesExist => {
            expect(doesExist).to.be.false;
        });
    });

    it("allows specifying custom headers", async function () {
        await client.exists("/test.txt", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });
});
