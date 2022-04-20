const { createClient } = require("../../source/index.ts");
const { PASSWORD, PORT, USERNAME } = require("../server/credentials.js");

describe("exists", function () {
    beforeEach(function () {
        this.client = createClient(`http://localhost:${PORT}/webdav/server`, {
            username: USERNAME,
            password: PASSWORD
        });
    });

    it("correctly detects existing files", function () {
        return this.client.exists("/two%20words/file2.txt").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly detects existing directories", function () {
        return this.client.exists("/webdav/server").then(doesExist => {
            expect(doesExist).to.be.true;
        });
    });

    it("correctly responds for non-existing paths", function () {
        return this.client.exists("/webdav/this/is/not/here.txt").then(doesExist => {
            expect(doesExist).to.be.false;
        });
    });
});
