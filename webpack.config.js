'use strict';

// Modules
// require("babel-polyfill");
// import 'babel-polyfill';
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
// var isProd = ENV === 'build' || ENV === 'server';
var isProd = ENV === 'build';

console.log("----- ENV is: " + ENV);
// console.log(isProd);

module.exports = function makeWebpackConfig () {
  var config = {};

  config.entry = isTest ? {} : {
    // app: ['./src/app/app.js']
    app: ['babel-polyfill', './src/app/app.js']
  };

  // config.entry = ["babel-polyfill", "./src/app/app.js"];

  config.output = isTest ? {} : {
    // Absolute output directory
    path: __dirname + '/dist',

    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: isProd ? '/' : 'http://localhost:8000/',

    // Filename for entry points
    // Only adds hash in build mode
    filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js'
  };

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  if (isTest) {
    config.devtool = 'inline-source-map';
  } else if (isProd) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

  // Initialize module
  config.module = {
    preLoaders: [{ test: /\.json$/, 
                   include: path.resolve(__dirname, 'node_modules/send/node_modules/send'), 
                   loader: 'json'}],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
      // exclude: [/node_modules/, path.resolve(__dirname, 'src/app/js/oidc-client.js')]
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'file'
    }, {
      test: /\.html$/,
      loader: 'raw'
    }, {
      // Jade loader
      test: /\.jade$/,
      loader: 'jade-loader'
    }]
  };

  if (isTest) {
    config.module.preLoaders.push({
      test: /\.js$/,
      exclude: [
        /\.spec\.js$/
      ],
      loader: 'isparta-instrumenter'
    })
  }

  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];

  config.plugins = [];

  // Skip rendering index.html in test mode
  if (!isTest) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/public/index.jade',
        inject: 'body'
      }),

      // Reference: https://github.com/webpack/extract-text-webpack-plugin
      // Extract css files
      // Disabled when in test mode or not in build mode
      new ExtractTextPlugin('[name].[hash].css', {disable: !isProd})
    )
  }

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new CopyWebpackPlugin([{
        from: __dirname + '/src/public'
      }])
    )
  }

  config.devServer = {
    contentBase: './src/public',
    stats: 'minimal'
  };

  // console.log(JSON.stringify(config));

  return config;

}();

