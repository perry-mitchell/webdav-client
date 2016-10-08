var fetch = require("node-fetch"),
    xml2js = require("xml2js");

var parsing = require("./parse.js");

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
            .then(function(res) {
                return res.text();
            })
            .then(function(body) {
                var parser = new xml2js.Parser();
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

    getFileContents: function getFileContents(url, filePath) {
        return fetch(url + filePath)
            .then(function(res) {
                return res.buffer();
            });
    },

    getTextContents: function getTextContents(url, filePath) {
        return fetch(url + filePath)
            .then(function(res) {
                return res.text();
            });
    }

};
