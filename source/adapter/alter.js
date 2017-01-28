var fetch = require("node-fetch"),
    deepmerge = require("deepmerge");

var responseHandlers = require("./response.js");

module.exports = {

    deleteItem: function deleteItem(url, targetPath, options) {
        options = options || { headers: {} };
        return fetch(url + targetPath, {
                method: "DELETE",
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode);
    },

    moveItem: function moveItem(url, filePath, targetFilePath, options) {
        options = options || { headers: {} };
        return fetch(url + filePath, {
                method: "MOVE",
                headers: deepmerge(
                    {
                        Destination: url + targetFilePath
                    },
                    options.headers
                )
            })
            .then(responseHandlers.handleResponseCode);
    }

};
