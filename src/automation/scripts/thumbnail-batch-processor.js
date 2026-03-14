#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const ThumbnailGenerator = require('./thumbnail-generator');

/**
 * Batch processor for thumbnail generation
 * Handles large-scale thumbnail creation with progress tracking and error handling
 */
class ThumbnailBatchProcessor {
  constructor() {
    this.generator = new ThumbnailGenerator();
    this.results = [];
    this.errors = [];
    this.startTime = null;
  }

  /**
   * Process entire content calendar
   */
  async processContentCalendar(calendarPath, options = {}) {
    const {
      weekFilter = null,
      generateVariants = false,
      skipExisting = true,
      outputReport = true
    } = options;

    console.log('🎨 Starting thumbnail batch processing...');
    this.startTime = Date.now();

    try {
      // Load content calendar
      const calendar = await fs.readJson(calendarPath);
      console.log(`📅 Loaded calendar: ${calendar.program.title}`);
      console.log(`📊 Total weeks: ${calendar.program.totalWeeks}, Total videos: ${calendar.program.totalVideos}`);

      // Process each week
      for (const week of calendar.weeks) {
        if (weekFilter && week.week !== weekFilter) {
          console.log(`⏭️  Skipping Week ${week.week} (filtered)`);
          continue;
        }

        await this.processWeek(week, { generateVariants, skipExisting });
      }

      // Generate report
      if (outputReport) {
        await this.generateReport();
      }

      console.log(`✅ Batch processing complete! Generated ${this.results.length} thumbnails.`);

      if (this.errors.length > 0) {
        console.log(`⚠️  ${this.errors.length} errors occurred. Check the report for details.`);
      }

      return {
        success: true,
        results: this.results,
        errors: this.errors,
        duration: Date.now() - this.startTime
      };

    } catch (error) {
      console.error('❌ Batch processing failed:', error.message);
      return {
        success: false,
        error: error.message,
        results: this.results,
        errors: this.errors
      };
    }
  }

  /**
   * Process a single week
   */
  async processWeek(week, options = {}) {
    const { generateVariants = false, skipExisting = true } = options;

    console.log(`\n📅 Processing Week ${week.week}: ${week.theme}`);
    console.log(`🎨 Color: ${week.color}, Work Group: ${week.workGroup || 'N/A'}`);

    for (const video of week.videos) {
      await this.processVideo(video, week, { generateVariants, skipExisting });
    }
  }

  /**
   * Process a single video
   */
  async processVideo(video, week, options = {}) {
    const { generateVariants = false, skipExisting = true } = options;

    const videoData = {
      ...video,
      week: week.week,
      color: week.color,
      workGroup: week.workGroup,
      domain: week.domain,
      theme: week.theme
    };

    try {
      if (generateVariants) {
        // Generate A/B testing variants
        const variants = await this.generator.generateVariants(videoData);

        for (const variant of variants) {
          if (skipExisting && await fs.pathExists(variant.filepath)) {
            console.log(`  ⏭️  Skipping existing: ${variant.filename}`);
            continue;
          }

          this.results.push({
            ...variant,
            videoData,
            week: week.week,
            processingTime: Date.now()
          });

          console.log(`  ✅ Generated variant: ${variant.filename} (${variant.variant})`);
        }
      } else {
        // Generate single standard thumbnail
        const canvas = await this.generator.generateThumbnail(videoData);
        const filename = this.generator.generateFilename(videoData) + '.png';
        const filepath = await this.generator.saveThumbnail(canvas, filename);

        if (skipExisting && await fs.pathExists(filepath)) {
          console.log(`  ⏭️  Skipping existing: ${filename}`);
          return;
        }

        this.results.push({
          variant: 'standard',
          filename,
          filepath,
          videoData,
          week: week.week,
          processingTime: Date.now()
        });

        console.log(`  ✅ Generated: ${filename}`);
      }
    } catch (error) {
      const errorInfo = {
        video: video.title,
        week: week.week,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.errors.push(errorInfo);
      console.error(`  ❌ Error processing "${video.title}": ${error.message}`);
    }
  }

  /**
   * Generate processing report
   */
  async generateReport() {
    const reportData = {
      summary: {
        totalProcessed: this.results.length,
        totalErrors: this.errors.length,
        processingTime: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      results: this.results,
      errors: this.errors,
      statistics: this.generateStatistics()
    };

    const reportPath = path.join(process.cwd(), 'generated', 'thumbnails', 'processing-report.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, reportData, { spaces: 2 });

    console.log(`\n📊 Processing Report Generated: ${reportPath}`);
    this.printSummary(reportData.summary, reportData.statistics);
  }

  /**
   * Generate processing statistics
   */
  generateStatistics() {
    const stats = {
      byWeek: {},
      byType: {},
      byVariant: {},
      byDomain: {}
    };

    this.results.forEach(result => {
      // By week
      const week = result.week;
      if (!stats.byWeek[week]) stats.byWeek[week] = 0;
      stats.byWeek[week]++;

      // By type
      const type = result.videoData.type;
      if (!stats.byType[type]) stats.byType[type] = 0;
      stats.byType[type]++;

      // By variant
      const variant = result.variant;
      if (!stats.byVariant[variant]) stats.byVariant[variant] = 0;
      stats.byVariant[variant]++;

      // By domain
      const domain = result.videoData.domain || 'Unknown';
      if (!stats.byDomain[domain]) stats.byDomain[domain] = 0;
      stats.byDomain[domain]++;
    });

    return stats;
  }

  /**
   * Print summary to console
   */
  printSummary(summary, statistics) {
    console.log('\n📊 PROCESSING SUMMARY');
    console.log('═'.repeat(50));
    console.log(`✅ Successfully processed: ${summary.totalProcessed} thumbnails`);
    console.log(`❌ Errors encountered: ${summary.totalErrors}`);
    console.log(`⏱️  Total processing time: ${(summary.processingTime / 1000).toFixed(2)}s`);

    if (summary.totalProcessed > 0) {
      console.log(`⚡ Average time per thumbnail: ${(summary.processingTime / summary.totalProcessed / 1000).toFixed(2)}s`);
    }

    console.log('\n📈 STATISTICS BY CATEGORY');
    console.log('─'.repeat(30));

    console.log('\n🗓️  By Week:');
    Object.entries(statistics.byWeek).forEach(([week, count]) => {
      console.log(`  Week ${week}: ${count} thumbnails`);
    });

    console.log('\n🎬 By Video Type:');
    Object.entries(statistics.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} thumbnails`);
    });

    console.log('\n🎨 By Variant:');
    Object.entries(statistics.byVariant).forEach(([variant, count]) => {
      console.log(`  ${variant}: ${count} thumbnails`);
    });

    console.log('\n🎯 By Domain:');
    Object.entries(statistics.byDomain).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} thumbnails`);
    });
  }

