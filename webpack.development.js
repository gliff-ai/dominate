const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");
const { version } = require("./package.json");

const port = process.env.PORT || 3000;

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    host: "localhost",
    port,
    historyApiFallback: true,
    open: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      STORE_URL: JSON.stringify(
        process.env.API_URL || "http://localhost:8000/"
      ),
      IS_MONITORED: false,
      SENTRY_ENVIRONMENT: "development",
      IS_SENTRY_DEBUG: true,
      VERSION: JSON.stringify(version),
    }),
  ],
});
