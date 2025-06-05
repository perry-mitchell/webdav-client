import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    FetchSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort
} from "../../helpers.node.js";
import { parseStat, parseXML, WebDAVClient } from "../../../source/index.js";

describe("custom", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: FetchSpy;

    beforeEach(async function () {
        const port = await nextPort();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        server = createWebDAVServer(port);
        await server.start();
    });

    afterEach(async function () {
        await server.stop();
    });

    it("send and parse stat custom request", async function () {
        const resp = await client.customRequest("/alrighty.jpg", {
            method: "PROPFIND",
            headers: {
                Accept: "text/plain,application/xml",
                Depth: "0"
            }
        });
        const payload = await resp.text();
        const result = await parseXML(payload);
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
