/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    html: '<!DOCTYPE html><html><head></head><body></body></html>',
    url: 'http://localhost',
    userAgent: 'Agent/007',
  },
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).tsx',
    '**/?(*.)+(spec|test).ts',
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
