require("./polyfill.js");

var path = require("path");

var createWebDAVClient = require("../../source/index.js"),
    baseWebDAVServer = require("../server/index.js"),
    createWebDAVServer = baseWebDAVServer.webdavClient;

createWebDAVServer.test = baseWebDAVServer.test;

var expect = require("chai").expect,
    sinon = require("sinon"),
    rimraf = require("rimraf").sync,
    copyDir = require("copy-dir").sync;

function clean() {
    rimraf(path.resolve(__dirname, "../testContents"));
    copyDir(path.resolve(__dirname, "../serverContents"), path.resolve(__dirname, "../testContents"));
}

Object.assign(global, {
    clean: clean,
    createWebDAVClient: createWebDAVClient,
    createWebDAVServer: createWebDAVServer,
    expect: expect,
    sinon: sinon
});
