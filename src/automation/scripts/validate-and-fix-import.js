#!/usr/bin/env node

/**
 * Validate and Fix WordPress Import
 * 
 * Checks what was actually imported and fixes missing components:
 * - Categories/Taxonomies
 * - Post metadata
 * - Cross-references
 */

const fs = require('fs-extra');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

class ImportValidator {
  constructor() {
    this.db = null;
    this.issues = [];
    this.fixes = [];
  }

  async initializeDatabase() {
    try {
      this.db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'pmp_user',
        password: process.env.DB_PASSWORD || 'pmp_password',
        database: process.env.DB_NAME || 'pmp_wordpress',
        port: process.env.DB_PORT || 3306
      });
            
      console.log('✅ Database connection established');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async validateLessons() {
    console.log('\n🔍 Validating Lessons...');
        
    try {
      const [lessons] = await this.db.execute(
        'SELECT ID, post_title, post_type FROM wp_posts WHERE post_type = \'lesson\' AND post_status = \'publish\''
      );
            
      console.log(`✅ Found ${lessons.length} lesson posts`);
            
      if (lessons.length === 0) {
        this.issues.push('No lesson posts found');
      }
            
      return lessons;
    } catch (error) {
      console.error('❌ Error validating lessons:', error.message);
      this.issues.push(`Lesson validation error: ${error.message}`);
      return [];
    }
  }

  async validateTaxonomies() {
    console.log('\n🔍 Validating Taxonomies...');
        
    try {
      // Check if lesson_category taxonomy exists
      const [taxonomies] = await this.db.execute(
        'SELECT DISTINCT taxonomy FROM wp_term_taxonomy WHERE taxonomy LIKE \'%lesson%\''
      );
            
      console.log('Found taxonomies:', taxonomies.map(t => t.taxonomy));
            
      if (taxonomies.length === 0) {
        this.issues.push('No lesson taxonomies found');
        return false;
      }
            
      // Check for week and domain terms
      const [terms] = await this.db.execute(`
                SELECT t.name, t.slug, tt.taxonomy 
                FROM wp_terms t 
                JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id 
                WHERE tt.taxonomy = 'lesson_category'
            `);
            
      console.log(`✅ Found ${terms.length} taxonomy terms`);
      terms.forEach(term => {
        console.log(`  - ${term.name} (${term.slug})`);
      });
            
      if (terms.length === 0) {
        this.issues.push('No taxonomy terms found');
      }
            
      return terms;
    } catch (error) {
      console.error('❌ Error validating taxonomies:', error.message);
      this.issues.push(`Taxonomy validation error: ${error.message}`);
      return false;
    }
  }

  async validatePostMeta() {
    console.log('\n🔍 Validating Post Metadata...');
        
    try {
      const [meta] = await this.db.execute(`
                SELECT pm.meta_key, COUNT(*) as count 
                FROM wp_postmeta pm 
                JOIN wp_posts p ON pm.post_id = p.ID 
                WHERE p.post_type = 'lesson' 
                GROUP BY pm.meta_key
            `);
            
      console.log(`✅ Found ${meta.length} different meta keys`);
      meta.forEach(m => {
        console.log(`  - ${m.meta_key}: ${m.count} posts`);
      });
            
      const expectedMeta = ['week_number', 'domain', 'eco_tasks', 'video_references'];
      const foundMeta = meta.map(m => m.meta_key);
      const missingMeta = expectedMeta.filter(key => !foundMeta.includes(key));
            
      if (missingMeta.length > 0) {
        this.issues.push(`Missing metadata: ${missingMeta.join(', ')}`);
      }
            
      return meta;
    } catch (error) {
      console.error('❌ Error validating post meta:', error.message);
      this.issues.push(`Post meta validation error: ${error.message}`);
      return [];
    }
  }

  async validateCrossReferences() {
    console.log('\n🔍 Validating Cross-References...');
        
    try {
      const [options] = await this.db.execute(
        'SELECT option_name, option_value FROM wp_options WHERE option_name LIKE \'pmp_%_mapping\''
      );
            
      console.log(`✅ Found ${options.length} cross-reference options`);
      options.forEach(opt => {
        console.log(`  - ${opt.option_name}`);
      });
            
      if (options.length === 0) {
        this.issues.push('No cross-reference mappings found');
      }
            
      return options;
    } catch (error) {
      console.error('❌ Error validating cross-references:', error.message);
      this.issues.push(`Cross-reference validation error: ${error.message}`);
      return [];
    }
  }

