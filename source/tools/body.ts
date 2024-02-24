import Stream from "stream";
import { isArrayBuffer } from "../compat/arrayBuffer.js";
import { isBuffer } from "../compat/buffer.js";
import { isReactNative, isWeb } from "../compat/env.js";
import { Headers, RequestDataPayload } from "../types.js";

export function requestDataToFetchBody(data: RequestDataPayload): [BodyInit, Headers] {
    if (!isWeb() && !isReactNative() && data instanceof Stream.Readable) {
        // @ts-ignore
        return [data, {}];
    }
    if (typeof data === "string") {
        return [data, {}];
    } else if (isBuffer(data)) {
        return [data as Buffer, {}];
    } else if (isArrayBuffer(data)) {
        return [data as ArrayBuffer, {}];
    } else if (data && typeof data === "object") {
        return [
            JSON.stringify(data as Record<string, any>),
            {
                "content-type": "application/json"
            }
        ];
    }
    throw new Error(`Unable to convert request body: Unexpected body type: ${typeof data}`);
}
