const { decode, encode } = require("base-64");

function decodeHTMLEntities(str) {
    if (typeof WEB === "undefined") {
        // Node
        const he = require("he");
        return he.decode(str);
    } else {
        // Nasty browser way
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    }
}

function fromBase64(str) {
    return decode(str);
}

function toBase64(str) {
    return encode(str);
}

module.exports = {
    decodeHTMLEntities,
    fromBase64,
    toBase64
};
