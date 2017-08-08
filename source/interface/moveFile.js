"use strict";

const joinURL = require("url-join");
const deepmerge = require("deepmerge");

const responseHandlers = require("../response.js");
const fetch = require("../request.js").fetch;

function moveFile(filename, destination, options) {
    const fetchURL = joinURL(options.remoteURL, filename);
    const fetchOptions = {
        method: "MOVE",
        headers: deepmerge(
            {
                Destination: joinURL(options.remoteURL, destination)
            },
            options.headers
        )
    };
    return fetch(fetchURL, fetchOptions).then(
        responseHandlers.handleResponseCode
    );
}

module.exports = {
    moveFile: moveFile
};
