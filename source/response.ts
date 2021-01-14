import minimatch from "minimatch";
import { FileStat, Response, ResponseDataDetailed, WebDAVClientError } from "./types";

export function handleResponseCode(response: Response): Response {
    const status = response.status;
    let err: WebDAVClientError;
    if (status >= 400) {
        err = new Error(`Invalid response: ${status} ${response.statusText}`) as WebDAVClientError;
        err.status = status;
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
              headers: response.headers || {}
          }
        : data;
}
