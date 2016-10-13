module.exports = {

    implantCredentials: function(url, username, password) {
        return (username && username.length > 0) ?
            url.replace(/(https?:\/\/)/i, "$1" + username + ":" + password + "@") :
            url;
    },

    /**
     * Strips the end slash off of a URL
     */
    sanitiseBaseURL: function(url) {
        return url
            .trim()
            .replace(/\/$/, "");
    }

};
