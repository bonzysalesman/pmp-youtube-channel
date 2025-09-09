/**
 * User Journey Tracking System
 * Tracks user progression from initial contact through exam completion
 * Analyzes conversion funnels and user behavior patterns
 */

const fs = require('fs-extra');
const path = require('path');

class UserJourneyTracker {
  constructor() {
    this.dataPath = path.join(__dirname, '../../generated/user-journey');
    this.journeyStages = [
      'discovery',
      'first_visit',
      'content_engagement',
      'community_join',
      'lead_magnet_download',
      'email_subscribe',
      'course_interest',
      'course_purchase',
      'study_progress',
      'exam_registration',
      'exam_completion',
      'success_sharing'
    ];
    this.initializeTracker();
  }

  async initializeTracker() {
    try {
      // Ensure data directory exists
      await fs.ensureDir(this.dataPath);
      
      // Initialize journey stage definitions
      await this.initializeJourneyStages();
      
      console.log('User journey tracker initialized');
    } catch (error) {
      console.error('Failed to initialize user journey tracker:', error);
    }
  }

  /**
   * Track user journey event
   */
  async trackJourneyEvent(userId, eventData) {
    try {
      const journeyEvent = {
        userId,
        timestamp: new Date().toISOString(),
        stage: eventData.stage,
        action: eventData.action,
        platform: eventData.platform || 'unknown',
        source: eventData.source || 'direct',
        metadata: eventData.metadata || {},
        sessionId: eventData.sessionId,
        previousStage: await this.getPreviousStage(userId)
      };

      // Save individual event
      await this.saveJourneyEvent(journeyEvent);

      // Update user journey profile
      await this.updateUserJourneyProfile(userId, journeyEvent);

      // Update aggregate journey analytics
      await this.updateJourneyAnalytics(journeyEvent);

      return journeyEvent;
    } catch (error) {
      console.error('Failed to track journey event:', error);
      return null;
    }
  }

