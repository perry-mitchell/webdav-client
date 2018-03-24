const mergeObjects = require("merge");

function merge(...args) {
    return mergeObjects.recursive(true, ...args);
}

module.exports = {
    merge
};
