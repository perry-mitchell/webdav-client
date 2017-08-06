var URL = require("url-parse");

function extractURLPath(fullURL) {
    var url = new URL(fullURL),
        urlPath = url.pathname;
    if (urlPath.length <= 0) {
        urlPath = "/";
    }
    return normalisePath(urlPath);
}

function normaliseHREF(href) {
    var normalisedHref = href.replace(/^https?:\/\/[^\/]+/, "");
    return normalisedHref;
}

function normalisePath(pathStr) {
    var normalisedPath = pathStr;
    if (normalisedPath[0] !== "/") {
        normalisedPath = "/" + normalisedPath;
    }
    if (/^.+\/$/.test(normalisedPath)) {
        normalisedPath = normalisedPath.substr(0, normalisedPath.length - 1);
    }
    return normalisedPath;
}

module.exports = {
    extractURLPath: extractURLPath,
    normaliseHREF: normaliseHREF,
    normalisePath: normalisePath
};
