import path from "path";
import { fileURLToPath } from "url";
import { rimraf } from "rimraf";
import copyDir from "copy-dir";
import { WEB_PORT } from "./server/credentials.js";
import { createWebDAVServer } from "./server/index.js";

(async () => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));

    rimraf.sync(path.resolve(dirname, "./testContents"));
    copyDir.sync(
        path.resolve(dirname, "./serverContents"),
        path.resolve(dirname, "./testContents")
    );

    const server = createWebDAVServer(WEB_PORT, "basic");
    server.start().then(() => {
        console.log("Server started");
    });

    process.on("SIGTERM", function () {
        server.stop();
        process.exit(0);
    });
    process.on("SIGINT", function () {
        server.stop();
        process.exit(0);
    });
})().catch(console.error);
