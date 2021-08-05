const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const prettyConfig = require('./prettier.config.js');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const PrettierPlugin = require("./prettier.plugin.js");
const { nodeModulesPath } = require("./utils/config");

module.exports = (files) => ({
  mode: "development",
  output: {
    filename: 'index.js',
  },
  module: {
    rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  nodeModulesPath+'/@babel/preset-env',
                  nodeModulesPath+'/@babel/preset-react',
                ],
                plugins:[
                  require(nodeModulesPath+'/babel-plugin-syntax-dynamic-import')
                ]
              }
            },
          ]
        },
        {
          test: /\.(css)$/, use: [
          {
              loader: "css-loader" // translates CSS into CommonJS
          }]
        }, //css only files
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/, use: {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        }, //for images
        { test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/, use: ['file-loader'] } //for fonts
    ]
  },
  resolve: {
    extensions: ['*', '.js'],
    modules: [nodeModulesPath]
  },
  resolveLoader: {
    modules: [nodeModulesPath]
  },
  stats: {
      cached: false,
      cachedAssets: false,
      chunks: false,
      modules: false
  },
  devtool: "source-map",
  plugins: [
    new ErrorOverlayPlugin(),
    new HtmlWebpackPlugin({
        // favicon: '4geeks.ico',
        template: path.resolve(__dirname, './template.html')
    }),
    new PrettierPlugin(prettyConfig)
  ]
});
