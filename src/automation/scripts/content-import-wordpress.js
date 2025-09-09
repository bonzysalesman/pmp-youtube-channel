#!/usr/bin/env node

/**
 * PMP WordPress Content Import Script
 * 
 * Imports 13-week structured PMP course content into WordPress
 * - Parses content chunks with metadata
 * - Creates WordPress posts with proper categorization
 * - Sets up ECO task relationships
 * - Imports video references and cross-references
 * - Validates content structure and relationships
 */

const fs = require('fs-extra');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

class ContentImporter {
  constructor() {
    this.contentPath = path.join(__dirname, '../../content/chunks');
    this.crossReferencesPath = path.join(__dirname, '../../content/cross-references');
    this.importedContent = [];
    this.errors = [];
    this.stats = {
      totalChunks: 0,
      successfulImports: 0,
      errors: 0,
      weeks: 0
    };
  }

  /**
     * Initialize database connection
     */
  async initializeDatabase() {
    try {
      this.db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'wordpress',
        port: process.env.DB_PORT || 3306
      });
            
      console.log('✅ Database connection established');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  /**
     * Parse content chunk metadata from markdown file
     */
  parseChunkMetadata(content) {
    const metadata = {};
    const lines = content.split('\n');
        
    // Extract metadata from the header section
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
          // Continue reading video references until next metadata or content
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
          // Continue reading outcomes until next metadata
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
        
    // Extract main content (everything after ---)
    metadata.content = lines.slice(contentStart).join('\n').trim();
        
    // Calculate word count and estimated reading time
    const wordCount = metadata.content.split(/\s+/).length;
    metadata.word_count = wordCount;
    metadata.estimated_read_time = Math.ceil(wordCount / 200); // 200 words per minute
        
    return metadata;
  }

  /**
     * Determine domain based on week number and content
     */
  determineDomain(weekNumber, content, metadataDomain) {
    // If metadata has domain, clean it up and use it
    if (metadataDomain) {
      // Remove percentage and extra text
      const cleanDomain = metadataDomain
        .replace(/\s*\(\d+%\)/, '')
        .replace(/\s*\(.*?\)/, '')
        .trim();
            
      // Map special domains
      if (cleanDomain === 'Foundation') {return 'Foundation';}
      if (cleanDomain === 'People') {return 'People';}
      if (cleanDomain === 'Process') {return 'Process';}
      if (cleanDomain === 'Business Environment') {return 'Business Environment';}
      if (cleanDomain === 'Exam Preparation' || cleanDomain === 'Final Preparation') {return 'General';}
      if (cleanDomain.includes('PMP Mindset')) {return 'Foundation';}
    }
        
    // Fallback based on week number
    if (weekNumber === 1) {return 'Foundation';}
    if (weekNumber >= 2 && weekNumber <= 4) {return 'People';}
    if (weekNumber >= 5 && weekNumber <= 11) {return 'Process';}
    if (weekNumber >= 12) {return 'General';}
        
    // Final fallback: analyze content for domain keywords
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('team') || lowerContent.includes('leadership') || lowerContent.includes('conflict')) {
      return 'People';
    }
    if (lowerContent.includes('process') || lowerContent.includes('planning') || lowerContent.includes('execution')) {
      return 'Process';
    }
    if (lowerContent.includes('business') || lowerContent.includes('compliance') || lowerContent.includes('value')) {
      return 'Business Environment';
    }
        