  /**
   * Validate thumbnails after generation
   */
  async validateThumbnails() {
    console.log('\n🔍 Validating generated thumbnails...');

    const validationResults = {
      valid: 0,
      invalid: 0,
      missing: 0,
      issues: []
    };

    for (const result of this.results) {
      try {
        const exists = await fs.pathExists(result.filepath);
        if (!exists) {
          validationResults.missing++;
          validationResults.issues.push({
            file: result.filename,
            issue: 'File not found'
          });
          continue;
        }

        const stats = await fs.stat(result.filepath);
        if (stats.size === 0) {
          validationResults.invalid++;
          validationResults.issues.push({
            file: result.filename,
            issue: 'Empty file'
          });
          continue;
        }

        if (stats.size < 1000) { // Less than 1KB is suspicious
          validationResults.issues.push({
            file: result.filename,
            issue: 'File size suspiciously small',
            size: stats.size
          });
        }

        validationResults.valid++;
      } catch (error) {
        validationResults.invalid++;
        validationResults.issues.push({
          file: result.filename,
          issue: error.message
        });
      }
    }

    console.log(`✅ Valid thumbnails: ${validationResults.valid}`);
    console.log(`❌ Invalid thumbnails: ${validationResults.invalid}`);
    console.log(`❓ Missing thumbnails: ${validationResults.missing}`);

    if (validationResults.issues.length > 0) {
      console.log(`⚠️  Issues found: ${validationResults.issues.length}`);
      validationResults.issues.forEach(issue => {
        console.log(`  - ${issue.file}: ${issue.issue}`);
      });
    }

    return validationResults;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const processor = new ThumbnailBatchProcessor();

  try {
    switch (command) {
      case 'all':
        // Process entire calendar
        const calendarPath = path.join(process.cwd(), 'src/config/detailed-content-calendar.json');
        const generateVariants = args.includes('--variants');
        const skipExisting = !args.includes('--overwrite');

        const result = await processor.processContentCalendar(calendarPath, {
          generateVariants,
          skipExisting,
          outputReport: true
        });

        if (result.success) {
          await processor.validateThumbnails();
        }
        break;

      case 'week':
        // Process specific week
        const weekNumber = parseInt(args[1]);
        if (!weekNumber || weekNumber < 1 || weekNumber > 13) {
          console.error('❌ Please specify a valid week number (1-13)');
          process.exit(1);
        }

        const weekCalendarPath = path.join(process.cwd(), 'src/config/detailed-content-calendar.json');
        await processor.processContentCalendar(weekCalendarPath, {
          weekFilter: weekNumber,
          generateVariants: args.includes('--variants'),
          skipExisting: !args.includes('--overwrite')
        });
        break;

      case 'validate':
        // Validate existing thumbnails
        const validationResult = await processor.validateThumbnails();
        if (validationResult.invalid > 0 || validationResult.missing > 0) {
          process.exit(1);
        }
        break;

      default:
        console.log(`
PMP Thumbnail Batch Processor

Usage:
  npm run generate-thumbnails-batch all [--variants] [--overwrite]
  npm run generate-thumbnails-batch week <number> [--variants] [--overwrite]
  npm run generate-thumbnails-batch validate

Commands:
  all       Process entire 13-week calendar
  week <n>  Process specific week (1-13)
  validate  Validate existing thumbnails

Options:
  --variants   Generate A/B testing variants
  --overwrite  Overwrite existing thumbnails
        `);
    }
  } catch (error) {
    console.error('❌ Batch processing error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ThumbnailBatchProcessor;