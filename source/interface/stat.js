const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const { getSingleValue, getValueForKey, parseXML } = require("./dav.js");
const urlTools = require("../url.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

function getStat(filename, options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filename)),
        method: "PROPFIND",
        headers: { Depth: 0 }
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions)
        .then(responseHandlers.handleResponseCode)
        .then(res => res.text())
        .then(parseXML)
        .then(xml => parseStat(xml, filename));
}

function parseStat(result, filename) {
    let responseItem = null,
        multistatus;
    try {
        multistatus = getValueForKey("multistatus", result);
        responseItem = getSingleValue(getValueForKey("response", multistatus));
    } catch (e) {
        /* ignore */
    }
    if (!responseItem) {
        throw new Error("Failed getting item stat: bad response");
    }
    const propStat = getSingleValue(getValueForKey("propstat", responseItem));
    const props = getSingleValue(getValueForKey("prop", propStat));
    const filePath = urlTools.normalisePath(filename);
    return davTools.propsToStat(props, filePath);
}

module.exports = {
    getStat
};
