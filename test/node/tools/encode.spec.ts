import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decodeHTMLEntities } from "../../../source/tools/encode.js";

describe("decodeHTMLEntities", function () {
    it("decodes XML entities correctly", function () {
        expect(decodeHTMLEntities("asdf &amp; &#xFF; &#xFC; &apos;")).to.equal("asdf & ÿ ü '");
    });

    it("decodes HTML entities correctly", function () {
        expect(decodeHTMLEntities("asdf &amp; &yuml; &uuml; &apos;")).to.equal("asdf & ÿ ü '");
    });
});
