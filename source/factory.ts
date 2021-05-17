import Stream from "stream";
import { extractURLPath } from "./tools/url";
import { setupAuth } from "./auth/index";
import { copyFile } from "./operations/copyFile";
import { createDirectory } from "./operations/createDirectory";
import { createReadStream, createWriteStream } from "./operations/createStream";
import { customRequest } from "./operations/customRequest";
import { deleteFile } from "./operations/deleteFile";
import { exists } from "./operations/exists";
import { getDirectoryContents } from "./operations/directoryContents";
import { getFileContents, getFileDownloadLink } from "./operations/getFileContents";
import { getQuota } from "./operations/getQuota";
import { getStat } from "./operations/stat";
import { moveFile } from "./operations/moveFile";
import { getFileUploadLink, putFileContents } from "./operations/putFileContents";
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
    PutFileContentsOptions,
    RequestOptionsCustom,
    StatOptions,
    WebDAVClient,
    WebDAVClientContext,
    WebDAVClientOptions,
    WebDAVMethodOptions
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
        stat: (path: string, options?: StatOptions) => getStat(context, path, options)
    };
}
