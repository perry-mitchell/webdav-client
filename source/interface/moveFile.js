"use strict";

const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const request = require("../request.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

function moveFile(filename, destination, options) {
    const fetchURL = joinURL(options.remoteURL, encodePath(filename));
    const fetchOptions = {
        method: "MOVE",
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
    moveFile: moveFile
};
