"use strict";

const deepmerge = require("deepmerge");
const joinURL = require("url-join");

const responseHandlers = require("../response.js");
const fetch = require("../request.js").fetch;

function getPutContentsDefaults() {
    return {
        headers: {
            "Content-Type": "application/octet-stream"
        },
        overwrite: true
    };
}

function putFileContents(filePath, data, options) {
    const putOptions = deepmerge.all([
        getPutContentsDefaults(),
        { headers: { "Content-Length": data.length } },
        options || {}
    ]);
    if (putOptions.overwrite === false) {
        putOptions.headers["If-None-Match"] = "*";
    }
    const fetchURL = joinURL(options.remoteURL, filePath);
    const fetchOptions = {
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
