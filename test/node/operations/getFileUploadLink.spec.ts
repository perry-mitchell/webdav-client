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

const CONTENT_TYPE_SUFFIX = "?Content-Type=application/octet-stream";

describe("getFileUploadLink", function () {
    let clientPub: WebDAVClient, clientAuth: WebDAVClient, server: WebDAVServer;

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
        const link = clientAuth.getFileUploadLink("/test/file.txt");
        expect(link).to.equal(`https://user:pass@test.com/test/file.txt${CONTENT_TYPE_SUFFIX}`);
    });

    it("generates unauthenticated links", function () {
        const link = clientPub.getFileUploadLink("/test/file.txt");
        expect(link).to.equal(`http://test.com/test/file.txt${CONTENT_TYPE_SUFFIX}`);
    });

    it("throws for digest authentication", function () {
        const client = createWebDAVClient("https://test.com", {
            username: "user",
            password: "pass",
            authType: AuthType.Digest
        });
        expect(() => {
            client.getFileUploadLink("/test/file.txt");
        }).to.throw(/Unsupported auth type.+digest/i);
    });
});
