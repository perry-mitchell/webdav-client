const joinURL = require("url-join"),
    deepmerge = require("deepmerge");

const responseHandlers = require("../response.js"),
    fetch = require("../request.js").fetch,
    davTools = require("./dav.js"),
    parseXML = require("./dav.js").parseXML,
    urlTools = require("../url.js");

const getValueForKey = davTools.getValueForKey,
    getSingleValue = davTools.getSingleValue;

function getStat(filename, options) {
    const fetchURL = joinURL(options.remoteURL, filename),
        fetchOptions = {
            method: "PROPFIND",
            headers: deepmerge(
                { Depth: 0 },
                options.headers
            )
        };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode)
        .then(function __convertToText(res) {
            return res.text();
        })
        .then(parseXML)
        .then(function __handleResult(xml) {
            return parseStat(xml, filename);
        });
}

function parseStat(result, filename) {
    let responseItem = null,
        multistatus;
    try {
        multistatus = getValueForKey("multistatus", result);
        responseItem = getSingleValue(getValueForKey("response", multistatus));
    } catch (e) { /* ignore */ }
    if (!responseItem) {
        throw new Error("Failed getting item stat: bad response");
    }
    const propStat = getSingleValue(getValueForKey("propstat", responseItem)),
        props = getSingleValue(getValueForKey("prop", propStat));
    const filePath = urlTools.normalisePath(filename);
    return davTools.propsToStat(props, filePath);
}

module.exports = {
    getStat: getStat
};
