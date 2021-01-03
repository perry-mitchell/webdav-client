describe("factory", function() {
    beforeEach(function() {
        this.client = window.WebDAV.createClient("http://localhost:9988/webdav/server", {
            username: webdavConfig.username,
            password: webdavConfig.password
        });
    });

    describe("createReadStream", function() {
        it("throws not-implemented error on web", function() {
            expect(() => {
                this.client.createReadStream("/file.txt");
            }).to.throw(/not implemented in web environment/);
        });
    });

    describe("createWriteStream", function() {
        it("throws not-implemented error on web", function() {
            expect(() => {
                this.client.createWriteStream("/file.txt");
            }).to.throw(/not implemented in web environment/);
        });
    });
});
