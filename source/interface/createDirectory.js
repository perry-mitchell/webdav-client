"use strict";

const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const request = require("../request.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

function createDirectory(dirPath, options) {
    const fetchURL = joinURL(options.remoteURL, encodePath(dirPath));
    const fetchOptions = {
        method: "MKCOL",
        headers: options.headers,
        agent: options.agent
    };
    return fetch(fetchURL, fetchOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    createDirectory: createDirectory
};
