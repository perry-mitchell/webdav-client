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
            
            getFileContentsExtended: function getFileContentsExtended(remoteFilename, options){
                return getAdapter.getFileContents(__url, remoteFilename, options);
            },

            getFileContents: function getFileContents(remoteFilename, format) {
                var options = {
                    returnFormat: format
                };
                return getAdapter.getFileContents(__url, remoteFilename, options)
                        .then(function (resultObject){
                            return Promise.resolve(resultObject.contents);
                        });
            },

            moveFile: function moveFile(remotePath, targetRemotePath) {
                return alterAdapter.moveItem(__url, remotePath, targetRemotePath);
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
