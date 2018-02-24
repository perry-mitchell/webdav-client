"use strict";

const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const request = require("../request.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

function getFileContentsBuffer(filePath, options) {
    return makeFileRequest(filePath, options).then(function(res) {
        return res.arrayBuffer();
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

module.exports = {
    getFileContentsBuffer: getFileContentsBuffer,
    getFileContentsString: getFileContentsString
};
