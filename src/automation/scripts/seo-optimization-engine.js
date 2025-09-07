const fs = require('fs-extra');
const path = require('path');
const SEOTitleGenerator = require('./seo-title-generator');
const ABTestingFramework = require('./ab-testing-framework');
const SEOMonitoringSystem = require('./seo-monitoring-system');

class SEOOptimizationEngine {
  constructor() {
    this.titleGenerator = new SEOTitleGenerator();
    this.abTesting = new ABTestingFramework();
    this.monitoring = new SEOMonitoringSystem();
    this.optimizationRules = {
      title: {
        maxLength: 60,
        minLength: 30,
        keywordPlacement: 'beginning',
        powerWords: ['Master', 'Complete', 'Ultimate', 'Essential', 'Proven'],
        yearInclude: true
      },
      description: {
        maxLength: 160,
        minLength: 120,
        keywordDensity: { min: 0.02, max: 0.05 },
        callToActionRequired: true
      },
      thumbnail: {
        textReadability: 'high',
        colorContrast: 'high',
        brandingConsistent: true
      }
    };
  }

  async initialize() {
    await Promise.all([
      this.titleGenerator.loadKeywordDatabase(),
      this.abTesting.initializeFramework(),
      this.monitoring.initialize()
    ]);
    console.log('SEO Optimization Engine initialized successfully');
  }

  async optimizeVideoContent(videoData) {
    try {
      const optimizations = {
        title: await this.optimizeTitle(videoData),
        description: await this.optimizeDescription(videoData),
        tags: await this.optimizeTags(videoData),
        thumbnail: await this.optimizeThumbnail(videoData)
      };

      // Create A/B test for optimizations
      const abTest = await this.createOptimizationTest(videoData, optimizations);

      return {
        original: videoData,
        optimized: optimizations,
        abTest: abTest,
        recommendations: this.generateOptimizationRecommendations(videoData, optimizations)
      };
    } catch (error) {
      console.error('Error optimizing video content:', error);
      throw error;
    }
  }

  async optimizeTitle(videoData) {
    const { week, day, topic, contentType, domain } = videoData;
    
    // Generate multiple title variations
    const variations = this.titleGenerator.generateTitleVariations(
      contentType || 'daily',
      {
        week: week,
        day: day,
        topic: topic,
        domain: domain,
        duration: videoData.duration || '15'
      },
      5
    );

    // Apply optimization rules
    const optimizedVariations = variations.map(variation => {
      let optimizedTitle = variation.title;

      // Ensure optimal length
      if (optimizedTitle.length > this.optimizationRules.title.maxLength) {
        optimizedTitle = this.titleGenerator.truncateTitle(optimizedTitle, this.optimizationRules.title.maxLength);
      }

      // Add power words if missing
      if (!this.containsPowerWords(optimizedTitle)) {
        const powerWord = this.selectPowerWord(topic);
        optimizedTitle = `${powerWord} ${optimizedTitle}`;
      }

      // Ensure year is included
      if (this.optimizationRules.title.yearInclude && !optimizedTitle.includes('2024')) {
        optimizedTitle = optimizedTitle.replace('PMP', 'PMP 2024');
      }

      return {
        ...variation,
        title: optimizedTitle,
        optimizationScore: this.calculateTitleScore(optimizedTitle, topic)
      };
    });

    return optimizedVariations.sort((a, b) => b.optimizationScore - a.optimizationScore);
  }

  async optimizeDescription(videoData) {
    const { topic, week, day, ecoTasks, domain } = videoData;
    
    const baseDescription = this.generateBaseDescription(videoData);
    const optimizedDescription = await this.enhanceDescription(baseDescription, videoData);

    return {
      original: videoData.description || '',
      optimized: optimizedDescription,
      keywordDensity: this.calculateKeywordDensity(optimizedDescription),
      readabilityScore: this.calculateReadabilityScore(optimizedDescription),
      seoScore: this.calculateDescriptionSEOScore(optimizedDescription)
    };
  }

