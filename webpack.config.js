var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'templates/js/js/');
var APP_DIR = path.resolve(__dirname, 'templates/js');

var config = {
  entry: [APP_DIR + '/app.jsx', APP_DIR + '/csrf.js'],
  output: {
    path: BUILD_DIR,
    filename: 'stats.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader' 
      }
    ]
  },
  plugins: [
     new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery",
          "window.jQuery": "jquery"
      })
  ] 
};

module.exports = config;
