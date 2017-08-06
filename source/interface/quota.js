var xml2js = require("xml2js"),
    deepmerge = require("deepmerge")

var responseHandlers = require("../response.js"),
    fetch = require("../request.js").fetch,
    davTools = require("./dav.js"),
    parseXML = require("./dav.js").parseXML;

var getValueForKey = davTools.getValueForKey,
    getSingleValue = davTools.getSingleValue,
    translateDiskSpace = davTools.translateDiskSpace;

function getQuota(options) {
    var fetchURL = options.remoteURL + "/",
        fetchOptions = {
            method: "PROPFIND",
            headers: deepmerge(
                { Depth: 0 },
                options.headers
            )
        };
    fetchURL = fetchURL.replace(/\/+$/g, "/");
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode)
        .then(function __convertToText(res) {
            return res.text();
        })
        .then(parseXML)
        .then(parseQuota);
}

function parseQuota(result) {
    var responseItem = null;
    try {
        var multistatus = getValueForKey("multistatus", result);
        responseItem = getSingleValue(getValueForKey("response", multistatus));
    } catch (e) {}
    if (responseItem) {
        var propstat = getSingleValue(getValueForKey("propstat", responseItem)),
            props = getSingleValue(getValueForKey("prop", propstat)),
            quotaUsed = getSingleValue(getValueForKey("quota-used-bytes", props)),
            quotaAvail = getSingleValue(getValueForKey("quota-available-bytes", props));
        return (typeof quotaUsed !== "undefined" && typeof quotaAvail !== "undefined") ?
            {
                used: parseInt(quotaUsed, 10),
                available: translateDiskSpace(quotaAvail)
            } :
            null;
    }
    return null;
}

module.exports = {
    getQuota: getQuota
};
