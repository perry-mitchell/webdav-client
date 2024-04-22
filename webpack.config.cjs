const path = require("node:path");
const { DefinePlugin } = require("webpack");
const ResolveTypeScriptPlugin = require("resolve-typescript-plugin");
const { merge } = require("webpack-merge");

function getBasicConfig() {
    return {
        experiments: {
            outputModule: true
        },

        externals: [],

        externalsType: "module",

        module: {
            rules: [
                {
                    test: /\.[jt]s$/,
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: ["> 0.25%, not dead", "maintained node versions"]
                                }
                            ],
                            "@babel/preset-typescript"
                        ],
                        plugins: ["babel-plugin-transform-async-to-promises"]
                    },
                    resolve: {
                        fullySpecified: false
                    }
                }
            ]
        },

        node: false,

        output: {
            environment: {
                module: true
            },
            library: {
                type: "module"
            }
        },

        resolve: {
            alias: {
                // http: path.resolve(__dirname, "./util/http.stub.ts"),
                // https: path.resolve(__dirname, "./util/http.stub.ts")
                // "node-fetch": path.resolve(__dirname, "./util/node-fetch.stub.ts")
            },
            extensions: [".js"],
            fallback: {
                buffer: false,
                crypto: false,
                dns: false,
                fs: false,
                http: false,
                https: false,
                module: false,
                net: false,
                path: false,
                stream: false,
                util: false
            }
        }
    };
}

module.exports = [
    merge(getBasicConfig(), {
        entry: path.resolve(__dirname, "./source/index.ts"),

        output: {
            filename: "index.js",
            path: path.resolve(__dirname, "./dist/web")
        },

        plugins: [
            new DefinePlugin({
                TARGET: JSON.stringify("web")
            })
        ],

        resolve: {
            alias: {
                entities: path.resolve(__dirname, "./util/entities.stub.ts"),
                "node-fetch": path.resolve(__dirname, "./util/node-fetch.stub.ts")
            },
            plugins: [
                // Handle .ts => .js resolution
                new ResolveTypeScriptPlugin()
            ]
        },

        target: "web"
    }),
    merge(getBasicConfig(), {
        entry: path.resolve(__dirname, "./source/index.ts"),

        externals: ["entities"],

        output: {
            filename: "index.js",
            path: path.resolve(__dirname, "./dist/react-native"),
            chunkFormat: "commonjs"
        },

        plugins: [
            new DefinePlugin({
                TARGET: JSON.stringify("react-native")
            })
        ],

        resolve: {
            alias: {
                "node-fetch": path.resolve(__dirname, "./util/node-fetch.stub.ts")
            },
            plugins: [
                // Handle .ts => .js resolution
                new ResolveTypeScriptPlugin()
            ]
        },

        target: "web"
    })
];
