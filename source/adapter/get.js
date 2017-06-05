var xml2js = require("xml2js"),
    deepmerge = require("deepmerge");

var Stream = require("stream"),
    ReadableStream = Stream.Readable,
    PassThroughStream = Stream.PassThrough;

var fetch = require("./request.js"),
    parsing = require("./parse.js"),
    responseHandlers = require("./response.js");

var adapter = module.exports = {

    createReadStream: function createReadStream(url, filePath, options) {
        var outStream = new PassThroughStream();
        adapter
            .getFileStream(url, filePath, options)
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
        options = options || { headers: {} };
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
        options = options || { headers: {} };
        return fetch(url + filePath, {
                method: "GET",
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.buffer();
            });
    },

    getFileStream: function getFileStream(url, filePath, options) {
        options = options || { headers: {} };
        return fetch(url + filePath, {
                method: "GET",
                headers: deepmerge(
                    {
                        // todo range
                    },
                    options.headers
                )
            })
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.body;
            });
    },

    getStat: function getStat(url, itemPath, options) {
        options = options || { headers: {} };
        return fetch(url + itemPath, {
                method: "PROPFIND",
                headers: deepmerge(
                    {
                        Depth: 1
                    },
                    options.headers
                )
            })
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
                            var targetPath = itemPath.replace(/^\//, "");
                            resolve(parsing.parseDirectoryLookup(targetPath, result, true));
                        }
                    });
                });
            })
            .then(function(stats) {
                return stats.shift();
            });
    },

    getTextContents: function getTextContents(url, filePath, options) {
        options = options || { headers: {} };
        return fetch(url + filePath, {
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.text();
            });
    }

};
