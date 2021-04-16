const webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new webpack.DefinePlugin({
      STORE_URL: JSON.stringify("https://store.staging.gliff.app/"),
    }),
  ],
});
