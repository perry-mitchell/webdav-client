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
    var keys = generateKeysForName(key);
    for (var i = 0, keyCount = keys.length; i < keyCount; i += 1) {
        if (typeof obj[keys[i]] !== "undefined") {
            return obj[keys[i]];
        }
    }
    return undefined;
}

module.exports = {
    getSingleValue: getSingleValue,
    getValueForKey: getValueForKey
};
