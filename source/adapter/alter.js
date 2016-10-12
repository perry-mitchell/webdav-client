var fetch = require("node-fetch");

module.exports = {

    move: function move(url, filePath, targetFilePath) {
        return fetch(url + filePath, {
            method: "MOVE",
            headers: {
                Destination: targetFilePath
            }
        });
    }

};
