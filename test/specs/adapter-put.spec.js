var path = require("path"),
    fs = require("fs");

var fileExists = require("file-exists"),
    directoryExists = require("directory-exists").sync,
    rimraf = require("rimraf").sync;

var createServer = require(__dirname + "/../resources/webdav-server.js"),
    putAdapter = require(__dirname + "/../../source/adapter/put.js");

var TARGET_DIR = path.resolve(__dirname, "../resources/webdav_testing_files/testdir"),
    TARGET_FILE = path.resolve(__dirname, "../resources/webdav_testing_files/gem2.png"),
    TARGET_FILE_ORIGINAL = TARGET_FILE.replace("gem2.png", "gem.png"),
    TARGET_TEXT_FILE = path.resolve(__dirname, "../resources/webdav_testing_files/written.txt"),
    TARGET_TEXT_FILE_ORIGINAL = path.resolve(__dirname, "../resources/webdav_testing_files/test.txt")

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
        if (fileExists(TARGET_TEXT_FILE)) {
            rimraf(TARGET_TEXT_FILE);
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

    describe("createWriteStream", function() {

        before(function() {
            if (fileExists(TARGET_FILE)) {
                throw new Error("Testing file existed when it shouldn't have");
            }
        });

        it("writes the file to the remote", function() {
            var writeStream = putAdapter.createWriteStream("http://localhost:9999", "/gem2.png"),
                readStream = fs.createReadStream(TARGET_FILE_ORIGINAL);
            return new Promise(function(resolve, reject) {
                writeStream.on("end", function() {
                    // stupid stream needs time to close probably.. 😕
                    setTimeout(resolve, 150);
                });
                writeStream.on("error", reject);
                readStream.pipe(writeStream);
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

        it("doesn't overwrite if option set", function() {
            var buff1 = fs.readFileSync(TARGET_FILE_ORIGINAL),
                buff2 = fs.readFileSync(TARGET_TEXT_FILE_ORIGINAL);
            return putAdapter
                .putFileContents("http://localhost:9999", "/gem2.png", buff1)
                .then(function() {
                    return putAdapter.putFileContents(
                        "http://localhost:9999",
                        "/gem2.png",
                        buff2,
                        {
                            overwrite: false
                        }
                    );
                })
                .then(
                    function() {
                        throw new Error("fetch should throw an error");
                    },
                    function(err) {
                        var newBuff = fs.readFileSync(TARGET_FILE);
                        expect(buff1.equals(newBuff)).to.be.true;
                        expect(newBuff.length).to.equal(279); // size of first write
                    }
                );
        });

    });

    describe("putTextContents", function() {

        before(function() {
            if (fileExists(TARGET_TEXT_FILE)) {
                throw new Error("Testing file existed when it shouldn't have");
            }
        });

        it("puts the text file correctly in the remote directory", function() {
            var text = " This is the first line, \n" +
                "and this is the second.\n";
            return putAdapter
                .putTextContents("http://localhost:9999", "/written.txt", text)
                .then(function() {
                    var readText = fs.readFileSync(TARGET_TEXT_FILE, "utf8");
                    expect(readText === text).to.be.true;
                });
        });

    });


});
