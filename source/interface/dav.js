const xmlParser = require("fast-xml-parser");

function parseXML(xml) {
    return new Promise(resolve => {
        const result = xmlParser.parse(xml, {
            arrayMode: false,
            ignoreNameSpace: true
        });
        resolve(result);
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
    const type = resourceType && typeof resourceType === "object" && typeof resourceType.collection !== "undefined"
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
