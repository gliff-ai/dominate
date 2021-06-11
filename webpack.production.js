const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs",
    clean: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      STORE_URL: JSON.stringify("https://store.gliff.app/"),
      IS_MONITORED: true,
      SENTRY_ENVIRONMENT: "production",
      IS_SENTRY_DEBUG: false,
      VERSION: version,
    }),
  ],
});
