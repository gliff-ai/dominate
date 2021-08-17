const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const common = require("./webpack.common.js");
const { version } = require("./package.json");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      STORE_URL: JSON.stringify("https://store.gliff.app/"),
      IS_MONITORED: true,
      SENTRY_ENVIRONMENT: JSON.stringify("production"),
      IS_SENTRY_DEBUG: false,
      VERSION: JSON.stringify(version),
      STRIPE_KEY: JSON.stringify(
        "pk_live_51IVYtvFauXVlvS5wQWr5tmG0pj6YHjryKcFCcrszVbnXVDJDtLb2fuptyt3ErCj5z0PbhkeDc8Vs4TKHkDroYJHf00mbmXmvN3"
      ),
    }),
  ],
});
