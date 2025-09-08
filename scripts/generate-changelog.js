#!/usr/bin/env node

/**
 * Automated Changelog Generation Script
 * 
 * This script generates changelog entries based on:
 * - Git commit messages (conventional commits)
 * - GitHub pull requests
 * - GitHub releases
 * - Manual entries
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ChangelogGenerator {
  constructor() {
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.conventionalTypes = {
      feat: 'Added',
      fix: 'Fixed',
      docs: 'Changed',
      style: 'Changed',
      refactor: 'Changed',
      perf: 'Changed',
      test: 'Changed',
      chore: 'Changed',
      build: 'Changed',
      ci: 'Changed',
      revert: 'Fixed',
      security: 'Security'
    };
  }

  /**
   * Main entry point for changelog generation
   */
  async generate(options = {}) {
    try {
      console.log('🔄 Generating changelog...');
      
      const { fromTag, toTag, version, dryRun = false } = options;
      
      // Get current version if not provided
      const currentVersion = version || await this.getCurrentVersion();
      
      // Get commits since last tag or from specified range
      const commits = await this.getCommits(fromTag, toTag);
      
      // Parse commits into changelog sections
      const sections = this.parseCommits(commits);
      
      // Generate changelog entry
      const changelogEntry = this.generateChangelogEntry(currentVersion, sections);
      
      if (dryRun) {
        console.log('📋 Dry run - changelog entry:');
        console.log(changelogEntry);
        return changelogEntry;
      }
      
      // Update changelog file
      await this.updateChangelog(changelogEntry);
      
      console.log('✅ Changelog updated successfully!');
      return changelogEntry;
      
    } catch (error) {
      console.error('❌ Error generating changelog:', error.message);
      throw error;
    }
  }

  /**
   * Get current version from package.json
   */
  async getCurrentVersion() {
    try {
      const packageContent = await fs.readFile(this.packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      return packageJson.version;
    } catch (error) {
      console.warn('⚠️  Could not read version from package.json, using date-based version');
      const date = new Date().toISOString().split('T')[0];
      return `unreleased-${date}`;
    }
  }

  /**
   * Get git commits in specified range
   */
  async getCommits(fromTag, toTag) {
    try {
      let gitCommand;
      
      if (fromTag && toTag) {
        gitCommand = `git log ${fromTag}..${toTag} --pretty=format:"%H|%s|%an|%ad" --date=short`;
      } else if (fromTag) {
        gitCommand = `git log ${fromTag}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short`;
      } else {
        // Get commits since last tag
        try {
          const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
          gitCommand = `git log ${lastTag}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short`;
        } catch {
          // No tags found, get all commits
          gitCommand = 'git log --pretty=format:"%H|%s|%an|%ad" --date=short';
        }
      }
      
      const output = execSync(gitCommand, { encoding: 'utf8' });
      
      if (!output.trim()) {
        return [];
      }
      
      return output.trim().split('\n').map(line => {
        const [hash, subject, author, date] = line.split('|');
        return { hash, subject, author, date };
      });
      
    } catch (error) {
      console.warn('⚠️  Could not get git commits:', error.message);
      return [];
    }
  }

  /**
   * Parse commits into changelog sections
   */
  parseCommits(commits) {
    const sections = {
      Added: [],
      Changed: [],
      Deprecated: [],
      Removed: [],
      Fixed: [],
      Security: []
    };

    commits.forEach(commit => {
      const parsed = this.parseConventionalCommit(commit.subject);
      
      if (parsed) {
        const section = this.conventionalTypes[parsed.type] || 'Changed';
        const entry = {
          description: parsed.description,
          scope: parsed.scope,
          breaking: parsed.breaking,
          hash: commit.hash.substring(0, 7),
          author: commit.author
        };
        
        sections[section].push(entry);
      } else {
        // Non-conventional commit, add to Changed section
        sections.Changed.push({
          description: commit.subject,
          hash: commit.hash.substring(0, 7),
          author: commit.author
        });
      }
    });

    return sections;
  }

  /**
   * Parse conventional commit message
   */
  parseConventionalCommit(message) {
    const conventionalRegex = /^(\w+)(\(([^)]+)\))?(!)?:\s*(.+)$/;
    const match = message.match(conventionalRegex);
    
    if (!match) {
      return null;
    }
    
    return {
      type: match[1],
      scope: match[3] || null,
      breaking: !!match[4],
      description: match[5]
    };
  }

  /**
   * Generate changelog entry for a version
   */
  generateChangelogEntry(version, sections) {
    const date = new Date().toISOString().split('T')[0];
    let entry = `## [${version}] - ${date}\n\n`;
    
    // Add sections with content
    Object.entries(sections).forEach(([sectionName, entries]) => {
      if (entries.length > 0) {
        entry += `### ${sectionName}\n\n`;
        
        entries.forEach(entryItem => {
          let line = `- ${entryItem.description}`;
          
          if (entryItem.scope) {
            line = `- **${entryItem.scope}**: ${entryItem.description}`;
          }
          
          if (entryItem.breaking) {
            line += ' **[BREAKING CHANGE]**';
          }
          
          entry += `${line}\n`;
        });
        
        entry += '\n';
      }
    });
    
    return entry;
  }

  /**
   * Update the changelog file
   */
  async updateChangelog(newEntry) {
    try {
      let changelogContent = '';
      
      try {
        changelogContent = await fs.readFile(this.changelogPath, 'utf8');
      } catch (error) {
        // Changelog doesn't exist, create basic structure
        changelogContent = this.createBaseChangelog();
      }
      
      // Find the position to insert the new entry
      const unreleasedIndex = changelogContent.indexOf('## [Unreleased]');
      
      if (unreleasedIndex !== -1) {
        // Find the end of the Unreleased section
        const nextVersionIndex = changelogContent.indexOf('\n## [', unreleasedIndex + 1);
        
        if (nextVersionIndex !== -1) {
          // Insert new entry after Unreleased section
          const beforeUnreleased = changelogContent.substring(0, nextVersionIndex);
          const afterUnreleased = changelogContent.substring(nextVersionIndex);
          changelogContent = beforeUnreleased + '\n' + newEntry + afterUnreleased;
        } else {
          // No other versions, append after Unreleased
          changelogContent += '\n' + newEntry;
        }
      } else {
        // No Unreleased section, add at the beginning
        const headerEnd = changelogContent.indexOf('\n## ');
        if (headerEnd !== -1) {
          const header = changelogContent.substring(0, headerEnd);
          const rest = changelogContent.substring(headerEnd);
          changelogContent = header + '\n\n' + newEntry + rest;
        } else {
          changelogContent += '\n\n' + newEntry;
        }
      }
      
      await fs.writeFile(this.changelogPath, changelogContent);
      
    } catch (error) {
      throw new Error(`Failed to update changelog: ${error.message}`);
    }
  }

  /**
   * Create base changelog structure
   */
  createBaseChangelog() {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

`;
  }

  /**
   * Generate release notes for GitHub releases
   */
  async generateReleaseNotes(version, sections) {
    let notes = `# Release ${version}\n\n`;
    
    // Add highlights section
    const highlights = this.extractHighlights(sections);
    if (highlights.length > 0) {
      notes += '## 🎉 Highlights\n\n';
      highlights.forEach(highlight => {
        notes += `- ${highlight}\n`;
      });
      notes += '\n';
    }
    
    // Add breaking changes if any
    const breakingChanges = this.extractBreakingChanges(sections);
    if (breakingChanges.length > 0) {
      notes += '## ⚠️ Breaking Changes\n\n';
      breakingChanges.forEach(change => {
        notes += `- ${change}\n`;
      });
      notes += '\n';
    }
    
    // Add all sections
    Object.entries(sections).forEach(([sectionName, entries]) => {
      if (entries.length > 0) {
        const emoji = this.getSectionEmoji(sectionName);
        notes += `## ${emoji} ${sectionName}\n\n`;
        
        entries.forEach(entry => {
          notes += `- ${entry.description}\n`;
        });
        notes += '\n';
      }
    });
    
    return notes;
  }

  /**
   * Extract highlights from sections
   */
  extractHighlights(sections) {
    const highlights = [];
    
    // Major features
    sections.Added.forEach(entry => {
      if (entry.scope && ['feat', 'feature'].includes(entry.scope.toLowerCase())) {
        highlights.push(entry.description);
      }
    });
    
    // Critical fixes
    sections.Fixed.forEach(entry => {
      if (entry.description.toLowerCase().includes('critical') || 
          entry.description.toLowerCase().includes('security')) {
        highlights.push(entry.description);
      }
    });
    
    return highlights.slice(0, 5); // Limit to 5 highlights
  }

  /**
   * Extract breaking changes
   */
  extractBreakingChanges(sections) {
    const breakingChanges = [];
    
    Object.values(sections).forEach(entries => {
      entries.forEach(entry => {
        if (entry.breaking) {
          breakingChanges.push(entry.description);
        }
      });
    });
    
    return breakingChanges;
  }

  /**
   * Get emoji for section
   */
  getSectionEmoji(sectionName) {
    const emojis = {
      Added: '✨',
      Changed: '🔄',
      Deprecated: '⚠️',
      Removed: '🗑️',
      Fixed: '🐛',
      Security: '🔒'
    };
    
    return emojis[sectionName] || '📝';
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--from':
        options.fromTag = args[++i];
        break;
      case '--to':
        options.toTag = args[++i];
        break;
      case '--version':
        options.version = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        console.log(`
Usage: node generate-changelog.js [options]

Options:
  --from <tag>     Generate changelog from this tag
  --to <tag>       Generate changelog to this tag
  --version <ver>  Use this version number
  --dry-run        Show output without writing files
  --help           Show this help message

Examples:
  node generate-changelog.js
  node generate-changelog.js --version 1.2.0
  node generate-changelog.js --from v1.0.0 --to v1.1.0
  node generate-changelog.js --dry-run
        `);
        process.exit(0);
        break;
    }
  }
  
  const generator = new ChangelogGenerator();
  generator.generate(options).catch(error => {
    console.error('Failed to generate changelog:', error);
    process.exit(1);
  });
}

module.exports = ChangelogGenerator;