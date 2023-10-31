import { Layerr } from "layerr";
import _joinURL from "url-join";
import { normalisePath } from "./path.js";

export function extractURLPath(fullURL: string): string {
    const url = new URL(fullURL);
    let urlPath = url.pathname;
    if (urlPath.length <= 0) {
        urlPath = "/";
    }
    return normalisePath(urlPath);
}

export function joinURL(...parts: Array<string>): string {
    return _joinURL(
        parts.reduce((output, nextPart, partIndex) => {
            if (
                partIndex === 0 ||
                nextPart !== "/" ||
                (nextPart === "/" && output[output.length - 1] !== "/")
            ) {
                output.push(nextPart);
            }
            return output;
        }, [])
    );
}

export function normaliseHREF(href: string): string {
    try {
        const normalisedHref = href.replace(/^https?:\/\/[^\/]+/, "");
        return normalisedHref;
    } catch (err) {
        throw new Layerr(err, "Failed normalising HREF");
    }
}
