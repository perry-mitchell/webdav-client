import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fileExists from "exists-file";
import directoryExists from "directory-exists";
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

const dirname = path.dirname(fileURLToPath(import.meta.url));

const TEST_CONTENTS = path.resolve(dirname, "../../testContents");

describe("copyFile", function () {
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

    it("copies files from one directory to another", function () {
        return client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./alrighty.jpg"))).toBeTruthy();
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/alrighty.jpg"))).toBeTruthy();
        });
    });

    it("copies directories from one directory to another", function () {
        return client.copyFile("/webdav", "/sub1/webdav").then(function () {
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./webdav"))).toBeTruthy();
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./sub1/webdav"))).toBeTruthy();
        });
    });

    it("copies files with special characters", function () {
        return client.copyFile("/sub1/ยากจน #1.txt", "/sub1/ยากจน #2.txt").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/ยากจน #2.txt"))).toBeTruthy();
        });
    });

    it("allows specifying custom headers", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions.headers["X-test"]).toEqual("test");
    });

    it("creates deep copy by default", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg");
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions.headers["Depth"]).toEqual("infinity");
    });

    it("creates deep copy if shallow copy is disabled", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", { shallow: false });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions.headers["Depth"]).toEqual("infinity");
    });

    it("creates shallow copy if enabled", async function () {
        await client.copyFile("/alrighty.jpg", "/sub1/alrighty.jpg", { shallow: true });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions.headers["Depth"]).toEqual("0");
    });
});
