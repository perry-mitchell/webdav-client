describe("exists", function() {
    beforeEach(function() {
        this.client = createWebDAVClient("http://localhost:9988/webdav/server", {
            username: createWebDAVServer.test.username,
            password: createWebDAVServer.test.password
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function() {
        return this.server.stop();
    });

    it("correctly detects existing files", function() {
        return this.client.exists("/two%20words/file2.txt").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly detects existing directories", function() {
        return this.client.exists("/webdav/server").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly responds for non-existing paths", function() {
        return this.client.exists("/webdav/this/is/not/here.txt").then(doesExist => {
            expect(doesExist).to.be.false;
        });
    });
});
