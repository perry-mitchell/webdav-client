import { expect } from "chai";
import { readFile } from "fs/promises";
import { parseXML } from "../../../source/index.js";

describe("parseXML", function () {
    it("keeps numeric-looking displaynames", async function () {
        const data = await readFile(
            new URL("../../responses/propfind-float-like-displayname.xml", import.meta.url)
        );
        const parsed = await parseXML(data.toString());
        expect(parsed.multistatus.response).to.have.length(1);
        // Ensure trailing zero is not lost
        expect(parsed.multistatus.response[0].propstat.prop.displayname).to.equal("2024.10");
    });
});
