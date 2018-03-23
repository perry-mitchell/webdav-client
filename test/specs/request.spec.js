const request = require("../../dist/request.js");
const encodePath = request.encodePath;

describe("request", function() {
    describe("encodePath", function() {
        it("encodes basic paths", function() {
            expect(encodePath("testfile.txt")).to.equal("testfile.txt");
            expect(encodePath("root/sub/last")).to.equal("root/sub/last");
        });

        it("encodes windows paths", function() {
            expect(encodePath("one\\\\two")).to.equal("one\\\\two");
        });

        it("encodes special characters", function() {
            expect(encodePath("one/two two/three")).to.equal("one/two%20two/three");
            expect(encodePath("file #32.txt")).to.equal("file%20%2332.txt");
        });
    });
});
