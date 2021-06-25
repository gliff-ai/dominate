const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");
const { version } = require("./package.json");

const port = process.env.PORT || 3000;

module.exports = merge(common, {
    mode: "development",
    devtool: "eval-source-map",
    devServer: {
        host: "127.0.0.1",
        port,
        historyApiFallback: true,
        open: false,
    },
    plugins: [
        new webpack.DefinePlugin({
            STORE_URL: JSON.stringify(
                process.env.API_URL || "http://127.0.0.1:8000/"
            ),
            IS_MONITORED: false,
            SENTRY_ENVIRONMENT: JSON.stringify("development"),
            IS_SENTRY_DEBUG: true,
            VERSION: JSON.stringify(version),
        }),
    ],
});
