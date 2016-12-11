var fetch = require("node-fetch");

var responseHandlers = require("./response.js");

module.exports = {

    createDirectory: function createDirectory(url, directoryPath) {
        return fetch(url + directoryPath, {
                method: "MKCOL"
            })
            .then(responseHandlers.handleResponseCode);
    },

    putFileContents: function putFileContents(url, filePath, data, options) {
        //Set default headers
        options.headers["Content-Type"] = "application/octet-stream";
        options.headers["Content-Length"] = data.length;

        return fetch(url + filePath, {
                method: "PUT",
                headers: options.headers,
                body: data
            })
            .then(responseHandlers.handleResponseCode);
    },

    putTextContents: function putTextContents(url, filePath, text) {
        return fetch(url + filePath, {
                method: "PUT",
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Length": text.length
                },
                body: text
            })
            .then(responseHandlers.handleResponseCode);
    }

};