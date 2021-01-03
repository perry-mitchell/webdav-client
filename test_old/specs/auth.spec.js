const nock = require("nock");
const Webdav = require("../../dist/node/factory");
const expect = require("chai").expect;
const DUMMYSERVER = "https://dummy.webdav.server";

describe("Authentication", function() {
    afterEach(function() {
        nock.cleanAll();
    });

    it("should connect unauthenticated if no credentials are passed", function() {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function() {
                expect(this.req.headers.authorization).to.be.undefined;
                return "";
            });
        const webdav = Webdav.createClient(DUMMYSERVER);
        return webdav.getFileContents("/file");
    });

    it("should connect using HTTP Basic if user and password are provided", function() {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function() {
                expect(this.req.headers.authorization).to.equal("Basic dXNlcjpwYXNz");
                return "";
            });
        const webdav = Webdav.createClient(DUMMYSERVER, {
            username: "user",
            password: "pass"
        });
        return webdav.getFileContents("/file");
    });

    it("should connect using a Bearer token if an object is provided", function() {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function() {
                expect(this.req.headers.authorization).to.deep.equal("Bearer ABC123");
                return "";
            });
        const webdav = Webdav.createClient(DUMMYSERVER, {
            token: {
                token_type: "Bearer",
                access_token: "ABC123"
            }
        });
        return webdav.getFileContents("/file");
    });

    describe("using Digest-enabled server", function() {
        beforeEach(function() {
            this.client = createWebDAVClient("http://localhost:9988/webdav/server", {
                username: createWebDAVServer.test.username,
                password: createWebDAVServer.test.password,
                digest: true
            });
            clean();
            this.server = createWebDAVServer("digest");
            return this.server.start();
        });

        afterEach(function() {
            return this.server.stop();
        });

        it("should connect using Digest authentication if digest enabled", function() {
            return this.client.getDirectoryContents("/").then(function(contents) {
                expect(contents).to.be.an("array");
                expect(contents[0]).to.be.an("object");
            });
        });
    });
});
