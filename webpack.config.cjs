const path = require("node:path");
const { DefinePlugin } = require("webpack");
const ResolveTypeScriptPlugin = require("resolve-typescript-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const DIST = path.resolve(__dirname, "./dist/web");

const smp = new SpeedMeasurePlugin();

module.exports = [
    {
        entry: path.resolve(__dirname, "./source/index.ts"),

        experiments: {
            outputModule: true
        },

        externalsType: "module",

        module: {
            rules: [
                {
                    test: /\.[jt]s$/,
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", {
                                targets: [
                                    "> 0.25%, not dead",
                                    "maintained node versions"
                                ]
                            }],
                            "@babel/preset-typescript"
                        ],
                        plugins: [
                            "babel-plugin-transform-async-to-promises"
                        ]
                    },
                    resolve: {
                        fullySpecified: false
                    }
                }
            ]
        },

        node: false,

        output: {
            filename: "index.js",
            path: DIST,
            environment: {
                module: true
            },
            library: {
                type: "module"
            }
        },

        plugins: [
            new DefinePlugin({
                WEB: "true"
            })
        ],

        resolve: {
            alias: {
                "he": path.resolve(__dirname, "./util/he.stub.ts"),
                "http": path.resolve(__dirname, "./util/http.stub.ts"),
                "node-fetch": path.resolve(__dirname, "./util/node-fetch.stub.ts")
            },
            extensions: [".js"],
            fallback: {
                buffer: false,
                crypto: false,
                dns: false,
                fs: false,
                http: false,
                https: false,
                net: false,
                path: false,
                stream: false,
                util: false
            },
            plugins: [
                // Handle .ts => .js resolution
                new ResolveTypeScriptPlugin()
            ]
        },

        target: "web"
    },
    {
        entry: path.resolve(__dirname, "./source/index.ts"),

        module: {
            rules: [
                {
                    test: /\.[jt]s$/,
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", {
                                targets: [
                                    "> 0.25%, not dead",
                                    "maintained node versions"
                                ]
                            }],
                            "@babel/preset-typescript"
                        ],
                        plugins: [
                            "babel-plugin-transform-async-to-promises"
                        ]
                    },
                    resolve: {
                        fullySpecified: false
                    }
                }
            ]
        },

        node: false,

        output: {
            filename: "index.cjs",
            path: DIST,
            library: {
                type: "commonjs"
            }
        },

        plugins: [
            new DefinePlugin({
                WEB: "true"
            })
        ],

        resolve: {
            alias: {
                "he": path.resolve(__dirname, "./util/he.stub.ts"),
                "http": path.resolve(__dirname, "./util/http.stub.ts"),
                "node-fetch": path.resolve(__dirname, "./util/node-fetch.stub.ts")
            },
            extensions: [".js"],
            fallback: {
                buffer: false,
                crypto: false,
                dns: false,
                fs: false,
                http: false,
                https: false,
                net: false,
                path: false,
                stream: false,
                util: false
            },
            plugins: [
                // Handle .ts => .js resolution
                new ResolveTypeScriptPlugin()
            ]
        },

        target: "web"
    }
].map(config => smp.wrap(config));
