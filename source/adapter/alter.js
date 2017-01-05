var fetch = require("node-fetch");
var deepmerge = require("deepmerge");

var responseHandlers = require("./response.js");

function getAlterItemDefaults() {
    return {
        headers: { },
    };
}

module.exports = {

    deleteItem: function deleteItem(url, targetPath, options) {
        options = deepmerge.all([
            getAlterItemDefaults(),
            options || {}
        ]);
        return fetch(url + targetPath, {
                method: "DELETE",
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode);
    },

    moveItem: function moveItem(url, filePath, targetFilePath, options) {
        options = deepmerge.all([
            getAlterItemDefaults(),
            options || {},
            {
                headers: {
                    Destination: url + targetFilePath
                }
            }
        ]);
        return fetch(url + filePath, {
                method: "MOVE",
                headers: options.headers
            })
            .then(responseHandlers.handleResponseCode);
    }

};
