"use strict";

const Stream = require("stream");
const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const request = require("../request.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

const PassThroughStream = Stream.PassThrough;

function createReadStream(filePath, options) {
    const outStream = new PassThroughStream();
    getFileStream(filePath, options)
        .then(function __handleStream(stream) {
            stream.pipe(outStream);
        })
        .catch(function __handleReadError(err) {
            outStream.emit("error", err);
        });
    return outStream;
}

function createWriteStream(filePath, options) {
    const writeStream = new PassThroughStream();
    if (options.overwrite === false) {
        options.headers["If-None-Match"] = "*";
    }
    const fetchURL = joinURL(options.remoteURL, encodePath(filePath));
    const fetchOptions = merge(options, {
        method: "PUT"
    });
    // Outside merge because merge will strip type information
    fetchOptions.body = writeStream;
    fetch(fetchURL, fetchOptions);
    return writeStream;
}

function getFileStream(filePath, options) {
    let rangeHeader;
    if (typeof options.range === "object" && typeof options.range.start === "number") {
        rangeHeader = "bytes=" + options.range.start + "-";
        if (typeof options.range.end === "number") {
            rangeHeader += options.range.end;
        }
        options.headers.Range = rangeHeader;
    }
    const fetchURL = joinURL(options.remoteURL, encodePath(filePath));
    const fetchOptions = {
        method: "GET",
        headers: options.headers,
        agent: options.agent
    };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode)
        .then(function __mapResultToStream(res) {
            return res.body;
        });
}

module.exports = {
    createReadStream,
    createWriteStream
};
