const webpack = require('webpack');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = () => ({
  css: {
    sourceMap: true,
    // https://cli.vuejs.org/config/#css-extract
    extract: true,
  },
  // https://cli.vuejs.org/config/#outputdir
  // Always use outputDir instead of modifying webpack output.path
  outputDir: 'dist',
  // https://cli.vuejs.org/config/#configurewebpack
  configureWebpack: {
    // https://webpack.js.org/configuration/mode/#mode-production
    mode: 'production',
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '',
    // https://cli.vuejs.org/guide/webpack.html#simple-configuration
    plugins: [
      // https://github.com/NMFR/optimize-css-assets-webpack-plugin - 설명 부족
      // https://github.com/cssnano/cssnano
      new OptimizeCssPlugin({
        cssProcessorOptions: { safe: true, map: { inline: false } },
      }),
      // https://webpack.js.org/plugins/hashed-module-ids-plugin/
      new webpack.HashedModuleIdsPlugin(),
      // https://webpack.js.org/plugins/compression-webpack-plugin/
      new CompressionWebpackPlugin({
        test: /\.(js|css)(\?.*)?$/i,
        // Only assets bigger than this size are processed. In bytes.
        threshold: 10240,
      }),
    ],
    optimization: {
      // TODO - optimization 항목 분석 및 업데이트
      // https://webpack.js.org/configuration/optimization/#optimizationconcatenatemodules
      concatenateModules: true,
      // https://webpack.js.org/configuration/optimization/#optimizationruntimechunk
      runtimeChunk: 'single',
      // https://webpack.js.org/configuration/optimization/#optimizationsplitchunks
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            enforce: true,
          },
        },
      },
      minimize: true,
      minimizer: [
        // https://v4.webpack.js.org/plugins/terser-webpack-plugin/#root
        new TerserPlugin({
          terserOptions: {
            warnings: false,
            // https://v4.webpack.js.org/plugins/terser-webpack-plugin/#remove-comments
            format: {
              comments: false,
            },
          },
          extractComments: false,
          parallel: true,
        }),
      ],
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
});
