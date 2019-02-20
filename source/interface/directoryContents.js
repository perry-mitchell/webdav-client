const pathPosix = require("path-posix");
const joinURL = require("url-join");
const { merge } = require("../merge.js");
const { handleResponseCode, processGlobFilter, processResponsePayload } = require("../response.js");
const { normaliseHREF, normalisePath } = require("../url.js");
const { getSingleValue, getValueForKey, parseXML, propsToStat } = require("./dav.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

function getDirectoryContents(remotePath, options) {
    // Join the URL and path for the request
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(remotePath), "/"),
        method: "PROPFIND",
        headers: {
            Accept: "text/plain",
            Depth: options.deep ? "infinity" : 1
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
        .then(result => getDirectoryFiles(result, options.remotePath, remotePath, options.details))
        .then(files => processResponsePayload(response, files, options.details))
        .then(files => {
            if (options.glob && options.glob.pattern) {
                return processGlobFilter(files, options.glob);
            }
            return files;
        });
}

function getDirectoryFiles(result, serverBasePath, requestPath, isDetailed = false) {
    const remoteTargetPath = pathPosix.join(serverBasePath, requestPath, "/");
    const serverBase = pathPosix.join(serverBasePath, "/");
    // Extract the response items (directory contents)
    const multiStatus = getValueForKey("multistatus", result);
    const responseItems = getValueForKey("response", multiStatus);
    return (
        responseItems
            // Filter out the item pointing to the current directory (not needed)
            .filter(item => {
                let href = getSingleValue(getValueForKey("href", item));
                href = pathPosix.join(normalisePath(normaliseHREF(href)), "/");
                return href !== serverBase && href !== remoteTargetPath;
            })
            // Map all items to a consistent output structure (results)
            .map(item => {
                // HREF is the file path (in full)
                let href = getSingleValue(getValueForKey("href", item));
                href = normaliseHREF(href);
                // Each item should contain a stat object
                const propStat = getSingleValue(getValueForKey("propstat", item));
                const props = getSingleValue(getValueForKey("prop", propStat));
                // Process the true full filename (minus the base server path)
                const filename =
                    serverBase === "/" ? normalisePath(href) : normalisePath(pathPosix.relative(serverBase, href));
                return propsToStat(props, filename, isDetailed);
            })
    );
}

module.exports = {
    getDirectoryContents
};