  generateBaseDescription(videoData) {
    const { topic, week, day, ecoTasks, domain } = videoData;
    
    let description = `🎯 Day ${day} of Week ${week}: Master ${topic} for PMP Success!\n\n`;
    
    description += `In this comprehensive PMP exam prep video, you'll learn everything you need to know about ${topic}. `;
    description += `This lesson is part of our structured 13-week PMP study plan designed to help you pass the PMP exam on your first try.\n\n`;
    
    description += `📚 What You'll Learn:\n`;
    description += `• Core ${topic} concepts for the PMP exam\n`;
    description += `• Real-world application scenarios\n`;
    description += `• Practice questions and explanations\n`;
    description += `• ECO task alignment and exam tips\n\n`;
    
    if (ecoTasks && ecoTasks.length > 0) {
      description += `🎯 ECO Tasks Covered:\n`;
      ecoTasks.forEach(task => {
        description += `• ${task}\n`;
      });
      description += `\n`;
    }
    
    description += `⏰ Timestamps:\n`;
    description += `0:00 - Introduction and Learning Objectives\n`;
    description += `1:00 - ECO Connection and Context\n`;
    description += `2:00 - Main Content: ${topic}\n`;
    description += `12:00 - Practice Application\n`;
    description += `15:00 - Key Takeaways\n`;
    description += `17:00 - Next Video Preview\n\n`;
    
    description += `📖 FREE Resources:\n`;
    description += `• 13-Week PMP Study Calendar: [link]\n`;
    description += `• PMP Mindset Cheat Sheet: [link]\n`;
    description += `• ECO Task Checklist: [link]\n\n`;
    
    description += `🔔 Subscribe for daily PMP exam prep content!\n`;
    description += `💬 Questions? Drop them in the comments below!\n\n`;
    
    description += `#PMPExamPrep #PMPCertification #ProjectManagement #PMP2024 #StudyGuide`;
    
    return description;
  }

  async enhanceDescription(baseDescription, videoData) {
    let enhanced = baseDescription;
    
    // Add trending keywords
    const trendingTopics = await this.monitoring.identifyTrendingTopics();
    const relevantTrends = trendingTopics.filter(trend => 
      trend.topic.toLowerCase().includes(videoData.topic.toLowerCase()) ||
      trend.topic.toLowerCase().includes(videoData.domain.toLowerCase())
    );
    
    if (relevantTrends.length > 0) {
      enhanced += `\n🔥 Trending: ${relevantTrends[0].topic}`;
    }
    
    // Optimize keyword density
    enhanced = this.adjustKeywordDensity(enhanced, videoData.topic);
    
    // Ensure call-to-action
    if (!enhanced.includes('Subscribe') && !enhanced.includes('Like')) {
      enhanced += `\n\n👍 Like this video if it helped you understand ${videoData.topic}!`;
    }
    
    return enhanced;
  }

  async optimizeTags(videoData) {
    const { topic, week, day, domain, ecoTasks } = videoData;
    
    const baseTags = [
      'PMP exam prep',
      'PMP certification',
      'project management',
      'PMP 2024',
      'PMP study guide'
    ];
    
    const topicTags = [
      topic.toLowerCase(),
      `${topic} PMP`,
      `PMP ${topic}`,
      `${topic} project management`
    ];
    
    const domainTags = [
      `${domain.toLowerCase()} domain`,
      `PMP ${domain.toLowerCase()}`,
      `project ${domain.toLowerCase()}`
    ];
    
    const weeklyTags = [
      `week ${week}`,
      `day ${day}`,
      `PMP week ${week}`,
      `13 week study plan`
    ];
    
    const ecoTags = ecoTasks ? ecoTasks.map(task => 
      task.toLowerCase().replace(/[^\w\s]/g, '').trim()
    ) : [];
    
    const allTags = [...baseTags, ...topicTags, ...domainTags, ...weeklyTags, ...ecoTags];
    
    // Remove duplicates and limit to 15 tags (YouTube limit is 500 characters)
    const uniqueTags = [...new Set(allTags)];
    const optimizedTags = uniqueTags.slice(0, 15);
    
    return {
      tags: optimizedTags,
      totalCharacters: optimizedTags.join(', ').length,
      categories: {
        base: baseTags,
        topic: topicTags,
        domain: domainTags,
        weekly: weeklyTags,
        eco: ecoTags
      }
    };
  }