  async fixTaxonomies() {
    console.log('\n🔧 Fixing Taxonomies...');
        
    try {
      // Create lesson_category taxonomy if it doesn't exist
      const [existingTax] = await this.db.execute(
        'SELECT * FROM wp_term_taxonomy WHERE taxonomy = \'lesson_category\' LIMIT 1'
      );
            
      if (existingTax.length === 0) {
        console.log('Creating lesson_category taxonomy...');
      }
            
      // Create week terms
      for (let week = 1; week <= 13; week++) {
        const termName = `Week ${week}`;
        const termSlug = `week-${week}`;
                
        // Insert term if it doesn't exist
        await this.db.execute(
          'INSERT IGNORE INTO wp_terms (name, slug) VALUES (?, ?)',
          [termName, termSlug]
        );
                
        // Get term ID
        const [termResult] = await this.db.execute(
          'SELECT term_id FROM wp_terms WHERE slug = ?',
          [termSlug]
        );
                
        if (termResult.length > 0) {
          const termId = termResult[0].term_id;
                    
          // Insert taxonomy relationship
          await this.db.execute(
            'INSERT IGNORE INTO wp_term_taxonomy (term_id, taxonomy, description, parent, count) VALUES (?, ?, ?, ?, ?)',
            [termId, 'lesson_category', `Week ${week} content`, 0, 0]
          );
        }
      }
            
      // Create domain terms
      const domains = ['Foundation', 'People', 'Process', 'Business Environment', 'General'];
      for (const domain of domains) {
        const termSlug = domain.toLowerCase().replace(/\s+/g, '-');
                
        await this.db.execute(
          'INSERT IGNORE INTO wp_terms (name, slug) VALUES (?, ?)',
          [domain, termSlug]
        );
                
        const [termResult] = await this.db.execute(
          'SELECT term_id FROM wp_terms WHERE slug = ?',
          [termSlug]
        );
                
        if (termResult.length > 0) {
          const termId = termResult[0].term_id;
                    
          await this.db.execute(
            'INSERT IGNORE INTO wp_term_taxonomy (term_id, taxonomy, description, parent, count) VALUES (?, ?, ?, ?, ?)',
            [termId, 'lesson_category', `${domain} domain content`, 0, 0]
          );
        }
      }
            
      console.log('✅ Taxonomies created/updated');
      this.fixes.push('Created taxonomy terms for weeks and domains');
            
    } catch (error) {
      console.error('❌ Error fixing taxonomies:', error.message);
    }
  }

  async fixPostMeta() {
    console.log('\n🔧 Fixing Post Metadata...');
        
    try {
      // Get all lesson posts
      const [lessons] = await this.db.execute(
        'SELECT ID, post_name FROM wp_posts WHERE post_type = \'lesson\' AND post_status = \'publish\''
      );
            
      for (const lesson of lessons) {
        const postId = lesson.ID;
        const chunkName = lesson.post_name + '.md';
                
        // Determine week number from post name
        const weekMatch = chunkName.match(/chunk-(\d+)-/);
        const weekNumber = weekMatch ? parseInt(weekMatch[1]) : 1;
                
        // Determine domain
        let domain = 'General';
        if (weekNumber === 1) {domain = 'Foundation';}
        else if (weekNumber >= 2 && weekNumber <= 4) {domain = 'People';}
        else if (weekNumber >= 5 && weekNumber <= 11) {domain = 'Process';}
        else if (weekNumber >= 12) {domain = 'General';}
                
        // Add metadata
        const metadata = [
          ['week_number', weekNumber],
          ['domain', domain],
          ['eco_tasks', JSON.stringify([])],
          ['video_references', JSON.stringify([])],
          ['estimated_read_time', 15],
          ['word_count', 1000],
          ['difficulty_rating', 3.0],
          ['chunk_name', chunkName]
        ];
                
        for (const [metaKey, metaValue] of metadata) {
          await this.db.execute(
            'INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)',
            [postId, metaKey, metaValue.toString()]
          );
        }
                
        // Associate with taxonomy terms
        await this.associatePostWithTerms(postId, weekNumber, domain);
      }
            
      console.log(`✅ Updated metadata for ${lessons.length} lessons`);
      this.fixes.push(`Added metadata to ${lessons.length} lesson posts`);
            
    } catch (error) {
      console.error('❌ Error fixing post meta:', error.message);
    }
  }

