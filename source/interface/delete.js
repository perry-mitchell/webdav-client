var joinURL = require("url-join");

var responseHandlers = require("../response.js"),
    fetch = require("../request.js").fetch;

function deleteFile(filename, options) {
    var fetchURL = joinURL(options.remoteURL, filename),
        fetchOptions = {
            method: "DELETE",
            headers: options.headers
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode);
}

module.exports = {
    deleteFile: deleteFile
};
