describe("stat", function() {

    beforeEach(function() {
        this.client = createWebDAVClient(
            "http://localhost:9988/webdav/server",
            createWebDAVServer.test.username,
            createWebDAVServer.test.password
        );
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function() {
        return this.server.stop();
    });

    it("correctly stats files", function() {
        return this.client.stat("/alrighty.jpg")
            .then(function(stat) {
                expect(stat).to.be.an.object;
                expect(stat).to.have.property("filename", "/alrighty.jpg");
                expect(stat).to.have.property("basename", "alrighty.jpg");
                expect(stat).to.have.property("lastmod").that.is.a.string;
                expect(stat).to.have.property("type", "file");
                expect(stat).to.have.property("size", 52130);
                expect(stat).to.have.property("mime", "image/jpeg");
            });
    });

    it("correctly stats directories", function() {
        return this.client.stat("/webdav/server")
            .then(function(stat) {
                expect(stat).to.be.an.object;
                expect(stat).to.have.property("filename", "/webdav/server");
                expect(stat).to.have.property("basename", "server");
                expect(stat).to.have.property("lastmod").that.is.a.string;
                expect(stat).to.have.property("type", "directory");
                expect(stat).to.have.property("size", 0);
            });
    });

    it("stats the root", function() {
        return this.client.stat("/")
            .then(function(stat) {
                expect(stat).to.be.an.object;
                expect(stat).to.have.property("filename", "/");
                expect(stat).to.have.property("basename", "");
                expect(stat).to.have.property("lastmod").that.is.a.string;
                expect(stat).to.have.property("type", "directory");
                expect(stat).to.have.property("size", 0);
            });
    });

});
