const { parseXML } = require("../../source/interface/dav.js");
const { parseStat } = require("../../source/interface/stat.js");
const { processResponsePayload } = require("../../source/response.js");

describe("custom", function() {
    beforeEach(function() {
        this.client = createWebDAVClient("http://localhost:9988/webdav/server", {
            username: createWebDAVServer.test.username,
            password: createWebDAVServer.test.password
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function() {
        return this.server.stop();
    });

    it("send and parse stat custom request", function() {
        let response = null;
        return this.client
            .customRequest({
                url: "http://localhost:9988/webdav/server/alrighty.jpg",
                method: "PROPFIND",
                headers: {
                    Accept: "text/plain",
                    Depth: 0
                },
                responseType: "text"
            })
            .then(res => {
                response = res;
                return res.data;
            })
            .then(parseXML)
            .then(xml => parseStat(xml, "alrighty.jpg"))
            .then(result => processResponsePayload(response, result))
            .then(function(stat) {
                expect(stat).to.be.an("object");
                expect(stat).to.have.property("filename", "/alrighty.jpg");
                expect(stat).to.have.property("basename", "alrighty.jpg");
                expect(stat).to.have.property("lastmod").that.is.a.string;
                expect(stat).to.have.property("type", "file");
                expect(stat).to.have.property("size", 52130);
                expect(stat).to.have.property("mime", "image/jpeg");
            });
    });
});
