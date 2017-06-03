var path = require("path"),
    fs = require("fs");

var fileExists = require("file-exists"),
    directoryExists = require("directory-exists").sync,
    rimraf = require("rimraf").sync,
    mkdir = require("mkdirp").sync;

var createServer = require(__dirname + "/../resources/webdav-server.js"),
    alterAdapter = require(__dirname + "/../../source/adapter/alter.js");

var TARGET_FILE = path.resolve(__dirname, "../resources/webdav_testing_files/gem.png"),
    MOVE_TARGET = TARGET_FILE.replace("gem.png", "crystal1.png");
    MOVED_TARGET = TARGET_FILE.replace("gem.png", "crystal2.png"),
    RM_DIR_TARGET = path.resolve(__dirname, "../resources/webdav_testing_files/_shouldnt_exist_");

describe("adapter:alter", function() {

    beforeEach(function(done) {
        this.server = createServer();
        this.server.start().then(done);
    });

    afterEach(function(done) {
        this.server.stop().then(done);
        if (fileExists(MOVE_TARGET)) {
            rimraf(MOVE_TARGET);
        }
        if (fileExists(MOVED_TARGET)) {
            rimraf(MOVED_TARGET);
        }
    });

    describe("deleteItem", function() {

        beforeEach(function() {
            if (fileExists(MOVED_TARGET)) {
                throw new Error("Testing file existed when it shouldn't have");
            }
            var buffer = fs.readFileSync(TARGET_FILE);
            fs.writeFileSync(MOVE_TARGET, buffer);
        });

        it("deletes files", function() {
            expect(fileExists(MOVE_TARGET)).to.be.true;
            return alterAdapter
                .deleteItem("http://localhost:9999", "/crystal1.png")
                .then(function() {
                    expect(fileExists(MOVE_TARGET)).to.be.false;
                });
        });

        it("deletes directories", function() {
            mkdir(RM_DIR_TARGET);
            expect(directoryExists(RM_DIR_TARGET)).to.be.true;
            return alterAdapter
                .deleteItem("http://localhost:9999", "/_shouldnt_exist_")
                .then(function() {
                    expect(directoryExists(RM_DIR_TARGET)).to.be.false;
                });
        });

    });

    describe("moveItem", function() {

        beforeEach(function() {
            if (fileExists(MOVED_TARGET)) {
                throw new Error("Testing file existed when it shouldn't have");
            }
            var buffer = fs.readFileSync(TARGET_FILE);
            fs.writeFileSync(MOVE_TARGET, buffer);
        });

        it("moves the file", function() {
            return alterAdapter
                .moveItem("http://localhost:9999", "/crystal1.png", "/crystal2.png")
                .then(function() {
                    expect(fileExists(MOVED_TARGET)).to.be.true;
                    expect(fileExists(MOVE_TARGET)).to.be.false;
                });
        });

    });

});
