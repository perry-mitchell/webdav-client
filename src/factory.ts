import { extractURLPath } from "./tools/url";
import { getDirectoryContents } from "./operations/directoryContents";
import { AuthType, GetDirectoryContentsOptions, WebDAVClient, WebDAVClientContext, WebDAVClientOptions } from "./types";

export function createClient(remoteURL: string, options: WebDAVClientOptions = {}): WebDAVClient {
    const {
        authType = AuthType.Password,
        headers = {},
        httpAgent,
        httpsAgent,
        maxBodyLength,
        maxContentLength,
        password,
        token,
        username,
        withCredentials
    } = options;
    const context: WebDAVClientContext = {
        authType,
        headers: Object.assign({}, headers),
        httpAgent,
        httpsAgent,
        maxBodyLength,
        maxContentLength,
        remotePath: extractURLPath(remoteURL),
        remoteURL,
        password,
        token,
        username,
        withCredentials
    };
    return {
        getDirectoryContents: (path: string, options?: GetDirectoryContentsOptions) => getDirectoryContents(path, context, options)
    };
}
