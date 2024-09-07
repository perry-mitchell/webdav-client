import { AxiosHeaders, AxiosResponse, AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import { Headers, Response } from "../types";

function convertAxiosHeaders(
    axiosHeaders: AxiosHeaders | RawAxiosResponseHeaders | AxiosResponseHeaders | undefined
): Headers {
    if (typeof axiosHeaders === "undefined") return {};
    return Object.keys(axiosHeaders).reduce((output: Headers, headerName: string) => {
        if (typeof axiosHeaders[headerName] === "string") {
            return { ...output, [headerName]: axiosHeaders[headerName] };
        } else if (Array.isArray(axiosHeaders[headerName])) {
            // Take the first only
            return { ...output, [headerName]: axiosHeaders[headerName][0] };
        } else if (typeof axiosHeaders[headerName] === "number") {
            return { ...output, [headerName]: `${axiosHeaders[headerName]}` };
        } else if (typeof axiosHeaders[headerName] === "boolean") {
            return { ...output, [headerName]: axiosHeaders[headerName].toString() };
        } else if (axiosHeaders[headerName] instanceof AxiosHeaders) {
            return {
                ...output,
                ...convertAxiosHeaders(axiosHeaders[headerName])
            };
        } else {
            throw new Error(
                `Invalid header value type: ${headerName}: ${typeof axiosHeaders[headerName]}`
            );
        }
    }, {});
}

export function mapAxiosResponseToInterface(axiosResponse: AxiosResponse<any, any>): Response {
    return {
        data: axiosResponse.data,
        status: axiosResponse.status,
        headers: convertAxiosHeaders(axiosResponse.headers),
        statusText: axiosResponse.statusText
    };
}
