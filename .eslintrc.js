module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  env: { browser: true },
  extends: ['eslint:recommended'],
  rules: {
    'padding-line-between-statements': 'warn',
    'eslint-disable-next-line no-console': 'off',
    'lines-between-class-members': [
      'warn',
      'always',
      { exceptAfterSingleLine: true }
    ],
    'lines-around-directive': 'warn',
    'no-constant-condition': 'off',
    'no-unused-expressions': 'off',
    'no-useless-return': 'warn',
    'no-empty-function': 'off',
    'no-throw-literal': 'warn',
    'no-unreachable': 'warn',
    'no-unused-vars': 'off',
    'prefer-const': 'warn',
    'no-undef': 'off',
    'no-empty': 'off',
    'no-var': 'warn',
    'eqeqeq': 'warn',
    'semi': 'warn',
    'yoda': 'warn',
    'no-else-return': 'warn',
    'wrap-iife': 'warn',
    'spaced-comment': 'warn',
    'no-confusing-arrow': 'warn',
    'no-console': ['warn', { 'allow': ['warn', 'error'] }],
    'no-const-assign': 'warn',
    'no-multiple-empty-lines': 'warn',
    'no-redeclare': 'warn',
    'no-mixed-spaces-and-tabs': 'warn',
    'no-case-declarations': 'off'
  }
};
