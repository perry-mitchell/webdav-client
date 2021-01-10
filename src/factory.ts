import { extractURLPath } from "./tools/url";
import { setupAuth } from "./auth/index";
import { copyFile } from "./operations/copyFile";
import { createDirectory } from "./operations/createDirectory";
import { createReadStream, createWriteStream } from "./operations/createStream";
import { customRequest } from "./operations/customRequest";
import { deleteFile } from "./operations/deleteFile";
import { exists } from "./operations/exists";
import { getDirectoryContents } from "./operations/directoryContents";
import { getFileContents, getFileLink } from "./operations/getFile";
import { getStat } from "./operations/stat";
import { moveFile } from "./operations/moveFile";
import {
    AuthType,
    CreateReadStreamOptions,
    CreateWriteStreamCallback,
    CreateWriteStreamOptions,
    GetDirectoryContentsOptions,
    GetFileContentsOptions,
    RequestOptionsCustom,
    StatOptions,
    WebDAVClient,
    WebDAVClientContext,
    WebDAVClientOptions
} from "./types";

export function createClient(remoteURL: string, options: WebDAVClientOptions = {}): WebDAVClient {
    const {
        authType: authTypeRaw = null,
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
    let authType = authTypeRaw;
    if (!authType) {
        authType = username || password ? AuthType.Password : AuthType.None;
    }
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
        exists: (path: string) => exists(context, path),
        getDirectoryContents: (path: string, options?: GetDirectoryContentsOptions) => getDirectoryContents(context, path, options),
        getFileContents: (filename: string, options?: GetFileContentsOptions) => getFileContents(context, filename, options),
        getFileDownloadLink: (filename: string) => getFileLink(context, filename),
        moveFile: (filename: string, destinationFilename: string) => moveFile(context, filename, destinationFilename),
        stat: (path: string, options?: StatOptions) => getStat(context, path, options)
    };
}
