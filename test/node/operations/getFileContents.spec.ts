import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bufferEquals from "buffer-equals";
import { expect } from "chai";
import {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    restoreRequests,
    useRequestSpy
} from "../../helpers.node.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_BIN = path.resolve(dirname, "../../testContents/alrighty.jpg");
const SOURCE_TXT = path.resolve(dirname, "../../testContents/text document.txt");

describe("getFileContents", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        this.requestSpy = useRequestSpy();
        return this.server.start();
    });

    afterEach(function () {
        restoreRequests();
        return this.server.stop();
    });

    it("reads a remote file into a buffer", async function () {
        const bufferRemote = await this.client.getFileContents("/alrighty.jpg");
        expect(bufferRemote).to.be.an.instanceof(Buffer);
        const bufferLocal = fs.readFileSync(SOURCE_BIN);
        expect(bufferEquals(bufferRemote, bufferLocal)).to.be.true;
    });

    it("supports returning detailed results (buffer)", async function () {
        const details = await this.client.getFileContents("/alrighty.jpg", { details: true });
        expect(details).to.have.property("data").that.is.an.instanceof(Buffer);
        expect(details).to.have.property("headers").that.is.an("object");
    });

    it("reads a remote file into a string", async function () {
        const stringRemote = await this.client.getFileContents("/text document.txt", {
            format: "text"
        });
        const stringLocal = fs.readFileSync(SOURCE_TXT, "utf8");
        expect(stringRemote).to.equal(stringLocal);
    });

    it("supports returning detailed results (string)", async function () {
        const details = await this.client.getFileContents("/text document.txt", {
            format: "text",
            details: true
        });
        expect(details).to.have.property("data").that.is.a("string");
        expect(details).to.have.property("headers").that.is.an("object");
    });

    it("allows specifying custom headers", async function () {
        await this.client.getFileContents("/text document.txt", {
            format: "text",
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    it("can retrieve JSON files as text (#267)", async function () {
        const contents = await this.client.getFileContents("/format.json", {
            format: "text"
        });
        expect(contents).to.be.a("string");
        expect(contents).to.contain(`{"test":true}`);
    });
});
