"use strict";

const nodeFetch = require("node-fetch");

let fetchMethod = nodeFetch;

/**
 * return a URL encoded path, including encoding for special characters like #
 * @param {String} uriPath that we're trying to encode
 * @returns {String} encoded uri path
 */
function encodeURIPath(uriPath) {
    const uriSections = uriPath.split("/");
    for (let i = 0; i < uriSections.length; i += 1) {
      uriSections[i] = encodeURIComponent(uriSections[i]);
    }
    return uriSections.join("/");
}

/**
 * Parse the url in a way that won't crash if the URL is invalid (conventional methods will not accept characters like the #)
 * @param {String} fullUrl that was sent to the request function
 * @returns {Object} protocol, hostname, and path
 */
function splitInvalidURL(fullUrl){
    const sections = fullUrl.split("/");
    const url = {};
    url.protocol = sections[0] + "//";
    url.hostname = sections[2];
    url.path = "/" + sections.slice(3, sections.length).join("/");
    return url;
}

function request(fullUrl, options) {
    const splitUrl = splitInvalidURL(fullUrl);
    const encodedURI = encodeURIPath(splitUrl.path);
    return fetchMethod(`${splitUrl.protocol}${splitUrl.hostname}${encodedURI}`, options);
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
    fetch: request,
    setFetchMethod: setFetchMethod
};
