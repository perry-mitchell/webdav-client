var deepmerge = require("deepmerge");

var authTools = require("./auth.js"),
    urlTools = require("./url.js");

var directoryContents = require("./interface/directoryContents.js"),
    createDir = require("./interface/createDirectory.js"),
    createStream = require("./interface/createStream.js"),
    deletion = require("./interface/delete.js"),
    getFile = require("./interface/getFile.js"),
    quota = require("./interface/quota.js"),
    move = require("./interface/moveFile.js"),
    putFile = require("./interface/putFile.js"),
    stats = require("./interface/stat.js");

/**
 * @typedef {Object} ClientInterface
 */

function createClient(remoteURL, username, password) {
    var baseOptions = {
        headers: {},
        remotePath: urlTools.extractURLPath(remoteURL),
        remoteURL: remoteURL
    };
    if (username && username.length > 0) {
        baseOptions.headers.Authorization = authTools.generateBasicAuthHeader(username, password);
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
            var createOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return createDir.createDirectory(dirPath, createOptions);
        },

        /**
         * Create a readable stream of a remote file
         * @param {String} remoteFilename The file to stream
         * @param {OptionsHeadersAndFormat=} options Options for the request
         * @memberof ClientInterface
         * @returns {Readable} A readable stream
         */
        createReadStream: function createReadStream(remoteFilename, options) {
            var createOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return createStream.createReadStream(remoteFilename, createOptions);
        },

        /**
         * Create a writeable stream to a remote file
         * @param {String} remoteFilename The file to write to
         * @param {OptionsHeadersAndFormat=} options Options for the request
         * @memberof ClientInterface
         * @returns {Writeable} A writeable stream
         */
        createWriteStream: function createWriteStream(remoteFilename, options) {
            var createOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return createStream.createWriteStream(remoteFilename, createOptions);
        },

        /**
         * Delete a remote file
         * @param {String} remotePath The remote path to delete
         * @param {OptionsWithHeaders=} options The options for the request
         * @memberof ClientInterface
         * @returns {Promise} A promise that resolves when the remote file as been deleted
         */
        deleteFile: function deleteFile(remotePath, options) {
            var deleteOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return deletion.deleteFile(remotePath, deleteOptions);
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
            return directoryContents.getDirectoryContents(remotePath, getOptions);
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
                throw new Error("Unknown format: " + getOptions.format);
            }
            return (getOptions.format === "text") ?
                getFile.getFileContentsString(remoteFilename, getOptions) :
                getFile.getFileContentsBuffer(remoteFilename, getOptions);
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
            return quota.getQuota(getOptions);
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
            var moveOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return move.moveFile(remotePath, targetRemotePath, moveOptions);
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
            return putFile.putFileContents(remoteFilename, data, putOptions);
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
            return stats.getStat(remotePath, getOptions);
        }

    };
}

module.exports = {

    createClient

};
