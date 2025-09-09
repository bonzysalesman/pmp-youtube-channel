#!/usr/bin/env node

/**
 * Test Content Import System
 * 
 * Tests the content import functionality without actually importing to WordPress
 * - Validates all content chunks
 * - Tests metadata parsing
 * - Simulates import process
 * - Generates test report
 */

const fs = require('fs-extra');
const path = require('path');
const ContentValidator = require('./content-import-validator');

class ContentImportTester {
  constructor() {
    this.contentPath = path.join(__dirname, '../../content/chunks');
    this.testResults = {
      validation: null,
      parsing: {
        passed: 0,
        failed: 0,
        errors: []
      },
      simulation: {
        passed: 0,
        failed: 0,
        errors: []
      }
    };
  }

  /**
     * Run validation test
     */
  async testValidation() {
    console.log('🔍 Testing content validation...');
        
    try {
      const validator = new ContentValidator();
      await validator.loadConfig();
      await validator.validateWeekStructure();
      await validator.validateContentChunks();
      await validator.validateCrossReferences();
      await validator.validateUniqueContent();
            
      const isValid = validator.generateReport();
      this.testResults.validation = {
        passed: isValid,
        stats: validator.validationResults
      };
            
      console.log(`✅ Validation test: ${isValid ? 'PASSED' : 'FAILED'}`);
      return isValid;
            
    } catch (error) {
      console.error('❌ Validation test failed:', error.message);
      this.testResults.validation = {
        passed: false,
        error: error.message
      };
      return false;
    }
  }

  /**
     * Test metadata parsing for all chunks
     */
  async testMetadataParsing() {
    console.log('\n📄 Testing metadata parsing...');
        
    try {
      const weekDirs = await fs.readdir(this.contentPath);
      const sortedWeeks = weekDirs
        .filter(dir => dir.startsWith('week-'))
        .sort((a, b) => {
          const weekA = parseInt(a.split('-')[1]);
          const weekB = parseInt(b.split('-')[1]);
          return weekA - weekB;
        });

      for (const weekDir of sortedWeeks) {
        const weekPath = path.join(this.contentPath, weekDir);
        const chunkFiles = await fs.readdir(weekPath);
        const markdownFiles = chunkFiles.filter(file => file.endsWith('.md'));
                
        for (const chunkFile of markdownFiles) {
          const chunkPath = path.join(weekPath, chunkFile);
          const result = await this.testChunkParsing(chunkPath);
                    
          if (result.success) {
            this.testResults.parsing.passed++;
            console.log(`✅ ${chunkFile}: ${result.metadata.title}`);
          } else {
            this.testResults.parsing.failed++;
            console.log(`❌ ${chunkFile}: ${result.error}`);
            this.testResults.parsing.errors.push({
              file: chunkFile,
              error: result.error
            });
          }
        }
      }
            
      const totalChunks = this.testResults.parsing.passed + this.testResults.parsing.failed;
      console.log(`\n📊 Parsing Results: ${this.testResults.parsing.passed}/${totalChunks} chunks parsed successfully`);
            
      return this.testResults.parsing.failed === 0;
            
    } catch (error) {
      console.error('❌ Metadata parsing test failed:', error.message);
      return false;
    }
  }

