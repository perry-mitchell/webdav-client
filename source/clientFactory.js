var urlTools = require("./url.js"),
    getAdapter = require("./adapter/get.js"),
    putAdapter = require("./adapter/put.js"),
    alterAdapter = require("./adapter/alter.js");

module.exports = {

    createClient: function(remoteURL, username, password) {
        var __url = urlTools.sanitiseBaseURL(remoteURL);
        __url = urlTools.implantCredentials(__url, username, password);

        return {

            createDirectory: function createDirectory(dirPath) {
                return putAdapter.createDirectory(__url, dirPath);
            },

            deleteFile: function deleteFile(remotePath, options) {
                return alterAdapter.deleteItem(__url, remotePath, options);
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

            moveFile: function moveFile(remotePath, targetRemotePath, options) {
                return alterAdapter.moveItem(__url, remotePath, targetRemotePath, options);
            },

            putFileContents: function putFileContents(remoteFilename, format, data, options) {
                format = format || "binary";
                if (["binary", "text"].indexOf(format) < 0) {
                    throw new Error("Unknown format");
                }
                return (format === "text") ?
                    putAdapter.putTextContents(__url, remoteFilename, data, options) :
                    putAdapter.putFileContents(__url, remoteFilename, data, options);
            },

            stat: function stat(remotePath) {
                return getAdapter.getStat(__url, remotePath);
            }

        };
    }

};