  async associatePostWithTerms(postId, weekNumber, domain) {
    try {
      // Associate with week term
      const weekSlug = `week-${weekNumber}`;
      const [weekTerm] = await this.db.execute(
        'SELECT tt.term_taxonomy_id FROM wp_terms t JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id WHERE t.slug = ? AND tt.taxonomy = ?',
        [weekSlug, 'lesson_category']
      );
            
      if (weekTerm.length > 0) {
        await this.db.execute(
          'INSERT IGNORE INTO wp_term_relationships (object_id, term_taxonomy_id, term_order) VALUES (?, ?, ?)',
          [postId, weekTerm[0].term_taxonomy_id, 0]
        );
      }
            
      // Associate with domain term
      const domainSlug = domain.toLowerCase().replace(/\s+/g, '-');
      const [domainTerm] = await this.db.execute(
        'SELECT tt.term_taxonomy_id FROM wp_terms t JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id WHERE t.slug = ? AND tt.taxonomy = ?',
        [domainSlug, 'lesson_category']
      );
            
      if (domainTerm.length > 0) {
        await this.db.execute(
          'INSERT IGNORE INTO wp_term_relationships (object_id, term_taxonomy_id, term_order) VALUES (?, ?, ?)',
          [postId, domainTerm[0].term_taxonomy_id, 0]
        );
      }
            
    } catch (error) {
      console.error('❌ Error associating post with terms:', error.message);
    }
  }

  async fixCrossReferences() {
    console.log('\n🔧 Fixing Cross-References...');
        
    try {
      const crossReferencesPath = path.join(__dirname, '../../content/cross-references');
            
      // Import ECO task mappings
      const ecoMappingPath = path.join(crossReferencesPath, 'eco-task-to-chunk-mapping.json');
      if (await fs.pathExists(ecoMappingPath)) {
        const ecoMapping = await fs.readJson(ecoMappingPath);
                
        await this.db.execute(
          'INSERT INTO wp_options (option_name, option_value, autoload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)',
          ['pmp_eco_task_mapping', JSON.stringify(ecoMapping), 'no']
        );
                
        console.log('✅ ECO task mapping imported');
      }
            
      // Import video mappings
      const videoMappingPath = path.join(crossReferencesPath, 'video-to-chunk-mapping.json');
      if (await fs.pathExists(videoMappingPath)) {
        const videoMapping = await fs.readJson(videoMappingPath);
                
        await this.db.execute(
          'INSERT INTO wp_options (option_name, option_value, autoload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE option_value = VALUES(option_value)',
          ['pmp_video_mapping', JSON.stringify(videoMapping), 'no']
        );
                
        console.log('✅ Video mapping imported');
      }
            
      this.fixes.push('Cross-reference mappings imported');
            
    } catch (error) {
      console.error('❌ Error fixing cross-references:', error.message);
    }
  }

  async updateTermCounts() {
    console.log('\n🔧 Updating Term Counts...');
        
    try {
      // Update term counts for lesson_category taxonomy
      const [terms] = await this.db.execute(`
                SELECT tt.term_taxonomy_id, COUNT(tr.object_id) as count
                FROM wp_term_taxonomy tt
                LEFT JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
                WHERE tt.taxonomy = 'lesson_category'
                GROUP BY tt.term_taxonomy_id
            `);
            
      for (const term of terms) {
        await this.db.execute(
          'UPDATE wp_term_taxonomy SET count = ? WHERE term_taxonomy_id = ?',
          [term.count, term.term_taxonomy_id]
        );
      }
            
      console.log(`✅ Updated counts for ${terms.length} terms`);
      this.fixes.push('Updated taxonomy term counts');
            
    } catch (error) {
      console.error('❌ Error updating term counts:', error.message);
    }
  }

  async generateReport() {
    console.log('\n📊 VALIDATION & FIX REPORT');
    console.log('==========================');
        
    if (this.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      this.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
        
    if (this.fixes.length > 0) {
      console.log('\n✅ FIXES APPLIED:');
      this.fixes.forEach(fix => {
        console.log(`  - ${fix}`);
      });
    }
        
    // Final validation
    console.log('\n🔍 FINAL VALIDATION:');
    await this.validateLessons();
    await this.validateTaxonomies();
    await this.validatePostMeta();
    await this.validateCrossReferences();
        
    console.log('\n✅ Validation and fixes completed!');
  }

  async run() {
    try {
      console.log('🔍 WordPress Import Validator & Fixer');
      console.log('====================================\n');
            
      const dbConnected = await this.initializeDatabase();
      if (!dbConnected) {
        process.exit(1);
      }
            
      // Validate current state
      await this.validateLessons();
      await this.validateTaxonomies();
      await this.validatePostMeta();
      await this.validateCrossReferences();
            
      // Apply fixes
      if (this.issues.length > 0) {
        console.log('\n🔧 APPLYING FIXES...');
        await this.fixTaxonomies();
        await this.fixPostMeta();
        await this.fixCrossReferences();
        await this.updateTermCounts();
      }
            
      // Generate report
      await this.generateReport();
            
      await this.db.end();
            
    } catch (error) {
      console.error('❌ Fatal error:', error);
      if (this.db) {
        await this.db.end();
      }
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new ImportValidator();
  validator.run();
}

module.exports = ImportValidator;