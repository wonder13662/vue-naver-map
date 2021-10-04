const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.config')();

config.configureWebpack = merge(config.configureWebpack, {
  // https://webpack.js.org/configuration/devtool/#production
  devtool: 'cheap-module-source-map',
  // https://github.com/vuejs/vue-cli/blob/dev/docs/guide/webpack.md
  plugins: [
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      'process.env.BASE_SERVER_URL': '"https://stage.base-server.url"',
      'process.env.BASE_SOCKET_URL': '"https://stage.base-socket.url"',
    }),
  ],
});

module.exports = config;
