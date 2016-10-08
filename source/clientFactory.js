var urlTools = require("./url.js"),
    getAdapter = require("./adapter/get.js");

module.exports = {

    createClient: function(remoteURL, username, password) {
        var __url = urlTools.sanitiseBaseURL(remoteURL);
        __url = urlTools.implantCredentials(__url, username, password);

        return {

            getDirectoryContents: function getDirectoryContents(remotePath) {
                return getAdapter.getContents(__url, remotePath);
            }

        };
    }

};
