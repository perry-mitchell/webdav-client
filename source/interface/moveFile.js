const responseHandlers = require("../response.js");
const { encodePath, joinURL, prepareRequestOptions, request } = require("../request.js");

function moveFile(filename, destination, options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filename)),
        method: "MOVE",
        headers: {
            Destination: joinURL(options.remoteURL, encodePath(destination))
        }
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    moveFile
};
