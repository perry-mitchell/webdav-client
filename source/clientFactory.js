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

            getFileContents: function getFileContents(remoteFilename) {
                return getAdapter.getFileContents(__url, remoteFilename);
            },

            getTextContents: function getTextContents(remoteFilename) {
                return getAdapter.getTextContents(__url, remoteFilename);
            }

        };
    }

};
