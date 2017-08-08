"use strict";

const nodeFetch = require("node-fetch");

let fetchMethod = nodeFetch;

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
  fetch: request,
  setFetchMethod: setFetchMethod
};
