import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        fileParallelism: false,
        include: [
            "test/node/operations/copyFile.spec.ts",
            "test/node/operations/createDirectory.spec.ts",
            "test/node/operations/createReadStream.spec.ts",
            "test/node/operations/createWriteStream.spec.ts",
            "test/node/operations/customRequest.spec.ts",
            "test/node/operations/deleteFile.spec.ts",
            "test/node/operations/exists.spec.ts",
            "test/node/operations/getDirectoryContents.spec.ts",
            "test/node/operations/getFileContents.spec.ts",
            "test/node/operations/getFileDownloadLink.spec.ts",
            "test/node/operations/getFileUploadLink.spec.ts",
            "test/node/operations/getQuota.spec.ts",
            "test/node/operations/lock.spec.ts",
            "test/node/operations/moveFile.spec.ts",
            "test/node/operations/partialUpdateFileContents.spec.ts",
            "test/node/operations/putFileContents.spec.ts",
            "test/node/operations/search.spec.ts",
            "test/node/operations/stat.spec.ts",
            // "test/node/**/*.spec.ts"
        ]
    },
});
