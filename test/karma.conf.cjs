const { builtinModules } = require("node:module");
const path = require("node:path");
const alias = require("@rollup/plugin-alias");
const typescript = require("@rollup/plugin-typescript");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");

const EXTENSIONS = [".js", ".ts"];

let browsers = ["ChromeCustom"]
if (process.env.CI) {
    browsers = ["ChromeCustom", "FirefoxHeadless"];
}

module.exports = function (config) {
    config.set({
        basePath: "../",
        frameworks: ["mocha", "chai", "sinon"],
        plugins: [
            require("karma-rollup-preprocessor"),
            require("karma-chrome-launcher"),
            require("karma-firefox-launcher"),
            require("karma-mocha"),
            require("karma-chai"),
            require("karma-sinon"),
            require("karma-spec-reporter")
        ],
        files: ["test/web/**/*.spec.js"],
        exclude: [],
        preprocessors: {
            "src/**/*.ts": ["rollup"],
            "test/web/**/*.spec.js": ["rollup"]
        },
        reporters: ["spec", "progress"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        customLaunchers: {
            ChromeCustom: {
                base: "ChromeHeadless",
                flags: ["--disable-web-security"],
                debug: true
            },
            FirefoxHeadless: {
                base: "Firefox",
                flags: ["-headless"]
            }
        },
        browsers,
        rollupPreprocessor: {
            external: [...builtinModules],
            output: {
                format: "cjs",
                entryFileNames: `[name].cjs`
            },
            plugins: [
                resolve({
                    browser: true,
                    extensions: EXTENSIONS
                }),
                typescript({
                    tsconfig: path.resolve(__dirname, "tsconfig.json")
                }),
                commonjs(),
                alias({
                    entries: [
                        { find: "he", replacement: path.resolve(__dirname, "../util/he.stub.ts") },
                        { find: "http", replacement: path.resolve(__dirname, "../util/http.stub.ts") },
                        { find: "node-fetch", replacement: path.resolve(__dirname, "../util/node-fetch.stub.ts") }
                    ]
                })
            ]
        },
        singleRun: true
    });
};
