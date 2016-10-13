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

            deleteFile: function deleteFile(remotePath) {
                return alterAdapter.deleteItem(__url, remotePath);
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

            moveFile: function moveFile(remotePath, targetRemotePath) {
                return alterAdapter.moveItem(__url, remotePath, targetRemotePath);
            },

            putFileContents: function putFileContents(remoteFilename, format, data) {
                format = format || "binary";
                if (["binary", "text"].indexOf(format) < 0) {
                    throw new Error("Unknown format");
                }
                return (format === "text") ?
                    getAdapter.putTextContents(__url, remoteFilename, data) :
                    getAdapter.putFileContents(__url, remoteFilename, data);
            },

            stat: function stat(remotePath) {
                return getAdapter.getStat(__url, remotePath);
            }

        };
    }

};
