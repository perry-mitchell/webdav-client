import { toBase64 } from "../tools/encode.js";
import { AuthHeader } from "../types.js";

export function generateBasicAuthHeader(username: string, password: string): AuthHeader {
    const encoded = toBase64(`${username}:${password}`);
    return `Basic ${encoded}`;
}
