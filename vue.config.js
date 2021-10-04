const prodConfig = require('./build/webpack.prod.config');
const stagingConfig = require('./build/webpack.staging.config');
const qcConfig = require('./build/webpack.staging.config');
const devConfig = require('./build/webpack.dev.config');
const localConfig = require('./build/webpack.local.config');

function getConfig() {
  if (process.env.NODE_ENV === 'production') {
    return prodConfig;
  }
  if (process.env.NODE_ENV === 'development') {
    return devConfig;
  }
  if (process.env.NODE_ENV === 'staging') {
    // https://cli.vuejs.org/guide/mode-and-env.html#environment-variables
    // https://cli.vuejs.org/guide/mode-and-env.html#example-staging-mode
    return stagingConfig;
  }
  if (process.env.NODE_ENV === 'qc') {
    return qcConfig;
  }
  return localConfig;
}

module.exports = getConfig();
