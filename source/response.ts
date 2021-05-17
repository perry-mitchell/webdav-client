import minimatch from "minimatch";
import { AxiosResponse } from "axios";
import { FileStat, Response, ResponseDataDetailed, WebDAVClientContext, WebDAVClientError } from "./types";

export function handleResponseCode(context: WebDAVClientContext, response: Response): Response {
    const status = response.status;
    if (status === 401 && context.digest) return response;
    if (status >= 400) {
        const err: WebDAVClientError = new Error(`Invalid response: ${status} ${response.statusText}`) as WebDAVClientError;
        err.status = status;
        err.response = response as AxiosResponse;
        throw err;
    }
    return response;
}

export function processGlobFilter(files: Array<FileStat>, glob: string): Array<FileStat> {
    return files.filter(file => minimatch(file.filename, glob, { matchBase: true }));
}

export function processResponsePayload<T>(response: Response, data: T, isDetailed: boolean = false): ResponseDataDetailed<T> | T {
    return isDetailed
        ? {
              data,
              headers: response.headers || {},
              status: response.status,
              statusText: response.statusText
          }
        : data;
}
