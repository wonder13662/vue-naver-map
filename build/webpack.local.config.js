const webpack = require('webpack');
const path = require('path');

module.exports = {
  css: {
    sourceMap: true,
    // https://cli.vuejs.org/config/#css-extract
    extract: false,
  },
  devServer: {
    // https://webpack.js.org/configuration/dev-server/#devserverclientloglevel
    clientLogLevel: 'warning',
    // https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback
    historyApiFallback: {
      // https://github.com/bripkens/connect-history-api-fallback#rewrites
      rewrites: [
        {
          from: /.*/,
          to: path.posix.join('/', 'index.html'),
        },
      ],
    },
    // https://webpack.js.org/configuration/dev-server/#devserverhot
    hot: true,
    // https://webpack.js.org/configuration/dev-server/#devservercompress
    compress: true,
    host: '0.0.0.0',
    port: 5090,
    // https://webpack.js.org/configuration/dev-server/#devserveropen
    // true to open your default browser
    open: true,
    // https://webpack.js.org/configuration/dev-server/#devserveroverlay
    overlay: {
      warnings: true,
      errors: true,
    },
    // https://webpack.js.org/configuration/dev-server/#devserverpublicpath-
    publicPath: '/',
    // https://webpack.js.org/configuration/dev-server/#devserverwatchoptions-
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
  },
  // https://cli.vuejs.org/config/#configurewebpack
  configureWebpack: {
    // https://webpack.js.org/configuration/mode/#mode-development
    mode: 'development',
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: 'source-map',
    // https://github.com/vuejs/vue-cli/blob/dev/docs/guide/webpack.md
    plugins: [
      // https://webpack.js.org/plugins/define-plugin/
      new webpack.DefinePlugin({
        'process.env.BASE_SERVER_URL': '"https://local.base-server.url"',
        'process.env.BASE_SOCKET_URL': '"https://local.base-socket.url"',
      }),
      // https://webpack.js.org/plugins/hot-module-replacement-plugin/#root
      // HMR should never be used in production.
      new webpack.HotModuleReplacementPlugin(),
      // The file public/index.html is a template that will be processed with html-webpack-plugin
      // https://cli.vuejs.org/guide/html-and-static-assets.html#html
    ],
    optimization: {
      // https://webpack.js.org/configuration/optimization/#optimizationnamedmodules
      namedModules: true,
      // https://webpack.js.org/configuration/optimization/#optimizationnoemitonerrors
      noEmitOnErrors: true,
    },
    // https://www.apollographql.com/docs/react/integrations/webpack/
    module: {
      rules: [
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: 'graphql-tag/loader',
        },
      ],
    },
  },
};
