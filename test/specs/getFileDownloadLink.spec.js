describe("getFileDownloadLink", function() {
    beforeEach(function() {
        this.clientPub = createWebDAVClient("http://test.com");
        this.clientAuth = createWebDAVClient("https://test.com", "user", "pass");
    });

    it("generates authenticated links", function() {
        const link = this.clientAuth.getFileDownloadLink("/test/file.txt");
        expect(link).to.equal("https://user:pass@test.com/test/file.txt");
    });

    it("generates unauthenticated links", function() {
        const link = this.clientPub.getFileDownloadLink("/test/file.txt");
        expect(link).to.equal("http://test.com/test/file.txt");
    });
});
