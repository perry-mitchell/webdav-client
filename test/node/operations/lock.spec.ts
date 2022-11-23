import { expect } from "chai";
import {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    sleep
} from "../../helpers.node.js";

describe("lock", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function () {
        return this.server.stop();
    });

    it("locks files and returns a token", async function () {
        const lock = await this.client.lock("/notes.txt");
        expect(lock)
            .to.have.property("token")
            .that.matches(/^[a-z0-9]+:.+/i);
    });

    it("supports unlocking", async function () {
        const lock = await this.client.lock("/notes.txt");
        await sleep(250);
        await this.client.unlock("/notes.txt", lock.token);
    });

    it("fails unlocking if token invalid", async function () {
        const lock = await this.client.lock("/notes.txt");
        await sleep(250);
        let err;
        try {
            await this.client.unlock("/notes.txt", lock.token + "z");
        } catch (error) {
            err = error;
        }
        expect(err).to.match(/409 Conflict/i);
    });
});
