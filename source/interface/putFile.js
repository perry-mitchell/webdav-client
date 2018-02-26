"use strict";

const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const request = require("../request.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

function getPutContentsDefaults() {
    return {
        headers: {
            "Content-Type": "application/octet-stream"
        },
        overwrite: true
    };
}

function putFileContents(filePath, data, options) {
    const putOptions = merge(getPutContentsDefaults(), { headers: { "Content-Length": data.length } }, options || {});
    if (putOptions.overwrite === false) {
        putOptions.headers["If-None-Match"] = "*";
    }
    const fetchURL = joinURL(options.remoteURL, encodePath(filePath));
    const fetchOptions = {
        method: "PUT",
        headers: putOptions.headers,
        body: data
    };
    return fetch(fetchURL, fetchOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    putFileContents: putFileContents
};
