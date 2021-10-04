module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  plugins: [
    'jest',
    'vue',
  ],
  rules: {
    quotes: ['error', 'single'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['**/tests/**/*.js', '/build/*.js'],
    }],
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never',
    }],
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2020,
  },
  overrides: [{
    files: [
      '**/__tests__/*.{j,t}s?(x)',
      '**/tests/unit/**/*.spec.{j,t}s?(x)',
    ],
    env: {
      jest: true,
    },
    plugins: ['jest'],
    extends: ['plugin:jest/recommended'],
  }],
};
