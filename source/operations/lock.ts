import nestedProp from "nested-property";
import { joinURL } from "../tools/url";
import { encodePath } from "../tools/path";
import { generateLockXML, parseGenericResponse } from "../tools/xml";
import { request, prepareRequestOptions } from "../request";
import { createErrorFromResponse, handleResponseCode } from "../response";
import {
    Headers,
    LockOptions,
    LockResponse,
    WebDAVClientContext,
    WebDAVMethodOptions
} from "../types";

const DEFAULT_TIMEOUT = "Infinite, Second-4100000000";

export async function lock(
    context: WebDAVClientContext,
    path: string,
    options: LockOptions = {}
): Promise<LockResponse> {
    const { refreshToken, timeout = DEFAULT_TIMEOUT } = options;
    const headers: Headers = {
        Timeout: timeout
    };
    if (refreshToken) {
        headers.If = refreshToken;
    }
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(path)),
            method: "LOCK",
            headers,
            data: generateLockXML(context.contactHref)
        },
        context,
        options
    );
    const response = await request(requestOptions);
    handleResponseCode(context, response);
    const lockPayload = parseGenericResponse(response.data as string);
    const token = nestedProp.get(lockPayload, "prop.lockdiscovery.activelock.locktoken.href");
    const serverTimeout = nestedProp.get(lockPayload, "prop.lockdiscovery.activelock.timeout");
    if (!token) {
        const err = createErrorFromResponse(response, "No lock token received: ");
        throw err;
    }
    return {
        token,
        serverTimeout
    };
}

export async function unlock(
    context: WebDAVClientContext,
    path: string,
    token: string,
    options: WebDAVMethodOptions = {}
): Promise<void> {
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(path)),
            method: "UNLOCK",
            headers: {
                "Lock-Token": token
            }
        },
        context,
        options
    );
    const response = await request(requestOptions);
    handleResponseCode(context, response);
    if (response.status !== 204 && response.status !== 200) {
        const err = createErrorFromResponse(response);
        throw err;
    }
}
