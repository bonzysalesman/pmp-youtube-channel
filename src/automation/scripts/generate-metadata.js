#!/usr/bin/env node

/**
 * Generate Metadata CLI
 * 
 * Command-line interface for generating video metadata and descriptions
 * 
 * Usage:
 *   node generate-metadata.js --all                    # Generate all videos
 *   node generate-metadata.js --week 1                 # Generate week 1 videos
 *   node generate-metadata.js --type daily-study       # Generate daily study videos
 *   node generate-metadata.js --domain People          # Generate People domain videos
 *   node generate-metadata.js --day 1                  # Generate specific day
 *   node generate-metadata.js --export csv             # Export to CSV
 *   node generate-metadata.js --playlists              # Generate playlist configs
 */

const fs = require('fs-extra');
const path = require('path');
const VideoMetadataGenerator = require('./video-metadata-generator');
const MetadataBatchProcessor = require('./metadata-batch-processor');

class MetadataCLI {
  constructor() {
    this.generator = new VideoMetadataGenerator();
    this.batchProcessor = new MetadataBatchProcessor();
    this.args = this.parseArguments();
  }

  /**
     * Parse command line arguments
     */
  parseArguments() {
    const args = process.argv.slice(2);
    const parsed = {
      all: false,
      week: null,
      type: null,
      domain: null,
      day: null,
      export: null,
      playlists: false,
      help: false,
      verbose: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
            
      switch (arg) {
      case '--all':
        parsed.all = true;
        break;
      case '--week':
        parsed.week = parseInt(args[++i]);
        break;
      case '--type':
        parsed.type = args[++i];
        break;
      case '--domain':
        parsed.domain = args[++i];
        break;
      case '--day':
        parsed.day = parseInt(args[++i]);
        break;
      case '--export':
        parsed.export = args[++i];
        break;
      case '--playlists':
        parsed.playlists = true;
        break;
      case '--help':
      case '-h':
        parsed.help = true;
        break;
      case '--verbose':
      case '-v':
        parsed.verbose = true;
        break;
      }
    }

    return parsed;
  }

