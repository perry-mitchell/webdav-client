import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { expect } from "chai";
import {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    restoreRequests,
    returnFakeResponse,
    useRequestSpy
} from "../../helpers.node.js";
import { ResponseDataDetailed, SearchResult, WebDAVClient } from "../../../source/types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

function useTruncatedSearchResults() {
    returnFakeResponse(
        fs.readFileSync(path.resolve(dirname, "../../responses/search-truncated.xml"), "utf8")
    );
}

function useFullSearchResults() {
    returnFakeResponse(
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
    let client: WebDAVClient;
    beforeEach(function () {
        // fake client, not actually used when mocking responses
        client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        this.requestSpy = useRequestSpy();
        return this.server.start();
    });

    afterEach(function () {
        restoreRequests();
        return this.server.stop();
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
