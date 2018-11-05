const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");
const { getSingleValue, getValueForKey, parseXML, translateDiskSpace } = require("./dav.js");

function getQuota(options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, "/"),
        method: "PROPFIND",
        headers: { Depth: 0 },
        responseType: "text"
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions)
        .then(responseHandlers.handleResponseCode)
        .then(parseXML)
        .then(parseQuota);
}

function parseQuota(result) {
    let responseItem = null,
        multistatus,
        propstat,
        props,
        quotaUsed,
        quotaAvail;
    try {
        multistatus = getValueForKey("multistatus", result);
        responseItem = getSingleValue(getValueForKey("response", multistatus));
    } catch (e) {
        /* ignore */
    }
    if (responseItem) {
        propstat = getSingleValue(getValueForKey("propstat", responseItem));
        props = getSingleValue(getValueForKey("prop", propstat));
        quotaUsed = getSingleValue(getValueForKey("quota-used-bytes", props));
        quotaAvail = getSingleValue(getValueForKey("quota-available-bytes", props));
        return typeof quotaUsed !== "undefined" && typeof quotaAvail !== "undefined"
            ? {
                  used: parseInt(quotaUsed, 10),
                  available: translateDiskSpace(quotaAvail)
              }
            : null;
    }
    return null;
}

module.exports = {
    getQuota
};
