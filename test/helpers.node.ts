import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { fetch } from "@buttercup/fetch";
import { rimraf } from "rimraf";
import copyDir from "copy-dir";
import sinon from "sinon";
import { getPatcher } from "../source/index.js";
import { PASSWORD, PORT, USERNAME } from "./server/credentials.js";

export { createClient as createWebDAVClient } from "../source/index.js";
export { createWebDAVServer } from "./server/index.js";

export const SERVER_PASSWORD = PASSWORD;
export const SERVER_PORT = PORT;
export const SERVER_USERNAME = USERNAME;

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function clean() {
    rimraf.sync(path.resolve(dirname, "./testContents"));
    copyDir.sync(
        path.resolve(dirname, "./serverContents"),
        path.resolve(dirname, "./testContents")
    );
}

export function restoreRequests() {
    getPatcher().restore("request");
}

export function returnFakeResponse(xml: string) {
    getPatcher().patch("request", function fakeRequest() {
        return Promise.resolve({
            text: () => Promise.resolve(xml)
        });
    });
}

export function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function useCustomXmlResponse(xmlFile) {
    returnFakeResponse(
        fs.readFileSync(path.resolve(dirname, `./responses/${xmlFile}.xml`), "utf8")
    );
}

export function useRequestSpy() {
    const spy = sinon.spy(fetch);
    // @ts-ignore
    getPatcher().patch("fetch", spy);
    return spy;
}
