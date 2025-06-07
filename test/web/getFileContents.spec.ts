import { beforeEach, describe, expect, it } from "vitest";
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
import { WebDAVClient } from "../../source/types.js";

describe("getDirectoryContents", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: FetchSpy;

    function arrayBufferToString(buf: Buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

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

    it("reads a remote text file into a buffer", async function () {
        const bufferRemote = (await client.getFileContents("/text document.txt")) as Buffer;
        expect(bufferRemote).to.be.an.instanceof(ArrayBuffer);
        expect(arrayBufferToString(bufferRemote)).to.contain("This is my cool file.");
    });

    it("reads a remote binary file into a buffer", async function () {
        const bufferRemote = (await client.getFileContents("/alrighty.jpg")) as Buffer;
        expect(bufferRemote).to.be.an.instanceof(ArrayBuffer);
        expect(bufferRemote.byteLength).to.equal(52130);
    });

    it("reads a remote file into a string", async function () {
        const stringRemote = await client.getFileContents("/text document.txt", { format: "text" });
        expect(stringRemote).to.contain("This is my cool file.");
    });

    it("supports returning detailed results (string)", async function () {
        const details = await client.getFileContents("/text document.txt", {
            format: "text",
            details: true
        });
        expect(details).to.have.property("data").that.is.a("string");
        expect(details).to.have.property("headers").that.is.an("object");
    });

    it("can retrieve JSON files as text (#267)", async function () {
        const contents = await client.getFileContents("/format.json", { format: "text" });
        expect(contents).to.be.a("string");
        expect(contents).to.contain(`{"test":true}`);
    });
});
