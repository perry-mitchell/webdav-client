import { beforeEach, describe, expect, it } from "vitest";
import { createClient } from "../../dist/web/index.js";
import { WebDAVClient } from "../../source/types.js";
import { PASSWORD, WEB_PORT, USERNAME } from "../server/credentials.js";

describe("exists", function () {
    let client: WebDAVClient;

    beforeEach(async function () {
        client = createClient(`http://localhost:${WEB_PORT}/webdav/server`, {
            username: USERNAME,
            password: PASSWORD
        });
    });

    it("correctly detects existing files", async function () {
        const doesExist = await client.exists("/two%20words/file2.txt");
        expect(doesExist).to.be.true;
    });

    it("correctly detects existing directories", async function () {
        const doesExist = await client.exists("/webdav/server");
        expect(doesExist).to.be.true;
    });

    it("correctly responds for non-existing paths", async function () {
        const doesExist = await client.exists("/webdav/this/is/not/here.txt");
        expect(doesExist).to.be.false;
    });
});
