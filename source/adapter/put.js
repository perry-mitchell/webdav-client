var deepmerge = require("deepmerge");

var responseHandlers = require("./response.js"),
    fetch = require("./request.js");

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
