import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LockResponse, WebDAVClient } from "../../../source/index.js";
import {
    RequestSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    useRequestSpy
} from "../../helpers.node.js";

const LOCK_TARGET = "/notes.txt";

describe("lock", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: RequestSpy, lock: LockResponse;

    beforeEach(async function () {
        const port = await nextPort();
        clean();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        server = createWebDAVServer(port);
        requestSpy = useRequestSpy();
        lock = null;
        await server.start();
    });

    afterEach(async function () {
        if (lock) {
            await client.unlock(LOCK_TARGET, lock.token);
        }
        await server.stop();
        restoreRequests();
        clean();
    });

    it("locks files and returns a token", async function () {
        lock = await client.lock(LOCK_TARGET);
        expect(lock)
            .to.have.property("token")
            .that.matches(/^[a-z0-9]+:.+/i);
    });

    it("supports unlocking", async function () {
        const lock = await client.lock(LOCK_TARGET);
        await client.unlock(LOCK_TARGET, lock.token);
    });

    it("fails unlocking if token invalid", async function () {
        lock = await client.lock(LOCK_TARGET);
        let err;
        try {
            await client.unlock(LOCK_TARGET, lock.token + "z");
        } catch (error) {
            err = error;
        }
        expect(err).to.match(/409 Conflict/i);
    });
});
