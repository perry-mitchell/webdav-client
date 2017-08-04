var joinURL = require("url-join");

var responseHandlers = require("../response.js"),
    fetch = require("../request.js").fetch;

function getFileContentsBuffer(filePath, options) {
    return makeFileRequest(filePath, options)
        .then(function(res) {
            return res.buffer();
        });
}

function getFileContentsString(filePath, options) {
    return makeFileRequest(filePath, options)
        .then(function(res) {
            return res.text();
        });
}

function makeFileRequest(filePath, options) {
    var fetchURL = joinURL(options.remoteURL, filePath),
        fetchOptions = {
            method: "GET",
            headers: options.headers
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode);
}

module.exports = {
    getFileContentsBuffer: getFileContentsBuffer,
    getFileContentsString: getFileContentsString
};
