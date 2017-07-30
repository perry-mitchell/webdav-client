var URL = require("url-parse");

function extractURLPath(fullURL) {
    var url = new URL(fullURL),
        urlPath = url.pathname;
    if (urlPath.length <= 0) {
        urlPath = "/";
    }
    return normalisePath(urlPath);
}

function normalisePath(pathStr) {
    if (pathStr[0] !== "/") {
        pathStr = "/" + pathStr;
    }
    if (/^.+\/$/.test(pathStr)) {
        pathStr = pathStr.substr(0, pathStr.length - 1);
    }
    return pathStr;
}

module.exports = {
    extractURLPath: extractURLPath,
    normalisePath: normalisePath
};
