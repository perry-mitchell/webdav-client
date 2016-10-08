"use strict";

var Bro = require("brototype");

var __iCanHaz = Bro.prototype.iCanHaz;

Bro.prototype.iCanHaz1 = function() {
    var keys = Array.prototype.slice.call(arguments),
        val,
        keysLen = keys.length;
    for (var i = 0; i < keysLen; i += 1) {
        val = __iCanHaz.call(this, keys[i]);
        if (val !== undefined) {
            return val;
        }
    }
    return undefined;
};

module.exports = Bro;
