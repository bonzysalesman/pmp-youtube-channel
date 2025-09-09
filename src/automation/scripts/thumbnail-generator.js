#!/usr/bin/env node

const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const ThumbnailTemplateEngine = require('./thumbnail-template-engine');

/**
 * Color-coded thumbnail generation system for PMP YouTube channel
 * Implements domain-specific templates with automated text overlays
 */
class ThumbnailGenerator {
  constructor() {
    this.templateEngine = new ThumbnailTemplateEngine();
    this.width = 1280;
    this.height = 720;
    this.safeWidth = 1235;
    this.safeHeight = 675;
    
    // Domain color scheme from specs (legacy support)
    this.colors = {
      people: '#2ECC71',      // Green
      process: '#3498DB',     // Blue
      businessEnvironment: '#E67E22', // Orange
      practiceReview: '#9B59B6'       // Purple
    };
    
    // Output directory
    this.outputDir = path.join(process.cwd(), 'generated', 'thumbnails');
    
    // Ensure output directory exists
    fs.ensureDirSync(this.outputDir);
  }

  /**
   * Get domain color based on video type and content
   */
  getDomainColor(videoData) {
    if (videoData.type === 'practice' || videoData.type === 'review' || 
        videoData.type === 'weekly-review' || videoData.type === 'channel-trailer') {
      return this.colors.practiceReview;
    }
    
    if (videoData.domain === 'People (42%)' || videoData.workGroup === 'Building Team') {
      return this.colors.people;
    }
    
    if (videoData.domain === 'Process (50%)' || videoData.workGroup?.includes('Process')) {
      return this.colors.process;
    }
    
    if (videoData.domain === 'Business Environment (8%)' || videoData.workGroup?.includes('Business')) {
      return this.colors.businessEnvironment;
    }
    
    // Default based on week color if specified
    if (videoData.color) {
      switch (videoData.color) {
      case 'green': return this.colors.people;
      case 'blue': return this.colors.process;
      case 'orange': return this.colors.businessEnvironment;
      case 'purple': return this.colors.practiceReview;
      }
    }
    
    return this.colors.process; // Default fallback
  }

