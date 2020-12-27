export type AuthHeader = string;

export enum AuthType {
    Digest = "digest",
    None = "none",
    Password = "password",
    Token = "token"
}

export interface GetDirectoryContentsOptions {

}

export interface Headers {
    [key: string]: string;
}

export interface OAuthToken {
    access_token: string;
    token_type: string;
    refresh_token?: string
}

export interface WebDAVClient {
    
}

export interface WebDAVClientOptions {
    authType?: AuthType;
    digest?: boolean;
    headers?: Headers;
    httpAgent?: any;
    httpsAgent?: any;
    password?: string;
    token?: OAuthToken;
    username?: string;
}
