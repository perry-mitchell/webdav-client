import minimatch from "minimatch";
import { convertResponseHeaders } from "./tools/headers.js";
import {
    FileStat,
    Response,
    ResponseDataDetailed,
    WebDAVClientContext,
    WebDAVClientError
} from "./types.js";

export function createErrorFromResponse(response: Response, prefix: string = ""): Error {
    const err: WebDAVClientError = new Error(
        `${prefix}Invalid response: ${response.status} ${response.statusText}`
    ) as WebDAVClientError;
    err.status = response.status;
    err.response = response;
    return err;
}

export function handleResponseCode(context: WebDAVClientContext, response: Response): Response {
    const { status } = response;
    if (status === 401 && context.digest) return response;
    if (status >= 400) {
        const err = createErrorFromResponse(response);
        throw err;
    }
    return response;
}

export function processGlobFilter(files: Array<FileStat>, glob: string): Array<FileStat> {
    return files.filter(file => minimatch(file.filename, glob, { matchBase: true }));
}

/**
 * Process a response payload (eg. from `customRequest`) and
 *  prepare it for further processing. Exposed for custom
 *  request handling.
 * @param response The response for a request
 * @param data The data returned
 * @param isDetailed Whether or not a detailed result is
 *  requested
 * @returns The response data, or a detailed response object
 *  if required
 */
export function processResponsePayload<T>(
    response: Response,
    data: T,
    isDetailed: boolean = false
): ResponseDataDetailed<T> | T {
    return isDetailed
        ? {
              data,
              headers: response.headers ? convertResponseHeaders(response.headers) : {},
              status: response.status,
              statusText: response.statusText
          }
        : data;
}
