import { expect } from "chai";
import {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer
} from "../../helpers.node.js";

const LOCK_TARGET = "/notes.txt";

describe("lock", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        this.lock = null;
        return this.server.start();
    });

    afterEach(async function () {
        if (this.lock) {
            await this.client.unlock(LOCK_TARGET, this.lock.token);
        }
        return this.server.stop();
    });

    it("locks files and returns a token", async function () {
        this.lock = await this.client.lock(LOCK_TARGET);
        expect(this.lock)
            .to.have.property("token")
            .that.matches(/^[a-z0-9]+:.+/i);
    });

    it("supports unlocking", async function () {
        const lock = await this.client.lock(LOCK_TARGET);
        await this.client.unlock(LOCK_TARGET, lock.token);
    });

    it("fails unlocking if token invalid", async function () {
        this.lock = await this.client.lock(LOCK_TARGET);
        let err;
        try {
            await this.client.unlock(LOCK_TARGET, this.lock.token + "z");
        } catch (error) {
            err = error;
        }
        expect(err).to.match(/409 Conflict/i);
    });
});
