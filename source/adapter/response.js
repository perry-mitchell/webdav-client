module.exports = {

    handleResponseCode: function(response) {
        var status = parseInt(response.status, 10);
        if (status >= 400) {
            throw new Error("Invalid response: " + status + " " + response.statusText);
        }
        return response;
    }

};
