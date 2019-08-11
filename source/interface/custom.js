const { handleResponseCode } = require("../response.js");
const { prepareRequestOptions, request } = require("../request.js");

function customRequest(requestOptions, options) {
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions).then(handleResponseCode);
}

module.exports = {
    customRequest
};
