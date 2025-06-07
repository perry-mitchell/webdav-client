import { describe, expect, it } from "vitest";
import { calculateDataLength } from "../../../source/tools/size.js";

describe("calculateDataLength", () => {
    it("correctly calculates length for utf-8 string", () => {
        const utf8String = "řeřicha";
        expect(calculateDataLength(utf8String)).to.equal(9);
    });
});
