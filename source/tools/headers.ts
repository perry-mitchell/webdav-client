import { Headers } from "../types.js";

export function mergeHeaders(...headerPayloads: Headers[]): Headers {
    if (headerPayloads.length === 0) return {};
    const headerKeys = {};
    return headerPayloads.reduce((output: Headers, headers: Headers) => {
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
