const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class SEOMonitoringSystem {
  constructor() {
    this.keywordDatabase = null;
    this.rankingHistory = new Map();
    this.competitorData = new Map();
    this.wordpressPages = new Map();
    this.wordpressSEOData = new Map();
    this.alertThresholds = {
      rankingDrop: 5, // Alert if ranking drops by 5+ positions
      ctrDrop: 0.01, // Alert if CTR drops by 1%
      impressionsDrop: 0.2, // Alert if impressions drop by 20%
      wordpressPageSpeedDrop: 10, // Alert if page speed drops by 10 points
      wordpressSEOScoreDrop: 5 // Alert if SEO score drops by 5 points
    };
    this.monitoringConfig = {
      checkInterval: 24 * 60 * 60 * 1000, // 24 hours
      maxHistoryDays: 90,
      competitorCheckInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      wordpressSEOCheckInterval: 12 * 60 * 60 * 1000 // 12 hours for WordPress
    };
    this.wordpressContentTypes = ['course-page', 'blog-post', 'landing-page', 'lead-magnet', 'pricing-page'];
  }

  async initialize() {
    try {
      // Load keyword database
      const keywordPath = path.join(__dirname, '../../config/seo-keyword-database.json');
      this.keywordDatabase = await fs.readJson(keywordPath);

      // Load existing ranking history
      await this.loadRankingHistory();
      
      // Load competitor data
      await this.loadCompetitorData();

      // Initialize WordPress pages and SEO data
      await this.initializeWordPressPages();
      await this.loadWordPressSEOData();

      console.log('SEO Monitoring System initialized successfully');
    } catch (error) {
      console.error('Error initializing SEO Monitoring System:', error);
      throw error;
    }
  }

  async trackKeywordRankings(keywords = null) {
    const keywordsToTrack = keywords || this.getAllKeywords();
    const results = [];

    for (const keyword of keywordsToTrack) {
      try {
        // Check YouTube rankings
        const youtubeRanking = await this.checkKeywordRanking(keyword, 'youtube');
        results.push(youtubeRanking);
        
        // Check WordPress rankings
        const wordpressRanking = await this.checkWordPressKeywordRanking(keyword);
        results.push(wordpressRanking);
        
        // Store in history
        this.updateRankingHistory(keyword, youtubeRanking);
        this.updateWordPressRankingHistory(keyword, wordpressRanking);
        
        // Check for alerts
        await this.checkRankingAlerts(keyword, youtubeRanking);
        await this.checkWordPressRankingAlerts(keyword, wordpressRanking);
        
        // Add delay to avoid rate limiting
        await this.delay(1000);
      } catch (error) {
        console.error(`Error tracking keyword "${keyword}":`, error);
        results.push({
          keyword,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    await this.saveRankingHistory();
    await this.saveWordPressSEOData();
    return results;
  }

  async checkKeywordRanking(keyword, platform = 'youtube') {
    // This is a simplified implementation
    // In production, you would use actual SEO APIs like SEMrush, Ahrefs, or Google Search Console
    
    try {
      // Simulate API call to check ranking
      const baseUrl = platform === 'youtube' 
        ? `https://youtube.com/channel/${process.env.YOUTUBE_CHANNEL_ID}`
        : `https://pmp-course.com`;
        
      const mockRanking = {
        keyword: keyword,
        platform: platform,
        position: Math.floor(Math.random() * 50) + 1, // Random position 1-50
        url: baseUrl,
        searchVolume: this.getKeywordSearchVolume(keyword),
        competition: this.getKeywordCompetition(keyword),
        ctr: this.estimateCTRByPosition(Math.floor(Math.random() * 50) + 1),
        impressions: Math.floor(Math.random() * 10000) + 100,
        clicks: Math.floor(Math.random() * 500) + 10,
        timestamp: new Date().toISOString()
      };

      return mockRanking;
    } catch (error) {
      console.error(`Error checking ranking for "${keyword}" on ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Check WordPress-specific keyword rankings
   */
  async checkWordPressKeywordRanking(keyword) {
    try {
      // Get the best-ranking WordPress page for this keyword
      const bestPage = await this.getBestWordPressPageForKeyword(keyword);
      
      const wordpressRanking = {
        keyword: keyword,
        platform: 'wordpress',
        position: Math.floor(Math.random() * 30) + 1, // WordPress pages often rank better
        url: bestPage.url,
        page_title: bestPage.title,
        page_type: bestPage.type,
        searchVolume: this.getKeywordSearchVolume(keyword),
        competition: this.getKeywordCompetition(keyword),
        ctr: this.estimateCTRByPosition(Math.floor(Math.random() * 30) + 1),
        impressions: Math.floor(Math.random() * 8000) + 200,
        clicks: Math.floor(Math.random() * 400) + 15,
        page_speed_score: Math.floor(Math.random() * 20) + 80, // 80-100
        seo_score: Math.floor(Math.random() * 15) + 85, // 85-100
        timestamp: new Date().toISOString()
      };

      return wordpressRanking;
    } catch (error) {
      console.error(`Error checking WordPress ranking for "${keyword}":`, error);
      throw error;
    }
  }

  getKeywordSearchVolume(keyword) {
    // Get search volume from keyword database
    const keywordMetrics = this.keywordDatabase.keywordMetrics;
    
    for (const [category, keywords] of Object.entries(keywordMetrics)) {
      if (keywords[keyword]) {
        return keywords[keyword].searchVolume;
      }
    }
    
    return 'unknown';
  }

  getKeywordCompetition(keyword) {
    // Get competition level from keyword database
    const keywordMetrics = this.keywordDatabase.keywordMetrics;
    
    for (const [category, keywords] of Object.entries(keywordMetrics)) {
      if (keywords[keyword]) {
        return keywords[keyword].competition;
      }
    }
    
    return 'unknown';
  }

  estimateCTRByPosition(position) {
    // Industry standard CTR by position
    const ctrByPosition = {
      1: 0.284, 2: 0.157, 3: 0.106, 4: 0.073, 5: 0.053,
      6: 0.040, 7: 0.031, 8: 0.025, 9: 0.020, 10: 0.016
    };
    
    return ctrByPosition[position] || 0.01; // 1% for positions beyond 10
  }

  updateRankingHistory(keyword, ranking) {
    if (!this.rankingHistory.has(keyword)) {
      this.rankingHistory.set(keyword, []);
    }
    
    const history = this.rankingHistory.get(keyword);
    history.push(ranking);
    
    // Keep only last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.monitoringConfig.maxHistoryDays);
    
    const filteredHistory = history.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );
    
    this.rankingHistory.set(keyword, filteredHistory);
  }

  async checkRankingAlerts(keyword, currentRanking) {
    const history = this.rankingHistory.get(keyword);
    if (!history || history.length < 2) return;

    const previousRanking = history[history.length - 2];
    const alerts = [];

    // Check for ranking drop
    if (currentRanking.position > previousRanking.position + this.alertThresholds.rankingDrop) {
      alerts.push({
        type: 'ranking_drop',
        severity: 'high',
        keyword: keyword,
        message: `Ranking dropped from position ${previousRanking.position} to ${currentRanking.position}`,
        previousPosition: previousRanking.position,
        currentPosition: currentRanking.position,
        drop: currentRanking.position - previousRanking.position
      });
    }

    // Check for CTR drop
    if (currentRanking.ctr < previousRanking.ctr - this.alertThresholds.ctrDrop) {
      alerts.push({
        type: 'ctr_drop',
        severity: 'medium',
        keyword: keyword,
        message: `CTR dropped from ${(previousRanking.ctr * 100).toFixed(2)}% to ${(currentRanking.ctr * 100).toFixed(2)}%`,
        previousCTR: previousRanking.ctr,
        currentCTR: currentRanking.ctr
      });
    }

    // Check for impressions drop
    if (currentRanking.impressions < previousRanking.impressions * (1 - this.alertThresholds.impressionsDrop)) {
      alerts.push({
        type: 'impressions_drop',
        severity: 'medium',
        keyword: keyword,
        message: `Impressions dropped from ${previousRanking.impressions} to ${currentRanking.impressions}`,
        previousImpressions: previousRanking.impressions,
        currentImpressions: currentRanking.impressions,
        dropPercentage: ((previousRanking.impressions - currentRanking.impressions) / previousRanking.impressions * 100).toFixed(1)
      });
    }

    if (alerts.length > 0) {
      await this.saveAlerts(alerts);
    }
  }

  async monitorClickThroughRates() {
    const keywords = this.getAllKeywords();
    const ctrData = [];

    for (const keyword of keywords) {
      const history = this.rankingHistory.get(keyword);
      if (!history || history.length === 0) continue;

      const recent = history.slice(-7); // Last 7 entries
      const averageCTR = recent.reduce((sum, entry) => sum + entry.ctr, 0) / recent.length;
      const trend = this.calculateCTRTrend(recent);

      ctrData.push({
        keyword,
        averageCTR,
        trend,
        currentPosition: recent[recent.length - 1].position,
        recommendations: this.generateCTRRecommendations(keyword, averageCTR, trend)
      });
    }

    return ctrData.sort((a, b) => b.averageCTR - a.averageCTR);
  }

  calculateCTRTrend(history) {
    if (history.length < 2) return 'stable';

    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));

    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.ctr, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.ctr, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  generateCTRRecommendations(keyword, averageCTR, trend) {
    const recommendations = [];

    if (averageCTR < 0.03) {
      recommendations.push({
        priority: 'high',
        action: 'Optimize titles and thumbnails',
        reason: 'CTR below 3% threshold'
      });
    }

    if (trend === 'declining') {
      recommendations.push({
        priority: 'medium',
        action: 'A/B test new title variations',
        reason: 'CTR trend is declining'
      });
    }

    if (keyword.includes('PMP exam prep') && averageCTR < 0.05) {
      recommendations.push({
        priority: 'high',
        action: 'Focus on primary keyword optimization',
        reason: 'Main keyword underperforming'
      });
    }

    return recommendations;
  }

  async analyzeCompetitors() {
    const competitors = [
      'PMP Exam Prep Channel 1',
      'Project Management Institute',
      'PMP Training Provider'
    ];

    const competitorAnalysis = [];

    for (const competitor of competitors) {
      try {
        const analysis = await this.analyzeCompetitor(competitor);
        competitorAnalysis.push(analysis);
        this.competitorData.set(competitor, analysis);
      } catch (error) {
        console.error(`Error analyzing competitor ${competitor}:`, error);
      }
    }

    await this.saveCompetitorData();
    return competitorAnalysis;
  }

  async analyzeCompetitor(competitorName) {
    // This would integrate with actual competitor analysis APIs
    // For now, we'll simulate the data structure
    
    return {
      name: competitorName,
      analyzedAt: new Date().toISOString(),
      metrics: {
        estimatedViews: Math.floor(Math.random() * 100000) + 10000,
        estimatedSubscribers: Math.floor(Math.random() * 50000) + 5000,
        videoCount: Math.floor(Math.random() * 200) + 50,
        averageViewDuration: Math.floor(Math.random() * 600) + 300
      },
      topKeywords: this.generateCompetitorKeywords(),
      contentStrategy: {
        uploadFrequency: 'daily',
        averageVideoLength: '15-20 minutes',
        primaryTopics: ['PMP exam prep', 'project management', 'certification']
      },
      strengths: this.identifyCompetitorStrengths(),
      opportunities: this.identifyCompetitorOpportunities()
    };
  }

  generateCompetitorKeywords() {
    const keywords = this.getAllKeywords();
    return keywords.slice(0, 10).map(keyword => ({
      keyword,
      estimatedPosition: Math.floor(Math.random() * 20) + 1,
      estimatedTraffic: Math.floor(Math.random() * 5000) + 100
    }));
  }

  identifyCompetitorStrengths() {
    const possibleStrengths = [
      'High subscriber count',
      'Consistent upload schedule',
      'Strong engagement rates',
      'Professional production quality',
      'Comprehensive content coverage',
      'Active community management'
    ];

    return possibleStrengths.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  identifyCompetitorOpportunities() {
    const possibleOpportunities = [
      'Limited ECO-focused content',
      'Infrequent uploads',
      'Low engagement in comments',
      'Outdated content structure',
      'Limited community interaction',
      'Poor thumbnail optimization'
    ];

    return possibleOpportunities.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  async identifyTrendingTopics() {
    // This would integrate with Google Trends API or similar
    const trendingTopics = [
      {
        topic: 'PMP exam changes 2024',
        searchVolume: 'rising',
        competition: 'medium',
        opportunity: 'high',
        suggestedContent: 'Create video about latest PMP exam updates'
      },
      {
        topic: 'remote project management',
        searchVolume: 'high',
        competition: 'high',
        opportunity: 'medium',
        suggestedContent: 'Focus on virtual team management content'
      },
      {
        topic: 'agile project management PMP',
        searchVolume: 'stable',
        competition: 'medium',
        opportunity: 'high',
        suggestedContent: 'Create agile-focused PMP content series'
      }
    ];

    return trendingTopics;
  }

  async generateSEOReport() {
    try {
      const [
        keywordRankings,
        ctrAnalysis,
        competitorAnalysis,
        trendingTopics,
        wordpressTechnicalSEO
      ] = await Promise.all([
        this.trackKeywordRankings(),
        this.monitorClickThroughRates(),
        this.analyzeCompetitors(),
        this.identifyTrendingTopics(),
        this.monitorWordPressTechnicalSEO()
      ]);

      // Separate YouTube and WordPress rankings
      const youtubeRankings = keywordRankings.filter(r => r.platform === 'youtube' || !r.platform);
      const wordpressRankings = keywordRankings.filter(r => r.platform === 'wordpress');

      const report = {
        generated: new Date().toISOString(),
        summary: {
          totalKeywordsTracked: keywordRankings.length,
          youtubeKeywords: youtubeRankings.length,
          wordpressKeywords: wordpressRankings.length,
          averageYouTubePosition: this.calculateAveragePosition(youtubeRankings),
          averageWordPressPosition: this.calculateAveragePosition(wordpressRankings),
          averageCTR: this.calculateAverageCTR(ctrAnalysis),
          competitorsAnalyzed: competitorAnalysis.length,
          wordpressPagesMonitored: this.wordpressPages.size
        },
        keywordPerformance: {
          youtube: {
            topPerforming: youtubeRankings.filter(k => k.position <= 10).slice(0, 5),
            needsImprovement: youtubeRankings.filter(k => k.position > 20).slice(0, 5),
            rankings: youtubeRankings
          },
          wordpress: {
            topPerforming: wordpressRankings.filter(k => k.position <= 10).slice(0, 5),
            needsImprovement: wordpressRankings.filter(k => k.position > 20).slice(0, 5),
            rankings: wordpressRankings
          }
        },
        wordpressTechnicalSEO: {
          overview: this.summarizeWordPressSEO(wordpressTechnicalSEO),
          pageAnalysis: wordpressTechnicalSEO,
          criticalIssues: this.identifyCriticalSEOIssues(wordpressTechnicalSEO),
          recommendations: this.generateWordPressSEORecommendations(wordpressTechnicalSEO)
        },
        ctrAnalysis: ctrAnalysis,
        competitorInsights: competitorAnalysis,
        trendingOpportunities: trendingTopics,
        crossPlatformAnalysis: this.analyzeCrossPlatformSEO(youtubeRankings, wordpressRankings),
        recommendations: this.generateSEORecommendations(keywordRankings, ctrAnalysis, competitorAnalysis, wordpressTechnicalSEO),
        alerts: await this.getRecentAlerts()
      };

      return report;
    } catch (error) {
      console.error('Error generating SEO report:', error);
      throw error;
    }
  }

  calculateAveragePosition(rankings) {
    const validRankings = rankings.filter(r => !r.error && r.position);
    if (validRankings.length === 0) return 0;
    
    return validRankings.reduce((sum, r) => sum + r.position, 0) / validRankings.length;
  }

  calculateAverageCTR(ctrAnalysis) {
    if (ctrAnalysis.length === 0) return 0;
    
    return ctrAnalysis.reduce((sum, c) => sum + c.averageCTR, 0) / ctrAnalysis.length;
  }

  generateSEORecommendations(rankings, ctrAnalysis, competitorAnalysis, wordpressTechnicalSEO = []) {
    const recommendations = [];

    // Separate platform-specific rankings
    const youtubeRankings = rankings.filter(r => r.platform === 'youtube' || !r.platform);
    const wordpressRankings = rankings.filter(r => r.platform === 'wordpress');

    // YouTube ranking-based recommendations
    const poorYouTubeRankings = youtubeRankings.filter(r => !r.error && r.position > 30);
    if (poorYouTubeRankings.length > 0) {
      recommendations.push({
        category: 'youtube_rankings',
        priority: 'high',
        platform: 'youtube',
        action: 'Focus on improving YouTube rankings for underperforming keywords',
        keywords: poorYouTubeRankings.slice(0, 5).map(r => r.keyword),
        impact: 'high'
      });
    }

    // WordPress ranking-based recommendations
    const poorWordPressRankings = wordpressRankings.filter(r => !r.error && r.position > 30);
    if (poorWordPressRankings.length > 0) {
      recommendations.push({
        category: 'wordpress_rankings',
        priority: 'high',
        platform: 'wordpress',
        action: 'Optimize WordPress pages for underperforming keywords',
        keywords: poorWordPressRankings.slice(0, 5).map(r => r.keyword),
        impact: 'high'
      });
    }

    // CTR-based recommendations
    const lowCTRKeywords = ctrAnalysis.filter(c => c.averageCTR < 0.03);
    if (lowCTRKeywords.length > 0) {
      recommendations.push({
        category: 'ctr',
        priority: 'high',
        action: 'Optimize titles and thumbnails for low CTR keywords',
        keywords: lowCTRKeywords.slice(0, 3).map(c => c.keyword),
        impact: 'medium'
      });
    }

    // WordPress technical SEO recommendations
    const lowSEOScorePages = wordpressTechnicalSEO.filter(p => p.seo_score < 80);
    if (lowSEOScorePages.length > 0) {
      recommendations.push({
        category: 'wordpress_technical_seo',
        priority: 'high',
        platform: 'wordpress',
        action: 'Improve technical SEO for underperforming WordPress pages',
        pages: lowSEOScorePages.slice(0, 3).map(p => ({ url: p.url, score: p.seo_score })),
        impact: 'high'
      });
    }

    const slowPages = wordpressTechnicalSEO.filter(p => p.page_speed_score < 75);
    if (slowPages.length > 0) {
      recommendations.push({
        category: 'wordpress_page_speed',
        priority: 'high',
        platform: 'wordpress',
        action: 'Improve page speed for slow-loading WordPress pages',
        pages: slowPages.slice(0, 3).map(p => ({ url: p.url, score: p.page_speed_score })),
        impact: 'high'
      });
    }

    // Cross-platform recommendations
    if (youtubeRankings.length > 0 && wordpressRankings.length > 0) {
      const avgYouTubePosition = this.calculateAveragePosition(youtubeRankings);
      const avgWordPressPosition = this.calculateAveragePosition(wordpressRankings);
      
      if (Math.abs(avgYouTubePosition - avgWordPressPosition) > 10) {
        recommendations.push({
          category: 'cross_platform_optimization',
          priority: 'medium',
          action: 'Balance SEO efforts between YouTube and WordPress platforms',
          details: `YouTube avg position: ${avgYouTubePosition.toFixed(1)}, WordPress avg position: ${avgWordPressPosition.toFixed(1)}`,
          impact: 'medium'
        });
      }
    }

    // Competitor-based recommendations
    if (competitorAnalysis.length > 0) {
      recommendations.push({
        category: 'competition',
        priority: 'medium',
        action: 'Leverage competitor content gaps',
        details: 'Focus on ECO-specific content where competitors are weak',
        impact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Summarize WordPress SEO performance
   */
  summarizeWordPressSEO(wordpressTechnicalSEO) {
    if (wordpressTechnicalSEO.length === 0) return {};

    const validPages = wordpressTechnicalSEO.filter(p => !p.error);
    
    return {
      totalPages: validPages.length,
      averageSEOScore: validPages.reduce((sum, p) => sum + p.seo_score, 0) / validPages.length,
      averagePageSpeedScore: validPages.reduce((sum, p) => sum + p.page_speed_score, 0) / validPages.length,
      mobileOptimizedPages: validPages.filter(p => p.mobile_friendly).length,
      pagesWithSchemaMarkup: validPages.filter(p => p.schema_markup).length,
      pagesWithSEOIssues: validPages.filter(p => p.issues && p.issues.length > 0).length
    };
  }

  /**
   * Identify critical SEO issues across WordPress pages
   */
  identifyCriticalSEOIssues(wordpressTechnicalSEO) {
    const criticalIssues = [];
    
    wordpressTechnicalSEO.forEach(page => {
      if (page.error) return;
      
      if (page.seo_score < 70) {
        criticalIssues.push({
          type: 'low_seo_score',
          severity: 'high',
          url: page.url,
          message: `SEO score of ${page.seo_score} is critically low`,
          score: page.seo_score
        });
      }
      
      if (page.page_speed_score < 60) {
        criticalIssues.push({
          type: 'very_slow_page',
          severity: 'critical',
          url: page.url,
          message: `Page speed score of ${page.page_speed_score} is critically slow`,
          score: page.page_speed_score
        });
      }
      
      if (!page.mobile_friendly) {
        criticalIssues.push({
          type: 'not_mobile_friendly',
          severity: 'high',
          url: page.url,
          message: 'Page is not mobile-friendly'
        });
      }
      
      if (page.images_without_alt > 3) {
        criticalIssues.push({
          type: 'many_missing_alt_tags',
          severity: 'medium',
          url: page.url,
          message: `${page.images_without_alt} images missing alt text`,
          count: page.images_without_alt
        });
      }
    });
    
    return criticalIssues;
  }

  /**
   * Generate WordPress-specific SEO recommendations
   */
  generateWordPressSEORecommendations(wordpressTechnicalSEO) {
    const recommendations = [];
    const validPages = wordpressTechnicalSEO.filter(p => !p.error);
    
    // Page speed recommendations
    const slowPages = validPages.filter(p => p.page_speed_score < 80);
    if (slowPages.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'page_speed',
        action: 'Optimize page speed for WordPress pages',
        affected_pages: slowPages.length,
        details: 'Focus on image optimization, caching, and code minification'
      });
    }
    
    // SEO score recommendations
    const lowSEOPages = validPages.filter(p => p.seo_score < 85);
    if (lowSEOPages.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'seo_optimization',
        action: 'Improve on-page SEO for WordPress pages',
        affected_pages: lowSEOPages.length,
        details: 'Focus on meta descriptions, title tags, and header structure'
      });
    }
    
    // Schema markup recommendations
    const pagesWithoutSchema = validPages.filter(p => !p.schema_markup);
    if (pagesWithoutSchema.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'schema_markup',
        action: 'Implement schema markup on WordPress pages',
        affected_pages: pagesWithoutSchema.length,
        details: 'Add structured data for courses, articles, and organization'
      });
    }
    
    // Alt text recommendations
    const pagesWithMissingAlt = validPages.filter(p => p.images_without_alt > 0);
    if (pagesWithMissingAlt.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'accessibility',
        action: 'Add alt text to images missing descriptions',
        affected_pages: pagesWithMissingAlt.length,
        details: 'Improve accessibility and SEO by adding descriptive alt text'
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze cross-platform SEO performance
   */
  analyzeCrossPlatformSEO(youtubeRankings, wordpressRankings) {
    const analysis = {
      keyword_overlap: this.findKeywordOverlap(youtubeRankings, wordpressRankings),
      performance_comparison: this.comparePerformanceAcrossPlatforms(youtubeRankings, wordpressRankings),
      opportunities: this.identifyCrossPlatformOpportunities(youtubeRankings, wordpressRankings)
    };
    
    return analysis;
  }

  /**
   * Find keywords that both platforms are targeting
   */
  findKeywordOverlap(youtubeRankings, wordpressRankings) {
    const youtubeKeywords = new Set(youtubeRankings.map(r => r.keyword));
    const wordpressKeywords = new Set(wordpressRankings.map(r => r.keyword));
    
    const overlap = [...youtubeKeywords].filter(keyword => wordpressKeywords.has(keyword));
    
    return {
      total_overlapping_keywords: overlap.length,
      keywords: overlap,
      youtube_only: youtubeKeywords.size - overlap.length,
      wordpress_only: wordpressKeywords.size - overlap.length
    };
  }

  /**
   * Compare performance between platforms
   */
  comparePerformanceAcrossPlatforms(youtubeRankings, wordpressRankings) {
    return {
      youtube: {
        total_keywords: youtubeRankings.length,
        average_position: this.calculateAveragePosition(youtubeRankings),
        top_10_rankings: youtubeRankings.filter(r => r.position <= 10).length
      },
      wordpress: {
        total_keywords: wordpressRankings.length,
        average_position: this.calculateAveragePosition(wordpressRankings),
        top_10_rankings: wordpressRankings.filter(r => r.position <= 10).length
      }
    };
  }

  /**
   * Identify cross-platform SEO opportunities
   */
  identifyCrossPlatformOpportunities(youtubeRankings, wordpressRankings) {
    const opportunities = [];
    
    // Find keywords where YouTube ranks well but WordPress doesn't
    const youtubeStrong = youtubeRankings.filter(r => r.position <= 10);
    youtubeStrong.forEach(ytRanking => {
      const wpRanking = wordpressRankings.find(r => r.keyword === ytRanking.keyword);
      if (!wpRanking || wpRanking.position > 20) {
        opportunities.push({
          type: 'wordpress_optimization',
          keyword: ytRanking.keyword,
          youtube_position: ytRanking.position,
          wordpress_position: wpRanking?.position || 'not_ranking',
          recommendation: 'Create or optimize WordPress content for this keyword'
        });
      }
    });
    
    // Find keywords where WordPress ranks well but YouTube doesn't
    const wordpressStrong = wordpressRankings.filter(r => r.position <= 10);
    wordpressStrong.forEach(wpRanking => {
      const ytRanking = youtubeRankings.find(r => r.keyword === wpRanking.keyword);
      if (!ytRanking || ytRanking.position > 20) {
        opportunities.push({
          type: 'youtube_optimization',
          keyword: wpRanking.keyword,
          wordpress_position: wpRanking.position,
          youtube_position: ytRanking?.position || 'not_ranking',
          recommendation: 'Create YouTube content targeting this keyword'
        });
      }
    });
    
    return opportunities;
  }

  getAllKeywords() {
    const allKeywords = [];
    
    // Collect all keywords from database
    Object.values(this.keywordDatabase.primaryKeywords).forEach(keywords => {
      allKeywords.push(...keywords);
    });
    
    Object.values(this.keywordDatabase.longTailKeywords).forEach(keywords => {
      allKeywords.push(...keywords);
    });
    
    return [...new Set(allKeywords)]; // Remove duplicates
  }

  async loadRankingHistory() {
    try {
      const historyPath = path.join(__dirname, '../../config/ranking-history.json');
      if (await fs.pathExists(historyPath)) {
        const history = await fs.readJson(historyPath);
        this.rankingHistory = new Map(Object.entries(history));
      }
    } catch (error) {
      console.error('Error loading ranking history:', error);
    }
  }

  async saveRankingHistory() {
    try {
      const historyPath = path.join(__dirname, '../../config/ranking-history.json');
      const historyObject = Object.fromEntries(this.rankingHistory);
      await fs.writeJson(historyPath, historyObject, { spaces: 2 });
    } catch (error) {
      console.error('Error saving ranking history:', error);
    }
  }

  async loadCompetitorData() {
    try {
      const competitorPath = path.join(__dirname, '../../config/competitor-data.json');
      if (await fs.pathExists(competitorPath)) {
        const data = await fs.readJson(competitorPath);
        this.competitorData = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading competitor data:', error);
    }
  }

  async saveCompetitorData() {
    try {
      const competitorPath = path.join(__dirname, '../../config/competitor-data.json');
      const dataObject = Object.fromEntries(this.competitorData);
      await fs.writeJson(competitorPath, dataObject, { spaces: 2 });
    } catch (error) {
      console.error('Error saving competitor data:', error);
    }
  }

  async saveAlerts(alerts) {
    try {
      const alertsPath = path.join(__dirname, '../../generated/seo-alerts.json');
      let existingAlerts = [];
      
      if (await fs.pathExists(alertsPath)) {
        existingAlerts = await fs.readJson(alertsPath);
      }
      
      const updatedAlerts = [...existingAlerts, ...alerts.map(alert => ({
        ...alert,
        timestamp: new Date().toISOString()
      }))];
      
      await fs.writeJson(alertsPath, updatedAlerts, { spaces: 2 });
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  async getRecentAlerts(days = 7) {
    try {
      const alertsPath = path.join(__dirname, '../../generated/seo-alerts.json');
      if (!(await fs.pathExists(alertsPath))) return [];
      
      const alerts = await fs.readJson(alertsPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return alerts.filter(alert => new Date(alert.timestamp) > cutoffDate);
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return [];
    }
  }

  /**
   * Initialize WordPress pages for SEO monitoring
   */
  async initializeWordPressPages() {
    const wordpressPages = [
      // Course pages
      { url: 'https://pmp-course.com/pmp-certification-course', title: 'PMP Certification Course', type: 'course-page', primary_keywords: ['PMP certification course', 'PMP training', 'project management course'] },
      { url: 'https://pmp-course.com/pmp-study-guide', title: 'Free PMP Study Guide', type: 'course-page', primary_keywords: ['PMP study guide', 'free PMP materials', 'PMP exam prep'] },
      { url: 'https://pmp-course.com/pmp-practice-exams', title: 'PMP Practice Exams', type: 'course-page', primary_keywords: ['PMP practice exam', 'PMP test questions', 'PMP mock exam'] },
      
      // Blog posts
      { url: 'https://pmp-course.com/blog/pmp-exam-changes-2024', title: 'PMP Exam Changes 2024', type: 'blog-post', primary_keywords: ['PMP exam changes', 'PMP 2024 updates', 'new PMP format'] },
      { url: 'https://pmp-course.com/blog/pmp-study-tips', title: 'Top 10 PMP Study Tips', type: 'blog-post', primary_keywords: ['PMP study tips', 'how to study for PMP', 'PMP preparation'] },
      { url: 'https://pmp-course.com/blog/agile-vs-waterfall-pmp', title: 'Agile vs Waterfall in PMP', type: 'blog-post', primary_keywords: ['agile project management', 'waterfall vs agile', 'PMP methodologies'] },
      
      // Landing pages
      { url: 'https://pmp-course.com/free-study-materials', title: 'Free PMP Study Materials', type: 'landing-page', primary_keywords: ['free PMP materials', 'PMP resources', 'PMP study resources'] },
      { url: 'https://pmp-course.com/pmp-exam-checklist', title: 'PMP Exam Prep Checklist', type: 'landing-page', primary_keywords: ['PMP exam checklist', 'PMP preparation checklist', 'PMP readiness'] },
      
      // Lead magnets
      { url: 'https://pmp-course.com/pmp-formula-guide', title: 'PMP Formula Guide Download', type: 'lead-magnet', primary_keywords: ['PMP formulas', 'PMP calculations', 'PMP math guide'] },
      { url: 'https://pmp-course.com/eco-task-checklist', title: 'ECO Task Checklist', type: 'lead-magnet', primary_keywords: ['ECO tasks', 'PMP ECO checklist', 'exam content outline'] },
      
      // Pricing page
      { url: 'https://pmp-course.com/pricing', title: 'PMP Course Pricing', type: 'pricing-page', primary_keywords: ['PMP course price', 'PMP training cost', 'PMP certification cost'] }
    ];

    wordpressPages.forEach(page => {
      this.wordpressPages.set(page.url, page);
    });

    console.log(`Initialized ${wordpressPages.length} WordPress pages for SEO monitoring`);
  }

  /**
   * Get the best WordPress page for a specific keyword
   */
  async getBestWordPressPageForKeyword(keyword) {
    // Find the page most likely to rank for this keyword
    for (const [url, page] of this.wordpressPages) {
      if (page.primary_keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))) {
        return page;
      }
    }
    
    // Default to homepage if no specific page found
    return {
      url: 'https://pmp-course.com',
      title: 'PMP Course - Project Management Professional Certification',
      type: 'homepage'
    };
  }

  /**
   * Update WordPress ranking history
   */
  updateWordPressRankingHistory(keyword, ranking) {
    const key = `wordpress_${keyword}`;
    if (!this.rankingHistory.has(key)) {
      this.rankingHistory.set(key, []);
    }
    
    const history = this.rankingHistory.get(key);
    history.push(ranking);
    
    // Keep only last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.monitoringConfig.maxHistoryDays);
    
    const filteredHistory = history.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );
    
    this.rankingHistory.set(key, filteredHistory);
  }

  /**
   * Check WordPress-specific ranking alerts
   */
  async checkWordPressRankingAlerts(keyword, currentRanking) {
    const key = `wordpress_${keyword}`;
    const history = this.rankingHistory.get(key);
    if (!history || history.length < 2) return;

    const previousRanking = history[history.length - 2];
    const alerts = [];

    // Check for ranking drop
    if (currentRanking.position > previousRanking.position + this.alertThresholds.rankingDrop) {
      alerts.push({
        type: 'wordpress_ranking_drop',
        severity: 'high',
        keyword: keyword,
        page_url: currentRanking.url,
        message: `WordPress page ranking dropped from position ${previousRanking.position} to ${currentRanking.position}`,
        previousPosition: previousRanking.position,
        currentPosition: currentRanking.position,
        drop: currentRanking.position - previousRanking.position
      });
    }

    // Check for page speed drop
    if (currentRanking.page_speed_score < previousRanking.page_speed_score - this.alertThresholds.wordpressPageSpeedDrop) {
      alerts.push({
        type: 'wordpress_page_speed_drop',
        severity: 'medium',
        keyword: keyword,
        page_url: currentRanking.url,
        message: `Page speed score dropped from ${previousRanking.page_speed_score} to ${currentRanking.page_speed_score}`,
        previousScore: previousRanking.page_speed_score,
        currentScore: currentRanking.page_speed_score
      });
    }

    // Check for SEO score drop
    if (currentRanking.seo_score < previousRanking.seo_score - this.alertThresholds.wordpressSEOScoreDrop) {
      alerts.push({
        type: 'wordpress_seo_score_drop',
        severity: 'medium',
        keyword: keyword,
        page_url: currentRanking.url,
        message: `SEO score dropped from ${previousRanking.seo_score} to ${currentRanking.seo_score}`,
        previousScore: previousRanking.seo_score,
        currentScore: currentRanking.seo_score
      });
    }

    if (alerts.length > 0) {
      await this.saveAlerts(alerts);
    }
  }

  /**
   * Monitor WordPress technical SEO
   */
  async monitorWordPressTechnicalSEO() {
    const technicalSEOResults = [];

    for (const [url, page] of this.wordpressPages) {
      try {
        const seoAnalysis = await this.analyzeWordPressPageSEO(url, page);
        technicalSEOResults.push(seoAnalysis);
        
        // Check for technical SEO alerts
        await this.checkTechnicalSEOAlerts(url, seoAnalysis);
        
        // Add delay to avoid overwhelming the server
        await this.delay(2000);
      } catch (error) {
        console.error(`Error analyzing SEO for ${url}:`, error);
        technicalSEOResults.push({
          url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return technicalSEOResults;
  }

  /**
   * Analyze WordPress page SEO
   */
  async analyzeWordPressPageSEO(url, page) {
    // This would integrate with actual SEO analysis tools
    // For now, we'll simulate the analysis
    
    return {
      url: url,
      page_title: page.title,
      page_type: page.type,
      seo_score: Math.floor(Math.random() * 15) + 85, // 85-100
      page_speed_score: Math.floor(Math.random() * 20) + 80, // 80-100
      mobile_friendly: Math.random() > 0.1, // 90% mobile friendly
      https_enabled: true,
      meta_description_length: Math.floor(Math.random() * 50) + 120, // 120-170 chars
      title_length: Math.floor(Math.random() * 20) + 40, // 40-60 chars
      h1_count: Math.floor(Math.random() * 2) + 1, // 1-2 H1 tags
      internal_links: Math.floor(Math.random() * 10) + 5, // 5-15 internal links
      external_links: Math.floor(Math.random() * 5) + 2, // 2-7 external links
      images_without_alt: Math.floor(Math.random() * 3), // 0-2 images without alt
      schema_markup: Math.random() > 0.3, // 70% have schema markup
      canonical_url: true,
      issues: this.generateSEOIssues(),
      recommendations: this.generateSEORecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate SEO issues for a page
   */
  generateSEOIssues() {
    const possibleIssues = [
      'Meta description too short',
      'Missing alt text on images',
      'Page load speed could be improved',
      'H1 tag missing or duplicate',
      'Internal linking opportunities missed',
      'Schema markup not implemented'
    ];

    const numIssues = Math.floor(Math.random() * 3); // 0-2 issues
    return possibleIssues.slice(0, numIssues);
  }

  /**
   * Generate SEO recommendations for a page
   */
  generateSEORecommendations() {
    const possibleRecommendations = [
      'Optimize meta description length (120-160 characters)',
      'Add alt text to all images',
      'Improve page load speed by optimizing images',
      'Add more internal links to related content',
      'Implement structured data markup',
      'Optimize title tag for target keywords'
    ];

    const numRecommendations = Math.floor(Math.random() * 3) + 1; // 1-3 recommendations
    return possibleRecommendations.slice(0, numRecommendations);
  }

  /**
   * Check technical SEO alerts
   */
  async checkTechnicalSEOAlerts(url, seoAnalysis) {
    const alerts = [];

    if (seoAnalysis.seo_score < 80) {
      alerts.push({
        type: 'low_seo_score',
        severity: 'medium',
        url: url,
        message: `SEO score is ${seoAnalysis.seo_score}, below recommended threshold of 80`,
        current_score: seoAnalysis.seo_score
      });
    }

    if (seoAnalysis.page_speed_score < 75) {
      alerts.push({
        type: 'slow_page_speed',
        severity: 'high',
        url: url,
        message: `Page speed score is ${seoAnalysis.page_speed_score}, below recommended threshold of 75`,
        current_score: seoAnalysis.page_speed_score
      });
    }

    if (!seoAnalysis.mobile_friendly) {
      alerts.push({
        type: 'not_mobile_friendly',
        severity: 'high',
        url: url,
        message: 'Page is not mobile-friendly',
        impact: 'Mobile search rankings will be negatively affected'
      });
    }

    if (seoAnalysis.images_without_alt > 0) {
      alerts.push({
        type: 'missing_alt_text',
        severity: 'medium',
        url: url,
        message: `${seoAnalysis.images_without_alt} images missing alt text`,
        count: seoAnalysis.images_without_alt
      });
    }

    if (alerts.length > 0) {
      await this.saveAlerts(alerts);
    }
  }

  /**
   * Load WordPress SEO data
   */
  async loadWordPressSEOData() {
    try {
      const seoDataPath = path.join(__dirname, '../../config/wordpress-seo-data.json');
      if (await fs.pathExists(seoDataPath)) {
        const data = await fs.readJson(seoDataPath);
        this.wordpressSEOData = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading WordPress SEO data:', error);
    }
  }

  /**
   * Save WordPress SEO data
   */
  async saveWordPressSEOData() {
    try {
      const seoDataPath = path.join(__dirname, '../../config/wordpress-seo-data.json');
      const dataObject = Object.fromEntries(this.wordpressSEOData);
      await fs.writeJson(seoDataPath, dataObject, { spaces: 2 });
    } catch (error) {
      console.error('Error saving WordPress SEO data:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SEOMonitoringSystem;