import Stream from "stream";

export type AuthHeader = string;

export enum AuthType {
    Digest = "digest",
    None = "none",
    Password = "password",
    Token = "token"
}

export type BufferLike = Buffer | ArrayBuffer;

export interface CreateReadStreamOptions {
    range?: {
        start: number;
        end?: number;
    }
}

export type CreateWriteStreamCallback = () => any;

export interface CreateWriteStreamOptions {
    overwrite?: boolean;
}

export interface DAVResultResponse {
    href: string;
    propstat: {
        prop: DAVResultResponseProps;
    }
}

export interface DAVResultResponseProps {
    displayname: string;
    resourcetype: {
        collection?: boolean;
    };
    getlastmodified?: string;
    getetag?: string;
    getcontentlength?: string;
    getcontenttype?: string;
    "quota-available-bytes"?: any;
    "quota-used-bytes"?: string;
}

export interface DAVResult {
    multistatus: {
        response: Array<DAVResultResponse>;
    }
}

export interface DAVResultRawMultistatus {
    response: DAVResultResponse | [DAVResultResponse];
}

export interface DAVResultRaw {
    multistatus: "" | DAVResultRawMultistatus | [DAVResultRawMultistatus];
}

export interface DigestContext {
    username: string;
    password: string;
    nc: number;
    algorithm: string;
    hasDigestAuth: boolean;
    cnonce?: string;
    nonce?: string;
    realm?: string;
    qop?: string;
    opaque?: string;
}

export interface DiskQuota {
    used: number;
    available: DiskQuotaAvailable;
}

export type DiskQuotaAvailable = "unknown" | "unlimited" | number;

export enum ErrorCode {
    DataTypeNoLength = "data-type-no-length",
    InvalidAuthType = "invalid-auth-type",
    InvalidOutputFormat = "invalid-output-format",
    LinkUnsupportedAuthType = "link-unsupported-auth"
}

export interface FileStat {
    filename: string;
    basename: string;
    lastmod: string;
    size: number;
    type: "file" | "directory";
    etag: string | null;
    mime?: string;
    props?: DAVResultResponseProps;
}

export interface GetDirectoryContentsOptions {
    deep?: boolean;
    details?: boolean;
    glob?: string;
}

export interface GetFileContentsOptions {
    details?: boolean;
    format?: "binary" | "text";
}

export interface GetQuotaOptions {
    details?: boolean;
}

export interface Headers {
    [key: string]: string;
}

export interface OAuthToken {
    access_token: string;
    token_type: string;
    refresh_token?: string
}

export interface PutFileContentsOptions {
    contentLength?: boolean | number;
    overwrite?: boolean;
}

export type RequestDataPayload = string | Buffer | ArrayBuffer | { [key: string]: any; };

interface RequestOptionsBase {
    data?: RequestDataPayload;
    headers?: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    maxBodyLength?: number;
    maxContentLength?: number;
    maxRedirects?: number;
    method: string;
    onUploadProgress?: UploadProgressCallback;
    responseType?: string;
    url?: string;
    validateStatus?: (status: number) => boolean;
    withCredentials?: boolean;
}

export interface RequestOptionsCustom extends RequestOptionsBase {}

export interface RequestOptions extends RequestOptionsBase {
    url: string;
}

export interface RequestOptionsWithState extends RequestOptions {
    _digest?: DigestContext;
}

export interface Response {
    data: ResponseData;
    status: number;
    headers: Headers;
    statusText: string;
}

export type ResponseData = string | Buffer | ArrayBuffer | Object | Array<any>;

export interface ResponseDataDetailed<T> {
    data: T;
    headers: Headers;
}

export interface ResponseStatusValidator {
    (status: number): boolean;
}

export interface StatOptions {
    details?: boolean;
}

export interface UploadProgress {
    loaded: number;
    total: number;
}

export interface UploadProgressCallback {
    (progress: UploadProgress): void;
}

export interface WebDAVClient {
    copyFile: (filename: string, destination: string) => Promise<void>;
    createDirectory: (path: string) => Promise<void>;
    createReadStream: (filename: string, options?: CreateReadStreamOptions) => Stream.Readable;
    createWriteStream: (filename: string, options?: CreateWriteStreamOptions, callback?: CreateWriteStreamCallback) => Stream.Writable;
    customRequest: (path: string, requestOptions: RequestOptionsCustom) => Promise<Response>;
    deleteFile: (filename: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    getDirectoryContents: (path: string, options?: GetDirectoryContentsOptions) => Promise<Array<FileStat> | ResponseDataDetailed<Array<FileStat>>>;
    getFileContents: (filename: string, options?: GetFileContentsOptions) => Promise<BufferLike | string | ResponseDataDetailed<BufferLike | string>>;
    getFileDownloadLink: (filename: string) => string;
    getFileUploadLink: (filename: string) => string;
    getQuota: (options?: GetQuotaOptions) => Promise<DiskQuota | null | ResponseDataDetailed<DiskQuota | null>>;
    moveFile: (filename: string, destinationFilename: string) => Promise<void>;
    putFileContents: (filename: string, data: string | BufferLike | Stream.Readable, options?: PutFileContentsOptions) => Promise<void>;
    stat: (path: string, options?: StatOptions) => Promise<FileStat | ResponseDataDetailed<FileStat>>;
    setHeaders: (headers: Headers) => void;
    getHeaders: (key: string) => Headers;
}

export interface WebDAVClientContext {
    authType: AuthType;
    digest?: DigestContext;
    headers: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    maxBodyLength?: number;
    maxContentLength?: number;
    password?: string;
    remotePath: string;
    remoteURL: string;
    token?: OAuthToken;
    username?: string;
    withCredentials?: boolean;
}

export interface WebDAVClientError extends Error {
    status?: number;
}

export interface WebDAVClientOptions {
    authType?: AuthType;
    headers?: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    maxBodyLength?: number;
    maxContentLength?: number;
    password?: string;
    token?: OAuthToken;
    username?: string;
    withCredentials?: boolean;
}
