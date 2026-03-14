const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');

class YouTubeAnalyticsIntegration {
  constructor() {
    this.youtube = null;
    this.youtubeAnalytics = null;
    this.channelId = process.env.YOUTUBE_CHANNEL_ID;
    this.credentials = null;
    this.metricsCache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
  }

  async initialize() {
    try {
      // Initialize OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
      );

      // Set refresh token
      oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
      });

      // Initialize YouTube APIs
      this.youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });

      this.youtubeAnalytics = google.youtubeAnalytics({
        version: 'v2',
        auth: oauth2Client
      });

      console.log('YouTube Analytics Integration initialized successfully');
    } catch (error) {
      console.error('Error initializing YouTube Analytics:', error);
      throw error;
    }
  }

  async getChannelMetrics(startDate, endDate) {
    const cacheKey = `channel_${startDate}_${endDate}`;
    
    // Check cache first
    if (this.metricsCache.has(cacheKey)) {
      const cached = this.metricsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: `channel==${this.channelId}`,
        startDate: startDate,
        endDate: endDate,
        metrics: [
          'views',
          'estimatedMinutesWatched',
          'averageViewDuration',
          'subscribersGained',
          'subscribersLost',
          'likes',
          'dislikes',
          'comments',
          'shares',
          'impressions',
          'impressionClickThroughRate'
        ].join(','),
        dimensions: 'day'
      });

      const metrics = this.processChannelMetrics(response.data);
      
      // Cache the results
      this.metricsCache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      });

      return metrics;
    } catch (error) {
      console.error('Error fetching channel metrics:', error);
      throw error;
    }
  }

  async getVideoMetrics(videoId, startDate, endDate) {
    const cacheKey = `video_${videoId}_${startDate}_${endDate}`;
    
    // Check cache first
    if (this.metricsCache.has(cacheKey)) {
      const cached = this.metricsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: `channel==${this.channelId}`,
        startDate: startDate,
        endDate: endDate,
        metrics: [
          'views',
          'estimatedMinutesWatched',
          'averageViewDuration',
          'likes',
          'dislikes',
          'comments',
          'shares',
          'subscribersGained',
          'impressions',
          'impressionClickThroughRate',
          'averageViewPercentage'
        ].join(','),
        filters: `video==${videoId}`,
        dimensions: 'day'
      });

      const metrics = this.processVideoMetrics(response.data, videoId);
      
      // Cache the results
      this.metricsCache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      });

      return metrics;
    } catch (error) {
      console.error(`Error fetching metrics for video ${videoId}:`, error);
      throw error;
    }
  }

  async getTopVideos(startDate, endDate, maxResults = 10) {
    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: `channel==${this.channelId}`,
        startDate: startDate,
        endDate: endDate,
        metrics: 'views,estimatedMinutesWatched,likes,comments,shares',
        dimensions: 'video',
        sort: '-views',
        maxResults: maxResults
      });

      return this.processTopVideos(response.data);
    } catch (error) {
      console.error('Error fetching top videos:', error);
      throw error;
    }
  }

  async getSubscriberGrowth(startDate, endDate) {
    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: `channel==${this.channelId}`,
        startDate: startDate,
        endDate: endDate,
        metrics: 'subscribersGained,subscribersLost',
        dimensions: 'day'
      });

      return this.processSubscriberGrowth(response.data);
    } catch (error) {
      console.error('Error fetching subscriber growth:', error);
      throw error;
    }
  }

  async getEngagementMetrics(startDate, endDate) {
    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: `channel==${this.channelId}`,
        startDate: startDate,
        endDate: endDate,
        metrics: 'likes,dislikes,comments,shares,views',
        dimensions: 'day'
      });

      return this.processEngagementMetrics(response.data);
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      throw error;
    }
  }

  processChannelMetrics(data) {
    if (!data.rows || data.rows.length === 0) {
      return { summary: {}, daily: [] };
    }

    const headers = data.columnHeaders.map(h => h.name);
    const rows = data.rows;

    // Calculate summary metrics
    const summary = {
      totalViews: 0,
      totalWatchTime: 0,
      averageViewDuration: 0,
      subscribersGained: 0,
      subscribersLost: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalImpressions: 0,
      averageCTR: 0
    };

    const daily = rows.map(row => {
      const dayData = {};
      headers.forEach((header, index) => {
        dayData[header] = row[index];
      });

      // Add to summary
      summary.totalViews += dayData.views || 0;
      summary.totalWatchTime += dayData.estimatedMinutesWatched || 0;
      summary.subscribersGained += dayData.subscribersGained || 0;
      summary.subscribersLost += dayData.subscribersLost || 0;
      summary.totalLikes += dayData.likes || 0;
      summary.totalComments += dayData.comments || 0;
      summary.totalShares += dayData.shares || 0;
      summary.totalImpressions += dayData.impressions || 0;

      return dayData;
    });

    // Calculate averages
    summary.averageViewDuration = summary.totalWatchTime / Math.max(summary.totalViews, 1);
    summary.averageCTR = summary.totalImpressions > 0 
      ? (summary.totalViews / summary.totalImpressions) * 100 
      : 0;

    return { summary, daily };
  }

  processVideoMetrics(data, videoId) {
    if (!data.rows || data.rows.length === 0) {
      return { videoId, summary: {}, daily: [] };
    }

    const headers = data.columnHeaders.map(h => h.name);
    const rows = data.rows;

    const summary = {
      totalViews: 0,
      totalWatchTime: 0,
      averageViewDuration: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      subscribersGained: 0,
      totalImpressions: 0,
      averageCTR: 0,
      retentionRate: 0
    };

    const daily = rows.map(row => {
      const dayData = {};
      headers.forEach((header, index) => {
        dayData[header] = row[index];
      });

      // Add to summary
      summary.totalViews += dayData.views || 0;
      summary.totalWatchTime += dayData.estimatedMinutesWatched || 0;
      summary.totalLikes += dayData.likes || 0;
      summary.totalComments += dayData.comments || 0;
      summary.totalShares += dayData.shares || 0;
      summary.subscribersGained += dayData.subscribersGained || 0;
      summary.totalImpressions += dayData.impressions || 0;

      return dayData;
    });

    // Calculate derived metrics
    summary.averageViewDuration = summary.totalWatchTime / Math.max(summary.totalViews, 1);
    summary.averageCTR = summary.totalImpressions > 0 
      ? (summary.totalViews / summary.totalImpressions) * 100 
      : 0;
    summary.engagementRate = summary.totalViews > 0 
      ? ((summary.totalLikes + summary.totalComments + summary.totalShares) / summary.totalViews) * 100 
      : 0;

    return { videoId, summary, daily };
  }

  processTopVideos(data) {
    if (!data.rows || data.rows.length === 0) {
      return [];
    }

    const headers = data.columnHeaders.map(h => h.name);
    
    return data.rows.map(row => {
      const video = {};
      headers.forEach((header, index) => {
        video[header] = row[index];
      });

      // Calculate engagement rate
      video.engagementRate = video.views > 0 
        ? ((video.likes + video.comments + video.shares) / video.views) * 100 
        : 0;

      return video;
    });
  }

  processSubscriberGrowth(data) {
    if (!data.rows || data.rows.length === 0) {
      return { growth: [], netGrowth: 0 };
    }

    const headers = data.columnHeaders.map(h => h.name);
    let netGrowth = 0;

    const growth = data.rows.map(row => {
      const dayData = {};
      headers.forEach((header, index) => {
        dayData[header] = row[index];
      });

      const dailyNet = (dayData.subscribersGained || 0) - (dayData.subscribersLost || 0);
      netGrowth += dailyNet;
      dayData.netGrowth = dailyNet;

      return dayData;
    });

    return { growth, netGrowth };
  }

  processEngagementMetrics(data) {
    if (!data.rows || data.rows.length === 0) {
      return { daily: [], summary: {} };
    }

    const headers = data.columnHeaders.map(h => h.name);
    let totalEngagements = 0;
    let totalViews = 0;

    const daily = data.rows.map(row => {
      const dayData = {};
      headers.forEach((header, index) => {
        dayData[header] = row[index];
      });

      const engagements = (dayData.likes || 0) + (dayData.comments || 0) + (dayData.shares || 0);
      dayData.totalEngagements = engagements;
      dayData.engagementRate = dayData.views > 0 ? (engagements / dayData.views) * 100 : 0;

      totalEngagements += engagements;
      totalViews += dayData.views || 0;

      return dayData;
    });

    const summary = {
      totalEngagements,
      totalViews,
      averageEngagementRate: totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0
    };

    return { daily, summary };
  }

  async generatePerformanceReport(startDate, endDate) {
    try {
      const [
        channelMetrics,
        topVideos,
        subscriberGrowth,
        engagementMetrics
      ] = await Promise.all([
        this.getChannelMetrics(startDate, endDate),
        this.getTopVideos(startDate, endDate),
        this.getSubscriberGrowth(startDate, endDate),
        this.getEngagementMetrics(startDate, endDate)
      ]);

      const report = {
        period: { startDate, endDate },
        generated: new Date().toISOString(),
        channel: channelMetrics,
        topVideos: topVideos,
        subscriberGrowth: subscriberGrowth,
        engagement: engagementMetrics,
        insights: this.generateInsights(channelMetrics, topVideos, subscriberGrowth, engagementMetrics)
      };

      return report;
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  generateInsights(channelMetrics, topVideos, subscriberGrowth, engagementMetrics) {
    const insights = [];

    // CTR insights
    if (channelMetrics.summary.averageCTR < 3) {
      insights.push({
        type: 'warning',
        category: 'ctr',
        message: 'Click-through rate is below 3%. Consider optimizing titles and thumbnails.',
        recommendation: 'Test different title formulas and thumbnail styles'
      });
    } else if (channelMetrics.summary.averageCTR > 6) {
      insights.push({
        type: 'success',
        category: 'ctr',
        message: 'Excellent click-through rate! Your titles and thumbnails are performing well.',
        recommendation: 'Continue current optimization strategies'
      });
    }

    // Engagement insights
    if (engagementMetrics.summary.averageEngagementRate < 5) {
      insights.push({
        type: 'warning',
        category: 'engagement',
        message: 'Engagement rate is below 5%. Focus on creating more interactive content.',
        recommendation: 'Add more calls-to-action and encourage comments'
      });
    }

    // Subscriber growth insights
    if (subscriberGrowth.netGrowth < 0) {
      insights.push({
        type: 'alert',
        category: 'subscribers',
        message: 'Net subscriber loss detected. Review content quality and audience retention.',
        recommendation: 'Analyze top-performing videos and replicate successful elements'
      });
    }

    // Top video insights
    if (topVideos.length > 0) {
      const bestPerformer = topVideos[0];
      insights.push({
        type: 'info',
        category: 'content',
        message: `Top performing video has ${bestPerformer.views} views and ${bestPerformer.engagementRate.toFixed(2)}% engagement rate.`,
        recommendation: 'Analyze this video\'s title, thumbnail, and content structure for replication'
      });
    }

    return insights;
  }

  async saveReport(report, filename) {
    try {
      const reportsDir = path.join(__dirname, '../../generated/reports');
      await fs.ensureDir(reportsDir);
      
      const filepath = path.join(reportsDir, filename);
      await fs.writeJson(filepath, report, { spaces: 2 });
      
      console.log(`Performance report saved to ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }
}

module.exports = YouTubeAnalyticsIntegration;