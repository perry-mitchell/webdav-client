const fs = require("fs");
const path = require("path");
const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    createWebDAVClient,
    restoreRequests,
    returnFakeResponse
} = require("../../helpers.node.js");

function useInvalidQuota() {
    returnFakeResponse(
        fs.readFileSync(path.resolve(__dirname, "../../responses/quota-invalid.xml"), "utf8")
    );
}

function useValidQuota() {
    returnFakeResponse(
        fs.readFileSync(path.resolve(__dirname, "../../responses/quota-valid.xml"), "utf8")
    );
}

describe("getQuota", function () {
    beforeEach(function () {
        // fake client, not actually used when mocking responses
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
    });

    afterEach(function () {
        restoreRequests();
    });

    it("returns correct available amount", function () {
        useValidQuota();
        return this.client.getQuota().then(function (quotaInfo) {
            expect(quotaInfo).to.be.an("object");
            expect(quotaInfo).to.have.property("available", "unlimited");
        });
    });

    it("returns correct used amount", function () {
        useValidQuota();
        return this.client.getQuota().then(function (quotaInfo) {
            expect(quotaInfo).to.be.an("object");
            expect(quotaInfo).to.have.property("used", 6864755191);
        });
    });

    it("returns null for invalid quotas", function () {
        useInvalidQuota();
        return this.client.getQuota().then(function (quotaInfo) {
            expect(quotaInfo).to.be.null;
        });
    });

    it("supports returning detailed results", function () {
        useValidQuota();
        return this.client.getQuota({ details: true }).then(function (details) {
            expect(details).to.have.property("data").that.is.an("object");
            expect(details).to.have.property("headers").that.is.an("object");
        });
    });
});
