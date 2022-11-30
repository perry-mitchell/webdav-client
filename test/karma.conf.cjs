const webpackConfig = require("../webpack.config.cjs");

delete webpackConfig.entry;
delete webpackConfig.output;
webpackConfig.mode = "development";

let browsers = ["ChromeCustom"];
if (process.env.CI) {
    browsers = ["ChromeCustom", "FirefoxHeadless"];
}

module.exports = function (config) {
    config.set({
        basePath: "../",
        frameworks: ["mocha", "chai", "sinon", "webpack"],
        plugins: [
            require("karma-webpack"),
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
            "src/**/*.ts": ["webpack"],
            "test/web/**/*.spec.js": ["webpack"]
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
        webpack: webpackConfig,
        singleRun: true
    });
};
