"use strict";

const authTools = require("./auth.js");
const urlTools = require("./url.js");
const { merge } = require("./merge.js");

const directoryContents = require("./interface/directoryContents.js");
const createDir = require("./interface/createDirectory.js");
const createStream = require("./interface/createStream.js");
const deletion = require("./interface/delete.js");
const getFile = require("./interface/getFile.js");
const quota = require("./interface/quota.js");
const move = require("./interface/moveFile.js");
const copy = require("./interface/copyFile.js");
const putFile = require("./interface/putFile.js");
const stats = require("./interface/stat.js");

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
 * Options with headers and format
 * @typedef {OptionsWithHeaders} OptionsHeadersAndFormat
 * @property {String} format - The format to use (text/binary)
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
 * @example
 *  const createClient = require("webdav");
 *  const client = createClient(url, {token_type: 'Bearer', access_token: 'tokenvalue'});
 *  client
 *      .getDirectoryContents("/")
 *      .then(contents => {
 *          console.log(contents);
 *      }); */
function createClient(remoteURL, username, password) {
    const baseOptions = {
        headers: {},
        remotePath: urlTools.extractURLPath(remoteURL),
        remoteURL: remoteURL
    };

    if (username) {
        baseOptions.headers.Authorization =
            typeof username === "object"
                ? authTools.generateTokenAuthHeader(username)
                : authTools.generateBasicAuthHeader(username, password);
    }

    return {
        /**
         * Copy a remote item to another path
         * @param {String} remotePath The remote item path
         * @param {String} targetRemotePath The path file will be copied to
         * @param {OptionsWithHeaders=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise} A promise that resolves once the request has completed
         */
        copyFile: function copyFile(remotePath, targetRemotePath, options) {
            const copyOptions = merge(baseOptions, options || {});
            return copy.copyFile(remotePath, targetRemotePath, copyOptions);
        },

        /**
         * Create a directory
         * @param {String} dirPath The path to create
         * @param {OptionsWithHeaders=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise} A promise that resolves when the remote path has been created
         */
        createDirectory: function createDirectory(dirPath, options) {
            const createOptions = merge(baseOptions, options || {});
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
            const createOptions = merge(baseOptions, options || {});
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
            const createOptions = merge(baseOptions, options || {});
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
            const deleteOptions = merge(baseOptions, options || {});
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
            const getOptions = merge(baseOptions, options || {});
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
            const getOptions = merge(baseOptions, options || {});
            getOptions.format = getOptions.format || "binary";
            if (["binary", "text"].indexOf(getOptions.format) < 0) {
                throw new Error("Unknown format: " + getOptions.format);
            }
            return getOptions.format === "text"
                ? getFile.getFileContentsString(remoteFilename, getOptions)
                : getFile.getFileContentsBuffer(remoteFilename, getOptions);
        },

        /**
         * Get the download link of a remote file
         * Only supported for Basic authentication or unauthenticated connections.
         * @param {String} remoteFilename The file url to fetch
         * @param {OptionsHeadersAndFormat=} options Options for the request
         * @memberof ClientInterface
         * @returns {String} A download URL
         */
        getFileDownloadLink: function getFileDownloadLink(remoteFilename, options) {
            const getOptions = merge(baseOptions, options || {});
            return getFile.getFileLink(remoteFilename, getOptions);
        },

        /**
         * Get quota information
         * @param {OptionsHeadersAndFormat=} options Options for the request
         * @returns {null|Object} Returns null if failed, or an object with `used` and `available`
         * @memberof ClientInterface
         */
        getQuota: function getQuota(options) {
            const getOptions = merge(baseOptions, options || {});
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
            const moveOptions = merge(baseOptions, options || {});
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
            const putOptions = merge(baseOptions, options || {});
            return putFile.putFileContents(remoteFilename, data, putOptions);
        },

        /**
         * Get the upload link
         * Only supported for Basic authentication or unauthenticated connections.
         * @param {String} remoteFilename The path of the remote file location
         * @param {PutOptions=} options The options for the request
         * @memberof ClientInterface
         * @returns {String} A upload URL
         */
        getFileUploadLink: function getFileUploadLink(remoteFilename, options) {
            var putOptions = merge(baseOptions, options || {});
            return putFile.getFileUploadLink(remoteFilename, putOptions);
        },

        /**
         * Stat a remote object
         * @param {String} remotePath The path of the item
         * @param {OptionsWithHeaders=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise.<Object>} A promise that resolves with the stat data
         */
        stat: function stat(remotePath, options) {
            const getOptions = merge(baseOptions, options || {});
            return stats.getStat(remotePath, getOptions);
        }
    };
}

module.exports = {
    createClient
};
