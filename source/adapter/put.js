var fetch = require("node-fetch");

module.exports = {

    createDirectory: function createDirectory(url, directoryPath) {
        return fetch(url + directoryPath, {
            method: "MKCOL"
        });
    },

    putFileContents: function putFileContents(url, filePath, data) {
        return fetch(url + filePath, {
            method: "PUT",
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Length": data.length
            },
            body: data
        });
    }

};
