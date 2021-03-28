import { joinURL } from "../tools/url";
import { encodePath, getAllDirectories, normalisePath } from "../tools/path";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode } from "../response";
import { getStat } from "./stat";
import { CreateDirectoryOptions, FileStat, WebDAVClientContext, WebDAVClientError } from "../types";

export async function createDirectory(
    context: WebDAVClientContext,
    dirPath: string,
    options: CreateDirectoryOptions = {}
): Promise<void> {
    if (options.recursive === true) return createDirectoryRecursively(context, dirPath, options);
    const requestOptions = prepareRequestOptions({
        url: joinURL(context.remoteURL, encodePath(dirPath)),
        method: "MKCOL"
    }, context, options);
    const response = await request(requestOptions);
    handleResponseCode(context, response);
}

async function createDirectoryRecursively(
    context: WebDAVClientContext,
    dirPath: string,
    options: CreateDirectoryOptions = {}
): Promise<void> {
    const paths = getAllDirectories(normalisePath(dirPath));
    paths.sort((a, b) => {
        if (a.length > b.length) {
            return 1;
        } else if (b.length > a.length) {
            return -1;
        }
        return 0;
    });
    let creating: boolean = false;
    for (const testPath of paths) {
        if (creating) {
            await createDirectory(context, testPath, {
                ...options,
                recursive: false
            });
            continue;
        }
        try {
            const testStat = await getStat(context, testPath) as FileStat;
            if (testStat.type !== "directory") {
                throw new Error(`Path includes a file: ${dirPath}`);
            }
        } catch (err) {
            const error = err as WebDAVClientError;
            if (error.status === 404) {
                creating = true;
                await createDirectory(context, testPath, {
                    ...options,
                    recursive: false
                });
            } else {
                throw err;
            }
        }
    }
}
