import path from "path";
import { fileURLToPath } from "url";
import fileExists from "exists-file";
import directoryExists from "directory-exists";
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

const localFilePath = path.resolve(dirname, "../../testContents/text document.txt");
const localDirPath = path.resolve(dirname, "../../testContents/sub1");

describe("deleteFile", function () {
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

    it("deletes a remote file", function () {
        expect(fileExists.sync(localFilePath)).to.be.true;
        return this.client.deleteFile("/text document.txt").then(() => {
            expect(fileExists.sync(localFilePath)).to.be.false;
        });
    });

    it("deletes a remote file", function () {
        expect(fileExists.sync(localFilePath)).to.be.true;
        return this.client.deleteFile("/text document.txt").then(() => {
            expect(fileExists.sync(localFilePath)).to.be.false;
        });
    });

    it("deletes a remote directory", function () {
        expect(directoryExists.sync(localDirPath)).to.be.true;
        return this.client.deleteFile("/sub1").then(() => {
            expect(directoryExists.sync(localDirPath)).to.be.false;
        });
    });

    it("allows specifying custom headers", async function () {
        await this.client.deleteFile("/text document.txt", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });
});
