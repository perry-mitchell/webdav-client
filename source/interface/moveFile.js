const joinURL = require("url-join"),
    deepmerge = require("deepmerge");

const responseHandlers = require("../response.js"),
    fetch = require("../request.js").fetch;

function moveFile(filename, destination, options) {
    const fetchURL = joinURL(options.remoteURL, filename),
        fetchOptions = {
            method: "MOVE",
            headers: deepmerge(
                {
                    Destination: joinURL(options.remoteURL, destination)
                },
                options.headers
            )
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode);
}

module.exports = {
    moveFile: moveFile
};
