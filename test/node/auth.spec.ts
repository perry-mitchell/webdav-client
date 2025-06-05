import nock from "nock";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthType, WebDAVClient } from "../../source/index.js";
import {
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort
} from "../helpers.node.js";

const DUMMYSERVER = "https://dummy.webdav.server";

describe("auth", function () {
    afterEach(async function () {
        clean();
    });

    it("should connect unauthenticated if no credentials are passed", function () {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function () {
                expect(this.req.headers.authorization).to.be.undefined;
                return "";
            });
        const webdav = createWebDAVClient(DUMMYSERVER);
        return webdav.getFileContents("/file");
    });

    it("should connect using HTTP Basic if user and password are provided", function () {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function () {
                expect(this.req.headers.authorization).to.equal("Basic dXNlcjpwYXNz");
                return "";
            });
        const webdav = createWebDAVClient(DUMMYSERVER, {
            username: "user",
            password: "pass"
        });
        return webdav.getFileContents("/file");
    });

    it("should connect using a Bearer token if an object is provided", function () {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function () {
                expect(this.req.headers.authorization).to.equal("Bearer ABC123");
                return "";
            });
        const webdav = createWebDAVClient(DUMMYSERVER, {
            authType: AuthType.Token,
            token: {
                token_type: "Bearer",
                access_token: "ABC123"
            }
        });
        return webdav.getFileContents("/file");
    });

    it("should support auto-detection of password/digest auth", function () {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function () {
                expect(this.req.headers.authorization).to.equal("Basic dXNlcjpwYXNz");
                return "";
            });
        const webdav = createWebDAVClient(DUMMYSERVER, {
            authType: AuthType.Auto,
            username: "user",
            password: "pass"
        });
        return webdav.getFileContents("/file");
    });

    describe("using Digest-enabled server", function () {
        let client: WebDAVClient, server: WebDAVServer, port: number;

        beforeEach(async function () {
            port = await nextPort();
            client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD,
                authType: AuthType.Digest
            });
            clean();
            server = createWebDAVServer(port, "digest");
            await server.start();
        });

        afterEach(async function () {
            await server.stop();
        });

        it("should connect using Digest authentication if digest enabled", function () {
            return client.exists("/alrighty.jpg").then(function (exists) {
                expect(exists).to.be.true;
            });
        });

        it("should support auto-detection of password/digest auth", async function () {
            client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD,
                authType: AuthType.Auto
            });
            return client.exists("/alrighty.jpg").then(function (exists) {
                expect(exists).to.be.true;
            });
        });
    });
});
