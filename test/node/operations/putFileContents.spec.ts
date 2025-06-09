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
const TARGET_BIN = path.resolve(dirname, "../../testContents/sub1/alrighty.jpg");
const TARGET_TXT = path.resolve(dirname, "../../testContents/newFile.txt");
const TARGET_TXT_CHARS = path.resolve(dirname, "../../testContents/จะทำลาย.txt");

describe("putFileContents", function () {
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

    it("writes binary files", function () {
        const imgBin = fs.readFileSync(SOURCE_BIN);
        return client.putFileContents("/sub1/alrighty.jpg", imgBin).then(function () {
            const written = fs.readFileSync(TARGET_BIN);
            expect(bufferEquals(written, imgBin)).to.be.true;
        });
    });

    it("writes text files", function () {
        const text = "this is\nsome text\ncontent\t...\n";
        return client.putFileContents("/newFile.txt", text).then(function () {
            const written = fs.readFileSync(TARGET_TXT, "utf8");
            expect(written).to.equal(text);
        });
    });

    it("writes streams", async function () {
        const readStream = fs.createReadStream(SOURCE_BIN);
        await client.putFileContents("/sub1/alrighty.jpg", readStream);
        // Check result
        const source = fs.readFileSync(SOURCE_BIN);
        const written = fs.readFileSync(TARGET_BIN);
        expect(bufferEquals(written, source)).to.be.true;
    });

    it("writes files with non-latin characters in the filename", function () {
        const text = "this is\nsome text\ncontent\t...\n";
        return client.putFileContents("/จะทำลาย.txt", text).then(function () {
            const written = fs.readFileSync(TARGET_TXT_CHARS, "utf8");
            expect(written).to.equal(text);
        });
    });
});
