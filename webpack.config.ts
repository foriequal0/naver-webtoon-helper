import * as path from "path";

import CopyPlugin = require("copy-webpack-plugin");
import webpack from "webpack";

export default <webpack.Configuration>{
  entry: {
    detail: "./src/page/detail.ts",
    list: "./src/page/list.ts",
    weekday: "./src/page/weekday.ts",
    weekdayList: "./src/page/weekdayList.ts",
    mobile: "./src/page/mobile.ts",
    options: "./src/page/options.ts",
    background: "./src/background/main.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV !== "production" ? "inline-source-map" : false,
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "static", to: "." }],
    }),
  ],
};
