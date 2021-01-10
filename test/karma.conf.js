const webpackConfig = require("../webpack.config.js");

delete webpackConfig.entry;
delete webpackConfig.output;
webpackConfig.mode = "development";

module.exports = function(config) {
    config.set({
        basePath: "../",
        frameworks: ["mocha", "chai", "sinon"],
        plugins: [
            require("karma-webpack"),
            require("karma-chrome-launcher"),
            require("karma-firefox-launcher"),
            require("karma-mocha"),
            require("karma-chai"),
            require("karma-sinon"),
            require("karma-spec-reporter")
        ],
        files: ["test/web/*.spec.js"],
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
            CustomChrome: {
                base: "ChromeHeadless",
                flags: ["--disable-web-security"],
                debug: true
            }
        },
        browsers: ["FirefoxHeadless"],
        webpack: webpackConfig,
        singleRun: true
    });
};
