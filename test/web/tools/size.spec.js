const { calculateDataLength } = require("../../../source/tools/size.ts");

describe("calculateDataLength", () => {
    it("Correctly calculates length for utf-8 string", () => {
        const utf8String = "řeřicha";
        expect(calculateDataLength(utf8String)).to.equal(9);
    });
});
