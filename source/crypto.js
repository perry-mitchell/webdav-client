const { createHash } = require("crypto");

function md5(data) {
    return createHash("md5").update(data).digest("hex");
}

function ha1Compute(algorithm, user, realm, pass, nonce, cnonce) {
    const ha1 = md5(`${user}:${realm}:${pass}`);
    if (algorithm && algorithm.toLowerCase() === "md5-sess") {
        return md5(`${ha1}:${nonce}:${cnonce}`);
    } else {
        return ha1;
    }
}

module.exports = {
    md5,
    ha1Compute
};
