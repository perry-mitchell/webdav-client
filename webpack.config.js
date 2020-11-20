const path = require("path");
const { DefinePlugin } = require("webpack");

const DIST = path.resolve(__dirname, "./dist/web");

module.exports = {
    entry: path.resolve(__dirname, "./source/index.js"),

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                options: {
                    presets: [
                        ["@babel/preset-env", {
                            targets: {
                                "ie": 11
                            }
                        }]
                    ]
                }
            }
        ]
    },

    output: {
        filename: "webdav.js",
        path: DIST,
        library: "WebDAV",
        libraryTarget: "umd"
    },

    plugins: [
        new DefinePlugin({
            WEB: "true",
            process: "process/browser"
        })
    ],

    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
            "crypto": require.resolve("crypto-browserify"),
            "path": require.resolve("path-browserify"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
        }
    }
};
