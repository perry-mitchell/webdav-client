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

const TEST_CONTENTS = path.resolve(dirname, "../../testContents");

describe("moveFile", function () {
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

    it("moves files from one directory to another", function () {
        return this.client.moveFile("/alrighty.jpg", "/sub1/alrighty.jpg").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.false;
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./sub1/alrighty.jpg"))).to.be.true;
        });
    });

    it("moves directories from one directory to another", function () {
        return this.client.moveFile("/webdav", "/sub1/webdav").then(function () {
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./webdav"))).to.be.false;
            expect(directoryExists.sync(path.join(TEST_CONTENTS, "./sub1/webdav"))).to.be.true;
        });
    });

    it("moves files from one name to another", function () {
        return this.client.moveFile("/alrighty.jpg", "/renamed.jpg").then(function () {
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./alrighty.jpg"))).to.be.false;
            expect(fileExists.sync(path.join(TEST_CONTENTS, "./renamed.jpg"))).to.be.true;
        });
    });

    it("Overwrite on move by default", async function () {
        await this.client.moveFile("/two words/file.txt", "/with & in path/files.txt");
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("Overwrite", "T");
    });

    it("Overwrite on move if explicitly enabled", async function () {
        await this.client.moveFile("/two words/file.txt", "/with & in path/files.txt", {
            overwrite: true
        });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("Overwrite", "T");
    });

    it("Do not overwrite if disabled", async function () {
        try {
            await this.client.moveFile("/two words/file.txt", "/with & in path/files.txt", {
                overwrite: false
            });
        } catch (e) {
            expect(e).to.have.property("status");
            expect(e.status).to.equal(412);
            return;
        } finally {
            const [, requestOptions] = this.requestSpy.firstCall.args;
            expect(requestOptions).to.have.property("headers").that.has.property("Overwrite", "F");
        }

        // should not happen (reach this) but the webserver implementation is not following RFC
        // expect("Move file should not work!").to.be.true
    });
});
