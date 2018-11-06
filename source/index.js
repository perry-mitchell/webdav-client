const { axios } = require("./request.js");
const { createClient } = require("./factory.js");
const { getPatcher } = require("./patcher.js");

/**
 * @module WebDAV
 */
module.exports = {
    /**
     * Axios request library
     * @type {Function}
     * @memberof module:WebDAV
     */
    axios,
    createClient,
    getPatcher
};
