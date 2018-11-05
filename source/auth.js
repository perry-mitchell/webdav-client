function generateBasicAuthHeader(username, password) {
    return "Basic " + Buffer.from(username + ":" + password).toString("base64");
}
function generateTokenAuthHeader(tokenInfo) {
    return `${tokenInfo.token_type} ${tokenInfo.access_token}`;
}

module.exports = {
    generateBasicAuthHeader,
    generateTokenAuthHeader
};
