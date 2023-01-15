import Stream from "stream";
import { extractURLPath } from "./tools/url.js";
import { setupAuth } from "./auth/index.js";
import { copyFile } from "./operations/copyFile.js";
import { createDirectory } from "./operations/createDirectory.js";
import { createReadStream, createWriteStream } from "./operations/createStream.js";
import { customRequest } from "./operations/customRequest.js";
import { deleteFile } from "./operations/deleteFile.js";
import { exists } from "./operations/exists.js";
import { getDirectoryContents } from "./operations/directoryContents.js";
import { getFileContents, getFileDownloadLink } from "./operations/getFileContents.js";
import { lock, unlock } from "./operations/lock.js";
import { getQuota } from "./operations/getQuota.js";
import { getStat } from "./operations/stat.js";
import { moveFile } from "./operations/moveFile.js";
import { getFileUploadLink, putFileContents } from "./operations/putFileContents.js";
import {
    AuthType,
    BufferLike,
    CreateReadStreamOptions,
    CreateWriteStreamCallback,
    CreateWriteStreamOptions,
    GetDirectoryContentsOptions,
    GetFileContentsOptions,
    GetQuotaOptions,
    Headers,
    LockOptions,
    PutFileContentsOptions,
    RequestOptionsCustom,
    StatOptions,
    WebDAVClient,
    WebDAVClientContext,
    WebDAVClientOptions,
    WebDAVMethodOptions
} from "./types.js";

const DEFAULT_CONTACT_HREF =
    "https://github.com/perry-mitchell/webdav-client/blob/master/LOCK_CONTACT.md";

export function createClient(remoteURL: string, options: WebDAVClientOptions = {}): WebDAVClient {
    const {
        authType: authTypeRaw = null,
        contactHref = DEFAULT_CONTACT_HREF,
        headers = {},
        httpAgent,
        httpsAgent,
        password,
        token,
        username,
        withCredentials,
        ha1
    } = options;
    let authType = authTypeRaw;
    if (!authType) {
        authType = username || password ? AuthType.Password : AuthType.None;
    }
    const context: WebDAVClientContext = {
        authType,
        contactHref,
        headers: Object.assign({}, headers),
        httpAgent,
        httpsAgent,
        remotePath: extractURLPath(remoteURL),
        remoteURL,
        password,
        token,
        username,
        withCredentials,
        ha1
    };
    setupAuth(context, username, password, token, ha1);
    return {
        copyFile: (filename: string, destination: string, options?: WebDAVMethodOptions) =>
            copyFile(context, filename, destination, options),
        createDirectory: (path: string, options?: WebDAVMethodOptions) =>
            createDirectory(context, path, options),
        createReadStream: (filename: string, options?: CreateReadStreamOptions) =>
            createReadStream(context, filename, options),
        createWriteStream: (
            filename: string,
            options?: CreateWriteStreamOptions,
            callback?: CreateWriteStreamCallback
        ) => createWriteStream(context, filename, options, callback),
        customRequest: (path: string, requestOptions: RequestOptionsCustom) =>
            customRequest(context, path, requestOptions),
        deleteFile: (filename: string, options?: WebDAVMethodOptions) =>
            deleteFile(context, filename, options),
        exists: (path: string, options?: WebDAVMethodOptions) => exists(context, path, options),
        getDirectoryContents: (path: string, options?: GetDirectoryContentsOptions) =>
            getDirectoryContents(context, path, options),
        getFileContents: (filename: string, options?: GetFileContentsOptions) =>
            getFileContents(context, filename, options),
        getFileDownloadLink: (filename: string) => getFileDownloadLink(context, filename),
        getFileUploadLink: (filename: string) => getFileUploadLink(context, filename),
        getHeaders: () => Object.assign({}, context.headers),
        getQuota: (options?: GetQuotaOptions) => getQuota(context, options),
        lock: (path: string, options?: LockOptions) => lock(context, path, options),
        moveFile: (filename: string, destinationFilename: string, options?: WebDAVMethodOptions) =>
            moveFile(context, filename, destinationFilename, options),
        putFileContents: (
            filename: string,
            data: string | BufferLike | Stream.Readable,
            options?: PutFileContentsOptions
        ) => putFileContents(context, filename, data, options),
        setHeaders: (headers: Headers) => {
            context.headers = Object.assign({}, headers);
        },
        stat: (path: string, options?: StatOptions) => getStat(context, path, options),
        unlock: (path: string, token: string, options?: WebDAVMethodOptions) =>
            unlock(context, path, token, options)
    };
}
