var path = require("path"),
    fs = require("fs");

var fileExists = require("file-exists"),
    directoryExists = require("directory-exists").sync,
    rimraf = require("rimraf").sync;

var expect = require("chai").expect;

var createServer = require(__dirname + "/../resources/webdav-server.js"),
    alterAdapter = require(__dirname + "/../../source/adapter/alter.js");

var TARGET_FILE = path.resolve(__dirname, "../resources/webdav_testing_files/gem.png"),
    MOVE_TARGET = TARGET_FILE.replace("gem.png", "crystal1.png");
    MOVED_TARGET = TARGET_FILE.replace("gem.png", "crystal2.png");

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

    describe("move", function() {

        before(function() {
            if (fileExists(MOVED_TARGET)) {
                throw new Error("Testing file existed when it shouldn't have");
            }
            let buffer = fs.readFileSync(TARGET_FILE);
            fs.writeFileSync(MOVE_TARGET, buffer);
        });

        it("moves the file", function() {
            return alterAdapter
                .move("http://localhost:9999", "/crystal1.png", "/crystal2.png")
                .then(function() {
                    expect(fileExists(MOVED_TARGET)).to.be.true;
                    expect(fileExists(MOVE_TARGET)).to.be.false;
                });
        });

    });

});
