"use strict";

const nodeFetch = require("node-fetch");

const SEP_PATH_POSIX = "__PATH_SEPARATOR_POSIX__";
const SEP_PATH_WINDOWS = "__PATH_SEPARATOR_WINDOWS__";

let fetchMethod = nodeFetch;

function encodePath(path) {
    const replaced = path
        .replace(/(^|[^\\])\\\\($|[^\\])/g, "$1" + SEP_PATH_WINDOWS + "$2")
        .replace(/(^|[^\/])\/($|[^\/])/g, "$1" + SEP_PATH_POSIX + "$2");
    const formatted = encodeURIComponent(replaced);
    return formatted
        .split(SEP_PATH_WINDOWS).join("\\\\")
        .split(SEP_PATH_POSIX).join("/");
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
