var urlTools = require("./url.js"),
    getAdapter = require("./adapter/get.js"),
    putAdapter = require("./adapter/put.js")

module.exports = {

    createClient: function(remoteURL, username, password) {
        var __url = urlTools.sanitiseBaseURL(remoteURL);
        __url = urlTools.implantCredentials(__url, username, password);

        return {

            createDirectory: function createDirectory(dirPath) {
                return putAdapter.createDirectory(__url, dirPath);
            },

            getDirectoryContents: function getDirectoryContents(remotePath) {
                return getAdapter.getDirectoryContents(__url, remotePath);
            },

            getFileContents: function getFileContents(remoteFilename, format) {
                format = format || "binary";
                if (["binary", "text"].indexOf(format) < 0) {
                    throw new Error("Unknown format");
                }
                return (format === "text") ?
                    getAdapter.getTextContents(__url, remoteFilename) :
                    getAdapter.getFileContents(__url, remoteFilename);
            },

            putFileContents: function putFileContents(remoteFilename, format, data) {
                format = format || "binary";
                if (["binary", "text"].indexOf(format) < 0) {
                    throw new Error("Unknown format");
                }
                return (format === "text") ?
                    getAdapter.putTextContents(__url, remoteFilename, data) :
                    getAdapter.putFileContents(__url, remoteFilename, data);
            }

        };
    }

};
