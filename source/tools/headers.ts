import { Headers as HeadersSimple, HeadersLike } from "../types.js";

export function convertResponseHeaders(headers: HeadersLike): HeadersSimple {
    const output: HeadersSimple = {};
    headers.forEach((value, key) => {
        output[key] = value;
    });
    return output;
}

export function mergeHeaders(...headerPayloads: HeadersSimple[]): HeadersSimple {
    if (headerPayloads.length === 0) return {};
    const headerKeys: Record<string, string> = {};
    return headerPayloads.reduce((output: HeadersSimple, headers: HeadersSimple) => {
        Object.keys(headers).forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (headerKeys.hasOwnProperty(lowerHeader)) {
                output[headerKeys[lowerHeader]] = headers[header];
            } else {
                headerKeys[lowerHeader] = header;
                output[header] = headers[header];
            }
        });
        return output;
    }, {});
}
