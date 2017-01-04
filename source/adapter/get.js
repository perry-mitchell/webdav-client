var fetch = require("node-fetch"),
    xml2js = require("xml2js");

var parsing = require("./parse.js"),
    responseHandlers = require("./response.js");

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

    getFileContentsAndHeaders: function getFileContentsAndHeaders(url, filePath){
        return fetch(url + filePath)
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return new Promise(function(resolve,reject){
                    res.buffer().then(function(fileContent){
                        resolve({ contents: fileContent, headers: res.headers._headers });
                    })
                })
            });
    }, 
    /*getFileContents: function getFileContents(url, filePath) {
        return fetch(url + filePath)
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.buffer();
            });
    },*/

    getFileContents: function getFileContents(url, filePath){
        return module.exports.getFileContentsAndHeaders(url,filePath)
                .then(
                    function(contentsAndHeaders){
                        return Promise.resolve(contentsAndHeaders.contents);
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
    },

    getTextContentsAndHeaders: function getTextContentsAndHeaders(url, filePath){
        return fetch(url + filePath)
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return new Promise(function(resolve,reject){
                    res.text().then(function(fileContent){
                        resolve({ contents: fileContent, headers: res.headers._headers });
                    })
                })
            });
    }, 

    getTextContents: function getTextContents(url, filePath){
        return module.exports.getTextContentsAndHeaders(url,filePath)
                .then(
                    function(contentsAndHeaders){
                        return Promise.resolve(contentsAndHeaders.contents);
                    });
    }

    /*getTextContents: function getTextContents(url, filePath) {
        return fetch(url + filePath)
            .then(responseHandlers.handleResponseCode)
            .then(function(res) {
                return res.text();
            });
    }*/

};
