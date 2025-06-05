import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { mock, Mock } from "node:test";
import { fetch } from "@buttercup/fetch";
import { rimraf } from "rimraf";
import copyDir from "copy-dir";
import getPort from "get-port";
import { getPatcher } from "../source/index.js";
import { PASSWORD, USERNAME } from "./server/credentials.js";

export { createClient as createWebDAVClient } from "../source/index.js";
export { type WebDAVServer, createWebDAVServer } from "./server/index.js";

export type FetchSpy = Mock<typeof fetch>;

export const SERVER_PASSWORD = PASSWORD;
export const SERVER_USERNAME = USERNAME;

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function clean() {
    rimraf.sync(path.resolve(dirname, "./testContents"));
    copyDir.sync(
        path.resolve(dirname, "./serverContents"),
        path.resolve(dirname, "./testContents")
    );
}

export async function nextPort(): Promise<number> {
    return getPort();
}

export function restoreRequests() {
    const patcher = getPatcher();
    if (patcher.isPatched("request")) {
        patcher.restore("request");
    }
    if (patcher.isPatched("fetch")) {
        patcher.restore("fetch");
    }
}

export function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export function useCustomXmlResponse(xmlFile: string): FetchSpy {
    return useRequestSpyWithFakeResponse(
        fs.readFileSync(path.resolve(dirname, `./responses/${xmlFile}.xml`), "utf8")
    );
}

export function useFetchSpy(): FetchSpy {
    const spy = mock.fn(fetch);
    // @ts-ignore
    getPatcher().patch("fetch", spy);
    return spy;
}

export function useRequestSpyWithFakeResponse(xml: string): FetchSpy {
    const spy = mock.fn(function fakeRequest() {
        return Promise.resolve({
            text: () => Promise.resolve(xml)
        });
    }) as unknown as FetchSpy;
    getPatcher().patch("fetch", spy);
    return spy;
}
