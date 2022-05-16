import { Layerr } from "layerr";
import { byteLength } from "byte-length";
import { isArrayBuffer } from "../compat/arrayBuffer";
import { isBuffer } from "../compat/buffer";
import { BufferLike, ErrorCode } from "../types";

export function calculateDataLength(data: string | BufferLike): number {
    if (isArrayBuffer(data)) {
        return (<ArrayBuffer>data).byteLength;
    } else if (isBuffer(data)) {
        return (<Buffer>data).length;
    } else if (typeof data === "string") {
        return byteLength(<string>data);
    }
    throw new Layerr(
        {
            info: {
                code: ErrorCode.DataTypeNoLength
            }
        },
        "Cannot calculate data length: Invalid type"
    );
}
