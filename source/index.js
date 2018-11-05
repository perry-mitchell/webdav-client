const { axios, setRequestMethod } = require("./request.js");
const { createClient } = require("./factory.js");

module.exports = {
    axios,
    createClient,
    setRequestMethod
};
