const joinURL = require("url-join");
const { merge } = require("../merge.js");
const { handleResponseCode, processResponsePayload } = require("../response.js");
const { getSingleValue, getValueForKey, parseXML, propsToStat } = require("./dav.js");
const urlTools = require("../url.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

function getStat(filename, options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filename)),
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
        .then(xml => parseStat(xml, filename, options.details))
        .then(result => processResponsePayload(response, result, options.details));
}

function parseStat(result, filename, isDetailed = false) {
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
    return propsToStat(props, filePath, isDetailed);
}

module.exports = {
    getStat,
    parseStat
};
