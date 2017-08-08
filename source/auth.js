"use strict";

function generateBasicAuthHeader(username, password) {
  return "Basic " + new Buffer(username + ":" + password).toString("base64");
}

module.exports = {
  generateBasicAuthHeader
};
