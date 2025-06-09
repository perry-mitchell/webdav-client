import { beforeEach, describe, expect, it } from "vitest";
import { createClient } from "../../dist/web/index.js";
import { WebDAVClient } from "../../source/types.js";
import { PASSWORD, WEB_PORT, USERNAME } from "../server/credentials.js";

describe("stat", function () {
    let client: WebDAVClient;

    beforeEach(async function () {
        client = createClient(`http://localhost:${WEB_PORT}/webdav/server`, {
            username: USERNAME,
            password: PASSWORD
        });
    });

    it("correctly stats files", function () {
        return client.stat("/alrighty.jpg").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/alrighty.jpg");
            expect(stat).to.have.property("basename", "alrighty.jpg");
            expect(stat).to.have.property("lastmod").that.is.a.string;
            expect(stat).to.have.property("type", "file");
            expect(stat).to.have.property("size", 52130);
            expect(stat).to.have.property("mime", "image/jpeg");
        });
    });

    it("correctly stats files with '%' in the path (#221)", function () {
        return client.stat("/file % name.txt").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/file % name.txt");
            expect(stat).to.have.property("basename", "file % name.txt");
        });
    });

    it("correctly stats directories with '%' in the path (#221)", function () {
        return client.stat("/two%20words").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/two%20words");
            expect(stat).to.have.property("basename", "two%20words");
        });
    });

    it("correctly stats directories", function () {
        return client.stat("/webdav/server").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/webdav/server");
            expect(stat).to.have.property("basename", "server");
            expect(stat).to.have.property("lastmod").that.is.a.string;
            expect(stat).to.have.property("type", "directory");
            expect(stat).to.have.property("size", 0);
        });
    });

    it("stats the root", function () {
        return client.stat("/").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/");
            expect(stat).to.have.property("basename", "");
            expect(stat).to.have.property("lastmod").that.is.a.string;
            expect(stat).to.have.property("type", "directory");
            expect(stat).to.have.property("size", 0);
        });
    });
});
