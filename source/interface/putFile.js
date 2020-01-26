const joinURL = require("url-join");
const { merge } = require("../merge.js");
const responseHandlers = require("../response.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");
const { fromBase64 } = require("../encode.js");

function getPutContentsDefaults() {
    return {
        headers: {
            "Content-Type": "application/octet-stream"
        },
        overwrite: true
    };
}

function putFileContents(filePath, data, options) {
    const headers = {
        "Content-Length": data.length
    };
    if (typeof WEB === "undefined") {
        // We're running under NodeJS, so it's safe to check if the
        // input is a stream
        const stream = require("stream");
        if (data instanceof stream.Readable) {
            // Input was a stream, remove the content length as this
            // is not known yet
            delete headers["Content-Length"];
        }
    }
    const putOptions = merge(getPutContentsDefaults(), { headers }, options || {});
    if (putOptions.overwrite === false) {
        putOptions.headers["If-None-Match"] = "*";
    }
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filePath)),
        method: "PUT",
        headers: putOptions.headers,
        data
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions).then(responseHandlers.handleResponseCode);
}

function getFileUploadLink(filePath, options) {
    let url = joinURL(options.remoteURL, encodePath(filePath));
    url += "?Content-Type=application/octet-stream";
    const protocol = /^https:/i.test(url) ? "https" : "http";
    if (options.headers && options.headers.Authorization) {
        if (/^Basic /i.test(options.headers.Authorization) === false) {
            throw new Error("Failed retrieving download link: Invalid authorisation method");
        }
        const authPart = options.headers.Authorization.replace(/^Basic /i, "").trim();
        const authContents = fromBase64(authPart);
        url = url.replace(/^https?:\/\//, `${protocol}://${authContents}@`);
    }
    return url;
}

module.exports = {
    getFileUploadLink,
    putFileContents
};
