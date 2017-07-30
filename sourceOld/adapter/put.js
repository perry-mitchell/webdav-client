var Stream = require("stream"),
    PassThroughStream = Stream.PassThrough,
    deepmerge = require("deepmerge");

var responseHandlers = require("./response.js"),
    fetch = require("./request.js").fetch;

function getPutContentsDefaults() {
    return {
        headers: {
            "Content-Type": "application/octet-stream"
        },
        overwrite: true
    };
}

module.exports = {

    createDirectory: function createDirectory(url, directoryPath, options) {
        options = deepmerge({ headers: {} }, options || {});
        return fetch(url + directoryPath, {
                method: "MKCOL",
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode);
    },

    createWriteStream: function createWriteStream(url, filePath, options) {
        options = deepmerge({ headers: {} }, options || {});
        var writeStream = new PassThroughStream();
        // if (typeof options.range === "object" && typeof options.range.start === "number") {
        //     var rangeHeader = "bytes=" + options.range.start + "-";
        //     if (typeof options.range.end === "number") {
        //         rangeHeader += options.range.end;
        //     }
        //     options.headers.Range = rangeHeader;
        // }
        if (options.overwrite === false) {
            options.headers["If-None-Match"] = "*";
        }
        fetch(url + filePath, {
            method: "PUT",
            headers: options.headers,
            body: writeStream
        });
        return writeStream;
    },

    putFileContents: function putFileContents(url, filePath, data, options) {
        options = deepmerge.all([
            getPutContentsDefaults(),
            { headers: { "Content-Length": data.length } },
            options || {}
        ]);
        if (options.overwrite === false) {
            options.headers["If-None-Match"] = "*";
        }
        return fetch(url + filePath, {
                method: "PUT",
                headers: options.headers,
                body: data
            })
            .then(responseHandlers.handleResponseCode);
    }

};
