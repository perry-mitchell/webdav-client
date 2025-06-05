import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthType, FileStat, WebDAVClient } from "../../../source/index.js";
import {
    RequestSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    returnFakeResponse,
    useCustomXmlResponse,
    useRequestSpy
} from "../../helpers.node.js";

describe("getDirectoryContents", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: RequestSpy, port: number;

    beforeEach(async function () {
        port = await nextPort();
        clean();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        server = createWebDAVServer(port);
        requestSpy = useRequestSpy();
        await server.start();
    });

    afterEach(async function () {
        await server.stop();
        restoreRequests();
        clean();
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
            const items = contents.map(item => item.filename);
            expect(items).to.deep.equal(["/webdav/server"]);
        });
    });

    it("returns correct file results", function () {
        return client.getDirectoryContents("/").then(function (contents) {
            const sub1 = contents.find(item => item.basename === "alrighty.jpg");
            const sub2 = contents.find(item => item.basename === "file&name.txt");
            expect(sub1.filename).to.equal("/alrighty.jpg");
            expect(sub1.size).to.equal(52130);
            expect(sub1.type).to.equal("file");
            expect(sub2.filename).to.equal("/file&name.txt");
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

    it("returns correct results when calling without root slash", function () {
        return client.getDirectoryContents("sub1").then(function (contents) {
            expect(contents).to.have.lengthOf(2);
            const sub1 = contents.find(item => item.basename === "irrelephant.jpg");
            expect(sub1).to.be.ok;
            const sub2 = contents.find(item => item.basename === "ยากจน #1.txt");
            expect(sub2).to.be.ok;
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

    it("returns correct file results for files with HTML entities in their names", function () {
        returnFakeResponse(
            readFileSync(
                new URL("../../responses/propfind-href-html-entities.xml", import.meta.url)
            ).toString()
        );

        return client.getDirectoryContents("/files").then(function (contents) {
            const file = contents.find(function (item) {
                return item.basename === "&amp;.md";
            });
            expect(file).not.to.equal(undefined, "Expected file does not exist");
            expect(file.filename).to.match(/\/files\/&amp;\.md$/);
        });
    });

    it("returns correct file results for files with query in href", function () {
        returnFakeResponse(
            readFileSync(
                new URL("../../responses/propfind-href-with-query.xml", import.meta.url)
            ).toString()
        );

        return client.getDirectoryContents("/files").then(function (contents) {
            expect(contents).to.have.length(1);
            expect(contents[0].filename).to.match(/\/files\/some file\?foo=1&bar=2$/);
        });
    });

    it("correctly parses the displayname property", function () {
        returnFakeResponse(
            readFileSync(
                new URL("../../responses/propfind-numeric-displayname.xml", import.meta.url)
            ).toString()
        );
        return client.getDirectoryContents("/1", { details: true }).then(function (result) {
            expect(result.data).to.have.length(1);
            expect(result.data[0]).to.have.property("props").that.is.an("object");
            expect(result.data[0].props)
                .to.have.property("displayname")
                .that.is.a("string")
                .and.equal("1");
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

    it("returns only the directory contents for directory with & in name", function () {
        return client.getDirectoryContents("/with & in path").then(function (contents) {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file.txt");
        });
    });

    it("returns correct directory contents when path contains encoded sequences (issue #93)", function () {
        return client.getDirectoryContents("/two%20words").then(contents => {
            expect(contents).to.have.lengthOf(1);
            expect(contents[0].basename).to.equal("file2.txt");
        });
    });

    it("returns correct names for directories that contain % in the name", function () {
        return client.getDirectoryContents("/").then(function (contents) {
            const noPercent = contents.find(item => item.basename === "two words");
            const percent = contents.find(item => item.basename === "two%20words");
            expect(noPercent).to.have.property("type", "directory");
            expect(percent).to.have.property("type", "directory");
        });
    });

    it("allows specifying custom headers", async function () {
        await client.getDirectoryContents("/", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    describe("when using details: true", function () {
        it("returns data and headers properties", function () {
            return client.getDirectoryContents("/", { details: true }).then(function (details) {
                expect(details).to.have.property("data").that.is.an("array");
                expect(details).to.have.property("headers").that.is.an("object");
            });
        });

        it("returns props on each directory item", function () {
            return client.getDirectoryContents("/", { details: true }).then(function (details) {
                const alrightyJpg = details.data.find(item => item.basename === "alrighty.jpg");
                expect(alrightyJpg).to.have.property("props").that.is.an("object");
                expect(alrightyJpg.props).to.have.property("getlastmodified").that.matches(/GMT$/);
            });
        });
    });

    describe("when connected to Seafile server", function () {
        beforeEach(async function () {
            client = createWebDAVClient("https://cloud.ascal-strasbg.fr/seafdav", {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD
            });
            useCustomXmlResponse("seafile-propfind");
        });

        afterEach(async function () {
            restoreRequests();
        });

        it("returns the correct response", function () {
            return client.getDirectoryContents("/").then(function (contents) {
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

    describe("when fetching an empty multistatus", function () {
        beforeEach(async function () {
            client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD
            });
            useCustomXmlResponse("empty-multistatus");
        });

        afterEach(async function () {
            restoreRequests();
        });

        it("returns the correct response", function () {
            return client.getDirectoryContents("/").then(function (contents) {
                expect(contents).to.be.an("array");
                expect(contents).to.deep.equal([]);
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

    describe("using Digest authentication", function () {
        beforeEach(async function () {
            await server.stop();
            client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD,
                authType: AuthType.Digest
            });
            server = createWebDAVServer(port, "digest");
            await server.start();
        });

        it("returns an array of results", function () {
            return client.getDirectoryContents("/").then(function (contents) {
                expect(contents).to.be.an("array");
                expect(contents[0]).to.be.an("object");
            });
        });
    });

    describe("when using includeSelf: true", function () {
        it("returns correct directory results with directory itself", function () {
            return client.getDirectoryContents("/", { includeSelf: true }).then(function (
                contents: Array<FileStat>
            ) {
                const root = contents.find(item => item.basename === "");
                expect(root.filename).to.equal("/");
                expect(root.size).to.equal(0);
                expect(root.type).to.equal("directory");
                expect(contents.length).to.equal(12);
            });
        });

        it("returns correct file results in sub-directory", function () {
            return client.getDirectoryContents("/sub1", { includeSelf: true }).then(function (
                contents: Array<FileStat>
            ) {
                const sub1 = contents.find(item => item.basename === "sub1");
                expect(sub1.filename).to.equal("/sub1");
                expect(sub1.size).to.equal(0);
                expect(sub1.type).to.equal("directory");
                expect(contents.length).to.equal(3);
            });
        });
    });

    describe("when using custom dir base path", function () {
        beforeEach(async function () {
            client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD,
                remoteBasePath: "/webdav/server/custom"
            });
        });

        it("return correct filename with custom path", function () {
            return client.getDirectoryContents("/").then(function (contents: Array<FileStat>) {
                const file = contents.find(item => item.basename === "notes.txt");
                expect(file.filename).to.equal("/../notes.txt");
            });
        });
    });
});
