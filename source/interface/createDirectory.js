var joinURL = require("url-join");

var fetch = require("../request.js").fetch,
    responseHandlers = require("../response.js");

function createDirectory(dirPath, options) {
    var fetchURL = joinURL(options.remoteURL, dirPath),
        fetchOptions = {
            method: "MKCOL",
            headers: options.headers
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode);
}

module.exports = {
    createDirectory: createDirectory
};
