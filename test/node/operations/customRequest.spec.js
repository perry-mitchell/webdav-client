const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer
} = require("../../helpers.node.js");
const { parseStat, parseXML } = require("../../../dist/node/index.js");

describe("custom", function () {
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

    it("send and parse stat custom request", async function () {
        let response = null;
        const resp = await this.client.customRequest("/alrighty.jpg", {
            method: "PROPFIND",
            headers: {
                Accept: "text/plain",
                Depth: "0"
            },
            responseType: "text"
        });
        const result = await parseXML(resp.data);
        const stat = parseStat(result, "/alrighty.jpg", false);
        expect(stat).to.be.an("object");
        expect(stat).to.have.property("filename", "/alrighty.jpg");
        expect(stat).to.have.property("basename", "alrighty.jpg");
        expect(stat).to.have.property("lastmod").that.is.a.string;
        expect(stat).to.have.property("type", "file");
        expect(stat).to.have.property("size", 52130);
        expect(stat).to.have.property("mime", "image/jpeg");
    });
});
