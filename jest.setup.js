// Jest setup file for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.YOUTUBE_API_KEY = 'test-api-key';
process.env.YOUTUBE_CHANNEL_ID = 'test-channel-id';
process.env.CHANNEL_NAME = 'Test Channel';
process.env.CHANNEL_EMAIL = 'test@example.com';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Helper to create mock environment
  mockEnv: (overrides = {}) => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      YOUTUBE_API_KEY: 'test-api-key',
      YOUTUBE_CHANNEL_ID: 'test-channel-id',
      CHANNEL_NAME: 'Test Channel',
      CHANNEL_EMAIL: 'test@example.com',
      ...overrides,
    };
    return () => {
      process.env = originalEnv;
    };
  },
  
  // Helper to create mock file system operations
  mockFs: () => {
    const fs = require('fs-extra');
    return {
      readFile: jest.spyOn(fs, 'readFile'),
      writeFile: jest.spyOn(fs, 'writeFile'),
      ensureDir: jest.spyOn(fs, 'ensureDir'),
      pathExists: jest.spyOn(fs, 'pathExists'),
    };
  },
  
  // Helper to create mock API responses
  mockApiResponse: (data, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  }),
};

// Global test timeout for async operations
jest.setTimeout(10000);