import axios from "axios";
import { getPatcher } from "./compat/patcher";
import { generateDigestAuthHeader, parseDigestAuth } from "./auth/digest";
import { cloneShallow, merge } from "./tools/merge";
import { RequestOptions, RequestOptionsInternal, Response, WebDAVClientContext } from "./types";

function _request(requestOptions: RequestOptionsInternal) {
    return getPatcher().patchInline("request", (options: RequestOptionsInternal) => axios(options as any), requestOptions);
}

export function prepareRequestOptions(requestOptions: RequestOptions, context: WebDAVClientContext): RequestOptions {
    const finalOptions: RequestOptions = cloneShallow(requestOptions);
    finalOptions.headers = {
        ...context.headers,
        ...(finalOptions.headers || {})
    };
    if (context.httpAgent) {
        finalOptions.httpAgent = context.httpAgent;
    }
    if (context.httpsAgent) {
        finalOptions.httpsAgent = context.httpsAgent;
    }
    if (context.digest) {
        finalOptions._digest = context.digest;
        finalOptions.validateStatus = status => (status >= 200 && status < 300) || status == 401;
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
    return finalOptions;
}

export function request(requestOptions: RequestOptions): Promise<Response> {
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
