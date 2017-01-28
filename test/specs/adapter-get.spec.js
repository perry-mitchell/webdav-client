var path = require("path");

var directoryExists = require("directory-exists").sync,
    rimraf = require("rimraf").sync,
    mkdir = require("mkdirp").sync;

var expect = require("chai").expect;

var createServer = require("../resources/webdav-server.js"),
    getAdapter = require("../../source/adapter/get.js"),
    authTools = require("../../source/auth.js");

// Date example: "Mon, 10 Oct 2016 22:00:52 +0300"
var VALID_DATE = /.+?\d{4}.+?\d\d:\d\d:\d\d/;
var SERVER_URL = "http://localhost:9999";

var TEST_DIR_PARENT_PATH = path.resolve(__dirname, "../resources/webdav_testing_files/parent"),
    TEST_DIR_PATH = path.resolve(TEST_DIR_PARENT_PATH, "./child");

var DAV_USER = "test";
var DAV_PASS = "test";

describe("adapter:get", function() {

    describe.skip("authenticated", function() {

        beforeEach(function(done) {
            this.server = createServer();
            this.server.startAuthenticated().then(done);
            this.options = {
                headers: {
                    authorization: authTools.generateAuthHeader(DAV_USER, DAV_PASS)
                }
            };
        });

        afterEach(function(done) {
            this.server.stop().then(done);
        });

        describe("getDirectoryContents", function() {

            it("gets all objects in directory", function() {
                return getAdapter
                    .getDirectoryContents(SERVER_URL, "/", this.options)
                    .then(function(contents) {
                        expect(contents.length).to.equal(2);
                    });
            });

        });

    });

    describe("non-authenticated", function() {

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
                        expect(contents.length).to.equal(2);
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
                    .getFileContents(SERVER_URL, "/gem.png")
                    .then(function(contents) {
                        expect(contents.length).to.equal(279);
                        expect(contents instanceof Buffer).to.be.true;
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

        describe("getTextContents", function() {

            it("gets contents of a remote file", function() {
                return getAdapter
                    .getTextContents(SERVER_URL, "/test.txt")
                    .then(function(contents) {
                        var numLines = contents.trim().split("\n").length;
                        expect(numLines).to.equal(3);
                    });
            });

        });

    });

});
