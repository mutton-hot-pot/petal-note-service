var nodeExternals = require("webpack-node-externals")
var path = require('path')

module.exports = {
  entry: "./handler.js",
  target: "node",
  externals: ['aws-sdk'],
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, '.webpack'),
    filename: "handler.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      }
    ]
  }
};
