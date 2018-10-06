"use strict";

const path = require("path");
const xml2js = require("xml2js");

function findKey(baseKey, obj) {
    return Object.keys(obj).find(function __findBaseKey(itemKey) {
        const match = /^[a-z0-9]+:(.+)$/i.exec(itemKey);
        return match ? match[1] === baseKey : itemKey === baseKey;
    });
}

function getSingleValue(item) {
    return Array.isArray(item) ? getSingleValue(item[0]) : item;
}

function getValueForKey(key, obj) {
    let keys, i, keyCount;
    if (typeof obj === "object") {
        const actualKey = findKey(key, obj);
        if (actualKey && typeof obj[actualKey] !== "undefined") {
            return obj[actualKey];
        }
    }
    return undefined;
}

function parseXML(xml) {
    const parser = new xml2js.Parser({ ignoreAttrs: true });
    return new Promise(function(resolve, reject) {
        parser.parseString(xml, function __handleParseResult(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });
}

function propsToStat(props, filename) {
    // Last modified time, raw size, item type and mime
    const lastMod = getSingleValue(getValueForKey("getlastmodified", props));
    const rawSize = getSingleValue(getValueForKey("getcontentlength", props)) || "0";
    const resourceType = getSingleValue(getValueForKey("resourcetype", props));
    const mimeType = getSingleValue(getValueForKey("getcontenttype", props));
    const type = getValueForKey("collection", resourceType) ? "directory" : "file";
    const stat = {
        filename: filename,
        basename: path.basename(filename),
        lastmod: lastMod,
        size: parseInt(rawSize, 10),
        type: type
    };
    if (type === "file") {
        stat.mime = mimeType ? mimeType.split(";")[0] : "";
    }
    return stat;
}

function translateDiskSpace(value) {
    switch (value.toString()) {
        case "-3":
            return "unlimited";
        case "-2":
        /* falls-through */
        case "-1":
            // -1 is non-computed
            return "unknown";
        default:
            return parseInt(value, 10);
    }
}

module.exports = {
    getSingleValue: getSingleValue,
    getValueForKey: getValueForKey,
    parseXML: parseXML,
    propsToStat: propsToStat,
    translateDiskSpace: translateDiskSpace
};
