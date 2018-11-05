const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

function createDirectory(dirPath, options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(dirPath)),
        method: "MKCOL"
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions).then(responseHandlers.handleResponseCode);
}

module.exports = {
    createDirectory: createDirectory
};
