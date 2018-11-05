const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

function deleteFile(filename, options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filename)),
        method: "DELETE"
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    deleteFile
};
