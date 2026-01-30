//@ts-check

"use strict";

const path = require("path");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const nodeClientConfig = {
    target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: "./src/node/nodeClientMain.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, "dist"),
        filename: "nodeClientMain.js",
        libraryTarget: "commonjs2",
    },
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vscodeignore file
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    devtool: "nosources-source-map",
    infrastructureLogging: {
        level: "log", // enables logging required for problem matchers
    },
};

/** @type WebpackConfig */
const browserClientConfig = {
    mode: "none",
    target: "webworker", // web extensions run in a webworker context
    entry: {
        browserClientMain: "./src/browser/browserClientMain.ts",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "commonjs",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    resolve: {
        mainFields: ["module", "main"],
        extensions: [".ts", ".js"], // support ts-files and js-files
        alias: {},
        fallback: {
            path: require.resolve("path-browserify"),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    externals: {
        vscode: "commonjs vscode", // ignored because it doesn't exist
    },
    performance: {
        hints: false,
    },
    devtool: "nosources-source-map",
};

/** @type WebpackConfig */
const browserServerConfig = {
    mode: "none",
    target: "webworker", // web extensions run in a webworker context
    entry: {
        browserServerMain: "./src/browser/browserServerMain.ts",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "var",
        library: "serverExportVar",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    resolve: {
        mainFields: ["module", "main"],
        extensions: [".ts", ".js"], // support ts-files and js-files
        alias: {},
        fallback: {
            //path: require.resolve("path-browserify")
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
            {
                test: /\.wasm$/,
                type: "asset/inline",
            },
        ],
    },
    externals: {
        vscode: "commonjs vscode", // ignored because it doesn't exist
    },
    performance: {
        hints: false,
    },
    devtool: "nosources-source-map",

    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
    },
};

module.exports = [nodeClientConfig, browserClientConfig, browserServerConfig];
