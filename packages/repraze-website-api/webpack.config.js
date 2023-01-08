const path = require("path");
const nodeExternals = require("webpack-node-externals");
// const {ESBuildMinifyPlugin} = require("esbuild-loader");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const serverConfig = {
    target: "node",
    node: {
        __filename: false,
        __dirname: false,
    },
    entry: {
        app: [path.resolve(__dirname, "src", "repraze-server", "index.ts")],
    },
    output: {
        filename: "server.bundle.js",
        path: path.resolve(__dirname, "build"),
        publicPath: path.resolve(__dirname, "build"),
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)?$/,
                use: {
                    loader: "esbuild-loader",
                    options: {
                        loader: "ts",
                        target: "node16",
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
        modules: ["node_modules"],
    },
    externals: [nodeExternals({})],
    devtool: "source-map",
};

module.exports = [publicClientConfig, adminClientConfig, serverConfig];
