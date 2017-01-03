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
        var headersObj = { 
                    "Content-Type": "application/octet-stream",
                    "Content-Length": data.length 
        };
        if(typeof options !== "undefined"){
            if (options.overwrite === false) {
                Object.assign(headersObj, (!overwriteIfFileExists) ? { "If-None-Match": "*" } : null);
            }
        }
        return fetch(url + filePath, {
                method: "PUT",
                headers: headersObj,
                body: data
            })
            .then(responseHandlers.handleResponseCode);
    },

    putTextContents: function putTextContents(url, filePath, text, options) {
        var headersObj = { 
                    "Content-Type": "application/octet-stream",
                    "Content-Length": text.length 
                };
        if(typeof options !== "undefined"){
            if (options.overwrite === false) {
                Object.assign(headersObj, (!overwriteIfFileExists) ? { "If-None-Match": "*" } : null);
            }
        }
        return fetch(url + filePath, {
                method: "PUT",
                headers: headersObj,
                body: text
            })
            .then(responseHandlers.handleResponseCode);
    }

};
