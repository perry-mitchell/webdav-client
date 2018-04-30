"use strict";

const path = require("path");

const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const urlTools = require("../url.js");
const davTools = require("./dav.js");
const request = require("../request.js");
const encodePath = request.encodePath;
const fetch = request.fetch;

const getValueForKey = davTools.getValueForKey;
const getSingleValue = davTools.getSingleValue;

function getDirectoryContents(remotePathRaw, options) {
    // Strip the ending slash
    const remotePath = remotePathRaw.replace(/\/$/, "");
    // Join the URL and path for the request
    const fetchURL = joinURL(options.remoteURL, encodePath(remotePath));
    const fetchOptions = {
        method: "PROPFIND",
        headers: merge(
            {
                Depth: 1
            },
            options.headers
        ),
        agent: options.agent
    };
    return fetch(fetchURL, fetchOptions)
        .then(responseHandlers.handleResponseCode)
        .then(function __handleResponseFormat(res) {
            // Convert response to text
            return res.text();
        })
        .then(davTools.parseXML)
        .then(function __handleResult(result) {
            return getDirectoryFiles(result, options.remotePath, remotePath);
        });
}

function getDirectoryFiles(result, serverBasePath, requestPath) {
    const remoteTargetPath = path.join(serverBasePath, requestPath);
    // Extract the response items (directory contents)
    const multiStatus = getValueForKey("multistatus", result);
    const responseItems = getValueForKey("response", multiStatus);
    return (
        responseItems
            // Filter out the item pointing to the current directory (not needed)
            .filter(function __filterResponseItem(item) {
                let href = getSingleValue(getValueForKey("href", item));
                href = urlTools.normaliseHREF(href);
                href = urlTools.normalisePath(href);
                return href !== serverBasePath && href !== remoteTargetPath;
            })
            // Map all items to a consistent output structure (results)
            .map(function __mapResponseItem(item) {
                // HREF is the file path (in full)
                let href = getSingleValue(getValueForKey("href", item));
                href = urlTools.normaliseHREF(href);
                href = decodeURI(href);
                href = urlTools.normalisePath(href);
                // Each item should contain a stat object
                const propStat = getSingleValue(getValueForKey("propstat", item));
                const props = getSingleValue(getValueForKey("prop", propStat));
                // Process the true full filename (minus the base server path)
                const filename =
                    serverBasePath === "/" ? href : urlTools.normalisePath(path.relative(serverBasePath, href));
                return davTools.propsToStat(props, filename);
            })
    );
}

module.exports = {
    getDirectoryContents
};
