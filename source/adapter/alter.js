var fetch = require("node-fetch");

module.exports = {

    deleteItem: function deleteItem(url, targetPath) {
        return fetch(url + targetPath, {
            method: "DELETE"
        });
    },

    moveItem: function moveItem(url, filePath, targetFilePath) {
        return fetch(url + filePath, {
            method: "MOVE",
            headers: {
                Destination: url + targetFilePath
            }
        });
    }

};
