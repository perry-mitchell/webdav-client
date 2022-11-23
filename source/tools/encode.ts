import base64 from "base-64";
import he from "he";

declare var WEB: boolean;

export function decodeHTMLEntities(text: string): string {
    if (typeof WEB === "undefined") {
        // Node
        return he.decode(text);
    } else {
        // Nasty browser way
        const txt = document.createElement("textarea");
        txt.innerHTML = text;
        return txt.value;
    }
}

export function fromBase64(text: string): string {
    return base64.decode(text);
}

export function toBase64(text: string): string {
    return base64.encode(text);
}
