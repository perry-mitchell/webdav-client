import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    RequestSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    returnFakeResponse,
    useRequestSpy
} from "../../helpers.node.js";
import { WebDAVClient } from "../../../source/types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

function useInvalidQuota() {
    returnFakeResponse(
        fs.readFileSync(path.resolve(dirname, "../../responses/quota-invalid.xml"), "utf8")
    );
}

function useValidQuota() {
    returnFakeResponse(
        fs.readFileSync(path.resolve(dirname, "../../responses/quota-valid.xml"), "utf8")
    );
}

describe("getQuota", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: RequestSpy;

    beforeEach(async function () {
        const port = await nextPort();
        clean();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        server = createWebDAVServer(port);
        requestSpy = useRequestSpy();
        await server.start();
    });

    afterEach(async function () {
        await server.stop();
        restoreRequests();
        clean();
    });

    it("returns correct available amount", function () {
        useValidQuota();
        return client.getQuota().then(function (quotaInfo) {
            expect(quotaInfo).to.be.an("object");
            expect(quotaInfo).to.have.property("available", "unlimited");
        });
    });

    it("returns correct used amount", function () {
        useValidQuota();
        return client.getQuota().then(function (quotaInfo) {
            expect(quotaInfo).to.be.an("object");
            expect(quotaInfo).to.have.property("used", 6864755191);
        });
    });

    it("returns null for invalid quotas", function () {
        useInvalidQuota();
        return client.getQuota().then(function (quotaInfo) {
            expect(quotaInfo).to.be.null;
        });
    });

    it("supports returning detailed results", function () {
        useValidQuota();
        return client.getQuota({ details: true }).then(function (details) {
            expect(details).to.have.property("data").that.is.an("object");
            expect(details).to.have.property("headers").that.is.an("object");
        });
    });

    it("supports path option", async function () {
        await client.getQuota({ path: "sub1" });
        const [url] = requestSpy.mock.calls[0].arguments;
        expect(url).to.match(/webdav\/server\/sub1$/);
    });
});
