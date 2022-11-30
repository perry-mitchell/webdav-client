import nock from "nock";
import { expect } from "chai";
import { AuthType } from "../../source/index.js";
import {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer
} from "../helpers.node.js";

const DUMMYSERVER = "https://dummy.webdav.server";

describe("auth", function () {
    afterEach(function () {
        nock.cleanAll();
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
                expect(this.req.headers.authorization).to.deep.equal(["Basic dXNlcjpwYXNz"]);
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
                expect(this.req.headers.authorization).to.deep.equal(["Bearer ABC123"]);
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

    describe("using Digest-enabled server", function () {
        beforeEach(function () {
            this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD,
                authType: AuthType.Digest
            });
            clean();
            this.server = createWebDAVServer("digest");
            return this.server.start();
        });

        afterEach(function () {
            return this.server.stop();
        });

        it("should connect using Digest authentication if digest enabled", function () {
            return this.client.exists("/alrighty.jpg").then(function (exists) {
                expect(exists).to.be.true;
            });
        });
    });
});
