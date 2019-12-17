const { cowl } = require("./request.js");
const { createClient } = require("./factory.js");
const { getPatcher } = require("./patcher.js");

/**
 * @module WebDAV
 */
module.exports = {
    cowl,
    createClient,
    getPatcher
};
