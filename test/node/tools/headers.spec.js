const { mergeHeaders } = require("../../../dist/node/tools/headers.js");

describe("mergeHeaders", function () {
    it("merges headers with different cases", function () {
        expect(
            mergeHeaders(
                {
                    "Content-type": "text/plain",
                    "X-test": "1"
                },
                {
                    "Content-Type": "application/javascript",
                    "X-test-2": "2"
                },
                {
                    "X-test-3": "3"
                }
            )
        ).to.deep.equal({
            "Content-type": "application/javascript",
            "X-test": "1",
            "X-test-2": "2",
            "X-test-3": "3"
        });
    });
});
