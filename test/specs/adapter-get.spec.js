var expect = require("chai").expect;

var createServer = require(__dirname + "/../resources/webdav-server.js"),
    getAdapter = require(__dirname + "/../../source/adapter/get.js");

describe("adapter:get", function() {

    beforeEach(function(done) {
        this.server = createServer();
        this.server.start().then(done);
    });

    afterEach(function(done) {
        this.server.stop().then(done);
    })

    describe("getFileContents", function() {

        it("gets contents of a remote file", function(done) {
            getAdapter
                .getFileContents("http://localhost:9999", "/gem.png")
                .then(function(contents) {
                    expect(contents.length).to.equal(279);
                    expect(contents instanceof Buffer).to.be.true;
                })
                .then(done);
        });

    });

});
