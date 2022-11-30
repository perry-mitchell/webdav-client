import { Readable } from "stream";
import { expect } from "chai";
import {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    restoreRequests,
    useRequestSpy
} from "../../helpers.node.js";

function streamToBuffer(stream: Readable): Promise<Buffer> {
    const buffs: Array<Buffer> = [];
    return new Promise(function (resolve) {
        stream.on("data", function (d) {
            buffs.push(d);
        });
        stream.on("end", function () {
            resolve(Buffer.concat(buffs));
        });
    });
}

describe("createReadStream", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        this.requestSpy = useRequestSpy();
        return this.server.start();
    });

    afterEach(function () {
        restoreRequests();
        return this.server.stop();
    });

    it("streams contents of a remote file", async function () {
        const stream = this.client.createReadStream("/alrighty.jpg");
        expect(stream instanceof Readable).to.be.true;
        const buff = await streamToBuffer(stream);
        expect(buff.length).to.equal(52130);
    });

    it("streams portions (ranges) of a remote file", async function () {
        const stream1 = this.client.createReadStream("/alrighty.jpg", {
            range: { start: 0, end: 24999 }
        });
        const stream2 = this.client.createReadStream("/alrighty.jpg", {
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
        const stream = this.client.createReadStream("/alrighty.jpg", {
            range: { start: 25000 }
        });
        const buff = await streamToBuffer(stream);
        expect(buff.length).to.equal(27130);
    });

    it("allows specifying custom headers", async function () {
        this.client.createReadStream("/alrighty.jpg", {
            headers: {
                "X-test": "test"
            }
        });
        const [, requestOptions] = this.requestSpy.firstCall.args;
        expect(requestOptions).to.have.property("headers").that.has.property("X-test", "test");
    });

    it("calls callback with response", function (done) {
        const stream = this.client.createReadStream("/notes.txt", {
            callback: (response: Response) => {
                expect(response).to.have.property("status", 200);
                done();
            }
        });
        streamToBuffer(stream);
    });
});
