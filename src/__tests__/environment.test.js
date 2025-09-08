/**
 * Environment validation tests
 * Tests the basic environment setup and configuration
 */

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Clear any cached modules
    jest.resetModules();
  });

  test('should have required Node.js version', () => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(16);
  });

  test('should load environment variables in test mode', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.YOUTUBE_API_KEY).toBeDefined();
    expect(process.env.YOUTUBE_CHANNEL_ID).toBeDefined();
  });

  test('should have package.json with required fields', () => {
    const packageJson = require('../../package.json');
    
    expect(packageJson.name).toBe('pmp-youtube-channel');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.engines.node).toBeDefined();
    expect(packageJson.engines.npm).toBeDefined();
  });

  test('should have required dependencies', () => {
    const packageJson = require('../../package.json');
    const requiredDeps = [
      'axios',
      'dotenv',
      'fs-extra',
      'googleapis',
      'handlebars',
      'moment',
      'node-cron'
    ];

    requiredDeps.forEach(dep => {
      expect(packageJson.dependencies[dep]).toBeDefined();
    });
  });

  test('should have required dev dependencies', () => {
    const packageJson = require('../../package.json');
    const requiredDevDeps = [
      'eslint',
      'jest',
      'prettier'
    ];

    requiredDevDeps.forEach(dep => {
      expect(packageJson.devDependencies[dep]).toBeDefined();
    });
  });
});