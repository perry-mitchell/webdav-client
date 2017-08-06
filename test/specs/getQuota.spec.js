var fs = require("fs"),
    path = require("path");

function useInvalidQuota() {
    returnFakeResponse(fs.readFileSync(path.resolve(__dirname, "../responses/quota-invalid.xml"), "utf8"));
}

function useValidQuota() {
    returnFakeResponse(fs.readFileSync(path.resolve(__dirname, "../responses/quota-valid.xml"), "utf8"));
}

describe("getQuota", function() {

    // beforeEach(function() {
    //     this.client = createWebDAVClient(
    //         "http://localhost:9988/webdav/server",
    //         createWebDAVServer.test.username,
    //         createWebDAVServer.test.password
    //     );
    //     clean();
    //     this.server = createWebDAVServer();
    //     return this.server.start();
    // });

    // afterEach(function() {
    //     return this.server.stop();
    // });

    // it("returns a quota object", function() {
    //     return this.client.getQuota().then(function(quotaInfo) {
    //         expect(contents).to.be.an.object;
    //         expect(contents).to.have.property("available", "unlimited");
    //         expect(contents).to.have.property("used", 0);
    //     });
    // });

    beforeEach(function() {
        // fake client, not actually used when mocking responses
        this.client = createWebDAVClient(
            "http://localhost:9988/webdav/server",
            createWebDAVServer.test.username,
            createWebDAVServer.test.password
        );
    });

    afterEach(function() {
        restoreFetch();
    });

    it("returns correct available amount", function() {
        useValidQuota();
        return this.client.getQuota().then(function(quotaInfo) {
            expect(quotaInfo).to.be.an.object;
            expect(quotaInfo).to.have.property("available", "unlimited");
        });
    });

    it("returns correct used amount", function() {
        useValidQuota();
        return this.client.getQuota().then(function(quotaInfo) {
            expect(quotaInfo).to.be.an.object;
            expect(quotaInfo).to.have.property("used", 6864755191);
        });
    });

    it("returns null for invalid quotas", function() {
        useInvalidQuota();
        return this.client.getQuota().then(function(quotaInfo) {
            expect(quotaInfo).to.be.null;
        });
    });

});
