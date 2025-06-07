import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    FetchSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    useRequestSpyWithFakeResponse,
    useFetchSpy
} from "../../helpers.node.js";
import { ResponseDataDetailed, SearchResult, WebDAVClient } from "../../../source/types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

function useTruncatedSearchResults() {
    return useRequestSpyWithFakeResponse(
        fs.readFileSync(path.resolve(dirname, "../../responses/search-truncated.xml"), "utf8")
    );
}

function useFullSearchResults() {
    return useRequestSpyWithFakeResponse(
        fs.readFileSync(path.resolve(dirname, "../../responses/search-full-success.xml"), "utf8")
    );
}

const searchRequest = `<?xml version="1.0" encoding="UTF-8"?>
<d:searchrequest xmlns:d="DAV:" xmlns:f="http://example.com/foo">
    <f:natural-language-query>
    Find files changed 2023-08-03
    </f:natural-language-query>
</d:searchrequest>
`;

describe("search", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: FetchSpy;

    beforeEach(async function () {
        const port = await nextPort();
        clean();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        server = createWebDAVServer(port);
        requestSpy = useFetchSpy();
        await server.start();
    });

    afterEach(async function () {
        await server.stop();
        restoreRequests();
        clean();
    });

    it("returns full search response", function () {
        useFullSearchResults();
        return client.search("/", { data: searchRequest }).then(function (result) {
            expect(result).to.be.an("object");
            expect(result).to.have.property("truncated", false);
            expect(result).to.have.property("results");
            expect((result as SearchResult).results.length).to.equal(2);
            expect((result as SearchResult).results[0].basename).to.equal("first-file.md");
            expect((result as SearchResult).results[1].basename).to.equal("second file.txt");
        });
    });

    it("returns full detailed search response", function () {
        useFullSearchResults();
        return client.search("/", { data: searchRequest, details: true }).then(function (result) {
            expect(result).to.be.an("object");
            result = (result as ResponseDataDetailed<SearchResult>).data;
            expect(result).to.be.an("object");
            expect(result).to.have.property("truncated", false);
            expect(result).to.have.property("results");
            expect(result.results.length).to.equal(2);
            expect(result.results[0].basename).to.equal("first-file.md");
            expect(result.results[0].props.getcontenttype).to.equal("text/markdown");
        });
    });

    it("returns truncated search response", function () {
        useTruncatedSearchResults();
        return client.search("/", { data: searchRequest }).then(function (result) {
            expect(result).to.be.an("object");
            expect(result).to.have.property("truncated", true);
            expect(result).to.have.property("results");
            expect((result as SearchResult).results.length).to.equal(1);
            expect((result as SearchResult).results[0].basename).to.equal("first-file.md");
        });
    });
});
