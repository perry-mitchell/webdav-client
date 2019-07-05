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
 * Options for creating a resource
 * @typedef {UserOptions} PutOptions
 * @property {Boolean=} overwrite - Whether or not to overwrite existing files (default: true)
 */

/**
 * Options with headers and format
 * @typedef {UserOptions} OptionsWithFormat
 * @property {String} format - The format to use (text/binary)
 * @property {Boolean=} details - Provided detailed response information, such as response
 *  headers (defaults to false). Only available on requests that return result data.
 */

/**
 * Options for methods that resturn responses
 * @typedef {UserOptions} OptionsForAdvancedResponses
 * @property {Boolean=} details - Provided detailed response information, such as response
 *  headers (defaults to false). Only available on requests that return result data.
 */

/**
 * @typedef {OptionsForAdvancedResponses} GetDirectoryContentsOptions
 * @property {Boolean=} deep - Return deep (infinite) items (default: false)
 * @property {Boolean=} details - Response objects hold all properties (default: false)
 * @property {String=} glob - Glob pattern for matching certain files
 * @property {Array=} properties - Array of properties which shall be use in the PROPFIND request body
 * @property {Array=} namespaces - Array of XML namespaces which are used in the PROPFIND request body
 */

/**
 * @typedef {Object} AuthToken
 * @property {String} token_type - The type of token (eg "Bearer")
 * @property {String} access_token - The token access code
 */

/**
 * @typedef {Object} CreateClientOptions
 * @property {String=} username - The username for authentication
 * @property {String=} password - The password for authentication
 * @property {http.Agent=} httpAgent - Override the HTTP Agent instance for requests
 * @property {https.Agent=} httpsAgent - Override the HTTPS Agent instance for requests
 * @property {AuthToken=} token - Optional OAuth token
 */

/**
 * A stat result
 * @typedef {Object} Stat
 * @property {String} filename The full path and filename of the remote item
 * @property {String} basename The base filename of the remote item, without the path
 * @property {String} lastmod The last modification date (eg. "Sun, 13 Mar 2016 04:23:32 GMT")
 * @property {Number} size The size of the remote item
 * @property {String} type The type of the item (file/directory)
 * @property {String=} mime The file mimetype (not present on directories)
 * @property {String|null} etag The ETag of the remote item (as supported by the server)
 * @property {Object=} props Additionally returned properties from the server, unprocessed, if
 *     `details: true` is specified in the options
 */

/**
 * Create a client adapter
 * @param {String} remoteURL The remote address of the webdav server
 * @param {CreateClientOptions=} opts Client options
 * @returns {ClientInterface} A new client interface instance
 * @memberof module:WebDAV
 * @example
 *  const createClient = require("webdav");
 *  const client = createClient(url, { username, password });
 *  client
 *      .getDirectoryContents("/")
 *      .then(contents => {
 *          console.log(contents);
 *      });
 * @example
 *  const createClient = require("webdav");
 *  const client = createClient(url, {
 *      token: { token_type: "Bearer", access_token: "tokenvalue" }
 *  });
 *  client
 *      .getDirectoryContents("/")
 *      .then(contents => {
 *          console.log(contents);
 *      });
 */
