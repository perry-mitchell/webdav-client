import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        fileParallelism: false,
        projects: [
            // {
            //     test: {
            //         name: "node-unit",
            //         environment: "node",
            //         include: [
            //             "test/node/**/*.spec.ts"
            //         ]
            //     }
            // },
            {
                test: {
                    name: "browser",
                    include: [
                        "test/web/**/*.spec.ts"
                    ],
                    browser: {
                        provider: "playwright",
                        enabled: true,
                        instances: [
                            { browser: "chromium" }
                        ]
                    }
                }
            }
        ]
    },
});
