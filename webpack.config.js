/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const zopfli = require("node-zopfli");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const nodeExternals = require("webpack-node-externals");

function abs(...args) {
  return path.join(__dirname, ...args);
}

const SRC_ROOT = abs("./src");
const PUBLIC_ROOT = abs("./public");
const DIST_ROOT = abs("./dist");
const DIST_PUBLIC = abs("./dist/public");

const DEVTOOL =
  process.env.NODE_ENV === "production" ? false : "inline-source-map";
const MODE = "production";

/** @type {Array<import('webpack').Configuration>} */
module.exports = [
  {
    devtool: DEVTOOL,
    entry: path.join(SRC_ROOT, "client/index.jsx"),
    mode: MODE,
    module: {
      rules: [
        {
          resourceQuery: (value) => {
            const query = new URLSearchParams(value);
            return query.has("raw");
          },
          type: "asset/source",
        },
        {
          exclude: /[\\/]esm[\\/]|node_modules/,
          test: /\.jsx?$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env"], "@babel/preset-react"],
            },
          },
        },
      ],
    },
    name: "client",
    optimization: {
      splitChunks: {
        cacheGroups: {
          framework: {
            chunks: "all",
            name: "framework",
            priority: 60,
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          },
          vendor: {
            chunks: "all",
            name: "vendor",
            priority: 30,
            reuseExistingChunk: true,
            test: (module) => {
              return module.context && module.context.includes("node_modules");
            },
          },
        },
        maxInitialRequests: 20,
      },
    },
    output: {
      path: DIST_PUBLIC,
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: PUBLIC_ROOT, to: DIST_PUBLIC }],
      }),
      new CompressionPlugin({
        algorithm(input, compressionOptions, callback) {
          return zopfli.gzip(input, compressionOptions, callback);
        },
        test: /\.(jsx?)$/,
      }),
      ...(process.env.ENABLE_BUNDLE_ANALYZE
        ? [
            new BundleAnalyzerPlugin({
              generateStatsFile: true,
              openAnalyzer: false,
            }),
          ]
        : []),
    ],
    resolve: {
      extensions: [".js", ".jsx"],
    },
    target: "web",
  },
  {
    devtool: DEVTOOL,
    entry: path.join(SRC_ROOT, "server/index.js"),
    externals: [nodeExternals()],
    mode: MODE,
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(js|mjs|jsx)$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env"], "@babel/preset-react"],
            },
          },
        },
      ],
    },
    name: "server",
    optimization: {
      minimize: false,
    },
    output: {
      filename: "server.js",
      path: DIST_ROOT,
    },
    resolve: {
      extensions: [".mjs", ".js", ".jsx"],
    },
    target: "node",
  },
];
