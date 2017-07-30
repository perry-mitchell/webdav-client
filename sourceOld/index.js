var factory = require("./clientFactory.js"),
    setFetchMethod = require("./adapter/request.js").setFetchMethod;

/**
 * Create a webdav client interface
 * @see createClient
 * @returns {Object} The client interface
 * @public
 * @param {String} remoteURL The target URL
 */
function createWebDAVClient(remoteURL, username, password) {
    return factory.createClient(remoteURL, username, password);
};

createWebDAVClient.setFetchMethod = setFetchMethod;

module.exports = createWebDAVClient;
