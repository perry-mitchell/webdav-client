"use strict";

const { generateDigestAuthHeader } = require("./auth.js");
const { merge } = require("./merge.js");

const digest = { nc: 0, algorithm: "md5" };

let hasDigestAuth = false;

function makeNonce() {
    const cnonceSize = 32;
    const nonceRaw = "abcdef0123456789";

    let uid = "";
    for (let i = 0; i < cnonceSize; ++i) {
        uid += nonceRaw[Math.floor(Math.random() * nonceRaw.length)];
    }
    return uid;
}

function parseAuth(response) {
    const authHeader = response.headers.get("www-authenticate");

    if (authHeader.split(/\s/)[0].toLowerCase() !== "digest") {
        return false;
    }

    const re = /([a-z0-9_-]+)=(?:"([^"]+)"|([a-z0-9_-]+))/gi;
    for (;;) {
        var match = re.exec(authHeader);
        if (!match) {
            break;
        }
        digest[match[1]] = match[2] || match[3];
    }

    digest.nc++;
    digest.cnonce = makeNonce();

    return true;
}

function fetch(fetchMethod, url, options) {
    if (hasDigestAuth) {
        options = merge(options, { headers: { Authorization: generateDigestAuthHeader(url, options, digest) } });
    }

    return fetchMethod(url, options).then(function(response) {
        if (response.status == 401) {
            hasDigestAuth = parseAuth(response);

            if (hasDigestAuth) {
                options = merge(options, {
                    headers: { Authorization: generateDigestAuthHeader(url, options, digest) }
                });

                return fetchMethod(url, options).then(function(response2) {
                    if (response2.status == 401) {
                        hasDigestAuth = false;
                    } else {
                        digest.nc++;
                    }
                    return response2;
                });
            }
        } else {
            digest.nc++;
        }
        return response;
    });
}

module.exports = fetch;