  async optimizeThumbnail(videoData) {
    const { topic, week, day, domain } = videoData;
    
    const thumbnailVariations = [
      {
        style: 'high_contrast',
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        accentColor: this.getDomainColor(domain),
        text: `Day ${day}: ${topic}`,
        layout: 'centered'
      },
      {
        style: 'professional',
        backgroundColor: '#f8f9fa',
        textColor: '#2c3e50',
        accentColor: this.getDomainColor(domain),
        text: `Week ${week} | ${topic}`,
        layout: 'left_aligned'
      },
      {
        style: 'bold',
        backgroundColor: this.getDomainColor(domain),
        textColor: '#ffffff',
        accentColor: '#ffd700',
        text: `Master ${topic}`,
        layout: 'centered'
      }
    ];
    
    return {
      variations: thumbnailVariations,
      recommended: thumbnailVariations[0], // High contrast typically performs best
      testSuggestion: 'A/B test all three variations to determine best performer'
    };
  }

  getDomainColor(domain) {
    const domainColors = {
      'people': '#28a745', // Green
      'process': '#007bff', // Blue
      'business': '#fd7e14', // Orange
      'business environment': '#fd7e14'
    };
    
    return domainColors[domain.toLowerCase()] || '#6c757d';
  }

  async createOptimizationTest(videoData, optimizations) {
    const testId = `optimization_${videoData.id || Date.now()}`;
    
    // Create title test
    const titleVariants = optimizations.title.slice(0, 3).map(variation => ({
      title: variation.title,
      description: `Optimized title with score: ${variation.optimizationScore}`,
      keywords: [videoData.topic, 'PMP exam prep'],
      expectedCTR: variation.estimatedCTR
    }));
    
    const titleTest = this.abTesting.createTitleTest(
      `${testId}_title`,
      titleVariants,
      {
        duration: 7,
        minSampleSize: 100,
        primaryMetric: 'ctr'
      }
    );
    
    // Create thumbnail test
    const thumbnailVariants = optimizations.thumbnail.variations.map(variation => ({
      thumbnailUrl: `generated_${variation.style}.png`,
      style: variation.style,
      colorScheme: variation.backgroundColor,
      textOverlay: variation.text,
      expectedCTR: 0.05 // Base expectation
    }));
    
    const thumbnailTest = this.abTesting.createThumbnailTest(
      `${testId}_thumbnail`,
      thumbnailVariants,
      {
        duration: 14,
        minSampleSize: 200,
        primaryMetric: 'ctr'
      }
    );
    
    return {
      titleTest: titleTest,
      thumbnailTest: thumbnailTest,
      testId: testId
    };
  }

  containsPowerWords(title) {
    return this.optimizationRules.title.powerWords.some(word => 
      title.toLowerCase().includes(word.toLowerCase())
    );
  }

  selectPowerWord(topic) {
    const powerWords = this.optimizationRules.title.powerWords;
    
    // Select power word based on topic
    if (topic.toLowerCase().includes('practice')) return 'Master';
    if (topic.toLowerCase().includes('review')) return 'Complete';
    if (topic.toLowerCase().includes('exam')) return 'Ultimate';
    
    return powerWords[Math.floor(Math.random() * powerWords.length)];
  }

