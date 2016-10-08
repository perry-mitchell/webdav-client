var factory = require("./clientFactory.js");

module.exports = function createWebDAVClient(remoteURL, username, password) {
    return factory.createClient(remoteURL, username, password);
};
