"use strict";

const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const request = require("../request.js");
const { merge } = require("../merge.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

function getFileContentsBuffer(filePath, options) {
    return makeFileRequest(filePath, options).then(function(res) {
        return typeof res.buffer === "function" ? res.buffer() : res.arrayBuffer();
    });
}

function getFileContentsString(filePath, options) {
    return makeFileRequest(filePath, options).then(function(res) {
        return res.text();
    });
}

function makeFileRequest(filePath, options) {
    const fetchURL = joinURL(options.remoteURL, encodePath(filePath));
    const fetchOptions = merge(options, {
        method: "GET"
    });
    return fetch(fetchURL, fetchOptions).then(responseHandlers.handleResponseCode);
}

function getFileLink(filePath, options) {
    let fetchURL = joinURL(options.remoteURL, encodePath(filePath));
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
    getFileContentsBuffer: getFileContentsBuffer,
    getFileContentsString: getFileContentsString,
    getFileLink: getFileLink
};
