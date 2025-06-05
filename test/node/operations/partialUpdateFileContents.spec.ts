import path from "path";
import { fileURLToPath } from "url";
import fileExists from "exists-file";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WebDAVClient } from "../../../source/index.js";
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

const dirname = path.dirname(fileURLToPath(import.meta.url));

const TEST_CONTENTS = path.resolve(dirname, "../../testContents");

describe("partialUpdateFileContents", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: RequestSpy;

    beforeEach(async function () {
        const port = await nextPort();
        clean();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        server = createWebDAVServer(port);
        requestSpy = useRequestSpy();
        await server.start();
    });

    afterEach(async function () {
        await server.stop();
        restoreRequests();
        clean();
    });

    it("partial update should be failed with server support", async function () {
        let err: Error | null = null;
        try {
            // the server does not support partial update
            await client.partialUpdateFileContents("/patch.bin", 1, 3, "foo");
        } catch (error) {
            err = error;
        }
        expect(err).to.be.an.instanceof(Error);
        expect(fileExists.sync(path.join(TEST_CONTENTS, "./patch.bin"))).to.be.false;
    });
});
