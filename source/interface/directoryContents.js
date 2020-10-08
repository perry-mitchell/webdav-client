const pathPosix = require("path-posix");
const { merge } = require("../merge.js");
const { handleResponseCode, processGlobFilter, processResponsePayload } = require("../response.js");
const { normaliseHREF, normalisePath } = require("../url.js");
const { parseXML, prepareFileFromProps } = require("./dav.js");
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
    const serverBase = pathPosix.join(serverBasePath, "/");
    // Extract the response items (directory contents)
    const {
        multistatus: { response: responseItems }
    } = result;
    return (
        responseItems
            // Map all items to a consistent output structure (results)
            .map(item => {
                // HREF is the file path (in full)
                const href = normaliseHREF(item.href);
                // Each item should contain a stat object
                const {
                    propstat: { prop: props }
                } = item;
                // Process the true full filename (minus the base server path)
                const filename =
                    serverBase === "/" ? normalisePath(href) : normalisePath(pathPosix.relative(serverBase, href));
                return prepareFileFromProps(props, filename, isDetailed);
            })
            // Filter out the item pointing to the current directory (not needed)
            .filter(item => item.basename && (item.type === "file" || item.filename !== requestPath.replace(/\/$/, "")))
    );
}

module.exports = {
    getDirectoryContents
};
