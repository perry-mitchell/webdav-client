import path from "path";
import { fileURLToPath } from "url";
import fileExists from "exists-file";
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

const localFilePath = path.resolve(dirname, "../../testContents/text document.txt");
const localDirPath = path.resolve(dirname, "../../testContents/sub1");

describe("deleteFile", function () {
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

    it("deletes a remote file", async function () {
        expect(fileExists.sync(localFilePath)).to.be.true;
        await client.deleteFile("/text document.txt").then(() => {
            expect(fileExists.sync(localFilePath)).to.be.false;
        });
    });

    it("deletes a remote file", async function () {
        expect(fileExists.sync(localFilePath)).to.be.true;
        await client.deleteFile("/text document.txt").then(() => {
            expect(fileExists.sync(localFilePath)).to.be.false;
        });
    });

    it("deletes a remote directory", async function () {
        expect(directoryExists.sync(localDirPath)).to.be.true;
        await client.deleteFile("/sub1").then(() => {
            expect(directoryExists.sync(localDirPath)).to.be.false;
        });
    });

    it("allows specifying custom headers", async function () {
        await client.deleteFile("/text document.txt", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });
});
