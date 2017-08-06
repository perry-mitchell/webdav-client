var path = require("path"),
    xml2js = require("xml2js");

var DAV_KEY_PREFIXES = [
    "",
    "d:",
    "D:",
    "lp1:"
];

function generateKeysForName(name) {
    return DAV_KEY_PREFIXES.map(function __mapKeyName(prefix) {
        return prefix + name;
    });
}

function getSingleValue(item) {
    return Array.isArray(item) ?
        getSingleValue(item[0]) :
        item;
}

function getValueForKey(key, obj) {
    var keys,
        i,
        keyCount;
    if (typeof obj === "object") {
        keys = generateKeysForName(key);
        for (i = 0, keyCount = keys.length; i < keyCount; i += 1) {
            if (typeof obj[keys[i]] !== "undefined") {
                return obj[keys[i]];
            }
        }
    }
    return undefined;
}

function parseXML(xml) {
    var parser = new xml2js.Parser({ ignoreAttrs: true });
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
    var lastMod = getSingleValue(getValueForKey("getlastmodified", props)),
        rawSize = getSingleValue(getValueForKey("getcontentlength", props)) || "0",
        resourceType = getSingleValue(getValueForKey("resourcetype", props)),
        mimeType = getSingleValue(getValueForKey("getcontenttype", props)),
        type = getValueForKey("collection", resourceType) ?
            "directory" :
            "file";
    var stat = {
        filename: filename,
        basename: path.basename(filename),
        lastmod: lastMod,
        size: parseInt(rawSize, 10),
        type: type
    };
    if (type === "file") {
        stat.mime = mimeType ?
            mimeType.split(";")[0] :
            "";
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
