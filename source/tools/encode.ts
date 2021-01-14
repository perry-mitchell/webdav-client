import { decode, encode } from "base-64";

declare var WEB: boolean;

export function decodeHTMLEntities(text: string): string {
    if (typeof WEB === "undefined") {
        // Node
        const he = require("he");
        return he.decode(text);
    } else {
        // Nasty browser way
        const txt = document.createElement("textarea");
        txt.innerHTML = text;
        return txt.value;
    }
}

export function fromBase64(text: string): string {
    return decode(text);
}

export function toBase64(text: string): string {
    return encode(text);
}
