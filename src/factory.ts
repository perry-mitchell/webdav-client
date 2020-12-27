import { extractURLPath } from "./tools/url";
import { Headers, WebDAVClient, WebDAVClientOptions } from "./types";

interface WebDAVClientContext {
    headers: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    remotePath: string;
    remoteURL: string;
}

export function createClient(remoteURL: string, options: WebDAVClientOptions = {}): WebDAVClient {
    const {
        headers = {}
    } = options;
    const context: WebDAVClientContext = {
        headers: Object.assign({}, headers),
        remotePath: extractURLPath(remoteURL),
        remoteURL,
    };
    return {};
}