  /**
   * Get complete user journey
   */
  async getUserJourney(userId) {
    try {
      const journeyFile = path.join(this.dataPath, 'user-journeys', `${userId}.json`);
      if (await fs.pathExists(journeyFile)) {
        return await fs.readJson(journeyFile);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user journey:', error);
      return null;
    }
  }

  /**
   * Analyze conversion funnel
   */
  async analyzeConversionFunnel(dateRange = null) {
    try {
      const journeyData = await this.loadJourneyData(dateRange);
      
      const funnel = {
        totalUsers: new Set(journeyData.map(event => event.userId)).size,
        stageConversions: {},
        dropoffPoints: [],
        averageTimeToConvert: {},
        conversionPaths: await this.analyzeConversionPaths(journeyData)
      };

      // Calculate conversion rates for each stage
      for (let i = 0; i < this.journeyStages.length - 1; i++) {
        const currentStage = this.journeyStages[i];
        const nextStage = this.journeyStages[i + 1];
        
        const currentStageUsers = this.getUsersAtStage(journeyData, currentStage);
        const nextStageUsers = this.getUsersAtStage(journeyData, nextStage);
        
        const conversionRate = currentStageUsers.size > 0 ? nextStageUsers.size / currentStageUsers.size : 0;
        
        funnel.stageConversions[`${currentStage}_to_${nextStage}`] = {
          currentStageUsers: currentStageUsers.size,
          nextStageUsers: nextStageUsers.size,
          conversionRate,
          dropoffRate: 1 - conversionRate
        };

        // Identify significant dropoff points
        if (conversionRate < 0.3) {
          funnel.dropoffPoints.push({
            stage: currentStage,
            nextStage,
            conversionRate,
            impact: 'high'
          });
        }
      }

      // Calculate average time to convert between stages
      funnel.averageTimeToConvert = await this.calculateAverageConversionTimes(journeyData);

      // Save funnel analysis
      const funnelFile = path.join(this.dataPath, 'conversion-funnel-analysis.json');
      await fs.writeJson(funnelFile, funnel, { spaces: 2 });

      return funnel;
    } catch (error) {
      console.error('Failed to analyze conversion funnel:', error);
      return null;
    }
  }

  /**
   * Track user behavior patterns
   */
  async analyzeBehaviorPatterns() {
    try {
      const journeyData = await this.loadJourneyData();
      
      const patterns = {
        commonPaths: await this.identifyCommonPaths(journeyData),
        engagementPatterns: await this.analyzeEngagementPatterns(journeyData),
        platformPreferences: await this.analyzePlatformPreferences(journeyData),
        timePatterns: await this.analyzeTimePatterns(journeyData),
        contentPreferences: await this.analyzeContentPreferences(journeyData)
      };

      // Save behavior patterns
      const patternsFile = path.join(this.dataPath, 'behavior-patterns.json');
      await fs.writeJson(patternsFile, patterns, { spaces: 2 });

      return patterns;
    } catch (error) {
      console.error('Failed to analyze behavior patterns:', error);
      return null;
    }
  }

  /**
   * Generate user journey insights
   */
  async generateJourneyInsights() {
    try {
      const funnelAnalysis = await this.analyzeConversionFunnel();
      const behaviorPatterns = await this.analyzeBehaviorPatterns();
      const cohortAnalysis = await this.performCohortAnalysis();

      const insights = {
        timestamp: new Date().toISOString(),
        summary: {
          totalUsers: funnelAnalysis?.totalUsers || 0,
          overallConversionRate: this.calculateOverallConversionRate(funnelAnalysis),
          averageJourneyLength: await this.calculateAverageJourneyLength(),
          topConversionPath: behaviorPatterns?.commonPaths?.[0] || null
        },
        keyFindings: [
          ...this.generateFunnelInsights(funnelAnalysis),
          ...this.generateBehaviorInsights(behaviorPatterns),
          ...this.generateCohortInsights(cohortAnalysis)
        ],
        recommendations: [
          ...this.generateFunnelRecommendations(funnelAnalysis),
          ...this.generateBehaviorRecommendations(behaviorPatterns)
        ],
        detailedAnalysis: {
          funnel: funnelAnalysis,
          behavior: behaviorPatterns,
          cohorts: cohortAnalysis
        }
      };

      // Save journey insights
      const insightsFile = path.join(this.dataPath, 'journey-insights.json');
      await fs.writeJson(insightsFile, insights, { spaces: 2 });

      return insights;
    } catch (error) {
      console.error('Failed to generate journey insights:', error);
      return null;
    }
  }

  /**
   * Track cross-platform user behavior
   */
  async trackCrossPlatformBehavior(userId, platforms) {
    try {
      const crossPlatformData = {
        userId,
        timestamp: new Date().toISOString(),
        platforms: platforms.map(platform => ({
          name: platform.name,
          firstVisit: platform.firstVisit,
          lastActivity: platform.lastActivity,
          totalSessions: platform.totalSessions,
          totalTimeSpent: platform.totalTimeSpent,
          actions: platform.actions || []
        })),
        crossPlatformMetrics: {
          platformCount: platforms.length,
          primaryPlatform: this.identifyPrimaryPlatform(platforms),
          platformSwitchFrequency: this.calculatePlatformSwitchFrequency(platforms),
          crossPlatformEngagement: this.calculateCrossPlatformEngagement(platforms)
        }
      };

      // Save cross-platform behavior data
      const behaviorFile = path.join(this.dataPath, 'cross-platform-behavior', `${userId}.json`);
      await fs.ensureDir(path.dirname(behaviorFile));
      await fs.writeJson(behaviorFile, crossPlatformData, { spaces: 2 });

      return crossPlatformData;
    } catch (error) {
      console.error('Failed to track cross-platform behavior:', error);
      return null;
    }
  }

  // Helper methods for journey tracking and analysis

  async initializeJourneyStages() {
    const stageDefinitions = {
      discovery: {
        name: 'Discovery',
        description: 'User discovers the channel/content',
        triggers: ['search_result_click', 'social_media_click', 'referral_click'],
        platforms: ['youtube', 'google', 'social_media']
      },
      first_visit: {
        name: 'First Visit',
        description: 'User visits channel or content for the first time',
        triggers: ['channel_visit', 'video_view', 'website_visit'],
        platforms: ['youtube', 'website']
      },
      content_engagement: {
        name: 'Content Engagement',
        description: 'User actively engages with content',
        triggers: ['video_watch', 'like', 'comment', 'subscribe'],
        platforms: ['youtube']
      },
      community_join: {
        name: 'Community Join',
        description: 'User joins community platforms',
        triggers: ['discord_join', 'telegram_join', 'facebook_group_join'],
        platforms: ['discord', 'telegram', 'facebook']
      },
      lead_magnet_download: {
        name: 'Lead Magnet Download',
        description: 'User downloads lead magnet',
        triggers: ['pdf_download', 'checklist_download', 'template_download'],
        platforms: ['website', 'email']
      },
      email_subscribe: {
        name: 'Email Subscribe',
        description: 'User subscribes to email list',
        triggers: ['email_signup', 'newsletter_subscribe'],
        platforms: ['email', 'website']
      },
      course_interest: {
        name: 'Course Interest',
        description: 'User shows interest in paid courses',
        triggers: ['course_page_visit', 'pricing_page_visit', 'sales_email_click'],
        platforms: ['website', 'email']
      },
      course_purchase: {
        name: 'Course Purchase',
        description: 'User purchases course or study guide',
        triggers: ['course_purchase', 'study_guide_purchase'],
        platforms: ['website', 'course_platform']
      },
      study_progress: {
        name: 'Study Progress',
        description: 'User actively studies and makes progress',
        triggers: ['lesson_completion', 'practice_test', 'progress_update'],
        platforms: ['course_platform', 'youtube', 'study_guide']
      },
      exam_registration: {
        name: 'Exam Registration',
        description: 'User registers for PMP exam',
        triggers: ['exam_registration_notification', 'study_completion'],
        platforms: ['pmi', 'email']
      },
      exam_completion: {
        name: 'Exam Completion',
        description: 'User completes PMP exam',
        triggers: ['exam_result_notification', 'certification_achieved'],
        platforms: ['pmi', 'email']
      },
      success_sharing: {
        name: 'Success Sharing',
        description: 'User shares success story',
        triggers: ['testimonial_submission', 'success_story_share', 'review_submission'],
        platforms: ['youtube', 'social_media', 'website']
      }
    };

    const definitionsFile = path.join(this.dataPath, 'journey-stage-definitions.json');
    await fs.writeJson(definitionsFile, stageDefinitions, { spaces: 2 });
  }

  async saveJourneyEvent(journeyEvent) {
    // Save to daily events file
    const eventDate = journeyEvent.timestamp.split('T')[0];
    const eventsFile = path.join(this.dataPath, 'daily-events', `${eventDate}.json`);
    
    await fs.ensureDir(path.dirname(eventsFile));
    
    let dailyEvents = [];
    if (await fs.pathExists(eventsFile)) {
      dailyEvents = await fs.readJson(eventsFile);
    }
    
    dailyEvents.push(journeyEvent);
    await fs.writeJson(eventsFile, dailyEvents, { spaces: 2 });
  }

  async updateUserJourneyProfile(userId, journeyEvent) {
    const profileFile = path.join(this.dataPath, 'user-journeys', `${userId}.json`);
    await fs.ensureDir(path.dirname(profileFile));
    
    let userJourney = {
      userId,
      firstSeen: journeyEvent.timestamp,
      lastActivity: journeyEvent.timestamp,
      currentStage: journeyEvent.stage,
      stagesCompleted: [],
      events: [],
      platforms: new Set(),
      sources: new Set()
    };
    
    if (await fs.pathExists(profileFile)) {
      userJourney = await fs.readJson(profileFile);
      userJourney.platforms = new Set(userJourney.platforms);
      userJourney.sources = new Set(userJourney.sources);
    }
    
    // Update journey profile
    userJourney.lastActivity = journeyEvent.timestamp;
    userJourney.currentStage = journeyEvent.stage;
    userJourney.events.push(journeyEvent);
    userJourney.platforms.add(journeyEvent.platform);
    userJourney.sources.add(journeyEvent.source);
    
    // Track stage completion
    if (!userJourney.stagesCompleted.includes(journeyEvent.stage)) {
      userJourney.stagesCompleted.push(journeyEvent.stage);
    }
    
    // Convert Sets back to arrays for JSON serialization
    userJourney.platforms = Array.from(userJourney.platforms);
    userJourney.sources = Array.from(userJourney.sources);
    
    await fs.writeJson(profileFile, userJourney, { spaces: 2 });
  }

  async getPreviousStage(userId) {
    const userJourney = await this.getUserJourney(userId);
    if (userJourney && userJourney.events.length > 0) {
      return userJourney.events[userJourney.events.length - 1].stage;
    }
    return null;
  }

  async loadJourneyData(dateRange = null) {
    try {
      const eventsDir = path.join(this.dataPath, 'daily-events');
      if (!await fs.pathExists(eventsDir)) {
        return [];
      }
      
      const eventFiles = await fs.readdir(eventsDir);
      let allEvents = [];
      
      for (const file of eventFiles) {
        if (file.endsWith('.json')) {
          const events = await fs.readJson(path.join(eventsDir, file));
          allEvents = allEvents.concat(events);
        }
      }
      
      // Filter by date range if provided
      if (dateRange) {
        allEvents = allEvents.filter(event => {
          const eventDate = new Date(event.timestamp);
          return eventDate >= new Date(dateRange.start) && eventDate <= new Date(dateRange.end);
        });
      }
      
      return allEvents;
    } catch (error) {
      console.error('Failed to load journey data:', error);
      return [];
    }
  }

  getUsersAtStage(journeyData, stage) {
    return new Set(
      journeyData
        .filter(event => event.stage === stage)
        .map(event => event.userId)
    );
  }

  async analyzeConversionPaths(journeyData) {
    const userPaths = {};
    
    journeyData.forEach(event => {
      if (!userPaths[event.userId]) {
        userPaths[event.userId] = [];
      }
      userPaths[event.userId].push(event.stage);
    });
    
    // Find common paths
    const pathCounts = {};
    Object.values(userPaths).forEach(path => {
      const pathString = path.join(' -> ');
      pathCounts[pathString] = (pathCounts[pathString] || 0) + 1;
    });
    
    return Object.entries(pathCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
  }

  async calculateAverageConversionTimes(journeyData) {
    const conversionTimes = {};
    const userJourneys = {};
    
    // Group events by user
    journeyData.forEach(event => {
      if (!userJourneys[event.userId]) {
        userJourneys[event.userId] = [];
      }
      userJourneys[event.userId].push(event);
    });
    
    // Calculate time between stages for each user
    Object.values(userJourneys).forEach(journey => {
      journey.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      for (let i = 0; i < journey.length - 1; i++) {
        const currentEvent = journey[i];
        const nextEvent = journey[i + 1];
        const timeDiff = new Date(nextEvent.timestamp) - new Date(currentEvent.timestamp);
        const stageTransition = `${currentEvent.stage}_to_${nextEvent.stage}`;
        
        if (!conversionTimes[stageTransition]) {
          conversionTimes[stageTransition] = [];
        }
        conversionTimes[stageTransition].push(timeDiff);
      }
    });
    
    // Calculate averages
    const averages = {};
    Object.entries(conversionTimes).forEach(([transition, times]) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      averages[transition] = {
        averageTimeMs: avgTime,
        averageTimeDays: avgTime / (1000 * 60 * 60 * 24),
        sampleSize: times.length
      };
    });
    
    return averages;
  }

  // Additional helper methods would be implemented here...
  // (identifyCommonPaths, analyzeEngagementPatterns, etc.)

  calculateOverallConversionRate(funnelAnalysis) {
    if (!funnelAnalysis || !funnelAnalysis.stageConversions) {return 0;}
    
    const conversions = Object.values(funnelAnalysis.stageConversions);
    if (conversions.length === 0) {return 0;}
    
    return conversions.reduce((sum, conversion) => sum + conversion.conversionRate, 0) / conversions.length;
  }

  async calculateAverageJourneyLength() {
    const journeyData = await this.loadJourneyData();
    const userJourneys = {};
    
    journeyData.forEach(event => {
      if (!userJourneys[event.userId]) {
        userJourneys[event.userId] = { start: event.timestamp, end: event.timestamp };
      } else {
        userJourneys[event.userId].end = event.timestamp;
      }
    });
    
    const journeyLengths = Object.values(userJourneys).map(journey => {
      return new Date(journey.end) - new Date(journey.start);
    });
    
    if (journeyLengths.length === 0) {return 0;}
    
    const avgLengthMs = journeyLengths.reduce((sum, length) => sum + length, 0) / journeyLengths.length;
    return avgLengthMs / (1000 * 60 * 60 * 24); // Convert to days
  }

  generateFunnelInsights(funnelAnalysis) {
    const insights = [];
    
    if (funnelAnalysis && funnelAnalysis.dropoffPoints) {
      funnelAnalysis.dropoffPoints.forEach(dropoff => {
        insights.push({
          type: 'funnel_dropoff',
          priority: dropoff.impact === 'high' ? 'high' : 'medium',
          message: `High dropoff rate (${Math.round((1 - dropoff.conversionRate) * 100)}%) between ${dropoff.stage} and ${dropoff.nextStage}`,
          data: dropoff
        });
      });
    }
    
    return insights;
  }

  generateBehaviorInsights(behaviorPatterns) {
    const insights = [];
    
    if (behaviorPatterns && behaviorPatterns.commonPaths) {
      insights.push({
        type: 'behavior_pattern',
        priority: 'medium',
        message: `Most common user path: ${behaviorPatterns.commonPaths[0]?.path}`,
        data: behaviorPatterns.commonPaths[0]
      });
    }
    
    return insights;
  }

  generateCohortInsights(cohortAnalysis) {
    // Placeholder for cohort insights
    return [];
  }

  generateFunnelRecommendations(funnelAnalysis) {
    const recommendations = [];
    
    if (funnelAnalysis && funnelAnalysis.dropoffPoints) {
      funnelAnalysis.dropoffPoints.forEach(dropoff => {
        recommendations.push({
          type: 'funnel_optimization',
          priority: 'high',
          stage: dropoff.stage,
          message: `Optimize transition from ${dropoff.stage} to ${dropoff.nextStage} to reduce ${Math.round((1 - dropoff.conversionRate) * 100)}% dropoff rate`,
          expectedImpact: 'medium'
        });
      });
    }
    
    return recommendations;
  }

  generateBehaviorRecommendations(behaviorPatterns) {
    // Placeholder for behavior-based recommendations
    return [
      {
        type: 'behavior_optimization',
        priority: 'medium',
        message: 'Optimize content based on identified user behavior patterns',
        expectedImpact: 'medium'
      }
    ];
  }

  async performCohortAnalysis() {
    // Placeholder for cohort analysis
    return {
      cohorts: [],
      retentionRates: {},
      lifetimeValue: {}
    };
  }

  identifyPrimaryPlatform(platforms) {
    return platforms.reduce((primary, platform) => {
      return platform.totalTimeSpent > (primary?.totalTimeSpent || 0) ? platform : primary;
    }, null)?.name || 'unknown';
  }

  calculatePlatformSwitchFrequency(platforms) {
    // Simplified calculation - would need more detailed session data
    return platforms.length > 1 ? platforms.length - 1 : 0;
  }

  calculateCrossPlatformEngagement(platforms) {
    const totalEngagement = platforms.reduce((sum, platform) => {
      return sum + (platform.actions?.length || 0);
    }, 0);
    
    return {
      totalActions: totalEngagement,
      averageActionsPerPlatform: totalEngagement / platforms.length,
      engagementDistribution: platforms.map(platform => ({
        platform: platform.name,
        actions: platform.actions?.length || 0,
        percentage: ((platform.actions?.length || 0) / totalEngagement) * 100
      }))
    };
  }
}

module.exports = UserJourneyTracker;