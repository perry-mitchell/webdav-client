"use strict";

const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const davTools = require("./dav.js");
const urlTools = require("../url.js");
const request = require("../request.js");
const encodePath = request.encodePath;
const fetch = request.fetch;
const parseXML = davTools.parseXML;

const getValueForKey = davTools.getValueForKey;
const getSingleValue = davTools.getSingleValue;

function getStat(filename, options) {
    const fetchURL = joinURL(options.remoteURL, encodePath(filename));
    const fetchOptions = {
        method: "PROPFIND",
        headers: merge({ Depth: 0 }, options.headers),
        agent: options.agent
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
    getStat: getStat
};
