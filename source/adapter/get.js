var fetch = require("node-fetch"),
    xml2js = require("xml2js");

var parsing = require("./parse.js"),
    responseHandlers = require("./response.js");

var deepmerge = require("deepmerge");

function getGetContentsDefaults() {
    return {
        headers: { },
        returnFormat: "binary", //text / json
        returnHeaders: false
    };
}

module.exports = {

    getDirectoryContents: function getDirectoryContents(url, dirPath) {
        dirPath = dirPath || "/";
        var fetchURL = url + dirPath;
        return fetch(
                fetchURL,
                {
                    method: "PROPFIND",
                    headers: {
                        Depth: 1
                    }
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

    getFileContents: function getFileContents(url, filePath, options){
        options = deepmerge.all([
            getGetContentsDefaults(),
            options || {}
        ]);
        if (["binary", "text", "json"].indexOf(options.returnFormat) < 0) {
                    throw new Error("Unknown format");
        }

        return fetch(url + filePath, options.headers)
                .then(responseHandlers.handleResponseCode)
                .then(function(res) {
                    var resultPromise;
                    if(options.returnFormat == "text")
                        resultPromise = res.text();
                    else if(options.returnFormat == "json")
                        resultPromise = res.json();
                    else
                        resultPromise = res.buffer();

                    return resultPromise
                        .then(function(fileContent){
                            var result = { contents: fileContent };
                            if(options.returnHeaders)
                                result.headers = res.headers.raw();
                            return Promise.resolve(result);
                        });
                });
    }, 

    getStat: function getStat(url, itemPath) {
        return fetch(url + itemPath, {
                method: "PROPFIND",
                headers: {
                    Depth: 1
                }
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
    }

};
