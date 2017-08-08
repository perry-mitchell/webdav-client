"use strict";

require("./polyfill.js");

const path = require("path");

const createWebDAVClient = require("../../source/index.js");
const baseWebDAVServer = require("../server/index.js");

const createWebDAVServer = baseWebDAVServer.webdavClient;

createWebDAVServer.test = baseWebDAVServer.test;

const expect = require("chai").expect;
const sinon = require("sinon");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;

function clean() {
  rimraf(path.resolve(__dirname, "../testContents"));
  copyDir(
    path.resolve(__dirname, "../serverContents"),
    path.resolve(__dirname, "../testContents")
  );
}

function restoreFetch() {
  createWebDAVClient.setFetchMethod();
}

function returnFakeResponse(xml) {
  createWebDAVClient.setFetchMethod(function fakeFetch() {
    return Promise.resolve({
      text: function() {
        return xml;
      }
    });
  });
}

Object.assign(global, {
  clean: clean,
  createWebDAVClient: createWebDAVClient,
  createWebDAVServer: createWebDAVServer,
  expect: expect,
  restoreFetch: restoreFetch,
  returnFakeResponse: returnFakeResponse,
  sinon: sinon
});
