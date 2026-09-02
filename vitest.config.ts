import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    test: {
        fileParallelism: false,
        projects: [
            {
                test: {
                    name: "node-unit",
                    environment: "node",
                    include: ["test/node/**/*.spec.ts"]
                }
            },
            {
                test: {
                    name: "node-types",
                    environment: "node",
                    include: ["test/types/**/*.spec.ts"]
                }
            },
            {
                test: {
                    name: "browser",
                    include: ["test/web/**/*.spec.ts"],
                    setupFiles: ["test/web/setup.ts"],
                    browser: {
                        provider: playwright(),
                        enabled: true,
                        headless: true,
                        instances: [{ browser: "chromium" }],
                        screenshotFailures: false
                    }
                },
                define: {
                    TARGET: JSON.stringify("web")
                }
            }
        ]
    }
});
