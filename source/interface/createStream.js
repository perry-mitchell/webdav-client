const Stream = require("stream");
const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

const PassThroughStream = Stream.PassThrough;

function createReadStream(filePath, options) {
    const outStream = new PassThroughStream();
    getFileStream(filePath, options)
        .then(stream => {
            stream.pipe(outStream);
        })
        .catch(err => {
            outStream.emit("error", err);
        });
    return outStream;
}

function createWriteStream(filePath, options) {
    const writeStream = new PassThroughStream();
    const headers = {};
    if (options.overwrite === false) {
        headers["If-None-Match"] = "*";
    }
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filePath)),
        method: "PUT",
        headers,
        body: writeStream
    };
    prepareRequestOptions(requestOptions, options);
    request(requestOptions)
        .then(responseHandlers.handleResponseCode)
        .catch(err => {
            writeStream.emit("error", err);
        });
    return writeStream;
}

function getFileStream(filePath, options) {
    let rangeHeader;
    const headers = {};
    if (typeof options.range === "object" && typeof options.range.start === "number") {
        rangeHeader = "bytes=" + options.range.start + "-";
        if (typeof options.range.end === "number") {
            rangeHeader += options.range.end;
        }
        headers.Range = rangeHeader;
    }
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filePath)),
        method: "GET",
        headers
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions)
        .then(responseHandlers.handleResponseCode)
        .then(function __mapResultToStream(res) {
            return res.body;
        });
}

module.exports = {
    createReadStream,
    createWriteStream
};
