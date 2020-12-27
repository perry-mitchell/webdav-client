import URL from "url-parse";
import _joinURL from "url-join";

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
            if (partIndex === 0 || nextPart !== "/" || (nextPart === "/" && output[output.length - 1] !== "/")) {
                output.push(nextPart);
            }
            return output;
        }, [])
    );
}

export function normaliseHREF(href: string): string {
    const normalisedHref = href.replace(/^https?:\/\/[^\/]+/, "");
    return normalisedHref;
}

export function normalisePath(pathStr: string): string {
    let normalisedPath = pathStr;
    if (normalisedPath[0] !== "/") {
        normalisedPath = "/" + normalisedPath;
    }
    if (/^.+\/$/.test(normalisedPath)) {
        normalisedPath = normalisedPath.substr(0, normalisedPath.length - 1);
    }
    return normalisedPath;
}