function createClient(remoteURL, opts = {}) {
    if (!opts || typeof opts !== "object") {
        throw new Error("Options must be an object, if specified");
    }
    const { username, password, httpAgent, httpsAgent, token = null } = opts;
    const runtimeOptions = {
        headers: {},
        remotePath: urlTools.extractURLPath(remoteURL),
        remoteURL,
        httpAgent,
        httpsAgent
    };
    // Configure auth
    if (username) {
        runtimeOptions.headers.Authorization = authTools.generateBasicAuthHeader(username, password);
    } else if (token && typeof token === "object") {
        runtimeOptions.headers.Authorization = authTools.generateTokenAuthHeader(token);
    }
    return {
        /**
         * Copy a remote item to another path
         * @param {String} remotePath The remote item path
         * @param {String} targetRemotePath The path file will be copied to
         * @param {UserOptions=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise} A promise that resolves once the request has completed
         * @example
         *      await client.copyFile("/photos/pic1.jpg", "/backup/pic1.jpg");
         */
        copyFile: function copyFile(remotePath, targetRemotePath, options) {
            const copyOptions = merge(runtimeOptions, options || {});
            return copy.copyFile(remotePath, targetRemotePath, copyOptions);
        },

        /**
         * Create a directory
         * @param {String} dirPath The path to create
         * @param {UserOptions=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise} A promise that resolves when the remote path has been created
         * @example
         *      await client.createDirectory("/my/directory");
         */
        createDirectory: function createDirectory(dirPath, options) {
            const createOptions = merge(runtimeOptions, options || {});
            return createDir.createDirectory(dirPath, createOptions);
        },

        /**
         * Create a readable stream of a remote file
         * @param {String} remoteFilename The file to stream
         * @param {UserOptions=} options Options for the request
         * @memberof ClientInterface
         * @returns {Readable} A readable stream
         * @example
         *      const remote = client.createReadStream("/data.zip");
         *      remote.pipe(someWriteStream);
         */
        createReadStream: function createReadStream(remoteFilename, options) {
            const createOptions = merge(runtimeOptions, options || {});
            return createStream.createReadStream(remoteFilename, createOptions);
        },

        /**
         * Create a writeable stream to a remote file
         * @param {String} remoteFilename The file to write to
         * @param {PutOptions=} options Options for the request
         * @memberof ClientInterface
         * @returns {Writeable} A writeable stream
         * @example
         *      const remote = client.createWriteStream("/data.zip");
         *      fs.createReadStream("~/myData.zip").pipe(remote);
         */
        createWriteStream: function createWriteStream(remoteFilename, options) {
            const createOptions = merge(runtimeOptions, options || {});
            return createStream.createWriteStream(remoteFilename, createOptions);
        },

        /**
         * Delete a remote file
         * @param {String} remotePath The remote path to delete
         * @param {UserOptions=} options The options for the request
         * @memberof ClientInterface
         * @returns {Promise} A promise that resolves when the remote file as been deleted
         * @example
         *      await client.deleteFile("/some/file.txt");
         */
        deleteFile: function deleteFile(remotePath, options) {
            const deleteOptions = merge(runtimeOptions, options || {});
            return deletion.deleteFile(remotePath, deleteOptions);
        },

        /**
         * Get the contents of a remote directory
         * @param {String} remotePath The path to fetch the contents of
         * @param {GetDirectoryContentsOptions=} options Options for the remote the request
         * @returns {Promise.<Array.<Stat>>} A promise that resolves with an array of remote item stats
         * @memberof ClientInterface
         * @example
         *      const contents = await client.getDirectoryContents("/");
         */
        getDirectoryContents: function getDirectoryContents(remotePath, options) {
            const getOptions = merge(runtimeOptions, options || {});
            return directoryContents.getDirectoryContents(remotePath, getOptions);
        },

        /**
         * Get the contents of a remote file
         * @param {String} remoteFilename The file to fetch
         * @param {OptionsWithFormat=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise.<Buffer|String>} A promise that resolves with the contents of the remote file
         * @example
         *      // Fetching data:
         *      const buff = await client.getFileContents("/image.png");
         *      // Fetching text:
         *      const txt = await client.getFileContents("/list.txt", { format: "text" });
         */
        getFileContents: function getFileContents(remoteFilename, options) {
            const getOptions = merge(runtimeOptions, options || {});
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
         * @param {UserOptions=} options Options for the request
         * @memberof ClientInterface
         * @returns {String} A download URL
         */
        getFileDownloadLink: function getFileDownloadLink(remoteFilename, options) {
            const getOptions = merge(runtimeOptions, options || {});
            return getFile.getFileLink(remoteFilename, getOptions);
        },

        /**
         * Get a file upload link
         * Only supported for Basic authentication or unauthenticated connections.
         * @param {String} remoteFilename The path of the remote file location
         * @param {PutOptions=} options The options for the request
         * @memberof ClientInterface
         * @returns {String} A upload URL
         */
        getFileUploadLink: function getFileUploadLink(remoteFilename, options) {
            var putOptions = merge(runtimeOptions, options || {});
            return putFile.getFileUploadLink(remoteFilename, putOptions);
        },

        /**
         * Get quota information
         * @param {OptionsForAdvancedResponses=} options Options for the request
         * @returns {Promise.<null|Object>} Returns null if failed, or an object with `used` and `available`
         * @memberof ClientInterface
         */
        getQuota: function getQuota(options) {
            const getOptions = merge(runtimeOptions, options || {});
            return quota.getQuota(getOptions);
        },

        /**
         * Move a remote item to another path
         * @param {String} remotePath The remote item path
         * @param {String} targetRemotePath The new path after moving
         * @param {UserOptions=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise} A promise that resolves once the request has completed
         * @example
         *      await client.moveFile("/sub/file.dat", "/another/dir/file.dat");
         */
        moveFile: function moveFile(remotePath, targetRemotePath, options) {
            const moveOptions = merge(runtimeOptions, options || {});
            return move.moveFile(remotePath, targetRemotePath, moveOptions);
        },

        /**
         * Write contents to a remote file path
         * @param {String} remoteFilename The path of the remote file
         * @param {String|Buffer} data The data to write
         * @param {PutOptions=} options The options for the request
         * @returns {Promise} A promise that resolves once the contents have been written
         * @memberof ClientInterface
         * @example
         *      await client.putFileContents("/dir/image.png", myImageBuffer);
         *      // Put contents without overwriting:
         *      await client.putFileContents("/dir/image.png", myImageBuffer, { overwrite: false });
         */
        putFileContents: function putFileContents(remoteFilename, data, options) {
            const putOptions = merge(runtimeOptions, options || {});
            return putFile.putFileContents(remoteFilename, data, putOptions);
        },

        /**
         * Stat a remote object
         * @param {String} remotePath The path of the item
         * @param {OptionsForAdvancedResponses=} options Options for the request
         * @memberof ClientInterface
         * @returns {Promise.<Stat>} A promise that resolves with the stat data
         */
        stat: function stat(remotePath, options) {
            const getOptions = merge(runtimeOptions, options || {});
            return stats.getStat(remotePath, getOptions);
        }
    };
}

module.exports = {
    createClient
};
