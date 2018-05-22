"use strict";

const crypto = require("crypto");

let username, password;

function generateBasicAuthHeader(user, pass) {
    username = user;
    password = pass;
    return "Basic " + Buffer.from(username + ":" + password).toString("base64");
}

function generateTokenAuthHeader(tokenInfo) {
    return `${tokenInfo.token_type} ${tokenInfo.access_token}`;
}

function generateDigestAuthHeader(url, options, digest) {
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

    const _url = url.replace("//", "");
    const uri = _url.indexOf("/") == -1 ? "/" : _url.slice(_url.indexOf("/"));

    const method = options.method ? options.method.toUpperCase() : "GET";

    const qop = /(^|,)\s*auth\s*($|,)/.test(digest.qop) && "auth";
    const ncString = `00000000${digest.nc}`.slice(-8);
    const cnonce = digest.cnonce;
    const ha1 = ha1Compute(digest.algorithm, username, digest.realm, password, digest.nonce, digest.cnonce);
    const ha2 = md5(`${method}:${uri}`);

    const digestResponse = qop
        ? md5(`${ha1}:${digest.nonce}:${ncString}:${digest.cnonce}:${qop}:${ha2}`)
        : md5(`${ha1}:${digest.nonce}:${ha2}`);

    const authValues = {
        username,
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
