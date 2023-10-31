import { builtinModules } from "node:module";
import path from "node:path";
import url from "node:url";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json" assert { type: "json" };

const EXTENSIONS = [".js", ".ts"];
const ENV = process.env.ENV ? process.env.ENV : "node";
const FMT = process.env.FMT ? process.env.FMT : "esm";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const plugins = [
    commonjs(),
    typescript({
        tsconfig: "tsconfig.json"
    }),
    resolve({
        browser: ENV === "web",
        extensions: EXTENSIONS
    })
];
if (ENV !== "node") {
    plugins.unshift(
        alias({
            entries: [
                { find: "he", replacement: path.resolve(__dirname, "./util/he.stub.ts") },
                { find: "http", replacement: path.resolve(__dirname, "./util/http.stub.ts") },
                { find: "node-fetch", replacement: path.resolve(__dirname, "./util/node-fetch.stub.ts") }
            ]
        })
    );
}
const extension = FMT === "cjs" ? "cjs" : "js";
const externals =
    FMT === "esm"
        ? [...builtinModules, ...(pkg.dependencies ? Object.keys(pkg.dependencies) : [])]
        : [...builtinModules];

export default {
    external: externals,
    input: "source/index.ts",
    output: [
        {
            dir: `dist/${ENV}`,
            format: FMT,
            entryFileNames: `[name].${extension}`
        }
    ],
    plugins
};
