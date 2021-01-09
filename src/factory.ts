import { extractURLPath } from "./tools/url";
import { setupAuth } from "./auth/index";
import { copyFile } from "./operations/copyFile";
import { createDirectory } from "./operations/createDirectory";
import { createReadStream, createWriteStream } from "./operations/createStream";
import { customRequest } from "./operations/customRequest";
import { deleteFile } from "./operations/deleteFile";
import { getDirectoryContents } from "./operations/directoryContents";
import { getStat } from "./operations/stat";
import {
    AuthType,
    CreateReadStreamOptions,
    CreateWriteStreamCallback,
    CreateWriteStreamOptions,
    GetDirectoryContentsOptions,
    RequestOptionsCustom,
    StatOptions,
    WebDAVClient,
    WebDAVClientContext,
    WebDAVClientOptions
} from "./types";

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
        copyFile: (filename: string, destination: string) => copyFile(context, filename, destination),
        createDirectory: (path: string) => createDirectory(context, path),
        createReadStream: (filename: string, options?: CreateReadStreamOptions) => createReadStream(context, filename, options),
        createWriteStream: (filename: string, options?: CreateWriteStreamOptions, callback?: CreateWriteStreamCallback) => createWriteStream(context, filename, options, callback),
        customRequest: (path: string, requestOptions: RequestOptionsCustom) => customRequest(context, path, requestOptions),
        deleteFile: (filename: string) => deleteFile(context, filename),
        getDirectoryContents: (path: string, options?: GetDirectoryContentsOptions) => getDirectoryContents(context, path, options),
        stat: (path: string, options?: StatOptions) => getStat(context, path, options)
    };
}
