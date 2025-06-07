import { describe, expect, it } from "vitest";
import { getDebugBuildName } from "../../../source/compat/env.js";

describe("getDebugBuildName", () => {
    it("outputs 'web'", () => {
        expect(getDebugBuildName()).to.equal("web");
    });
});
