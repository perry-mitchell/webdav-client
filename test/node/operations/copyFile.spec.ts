import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert";
import fileExists from "exists-file";
import directoryExists from "directory-exists";
import {
    RequestSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    useRequestSpy
} from "../../helpers.node.js";
import { WebDAVClient } from "../../../source/types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const TEST_CONTENTS = path.resolve(dirname, "../../testContents");

test.describe("copyFile", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: RequestSpy;

    test.beforeEach(async function (t) {
        const port = await nextPort();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        server = createWebDAVServer(port);
        requestSpy = useRequestSpy();
        await server.start();
    });

    test.afterEach(async function () {
        restoreRequests();
        await server.stop();
    });

    test("copies files from one directory to another", function () {
        return client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function () {
            assert.ok(fileExists.sync(path.join(TEST_CONTENTS, "./alrighty.jpg")));
            assert.ok(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/alrighty.jpg")));
        });
    });

    test("copies directories from one directory to another", function () {
        return client.copyFile("/webdav", "/sub1/webdav").then(function () {
            assert.ok(directoryExists.sync(path.join(TEST_CONTENTS, "./webdav")));
            assert.ok(directoryExists.sync(path.join(TEST_CONTENTS, "./sub1/webdav")));
        });
    });

    test("copies files with special characters", function () {
        return client.copyFile("/sub1/ยากจน #1.txt", "/sub1/ยากจน #2.txt").then(function () {
            assert.ok(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/ยากจน #2.txt")));
        });
    });

    test("allows specifying custom headers", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        assert.equal(requestOptions.headers["X-test"], "test");
    });

    test("creates deep copy by default", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg");
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        assert.equal(requestOptions.headers["Depth"], "infinity");
    });

    test("creates deep copy if shallow copy is disabled", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", { shallow: false });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        assert.equal(requestOptions.headers["Depth"], "infinity");
    });

    test("creates shallow copy if enabled", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", { shallow: true });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        assert.equal(requestOptions.headers["Depth"], "0");
    });
});
