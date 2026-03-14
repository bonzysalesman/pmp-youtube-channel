const fs = require('fs-extra');
const path = require('path');

class ABTestingFramework {
  constructor() {
    this.testDatabase = new Map();
    this.testResults = new Map();
    this.testConfigPath = path.join(__dirname, '../../config/ab-test-config.json');
    this.testResultsPath = path.join(__dirname, '../../config/ab-test-results.json');
  }

  async initializeFramework() {
    try {
      // Load existing test configurations
      if (await fs.pathExists(this.testConfigPath)) {
        const config = await fs.readJson(this.testConfigPath);
        this.testDatabase = new Map(Object.entries(config));
      }

      // Load existing test results
      if (await fs.pathExists(this.testResultsPath)) {
        const results = await fs.readJson(this.testResultsPath);
        this.testResults = new Map(Object.entries(results));
      }

      console.log('A/B Testing Framework initialized successfully');
    } catch (error) {
      console.error('Error initializing A/B Testing Framework:', error);
      throw error;
    }
  }

  createTitleTest(testId, variants, testConfig = {}) {
    const test = {
      id: testId,
      type: 'title',
      variants: variants.map((variant, index) => ({
        id: `${testId}_variant_${index}`,
        title: variant.title,
        description: variant.description || '',
        keywords: variant.keywords || [],
        expectedCTR: variant.expectedCTR || 0.05
      })),
      config: {
        duration: testConfig.duration || 7, // days
        trafficSplit: testConfig.trafficSplit || 'equal',
        minSampleSize: testConfig.minSampleSize || 100,
        confidenceLevel: testConfig.confidenceLevel || 0.95,
        primaryMetric: testConfig.primaryMetric || 'ctr',
        secondaryMetrics: testConfig.secondaryMetrics || ['views', 'watchTime']
      },
      status: 'created',
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null
    };

    this.testDatabase.set(testId, test);
    return test;
  }

  createThumbnailTest(testId, variants, testConfig = {}) {
    const test = {
      id: testId,
      type: 'thumbnail',
      variants: variants.map((variant, index) => ({
        id: `${testId}_variant_${index}`,
        thumbnailUrl: variant.thumbnailUrl,
        style: variant.style || 'standard',
        colorScheme: variant.colorScheme || 'default',
        textOverlay: variant.textOverlay || '',
        expectedCTR: variant.expectedCTR || 0.05
      })),
      config: {
        duration: testConfig.duration || 14, // days
        trafficSplit: testConfig.trafficSplit || 'equal',
        minSampleSize: testConfig.minSampleSize || 200,
        confidenceLevel: testConfig.confidenceLevel || 0.95,
        primaryMetric: testConfig.primaryMetric || 'ctr',
        secondaryMetrics: testConfig.secondaryMetrics || ['views', 'impressions']
      },
      status: 'created',
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null
    };

    this.testDatabase.set(testId, test);
    return test;
  }

  createDescriptionTest(testId, variants, testConfig = {}) {
    const test = {
      id: testId,
      type: 'description',
      variants: variants.map((variant, index) => ({
        id: `${testId}_variant_${index}`,
        description: variant.description,
        keywordDensity: variant.keywordDensity || 0,
        callToAction: variant.callToAction || '',
        linkPlacement: variant.linkPlacement || 'bottom'
      })),
      config: {
        duration: testConfig.duration || 14, // days
        trafficSplit: testConfig.trafficSplit || 'equal',
        minSampleSize: testConfig.minSampleSize || 150,
        confidenceLevel: testConfig.confidenceLevel || 0.95,
        primaryMetric: testConfig.primaryMetric || 'engagement',
        secondaryMetrics: testConfig.secondaryMetrics || ['comments', 'likes', 'shares']
      },
      status: 'created',
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null
    };

    this.testDatabase.set(testId, test);
    return test;
  }

  startTest(testId) {
    const test = this.testDatabase.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    if (test.status !== 'created') {
      throw new Error(`Test ${testId} cannot be started. Current status: ${test.status}`);
    }

    test.status = 'running';
    test.startedAt = new Date().toISOString();
    test.endDate = new Date(Date.now() + test.config.duration * 24 * 60 * 60 * 1000).toISOString();

    // Initialize results tracking
    this.testResults.set(testId, {
      testId: testId,
      variants: test.variants.map(variant => ({
        variantId: variant.id,
        metrics: {
          impressions: 0,
          views: 0,
          clicks: 0,
          ctr: 0,
          watchTime: 0,
          engagement: 0,
          comments: 0,
          likes: 0,
          shares: 0
        },
        sampleSize: 0
      })),
      winner: null,
      confidence: 0,
      significance: false
    });

    this.testDatabase.set(testId, test);
    console.log(`Test ${testId} started successfully`);
    return test;
  }

  recordMetric(testId, variantId, metric, value) {
    const results = this.testResults.get(testId);
    if (!results) {
      throw new Error(`Test results for ${testId} not found`);
    }

    const variant = results.variants.find(v => v.variantId === variantId);
    if (!variant) {
      throw new Error(`Variant ${variantId} not found in test ${testId}`);
    }

    variant.metrics[metric] = (variant.metrics[metric] || 0) + value;
    variant.sampleSize++;

    // Update calculated metrics
    if (metric === 'clicks' || metric === 'impressions') {
      variant.metrics.ctr = variant.metrics.impressions > 0 
        ? variant.metrics.clicks / variant.metrics.impressions 
        : 0;
    }

    this.testResults.set(testId, results);
  }

