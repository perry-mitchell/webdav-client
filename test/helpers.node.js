const path = require("path");
const fs = require("fs");
const axios = require("axios");
const rimraf = require("rimraf").sync;
const copyDir = require("copy-dir").sync;
const { createClient: createWebDAVClient, getPatcher } = require("../dist/node/index.js");
const { createWebDAVServer } = require("./server/index.js");
const { PASSWORD, PORT, USERNAME } = require("./server/credentials.js");

function clean() {
    rimraf(path.resolve(__dirname, "./testContents"));
    copyDir(path.resolve(__dirname, "./serverContents"), path.resolve(__dirname, "./testContents"));
}

function restoreRequests() {
    getPatcher().restore("request");
}

function returnFakeResponse(xml) {
    getPatcher().patch("request", function fakeRequest() {
        return Promise.resolve({
            data: xml
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function useCustomXmlResponse(xmlFile) {
    returnFakeResponse(
        fs.readFileSync(path.resolve(__dirname, `./responses/${xmlFile}.xml`), "utf8")
    );
}

function useRequestSpy() {
    const spy = sinon.spy(axios);
    getPatcher().patch("request", spy);
    return spy;
}

module.exports = {
    SERVER_PASSWORD: PASSWORD,
    SERVER_PORT: PORT,
    SERVER_USERNAME: USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    restoreRequests,
    returnFakeResponse,
    sleep,
    useCustomXmlResponse,
    useRequestSpy
};
