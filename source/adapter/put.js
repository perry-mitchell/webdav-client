var fetch = require("node-fetch");

var responseHandlers = require("./response.js");

module.exports = {

    createDirectory: function createDirectory(url, directoryPath) {
        return fetch(url + directoryPath, {
                method: "MKCOL"
            })
            .then(responseHandlers.handleResponseCode);
    },

    putFileContents: function putFileContents(url, filePath, data) {
        return fetch(url + filePath, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Length": data.length
                },
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
