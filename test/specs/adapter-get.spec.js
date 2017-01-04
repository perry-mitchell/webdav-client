var path = require("path");

var directoryExists = require("directory-exists").sync,
    rimraf = require("rimraf").sync,
    mkdir = require("mkdirp").sync;

var expect = require("chai").expect;

var createServer = require(__dirname + "/../resources/webdav-server.js"),
    getAdapter = require(__dirname + "/../../source/adapter/get.js");

// Date example: "Mon, 10 Oct 2016 22:00:52 +0300"
var VALID_DATE = /.+?\d{4}.+?\d\d:\d\d:\d\d/;
var SERVER_URL = "http://localhost:9999";

var TEST_DIR_PARENT_PATH = path.resolve(__dirname, "../resources/webdav_testing_files/parent"),
    TEST_DIR_PATH = path.resolve(TEST_DIR_PARENT_PATH, "./child");

describe("adapter:get", function() {

    beforeEach(function(done) {
        this.server = createServer();
        this.server.start().then(done);
    });

    afterEach(function(done) {
        this.server.stop().then(done);
    });

    describe("getDirectoryContents", function() {

        it("gets all objects in directory", function() {
            return getAdapter
                .getDirectoryContents(SERVER_URL, "/")
                .then(function(contents) {
                    expect(contents.length).to.equal(3);
                });
        });

        it("gets objects in correct form", function() {
            return getAdapter
                .getDirectoryContents(SERVER_URL, "/")
                .then(function(contents) {
                    contents.forEach(function(item) {
                        expect(item.filename.length).to.be.above(0);
                        expect(item.basename.length).to.be.above(0);
                        expect(item.filename.indexOf(item.basename)).to.be.above(-1);
                        var type = item.type;
                        expect(["file", "directory"]).to.contain(type);
                        expect(item.lastmod).to.match(VALID_DATE);
                        if (type === "file") {
                            expect(item.size).to.be.above(0);
                            expect(item.mime.length).to.be.above(0);
                        } else if (type === "directory") {
                            expect(item.size).to.equal(0);
                        }
                    });
                });
        });

    });

    describe("getFileContents", function() {

        it("gets contents of a remote file", function() {
            return getAdapter
                .getFileContents(SERVER_URL, "/gem.png", { returnFormat: "binary" })
                .then(function(result) {
                    var contents = result.contents;
                    expect(contents.length).to.equal(279);
                    expect(contents instanceof Buffer).to.be.true;
                });
        });

        it("gets contents of a remote file & corresponding headers", function() {
            return getAdapter
                .getFileContents(SERVER_URL, "/gem.png", { returnFormat: "binary", returnHeaders: true })
                .then(function(contentsAndHeaders) {
                    expect(contentsAndHeaders).to.be.a('Object');
                    expect(contentsAndHeaders.contents.length).to.equal(279);
                    expect(contentsAndHeaders.contents instanceof Buffer).to.be.true;
                    //headers
                    expect(contentsAndHeaders.headers).to.be.a('Object');
                    expect(contentsAndHeaders.headers["content-length"]).to.be.a('Array');
                    expect(contentsAndHeaders.headers.date).to.match(VALID_DATE);
                });
        });

        it("gets contents of a remote text file", function() {
            return getAdapter
                .getFileContents(SERVER_URL, "/test.txt", { returnFormat: "text" })
                .then(function(result) {
                    var contents = result.contents;
                    var numLines = contents.trim().split("\n").length;
                    expect(numLines).to.equal(3);
                });
        });

        it("gets contents of a remote txt file & corresponding headers", function() {
            return getAdapter
                .getFileContents(SERVER_URL, "/test.txt", { returnFormat: "text", returnHeaders: true })
                .then(function(contentsAndHeaders) {
                    expect(contentsAndHeaders instanceof Object).to.be.true;
                    //test contents
                    var numLines = contentsAndHeaders.contents.trim().split("\n").length;
                    expect(numLines).to.equal(3);
                    //headers
                    expect(contentsAndHeaders.headers).to.be.a('Object');
                    expect(contentsAndHeaders.headers["content-length"]).to.be.a('Array');
                    expect(contentsAndHeaders.headers.date).to.match(VALID_DATE);
                });
        });

        it("gets contents of a remote json file", function() {
            return getAdapter
                .getFileContents(SERVER_URL, "/test.json", { returnFormat: "json" })
                .then(function(result) {
                    expect(result).to.be.a('Object');
                    var contents = result.contents;
                    expect(contents.msg).to.equal('hallo');
                });
        });

    });

    describe("getStat", function() {

        afterEach(function() {
            if (directoryExists(TEST_DIR_PARENT_PATH)) {
                rimraf(TEST_DIR_PARENT_PATH);
            }
        });

        it("stats files", function() {
            return getAdapter
                .getStat(SERVER_URL, "/test.txt")
                .then(function(stat) {
                    expect(stat.filename).to.equal("/test.txt");
                    expect(stat.basename).to.equal("test.txt");
                    expect(stat.type).to.equal("file");
                    expect(stat.lastmod).to.match(VALID_DATE);
                    expect(stat.size).to.equal(48);
                    expect(stat.mime).to.equal("text/plain");
                });
        });

        it("stats directories", function() {
            mkdir(TEST_DIR_PATH);
            return getAdapter
                .getStat(SERVER_URL, "/parent/child")
                .then(function(stat) {
                    expect(stat.filename).to.equal("/parent/child");
                    expect(stat.basename).to.equal("child");
                    expect(stat.type).to.equal("directory");
                    expect(stat.lastmod).to.match(VALID_DATE);
                    expect(stat.size).to.equal(0);
                    expect(stat.mime).to.be.undefined;
                });
        });

    });

});
