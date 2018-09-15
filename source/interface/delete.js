"use strict";

const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const request = require("../request.js");
const { merge } = require("../merge.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

function deleteFile(filename, options) {
    const fetchURL = joinURL(options.remoteURL, encodePath(filename));
    const fetchOptions = merge(options, {
        method: "DELETE"
    });
    return fetch(fetchURL, fetchOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    deleteFile: deleteFile
};
