import { Agent as HTTPAgent } from "http";
import { Agent as HTTPSAgent } from "https";
import { fetch } from "@buttercup/fetch";
import type { RequestInit as RequestInitNF } from "node-fetch";
import { getPatcher } from "./compat/patcher.js";
import { isWeb } from "./compat/env.js";
import { generateDigestAuthHeader, parseDigestAuth } from "./auth/digest.js";
import { cloneShallow, merge } from "./tools/merge.js";
import { mergeHeaders } from "./tools/headers.js";
import { requestDataToFetchBody } from "./tools/body.js";
import {
    Headers,
    RequestOptionsCustom,
    RequestOptionsWithState,
    RequestOptions,
    Response,
    WebDAVClientContext,
    WebDAVMethodOptions
} from "./types.js";

function _request(requestOptions: RequestOptions): Promise<Response> {
    const patcher = getPatcher();
    return patcher.patchInline(
        "request",
        (options: RequestOptions) =>
            patcher.patchInline(
                "fetch",
                fetch,
                options.url,
                getFetchOptions(options) as RequestInit
            ),
        requestOptions
    );
}

function getFetchOptions(requestOptions: RequestOptions): RequestInit | RequestInitNF {
    let headers: Headers = {};
    // Handle standard options
    const opts: RequestInit | RequestInitNF = {
        method: requestOptions.method
    };
    if (requestOptions.headers) {
        headers = mergeHeaders(headers, requestOptions.headers);
    }
    if (typeof requestOptions.data !== "undefined") {
        const [body, newHeaders] = requestDataToFetchBody(requestOptions.data);
        opts.body = body;
        headers = mergeHeaders(headers, newHeaders);
    }
    if (requestOptions.signal) {
        opts.signal = requestOptions.signal;
    }
    if (requestOptions.withCredentials) {
        (opts as RequestInit).credentials = "include";
    }
    // Check for node-specific options
    if (!isWeb()) {
        if (requestOptions.httpAgent || requestOptions.httpsAgent) {
            (opts as RequestInitNF).agent = (parsedURL: URL) => {
                if (parsedURL.protocol === "http:") {
                    return requestOptions.httpAgent || new HTTPAgent();
                }
                return requestOptions.httpsAgent || new HTTPSAgent();
            };
        }
    }
    // Attach headers
    opts.headers = headers;
    return opts;
}

export function prepareRequestOptions(
    requestOptions: RequestOptionsCustom | RequestOptionsWithState,
    context: WebDAVClientContext,
    userOptions: WebDAVMethodOptions
): RequestOptionsWithState {
    const finalOptions = cloneShallow(requestOptions) as RequestOptionsWithState;
    finalOptions.headers = mergeHeaders(
        context.headers,
        finalOptions.headers || {},
        userOptions.headers || {}
    );
    if (typeof userOptions.data !== "undefined") {
        finalOptions.data = userOptions.data;
    }
    if (userOptions.signal) {
        finalOptions.signal = userOptions.signal;
    }
    if (context.httpAgent) {
        finalOptions.httpAgent = context.httpAgent;
    }
    if (context.httpsAgent) {
        finalOptions.httpsAgent = context.httpsAgent;
    }
    if (context.digest) {
        finalOptions._digest = context.digest;
    }
    if (typeof context.withCredentials === "boolean") {
        finalOptions.withCredentials = context.withCredentials;
    }
    return finalOptions;
}

export async function request(requestOptions: RequestOptionsWithState): Promise<Response> {
    // Client not configured for digest authentication
    if (!requestOptions._digest) {
        return _request(requestOptions);
    }
    // Remove client's digest authentication object from request options
    const _digest = requestOptions._digest;
    delete requestOptions._digest;
    // If client is already using digest authentication, include the digest authorization header
    if (_digest.hasDigestAuth) {
        requestOptions = merge(requestOptions, {
            headers: {
                Authorization: generateDigestAuthHeader(requestOptions, _digest)
            }
        });
    }
    // Perform digest request + check
    const response = await _request(requestOptions);
    if (response.status == 401) {
        _digest.hasDigestAuth = parseDigestAuth(response, _digest);
        if (_digest.hasDigestAuth) {
            requestOptions = merge(requestOptions, {
                headers: {
                    Authorization: generateDigestAuthHeader(requestOptions, _digest)
                }
            });
            const response2 = await _request(requestOptions);
            if (response2.status == 401) {
                _digest.hasDigestAuth = false;
            } else {
                _digest.nc++;
            }
            return response2;
        }
    } else {
        _digest.nc++;
    }
    return response;
}
