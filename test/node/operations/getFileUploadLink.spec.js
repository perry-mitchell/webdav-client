const { AuthType } = require("../../../dist/node/index.js");
const { createWebDAVClient } = require("../../helpers.node.js");

const CONTENT_TYPE_SUFFIX = "?Content-Type=application/octet-stream";

describe("getFileUploadLink", function() {
    beforeEach(function() {
        this.clientPub = createWebDAVClient("http://test.com");
        this.clientAuth = createWebDAVClient("https://test.com", {
            username: "user",
            password: "pass"
        });
    });

    it("generates authenticated links", function() {
        const link = this.clientAuth.getFileUploadLink("/test/file.txt");
        expect(link).to.equal(`https://user:pass@test.com/test/file.txt${CONTENT_TYPE_SUFFIX}`);
    });

    it("generates unauthenticated links", function() {
        const link = this.clientPub.getFileUploadLink("/test/file.txt");
        expect(link).to.equal(`http://test.com/test/file.txt${CONTENT_TYPE_SUFFIX}`);
    });

    it("throws for digest authentication", function() {
        this.client = createWebDAVClient("https://test.com", {
            username: "user",
            password: "pass",
            authType: AuthType.Digest
        });
        expect(() => {
            this.client.getFileUploadLink("/test/file.txt");
        }).to.throw(/Unsupported auth type.+digest/i);
    });
});
