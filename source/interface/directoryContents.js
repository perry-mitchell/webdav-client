const pathPosix = require("path-posix");
const { merge } = require("../merge.js");
const { handleResponseCode, processGlobFilter, processResponsePayload } = require("../response.js");
const { normaliseHREF, normalisePath } = require("../url.js");
const { parseXML, propsToStat } = require("./dav.js");
const { encodePath, joinURL, prepareRequestOptions, request } = require("../request.js");

function getDirectoryContents(remotePath, options) {
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
        .then(files => (options.glob ? processGlobFilter(files, options.glob) : files));
}

function getDirectoryFiles(result, serverBasePath, requestPath, isDetailed = false) {
    const remoteTargetPath = pathPosix.join(serverBasePath, requestPath, "/");
    const serverBase = pathPosix.join(serverBasePath, "/");
    // Extract the response items (directory contents)
    const {
        multistatus: { response: responseItems }
    } = result;
    return (
        responseItems
            // Filter out the item pointing to the current directory (not needed)
            .filter(item => {
                // let href = getSingleValue(getValueForKey("href", item));
                let href = item.href;
                href = pathPosix.join(normalisePath(normaliseHREF(href)), "/");
                return href !== serverBase && href !== remoteTargetPath;
            })
            // Map all items to a consistent output structure (results)
            .map(item => {
                // HREF is the file path (in full)
                let href = item.href;
                href = normaliseHREF(href);
                // Each item should contain a stat object
                const {
                    propstat: { prop: props }
                } = item;
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
