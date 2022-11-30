import { Layerr } from "layerr";
import { joinURL } from "../tools/url.js";
import { encodePath } from "../tools/path.js";
import { fromBase64 } from "../tools/encode.js";
import { isWeb } from "../compat/env.js";
import { request, prepareRequestOptions } from "../request.js";
import { handleResponseCode, processResponsePayload } from "../response.js";
import {
    AuthType,
    BufferLike,
    ErrorCode,
    GetFileContentsOptions,
    ResponseDataDetailed,
    WebDAVClientContext
} from "../types.js";

const TRANSFORM_RETAIN_FORMAT = (v: any) => v;

export async function getFileContents(
    context: WebDAVClientContext,
    filePath: string,
    options: GetFileContentsOptions = {}
): Promise<BufferLike | string | ResponseDataDetailed<BufferLike | string>> {
    const { format = "binary" } = options;
    if (format !== "binary" && format !== "text") {
        throw new Layerr(
            {
                info: {
                    code: ErrorCode.InvalidOutputFormat
                }
            },
            `Invalid output format: ${format}`
        );
    }
    return format === "text"
        ? getFileContentsString(context, filePath, options)
        : getFileContentsBuffer(context, filePath, options);
}

async function getFileContentsBuffer(
    context: WebDAVClientContext,
    filePath: string,
    options: GetFileContentsOptions = {}
): Promise<BufferLike | ResponseDataDetailed<BufferLike>> {
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(filePath)),
            method: "GET"
        },
        context,
        options
    );
    const response = await request(requestOptions);
    handleResponseCode(context, response);
    let body: BufferLike;
    if (isWeb()) {
        body = await response.arrayBuffer();
    } else {
        body = Buffer.from(await response.arrayBuffer());
    }
    return processResponsePayload(response, body, options.details);
}

async function getFileContentsString(
    context: WebDAVClientContext,
    filePath: string,
    options: GetFileContentsOptions = {}
): Promise<string | ResponseDataDetailed<string>> {
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(filePath)),
            method: "GET",
            headers: {
                Accept: "text/plain"
            },
            transformResponse: [TRANSFORM_RETAIN_FORMAT]
        },
        context,
        options
    );
    const response = await request(requestOptions);
    handleResponseCode(context, response);
    const body = await response.text();
    return processResponsePayload(response, body, options.details);
}

export function getFileDownloadLink(context: WebDAVClientContext, filePath: string): string {
    let url = joinURL(context.remoteURL, encodePath(filePath));
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
