const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/course-delivery-schedule-load.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(process.cwd(), 'build'),
    filename: 'loader.js' // this should match the first part of function handler in serverless.yml
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
