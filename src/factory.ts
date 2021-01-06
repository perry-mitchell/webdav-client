import { extractURLPath } from "./tools/url";
import { getDirectoryContents } from "./operations/directoryContents";
import { setupAuth } from "./auth/index";
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
    setupAuth(context, username, password, token);
    return {
        getDirectoryContents: (path: string, options?: GetDirectoryContentsOptions) => getDirectoryContents(path, context, options)
    };
}
