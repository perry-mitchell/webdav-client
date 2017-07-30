var path = require("path");

var xml2js = require("xml2js"),
    joinURL = require("url-join"),
    deepmerge = require("deepmerge");

var fetch = require("../request.js").fetch,
    responseHandlers = require("../response.js"),
    urlTools = require("../url.js"),
    davTools = require("./dav.js");

var getValueForKey = davTools.getValueForKey,
    getSingleValue = davTools.getSingleValue;

function getDirectoryContents(remotePath, options) {
    var fetchURL = joinURL(options.remoteURL, remotePath),
        fetchOptions = {
            method: "PROPFIND",
            headers: deepmerge(
                {
                    Depth: 1
                },
                options.headers
            )
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode)
        .then(function __handleResponseFormat(res) {
            return res.text();
        })
        .then(function __handleResponseParsing(body) {
            var parser = new xml2js.Parser({
                ignoreAttrs: true
            });
            return new Promise(function __parseXML(resolve, reject) {
                parser.parseString(body, function (err, result) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(getDirectoryFiles(result, options.remotePath));
                });
            });
        });
}

function getDirectoryFiles(result, serverBasePath) {
    var multiStatus = getValueForKey("multistatus", result),
        responseItems = getValueForKey("response", multiStatus);
    return responseItems
        .filter(function __filterResponseItem(item) {
            var href = getSingleValue(getValueForKey("href", item));
            href = urlTools.normalisePath(href);
            return href !== serverBasePath;
        })
        .map(function __mapResponseItem(item) {
            var href = getSingleValue(getValueForKey("href", item));
            href = decodeURI(href);
            href = urlTools.normalisePath(href);
            var propStat = getSingleValue(getValueForKey("propstat", item)),
                props = getSingleValue(getValueForKey("prop", propStat));
            var filename = serverBasePath === "/" ?
                href :
                urlTools.normalisePath(path.relative(serverBasePath, href));
            var lastMod = getSingleValue(getValueForKey("getlastmodified", props)),
                rawSize = getSingleValue(getValueForKey("getcontentlength", props)) || "0",
                resourceType = getSingleValue(getValueForKey("resourcetype", props)),
                type = getValueForKey("collection", resourceType) ?
                    "directory" :
                    "file";
            return {
                filename: filename,
                basename: path.basename(filename),
                lastmod: lastMod,
                size: parseInt(rawSize, 10),
                type: type
            };
        });
}

module.exports = {
    getDirectoryContents
};
