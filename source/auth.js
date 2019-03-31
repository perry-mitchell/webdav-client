const crypto = require("crypto");
const { toBase64 } = require("./encode.js");

function generateBasicAuthHeader(username, password) {
    const encoded = toBase64(`${username}:${password}`);
    return `Basic ${encoded}`;
}

function generateTokenAuthHeader(tokenInfo) {
    return `${tokenInfo.token_type} ${tokenInfo.access_token}`;
}

function generateDigestAuthHeader(options, digest) {
    function md5(data) {
        return crypto
            .createHash("md5")
            .update(data)
            .digest("hex");
    }

    function ha1Compute(algorithm, user, realm, pass, nonce, cnonce) {
        const ha1 = md5(`${user}:${realm}:${pass}`);
        if (algorithm && algorithm.toLowerCase() === "md5-sess") {
            return md5(`${ha1}:${nonce}:${cnonce}`);
        } else {
            return ha1;
        }
    }

    const url = options.url.replace("//", "");
    const uri = url.indexOf("/") == -1 ? "/" : url.slice(url.indexOf("/"));

    const method = options.method ? options.method.toUpperCase() : "GET";

    const qop = /(^|,)\s*auth\s*($|,)/.test(digest.qop) ? "auth" : false;
    const ncString = `00000000${digest.nc}`.slice(-8);
    const cnonce = digest.cnonce;
    const ha1 = ha1Compute(digest.algorithm, digest.username, digest.realm, digest.password, digest.nonce, digest.cnonce);
    const ha2 = md5(`${method}:${uri}`);

    const digestResponse = qop
        ? md5(`${ha1}:${digest.nonce}:${ncString}:${digest.cnonce}:${qop}:${ha2}`)
        : md5(`${ha1}:${digest.nonce}:${ha2}`);

    const authValues = {
        username: digest.username,
        realm: digest.realm,
        nonce: digest.nonce,
        uri,
        qop,
        response: digestResponse,
        nc: ncString,
        cnonce: digest.cnonce,
        algorithm: digest.algorithm,
        opaque: digest.opaque
    };

    const authHeader = [];
    for (var k in authValues) {
        if (authValues[k]) {
            if (k === "qop" || k === "nc" || k === "algorithm") {
                authHeader.push(`${k}=${authValues[k]}`);
            } else {
                authHeader.push(`${k}="${authValues[k]}"`);
            }
        }
    }

    return `Digest ${authHeader.join(", ")}`;
}

module.exports = {
    generateBasicAuthHeader,
    generateTokenAuthHeader,
    generateDigestAuthHeader
};
