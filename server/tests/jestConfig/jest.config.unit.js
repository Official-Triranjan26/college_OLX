const path = require('path');

module.exports = {
  // Go up 2 levels: tests/jestConfig -> tests -> server (root)
  rootDir: path.resolve(__dirname, '../..'),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js', '<rootDir>/src/**/*.test.js'],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};