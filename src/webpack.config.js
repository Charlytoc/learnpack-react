const webpack = require('webpack');
const path = require('path');
const prettyConfig = require('./prettier.config.js');
const PrettierPlugin = require("./prettier.plugin.js");

const nodeModulesPath = path.resolve(__dirname, '../../node_modules');

module.exports = (files) => ({
  mode: "development",
  output: {
    filename: 'index.js',
  },
  module: {
    rules: [
        {
          test: /\.(js)$/,
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
          test: /\.(css|scss)$/, use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
              loader: "css-loader" // translates CSS into CommonJS
          }, {
              loader: "postcss-loader", //for the window error
              options: {
                plugins: () => [require(nodeModulesPath+'/autoprefixer')]
              }
          }, {
              loader: "sass-loader" // compiles Sass to CSS
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
    new PrettierPlugin(prettyConfig)
  ]
});
