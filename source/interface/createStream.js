var joinURL = require("url-join");

var Stream = require("stream"),
    PassThroughStream = Stream.PassThrough;

var fetch = require("../request.js").fetch,
    responseHandlers = require("../response.js");

function createReadStream(filePath, options) {
    var outStream = new PassThroughStream();
    getFileStream(filePath, options)
        .then(function __handleStream(stream) {
            stream.pipe(outStream);
        })
        .catch(function __handleReadError(err) {
            outStream.emit("error", err);
        });
    return outStream;
}

function getFileStream(filePath, options) {
    if (typeof options.range === "object" && typeof options.range.start === "number") {
        var rangeHeader = "bytes=" + options.range.start + "-";
        if (typeof options.range.end === "number") {
            rangeHeader += options.range.end;
        }
        options.headers.Range = rangeHeader;
    }
    var fetchURL = joinURL(options.remoteURL, filePath),
        fetchOptions = {
            method: "GET",
            headers: options.headers
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode)
        .then(function __mapResultToStream(res) {
            return res.body;
        });
}

module.exports = {
    createReadStream
};
