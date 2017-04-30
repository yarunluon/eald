const Dotenv = require('dotenv-webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'create-form': ['./src/create-form.js'],
  },
  output: {
    libraryTarget: 'this',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: './.env',
      safe: false,
    }),
    new CopyWebpackPlugin([
      { from: 'vendor' },
    ]),
  ],
};