  /**
   * Create gradient background
   */
  createGradientBackground(ctx, color, variant = 'standard') {
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    
    switch (variant) {
    case 'high-contrast':
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, '#2C3E50'); // Dark contrast
      break;
    case 'subtle':
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, this.lightenColor(color, 20));
      break;
    default: // standard
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, this.darkenColor(color, 30));
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Utility to darken a hex color
   */
  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Utility to lighten a hex color
   */
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R) * 0x10000 +
      (G > 255 ? 255 : G) * 0x100 + (B > 255 ? 255 : B)).toString(16).slice(1);
  }

  /**
   * Add text with automatic sizing and positioning
   */
  addText(ctx, text, x, y, maxWidth, fontSize, color = '#FFFFFF', fontWeight = 'bold') {
    ctx.fillStyle = color;
    ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Word wrap if text is too long
    const words = text.split(' ');
    let line = '';
    const lines = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    // Draw each line
    const lineHeight = fontSize * 1.2;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), x, startY + (index * lineHeight));
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * Generate daily study video thumbnail
   */
  async generateDailyStudyThumbnail(videoData, variant = 'standard') {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');
    
    const color = this.getDomainColor(videoData);
    this.createGradientBackground(ctx, color, variant);
    
    // Day number (top left)
    if (videoData.dayNumber) {
      this.addText(ctx, `Day ${videoData.dayNumber}`, 160, 120, 300, 72, '#FFFFFF', 'bold');
    }
    
    // Topic title (center)
    const title = this.extractTopicFromTitle(videoData.title);
    this.addText(ctx, title, this.width / 2, this.height / 2, this.safeWidth - 100, 48, '#FFFFFF', 'bold');
    
    // Week indicator (bottom right)
    if (videoData.week) {
      this.addText(ctx, `Week ${videoData.week}`, this.width - 160, this.height - 80, 300, 36, '#FFFFFF', 'normal');
    }
    
    // Add branding element (optional)
    if (variant === 'with-branding') {
      this.addBrandingElement(ctx);
    }
    
    return canvas;
  }

  /**
   * Generate practice session thumbnail
   */
  async generatePracticeSessionThumbnail(videoData, variant = 'standard') {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');
    
    this.createGradientBackground(ctx, this.colors.practiceReview, variant);
    
    // "Practice" label (top left)
    this.addText(ctx, 'PRACTICE', 200, 120, 400, 64, '#FFFFFF', 'bold');
    
    // Topic title (center)
    const title = this.extractTopicFromTitle(videoData.title);
    this.addText(ctx, title, this.width / 2, this.height / 2, this.safeWidth - 100, 44, '#FFFFFF', 'bold');
    
    // Week indicator (bottom right)
    if (videoData.week) {
      this.addText(ctx, `Week ${videoData.week}`, this.width - 160, this.height - 80, 300, 36, '#FFFFFF', 'normal');
    }
    
    return canvas;
  }

  /**
   * Generate review session thumbnail
   */
  async generateReviewSessionThumbnail(videoData, variant = 'standard') {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');
    
    // Mixed domain colors for review
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, this.colors.people);
    gradient.addColorStop(0.33, this.colors.process);
    gradient.addColorStop(0.66, this.colors.businessEnvironment);
    gradient.addColorStop(1, this.colors.practiceReview);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Week review title (top)
    if (videoData.week) {
      this.addText(ctx, `Week ${videoData.week} Review`, this.width / 2, 150, this.safeWidth - 100, 56, '#FFFFFF', 'bold');
    }
    
    // Topics covered (center)
    const title = this.extractTopicFromTitle(videoData.title);
    this.addText(ctx, title, this.width / 2, this.height / 2, this.safeWidth - 100, 40, '#FFFFFF', 'normal');
    
    // Progress indicator (bottom)
    const progressText = `${Math.round((videoData.week / 13) * 100)}% Complete`;
    this.addText(ctx, progressText, this.width / 2, this.height - 100, 400, 32, '#FFFFFF', 'normal');
    
    return canvas;
  }

  /**
   * Extract clean topic from video title
   */
  extractTopicFromTitle(title) {
    // Remove day numbers, common prefixes, and clean up
    return title
      .replace(/^Day \d+:\s*/, '')
      .replace(/\s*\|\s*.*$/, '')
      .replace(/Week \d+:\s*/, '')
      .trim();
  }

  /**
   * Add branding element (placeholder for future implementation)
   */
  addBrandingElement(ctx) {
    // Placeholder for logo or personal branding
    // Could load and draw a logo image here
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(this.width - 200, 20, 180, 60);
  }

  /**
   * Generate thumbnail based on video type using template engine
   */
  async generateThumbnail(videoData, variant = 'standard') {
    // Determine template based on video type
    let templateName;
    
    switch (videoData.type) {
    case 'daily-study':
      templateName = 'dailyStudy';
      break;
    case 'practice':
      templateName = 'practiceSession';
      break;
    case 'review':
    case 'weekly-review':
      templateName = 'reviewSession';
      break;
    case 'channel-trailer':
      templateName = 'channelTrailer';
      break;
    default:
      templateName = 'dailyStudy';
    }
    
    // Use template engine for generation
    return await this.templateEngine.generateFromTemplate(templateName, videoData, variant);
  }

  /**
   * Save thumbnail to file
   */
  async saveThumbnail(canvas, filename) {
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(this.outputDir, filename);
    await fs.writeFile(filepath, buffer);
    return filepath;
  }

  /**
   * Generate A/B testing variants using template engine
   */
  async generateVariants(videoData) {
    // Determine template based on video type
    let templateName;
    
    switch (videoData.type) {
    case 'daily-study':
      templateName = 'dailyStudy';
      break;
    case 'practice':
      templateName = 'practiceSession';
      break;
    case 'review':
    case 'weekly-review':
      templateName = 'reviewSession';
      break;
    case 'channel-trailer':
      templateName = 'channelTrailer';
      break;
    default:
      templateName = 'dailyStudy';
    }
    
    // Use template engine for variant generation
    return await this.templateEngine.generateVariants(templateName, videoData);
  }

  /**
   * Generate filename from video data
   */
  generateFilename(videoData) {
    const week = videoData.week ? `w${videoData.week.toString().padStart(2, '0')}` : 'w00';
    const day = videoData.dayNumber ? `d${videoData.dayNumber.toString().padStart(2, '0')}` : videoData.day?.toLowerCase().substring(0, 3) || 'xxx';
    const type = videoData.type || 'video';
    
    return `${week}_${day}_${type}`;
  }

  /**
   * Batch generate thumbnails from content calendar
   */
  async generateBatch(contentCalendar, options = {}) {
    const results = [];
    const { generateVariants = false, weekFilter = null } = options;
    
    console.log('Starting batch thumbnail generation...');
    
    for (const week of contentCalendar.weeks) {
      if (weekFilter && week.week !== weekFilter) {continue;}
      
      console.log(`Processing Week ${week.week}: ${week.theme}`);
      
      for (const video of week.videos) {
        const videoData = {
          ...video,
          week: week.week,
          color: week.color,
          workGroup: week.workGroup,
          domain: week.domain
        };
        
        try {
          if (generateVariants) {
            const variants = await this.generateVariants(videoData);
            results.push(...variants);
            console.log(`  Generated ${variants.length} variants for: ${video.title}`);
          } else {
            const canvas = await this.generateThumbnail(videoData);
            const filename = `${this.generateFilename(videoData)}.png`;
            const filepath = await this.saveThumbnail(canvas, filename);
            
            results.push({
              variant: 'standard',
              filename,
              filepath,
              videoData
            });
            console.log(`  Generated: ${filename}`);
          }
        } catch (error) {
          console.error(`  Error generating thumbnail for ${video.title}:`, error.message);
        }
      }
    }
    
    console.log(`\nBatch generation complete! Generated ${results.length} thumbnails.`);
    console.log(`Output directory: ${this.outputDir}`);
    
    return results;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const generator = new ThumbnailGenerator();
  
  try {
    switch (command) {
    case 'batch':
      const calendarPath = path.join(process.cwd(), 'src/config/detailed-content-calendar.json');
      const calendar = await fs.readJson(calendarPath);
        
      const weekFilter = args[1] ? parseInt(args[1]) : null;
      const generateVariants = args.includes('--variants');
        
      await generator.generateBatch(calendar, { 
        weekFilter, 
        generateVariants 
      });
      break;
        
    case 'single':
      // Generate single thumbnail for testing
      const testVideo = {
        title: 'Day 1: PMP Exam 2024 Complete Overview | What You Need to Know',
        type: 'daily-study',
        dayNumber: 1,
        week: 1
      };
        
      const canvas = await generator.generateThumbnail(testVideo);
      const filepath = await generator.saveThumbnail(canvas, 'test_thumbnail.png');
      console.log(`Test thumbnail generated: ${filepath}`);
      break;
        
    case 'variants':
      // Generate A/B testing variants for a single video
      const variantVideo = {
        title: 'Day 8: Team Ground Rules That Actually Work | Avoid Team Chaos',
        type: 'daily-study',
        dayNumber: 8,
        week: 2,
        color: 'green'
      };
        
      const variants = await generator.generateVariants(variantVideo);
      console.log('Generated variants:', variants.map(v => v.filename));
      break;
        
    default:
      console.log(`
PMP Thumbnail Generator

Usage:
  npm run generate-thumbnails single          # Generate test thumbnail
  npm run generate-thumbnails batch           # Generate all thumbnails
  npm run generate-thumbnails batch 2         # Generate thumbnails for week 2
  npm run generate-thumbnails batch -- --variants  # Generate with A/B variants
  npm run generate-thumbnails variants        # Generate A/B test variants

Options:
  --variants    Generate A/B testing variants (standard, high-contrast, subtle)
        `);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ThumbnailGenerator;