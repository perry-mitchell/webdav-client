import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bufferEquals from "buffer-equals";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WebDAVClient } from "../../../source/index.js";
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

const dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_BIN = path.resolve(dirname, "../../testContents/alrighty.jpg");
const SOURCE_TXT = path.resolve(dirname, "../../testContents/text document.txt");

describe("getFileContents", function () {
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

    afterEach(async function () {
        await server.stop();
        restoreRequests();
        clean();
    });

    it("reads a remote file into a buffer", async function () {
        const bufferRemote = await client.getFileContents("/alrighty.jpg");
        expect(bufferRemote).to.be.an.instanceof(Buffer);
        const bufferLocal = fs.readFileSync(SOURCE_BIN);
        expect(bufferEquals(bufferRemote, bufferLocal)).to.be.true;
    });

    it("supports returning detailed results (buffer)", async function () {
        const details = await client.getFileContents("/alrighty.jpg", { details: true });
        expect(details).to.have.property("data").that.is.an.instanceof(Buffer);
        expect(details).to.have.property("headers").that.is.an("object");
    });

    it("reads a remote file into a string", async function () {
        const stringRemote = await client.getFileContents("/text document.txt", {
            format: "text"
        });
        const stringLocal = fs.readFileSync(SOURCE_TXT, "utf8");
        expect(stringRemote).to.equal(stringLocal);
    });

    it("supports returning detailed results (string)", async function () {
        const details = await client.getFileContents("/text document.txt", {
            format: "text",
            details: true
        });
        expect(details).to.have.property("data").that.is.a("string");
        expect(details).to.have.property("headers").that.is.an("object");
    });

    it("allows specifying custom headers", async function () {
        await client.getFileContents("/text document.txt", {
            format: "text",
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    it("can retrieve JSON files as text (#267)", async function () {
        const contents = await client.getFileContents("/format.json", {
            format: "text"
        });
        expect(contents).to.be.a("string");
        expect(contents).to.contain(`{"test":true}`);
    });
});
