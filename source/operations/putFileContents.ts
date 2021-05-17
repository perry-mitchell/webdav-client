import { Layerr } from "layerr";
import Stream from "stream";
import { fromBase64 } from "../tools/encode";
import { joinURL } from "../tools/url";
import { encodePath } from "../tools/path";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode } from "../response";
import { calculateDataLength } from "../tools/size";
import {
    AuthType,
    BufferLike,
    ErrorCode,
    Headers,
    PutFileContentsOptions,
    WebDAVClientContext,
    WebDAVClientError
} from "../types";

declare var WEB: boolean;

export async function putFileContents(
    context: WebDAVClientContext,
    filePath: string,
    data: string | BufferLike | Stream.Readable,
    options: PutFileContentsOptions = {}
): Promise<boolean> {
    const { contentLength = true, overwrite = true } = options;
    const headers: Headers = {
        "Content-Type": "application/octet-stream"
    };
    if (typeof WEB === "undefined" && data instanceof Stream.Readable) {
        // Skip, no content-length
    } else if (contentLength === false) {
        // Skip, disabled
    } else if (typeof contentLength === "number") {
        headers["Content-Length"] = `${contentLength}`;
    } else {
        headers["Content-Length"] = `${calculateDataLength(data as string | BufferLike)}`;
    }
    if (!overwrite) {
        headers["If-None-Match"] = "*";
    }
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(filePath)),
            method: "PUT",
            headers,
            data
        },
        context,
        options
    );
    const response = await request(requestOptions);
    try {
        handleResponseCode(context, response);
    } catch (err) {
        const error = err as WebDAVClientError;
        if (error.status === 412 && !overwrite) {
            return false;
        } else {
            throw error;
        }
    }
    return true;
}

export function getFileUploadLink(context: WebDAVClientContext, filePath: string): string {
    let url: string = `${joinURL(
        context.remoteURL,
        encodePath(filePath)
    )}?Content-Type=application/octet-stream`;
    const protocol = /^https:/i.test(url) ? "https" : "http";
    switch (context.authType) {
        case AuthType.None:
            // Do nothing
            break;
        case AuthType.Password: {
            const authPart = context.headers.Authorization.replace(/^Basic /i, "").trim();
            const authContents = fromBase64(authPart);
            url = url.replace(/^https?:\/\//, `${protocol}://${authContents}@`);
            break;
        }
        default:
            throw new Layerr(
                {
                    info: {
                        code: ErrorCode.LinkUnsupportedAuthType
                    }
                },
                `Unsupported auth type for file link: ${context.authType}`
            );
    }
    return url;
}
