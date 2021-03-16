import axios from "axios";
import { getPatcher } from "./compat/patcher";
import { generateDigestAuthHeader, parseDigestAuth } from "./auth/digest";
import { cloneShallow, merge } from "./tools/merge";
import { mergeHeaders } from "./tools/headers";
import {
    RequestOptionsCustom,
    RequestOptionsWithState,
    RequestOptions,
    Response,
    PutFileContentsOptions,
    WebDAVClientContext,
    WebDAVMethodOptions
} from "./types";

function _request(requestOptions: RequestOptions) {
    return getPatcher().patchInline("request", (options: RequestOptions) => axios(options as any), requestOptions);
}

export function prepareRequestOptions(
    requestOptions: RequestOptionsCustom | RequestOptionsWithState,
    context: WebDAVClientContext,
    userOptions: WebDAVMethodOptions
): RequestOptionsWithState {
    const finalOptions = cloneShallow(requestOptions) as RequestOptionsWithState;
    finalOptions.headers = mergeHeaders(
        context.headers,
        (finalOptions.headers || {}),
        (userOptions.headers || {})
    );
    if (typeof userOptions.data !== "undefined") {
        finalOptions.data = userOptions.data;
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
    if (context.maxContentLength) {
        finalOptions.maxContentLength = context.maxContentLength;
    }
    if (context.maxBodyLength) {
        finalOptions.maxBodyLength = context.maxBodyLength;
    }
    if (userOptions.hasOwnProperty('onUploadProgress')) {
        finalOptions.onUploadProgress = userOptions['onUploadProgress'];
    }
    // Take full control of all response status codes
    finalOptions.validateStatus = () => true;
    return finalOptions;
}

export function request(requestOptions: RequestOptionsWithState): Promise<Response> {
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

    // Perform the request and handle digest authentication
    return _request(requestOptions).then(function(response: Response) {
        if (response.status == 401) {
            _digest.hasDigestAuth = parseDigestAuth(response, _digest);

            if (_digest.hasDigestAuth) {
                requestOptions = merge(requestOptions, {
                    headers: {
                        Authorization: generateDigestAuthHeader(requestOptions, _digest)
                    }
                });

                return _request(requestOptions).then(function(response2: Response) {
                    if (response2.status == 401) {
                        _digest.hasDigestAuth = false;
                    } else {
                        _digest.nc++;
                    }
                    return response2;
                });
            }
        } else {
            _digest.nc++;
        }
        return response;
    });
}
