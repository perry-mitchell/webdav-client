const HotPatcher = require("hot-patcher");

let __patcher = null;

/**
 * Get the HotPatcher instance for patching internal methods
 * @returns {HotPatcher} The internal HotPatcher instance
 */
function getPatcher() {
    if (!__patcher) {
        __patcher = new HotPatcher();
    }
    return __patcher;
}

module.exports = {
    getPatcher
};
