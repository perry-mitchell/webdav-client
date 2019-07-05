const xml2js = require("xml2js");

function extractKey(xmlKey) {
    const match = /^([a-z0-9]+:)?(.+)$/i.exec(xmlKey);
    if (!match) {
        throw new Error(`Failed to extract key for response XML: ${xmlKey}`);
    }
    return match[2];
}

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
    const parser = new xml2js.Parser({ emptyTag: true, ignoreAttrs: true });
    return new Promise(function(resolve, reject) {
        parser.parseString(xml, function __handleParseResult(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });
}

function propsToStat(props, filename, isDetailed = false) {
    const path = require("path-posix");
    // Last modified time, raw size, item type and mime
    const lastMod = getSingleValue(getValueForKey("getlastmodified", props));
    const rawSize = getSingleValue(getValueForKey("getcontentlength", props)) || "0";
    const resourceType = getSingleValue(getValueForKey("resourcetype", props));
    const mimeType = getSingleValue(getValueForKey("getcontenttype", props));
    const type = getValueForKey("collection", resourceType) ? "directory" : "file";
    const etag = getSingleValue(getValueForKey("getetag", props));
    const stat = {
        filename: filename,
        basename: path.basename(filename),
        lastmod: lastMod,
        size: parseInt(rawSize, 10),
        type: type,
        etag: etag ? etag.replace(/"/g, "") : null
    };
    if (type === "file") {
        stat.mime = mimeType && typeof mimeType === "string" ? mimeType.split(";")[0] : "";
    }
    if (isDetailed) {
        stat.props = Object.keys(props)
            .map(extractKey)
            .reduce(
                (output, propName) =>
                    Object.assign(output, {
                        [propName]: getSingleValue(getValueForKey(propName, props))
                    }),
                {}
            );
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

function parseClarkNotation(propertyName) {
    const result = propertyName.match(/^{([^}]+)}(.*)$/);
    if (!result) {
        return;
    }

    return {
        name: result[2],
        namespace: result[1]
    };
}

function buildPropFindBody(properties, xmlNamespaces) {
    // set DAV namespace to d - best practice over all
    xmlNamespaces["DAV:"] = "d";
    let body = '<?xml version="1.0"?>\n' + "<d:propfind ";
    for (let namespace in xmlNamespaces) {
        body += " xmlns:" + xmlNamespaces[namespace] + '="' + namespace + '"';
    }
    body += ">\n" + "  <d:prop>\n";

    for (let ii in properties) {
        if (!properties.hasOwnProperty(ii)) {
            continue;
        }

        const property = parseClarkNotation(properties[ii]);
        if (xmlNamespaces[property.namespace]) {
            body += "    <" + xmlNamespaces[property.namespace] + ":" + property.name + " />\n";
        } else {
            body += "    <x:" + property.name + ' xmlns:x="' + property.namespace + '" />\n';
        }
    }
    body += "  </d:prop>\n";
    body += "</d:propfind>";
    return body;
}

module.exports = {
    getSingleValue,
    getValueForKey,
    parseXML,
    propsToStat,
    translateDiskSpace,
    buildPropFindBody
};
