const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

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
      STORE_URL: JSON.stringify("http://localhost:8080/"),
    }),
  ],
});