  analyzeTest(testId) {
    const test = this.testDatabase.get(testId);
    const results = this.testResults.get(testId);

    if (!test || !results) {
      throw new Error(`Test ${testId} or results not found`);
    }

    const analysis = {
      testId: testId,
      status: test.status,
      duration: this.calculateTestDuration(test),
      variants: results.variants.map(variant => ({
        ...variant,
        performance: this.calculateVariantPerformance(variant, test.config.primaryMetric)
      })),
      winner: null,
      confidence: 0,
      significance: false,
      recommendations: []
    };

    // Determine winner based on primary metric
    const primaryMetric = test.config.primaryMetric;
    const sortedVariants = analysis.variants.sort((a, b) => 
      b.metrics[primaryMetric] - a.metrics[primaryMetric]
    );

    if (sortedVariants.length >= 2) {
      const winner = sortedVariants[0];
      const runnerUp = sortedVariants[1];

      // Calculate statistical significance
      const significance = this.calculateStatisticalSignificance(
        winner.metrics[primaryMetric],
        runnerUp.metrics[primaryMetric],
        winner.sampleSize,
        runnerUp.sampleSize,
        test.config.confidenceLevel
      );

      analysis.winner = winner.variantId;
      analysis.confidence = significance.confidence;
      analysis.significance = significance.isSignificant;
    }

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis, test);

    return analysis;
  }

  calculateVariantPerformance(variant, primaryMetric) {
    const metrics = variant.metrics;
    let score = 0;

    switch (primaryMetric) {
      case 'ctr':
        score = metrics.ctr * 100; // Convert to percentage
        break;
      case 'views':
        score = metrics.views;
        break;
      case 'engagement':
        score = (metrics.likes + metrics.comments + metrics.shares) / Math.max(metrics.views, 1);
        break;
      case 'watchTime':
        score = metrics.watchTime / Math.max(metrics.views, 1);
        break;
      default:
        score = metrics[primaryMetric] || 0;
    }

    return {
      score: score,
      rank: 0, // Will be set during analysis
      improvement: 0 // Will be calculated relative to control
    };
  }

  calculateStatisticalSignificance(winnerValue, runnerUpValue, winnerSample, runnerUpSample, confidenceLevel) {
    // Simplified statistical significance calculation
    // In production, use proper statistical libraries
    
    const pooledStdError = Math.sqrt(
      (winnerValue * (1 - winnerValue) / winnerSample) +
      (runnerUpValue * (1 - runnerUpValue) / runnerUpSample)
    );

    const zScore = Math.abs(winnerValue - runnerUpValue) / pooledStdError;
    const criticalValue = confidenceLevel === 0.95 ? 1.96 : 2.58; // 95% or 99%

    return {
      zScore: zScore,
      confidence: confidenceLevel,
      isSignificant: zScore > criticalValue,
      pValue: this.calculatePValue(zScore)
    };
  }

  calculatePValue(zScore) {
    // Simplified p-value calculation
    // In production, use proper statistical libraries
    return Math.max(0.001, 1 - (zScore / 3)); // Rough approximation
  }

  generateRecommendations(analysis, test) {
    const recommendations = [];
    const winner = analysis.variants.find(v => v.variantId === analysis.winner);

    if (analysis.significance) {
      recommendations.push({
        type: 'winner_implementation',
        message: `Implement winning variant ${analysis.winner} with ${(analysis.confidence * 100).toFixed(1)}% confidence`,
        priority: 'high'
      });
    } else {
      recommendations.push({
        type: 'continue_testing',
        message: 'Results not statistically significant. Consider extending test duration or increasing sample size.',
        priority: 'medium'
      });
    }

    // Performance-based recommendations
    if (winner && winner.metrics.ctr < 0.03) {
      recommendations.push({
        type: 'ctr_improvement',
        message: 'CTR is below 3%. Consider testing more compelling titles or thumbnails.',
        priority: 'high'
      });
    }

    if (test.type === 'title' && winner && winner.metrics.watchTime < 300) {
      recommendations.push({
        type: 'retention_improvement',
        message: 'Low watch time detected. Title may be misleading or content needs improvement.',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  calculateTestDuration(test) {
    if (!test.startedAt) return 0;
    
    const endTime = test.endedAt ? new Date(test.endedAt) : new Date();
    const startTime = new Date(test.startedAt);
    
    return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)); // Days
  }

  async endTest(testId) {
    const test = this.testDatabase.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    test.status = 'completed';
    test.endedAt = new Date().toISOString();

    const analysis = this.analyzeTest(testId);
    
    this.testDatabase.set(testId, test);
    
    console.log(`Test ${testId} completed. Winner: ${analysis.winner || 'No clear winner'}`);
    return analysis;
  }

  async saveTestData() {
    try {
      // Convert Maps to Objects for JSON serialization
      const testConfig = Object.fromEntries(this.testDatabase);
      const testResults = Object.fromEntries(this.testResults);

      await fs.writeJson(this.testConfigPath, testConfig, { spaces: 2 });
      await fs.writeJson(this.testResultsPath, testResults, { spaces: 2 });

      console.log('A/B test data saved successfully');
    } catch (error) {
      console.error('Error saving A/B test data:', error);
      throw error;
    }
  }

  getActiveTests() {
    return Array.from(this.testDatabase.values()).filter(test => test.status === 'running');
  }

  getTestHistory() {
    return Array.from(this.testDatabase.values()).filter(test => test.status === 'completed');
  }
}

module.exports = ABTestingFramework;