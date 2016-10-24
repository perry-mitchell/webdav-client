var fetch = require("node-fetch");

var responseHandlers = require("./response.js");

module.exports = {

    deleteItem: function deleteItem(url, targetPath) {
        return fetch(url + targetPath, {
                method: "DELETE"
            })
            .then(responseHandlers.handleResponseCode);
    },

    moveItem: function moveItem(url, filePath, targetFilePath) {
        return fetch(url + filePath, {
                method: "MOVE",
                headers: {
                    Destination: url + targetFilePath
                }
            })
            .then(responseHandlers.handleResponseCode);
    }

};
