import path from "path";
import { fileURLToPath } from "url";
import fileExists from "exists-file";
import directoryExists from "directory-exists";
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

const TEST_CONTENTS = path.resolve(dirname, "../../testContents");

describe("moveFile", function () {
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

    it("moves files from one directory to another", function () {
        return client.moveFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.false;
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/alrighty.jpg"))).to.be.true;
        });
    });

    it("moves directories from one directory to another", function () {
        return client.moveFile("/webdav", "/sub1/webdav").then(function () {
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./webdav"))).to.be.false;
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./sub1/webdav"))).to.be.true;
        });
    });

    it("moves files from one name to another", function () {
        return client.moveFile("/alrighty.jpg", "/renamed.jpg").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.false;
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./renamed.jpg"))).to.be.true;
        });
    });

    it("overwrites on move by default", async function () {
        await client.moveFile("/two words/file.txt", "/with & in path/files.txt");
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("Overwrite", "T");
    });

    it("overwrites on move if explicitly enabled", async function () {
        await client.moveFile("/two words/file.txt", "/with & in path/files.txt", {
            overwrite: true
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("Overwrite", "T");
    });

    it("does not overwrite remote file if disabled", async function () {
        try {
            await client.moveFile("/two words/file.txt", "/with & in path/files.txt", {
                overwrite: false
            });
        } catch (e) {
            expect(e).to.have.property("status");
            expect(e.status).to.equal(412);
            return;
        } finally {
            const [, requestOptions] = requestSpy.mock.calls[0].arguments;
            expect(requestOptions).to.have.property("headers").that.has.property("Overwrite", "F");
        }

        // should not happen (reach this) but the webserver implementation is not following RFC
        // expect("Move file should not work!").to.be.true
    });
});
