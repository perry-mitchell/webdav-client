var nodeFetch = require("node-fetch");

var fetch = nodeFetch;
if (typeof window === "object" && typeof window.fetch === "function") {
    fetch = window.fetch;
}

module.exports = function request(url, options) {
    return fetch(url, options);
};
