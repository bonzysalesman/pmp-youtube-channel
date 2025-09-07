#!/usr/bin/env node

/**
 * PMP Content Import Validator
 * 
 * Validates content structure and integrity before WordPress import
 * - Checks all 13 weeks are present
 * - Validates metadata format and completeness
 * - Verifies cross-reference integrity
 * - Checks for duplicate content
 * - Validates ECO task coverage
 */

const fs = require('fs-extra');
const path = require('path');

class ContentValidator {
    constructor() {
        this.contentPath = path.join(__dirname, '../../content/chunks');
        this.crossReferencesPath = path.join(__dirname, '../../content/cross-references');
        this.configPath = path.join(__dirname, '../../config/content-import-config.json');
        this.config = null;
        this.validationResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: [],
            warnings: [],
            summary: {}
        };
    }

    /**
     * Load configuration
     */
    async loadConfig() {
        try {
            this.config = await fs.readJson(this.configPath);
            console.log('✅ Configuration loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load configuration:', error.message);
            throw error;
        }
    }

    /**
     * Validate week structure (all 13 weeks present)
     */
    async validateWeekStructure() {
        console.log('\n📅 Validating week structure...');
        
        try {
            const weekDirs = await fs.readdir(this.contentPath);
            const weekNumbers = weekDirs
                .filter(dir => dir.startsWith('week-'))
                .map(dir => parseInt(dir.split('-')[1]))
                .sort((a, b) => a - b);

            const expectedWeeks = Array.from({length: 13}, (_, i) => i + 1);
            const missingWeeks = expectedWeeks.filter(week => !weekNumbers.includes(week));
            const extraWeeks = weekNumbers.filter(week => !expectedWeeks.includes(week));

            if (missingWeeks.length > 0) {
                this.validationResults.errors.push({
                    type: 'structure',
                    message: `Missing weeks: ${missingWeeks.join(', ')}`
                });
                this.validationResults.failed++;
            }

            if (extraWeeks.length > 0) {
                this.validationResults.warnings.push({
                    type: 'structure',
                    message: `Extra weeks found: ${extraWeeks.join(', ')}`
                });
                this.validationResults.warnings++;
            }

            if (missingWeeks.length === 0) {
                console.log('✅ All 13 weeks present');
                this.validationResults.passed++;
            } else {
                console.log(`❌ Week structure validation failed`);
            }

            this.validationResults.summary.totalWeeks = weekNumbers.length;
            this.validationResults.summary.expectedWeeks = 13;

        } catch (error) {
            this.validationResults.errors.push({
                type: 'structure',
                message: `Failed to validate week structure: ${error.message}`
            });
            this.validationResults.failed++;
        }
    }

    /**
     * Parse and validate individual chunk metadata
     */
    parseAndValidateChunk(content, filePath) {
        const errors = [];
        const warnings = [];
        const metadata = {};
        
        try {
            const lines = content.split('\n');
            let inMetadata = false;
            let contentStart = 0;
            
            // Extract title
            const titleLine = lines.find(line => line.startsWith('# '));
            if (!titleLine) {
                errors.push('Missing title (# heading)');
            } else {
                metadata.title = titleLine.substring(2).trim();
            }
            
            // Extract metadata
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('# ')) {
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
                    
                    metadata[cleanKey] = value;
                }
            }
            
            // Extract week number from file path (e.g., week-01/chunk-01-intro.md)
            let weekNumber = null;
            const pathMatch = filePath.match(/week-(\d+)/);
            if (pathMatch) {
                weekNumber = parseInt(pathMatch[1]);
                metadata.week_number = weekNumber; // Add to metadata
            } else if (metadata.week) {
                weekNumber = parseInt(metadata.week);
            }
            
            // Validate required metadata
            const requiredFields = this.config.validation.required_metadata;
            for (const field of requiredFields) {
                if (!metadata[field] || metadata[field].trim() === '') {
                    errors.push(`Missing required metadata: ${field}`);
                }
            }
            
            // Ensure week number is available (either from metadata or extracted from path)
            if (!weekNumber) {
                errors.push('Week number not found in metadata or file path');
            } else if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 13) {
                errors.push(`Invalid week number: ${weekNumber}. Must be 1-13`);
            }
            
            // Validate domain
            if (metadata.domain && !this.config.validation.allowed_domains.includes(metadata.domain)) {
                errors.push(`Invalid domain: ${metadata.domain}. Allowed: ${this.config.validation.allowed_domains.join(', ')}`);
            }
            
            // Extract and validate content
            const mainContent = lines.slice(contentStart).join('\n').trim();
            metadata.content = mainContent;
            metadata.word_count = mainContent.split(/\s+/).length;
            
            // Validate content length
            if (metadata.word_count < this.config.validation.min_content_length) {
                warnings.push(`Content too short: ${metadata.word_count} words (minimum: ${this.config.validation.min_content_length})`);
            }
            
            if (metadata.word_count > this.config.validation.max_content_length) {
                errors.push(`Content too long: ${metadata.word_count} words (maximum: ${this.config.validation.max_content_length})`);
            }
            
            // Check for video references
            if (!metadata.video_references && !mainContent.includes('🎥')) {
                warnings.push('No video references found');
            }
            
            // Check for ECO task references
            if (!metadata.eco_tasks && !mainContent.toLowerCase().includes('eco')) {
                warnings.push('No ECO task references found');
            }
            
        } catch (error) {
            errors.push(`Failed to parse chunk: ${error.message}`);
        }
        
        return {
            metadata,
            errors,
            warnings,
            filePath
        };
    }

    /**
     * Validate all content chunks
     */
    async validateContentChunks() {
        console.log('\n📄 Validating content chunks...');
        
        let totalChunks = 0;
        let validChunks = 0;
        const chunkResults = [];
        
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
                    const content = await fs.readFile(chunkPath, 'utf8');
                    
                    const result = this.parseAndValidateChunk(content, chunkPath);
                    chunkResults.push(result);
                    totalChunks++;
                    
                    if (result.errors.length === 0) {
                        validChunks++;
                        console.log(`✅ ${chunkFile}`);
                    } else {
                        console.log(`❌ ${chunkFile}:`);
                        result.errors.forEach(error => console.log(`   - ${error}`));
                        
                        this.validationResults.errors.push({
                            type: 'chunk',
                            file: chunkFile,
                            errors: result.errors
                        });
                    }
                    
                    if (result.warnings.length > 0) {
                        console.log(`⚠️  ${chunkFile} warnings:`);
                        result.warnings.forEach(warning => console.log(`   - ${warning}`));
                        
                        this.validationResults.warnings.push({
                            type: 'chunk',
                            file: chunkFile,
                            warnings: result.warnings
                        });
                    }
                }
            }
            
            this.validationResults.summary.totalChunks = totalChunks;
            this.validationResults.summary.validChunks = validChunks;
            this.validationResults.summary.chunkValidationRate = ((validChunks / totalChunks) * 100).toFixed(1);
            
            if (validChunks === totalChunks) {
                console.log(`✅ All ${totalChunks} chunks validated successfully`);
                this.validationResults.passed++;
            } else {
                console.log(`❌ ${totalChunks - validChunks} chunks failed validation`);
                this.validationResults.failed++;
            }
            
        } catch (error) {
            this.validationResults.errors.push({
                type: 'chunk_validation',
                message: `Failed to validate chunks: ${error.message}`
            });
            this.validationResults.failed++;
        }
    }

    /**
     * Validate cross-reference files
     */
    async validateCrossReferences() {
        console.log('\n🔗 Validating cross-references...');
        
        try {
            const ecoMappingPath = path.join(this.crossReferencesPath, 'eco-task-to-chunk-mapping.json');
            const videoMappingPath = path.join(this.crossReferencesPath, 'video-to-chunk-mapping.json');
            
            // Check if files exist
            const ecoExists = await fs.pathExists(ecoMappingPath);
            const videoExists = await fs.pathExists(videoMappingPath);
            
            if (!ecoExists) {
                this.validationResults.errors.push({
                    type: 'cross_reference',
                    message: 'ECO task mapping file not found'
                });
                this.validationResults.failed++;
            }
            
            if (!videoExists) {
                this.validationResults.errors.push({
                    type: 'cross_reference',
                    message: 'Video mapping file not found'
                });
                this.validationResults.failed++;
            }
            
            if (ecoExists && videoExists) {
                // Validate JSON structure
                try {
                    const ecoMapping = await fs.readJson(ecoMappingPath);
                    const videoMapping = await fs.readJson(videoMappingPath);
                    
                    // Basic structure validation
                    if (!ecoMapping.people_domain || !ecoMapping.process_domain || !ecoMapping.business_environment_domain) {
                        this.validationResults.errors.push({
                            type: 'cross_reference',
                            message: 'ECO mapping missing required domains'
                        });
                        this.validationResults.failed++;
                    }
                    
                    // Count ECO tasks
                    const totalEcoTasks = Object.keys(ecoMapping.people_domain || {}).length +
                                        Object.keys(ecoMapping.process_domain || {}).length +
                                        Object.keys(ecoMapping.business_environment_domain || {}).length;
                    
                    this.validationResults.summary.ecoTasksCount = totalEcoTasks;
                    
                    // Count video mappings
                    const totalVideoMappings = Object.keys(videoMapping).length;
                    this.validationResults.summary.videoMappingsCount = totalVideoMappings;
                    
                    console.log(`✅ Cross-references validated (${totalEcoTasks} ECO tasks, ${totalVideoMappings} video mappings)`);
                    this.validationResults.passed++;
                    
                } catch (parseError) {
                    this.validationResults.errors.push({
                        type: 'cross_reference',
                        message: `Failed to parse cross-reference files: ${parseError.message}`
                    });
                    this.validationResults.failed++;
                }
            }
            
        } catch (error) {
            this.validationResults.errors.push({
                type: 'cross_reference',
                message: `Cross-reference validation failed: ${error.message}`
            });
            this.validationResults.failed++;
        }
    }

    /**
     * Check for duplicate content
     */
    async validateUniqueContent() {
        console.log('\n🔍 Checking for duplicate content...');
        
        try {
            const contentHashes = new Map();
            const titleHashes = new Map();
            const duplicates = [];
            
            const weekDirs = await fs.readdir(this.contentPath);
            
            for (const weekDir of weekDirs.filter(dir => dir.startsWith('week-'))) {
                const weekPath = path.join(this.contentPath, weekDir);
                const chunkFiles = await fs.readdir(weekPath);
                
                for (const chunkFile of chunkFiles.filter(file => file.endsWith('.md'))) {
                    const chunkPath = path.join(weekPath, chunkFile);
                    const content = await fs.readFile(chunkPath, 'utf8');
                    
                    // Extract title and content for comparison
                    const titleMatch = content.match(/^# (.+)$/m);
                    const title = titleMatch ? titleMatch[1].trim() : '';
                    
                    // Simple content hash (first 500 characters)
                    const contentPreview = content.substring(0, 500);
                    
                    // Check for duplicate titles
                    if (title && titleHashes.has(title)) {
                        duplicates.push({
                            type: 'title',
                            files: [titleHashes.get(title), chunkPath],
                            content: title
                        });
                    } else if (title) {
                        titleHashes.set(title, chunkPath);
                    }
                    
                    // Check for duplicate content
                    if (contentHashes.has(contentPreview)) {
                        duplicates.push({
                            type: 'content',
                            files: [contentHashes.get(contentPreview), chunkPath],
                            content: contentPreview.substring(0, 100) + '...'
                        });
                    } else {
                        contentHashes.set(contentPreview, chunkPath);
                    }
                }
            }
            
            if (duplicates.length > 0) {
                console.log(`⚠️  Found ${duplicates.length} potential duplicates:`);
                duplicates.forEach(dup => {
                    console.log(`   - ${dup.type}: ${dup.files.join(' <-> ')}`);
                });
                
                this.validationResults.warnings.push({
                    type: 'duplicates',
                    message: `Found ${duplicates.length} potential duplicates`,
                    details: duplicates
                });
                this.validationResults.warnings++;
            } else {
                console.log('✅ No duplicate content found');
                this.validationResults.passed++;
            }
            
        } catch (error) {
            this.validationResults.errors.push({
                type: 'duplicate_check',
                message: `Duplicate check failed: ${error.message}`
            });
            this.validationResults.failed++;
        }
    }

    /**
     * Generate validation report
     */
    generateReport() {
        console.log('\n📊 VALIDATION REPORT');
        console.log('====================');
        console.log(`Tests passed: ${this.validationResults.passed}`);
        console.log(`Tests failed: ${this.validationResults.failed}`);
        console.log(`Warnings: ${this.validationResults.warnings.length}`);
        console.log(`Errors: ${this.validationResults.errors.length}`);
        
        if (this.validationResults.summary.totalWeeks) {
            console.log(`\nContent Summary:`);
            console.log(`- Weeks: ${this.validationResults.summary.totalWeeks}/13`);
            console.log(`- Chunks: ${this.validationResults.summary.totalChunks}`);
            console.log(`- Valid chunks: ${this.validationResults.summary.validChunks}`);
            console.log(`- Validation rate: ${this.validationResults.summary.chunkValidationRate}%`);
            
            if (this.validationResults.summary.ecoTasksCount) {
                console.log(`- ECO tasks: ${this.validationResults.summary.ecoTasksCount}`);
            }
            
            if (this.validationResults.summary.videoMappingsCount) {
                console.log(`- Video mappings: ${this.validationResults.summary.videoMappingsCount}`);
            }
        }
        
        if (this.validationResults.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.validationResults.errors.forEach(error => {
                console.log(`  - ${error.type}: ${error.message}`);
                if (error.errors) {
                    error.errors.forEach(subError => console.log(`    * ${subError}`));
                }
            });
        }
        
        if (this.validationResults.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.validationResults.warnings.forEach(warning => {
                console.log(`  - ${warning.type}: ${warning.message}`);
            });
        }
        
        const isValid = this.validationResults.failed === 0;
        console.log(`\n${isValid ? '✅' : '❌'} Overall validation: ${isValid ? 'PASSED' : 'FAILED'}`);
        
        // Save detailed report
        const reportPath = path.join(__dirname, '../../generated/validation-report.json');
        fs.ensureDirSync(path.dirname(reportPath));
        fs.writeJsonSync(reportPath, {
            timestamp: new Date().toISOString(),
            isValid,
            ...this.validationResults
        }, { spaces: 2 });
        
        console.log(`📄 Detailed report saved to: ${reportPath}`);
        
        return isValid;
    }

    /**
     * Main validation execution
     */
    async run() {
        try {
            console.log('🔍 PMP Content Validation Script');
            console.log('=================================\n');
            
            await this.loadConfig();
            await this.validateWeekStructure();
            await this.validateContentChunks();
            await this.validateCrossReferences();
            await this.validateUniqueContent();
            
            const isValid = this.generateReport();
            
            if (!isValid) {
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ Fatal validation error:', error);
            process.exit(1);
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const validator = new ContentValidator();
    validator.run();
}

module.exports = ContentValidator;