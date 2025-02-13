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
import { getSearch } from "./operations/search.js";
import { moveFile } from "./operations/moveFile.js";
import { getFileUploadLink, putFileContents } from "./operations/putFileContents.js";
import { partialUpdateFileContents } from "./operations/partialUpdateFileContents.js";
import { getDAVCompliance } from "./operations/getDAVCompliance.js";
import {
    AuthType,
    BufferLike,
    CopyFileOptions,
    CreateReadStreamOptions,
    CreateWriteStreamCallback,
    CreateWriteStreamOptions,
    GetDirectoryContentsOptions,
    GetFileContentsOptions,
    GetQuotaOptions,
    Headers,
    LockOptions,
    MoveFileOptions,
    PutFileContentsOptions,
    RequestOptionsCustom,
    SearchOptions,
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
        remoteBasePath,
        contactHref = DEFAULT_CONTACT_HREF,
        ha1,
        headers = {},
        httpAgent,
        httpsAgent,
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
        remoteBasePath,
        contactHref,
        ha1,
        headers: Object.assign({}, headers),
        httpAgent,
        httpsAgent,
        password,
        parsing: {
            attributeNamePrefix: options.attributeNamePrefix ?? "@"
        },
        remotePath: extractURLPath(remoteURL),
        remoteURL,
        token,
        username,
        withCredentials
    };
    setupAuth(context, username, password, token, ha1);
    return {
        copyFile: (filename: string, destination: string, options?: CopyFileOptions) =>
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
        moveFile: (filename: string, destinationFilename: string, options?: MoveFileOptions) =>
            moveFile(context, filename, destinationFilename, options),
        putFileContents: (
            filename: string,
            data: string | BufferLike | Stream.Readable,
            options?: PutFileContentsOptions
        ) => putFileContents(context, filename, data, options),
        partialUpdateFileContents: (
            filePath: string,
            start: number,
            end: number,
            data: string | BufferLike | Stream.Readable,
            options?: WebDAVMethodOptions
        ) => partialUpdateFileContents(context, filePath, start, end, data, options),
        getDAVCompliance: (path: string) => getDAVCompliance(context, path),
        search: (path: string, options?: SearchOptions) => getSearch(context, path, options),
        setHeaders: (headers: Headers) => {
            context.headers = Object.assign({}, headers);
        },
        stat: (path: string, options?: StatOptions) => getStat(context, path, options),
        unlock: (path: string, token: string, options?: WebDAVMethodOptions) =>
            unlock(context, path, token, options)
    };
}
