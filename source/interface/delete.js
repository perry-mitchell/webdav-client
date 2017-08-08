"use strict";

const joinURL = require("url-join");

const responseHandlers = require("../response.js");
const fetch = require("../request.js").fetch;

function deleteFile(filename, options) {
    const fetchURL = joinURL(options.remoteURL, filename);
    const fetchOptions = {
        method: "DELETE",
        headers: options.headers
    };
    return fetch(fetchURL, fetchOptions).then(
        responseHandlers.handleResponseCode
    );
}

module.exports = {
    deleteFile: deleteFile
};
