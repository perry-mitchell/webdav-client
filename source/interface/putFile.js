var deepmerge = require("deepmerge"),
    joinURL = require("url-join");

var responseHandlers = require("../response.js"),
    fetch = require("../request.js").fetch;

function getPutContentsDefaults() {
    return {
        headers: {
            "Content-Type": "application/octet-stream"
        },
        overwrite: true
    };
}

function putFileContents(filePath, data, options) {
    var putOptions = deepmerge.all([
        getPutContentsDefaults(),
        { headers: { "Content-Length": data.length } },
        options || {}
    ]);
    if (putOptions.overwrite === false) {
        putOptions.headers["If-None-Match"] = "*";
    }
    var fetchURL = joinURL(options.remoteURL, filePath),
        fetchOptions = {
            method: "PUT",
            headers: putOptions.headers,
            body: data
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode);
}

module.exports = {
    putFileContents: putFileContents
};
