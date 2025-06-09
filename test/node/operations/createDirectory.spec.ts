import path from "node:path";
import { fileURLToPath } from "node:url";
import directoryExists from "directory-exists";
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

const dirname = path.dirname(fileURLToPath(import.meta.url));

describe("createDirectory", function () {
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

    it("creates directories", async function () {
        const newDir = path.resolve(dirname, "../../testContents/sub2");
        expect(directoryExists.sync(newDir)).to.be.false;
        await client.createDirectory("/sub2");
        expect(directoryExists.sync(newDir)).to.be.true;
    });

    it("allows specifying custom headers", async function () {
        await client.createDirectory("/sub2", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    it("adds the trailing slash to the directory name if missing", async function () {
        await client.createDirectory("/subdirectory-1122");
        const [url] = requestSpy.mock.calls[0].arguments;
        expect(url).to.satisfy((url: string) => url.endsWith("/"));
    });

    describe("with recursive option", function () {
        it("supports creating deep directories", async function () {
            const newDir = path.resolve(dirname, "../../testContents/a/b/c/d/e");
            expect(directoryExists.sync(newDir)).to.be.false;
            await client.createDirectory("/a/b/c/d/e", { recursive: true });
            expect(directoryExists.sync(newDir)).to.be.true;
        });

        it("supports creating deep directories which partially exist", async function () {
            const newDir = path.resolve(dirname, "../../testContents/sub1/a/b");
            expect(directoryExists.sync(newDir)).to.be.false;
            await client.createDirectory("/sub1/a/b", { recursive: true });
            expect(directoryExists.sync(newDir)).to.be.true;
        });

        it("has no effect when all paths exist", async function () {
            await client.createDirectory("/a/b/c", { recursive: true });
            await client.createDirectory("/a/b/c", { recursive: true });
            await client.createDirectory("/a", { recursive: true });
        });
    });
});
