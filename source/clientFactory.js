var urlTools = require("./url.js"),
    getAdapter = require("./adapter/get.js");

module.exports = {

    createClient: function(remoteURL, username, password) {
        var __url = urlTools.sanitiseBaseURL(remoteURL);
        __url = urlTools.implantCredentials(__url, username, password);

        return {

            getDirectoryContents: function getDirectoryContents(remotePath) {
                return getAdapter.getDirectoryContents(__url, remotePath);
            },

            getFileContents: function getFileContents(remoteFilename, format) {
                format = format || "binary";
                if (["binary", "text"].indexOf(format) < 0) {
                    throw new Error("Unknown format");
                }
                return (format === "text") ?
                    getAdapter.getTextContents(__url, remoteFilename) :
                    getAdapter.getFileContents(__url, remoteFilename);
            }

        };
    }

};
