var deepmerge = require("deepmerge");

var urlTools = require("./url.js"),
    getAdapter = require("./adapter/get.js"),
    putAdapter = require("./adapter/put.js"),
    alterAdapter = require("./adapter/alter.js"),
    authTools = require("./auth.js");

/**
 * @typedef {Object} ClientInterface
 */

/**
 * @typedef {Object} OptionsWithHeaders
 * @property {Object} headers Optional headers to send with the request
 */

/**
 * @typedef {OptionsWithHeaders} OptionsHeadersAndFormat
 * @property {String} format Format of request/response payload (binary/text)
 */

module.exports = {

    /**
     * Create a webdav client interface
     * @param {String} remoteURL The target URL for the webdav server
     * @param {String=} username The username for the remote account
     * @param {String=} password The password for the remote account
     * @returns {ClientInterface} The webdav interface
     */
    createClient: function createClient(remoteURL, username, password) {
        var __url = urlTools.sanitiseBaseURL(remoteURL);
        var baseOptions = {
            headers: {}
        };
        if (username && username.length > 0) {
            baseOptions.headers.Authorization = authTools.generateAuthHeader(username, password);
        }

        return {

            /**
             * Create a directory
             * @param {String} dirPath The path to create
             * @param {OptionsWithHeaders=} options Options for the request
             * @memberof ClientInterface
             * @returns {Promise} A promise that resolves when the remote path has been created
             */
            createDirectory: function createDirectory(dirPath, options) {
                var putOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return putAdapter.createDirectory(__url, dirPath, putOptions);
            },

            /**
             * Create a readable stream of a remote file
             * @param {String} remoteFilename The file to stream
             * @param {OptionsHeadersAndFormat=} options Options for the request
             * @memberof ClientInterface
             * @returns {Readable} A readable stream
             */
            createReadStream: function createReadStream(remoteFilename, options) {
                var getOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return getAdapter.createReadStream(__url, remoteFilename, getOptions);
            },

            /**
             * Delete a remote file
             * @param {String} remotePath The remote path to delete
             * @param {OptionsWithHeaders=} options The options for the request
             * @memberof ClientInterface
             * @returns {Promise} A promise that resolves when the remote file as been deleted
             */
            deleteFile: function deleteFile(remotePath, options) {
                var altOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return alterAdapter.deleteItem(__url, remotePath, altOptions);
            },

            /**
             * Get the contents of a remote directory
             * @param {String} remotePath The path to fetch the contents of
             * @param {OptionsWithHeaders=} options Options for the remote the request
             * @returns {Promise.<Array>} A promise that resolves with an array of remote item stats
             * @memberof ClientInterface
             */
            getDirectoryContents: function getDirectoryContents(remotePath, options) {
                var getOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return getAdapter.getDirectoryContents(__url, remotePath, getOptions);
            },

            /**
             * Get the contents of a remote file
             * @param {String} remoteFilename The file to fetch
             * @param {OptionsHeadersAndFormat=} options Options for the request
             * @memberof ClientInterface
             * @returns {Promise.<Buffer|String>} A promise that resolves with the contents of the remote file
             */
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

            /**
             * Get quota information
             * @param {OptionsHeadersAndFormat=} options Options for the request
             * @returns {null|Object} Returns null if failed, or an object with `used` and `available`
             */
            getQuota: function getQuota(options) {
                var getOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return getAdapter.getQuota(__url, getOptions);
            },

            /**
             * Move a remote item to another path
             * @param {String} remotePath The remote item path
             * @param {String} targetRemotePath The new path after moving
             * @param {OptionsWithHeaders=} options Options for the request
             * @memberof ClientInterface
             * @returns {Promise} A promise that resolves once the request has completed
             */
            moveFile: function moveFile(remotePath, targetRemotePath, options) {
                var altOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return alterAdapter.moveItem(__url, remotePath, targetRemotePath, altOptions);
            },

            /**
             * Write contents to a remote file path
             * @param {String} remoteFilename The path of the remote file
             * @param {String|Buffer} data The data to write
             * @param {OptionsHeadersAndFormat=} options The options for the request
             * @returns {Promise} A promise that resolves once the contents have been written
             * @memberof ClientInterface
             */
            putFileContents: function putFileContents(remoteFilename, data, options) {
                var putOptions = deepmerge(
                    baseOptions,
                    options || {}
                );
                return putAdapter.putFileContents(__url, remoteFilename, data, putOptions);
            },

            /**
             * Stat a remote object
             * @param {String} remotePath The path of the item
             * @param {OptionsWithHeaders=} options Options for the request
             * @memberof ClientInterface
             * @returns {Promise.<Object>} A promise that resolves with the stat data
             */
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
