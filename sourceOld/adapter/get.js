var xml2js = require("xml2js"),
    deepmerge = require("deepmerge");

var Stream = require("stream"),
    ReadableStream = Stream.Readable,
    PassThroughStream = Stream.PassThrough;

var fetch = require("./request.js").fetch,
    parsing = require("./parse.js"),
    responseHandlers = require("./response.js");

function getFileStream(url, filePath, options) {
    options = deepmerge({ headers: {} }, options || {});
    if (typeof options.range === "object" && typeof options.range.start === "number") {
        var rangeHeader = "bytes=" + options.range.start + "-";
        if (typeof options.range.end === "number") {
            rangeHeader += options.range.end;
        }
        options.headers.Range = rangeHeader;
    }
    return fetch(url + filePath, {
            method: "GET",
            headers: options.headers
        })
        .then(responseHandlers.handleResponseCode)
        .then(function(res) {
            return res.body;
        });
}

function parseXMLBody(body) {
    var parser = new xml2js.Parser({ ignoreAttrs: true });
    return new Promise(function(resolve, reject) {
        parser.parseString(body, function (err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });
}

function toText(res) {
    return res.text();
}

module.exports = {

    createReadStream: function createReadStream(url, filePath, options) {
        var outStream = new PassThroughStream();
        getFileStream(url, filePath, options)
            .then(function __handleStream(stream) {
                stream.pipe(outStream);
            })
            .catch(function __handleReadError(err) {
                outStream.emit("error", err);
            });
        return outStream;
    },

    getDirectoryContents: function getDirectoryContents(url, dirPath, options) {
        dirPath = dirPath || "/";
        options = deepmerge({ headers: {} }, options || {});
        var fetchURL = url + dirPath;
        return fetch(
                fetchURL,
                {
                    method: "PROPFIND",
                    headers: deepmerge(
                        {
                            Depth: 1
                        },
                        options.headers
                    )
                }
            )
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.text();
            })
            .then(function(body) {
                var parser = new xml2js.Parser({
                    ignoreAttrs: true
                });
                return new Promise(function(resolve, reject) {
                    parser.parseString(body, function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(parsing.parseDirectoryLookup(dirPath, result));
                        }
                    });
                });
            });
    },

    getFileContents: function getFileContents(url, filePath, options) {
        options = deepmerge({ headers: {} }, options || {});
        return fetch(url + filePath, {
                method: "GET",
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.buffer();
            });
    },

    getQuota: function getQuota(url, options) {
        options = deepmerge({ headers: {} }, options || {});
        return fetch(url + "/", {
                method: "PROPFIND",
                headers: deepmerge(
                    { Depth: 0 },
                    options.headers
                )
            })
            .then(responseHandlers.handleResponseCode)
            .then(toText)
            .then(parseXMLBody)
            .then(function __processStats(result) {
                return parsing.processQuota(result);
            });
    },

    getStat: function getStat(url, itemPath, options) {
        options = deepmerge({ headers: {} }, options || {});
        return fetch(url + itemPath, {
                method: "PROPFIND",
                headers: deepmerge(
                    { Depth: 0 },
                    options.headers
                )
            })
            .then(responseHandlers.handleResponseCode)
            .then(toText)
            .then(parseXMLBody)
            .then(function __processStats(result) {
                var targetPath = itemPath.replace(/^\//, "");
                return parsing.parseDirectoryLookup(targetPath, result, true);
            })
            .then(function(stats) {
                return stats.shift();
            });
    },

    getTextContents: function getTextContents(url, filePath, options) {
        options = deepmerge({ headers: {} }, options || {});
        return fetch(url + filePath, {
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.text();
            });
    }

};
