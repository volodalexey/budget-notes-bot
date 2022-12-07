module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    node: true,
  },
  rules: {
    'prettier/prettier': 2, // Means error
  },
  ignorePatterns: ['dist/**/*.js'],
};
