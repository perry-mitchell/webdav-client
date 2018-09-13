const path = require("path");

const TEST_DIST = path.resolve(__dirname, "../../dist/test");

module.exports = {
    entry: path.resolve(__dirname, "../../source/index.js"),

    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader"
            }
        ]
    },

    output: {
        filename: "webdav.js",
        path: TEST_DIST,
        library: "webdav",
        libraryTarget: "umd"
    }
};
