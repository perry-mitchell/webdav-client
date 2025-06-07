import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        fileParallelism: false,
        include: [
            "test/node/**/*.spec.ts"
        ]
    },
});
