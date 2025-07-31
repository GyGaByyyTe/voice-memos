module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: __dirname + '/tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['**/*.test.ts', 'src/__tests__/**'],
  rules: {},
};
