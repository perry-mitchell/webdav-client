import md5 from "md5";
import { ha1Compute } from "../tools/crypto.js";
import { DigestContext, Response } from "../types.js";

const NONCE_CHARS = "abcdef0123456789";
const NONCE_SIZE = 32;

export function createDigestContext(username: string, password: string): DigestContext {
    return { username, password, nc: 0, algorithm: "md5", hasDigestAuth: false };
}

export function generateDigestAuthHeader(options, digest: DigestContext): string {
    const url = options.url.replace("//", "");
    const uri = url.indexOf("/") == -1 ? "/" : url.slice(url.indexOf("/"));
    const method = options.method ? options.method.toUpperCase() : "GET";
    const qop = /(^|,)\s*auth\s*($|,)/.test(digest.qop) ? "auth" : false;
    const ncString = `00000000${digest.nc}`.slice(-8);
    const ha1 = ha1Compute(
        digest.algorithm,
        digest.username,
        digest.realm,
        digest.password,
        digest.nonce,
        digest.cnonce
    );
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
    for (const k in authValues) {
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

function makeNonce(): string {
    let uid = "";
    for (let i = 0; i < NONCE_SIZE; ++i) {
        uid = `${uid}${NONCE_CHARS[Math.floor(Math.random() * NONCE_CHARS.length)]}`;
    }
    return uid;
}

export function parseDigestAuth(response: Response, _digest: DigestContext): boolean {
    const authHeader = response.headers["www-authenticate"] || "";
    if (authHeader.split(/\s/)[0].toLowerCase() !== "digest") {
        return false;
    }
    const re = /([a-z0-9_-]+)=(?:"([^"]+)"|([a-z0-9_-]+))/gi;
    for (;;) {
        const match = re.exec(authHeader);
        if (!match) {
            break;
        }
        _digest[match[1]] = match[2] || match[3];
    }
    _digest.nc += 1;
    _digest.cnonce = makeNonce();
    return true;
}
