"use strict";

var joinURL = require("url-join");

var _require = require("../merge.js"),
    merge = _require.merge;

var responseHandlers = require("../response.js");
var request = require("../request.js");
var encodePath = request.encodePath;
var fetch = request.fetch;

function copyFile(filename, destination, options) {
    var fetchURL = joinURL(options.remoteURL, encodePath(filename));
    var fetchOptions = {
        method: "COPY",
        headers: merge({
            Destination: joinURL(options.remoteURL, destination)
        }, options.headers)
    };
    return fetch(fetchURL, fetchOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    copyFile: copyFile
};