  /**
     * Test parsing of individual chunk
     */
  async testChunkParsing(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const metadata = this.parseChunkMetadata(content);
            
      // Extract week number from path
      const pathMatch = filePath.match(/week-(\d+)/);
      const weekNumber = pathMatch ? parseInt(pathMatch[1]) : null;
            
      return {
        success: true,
        metadata: {
          ...metadata,
          week_number: weekNumber,
          file_path: filePath
        }
      };
            
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
     * Parse chunk metadata (simplified version of import script)
     */
  parseChunkMetadata(content) {
    const metadata = {};
    const lines = content.split('\n');
        
    let inMetadata = false;
    let contentStart = 0;
        
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
            
      if (line.startsWith('# ')) {
        metadata.title = line.substring(2).trim();
        inMetadata = true;
        continue;
      }
            
      if (inMetadata && line === '---') {
        contentStart = i + 1;
        break;
      }
            
      if (inMetadata && line.startsWith('**') && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const cleanKey = key.replace(/\*\*/g, '').toLowerCase().replace(/\s+/g, '_');
        const value = valueParts.join(':').replace(/\*\*/g, '').trim();
                
        if (cleanKey === 'video_references') {
          metadata.video_references = [];
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            if (nextLine.startsWith('- 🎥') || nextLine.startsWith('- 🎯')) {
              metadata.video_references.push(nextLine.substring(2).trim());
            } else if (nextLine.startsWith('**') || nextLine === '---') {
              break;
            }
          }
        } else if (cleanKey === 'eco_tasks') {
          metadata.eco_tasks = value.split(',').map(task => task.trim());
        } else if (cleanKey === 'key_learning_outcomes') {
          metadata.key_learning_outcomes = [];
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            if (nextLine.startsWith('- ')) {
              metadata.key_learning_outcomes.push(nextLine.substring(2).trim());
            } else if (nextLine.startsWith('**') || nextLine === '---') {
              break;
            }
          }
        } else {
          metadata[cleanKey] = value;
        }
      }
    }
        
    // Extract main content
    metadata.content = lines.slice(contentStart).join('\n').trim();
        
    // Calculate word count and estimated reading time
    const wordCount = metadata.content.split(/\s+/).length;
    metadata.word_count = wordCount;
    metadata.estimated_read_time = Math.ceil(wordCount / 200);
        
    return metadata;
  }

  /**
     * Simulate WordPress import process
     */
  async testImportSimulation() {
    console.log('\n🎯 Testing import simulation...');
        
    try {
      const weekDirs = await fs.readdir(this.contentPath);
      const sortedWeeks = weekDirs
        .filter(dir => dir.startsWith('week-'))
        .sort((a, b) => {
          const weekA = parseInt(a.split('-')[1]);
          const weekB = parseInt(b.split('-')[1]);
          return weekA - weekB;
        });

      const simulatedPosts = [];
            
      for (const weekDir of sortedWeeks) {
        const weekNumber = parseInt(weekDir.split('-')[1]);
        const weekPath = path.join(this.contentPath, weekDir);
        const chunkFiles = await fs.readdir(weekPath);
        const markdownFiles = chunkFiles.filter(file => file.endsWith('.md'));
                
        for (const chunkFile of markdownFiles) {
          const chunkPath = path.join(weekPath, chunkFile);
          const result = await this.simulatePostCreation(chunkPath, weekNumber);
                    
          if (result.success) {
            simulatedPosts.push(result.post);
            this.testResults.simulation.passed++;
            console.log(`✅ Simulated: ${chunkFile} → Post ID: ${result.post.id}`);
          } else {
            this.testResults.simulation.failed++;
            console.log(`❌ Failed: ${chunkFile} → ${result.error}`);
            this.testResults.simulation.errors.push({
              file: chunkFile,
              error: result.error
            });
          }
        }
      }
            
      // Save simulation results
      const reportPath = path.join(__dirname, '../../generated/import-simulation.json');
      await fs.ensureDir(path.dirname(reportPath));
      await fs.writeJson(reportPath, {
        timestamp: new Date().toISOString(),
        totalPosts: simulatedPosts.length,
        posts: simulatedPosts,
        errors: this.testResults.simulation.errors
      }, { spaces: 2 });
            
      console.log(`\n📊 Simulation Results: ${this.testResults.simulation.passed} posts simulated successfully`);
      console.log(`📄 Simulation report saved to: ${reportPath}`);
            
      return this.testResults.simulation.failed === 0;
            
    } catch (error) {
      console.error('❌ Import simulation failed:', error.message);
      return false;
    }
  }

  /**
     * Simulate creating a WordPress post
     */
  async simulatePostCreation(filePath, weekNumber) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const metadata = this.parseChunkMetadata(content);
      const chunkName = path.basename(filePath);
            
      // Simulate post data structure
      const post = {
        id: Math.floor(Math.random() * 10000) + 1000, // Simulated post ID
        title: metadata.title || chunkName.replace('.md', '').replace(/-/g, ' '),
        content: metadata.content,
        excerpt: metadata.key_learning_outcomes ? metadata.key_learning_outcomes.join('. ') : '',
        post_type: 'lesson',
        status: 'publish',
        week_number: weekNumber,
        domain: this.determineDomain(weekNumber, content, metadata.domain),
        eco_tasks: metadata.eco_tasks || [],
        video_references: metadata.video_references || [],
        estimated_read_time: metadata.estimated_read_time || 15,
        word_count: metadata.word_count || 0,
        chunk_name: chunkName,
        file_path: path.relative(process.cwd(), filePath),
        created_at: new Date().toISOString()
      };
            
      return {
        success: true,
        post
      };
            
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
     * Determine domain (simplified version)
     */
  determineDomain(weekNumber, content, metadataDomain) {
    if (metadataDomain) {
      const cleanDomain = metadataDomain
        .replace(/\s*\(\d+%\)/, '')
        .replace(/\s*\(.*?\)/, '')
        .trim();
            
      if (cleanDomain === 'Foundation') {return 'Foundation';}
      if (cleanDomain === 'People') {return 'People';}
      if (cleanDomain === 'Process') {return 'Process';}
      if (cleanDomain === 'Business Environment') {return 'Business Environment';}
      if (cleanDomain === 'Exam Preparation' || cleanDomain === 'Final Preparation') {return 'General';}
      if (cleanDomain.includes('PMP Mindset')) {return 'Foundation';}
    }
        
    if (weekNumber === 1) {return 'Foundation';}
    if (weekNumber >= 2 && weekNumber <= 4) {return 'People';}
    if (weekNumber >= 5 && weekNumber <= 11) {return 'Process';}
    if (weekNumber >= 12) {return 'General';}
        
    return 'General';
  }

  /**
     * Generate comprehensive test report
     */
  generateTestReport() {
    console.log('\n📊 COMPREHENSIVE TEST REPORT');
    console.log('=============================');
        
    const validationPassed = this.testResults.validation?.passed || false;
    const parsingPassed = this.testResults.parsing.failed === 0;
    const simulationPassed = this.testResults.simulation.failed === 0;
        
    console.log(`Validation Test: ${validationPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Parsing Test: ${parsingPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Simulation Test: ${simulationPassed ? '✅ PASSED' : '❌ FAILED'}`);
        
    if (this.testResults.validation?.stats) {
      const stats = this.testResults.validation.stats;
      console.log('\nValidation Details:');
      console.log(`- Weeks: ${stats.summary?.totalWeeks || 0}/13`);
      console.log(`- Chunks: ${stats.summary?.totalChunks || 0}`);
      console.log(`- Valid chunks: ${stats.summary?.validChunks || 0}`);
      console.log(`- Validation rate: ${stats.summary?.chunkValidationRate || 0}%`);
    }
        
    console.log('\nParsing Details:');
    console.log(`- Successful: ${this.testResults.parsing.passed}`);
    console.log(`- Failed: ${this.testResults.parsing.failed}`);
        
    console.log('\nSimulation Details:');
    console.log(`- Successful: ${this.testResults.simulation.passed}`);
    console.log(`- Failed: ${this.testResults.simulation.failed}`);
        
    const allTestsPassed = validationPassed && parsingPassed && simulationPassed;
    console.log(`\n${allTestsPassed ? '✅' : '❌'} Overall Test Result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
        
    if (allTestsPassed) {
      console.log('\n🎉 Content import system is ready for use!');
      console.log('   Run "npm run import-content-safe" to import content to WordPress');
    } else {
      console.log('\n⚠️  Please fix the issues above before importing content');
    }
        
    return allTestsPassed;
  }

  /**
     * Main test execution
     */
  async run() {
    try {
      console.log('🧪 PMP Content Import System Test');
      console.log('==================================\n');
            
      const validationPassed = await this.testValidation();
      const parsingPassed = await this.testMetadataParsing();
      const simulationPassed = await this.testImportSimulation();
            
      const allPassed = this.generateTestReport();
            
      if (!allPassed) {
        process.exit(1);
      }
            
    } catch (error) {
      console.error('❌ Fatal test error:', error);
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const tester = new ContentImportTester();
  tester.run();
}

module.exports = ContentImportTester;