const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

/**
 * Template-based thumbnail generation engine
 * Provides flexible, configuration-driven thumbnail creation
 */
class ThumbnailTemplateEngine {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(process.cwd(), 'src/config/thumbnail-config.json');
    this.config = null;
    this.configLoaded = false;
  }

  /**
   * Load thumbnail configuration
   */
  async loadConfig() {
    if (this.configLoaded) {return;}
    
    try {
      this.config = await fs.readJson(this.configPath);
      this.configLoaded = true;
    } catch (error) {
      throw new Error(`Failed to load thumbnail config: ${error.message}`);
    }
  }

  /**
   * Get domain color configuration
   */
  async getDomainColorConfig(domain) {
    await this.loadConfig();
    
    const domainMap = {
      'people': 'people',
      'process': 'process',
      'business': 'businessEnvironment',
      'businessenvironment': 'businessEnvironment',
      'practice': 'practiceReview',
      'review': 'practiceReview',
      'practicereview': 'practiceReview'
    };

    const configKey = domainMap[domain.toLowerCase()] || 'process';
    return this.config.colorScheme[configKey];
  }

  /**
   * Generate color variations
   */
  generateColorVariations(baseColor) {
    const variations = {
      primary: baseColor,
      primaryDark30: this.adjustBrightness(baseColor, -30),
      primaryLight20: this.adjustBrightness(baseColor, 20)
    };
    return variations;
  }

  /**
   * Adjust color brightness
   */
  adjustBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + 
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  /**
   * Create gradient background based on variant configuration
   */
  createBackground(ctx, colorConfig, variant) {
    const { width, height } = this.config.dimensions;
    const variantConfig = this.config.variants[variant] || this.config.variants.standard;
    const colorVariations = this.generateColorVariations(colorConfig.primary);

    if (variantConfig.backgroundType === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      variantConfig.gradientStops.forEach(stop => {
        let color = stop.color;
        if (colorVariations[color]) {
          color = colorVariations[color];
        } else if (color === 'primary') {
          color = colorConfig.primary;
        }
        gradient.addColorStop(stop.position, color);
      });
      
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = colorConfig.primary;
    }
    
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Render text element with configuration
   */
  renderTextElement(ctx, elementConfig, text, data = {}) {
    const { typography } = this.config;
    
    // Set font properties
    const fontSize = elementConfig.fontSize || typography.sizes.mainTitle;
    const fontWeight = elementConfig.fontWeight || typography.weights.normal;
    const fontFamily = typography.primaryFont;
    
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = elementConfig.color || '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Process text with data substitution
    let processedText = text;
    if (elementConfig.format) {
      processedText = this.substituteVariables(elementConfig.format, data);
    } else if (elementConfig.text) {
      processedText = elementConfig.text;
    }
    
    // Handle word wrapping if enabled
    if (elementConfig.wordWrap && elementConfig.maxWidth) {
      this.renderWrappedText(ctx, processedText, elementConfig);
    } else {
      ctx.fillText(processedText, elementConfig.position.x, elementConfig.position.y);
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * Render text with word wrapping
   */
  renderWrappedText(ctx, text, elementConfig) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > elementConfig.maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Calculate line height and starting position
    const lineHeight = elementConfig.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = elementConfig.position.y - (totalHeight / 2) + (lineHeight / 2);
    
    // Render each line
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, elementConfig.position.x, y);
    });
  }

  /**
   * Substitute variables in text templates
   */
  substituteVariables(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Add branding elements if configured
   */
  addBrandingElements(ctx, variant) {
    const variantConfig = this.config.variants[variant];
    if (!variantConfig?.includeBranding) {return;}
    
    const { brandingElements } = this.config;
    
    // Add logo placeholder (would load actual image in production)
    if (brandingElements.logo) {
      const logo = brandingElements.logo;
      ctx.fillStyle = `rgba(255, 255, 255, ${logo.opacity || 0.9})`;
      ctx.fillRect(logo.position.x, logo.position.y, logo.width, logo.height);
    }
    
    // Add watermark
    if (brandingElements.watermark) {
      const watermark = brandingElements.watermark;
      ctx.font = `${watermark.fontSize}px ${this.config.typography.primaryFont}`;
      ctx.fillStyle = watermark.color;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(watermark.text, watermark.position.x, watermark.position.y);
    }
  }

  /**
   * Generate thumbnail using template
   */
  async generateFromTemplate(templateName, data, variant = 'standard') {
    if (!this.config) {
      await this.loadConfig();
    }
    
    const template = this.config.templates[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    const { width, height } = this.config.dimensions;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Determine domain and get color configuration
    const domain = this.determineDomain(data);
    const colorConfig = await this.getDomainColorConfig(domain);
    
    // Create background
    this.createBackground(ctx, colorConfig, variant);
    
    // Render template elements
    for (const [elementName, elementConfig] of Object.entries(template.elements)) {
      let text = '';
      
      // Determine text content based on element type
      switch (elementName) {
      case 'dayNumber':
        text = data.dayNumber ? `Day ${data.dayNumber}` : '';
        break;
      case 'mainTitle':
        text = this.extractCleanTitle(data.title || '');
        break;
      case 'weekIndicator':
        text = data.week ? `Week ${data.week}` : '';
        break;
      case 'practiceLabel':
        text = 'PRACTICE';
        break;
      case 'reviewTitle':
        text = data.week ? `Week ${data.week} Review` : 'Review';
        break;
      case 'topicsCovered':
        text = this.extractCleanTitle(data.title || '');
        break;
      case 'progressIndicator':
        const progress = data.week ? Math.round((data.week / 13) * 100) : 0;
        text = `${progress}% Complete`;
        break;
      case 'subtitle':
        text = data.subtitle || 'Your Complete PMP Certification Guide';
        break;
      case 'callToAction':
        text = elementConfig.text || 'Subscribe for Your 13-Week Journey';
        break;
      default:
        text = data[elementName] || '';
      }
      
      if (text) {
        this.renderTextElement(ctx, elementConfig, text, data);
      }
    }
    
    // Add branding elements
    this.addBrandingElements(ctx, variant);
    
    return canvas;
  }

  /**
   * Determine domain from video data
   */
  determineDomain(data) {
    if (data.type === 'practice' || data.type === 'review' || data.type === 'weekly-review') {
      return 'practiceReview';
    }
    
    if (data.domain) {
      if (data.domain.includes('People')) {return 'people';}
      if (data.domain.includes('Process')) {return 'process';}
      if (data.domain.includes('Business')) {return 'businessEnvironment';}
    }
    
    if (data.workGroup) {
      if (data.workGroup.includes('Team')) {return 'people';}
      if (data.workGroup.includes('Process')) {return 'process';}
      if (data.workGroup.includes('Business')) {return 'businessEnvironment';}
    }
    
    if (data.color) {
      switch (data.color) {
      case 'green': return 'people';
      case 'blue': return 'process';
      case 'orange': return 'businessEnvironment';
      case 'purple': return 'practiceReview';
      }
    }
    
    return 'process'; // Default fallback
  }

  /**
   * Extract clean title from video title
   */
  extractCleanTitle(title) {
    return title
      .replace(/^Day \d+:\s*/, '')
      .replace(/^Week \d+:\s*/, '')
      .replace(/\s*\|\s*.*$/, '')
      .trim();
  }

  /**
   * Generate filename from data
   */
  async generateFilename(data, variant = 'standard') {
    await this.loadConfig();
    
    const pattern = this.config.outputSettings.filenamePattern;
    const week = data.week ? data.week.toString().padStart(2, '0') : '00';
    const day = data.dayNumber ? 
      data.dayNumber.toString().padStart(2, '0') : 
      (data.day?.toLowerCase().substring(0, 3) || 'xxx');
    const type = data.type || 'video';
    
    return pattern
      .replace('{week}', week)
      .replace('{day}', day)
      .replace('{type}', type)
      .replace('{variant}', variant) + '.png';
  }

  /**
   * Save canvas to file
   */
  async saveCanvas(canvas, filename) {
    await this.loadConfig();
    
    const outputDir = path.join(process.cwd(), this.config.outputSettings.directory);
    await fs.ensureDir(outputDir);
    
    const filepath = path.join(outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filepath, buffer);
    
    return filepath;
  }

  /**
   * Generate A/B testing variants
   */
  async generateVariants(templateName, data) {
    await this.loadConfig();
    
    const variants = this.config.abTestingConfig.defaultVariants;
    const results = [];
    
    for (const variant of variants) {
      const canvas = await this.generateFromTemplate(templateName, data, variant);
      const filename = await this.generateFilename(data, variant);
      const filepath = await this.saveCanvas(canvas, filename);
      
      results.push({
        variant,
        filename,
        filepath,
        template: templateName
      });
    }
    
    return results;
  }
}

module.exports = ThumbnailTemplateEngine;