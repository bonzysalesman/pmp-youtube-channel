#!/usr/bin/env node

/**
 * CI/CD Validation Script
 * Validates that the CI/CD infrastructure is properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating CI/CD Infrastructure...\n');

const checks = [
  {
    name: 'GitHub Actions workflow exists',
    check: () => fs.existsSync('.github/workflows/ci.yml'),
    fix: 'Create .github/workflows/ci.yml file'
  },
  {
    name: 'ESLint configuration exists',
    check: () => fs.existsSync('.eslintrc.js'),
    fix: 'Create .eslintrc.js file'
  },
  {
    name: 'Prettier configuration exists',
    check: () => fs.existsSync('.prettierrc'),
    fix: 'Create .prettierrc file'
  },
  {
    name: 'Jest configuration exists',
    check: () => fs.existsSync('jest.config.js'),
    fix: 'Create jest.config.js file'
  },
  {
    name: 'Package.json has required scripts',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredScripts = ['test', 'test:coverage', 'lint', 'lint:fix', 'format', 'format:check'];
      return requiredScripts.every(script => pkg.scripts[script]);
    },
    fix: 'Add missing scripts to package.json'
  },
  {
    name: 'Test files exist',
    check: () => fs.existsSync('src/__tests__'),
    fix: 'Create test files in src/__tests__'
  }
];

let passed = 0;
let failed = 0;

checks.forEach(({ name, check, fix }) => {
  const result = check();
  if (result) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name} - ${fix}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 CI/CD infrastructure is properly configured!');
  process.exit(0);
} else {
  console.log('⚠️  Some CI/CD components need attention.');
  process.exit(1);
}