const setFetchMethod = require("./request.js").setFetchMethod,
    createClient = require("./factory.js").createClient;

createClient.setFetchMethod = setFetchMethod;

module.exports = createClient;
