import { createClient } from "../../source/index.js";
import { PASSWORD, PORT, USERNAME } from "../server/credentials.js";

describe("getDirectoryContents", function () {
    beforeEach(function () {
        client = createClient(`http://localhost:${PORT}/webdav/server`, {
            username: USERNAME,
            password: PASSWORD
        });
    });

    it("returns an array of items", function () {
        return client.getDirectoryContents("/").then(function (contents) {
            expect(contents).to.be.an("array");
            expect(contents[0]).to.be.an("object");
        });
    });

    it("returns correct directory results", function () {
        return client.getDirectoryContents("/").then(function (contents) {
            const sub1 = contents.find(function (item) {
                return item.basename === "sub1";
            });
            expect(sub1.filename).to.equal("/sub1");
            expect(sub1.size).to.equal(0);
            expect(sub1.type).to.equal("directory");
        });
    });

    it("returns results not including base directory", function () {
        return client.getDirectoryContents("/sub1").then(function (contents) {
            const sub1 = contents.find(function (item) {
                return item.basename === "sub1";
            });
            expect(sub1).to.be.undefined;
        });
    });

    it("returns only expected results when using trailing slash", function () {
        return client.getDirectoryContents("/webdav/").then(function (contents) {
            const items = contents
                .map(function (item) {
                    return item.filename;
                })
                .join(",");
            expect(items).to.equal("/webdav/server");
        });
    });

    it("returns correct file results", function () {
        return client.getDirectoryContents("/").then(function (contents) {
            const sub1 = contents.find(function (item) {
                return item.basename === "alrighty.jpg";
            });
            expect(sub1.filename).to.equal("/alrighty.jpg");
            expect(sub1.size).to.equal(52130);
            expect(sub1.type).to.equal("file");
        });
    });

    it("returns correct file results in sub-directory", function () {
        return client.getDirectoryContents("/sub1").then(function (contents) {
            const sub1 = contents.find(function (item) {
                return item.basename === "irrelephant.jpg";
            });
            expect(sub1.filename).to.equal("/sub1/irrelephant.jpg");
            expect(sub1.size).to.equal(138008);
            expect(sub1.type).to.equal("file");
        });
    });

    it("returns correct file results for files with special characters", function () {
        return client.getDirectoryContents("/sub1").then(function (contents) {
            const sub1 = contents.find(function (item) {
                return item.basename === "ยากจน #1.txt";
            });
            expect(sub1.filename).to.equal("/sub1/ยากจน #1.txt");
        });
    });

    it("returns the contents of a directory with repetitive naming", function () {
        return client.getDirectoryContents("/webdav/server").then(function (contents) {
            expect(contents).to.be.an("array");
            expect(contents[0]).to.be.an("object");
            expect(contents[0]).to.have.property("basename", "notreal.txt");
        });
    });

    it("returns only the directory contents (issue #68)", function () {
        return client.getDirectoryContents("/two words").then(function (contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file.txt");
        });
    });

    it("returns correct directory contents when path contains encoded sequences (issue #93)", function () {
        return client.getDirectoryContents("/two%20words").then(function (contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file2.txt");
        });
    });

    it("returns etags from propfind", function () {
        return client.getDirectoryContents("/").then(function (contents) {
            expect(contents[0])
                .to.have.property("etag")
                .that.matches(/^[a-f0-9]{32}$/);
        });
    });

    describe("when using 'deep' option", function () {
        it("returns all directory contents from the entire file tree", function () {
            return client.getDirectoryContents("/", { deep: true }).then(function (contents) {
                expect(contents.find(item => item.filename === "/alrighty.jpg")).to.be.an("object");
                expect(contents.find(item => item.filename === "/sub1/ยากจน #1.txt")).to.be.an(
                    "object"
                );
            });
        });
    });

    it("supports globbing files", function () {
        const options = {
            deep: true,
            glob: "/webdav/**/*.txt"
        };
        return client.getDirectoryContents("/", options).then(function (contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].filename).to.equal("/webdav/server/notreal.txt");
        });
    });
});
