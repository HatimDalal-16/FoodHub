const path = require("path");
const FileIncludeWebpackPlugin = require("file-include-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  entry: {
    main: ["./src/scripts/script.js", "./src/styles/styles.css"],
  },

  cache: false,
  
  devServer: {
    watchFiles: ["src/**/*.html"],
    port: 3001,
    open: false,
    hot: false,
    liveReload: true,
  },

  // devServer: {
  //   port: 3001,
  //   open: true,
  //   hot: false,
  //   liveReload: true,
  //   watchFiles: ["src/**/*.html"],
  // },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("@tailwindcss/postcss")],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(mp4|webm)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },

  plugins: [
    new FileIncludeWebpackPlugin({
      source: "./src/templates",
      destination: "./",
      replace: [
        {
          regex: /\[\[FILE_VERSION\]\]/g,
          to: Date.now().toString(),
        },
      ],
    }),

    // Only use MiniCssExtract in production
    ...(isDev
      ? []
      : [
          new MiniCssExtractPlugin({
            filename: "css/styles.css",
          }),
        ]),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/images",
          to: "assets",
          noErrorOnMissing: true,
        },
      ],
    }),
  ],

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].js",
    clean: true,
    assetModuleFilename: "assets/[name][ext]",
  },

  mode: isDev ? "development" : "production",
};