  /**
     * Main execution method
     */
  async run() {
    try {
      if (this.args.help) {
        this.showHelp();
        return;
      }

      console.log('🎬 PMP Video Metadata Generator');
      console.log('================================\n');

      if (this.args.all) {
        await this.generateAllMetadata();
      } else if (this.args.week) {
        await this.generateWeekMetadata(this.args.week);
      } else if (this.args.type) {
        await this.generateTypeMetadata(this.args.type);
      } else if (this.args.domain) {
        await this.generateDomainMetadata(this.args.domain);
      } else if (this.args.day) {
        await this.generateDayMetadata(this.args.day);
      } else if (this.args.playlists) {
        await this.generatePlaylistConfigs();
      } else if (this.args.export) {
        await this.exportData(this.args.export);
      } else {
        console.log('❌ No valid options provided. Use --help for usage information.');
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
      if (this.args.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
     * Generate metadata for all videos
     */
  async generateAllMetadata() {
    console.log('🚀 Generating metadata for all 91 videos...\n');
        
    const startTime = Date.now();
    const result = await this.batchProcessor.processAllVideos();
    const endTime = Date.now();
        
    console.log('\n✅ Complete! Generated metadata for all videos');
    console.log('📊 Summary:');
    console.log(`   • Total Videos: ${result.summary.totalVideos}`);
    console.log(`   • Processing Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`   • Output Directory: ${this.batchProcessor.outputDir}`);
        
    this.showSummaryByType(result.summary.byType);
    this.showSummaryByDomain(result.summary.byDomain);
  }

  /**
     * Generate metadata for specific week
     */
  async generateWeekMetadata(weekNumber) {
    console.log(`📅 Generating metadata for Week ${weekNumber}...\n`);
        
    const videos = await this.batchProcessor.processVideosByCriteria({ week: weekNumber });
        
    console.log(`✅ Generated metadata for ${videos.length} videos in Week ${weekNumber}`);
        
    videos.forEach(video => {
      console.log(`   • ${video.basic.title}`);
    });
  }

  /**
     * Generate metadata for specific video type
     */
  async generateTypeMetadata(type) {
    console.log(`🎥 Generating metadata for ${type} videos...\n`);
        
    const videos = await this.batchProcessor.processVideosByCriteria({ type });
        
    console.log(`✅ Generated metadata for ${videos.length} ${type} videos`);
        
    if (this.args.verbose) {
      videos.forEach(video => {
        console.log(`   • Week ${video.basic.week}: ${video.basic.title}`);
      });
    }
  }

  /**
     * Generate metadata for specific domain
     */
  async generateDomainMetadata(domain) {
    console.log(`🎯 Generating metadata for ${domain} domain videos...\n`);
        
    const videos = await this.batchProcessor.processVideosByCriteria({ domain });
        
    console.log(`✅ Generated metadata for ${videos.length} ${domain} domain videos`);
        
    if (this.args.verbose) {
      videos.forEach(video => {
        console.log(`   • Day ${video.basic.dayNumber}: ${video.basic.title}`);
      });
    }
  }

  /**
     * Generate metadata for specific day
     */
  async generateDayMetadata(dayNumber) {
    console.log(`📆 Generating metadata for Day ${dayNumber}...\n`);
        
    await this.generator.loadConfigurations();
    const contentCalendar = this.generator.contentCalendar;
        
    // Find the video for this day
    let targetVideo = null;
    let targetWeek = null;
        
    for (const week of contentCalendar.weeks) {
      for (const video of week.videos) {
        if (video.dayNumber === dayNumber) {
          targetVideo = video;
          targetWeek = week;
          break;
        }
      }
      if (targetVideo) {break;}
    }
        
    if (!targetVideo) {
      console.log(`❌ No video found for Day ${dayNumber}`);
      return;
    }
        
    const videoConfig = {
      ...targetVideo,
      week: targetWeek.week,
      theme: targetWeek.theme,
      workGroup: targetWeek.workGroup,
      domain: targetWeek.domain || this.batchProcessor.inferDomain(targetVideo)
    };
        
    const metadata = this.generator.generateVideoMetadata(videoConfig);
        
    console.log(`✅ Generated metadata for Day ${dayNumber}:`);
    console.log(`   • Title: ${metadata.basic.title}`);
    console.log(`   • Domain: ${metadata.basic.domain}`);
    console.log(`   • Duration: ${metadata.basic.duration}`);
    console.log(`   • Keywords: ${metadata.keywords.slice(0, 5).join(', ')}`);
    console.log(`   • Playlists: ${metadata.playlists.length}`);
        
    if (this.args.verbose) {
      console.log('\n📝 Description Preview:');
      console.log(metadata.description.substring(0, 200) + '...');
    }
  }

  /**
     * Generate playlist configurations
     */
  async generatePlaylistConfigs() {
    console.log('📋 Generating playlist configurations...\n');
        
    const result = await this.batchProcessor.processAllVideos();
    const playlists = result.consolidatedPlaylists;
        
    console.log(`✅ Generated ${Object.keys(playlists).length} playlist configurations:`);
        
    Object.values(playlists).forEach(playlist => {
      console.log(`   • ${playlist.name} (${playlist.videos.length} videos)`);
    });
        
    console.log(`\n💾 Saved to: ${path.join(this.batchProcessor.outputDir, 'playlists')}`);
  }

  /**
     * Export data in specified format
     */
  async exportData(format) {
    console.log(`📤 Exporting data in ${format} format...\n`);
        
    const result = await this.batchProcessor.processAllVideos();
        
    switch (format.toLowerCase()) {
    case 'csv':
      await this.exportCSV(result.videos);
      break;
    case 'json':
      await this.exportJSON(result);
      break;
    case 'youtube':
      await this.exportYouTubeUpload(result.videos);
      break;
    default:
      console.log(`❌ Unsupported export format: ${format}`);
      console.log('Supported formats: csv, json, youtube');
    }
  }

  /**
     * Export to CSV format
     */
  async exportCSV(videos) {
    await this.batchProcessor.generateCSVExport(videos);
    console.log('✅ CSV export complete');
    console.log(`💾 Saved to: ${path.join(this.batchProcessor.outputDir, 'video-metadata-export.csv')}`);
  }

  /**
     * Export to JSON format
     */
  async exportJSON(result) {
    const exportPath = path.join(this.batchProcessor.outputDir, 'complete-export.json');
    await fs.writeJson(exportPath, result, { spaces: 2 });
    console.log('✅ JSON export complete');
    console.log(`💾 Saved to: ${exportPath}`);
  }

  /**
     * Export YouTube upload format
     */
  async exportYouTubeUpload(videos) {
    const uploadBatch = this.batchProcessor.generateUploadBatch(videos);
    const exportPath = path.join(this.batchProcessor.outputDir, 'youtube-upload-batch.json');
    await fs.writeJson(exportPath, uploadBatch, { spaces: 2 });
    console.log('✅ YouTube upload batch export complete');
    console.log(`💾 Saved to: ${exportPath}`);
  }

  /**
     * Show summary by type
     */
  showSummaryByType(byType) {
    console.log('\n📊 By Video Type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} videos`);
    });
  }

  /**
     * Show summary by domain
     */
  showSummaryByDomain(byDomain) {
    console.log('\n🎯 By Domain:');
    Object.entries(byDomain).forEach(([domain, count]) => {
      console.log(`   • ${domain}: ${count} videos`);
    });
  }

  /**
     * Show help information
     */
  showHelp() {
    console.log(`
🎬 PMP Video Metadata Generator CLI

USAGE:
  node generate-metadata.js [OPTIONS]

OPTIONS:
  --all                    Generate metadata for all 91 videos
  --week <number>          Generate metadata for specific week (1-13)
  --type <type>            Generate metadata for specific video type
                          (daily-study, practice, review, channel-trailer)
  --domain <domain>        Generate metadata for specific domain
                          (People, Process, Business Environment)
  --day <number>           Generate metadata for specific day (1-91)
  --playlists              Generate playlist configurations only
  --export <format>        Export data in specified format (csv, json, youtube)
  --verbose, -v            Show detailed output
  --help, -h               Show this help message

EXAMPLES:
  node generate-metadata.js --all
  node generate-metadata.js --week 1 --verbose
  node generate-metadata.js --type daily-study
  node generate-metadata.js --domain People
  node generate-metadata.js --day 15
  node generate-metadata.js --export csv
  node generate-metadata.js --playlists

OUTPUT:
  Generated files are saved to: src/generated/metadata/
  - Individual video metadata: individual/
  - Batch processing results: batch/
  - Playlist configurations: playlists/
  - CSV exports and descriptions: root directory
        `);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new MetadataCLI();
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = MetadataCLI;