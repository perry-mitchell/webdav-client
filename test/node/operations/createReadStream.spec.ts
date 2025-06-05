import { Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    FetchSpy,
    SERVER_PASSWORD,
    SERVER_USERNAME,
    WebDAVServer,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    nextPort,
    restoreRequests,
    useFetchSpy
} from "../../helpers.node.js";
import { Response, WebDAVClient } from "../../../source/types.js";

function streamToBuffer(stream: Readable): Promise<Buffer> {
    const buffs: Array<Buffer> = [];
    return new Promise((resolve, reject) => {
        stream.on("data", d => {
            buffs.push(d);
        });
        stream.on("end", () => {
            resolve(Buffer.concat(buffs));
        });
        stream.on("error", err => {
            reject(err);
        });
    });
}

describe("createReadStream", function () {
    let client: WebDAVClient, server: WebDAVServer, requestSpy: FetchSpy;

    beforeEach(async function () {
        const port = await nextPort();
        client = createWebDAVClient(`http://localhost:${port}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        server = createWebDAVServer(port);
        requestSpy = useFetchSpy();
        await server.start();
    });

    afterEach(async function () {
        restoreRequests();
        await server.stop();
    });

    it("streams contents of a remote file", async function () {
        const stream = client.createReadStream("/alrighty.jpg");
        expect(stream instanceof Readable).to.be.true;
        const buff = await streamToBuffer(stream);
        expect(buff.length).to.equal(52130);
    });

    it("streams portions (ranges) of a remote file", async function () {
        const stream1 = client.createReadStream("/alrighty.jpg", {
            range: { start: 0, end: 24999 }
        });
        const stream2 = client.createReadStream("/alrighty.jpg", {
            range: { start: 25000, end: 52129 }
        });
        const [part1, part2] = await Promise.all([
            streamToBuffer(stream1),
            streamToBuffer(stream2)
        ]);
        expect(part1.length).to.equal(25000);
        expect(part2.length).to.equal(27130);
    });

    it("streams a partial file when only the start is provided", async function () {
        const stream = client.createReadStream("/alrighty.jpg", {
            range: { start: 25000 }
        });
        const buff = await streamToBuffer(stream);
        expect(buff.length).to.equal(27130);
    });

    it("allows specifying custom headers", async function () {
        const stream = client.createReadStream("/alrighty.jpg", {
            headers: {
                "X-test": "test"
            }
        });
        await streamToBuffer(stream);

        const [, requestOptions] = requestSpy.mock.calls[0].arguments;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    it("calls callback with response", async function () {
        let status: number = 0;

        const stream = await new Promise<Readable>(resolve => {
            const output = client.createReadStream("/notes.txt", {
                callback: (response: Response) => {
                    status = response.status;
                    resolve(output);
                }
            });
        });

        await streamToBuffer(stream);
        expect(status).to.equal(200);
    });
});
