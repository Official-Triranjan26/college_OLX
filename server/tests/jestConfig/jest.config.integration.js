const path = require('path');

module.exports = {
  // Go up 2 levels: tests/jestConfig -> tests -> server (root)
  rootDir: path.resolve(__dirname, '../..'),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000,
  maxWorkers: 1, // Runs sequentially to prevent DB race conditions
};