module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/tests/js/**/*.test.js',
    '**/tests/js/**/*.spec.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/js/setup.js'
  ],
  
  // Module paths
  moduleDirectories: [
    'node_modules',
    'assets/js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'assets/js/**/*.js',
    '!assets/js/**/*.min.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'tests/coverage/js',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Module name mapping for mocking
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/assets/js/$1'
  },
  
  // Global variables
  globals: {
    'window': {},
    'document': {},
    'jQuery': {},
    '$': {}
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000
};