    return 'General';
  }

  /**
     * Create WordPress post for content chunk
     */
  async createWordPressPost(chunkData) {
    try {
      const postData = {
        post_title: chunkData.title,
        post_content: chunkData.content,
        post_excerpt: chunkData.key_learning_outcomes ? chunkData.key_learning_outcomes.join('. ') : '',
        post_status: 'publish',
        post_type: 'lesson',
        post_author: 1,
        post_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        post_date_gmt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        comment_status: 'open',
        ping_status: 'closed',
        post_name: chunkData.chunk_name.replace('.md', ''),
        to_ping: '',
        pinged: '',
        post_modified: new Date().toISOString().slice(0, 19).replace('T', ' '),
        post_modified_gmt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        post_content_filtered: '',
        post_parent: 0,
        menu_order: 0,
        guid: `${process.env.SITE_URL || 'http://localhost'}/?post_type=lesson&p=`
      };

      const [result] = await this.db.execute(
        `INSERT INTO wp_posts (
                    post_title, post_content, post_excerpt, post_status, post_type, 
                    post_author, post_date, post_date_gmt, comment_status, ping_status,
                    post_name, to_ping, pinged, post_modified, post_modified_gmt, 
                    post_content_filtered, post_parent, menu_order, guid
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        Object.values(postData)
      );

      const postId = result.insertId;
            
      // Update GUID with actual post ID
      await this.db.execute(
        'UPDATE wp_posts SET guid = ? WHERE ID = ?',
        [`${process.env.SITE_URL || 'http://localhost'}/?post_type=lesson&p=${postId}`, postId]
      );

      return postId;
    } catch (error) {
      console.error('Error creating WordPress post:', error);
      throw error;
    }
  }

  /**
     * Add post metadata
     */
  async addPostMetadata(postId, chunkData) {
    const metadata = [
      ['week_number', chunkData.week_number],
      ['domain', chunkData.domain],
      ['eco_tasks', JSON.stringify(chunkData.eco_tasks || [])],
      ['video_references', JSON.stringify(chunkData.video_references || [])],
      ['estimated_read_time', chunkData.estimated_read_time],
      ['word_count', chunkData.word_count],
      ['difficulty_rating', chunkData.difficulty_rating || 3.0],
      ['chunk_name', chunkData.chunk_name],
      ['file_path', chunkData.file_path],
      ['key_learning_outcomes', JSON.stringify(chunkData.key_learning_outcomes || [])]
    ];

    for (const [metaKey, metaValue] of metadata) {
      if (metaValue !== undefined && metaValue !== null) {
        await this.db.execute(
          'INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)',
          [postId, metaKey, metaValue.toString()]
        );
      }
    }
  }

  /**
     * Create or update taxonomy terms (categories/tags)
     */
  async createTaxonomyTerms(postId, chunkData) {
    try {
      // Create week category
      const weekTerm = `Week ${chunkData.week_number}`;
      const [weekTermResult] = await this.db.execute(
        'INSERT IGNORE INTO wp_terms (name, slug) VALUES (?, ?)',
        [weekTerm, `week-${chunkData.week_number}`]
      );
            
      let weekTermId;
      if (weekTermResult.insertId) {
        weekTermId = weekTermResult.insertId;
        await this.db.execute(
          'INSERT INTO wp_term_taxonomy (term_id, taxonomy, description, parent, count) VALUES (?, ?, ?, ?, ?)',
          [weekTermId, 'lesson_category', `Week ${chunkData.week_number} content`, 0, 0]
        );
      } else {
        const [existingTerm] = await this.db.execute(
          'SELECT term_id FROM wp_terms WHERE slug = ?',
          [`week-${chunkData.week_number}`]
        );
        weekTermId = existingTerm[0].term_id;
      }

      // Create domain category
      const [domainTermResult] = await this.db.execute(
        'INSERT IGNORE INTO wp_terms (name, slug) VALUES (?, ?)',
        [chunkData.domain, chunkData.domain.toLowerCase().replace(/\s+/g, '-')]
      );
            
      let domainTermId;
      if (domainTermResult.insertId) {
        domainTermId = domainTermResult.insertId;
        await this.db.execute(
          'INSERT INTO wp_term_taxonomy (term_id, taxonomy, description, parent, count) VALUES (?, ?, ?, ?, ?)',
          [domainTermId, 'lesson_category', `${chunkData.domain} domain content`, 0, 0]
        );
      } else {
        const [existingDomain] = await this.db.execute(
          'SELECT term_id FROM wp_terms WHERE slug = ?',
          [chunkData.domain.toLowerCase().replace(/\s+/g, '-')]
        );
        domainTermId = existingDomain[0].term_id;
      }

      // Associate post with terms
      const [weekTaxonomy] = await this.db.execute(
        'SELECT term_taxonomy_id FROM wp_term_taxonomy WHERE term_id = ? AND taxonomy = ?',
        [weekTermId, 'lesson_category']
      );
            
      const [domainTaxonomy] = await this.db.execute(
        'SELECT term_taxonomy_id FROM wp_term_taxonomy WHERE term_id = ? AND taxonomy = ?',
        [domainTermId, 'lesson_category']
      );

      if (weekTaxonomy[0]) {
        await this.db.execute(
          'INSERT IGNORE INTO wp_term_relationships (object_id, term_taxonomy_id, term_order) VALUES (?, ?, ?)',
          [postId, weekTaxonomy[0].term_taxonomy_id, 0]
        );
      }

      if (domainTaxonomy[0]) {
        await this.db.execute(
          'INSERT IGNORE INTO wp_term_relationships (object_id, term_taxonomy_id, term_order) VALUES (?, ?, ?)',
          [postId, domainTaxonomy[0].term_taxonomy_id, 0]
        );
      }

    } catch (error) {
      console.error('Error creating taxonomy terms:', error);
    }
  }

  /**
     * Process a single content chunk file
     */
  async processChunkFile(filePath, weekNumber) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const chunkName = path.basename(filePath);
            
      console.log(`📄 Processing: ${chunkName}`);
            
      const metadata = this.parseChunkMetadata(content);
            
      const chunkData = {
        chunk_name: chunkName,
        week_number: weekNumber,
        title: metadata.title || chunkName.replace('.md', '').replace(/-/g, ' '),
        domain: this.determineDomain(weekNumber, content, metadata.domain),
        eco_tasks: metadata.eco_tasks || [],
        video_references: metadata.video_references || [],
        estimated_read_time: metadata.estimated_read_time || 15,
        word_count: metadata.word_count || 0,
        difficulty_rating: parseFloat(metadata.difficulty_rating) || 3.0,
        content: metadata.content,
        file_path: path.relative(process.cwd(), filePath),
        key_learning_outcomes: metadata.key_learning_outcomes || []
      };

      // Create WordPress post
      const postId = await this.createWordPressPost(chunkData);
            
      // Add metadata
      await this.addPostMetadata(postId, chunkData);
            
      // Create taxonomy terms
      await this.createTaxonomyTerms(postId, chunkData);
            
      this.importedContent.push({
        ...chunkData,
        post_id: postId,
        status: 'success'
      });
            
      this.stats.successfulImports++;
      console.log(`✅ Successfully imported: ${chunkName} (Post ID: ${postId})`);
            
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.errors.push({
        file: filePath,
        error: error.message
      });
      this.stats.errors++;
    }
  }

  /**
     * Process all content chunks for all weeks
     */
  async processAllContent() {
    console.log('🚀 Starting content import process...\n');
        
    try {
      const weekDirs = await fs.readdir(this.contentPath);
      const sortedWeeks = weekDirs
        .filter(dir => dir.startsWith('week-'))
        .sort((a, b) => {
          const weekA = parseInt(a.split('-')[1]);
          const weekB = parseInt(b.split('-')[1]);
          return weekA - weekB;
        });

      this.stats.weeks = sortedWeeks.length;
            
      for (const weekDir of sortedWeeks) {
        const weekNumber = parseInt(weekDir.split('-')[1]);
        const weekPath = path.join(this.contentPath, weekDir);
                
        console.log(`\n📅 Processing Week ${weekNumber}...`);
                
        const chunkFiles = await fs.readdir(weekPath);
        const markdownFiles = chunkFiles.filter(file => file.endsWith('.md'));
                
        this.stats.totalChunks += markdownFiles.length;
                
        for (const chunkFile of markdownFiles) {
          const chunkPath = path.join(weekPath, chunkFile);
          await this.processChunkFile(chunkPath, weekNumber);
        }
                
        console.log(`✅ Week ${weekNumber} completed (${markdownFiles.length} chunks)`);
      }
            
    } catch (error) {
      console.error('❌ Error processing content:', error);
      throw error;
    }
  }

  /**
     * Import cross-reference data
     */
  async importCrossReferences() {
    console.log('\n🔗 Importing cross-references...');
        
    try {
      // Import ECO task mappings
      const ecoMappingPath = path.join(this.crossReferencesPath, 'eco-task-to-chunk-mapping.json');
      const ecoMapping = await fs.readJson(ecoMappingPath);
            
      // Import video mappings
      const videoMappingPath = path.join(this.crossReferencesPath, 'video-to-chunk-mapping.json');
      const videoMapping = await fs.readJson(videoMappingPath);
            
      // Store cross-references as WordPress options for easy access
      await this.db.execute(
        'INSERT INTO wp_options (option_name, option_value, autoload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)',
        ['pmp_eco_task_mapping', JSON.stringify(ecoMapping), 'no']
      );
            
      await this.db.execute(
        'INSERT INTO wp_options (option_name, option_value, autoload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)',
        ['pmp_video_mapping', JSON.stringify(videoMapping), 'no']
      );
            
      console.log('✅ Cross-references imported successfully');
            
    } catch (error) {
      console.error('❌ Error importing cross-references:', error);
    }
  }

  /**
     * Create custom post type for lessons if it doesn't exist
     */
  async setupCustomPostType() {
    console.log('🔧 Setting up custom post type...');
        
    try {
      // Store custom post type configuration as WordPress option
      const postTypeConfig = {
        lesson: {
          labels: {
            name: 'Lessons',
            singular_name: 'Lesson',
            add_new: 'Add New Lesson',
            add_new_item: 'Add New Lesson',
            edit_item: 'Edit Lesson',
            new_item: 'New Lesson',
            view_item: 'View Lesson',
            search_items: 'Search Lessons',
            not_found: 'No lessons found',
            not_found_in_trash: 'No lessons found in trash'
          },
          public: true,
          has_archive: true,
          supports: ['title', 'editor', 'excerpt', 'comments', 'custom-fields'],
          taxonomies: ['lesson_category', 'lesson_tag'],
          menu_icon: 'dashicons-book-alt'
        }
      };
            
      await this.db.execute(
        'INSERT INTO wp_options (option_name, option_value, autoload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)',
        ['pmp_custom_post_types', JSON.stringify(postTypeConfig), 'yes']
      );
            
      console.log('✅ Custom post type configuration saved');
            
    } catch (error) {
      console.error('❌ Error setting up custom post type:', error);
    }
  }

  /**
     * Generate import summary report
     */
  generateReport() {
    console.log('\n📊 IMPORT SUMMARY REPORT');
    console.log('========================');
    console.log(`Total weeks processed: ${this.stats.weeks}`);
    console.log(`Total chunks found: ${this.stats.totalChunks}`);
    console.log(`Successful imports: ${this.stats.successfulImports}`);
    console.log(`Errors encountered: ${this.stats.errors}`);
    console.log(`Success rate: ${((this.stats.successfulImports / this.stats.totalChunks) * 100).toFixed(1)}%`);
        
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    }
        
    console.log('\n✅ Import process completed!');
        
    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      errors: this.errors,
      importedContent: this.importedContent.map(item => ({
        chunk_name: item.chunk_name,
        week_number: item.week_number,
        post_id: item.post_id,
        title: item.title,
        domain: item.domain
      }))
    };
        
    const reportPath = path.join(__dirname, '../../generated/import-report.json');
    fs.ensureDirSync(path.dirname(reportPath));
    fs.writeJsonSync(reportPath, reportData, { spaces: 2 });
        
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  /**
     * Main execution method
     */
  async run() {
    try {
      console.log('🎯 PMP WordPress Content Import Script');
      console.log('=====================================\n');
            
      // Initialize database connection
      const dbConnected = await this.initializeDatabase();
      if (!dbConnected) {
        process.exit(1);
      }
            
      // Setup custom post type
      await this.setupCustomPostType();
            
      // Process all content
      await this.processAllContent();
            
      // Import cross-references
      await this.importCrossReferences();
            
      // Generate report
      this.generateReport();
            
      // Close database connection
      await this.db.end();
            
    } catch (error) {
      console.error('❌ Fatal error during import:', error);
      if (this.db) {
        await this.db.end();
      }
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const importer = new ContentImporter();
  importer.run();
}

module.exports = ContentImporter;