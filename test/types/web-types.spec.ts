import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIST_NODE = path.join(REPO_ROOT, "dist", "node");
const TYPES_ENTRY = path.join(DIST_NODE, "index.d.ts");
const TSC_BIN = path.join(REPO_ROOT, "node_modules", "typescript", "bin", "tsc");
const REPO_TYPE_ROOTS = path.join(REPO_ROOT, "node_modules", "@types");

if (!existsSync(TYPES_ENTRY)) {
    throw new Error("Built declarations not found (dist/node) - run `npm run build:node` first");
}

const tempDirs: string[] = [];

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true });
    }
});

function findDeclarationFiles(dir: string): Array<string> {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return findDeclarationFiles(fullPath);
        }
        return entry.name.endsWith(".d.ts") ? [fullPath] : [];
    });
}

function writeProject(name: string, files: Record<string, string>): string {
    const dir = mkdtempSync(path.join(tmpdir(), `webdav-types-${name}-`));
    tempDirs.push(dir);
    for (const [filename, content] of Object.entries(files)) {
        writeFileSync(path.join(dir, filename), content);
    }
    return dir;
}

function tsConfig(options: {
    typeRoots: Array<string>;
    skipLibCheck: boolean;
    include: Array<string>;
}): string {
    return JSON.stringify(
        {
            compilerOptions: {
                target: "ES2020",
                module: "ESNext",
                moduleResolution: "bundler",
                lib: ["ES2020", "DOM"],
                strict: true,
                noEmit: true,
                skipLibCheck: options.skipLibCheck,
                typeRoots: options.typeRoots,
                baseUrl: ".",
                paths: {
                    webdav: [TYPES_ENTRY]
                }
            },
            include: options.include
        },
        null,
        4
    );
}

function compileProject(dir: string) {
    const result = spawnSync(process.execPath, [TSC_BIN, "-p", path.join(dir, "tsconfig.json")], {
        encoding: "utf8",
        cwd: dir
    });
    expect(result.status, `tsc failed:\n${result.stdout}\n${result.stderr}`).toBe(0);
}

const WEB_APP = `import type {
    BufferLike,
    ReadableLike,
    Response,
    WebDAVClient,
    WritableLike
} from "webdav";

const client: WebDAVClient | null = null;
export type Binary = BufferLike;
export type Streams = ReadableLike | WritableLike;
export type ResponseLike = Response;
`;

// DOM setTimeout must keep returning number: importing webdav types
// must not activate @types/node globals in a web build
const WEB_APP_CANARY =
    WEB_APP + "export const timer: number = setTimeout(() => undefined, 1000);\n";

// Without the annotation: @types/node (25.x) overrides DOM's setTimeout
// return type for the entire program whether or not webdav is imported,
// which is a TypeScript ecosystem conflict outside of webdav's control
const WEB_APP_NODE_TYPES = WEB_APP + "export const timer = setTimeout(() => undefined, 1000);\n";

const NODE_APP = `import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import { createClient } from "webdav";

const client = createClient("https://example.com/dir/", {
    username: "user",
    password: "pass"
});

// Node streams and buffers remain assignable to the neutral types
client.putFileContents("/file.txt", Readable.from(["data"]));
client.putFileContents("/file.txt", Buffer.from("data"));
const stream = client.createReadStream("/file.txt");
stream.pipe(process.stdout);
stream.on("data", () => undefined);
const writer = client.createWriteStream("/file.txt");
writer.write("data");
writer.end();
`;

describe("shipped declaration files", () => {
    it("contain no node-specific type references", () => {
        const banned: Array<[string, RegExp]> = [
            ["node: module specifier", /node:/],
            ["Buffer global", /\bBuffer\b/],
            ["NodeJS namespace", /NodeJS/],
            ["node-fetch", /node-fetch/],
            ["@buttercup/fetch", /@buttercup/]
        ];
        const offenders: Array<string> = [];
        for (const file of findDeclarationFiles(DIST_NODE)) {
            const content = readFileSync(file, "utf8");
            for (const [label, pattern] of banned) {
                if (pattern.test(content)) {
                    offenders.push(`${path.relative(REPO_ROOT, file)}: ${label}`);
                }
            }
        }
        expect(offenders, `Node-specific types leaked:\n${offenders.join("\n")}`).toEqual([]);
    });

    it("compile in a web project without @types/node installed", () => {
        const dir = writeProject("web-isolated", {
            "tsconfig.json": tsConfig({
                typeRoots: [],
                skipLibCheck: false,
                include: ["app-web.ts"]
            }),
            "app-web.ts": WEB_APP_CANARY
        });
        compileProject(dir);
    });

    it("compile in a web project where @types/node is present", () => {
        const dir = writeProject("web-node-types", {
            "tsconfig.json": tsConfig({
                typeRoots: [REPO_TYPE_ROOTS],
                skipLibCheck: false,
                include: ["app-web.ts"]
            }),
            "app-web.ts": WEB_APP_NODE_TYPES
        });
        compileProject(dir);
    });

    it("remain compatible with node streams and buffers", () => {
        const dir = writeProject("node-compat", {
            "tsconfig.json": tsConfig({
                typeRoots: [REPO_TYPE_ROOTS],
                skipLibCheck: false,
                include: ["app-node.ts"]
            }),
            "app-node.ts": NODE_APP
        });
        compileProject(dir);
    });
});
