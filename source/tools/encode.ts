import base64 from "base-64";
import { decodeHTML } from "entities";
import { isWeb } from "../compat/env.js";

export function decodeHTMLEntities(text: string): string {
    if (isWeb()) {
        const txt = document.createElement("textarea");
        txt.innerHTML = text;
        return txt.value;
    }
    return decodeHTML(text);
}

export function fromBase64(text: string): string {
    return base64.decode(text);
}

export function toBase64(text: string): string {
    return base64.encode(text);
}
