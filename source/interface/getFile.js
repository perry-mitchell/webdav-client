"use strict";

const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const request = require("../request.js");
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
    const fetchOptions = {
        method: "GET",
        headers: options.headers
    };
    return fetch(fetchURL, fetchOptions).then(responseHandlers.handleResponseCode);
}

function getFileLink(filePath, options) {
    var fetchURL = joinURL(options.remoteURL, encodePath(filePath));
    var Authorization = options.headers.Authorization.replace("Basic ", "");
    Authorization = Buffer.from(Authorization, "base64");
    var httpformat = fetchURL.includes("https") ? "https://" : "http://";
    return fetchURL.replace(httpformat, httpformat + Authorization + "@");
}

module.exports = {
    getFileContentsBuffer: getFileContentsBuffer,
    getFileContentsString: getFileContentsString,
    getFileLink: getFileLink
};
