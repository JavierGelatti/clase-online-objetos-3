const path = require('path');
const nodeExternals = require('webpack-node-externals');

const {
  NODE_ENV = 'production',
} = process.env;

module.exports = {
  entry: path.resolve(__dirname, 'server.ts'),
  mode: NODE_ENV,
  target: 'node',
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  node: {
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '..', '..', 'server_build'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
}