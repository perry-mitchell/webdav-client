const { handleResponseCode, processResponsePayload } = require("../response.js");
const { encodePath, joinURL, prepareRequestOptions, request } = require("../request.js");
const { parseXML, translateDiskSpace } = require("./dav.js");

function getQuota(options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, "/"),
        method: "PROPFIND",
        headers: {
            Accept: "text/plain",
            Depth: 0
        },
        responseType: "text"
    };
    let response = null;
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions)
        .then(handleResponseCode)
        .then(res => {
            response = res;
            return res.data;
        })
        .then(parseXML)
        .then(parseQuota)
        .then(result => processResponsePayload(response, result, options.details));
}

function parseQuota(result) {
    try {
        const [responseItem] = result.multistatus.response;
        const {
            propstat: {
                prop: { "quota-used-bytes": quotaUsed, "quota-available-bytes": quotaAvail }
            }
        } = responseItem;
        return typeof quotaUsed !== "undefined" && typeof quotaAvail !== "undefined"
            ? {
                  used: parseInt(quotaUsed, 10),
                  available: translateDiskSpace(quotaAvail)
              }
            : null;
    } catch (err) {
        /* ignore */
    }
    return null;
}

module.exports = {
    getQuota
};
