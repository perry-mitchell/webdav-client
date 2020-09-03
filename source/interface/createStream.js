const responseHandlers = require("../response.js");
const { encodePath, joinURL, prepareRequestOptions, request } = require("../request.js");

const NOOP = () => {};

function createReadStream(filePath, options) {
    const Stream = require("stream");
    const PassThroughStream = Stream.PassThrough;
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

function createWriteStream(filePath, options, callback = NOOP) {
    const Stream = require("stream");
    const PassThroughStream = Stream.PassThrough;
    const writeStream = new PassThroughStream();
    const headers = {};
    if (options.overwrite === false) {
        headers["If-None-Match"] = "*";
    }
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filePath)),
        method: "PUT",
        headers,
        data: writeStream,
        maxRedirects: 0
    };
    prepareRequestOptions(requestOptions, options);
    request(requestOptions)
        .then(response => {
            // Fire callback asynchronously to avoid errors
            setTimeout(callback, 0);
            return response;
        })
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
        headers,
        responseType: "stream"
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions)
        .then(responseHandlers.handleResponseCode)
        .then(res => res.data);
}

module.exports = {
    createReadStream,
    createWriteStream
};
