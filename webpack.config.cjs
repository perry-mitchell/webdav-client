const path = require("node:path");
const { DefinePlugin, IgnorePlugin } = require("webpack");
const ResolveTypeScriptPlugin = require("resolve-typescript-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const DIST = path.resolve(__dirname, "./dist/web");

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
    entry: path.resolve(__dirname, "./source/index.ts"),

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
        }),
        new IgnorePlugin({
            resourceRegExp: /^he$/
        })
    ],

    resolve: {
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
});
