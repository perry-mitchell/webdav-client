var path = require("path");

function getOne(object, keys) {
    for (var i = 0, numKeys = keys.length; i < numKeys; i += 1) {
        try {
            var key = keys[i].split("."),
                current = object;
            while (key.length > 0) {
                var keypart = key.shift(),
                    prop = /^\d+$/.test(keypart) ?
                        parseInt(keypart, 10) :
                        keypart;
                current = current[prop];
            }
            if (current !== undefined) {
                return current;
            }
        } catch (err) {
            // ignore
        }
    }
    return undefined;
}

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
        responseItems = [];
    if (targetOnly === undefined) {
        targetOnly = false;
    }
    try {
        var multistatus = getOne(dirResult, ["d:multistatus", "D:multistatus", "multistatus"]);
        responseItems = getOne(multistatus, ["d:response", "D:response", "response"]) || [];
    } catch (e) {}
    responseItems.forEach(function(responseItem) {
        var propstat = getOne(responseItem, ["d:propstat.0", "D:propstat.0", "propstat.0"]),
            props = getOne(propstat, ["d:prop.0", "D:prop.0", "prop.0"]);
        var sanitisedFilePath = decodeURIComponent(processXMLStringValue(getOne(responseItem, ["d:href", "D:href", "href"]))),
            serverDepth = sanitisedFilePath
                .split("/")
                .filter(function(item) {
                    return (item.trim().length > 0);
                })
                .length;
        dirPath = decodeURI(dirPath);
        var filename = processDirectoryResultFilename(
                dirPath,
                sanitisedFilePath       
            ).trim(),
            resourceType = processXMLStringValue(getOne(props, ["lp1:resourcetype", "d:resourcetype", "D:resourcetype", "resourcetype"])),
            itemType = (resourceType.indexOf("d:collection") >= 0 || resourceType.indexOf("D:collection") >= 0 || resourceType.indexOf("collection") >= 0) ?
                "directory" : "file";
        if (filename.length <= 0) {
            return;
        }
        if ((targetOnly && filename !== dirPath) || (!targetOnly && filename === dirPath)) {
            // skip self or only self
            return;
        }
        filename = tieFilenameToRoot(filename);
        var item = {
                filename: filename,
                basename: path.basename(filename),
                lastmod: processXMLStringValue(getOne(props, ["lp1:getlastmodified", "d:getlastmodified", "D:getlastmodified", "getlastmodified"])),
                size: parseInt(processXMLStringValue(getOne(props, ["lp1:getcontentlength", "d:getcontentlength", "D:getcontentlength", "getcontentlength"])) || "0", 10),
                type: itemType,
                _depth: serverDepth
            },
            mime = processXMLStringValue(getOne(props, ["d:getcontenttype", "D:getcontenttype", "getcontenttype"]));
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

function tieFilenameToRoot(filename) {
    if (path && path.posix) {
        return path.posix.normalize("/" + filename);
    }
    // for when posix isn't available (web-packaged builds)
    return path.normalize("/" + filename);
}

module.exports = {

    getOne: getOne,

    parseDirectoryLookup: processDirectoryResult

};
