#!/usr/bin/env node

/**
 * Branch Protection Validation Script
 * Validates that branch protection and workflow rules are properly configured
 */

const fs = require('fs');
const path = require('path');

class BranchProtectionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  /**
   * Validate that all required files exist
   */
  validateRequiredFiles() {
    console.log('🔍 Validating required files...');
    
    const requiredFiles = [
      '.github/workflows/branch-protection.yml',
      '.github/workflows/pr-labeler.yml',
      '.github/workflows/setup-labels.yml',
      '.github/workflows/pr-validation.yml',
      '.github/PULL_REQUEST_TEMPLATE.md',
      '.github/CODEOWNERS',
      '.github/ISSUE_TEMPLATE/bug_report.md',
      '.github/ISSUE_TEMPLATE/feature_request.md',
      '.github/ISSUE_TEMPLATE/task.md',
      '.github/ISSUE_TEMPLATE/config.yml',
      'docs/BRANCH_PROTECTION_GUIDE.md'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.success.push(`✅ ${file} exists`);
      } else {
        this.errors.push(`❌ Missing required file: ${file}`);
      }
    }
  }

  /**
   * Validate branch naming patterns
   */
  validateBranchNaming() {
    console.log('🔍 Validating branch naming patterns...');
    
    const testBranches = [
      { name: 'feature/PMP-123-implement-api', valid: true },
      { name: 'hotfix/PMP-456-fix-bug', valid: true },
      { name: 'bugfix/PMP-789-resolve-issue', valid: true },
      { name: 'docs/update-readme', valid: true },
      { name: 'config/setup-eslint', valid: true },
      { name: 'test/add-integration', valid: true },
      { name: 'refactor/cleanup-code', valid: true },
      { name: 'chore/update-deps', valid: true },
      { name: 'invalid-branch-name', valid: false },
      { name: 'feature/no-task-id', valid: false },
      { name: 'random_branch', valid: false }
    ];

    const validPatterns = [
      /^feature\/PMP-\d+-[\w-]+$/,
      /^hotfix\/PMP-\d+-[\w-]+$/,
      /^bugfix\/PMP-\d+-[\w-]+$/,
      /^docs\/[\w-]+$/,
      /^config\/[\w-]+$/,
      /^test\/[\w-]+$/,
      /^refactor\/[\w-]+$/,
      /^chore\/[\w-]+$/
    ];

    for (const testBranch of testBranches) {
      const isValid = validPatterns.some(pattern => pattern.test(testBranch.name));
      
      if (isValid === testBranch.valid) {
        this.success.push(`✅ Branch naming validation: ${testBranch.name}`);
      } else {
        this.errors.push(`❌ Branch naming validation failed: ${testBranch.name} (expected ${testBranch.valid ? 'valid' : 'invalid'})`);
      }
    }
  }

  /**
   * Validate PR template structure
   */
  validatePRTemplate() {
    console.log('🔍 Validating PR template structure...');
    
    try {
      const templatePath = '.github/PULL_REQUEST_TEMPLATE.md';
      const template = fs.readFileSync(templatePath, 'utf8');
      
      const requiredSections = [
        '## Pull Request Description',
        '### Summary',
        '### Type of Change',
        '### Related Issues',
        '### Linear Task Reference',
        '### Changes Made',
        '### Testing',
        '### Code Quality Checklist',
        '### Documentation',
        '### Deployment Considerations'
      ];

      for (const section of requiredSections) {
        if (template.includes(section)) {
          this.success.push(`✅ PR template contains: ${section}`);
        } else {
          this.errors.push(`❌ PR template missing: ${section}`);
        }
      }

      // Check for checkboxes
      const checkboxPattern = /- \[ \]/g;
      const checkboxes = template.match(checkboxPattern);
      if (checkboxes && checkboxes.length > 10) {
        this.success.push(`✅ PR template has ${checkboxes.length} checkboxes`);
      } else {
        this.warnings.push(`⚠️ PR template has few checkboxes (${checkboxes ? checkboxes.length : 0})`);
      }

    } catch (error) {
      this.errors.push(`❌ Error reading PR template: ${error.message}`);
    }
  }

  /**
   * Validate issue templates
   */
  validateIssueTemplates() {
    console.log('🔍 Validating issue templates...');
    
    const templates = [
      { file: '.github/ISSUE_TEMPLATE/bug_report.md', type: 'Bug Report' },
      { file: '.github/ISSUE_TEMPLATE/feature_request.md', type: 'Feature Request' },
      { file: '.github/ISSUE_TEMPLATE/task.md', type: 'Task' }
    ];

    for (const template of templates) {
      try {
        const content = fs.readFileSync(template.file, 'utf8');
        
        // Check for YAML frontmatter
        if (content.startsWith('---')) {
          this.success.push(`✅ ${template.type} template has YAML frontmatter`);
        } else {
          this.errors.push(`❌ ${template.type} template missing YAML frontmatter`);
        }

        // Check for Linear task reference section
        if (content.includes('Linear Task Reference')) {
          this.success.push(`✅ ${template.type} template includes Linear task reference`);
        } else {
          this.warnings.push(`⚠️ ${template.type} template missing Linear task reference`);
        }

      } catch (error) {
        this.errors.push(`❌ Error reading ${template.type} template: ${error.message}`);
      }
    }
  }

  /**
   * Validate workflow files
   */
  validateWorkflows() {
    console.log('🔍 Validating workflow files...');
    
    const workflows = [
      { file: '.github/workflows/branch-protection.yml', name: 'Branch Protection' },
      { file: '.github/workflows/pr-labeler.yml', name: 'PR Labeler' },
      { file: '.github/workflows/setup-labels.yml', name: 'Setup Labels' },
      { file: '.github/workflows/pr-validation.yml', name: 'PR Validation' }
    ];

    for (const workflow of workflows) {
      try {
        const content = fs.readFileSync(workflow.file, 'utf8');
        
        // Check for required workflow elements
        if (content.includes('name:') && content.includes('on:') && content.includes('jobs:')) {
          this.success.push(`✅ ${workflow.name} workflow is properly structured`);
        } else {
          this.errors.push(`❌ ${workflow.name} workflow missing required elements`);
        }

        // Check for GitHub token usage
        if (content.includes('GITHUB_TOKEN')) {
          this.success.push(`✅ ${workflow.name} workflow uses GitHub token`);
        } else {
          this.warnings.push(`⚠️ ${workflow.name} workflow may not use GitHub token`);
        }

      } catch (error) {
        this.errors.push(`❌ Error reading ${workflow.name} workflow: ${error.message}`);
      }
    }
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('🚀 Starting branch protection validation...\n');

    this.validateRequiredFiles();
    this.validateBranchNaming();
    this.validatePRTemplate();
    this.validateIssueTemplates();
    this.validateWorkflows();

    this.printResults();
    return this.errors.length === 0;
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));

    if (this.success.length > 0) {
      console.log('\n✅ Success:');
      this.success.forEach(msg => console.log(`  ${msg}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(msg => console.log(`  ${msg}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
    }

    console.log('\n📈 Summary:');
    console.log(`  ✅ Success: ${this.success.length}`);
    console.log(`  ⚠️ Warnings: ${this.warnings.length}`);
    console.log(`  ❌ Errors: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log('\n🎉 All validations passed! Branch protection is properly configured.');
    } else {
      console.log('\n🔧 Please fix the errors above before proceeding.');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new BranchProtectionValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = BranchProtectionValidator;