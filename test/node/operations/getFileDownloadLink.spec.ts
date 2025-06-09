import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthType, WebDAVClient } from "../../../source/index.js";
import {
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    WebDAVServer
} from "../../helpers.node.js";

describe("getFileDownloadLink", function () {
    let clientAuth: WebDAVClient, clientPub: WebDAVClient, server: WebDAVServer;

    beforeEach(async function () {
        const port = await nextPort();
        clean();
        clientPub = createWebDAVClient("http://test.com");
        clientAuth = createWebDAVClient("https://test.com", {
            username: "user",
            password: "pass"
        });
        server = createWebDAVServer(port);
        await server.start();
    });

    afterEach(async function () {
        await server.stop();
        restoreRequests();
        clean();
    });

    it("generates authenticated links", function () {
        const link = clientAuth.getFileDownloadLink("/test/file.txt");
        expect(link).to.equal("https://user:pass@test.com/test/file.txt");
    });

    it("generates unauthenticated links", function () {
        const link = clientPub.getFileDownloadLink("/test/file.txt");
        expect(link).to.equal("http://test.com/test/file.txt");
    });

    it("throws for digest authentication", function () {
        const client = createWebDAVClient("https://test.com", {
            username: "user",
            password: "pass",
            authType: AuthType.Digest
        });
        expect(() => {
            client.getFileDownloadLink("/test/file.txt");
        }).to.throw(/Unsupported auth type.+digest/i);
    });
});
