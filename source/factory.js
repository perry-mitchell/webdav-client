var deepmerge = require("deepmerge");

var authTools = require("./auth.js"),
    urlTools = require("./url.js");

var directoryContents = require("./interface/directoryContents.js"),
    createDir = require("./interface/createDirectory.js"),
    createStream = require("./interface/createStream.js"),
    deletion = require("./interface/delete.js");

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
        }

    };
}

module.exports = {

    createClient

};
