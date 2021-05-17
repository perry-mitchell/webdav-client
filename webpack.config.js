const path = require("path");
const { DefinePlugin } = require("webpack");

const DIST = path.resolve(__dirname, "./dist/web");

module.exports = {
    entry: path.resolve(__dirname, "./source/index.ts"),

    module: {
        rules: [
            {
                test: /\.[jt]s$/,
                loader: "babel-loader",
                options: {
                    presets: [
                        ["@babel/preset-env", {
                            targets: {
                                "ie": 11
                            }
                        }],
                        "@babel/preset-typescript"
                    ],
                    plugins: [
                        "babel-plugin-transform-async-to-promises"
                    ]
                }
            }
        ]
    },

    node: false,

    output: {
        filename: "webdav.js",
        path: DIST,
        library: "WebDAV",
        libraryTarget: "umd"
    },

    plugins: [
        new DefinePlugin({
            WEB: "true"
        })
    ],

    resolve: {
        extensions: [".ts", ".js", ".json"],
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
        }
    },

    target: "web"
};
