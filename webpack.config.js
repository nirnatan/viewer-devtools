const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const rules = [
  {
    test: /\.json?$/,
    use: [{ loader: 'json-loader' }],
  },
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: [{
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }],
  },
];

module.exports = {
  mode: process.env.NODE_ENV !== 'production' ? 'development' : 'production',
  devtool: 'inline-source-map',
  entry: {
    background: path.resolve('src/background', 'main.js'),
    options: path.resolve('src/options', 'main.jsx'),
    popup: path.resolve('src/popup', 'main.jsx'),
    contentActions: path.resolve('src/contentScripts', 'contentActions.js'),
    editorHelper: path.resolve('src/contentScripts', 'editorHelper.js'),
    frameDataChecker: path.resolve('src/contentScripts', 'frameDataChecker.js'),
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
    publicPath: '/',
    devtoolNamespace: 'editor-devtools',
  },
  plugins: [
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
      chunks: ['options'],
      title: 'SantaDevTools Options',
      filename: 'options.html',
      template: path.resolve('src', 'index.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      title: 'SantaDevTools Popup',
      filename: 'popup.html',
      template: path.resolve('src', 'index.html'),
      css: 'popup.css',
    }),
  ],
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    contentBase: './build',
    compress: true,
  },
};
