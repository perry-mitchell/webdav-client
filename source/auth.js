function generateBasicAuthHeader(username, password) {
    const buffer = Buffer.from(`${username}:${password}`);
    return `Basic ${buffer.toString("base64")}`;
}

function generateTokenAuthHeader(tokenInfo) {
    return `${tokenInfo.token_type} ${tokenInfo.access_token}`;
}

module.exports = {
    generateBasicAuthHeader,
    generateTokenAuthHeader
};
