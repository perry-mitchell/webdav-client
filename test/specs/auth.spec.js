const nock = require("nock");
const Webdav = require("../../dist/factory");
const expect = require("chai").expect;
const DUMMYSERVER = "https://dummy.webdav.server";

describe("Authentication", function() {
    afterEach(function() {
        nock.cleanAll();
    });
    it("should go unauthenticated if no credentials are passed", function() {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function() {
                expect(this.req.headers.authorization).to.be.undefined;
                return "";
            });
        const webdav = Webdav.createClient(DUMMYSERVER);
        return webdav.getFileContents("/file");
    });

    it("should use HTTP Basic if user and password are provided", function() {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function() {
                expect(this.req.headers.authorization).to.deep.equal(["Basic dXNlcjpwYXNz"]);
                return "";
            });
        const webdav = Webdav.createClient(DUMMYSERVER, "user", "pass");
        return webdav.getFileContents("/file");
    });

    it("should use Bearer if an object is provided", function() {
        nock(DUMMYSERVER)
            .get("/file")
            .reply(200, function() {
                expect(this.req.headers.authorization).to.deep.equal(["Bearer ABC123"]);
                return "";
            });
        const webdav = Webdav.createClient(DUMMYSERVER, { token_type: "Bearer", access_token: "ABC123" });
        return webdav.getFileContents("/file");
    });
});
