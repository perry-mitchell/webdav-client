const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const { encodePath, fetch } = require("../request.js");

function copyFile(filename, destination, options) {
    const fetchURL = joinURL(options.remoteURL, encodePath(filename));
    const fetchOptions = {
        method: "COPY",
        headers: merge(
            {
                Destination: joinURL(options.remoteURL, destination)
            },
            options.headers
        )
    };
    return fetch(fetchURL, fetchOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    copyFile: copyFile
};
