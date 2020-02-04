const xmlParser = require("fast-xml-parser");
const nestedProp = require("nested-property");

function getPropertyOfType(obj, prop, type) {
    const val = nestedProp.get(obj, prop);
    if (type === "array" && Array.isArray(val) === false) {
        return [val];
    } else if (type === "object" && Array.isArray(val)) {
        return val[0];
    }
    return val;
}

function normaliseResponse(response) {
    const output = Object.assign({}, response);
    nestedProp.set(output, "propstat", getPropertyOfType(output, "propstat", "object"));
    nestedProp.set(output, "propstat.prop", getPropertyOfType(output, "propstat.prop", "object"));
    return output;
}

function normaliseResult(result) {
    const { multistatus } = result;
    if (!multistatus) {
        throw new Error("Invalid response: No root multistatus found");
    }
    const output = {};
    output.multistatus = Array.isArray(multistatus) ? multistatus[0] : multistatus;
    nestedProp.set(output, "multistatus.response", getPropertyOfType(output, "multistatus.response", "array"));
    nestedProp.set(
        output,
        "multistatus.response",
        nestedProp.get(output, "multistatus.response").map(response => normaliseResponse(response))
    );
    console.log(JSON.stringify(output, undefined, 2));
    return output;
}

function parseXML(xml) {
    return new Promise(resolve => {
        const result = xmlParser.parse(xml, {
            arrayMode: false,
            ignoreNameSpace: true
        });
        resolve(normaliseResult(result));
    });
}

function propsToStat(props, filename, isDetailed = false) {
    const path = require("path-posix");
    // Last modified time, raw size, item type and mime
    const {
        getlastmodified: lastMod,
        getcontentlength: rawSize = "0",
        resourcetype: resourceType,
        getcontenttype: mimeType,
        getetag: etag
    } = props;
    const type =
        resourceType && typeof resourceType === "object" && typeof resourceType.collection !== "undefined"
            ? "directory"
            : "file";
    const stat = {
        filename: filename,
        basename: path.basename(filename),
        lastmod: lastMod,
        size: parseInt(rawSize, 10),
        type: type,
        etag: typeof etag === "string" ? etag.replace(/"/g, "") : null
    };
    if (type === "file") {
        stat.mime = mimeType && typeof mimeType === "string" ? mimeType.split(";")[0] : "";
    }
    if (isDetailed) {
        stat.props = props;
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
    parseXML,
    propsToStat,
    translateDiskSpace
};
