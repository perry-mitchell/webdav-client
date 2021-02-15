const { AuthType } = require("../../../dist/node/index.js");
const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    restoreRequests,
    useCustomXmlResponse,
    useRequestSpy
} = require("../../helpers.node.js");

describe("getDirectoryContents", function() {
    beforeEach(async function() {
        clean();
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        this.server = createWebDAVServer();
        this.requestSpy = useRequestSpy();
        await this.server.start();
    });

    afterEach(async function() {
        await this.server.stop();
        restoreRequests();
        clean();
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
            const items = contents.map(item => item.filename);
            expect(items).to.deep.equal(["/webdav/server"]);
        });
    });

    it("returns correct file results", function() {
        return this.client.getDirectoryContents("/").then(function(contents) {
            const sub1 = contents.find(item => item.basename === "alrighty.jpg");
            const sub2 = contents.find(item => item.basename === "file&name.txt");
            expect(sub1.filename).to.equal("/alrighty.jpg");
            expect(sub1.size).to.equal(52130);
            expect(sub1.type).to.equal("file");
            expect(sub2.filename).to.equal("/file&name.txt");
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

    it("returns only the directory contents for directory with & in name", function() {
        return this.client.getDirectoryContents("/with & in path").then(function(contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file.txt");
        });
    });

    it("returns correct directory contents when path contains encoded sequences (issue #93)", function() {
        return this.client.getDirectoryContents("/two%20words").then(contents => {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file2.txt");
        });
    });

    it("returns correct names for directories that contain % in the name", function() {
        return this.client.getDirectoryContents("/").then(function(contents) {
            const noPercent = contents.find(item => item.basename === "two words");
            const percent = contents.find(item => item.basename === "two%20words");
            expect(noPercent).to.have.property("type", "directory");
            expect(percent).to.have.property("type", "directory");
        });
    });

    it("allows specifying custom headers", async function() {
        await this.client.getDirectoryContents("/", {
            headers: {
                "X-test": "test"
            }
        });
        const [requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions)
            .to.have.property("headers")
            .that.has.property("X-test", "test");
    });

    describe("when using details: true", function() {
        it("returns data and headers properties", function() {
            return this.client.getDirectoryContents("/", { details: true }).then(function(details) {
                expect(details)
                    .to.have.property("data")
                    .that.is.an("array");
                expect(details)
                    .to.have.property("headers")
                    .that.is.an("object");
            });
        });

        it("returns props on each directory item", function() {
            return this.client.getDirectoryContents("/", { details: true }).then(function(details) {
                const alrightyJpg = details.data.find(item => item.basename === "alrighty.jpg");
                expect(alrightyJpg)
                    .to.have.property("props")
                    .that.is.an("object");
                expect(alrightyJpg.props)
                    .to.have.property("getlastmodified")
                    .that.matches(/GMT$/);
            });
        });
    });

    describe("when connected to Seafile server", function() {
        beforeEach(function() {
            this.client = createWebDAVClient("https://cloud.ascal-strasbg.fr/seafdav", {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD
            });
            useCustomXmlResponse("seafile-propfind");
        });

        afterEach(function() {
            restoreRequests();
        });

        it("returns the correct response", function() {
            return this.client.getDirectoryContents("/").then(function(contents) {
                expect(contents).to.be.an("array");
                expect(contents).to.deep.equal([
                    {
                        filename: "/Ma bibliothèque",
                        etag: "2920f985ebc6692632c7c3ab46b3919556239d37",
                        basename: "Ma bibliothèque",
                        lastmod: null,
                        size: 0,
                        type: "directory"
                    }
                ]);
            });
        });
    });

    describe("when fetching an empty multistatus", function() {
        beforeEach(function() {
            this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD
            });
            useCustomXmlResponse("empty-multistatus");
        });

        afterEach(function() {
            restoreRequests();
        });

        it("returns the correct response", function() {
            return this.client.getDirectoryContents("/").then(function(contents) {
                expect(contents).to.be.an("array");
                expect(contents).to.deep.equal([]);
            });
        });
    });

    it("supports globbing files", function() {
        const options = {
            deep: true,
            glob: "/webdav/**/*.txt"
        };
        return this.client.getDirectoryContents("/", options).then(function(contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].filename).to.equal("/webdav/server/notreal.txt");
        });
    });

    describe("using Digest authentication", function() {
        beforeEach(async function() {
            await this.server.stop();
            this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD,
                authType: AuthType.Digest
            });
            this.server = createWebDAVServer("digest");
            await this.server.start();
        });

        afterEach(async function() {
            await this.server.stop();
            clean();
        });

        it("returns an array of results", function() {
            return this.client.getDirectoryContents("/").then(function(contents) {
                expect(contents).to.be.an("array");
                expect(contents[0]).to.be.an("object");
            });
        });
    });
});
