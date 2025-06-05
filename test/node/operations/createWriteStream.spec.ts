import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { PassThrough, Writable } from "node:stream";
import waitOn from "wait-on";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    RequestSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    useRequestSpy
} from "../../helpers.node.js";
import { Response, WebDAVClient } from "../../../source/types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const TEST_CONTENTS = path.resolve(dirname, "../../testContents");
const IMAGE_SOURCE = path.join(TEST_CONTENTS, "./alrighty.jpg");
const TEXT_SOURCE = path.join(TEST_CONTENTS, "./notes.txt");

function waitOnFile(filename: string) {
    return new Promise<void>(function (resolve, reject) {
        waitOn(
            {
                resources: [filename],
                interval: 50,
                timeout: 500,
                window: 0
            },
            function (err: Error) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            }
        );
    });
}

describe("createWriteStream", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: RequestSpy;

    beforeEach(async function () {
        const port = await nextPort();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        server = createWebDAVServer(port);
        requestSpy = useRequestSpy();

        await server.start();
    });

    afterEach(async function () {
        restoreRequests();
        await new Promise(resolve => {
            setTimeout(resolve, 500);
        });
        await server.stop();
    });

    it("writes the file to the remote", async function () {
        const targetFile = path.join(TEST_CONTENTS, "./alrighty2.jpg");
        const writeStream = client.createWriteStream("/alrighty2.jpg");
        const readStream = fs.createReadStream(IMAGE_SOURCE);
        expect(writeStream instanceof PassThrough).to.be.true;
        await new Promise(function (resolve, reject) {
            writeStream.on("end", function () {
                // stupid stream needs time to close probably..
                waitOnFile(targetFile).then(resolve, reject);
            });
            writeStream.on("error", reject);
            readStream.pipe(writeStream);
        });
    });

    it("allows specifying custom headers", async function () {
        const writeStream = client.createWriteStream("/alrighty2.jpg", {
            headers: {
                "X-test": "test"
            }
        });
        fs.createReadStream(TEXT_SOURCE).pipe(writeStream);

        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    it("calls the callback function with the response", async function () {
        let status: number = 0;

        const readStream = fs.createReadStream(TEXT_SOURCE);
        await new Promise<Writable>(resolve => {
            const output = client.createWriteStream(
                "/test.txt",
                undefined,
                (response: Response) => {
                    status = response.status;
                    resolve(output);
                }
            );

            readStream.pipe(output);
        });

        expect(status).to.equal(201);
    });
});
