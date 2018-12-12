const { toBase64 } = require("./encode.js");

function generateBasicAuthHeader(username, password) {
    const encoded = toBase64(`${username}:${password}`);
    return `Basic ${encoded}`;
}

function generateTokenAuthHeader(tokenInfo) {
    return `${tokenInfo.token_type} ${tokenInfo.access_token}`;
}

module.exports = {
    generateBasicAuthHeader,
    generateTokenAuthHeader
};
