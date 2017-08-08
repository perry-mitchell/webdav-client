"use strict";

const deepmerge = require("deepmerge");

const responseHandlers = require("../response.js");
const fetch = require("../request.js").fetch;
const davTools = require("./dav.js");
const parseXML = require("./dav.js").parseXML;

const getValueForKey = davTools.getValueForKey;
const getSingleValue = davTools.getSingleValue;
const translateDiskSpace = davTools.translateDiskSpace;

function getQuota(options) {
    let fetchURL = options.remoteURL + "/";
    const fetchOptions = {
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
    let responseItem = null,
        multistatus,
        propstat,
        props,
        quotaUsed,
        quotaAvail;
    try {
        multistatus = getValueForKey("multistatus", result);
        responseItem = getSingleValue(getValueForKey("response", multistatus));
    } catch (e) { /* ignore */ }
    if (responseItem) {
        propstat = getSingleValue(getValueForKey("propstat", responseItem));
        props = getSingleValue(getValueForKey("prop", propstat));
        quotaUsed = getSingleValue(getValueForKey("quota-used-bytes", props));
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
