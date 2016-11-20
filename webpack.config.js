const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

const loaders = [
  {
    test: /\.json?$/,
    loader: 'json',
  },
  {
    test: /\.jsx??$/,
    exclude: /node_modules/,
    loader: "babel",
    query: {
      presets: [
        "es2015",
        "react",
        "stage-0",
      ],
      plugins: [],
    },
  },
];

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    background: path.resolve('src/background', 'main.js'),
    options: path.resolve('src/options', 'main.js'),
    popup: path.resolve('src/popup', 'main.js'),
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new WebpackShellPlugin({ onBuildStart: [
      'node scripts/utils.js editor.json santa-editor',
      'node scripts/utils.js viewer.json santa',
    ] }),
    new CopyWebpackPlugin([
      {
        from: 'src/**/*.css',
        flatten: true,
      },
      {
        from: 'manifest.json',
        to: 'manifest.json',
      },
      {
        from: 'assets/**/*',
        toType: 'file',
        to: '',
      },
      {
        from: 'src/contentScripts/*.js',
        to: 'scripts',
        flatten: true,
      }],
      {
        copyUnmodified: true,
      }),
    new HtmlWebpackPlugin({
      title: 'SantaDevTools Options',
      main: 'options.js',
      template: path.resolve('src', 'index.ejs'),
      filename: 'options.html',
    }),
    new HtmlWebpackPlugin({
      title: 'SantaDevTools Popup',
      main: 'popup.js',
      template: path.resolve('src', 'index.ejs'),
      filename: 'popup.html',
      css: 'popup.css',
    }),
  ],
  module: {
    loaders,
  },
  devServer: {
    contentBase: './build',
    compress: true,
  },
};
