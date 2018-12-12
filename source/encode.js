const { decode, encode } = require("base-64");

function fromBase64(str) {
    return decode(str);
}

function toBase64(str) {
    return encode(str);
}

module.exports = {
    fromBase64,
    toBase64
};
