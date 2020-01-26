const { merge } = require("../merge.js");
const { handleResponseCode, processResponsePayload } = require("../response.js");
const { parseXML, propsToStat } = require("./dav.js");
const urlTools = require("../url.js");
const { encodePath, joinURL, prepareRequestOptions, request } = require("../request.js");

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
    let responseItem = null;
    try {
        responseItem = result.multistatus.response;
    } catch (e) {
        /* ignore */
    }
    if (!responseItem) {
        throw new Error("Failed getting item stat: bad response");
    }
    const {
        propstat: {
            prop: props
        }
    } = responseItem;
    const filePath = urlTools.normalisePath(filename);
    return propsToStat(props, filePath, isDetailed);
}

module.exports = {
    getStat,
    parseStat
};
