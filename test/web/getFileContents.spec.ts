import { beforeEach, describe, expect, it } from "vitest";
import { createClient } from "../../dist/web/index.js";
import { WebDAVClient } from "../../source/types.js";
import { PASSWORD, WEB_PORT, USERNAME } from "../server/credentials.js";

describe("getDirectoryContents", function () {
    let client: WebDAVClient;

    function arrayBufferToString(buf: Buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    beforeEach(async function () {
        client = createClient(`http://localhost:${WEB_PORT}/webdav/server`, {
            username: USERNAME,
            password: PASSWORD
        });
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
