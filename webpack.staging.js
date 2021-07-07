const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");
const { version } = require("./package.json");

module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      STORE_URL: JSON.stringify("https://store.staging.gliff.app/"),
      IS_MONITORED: true,
      SENTRY_ENVIRONMENT: JSON.stringify("staging"),
      IS_SENTRY_DEBUG: true,
      VERSION: JSON.stringify(version),
    }),
  ],
});
