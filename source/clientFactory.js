var deepmerge = require("deepmerge");

var urlTools = require("./url.js"),
    getAdapter = require("./adapter/get.js"),
    putAdapter = require("./adapter/put.js"),
    alterAdapter = require("./adapter/alter.js"),
    authTools = require("./auth.js");

module.exports = {

    /**
     * Create a webdav client interface
     * @param {String} remoteURL The target URL for the webdav server
     * @param {String=} username The username for the remote account
     * @param {String=} password The password for the remote account
     * @returns {Object} The webdav interface
     */
    createClient: function(remoteURL, username, password) {
        var __url = urlTools.sanitiseBaseURL(remoteURL);
        var baseOptions = {
            headers: {}
        };
        if (username && username.length > 0) {
            baseOptions.headers.Authorization = authTools.generateAuthHeader(username, password);
        }

        return {

            createDirectory: function createDirectory(dirPath, options) {
                var putOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return putAdapter.createDirectory(__url, dirPath, putOptions);
            },

            deleteFile: function deleteFile(remotePath, options) {
                var altOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return alterAdapter.deleteItem(__url, remotePath, altOptions);
            },

            getDirectoryContents: function getDirectoryContents(remotePath, options) {
                var getOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return getAdapter.getDirectoryContents(__url, remotePath, getOptions);
            },

            getFileContents: function getFileContents(remoteFilename, options) {
                var getOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                getOptions.format = getOptions.format || "binary";
                if (["binary", "text"].indexOf(getOptions.format) < 0) {
                    throw new Error("Unknown format");
                }
                return (getOptions.format === "text") ?
                    getAdapter.getTextContents(__url, remoteFilename, getOptions) :
                    getAdapter.getFileContents(__url, remoteFilename, getOptions);
            },

            moveFile: function moveFile(remotePath, targetRemotePath, options) {
                var altOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return alterAdapter.moveItem(__url, remotePath, targetRemotePath, altOptions);
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

            stat: function stat(remotePath, options) {
                var getOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return getAdapter.getStat(__url, remotePath, getOptions);
            }

        };
    }

};
