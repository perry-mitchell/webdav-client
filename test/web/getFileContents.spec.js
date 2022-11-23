import { createClient } from "../../source/index.js";
import { PASSWORD, PORT, USERNAME } from "../server/credentials.js";

describe("getDirectoryContents", function () {
    function arrayBufferToString(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    beforeEach(function () {
        this.client = createClient(`http://localhost:${PORT}/webdav/server`, {
            username: USERNAME,
            password: PASSWORD
        });
    });

    it("reads a remote text file into a buffer", function () {
        return this.client.getFileContents("/text document.txt").then(bufferRemote => {
            expect(bufferRemote).to.be.an.instanceof(ArrayBuffer);
            expect(arrayBufferToString(bufferRemote)).to.contain("This is my cool file.");
        });
    });

    it("reads a remote binary file into a buffer", function () {
        return this.client.getFileContents("/alrighty.jpg").then(bufferRemote => {
            expect(bufferRemote).to.be.an.instanceof(ArrayBuffer);
            expect(bufferRemote.byteLength).to.equal(52130);
        });
    });

    it("reads a remote file into a string", function () {
        return this.client
            .getFileContents("/text document.txt", { format: "text" })
            .then(stringRemote => {
                expect(stringRemote).to.contain("This is my cool file.");
            });
    });

    it("supports returning detailed results (string)", function () {
        return this.client
            .getFileContents("/text document.txt", { format: "text", details: true })
            .then(details => {
                expect(details).to.have.property("data").that.is.a("string");
                expect(details).to.have.property("headers").that.is.an("object");
            });
    });

    it("can retrieve JSON files as text (#267)", function () {
        return this.client.getFileContents("/format.json", { format: "text" }).then(contents => {
            expect(contents).to.be.a("string");
            expect(contents).to.contain(`{"test":true}`);
        });
    });
});
