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

describe("partialUpdateFileContents", function () {
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

    it("partial update should be failed with server support", async function () {
        let err: Error | null = null;
        try {
            // the server does not support partial update
            await this.client.partialUpdateFileContents("/patch.bin", 1, 3, "foo");
        } catch (error) {
            err = error;
        }
        expect(err).to.be.an.instanceof(Error);
        expect(fileExists.sync(path.join(TEST_CONTENTS, "./patch.bin"))).to.be.false;
    });
});
