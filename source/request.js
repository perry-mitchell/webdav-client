const axios = require("axios");
const { merge } = require("./merge.js");

const SEP_PATH_POSIX = "__PATH_SEPARATOR_POSIX__";
const SEP_PATH_WINDOWS = "__PATH_SEPARATOR_WINDOWS__";

let requestMethod = axios;

/**
 * Encode a path for use with WebDAV servers
 * @param {String} path The path to encode
 * @returns {String} The encoded path (separators protected)
 */
function encodePath(path) {
    const replaced = path.replace(/\//g, SEP_PATH_POSIX).replace(/\\\\/g, SEP_PATH_WINDOWS);
    const formatted = encodeURIComponent(replaced);
    return formatted
        .split(SEP_PATH_WINDOWS)
        .join("\\\\")
        .split(SEP_PATH_POSIX)
        .join("/");
}

function prepareRequestOptions(requestOptions, methodOptions) {
    if (methodOptions.httpAgent) {
        requestOptions.httpAgent = methodOptions.httpAgent;
    }
    if (methodOptions.httpsAgent) {
        requestOptions.httpsAgent = methodOptions.httpsAgent;
    }
    if (methodOptions.headers && typeof methodOptions.headers === "object") {
        requestOptions.headers = merge(requestOptions.headers || {}, methodOptions.headers);
    }
}

/**
 * @typedef {Object} RequestOptions
 * @property {String} url - The URL to request
 * @property {String} method - The method to use (eg. "POST")
 * @property {Object=} headers - Headers to set on the request
 * @property {Object=} httpAgent - A HTTP agent instance
 * @property {Object=} httpsAgent - A HTTPS agent interface
 * @property {Object|String|*=} body - Body data for the request
 */

/**
 * Make a request
 * @param {RequestOptions} requestOptions Options for the request
 * @see axios
 * @returns {Promise.<Object>} A promise that resolves with a response object
 */
function request(requestOptions) {
    return axios(requestOptions);
}

/**
 * Set the request method to use when making requests
 * Defaults to `axios`. Setting it to `null` will reset it to `axios`.
 * @param {Function} fn Function to use - should perform like `axios()`.
 * @example
 *  const createClient = require("webdav");
 *  createClient.setRequestMethod(someMethod);
 */
function setRequestMethod(fn) {
    requestMethod = fn || axios;
}

module.exports = {
    axios,
    encodePath,
    prepareRequestOptions,
    request,
    setRequestMethod
};