  calculateTitleScore(title, topic) {
    let score = 0;
    
    // Length optimization (50-60 characters is optimal)
    const length = title.length;
    if (length >= 50 && length <= 60) score += 20;
    else if (length >= 40 && length <= 70) score += 15;
    else score += 5;
    
    // Keyword placement (earlier is better)
    const topicIndex = title.toLowerCase().indexOf(topic.toLowerCase());
    if (topicIndex >= 0 && topicIndex < 20) score += 15;
    else if (topicIndex >= 0) score += 10;
    
    // Power words
    if (this.containsPowerWords(title)) score += 10;
    
    // Numbers (perform well)
    if (/\d+/.test(title)) score += 10;
    
    // Year inclusion
    if (title.includes('2024')) score += 10;
    
    // Primary keyword inclusion
    if (title.toLowerCase().includes('pmp')) score += 15;
    
    // Avoid keyword stuffing
    const keywordCount = (title.toLowerCase().match(/pmp/g) || []).length;
    if (keywordCount > 2) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  calculateKeywordDensity(text) {
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    const keywords = ['pmp', 'exam', 'prep', 'certification', 'project', 'management'];
    let keywordCount = 0;
    
    keywords.forEach(keyword => {
      keywordCount += (text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    });
    
    return keywordCount / totalWords;
  }

  calculateReadabilityScore(text) {
    // Simplified readability calculation
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Flesch Reading Ease approximation
    let score = 206.835 - (1.015 * avgWordsPerSentence);
    
    return Math.max(0, Math.min(100, score));
  }

  calculateDescriptionSEOScore(description) {
    let score = 0;
    
    // Length check
    const length = description.length;
    if (length >= 120 && length <= 160) score += 25;
    else if (length >= 100 && length <= 200) score += 20;
    else score += 10;
    
    // Keyword density
    const density = this.calculateKeywordDensity(description);
    if (density >= 0.02 && density <= 0.05) score += 25;
    else if (density >= 0.01 && density <= 0.07) score += 15;
    else score += 5;
    
    // Call-to-action presence
    if (description.toLowerCase().includes('subscribe') || 
        description.toLowerCase().includes('like') ||
        description.toLowerCase().includes('comment')) {
      score += 20;
    }
    
    // Timestamps presence
    if (description.includes('0:00') || description.includes('Timestamps')) {
      score += 15;
    }
    
    // Hashtags presence
    if (description.includes('#')) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  adjustKeywordDensity(text, primaryKeyword) {
    const currentDensity = this.calculateKeywordDensity(text);
    const targetDensity = 0.03; // 3%
    
    if (currentDensity < targetDensity) {
      // Add more keyword variations
      const variations = [
        `${primaryKeyword} concepts`,
        `${primaryKeyword} strategies`,
        `${primaryKeyword} techniques`
      ];
      
      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      text += ` Learn more about ${randomVariation} in our comprehensive guide.`;
    }
    
    return text;
  }

  generateOptimizationRecommendations(original, optimized) {
    const recommendations = [];
    
    // Title recommendations
    if (optimized.title.length > 0) {
      const bestTitle = optimized.title[0];
      recommendations.push({
        category: 'title',
        priority: 'high',
        current: original.title || 'No title',
        recommended: bestTitle.title,
        reason: `Optimization score: ${bestTitle.optimizationScore}/100`,
        impact: 'CTR improvement expected'
      });
    }
    
    // Description recommendations
    if (optimized.description.seoScore > 70) {
      recommendations.push({
        category: 'description',
        priority: 'medium',
        action: 'Use optimized description',
        reason: `SEO score: ${optimized.description.seoScore}/100`,
        impact: 'Better search visibility'
      });
    }
    
    // Tags recommendations
    recommendations.push({
      category: 'tags',
      priority: 'medium',
      action: `Use ${optimized.tags.tags.length} optimized tags`,
      reason: 'Balanced keyword coverage across domains',
      impact: 'Improved discoverability'
    });
    
    // Thumbnail recommendations
    recommendations.push({
      category: 'thumbnail',
      priority: 'high',
      action: `Test ${optimized.thumbnail.variations.length} thumbnail variations`,
      reason: 'A/B testing will identify best performer',
      impact: 'CTR optimization'
    });
    
    return recommendations;
  }

  async generateBatchOptimizations(videoList) {
    const results = [];
    
    for (const video of videoList) {
      try {
        const optimization = await this.optimizeVideoContent(video);
        results.push({
          videoId: video.id,
          status: 'success',
          optimization: optimization
        });
        
        // Add delay to avoid overwhelming the system
        await this.delay(500);
      } catch (error) {
        results.push({
          videoId: video.id,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }

  async saveOptimizationResults(results, filename) {
    try {
      const optimizationDir = path.join(__dirname, '../../generated/optimizations');
      await fs.ensureDir(optimizationDir);
      
      const filepath = path.join(optimizationDir, filename);
      await fs.writeJson(filepath, results, { spaces: 2 });
      
      console.log(`Optimization results saved to ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error saving optimization results:', error);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SEOOptimizationEngine;