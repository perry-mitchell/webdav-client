import { beforeEach, describe, expect, it } from "vitest";
import { WebDAVClient } from "../../source/types.js";
import {
    clean,
    createWebDAVClient,
    createWebDAVServer,
    FetchSpy,
    nextPort,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    useFetchSpy,
    WebDAVServer
} from "../helpers.node.js";

describe("exists", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: FetchSpy;

    beforeEach(async function () {
        const port = await nextPort();
        clean();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        server = createWebDAVServer(port);
        requestSpy = useFetchSpy();
        await server.start();
    });

    it("correctly detects existing files", async function () {
        const doesExist = await client.exists("/two%20words/file2.txt");
        expect(doesExist).to.be.true;
    });

    it("correctly detects existing directories", async function () {
        const doesExist = await client.exists("/webdav/server");
        expect(doesExist).to.be.true;
    });

    it("correctly responds for non-existing paths", async function () {
        const doesExist = await client.exists("/webdav/this/is/not/here.txt");
        expect(doesExist).to.be.false;
    });
});
