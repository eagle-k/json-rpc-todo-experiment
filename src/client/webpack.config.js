const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// TODO: production config
module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist/"),
    filename: "[name].js",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
    }),
  ],
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  devServer: {
    port: 3000,
    proxy: {
      "/json-rpc": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
};
