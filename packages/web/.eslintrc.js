module.exports = {
  extends: ['react-app', 'react-app/jest'],
  settings: {
    react: {
      version: '19.1.1',
    },
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['**/*.test.tsx', '**/*.test.ts', 'src/test-utils.tsx', 'src/setupTests.ts'],
};
