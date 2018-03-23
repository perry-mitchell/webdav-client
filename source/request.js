"use strict";

const nodeFetch = require("node-fetch");

const SEP_PATH_POSIX = "__PATH_SEPARATOR_POSIX__";
const SEP_PATH_WINDOWS = "__PATH_SEPARATOR_WINDOWS__";

let fetchMethod = nodeFetch;

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

function request(url, options) {
    return fetchMethod(url, options);
}

/**
 * Set the fetch method to use when making requests
 * Defaults to `node-fetch`. Setting it to `null` will reset it to `node-fetch`.
 * @param {Function} fn Function to use - should perform like `fetch`.
 * @example
 *  const createClient = require("webdav");
 *  createClient.setFetchMethod(window.fetch);
 */
function setFetchMethod(fn) {
    fetchMethod = fn || nodeFetch;
}

module.exports = {
    encodePath: encodePath,
    fetch: request,
    setFetchMethod: setFetchMethod
};
