"use strict";

const joinURL = require("url-join");

const fetch = require("../request.js").fetch;
const responseHandlers = require("../response.js");

function createDirectory(dirPath, options) {
  const fetchURL = joinURL(options.remoteURL, dirPath);
  const fetchOptions = {
    method: "MKCOL",
    headers: options.headers
  };
  return fetch(fetchURL, fetchOptions).then(
    responseHandlers.handleResponseCode
  );
}

module.exports = {
  createDirectory: createDirectory
};
