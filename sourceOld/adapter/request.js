var nodeFetch = require("node-fetch");

var fetchMethod = nodeFetch;

/**
 * Perform a request
 * @param {String} url The URL to fetch
 * @param {Object} options Fetch options
 * @returns {Promise} A promise that resolves with the result
 */
function request(url, options) {
    return fetchMethod(url, options);
};

/**
 * Set the fetch method to use when making requests
 * Defaults to `node-fetch`. Setting it to `null` will reset it to `node-fetch`.
 * @param {Function} fn Function to use - should perform like `fetch`.
 */
function setFetchMethod(fn) {
    fetchMethod = fn || nodeFetch;
}

module.exports = {
    fetch: request,
    setFetchMethod: setFetchMethod
};
