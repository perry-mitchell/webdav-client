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

function getFileUploadLink(filePath, options) {
    let fetchURL = joinURL(options.remoteURL, encodePath(filePath));
    fetchURL += "?Content-Type=application/octet-stream";
    const protocol = /^https:/i.test(fetchURL) ? "https" : "http";
    if (options.headers.Authorization) {
        if (/^Basic /i.test(options.headers.Authorization) === false) {
            throw new Error("Failed retrieving download link: Invalid authorisation method");
        }
        const authPart = options.headers.Authorization.replace(/^Basic /i, "").trim();
        const authContents = Buffer.from(authPart, "base64").toString("utf8");
        fetchURL = fetchURL.replace(/^https?:\/\//, `${protocol}://${authContents}@`);
    }
    return fetchURL;
}

module.exports = {
    putFileContents: putFileContents,
    getFileUploadLink: getFileUploadLink
};
