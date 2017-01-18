var path = require("path");

var Bro = require("../brototype.js"),
    urlTools = require("../url.js");

function filterItemsByDepth(items) {
    var highestDepth = 0;
    items.forEach(function(item) {
        if (item._depth > highestDepth) {
            highestDepth = item._depth;
        }
    });
    return items.filter(function(item) {
        var depth = item._depth;
        delete item._depth;
        return depth === highestDepth;
    });
}

function parseMIME(mimeStr) {
    return mimeStr.split(";").shift();
}

function processDirectoryResult(dirPath, dirResult, targetOnly) {
    var items = [],
        responseItems = [],
        dirResultBro = Bro(dirResult);
    if (targetOnly === undefined) {
        targetOnly = false;
    }
    try {
        var multistatus = dirResultBro.iCanHaz1("d:multistatus", "D:multistatus");
        responseItems = Bro(multistatus).iCanHaz1("d:response", "D:response") || [];
    } catch (e) {}
    responseItems.forEach(function(responseItem) {
        var responseBro = Bro(responseItem),
            propstatBro = Bro(responseBro.iCanHaz1("d:propstat.0", "D:propstat.0")),
            props = propstatBro.iCanHaz1("d:prop.0", "D:prop.0"),
            propsBro = Bro(props);
        var sanitisedFilePath = decodeURIComponent(processXMLStringValue(responseBro.iCanHaz1("d:href", "D:href"))),
            serverDepth = sanitisedFilePath
                .split("/")
                .filter(function(item) {
                    return (item.trim().length > 0);
                })
                .length;
        // console.log(JSON.stringify(props, undefined, 4));
        var filename = processDirectoryResultFilename(
                dirPath,
                sanitisedFilePath       
            ).trim(),
            resourceType = processXMLStringValue(propsBro.iCanHaz1("lp1:resourcetype", "d:resourcetype", "D:resourcetype")),
            itemType = (resourceType.indexOf("d:collection") >= 0 || resourceType.indexOf("D:collection") >= 0) ?
                "directory" : "file";
        if (filename.length <= 0) {
            return;
        }
        if ((targetOnly && filename !== dirPath) || (!targetOnly && filename === dirPath)) {
            // skip self or only self
            return;
        }
        filename = "/" + filename;
        var item = {
                filename: filename,
                basename: path.basename(filename),
                lastmod: processXMLStringValue(propsBro.iCanHaz1("lp1:getlastmodified", "d:getlastmodified", "D:getlastmodified")),
                size: parseInt(processXMLStringValue(propsBro.iCanHaz1("lp1:getcontentlength", "d:getcontentlength", "D:getcontentlength")) || "0", 10),
                type: itemType,
                _depth: serverDepth
            },
            mime = processXMLStringValue(propsBro.iCanHaz1("d:getcontenttype", "D:getcontenttype"));
        if (mime) {
            item.mime = parseMIME(mime);
        }
        items.push(item);
    });
    return filterItemsByDepth(items);
}

function processDirectoryResultFilename(dirPath, resultFilename) {
    var resultFLen = resultFilename.length;
    if (resultFilename[resultFLen - 1] === "/") {
        resultFilename = resultFilename.substr(0, resultFLen - 1);
    }
    if (dirPath === "/" || dirPath === "") {
        var resultParts = resultFilename.split("/");
        return resultParts[resultParts.length - 1];
    }
    var pos = resultFilename.indexOf(dirPath);
    if (pos >= 0) {
        return resultFilename.substr(pos);
    }
    return "";
}

function processXMLStringValue(xmlVal) {
    if (Array.isArray(xmlVal)) {
        if (xmlVal.length === 1) {
            return (xmlVal.length === 1 && typeof xmlVal[0] === "string") ? xmlVal[0] : JSON.stringify(xmlVal);
        } else {
            return JSON.stringify(xmlVal);
        }
    } else if (typeof xmlVal === "string") {
        return xmlVal;
    }
    return "";
}

module.exports = {

    parseDirectoryLookup: processDirectoryResult

};
