// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

require("dotenv").config();

const stylesHandler = "style-loader";
const { version } = require("./package.json");

module.exports = (env) => {
  const isProduction = env.NODE_ENV == "production";

  const config = {
    entry: {
      content: {
        import: "./src/entrypoints/content.ts",
        filename: "./content.js",
      },
      background: {
        import: "./src/entrypoints/background.ts",
        filename: "./background.js",
      },
      popup: {
        import: "./src/entrypoints/popup/index.ts",
        filename: "./popup/index.js",
      },
    },
    output: {
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      // Add your plugins here
      // Learn more about plugins from https://webpack.js.org/configuration/plugins/

      new CopyPlugin({
        patterns: [
          {
            from: "./src/entrypoints/popup/index.html",
            to: "./popup/index.html",
          },
          {
            from: "./src/entrypoints/popup/bootstrap.min.css",
            to: "./popup/bootstrap.min.css",
          },
          { from: "./src/icons", to: "./icons" },
          {
            from: `./src/manifest.json`,
            to: "./manifest.json",
            transform(content, path) {
              const manifest = JSON.parse(content);
              manifest["version"] = version;
              return JSON.stringify(manifest, null, 2);
            },
          },
        ],
      }),
      new webpack.EnvironmentPlugin({
        API_KEY: process.env.API_KEY,
      }),
      new CleanWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/i,
          exclude: ["/node_modules/"],
          loader: "babel-loader",
        },
        {
          test: /\.css$/i,
          use: [stylesHandler, "css-loader", "postcss-loader"],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: "asset",
        },

        // Add your rules for custom modules here
        // Learn more about loaders from https://webpack.js.org/loaders/
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      minimize: false,
    },
  };

  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }

  return config;
};
