module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'clients/**/*.js',
    'utils/**/*.js',
    'index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 10000,
  verbose: true
};