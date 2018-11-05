const URL = require("url-parse");

function extractURLPath(fullURL) {
    const url = new URL(fullURL);
    let urlPath = url.pathname;
    if (urlPath.length <= 0) {
        urlPath = "/";
    }
    return normalisePath(urlPath);
}

function normaliseHREF(href) {
    const normalisedHref = href.replace(/^https?:\/\/[^\/]+/, "");
    return normalisedHref;
}

function normalisePath(pathStr) {
    let normalisedPath = pathStr;
    if (normalisedPath[0] !== "/") {
        normalisedPath = "/" + normalisedPath;
    }
    if (/^.+\/$/.test(normalisedPath)) {
        normalisedPath = normalisedPath.substr(0, normalisedPath.length - 1);
    }
    return decodeURIComponent(normalisedPath);
}

module.exports = {
    extractURLPath,
    normaliseHREF,
    normalisePath
};
