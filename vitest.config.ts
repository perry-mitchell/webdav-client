import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        fileParallelism: false,
        include: [
            "test/node/operations/getQuota.spec.ts"
            // "test/node/**/*.spec.ts"
        ]
    },
});
