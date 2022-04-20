const path = require("path");
const fs = require("fs");
const bufferEquals = require("buffer-equals");
const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer
} = require("../../helpers.node.js");

const SOURCE_BIN = path.resolve(__dirname, "../../testContents/alrighty.jpg");
const TARGET_BIN = path.resolve(__dirname, "../../testContents/sub1/alrighty.jpg");
const TARGET_TXT = path.resolve(__dirname, "../../testContents/newFile.txt");
const TARGET_TXT_CHARS = path.resolve(__dirname, "../../testContents/จะทำลาย.txt");

describe("putFileContents", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function () {
        return this.server.stop();
    });

    it("writes binary files", function () {
        const imgBin = fs.readFileSync(SOURCE_BIN);
        return this.client.putFileContents("/sub1/alrighty.jpg", imgBin).then(function () {
            const written = fs.readFileSync(TARGET_BIN);
            expect(bufferEquals(written, imgBin)).to.be.true;
        });
    });

    it("writes text files", function () {
        const text = "this is\nsome text\ncontent\t...\n";
        return this.client.putFileContents("/newFile.txt", text).then(function () {
            const written = fs.readFileSync(TARGET_TXT, "utf8");
            expect(written).to.equal(text);
        });
    });

    it("writes streams", async function () {
        const readStream = fs.createReadStream(SOURCE_BIN);
        await this.client.putFileContents("/sub1/alrighty.jpg", readStream);
        // Check result
        const source = fs.readFileSync(SOURCE_BIN);
        const written = fs.readFileSync(TARGET_BIN);
        expect(bufferEquals(written, source)).to.be.true;
    });

    it("writes files with non-latin characters in the filename", function () {
        const text = "this is\nsome text\ncontent\t...\n";
        return this.client.putFileContents("/จะทำลาย.txt", text).then(function () {
            const written = fs.readFileSync(TARGET_TXT_CHARS, "utf8");
            expect(written).to.equal(text);
        });
    });
});
