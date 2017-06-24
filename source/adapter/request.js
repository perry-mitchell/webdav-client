var nodeFetch = require("node-fetch");

var fetch = nodeFetch;

// // For some reason window.fetch doesn't work in some cases
// if (typeof window === "object" && typeof window.fetch === "function") {
//     fetch = window.fetch;
// }

module.exports = function request(url, options) {
    return fetch(url, options);
};
