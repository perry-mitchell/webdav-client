const fs = require("fs");
const path = require("path");

function useSeafileResponse() {
    returnFakeResponse(fs.readFileSync(path.resolve(__dirname, "../responses/seafile-propfind.xml"), "utf8"));
}

describe("getDirectoryContents", function() {
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

    it("returns an array of items", function() {
        return this.client.getDirectoryContents("/").then(function(contents) {
            expect(contents).to.be.an("array");
            expect(contents[0]).to.be.an("object");
        });
    });

    it("returns correct directory results", function() {
        return this.client.getDirectoryContents("/").then(function(contents) {
            const sub1 = contents.find(function(item) {
                return item.basename === "sub1";
            });
            expect(sub1.filename).to.equal("/sub1");
            expect(sub1.size).to.equal(0);
            expect(sub1.type).to.equal("directory");
        });
    });

    it("returns results not including base directory", function() {
        return this.client.getDirectoryContents("/sub1").then(function(contents) {
            const sub1 = contents.find(function(item) {
                return item.basename === "sub1";
            });
            expect(sub1).to.be.undefined;
        });
    });

    it("returns only expected results when using trailing slash", function() {
        return this.client.getDirectoryContents("/webdav/").then(function(contents) {
            const items = contents.map(item => item.filename).join(",");
            expect(items).to.equal("/webdav/server");
        });
    });

    it("returns correct file results", function() {
        return this.client.getDirectoryContents("/").then(function(contents) {
            const sub1 = contents.find(function(item) {
                return item.basename === "alrighty.jpg";
            });
            expect(sub1.filename).to.equal("/alrighty.jpg");
            expect(sub1.size).to.equal(52130);
            expect(sub1.type).to.equal("file");
        });
    });

    it("returns correct file results in sub-directory", function() {
        return this.client.getDirectoryContents("/sub1").then(function(contents) {
            const sub1 = contents.find(function(item) {
                return item.basename === "irrelephant.jpg";
            });
            expect(sub1.filename).to.equal("/sub1/irrelephant.jpg");
            expect(sub1.size).to.equal(138008);
            expect(sub1.type).to.equal("file");
        });
    });

    it("returns correct file results for files with special characters", function() {
        return this.client.getDirectoryContents("/sub1").then(function(contents) {
            const sub1 = contents.find(function(item) {
                return item.basename === "ยากจน #1.txt";
            });
            expect(sub1.filename).to.equal("/sub1/ยากจน #1.txt");
        });
    });

    it("returns the contents of a directory with repetitive naming", function() {
        return this.client.getDirectoryContents("/webdav/server").then(function(contents) {
            expect(contents).to.be.an("array");
            expect(contents[0]).to.be.an("object");
            expect(contents[0]).to.have.property("basename", "notreal.txt");
        });
    });

    it("returns only the directory contents (issue #68)", function() {
        return this.client.getDirectoryContents("/two words").then(function(contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file.txt");
        });
    });

    it("returns correct directory contents when path contains encoded sequences (issue #93)", function() {
        return this.client.getDirectoryContents("/two%20words").then(function(contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file2.txt");
        });
    });

    describe("when connected to Seafile server", function() {
        beforeEach(function() {
            this.client = createWebDAVClient(
                "https://cloud.ascal-strasbg.fr/seafdav",
                createWebDAVServer.test.username,
                createWebDAVServer.test.password
            );
            useSeafileResponse();
        });

        afterEach(function() {
            restoreFetch();
        });

        it("returns the correct response", function() {
            return this.client.getDirectoryContents("/").then(function(contents) {
                expect(contents).to.be.an("array");
                expect(contents).to.deep.equal([
                    {
                        filename: "/Ma bibliothèque",
                        basename: "Ma bibliothèque",
                        lastmod: undefined,
                        size: 0,
                        type: "directory"
                    }
                ]);
            });
        });
    });
});
