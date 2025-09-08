/**
 * CI Integration tests
 * Tests that verify CI/CD pipeline functionality
 */

const fs = require('fs-extra');
const path = require('path');

describe('CI/CD Integration', () => {
  test('should have GitHub Actions workflow files', async () => {
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    const ciWorkflow = path.join(workflowsDir, 'ci.yml');
    
    expect(await fs.pathExists(workflowsDir)).toBe(true);
    expect(await fs.pathExists(ciWorkflow)).toBe(true);
  });

  test('should have ESLint configuration', async () => {
    const eslintConfig = path.join(process.cwd(), '.eslintrc.js');
    expect(await fs.pathExists(eslintConfig)).toBe(true);
    
    // Test that ESLint config is valid
    const config = require('../../.eslintrc.js');
    expect(config.env).toBeDefined();
    expect(config.rules).toBeDefined();
  });

  test('should have Prettier configuration', async () => {
    const prettierConfig = path.join(process.cwd(), '.prettierrc');
    const prettierIgnore = path.join(process.cwd(), '.prettierignore');
    
    expect(await fs.pathExists(prettierConfig)).toBe(true);
    expect(await fs.pathExists(prettierIgnore)).toBe(true);
  });

  test('should have Jest configuration', async () => {
    const jestConfig = path.join(process.cwd(), 'jest.config.js');
    const jestSetup = path.join(process.cwd(), 'jest.setup.js');
    
    expect(await fs.pathExists(jestConfig)).toBe(true);
    expect(await fs.pathExists(jestSetup)).toBe(true);
    
    // Test that Jest config is valid
    const config = require('../../jest.config.js');
    expect(config.testEnvironment).toBe('node');
    expect(config.collectCoverageFrom).toBeDefined();
  });

  test('should have required npm scripts', () => {
    const packageJson = require('../../package.json');
    const requiredScripts = [
      'test',
      'test:coverage',
      'lint',
      'lint:fix',
      'format',
      'format:check'
    ];

    requiredScripts.forEach(script => {
      expect(packageJson.scripts[script]).toBeDefined();
    });
  });

  test('should validate project structure', async () => {
    const requiredDirs = [
      'src',
      'src/automation',
      'src/config',
      'src/content',
      'src/templates'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      expect(await fs.pathExists(dirPath)).toBe(true);
    }
  });
});