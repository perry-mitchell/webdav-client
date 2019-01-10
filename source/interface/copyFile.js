const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

function copyFile(filename, destination, options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filename)),
        method: "COPY",
        headers: {
            Destination: joinURL(options.remoteURL, encodePath(destination))
        }
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    copyFile
};
