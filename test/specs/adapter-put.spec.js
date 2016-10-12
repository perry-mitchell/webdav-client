var path = require("path"),
    fs = require("fs");

var fileExists = require("file-exists"),
    directoryExists = require("directory-exists").sync,
    rimraf = require("rimraf").sync;

var expect = require("chai").expect;

var createServer = require(__dirname + "/../resources/webdav-server.js"),
    putAdapter = require(__dirname + "/../../source/adapter/put.js");

var TARGET_DIR = path.resolve(__dirname, "../resources/webdav_testing_files/testdir"),
    TARGET_FILE = path.resolve(__dirname, "../resources/webdav_testing_files/gem2.png"),
    TARGET_FILE_ORIGINAL = TARGET_FILE.replace("gem2.png", "gem.png");

describe("adapter:put", function() {

    beforeEach(function(done) {
        this.server = createServer();
        this.server.start().then(done);
    });

    afterEach(function(done) {
        this.server.stop().then(done);
        if (directoryExists(TARGET_DIR)) {
            rimraf(TARGET_DIR);
        }
        if (fileExists(TARGET_FILE)) {
            rimraf(TARGET_FILE);
        }
    });

    describe("createDirectory", function() {

        before(function() {
            if (directoryExists(TARGET_DIR)) {
                throw new Error("Testing directory existed when it shouldn't have");
            }
        });

        it("creates the specified directory", function() {
            return putAdapter
                .createDirectory("http://localhost:9999", "/testdir")
                .then(function() {
                    expect(directoryExists(TARGET_DIR)).to.be.true;
                });
        });

    });

    describe("putFileContents", function() {

        before(function() {
            if (fileExists(TARGET_FILE)) {
                throw new Error("Testing file existed when it shouldn't have");
            }
        });

        it("puts the file correctly in the remote directory", function() {
            return new Promise(function(resolve, reject) {
                var buff = fs.readFileSync(TARGET_FILE_ORIGINAL);
                putAdapter
                    .putFileContents("http://localhost:9999", "/gem2.png", buff)
                    .then(function() {
                        var newBuff = fs.readFileSync(TARGET_FILE);
                        expect(buff.equals(newBuff)).to.be.true;
                        expect(buff.length).to.equal(279);
                    })
                    .then(resolve)
                    .catch(reject);
            });
        });

    });


});
