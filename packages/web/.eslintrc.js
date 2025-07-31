module.exports = {
  extends: ['react-app', 'react-app/jest'],
  settings: {
    react: {
      version: '19.1.1',
    },
  },
  ignorePatterns: ['**/*.test.tsx', '**/*.test.ts', 'src/test-utils.tsx', 'src/setupTests.ts'],
  rules: {},
};
