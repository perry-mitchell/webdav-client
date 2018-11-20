const path = require("path");

const { createClient: createWebDAVClient, getPatcher } = require("../../dist/index.js");
const baseWebDAVServer = require("../server/index.js");

const createWebDAVServer = baseWebDAVServer.webdavClient;

createWebDAVServer.test = baseWebDAVServer.test;

const expect = require("chai").expect;
const sinon = require("sinon");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;

function clean() {
    rimraf(path.resolve(__dirname, "../testContents"));
    copyDir(path.resolve(__dirname, "../serverContents"), path.resolve(__dirname, "../testContents"));
}

function restoreFetch() {
    getPatcher().restore("request");
}

function returnFakeResponse(xml) {
    getPatcher().patch("request", function fakeRequest() {
        return Promise.resolve({
            data: xml
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
