const joinURL = require("url-join");

const fetch = require("../request.js").fetch,
    responseHandlers = require("../response.js");

function createDirectory(dirPath, options) {
    const fetchURL = joinURL(options.remoteURL, dirPath),
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
