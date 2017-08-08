const deepmerge = require("deepmerge");

const authTools = require("./auth.js"),
    urlTools = require("./url.js");

const directoryContents = require("./interface/directoryContents.js"),
    createDir = require("./interface/createDirectory.js"),
    createStream = require("./interface/createStream.js"),
    deletion = require("./interface/delete.js"),
    getFile = require("./interface/getFile.js"),
    quota = require("./interface/quota.js"),
    move = require("./interface/moveFile.js"),
    putFile = require("./interface/putFile.js"),
    stats = require("./interface/stat.js");

/**
 * Client adapter
 * @typedef {Object} ClientInterface
 */

/**
 * Options with header object
 * @typedef {Object} OptionsWithHeaders
 * @property {Object} headers - Headers key-value list
 */

/**
 * Options for creating a resource
 * @typedef {OptionsWithHeaders} PutOptions
 * @property {Boolean=} overwrite - Whether or not to overwrite existing files (default: true)
 */

/**
 * Create a client adapter
 * @param {String} remoteURL The remote address of the webdav server
 * @param {String=} username Optional username for authentication
 * @param {String=} password Optional password for authentication
 * @returns {ClientInterface} A new client interface instance
 * @module WebDAV
 * @example
 *  const createClient = require("webdav");
 *  const client = createClient(url, username, password);
 *  client
 *      .getDirectoryContents("/")
 *      .then(contents => {
 *          console.log(contents);
 *      });
 */
function createClient(remoteURL, username, password) {
    const baseOptions = {
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
            const createOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return createDir.createDirectory(dirPath, createOptions);
        },

        /**
         * Create a readable stream of a remote file
         * @param {String} remoteFilename The file to stream
         * @param {OptionsWithHeaders=} options Options for the request
         * @memberof ClientInterface
         * @returns {Readable} A readable stream
         */
        createReadStream: function createReadStream(remoteFilename, options) {
            const createOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return createStream.createReadStream(remoteFilename, createOptions);
        },

        /**
         * Create a writeable stream to a remote file
         * @param {String} remoteFilename The file to write to
         * @param {PutOptions=} options Options for the request
         * @memberof ClientInterface
         * @returns {Writeable} A writeable stream
         */
        createWriteStream: function createWriteStream(remoteFilename, options) {
            const createOptions = deepmerge(
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
            const deleteOptions = deepmerge(
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
            const getOptions = deepmerge(
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
            const getOptions = deepmerge(
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
         * @memberof ClientInterface
         */
        getQuota: function getQuota(options) {
            const getOptions = deepmerge(
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
            const moveOptions = deepmerge(
                baseOptions,
                options || {}
            );
            return move.moveFile(remotePath, targetRemotePath, moveOptions);
        },

        /**
         * Write contents to a remote file path
         * @param {String} remoteFilename The path of the remote file
         * @param {String|Buffer} data The data to write
         * @param {PutOptions=} options The options for the request
         * @returns {Promise} A promise that resolves once the contents have been written
         * @memberof ClientInterface
         */
        putFileContents: function putFileContents(remoteFilename, data, options) {
            const putOptions = deepmerge(
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
            const getOptions = deepmerge(
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
