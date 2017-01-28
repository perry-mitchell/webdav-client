module.exports = {

    generateAuthHeader: function generateAuthHeader(username, password) {
        return "Basic " + (new Buffer(username + ":" + password)).toString("base64");
    }

};
