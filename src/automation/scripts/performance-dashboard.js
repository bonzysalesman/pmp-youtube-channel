const fs = require('fs-extra');
const path = require('path');
const YouTubeAnalyticsIntegration = require('./youtube-analytics-integration');

class PerformanceDashboard {
  constructor() {
    this.analytics = new YouTubeAnalyticsIntegration();
    this.dashboardData = {
      overview: {},
      trends: {},
      goals: {},
      alerts: []
    };
    this.goals = {
      subscribers: {
        month1: 500,
        month3: 2000,
        month6: 10000
      },
      engagement: {
        watchTimeRetention: 0.5, // 50%
        commentsPerVideo: 20,
        engagementRate: 0.08 // 8%
      },
      growth: {
        weeklyViewGrowth: 0.1, // 10%
        monthlySubscriberGrowth: 0.2 // 20%
      }
    };
  }

  async initialize() {
    await this.analytics.initialize();
    console.log('Performance Dashboard initialized');
  }

  async generateDashboard(timeframe = '30days') {
    try {
      const { startDate, endDate } = this.getDateRange(timeframe);
      
      // Fetch all required data
      const [
        channelMetrics,
        topVideos,
        subscriberGrowth,
        engagementMetrics
      ] = await Promise.all([
        this.analytics.getChannelMetrics(startDate, endDate),
        this.analytics.getTopVideos(startDate, endDate, 10),
        this.analytics.getSubscriberGrowth(startDate, endDate),
        this.analytics.getEngagementMetrics(startDate, endDate)
      ]);

      // Build dashboard sections
      this.dashboardData = {
        overview: this.buildOverview(channelMetrics, subscriberGrowth, engagementMetrics),
        trends: this.buildTrends(channelMetrics, subscriberGrowth, engagementMetrics),
        topContent: this.buildTopContent(topVideos),
        goals: this.buildGoalsTracking(channelMetrics, subscriberGrowth, engagementMetrics),
        alerts: this.generateAlerts(channelMetrics, subscriberGrowth, engagementMetrics),
        insights: this.generateInsights(channelMetrics, topVideos, subscriberGrowth, engagementMetrics),
        lastUpdated: new Date().toISOString(),
        timeframe: { startDate, endDate, period: timeframe }
      };

      return this.dashboardData;
    } catch (error) {
      console.error('Error generating dashboard:', error);
      throw error;
    }
  }

  buildOverview(channelMetrics, subscriberGrowth, engagementMetrics) {
    const { summary } = channelMetrics;
    
    return {
      totalViews: summary.totalViews,
      totalWatchTime: Math.round(summary.totalWatchTime / 60), // Convert to hours
      subscribersGained: subscriberGrowth.netGrowth,
      averageViewDuration: Math.round(summary.averageViewDuration),
      clickThroughRate: Math.round(summary.averageCTR * 100) / 100,
      engagementRate: Math.round(engagementMetrics.summary.averageEngagementRate * 100) / 100,
      totalVideos: channelMetrics.daily.length > 0 ? channelMetrics.daily.length : 0,
      averageViewsPerVideo: Math.round(summary.totalViews / Math.max(channelMetrics.daily.length, 1))
    };
  }

  buildTrends(channelMetrics, subscriberGrowth, engagementMetrics) {
    const trends = {
      views: this.calculateTrend(channelMetrics.daily, 'views'),
      subscribers: this.calculateTrend(subscriberGrowth.growth, 'netGrowth'),
      engagement: this.calculateTrend(engagementMetrics.daily, 'engagementRate'),
      watchTime: this.calculateTrend(channelMetrics.daily, 'estimatedMinutesWatched')
    };

    return trends;
  }

  calculateTrend(data, metric) {
    if (!data || data.length < 2) {
      return { direction: 'stable', percentage: 0, data: [] };
    }

    const values = data.map(d => d[metric] || 0);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const percentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';

    return {
      direction,
      percentage: Math.round(percentage * 100) / 100,
      data: values,
      current: secondAvg,
      previous: firstAvg
    };
  }

  buildTopContent(topVideos) {
    return {
      byViews: topVideos.slice(0, 5).map(video => ({
        videoId: video.video,
        views: video.views,
        watchTime: video.estimatedMinutesWatched,
        engagementRate: Math.round(video.engagementRate * 100) / 100
      })),
      byEngagement: [...topVideos]
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 5)
        .map(video => ({
          videoId: video.video,
          views: video.views,
          engagementRate: Math.round(video.engagementRate * 100) / 100,
          totalEngagements: video.likes + video.comments + video.shares
        }))
    };
  }

  buildGoalsTracking(channelMetrics, subscriberGrowth, engagementMetrics) {
    const currentSubscribers = subscriberGrowth.netGrowth; // This would need to be total subscribers in real implementation
    const currentEngagementRate = engagementMetrics.summary.averageEngagementRate;
    const averageComments = channelMetrics.summary.totalComments / Math.max(channelMetrics.daily.length, 1);

    return {
      subscribers: {
        current: currentSubscribers,
        month1Target: this.goals.subscribers.month1,
        month3Target: this.goals.subscribers.month3,
        month6Target: this.goals.subscribers.month6,
        month1Progress: Math.min((currentSubscribers / this.goals.subscribers.month1) * 100, 100),
        month3Progress: Math.min((currentSubscribers / this.goals.subscribers.month3) * 100, 100),
        month6Progress: Math.min((currentSubscribers / this.goals.subscribers.month6) * 100, 100)
      },
      engagement: {
        currentRate: currentEngagementRate,
        targetRate: this.goals.engagement.engagementRate * 100,
        progress: Math.min((currentEngagementRate / (this.goals.engagement.engagementRate * 100)) * 100, 100),
        commentsPerVideo: Math.round(averageComments),
        commentsTarget: this.goals.engagement.commentsPerVideo,
        commentsProgress: Math.min((averageComments / this.goals.engagement.commentsPerVideo) * 100, 100)
      },
      retention: {
        current: channelMetrics.summary.averageViewDuration,
        target: this.goals.engagement.watchTimeRetention * 100, // Assuming 100 seconds as base
        progress: Math.min((channelMetrics.summary.averageViewDuration / (this.goals.engagement.watchTimeRetention * 100)) * 100, 100)
      }
    };
  }

  generateAlerts(channelMetrics, subscriberGrowth, engagementMetrics) {
    const alerts = [];

    // CTR Alert
    if (channelMetrics.summary.averageCTR < 3) {
      alerts.push({
        type: 'warning',
        priority: 'high',
        category: 'performance',
        title: 'Low Click-Through Rate',
        message: `CTR is ${channelMetrics.summary.averageCTR.toFixed(2)}%, below the 3% threshold`,
        action: 'Optimize titles and thumbnails',
        timestamp: new Date().toISOString()
      });
    }

    // Engagement Alert
    if (engagementMetrics.summary.averageEngagementRate < 5) {
      alerts.push({
        type: 'warning',
        priority: 'medium',
        category: 'engagement',
        title: 'Low Engagement Rate',
        message: `Engagement rate is ${engagementMetrics.summary.averageEngagementRate.toFixed(2)}%, below 5% target`,
        action: 'Increase calls-to-action and interactive content',
        timestamp: new Date().toISOString()
      });
    }

    // Subscriber Loss Alert
    if (subscriberGrowth.netGrowth < 0) {
      alerts.push({
        type: 'alert',
        priority: 'high',
        category: 'growth',
        title: 'Subscriber Loss Detected',
        message: `Net subscriber loss of ${Math.abs(subscriberGrowth.netGrowth)} in the current period`,
        action: 'Review content strategy and audience retention',
        timestamp: new Date().toISOString()
      });
    }

    // Watch Time Alert
    if (channelMetrics.summary.averageViewDuration < 300) { // 5 minutes
      alerts.push({
        type: 'info',
        priority: 'medium',
        category: 'retention',
        title: 'Low Average View Duration',
        message: `Average view duration is ${Math.round(channelMetrics.summary.averageViewDuration)} seconds`,
        action: 'Improve content hooks and pacing',
        timestamp: new Date().toISOString()
      });
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  generateInsights(channelMetrics, topVideos, subscriberGrowth, engagementMetrics) {
    const insights = [];

    // Performance insights
    if (channelMetrics.summary.averageCTR > 5) {
      insights.push({
        type: 'positive',
        category: 'performance',
        title: 'Excellent Click-Through Rate',
        description: 'Your titles and thumbnails are performing above average',
        recommendation: 'Document successful title/thumbnail patterns for replication'
      });
    }

    // Content insights
    if (topVideos.length > 0) {
      const bestVideo = topVideos[0];
      insights.push({
        type: 'actionable',
        category: 'content',
        title: 'Top Performing Content Pattern',
        description: `Video ${bestVideo.video} achieved ${bestVideo.views} views with ${bestVideo.engagementRate.toFixed(2)}% engagement`,
        recommendation: 'Analyze and replicate the successful elements of this video'
      });
    }

    // Growth insights
    const viewsTrend = this.calculateTrend(channelMetrics.daily, 'views');
    if (viewsTrend.direction === 'up' && viewsTrend.percentage > 20) {
      insights.push({
        type: 'positive',
        category: 'growth',
        title: 'Strong View Growth Trend',
        description: `Views increased by ${viewsTrend.percentage.toFixed(1)}% in the recent period`,
        recommendation: 'Continue current content strategy and consider increasing upload frequency'
      });
    }

    // Engagement insights
    if (engagementMetrics.summary.averageEngagementRate > 8) {
      insights.push({
        type: 'positive',
        category: 'engagement',
        title: 'High Audience Engagement',
        description: 'Your content is generating strong audience interaction',
        recommendation: 'Leverage high engagement for community building and lead generation'
      });
    }

    return insights;
  }

  getDateRange(timeframe) {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeframe) {
    case '7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  async generateWeeklyReport() {
    const dashboard = await this.generateDashboard('7days');
    
    const report = {
      type: 'weekly',
      period: dashboard.timeframe,
      summary: {
        views: dashboard.overview.totalViews,
        subscribers: dashboard.overview.subscribersGained,
        engagement: dashboard.overview.engagementRate,
        topVideo: dashboard.topContent.byViews[0] || null
      },
      goals: dashboard.goals,
      alerts: dashboard.alerts,
      insights: dashboard.insights,
      recommendations: this.generateWeeklyRecommendations(dashboard)
    };

    return report;
  }

  async generateMonthlyReport() {
    const dashboard = await this.generateDashboard('30days');
    
    const report = {
      type: 'monthly',
      period: dashboard.timeframe,
      summary: {
        views: dashboard.overview.totalViews,
        subscribers: dashboard.overview.subscribersGained,
        engagement: dashboard.overview.engagementRate,
        watchTime: dashboard.overview.totalWatchTime,
        ctr: dashboard.overview.clickThroughRate
      },
      trends: dashboard.trends,
      goals: dashboard.goals,
      topContent: dashboard.topContent,
      alerts: dashboard.alerts,
      insights: dashboard.insights,
      recommendations: this.generateMonthlyRecommendations(dashboard)
    };

    return report;
  }

  generateWeeklyRecommendations(dashboard) {
    const recommendations = [];

    // Based on alerts
    dashboard.alerts.forEach(alert => {
      if (alert.priority === 'high') {
        recommendations.push({
          priority: 'immediate',
          action: alert.action,
          reason: alert.message
        });
      }
    });

    // Based on trends
    if (dashboard.trends.views.direction === 'down') {
      recommendations.push({
        priority: 'high',
        action: 'Review and optimize recent video titles and thumbnails',
        reason: 'View trend is declining'
      });
    }

    // Based on goals
    if (dashboard.goals.engagement.progress < 50) {
      recommendations.push({
        priority: 'medium',
        action: 'Increase audience interaction through questions and polls',
        reason: 'Engagement goal progress is below 50%'
      });
    }

    return recommendations;
  }

  generateMonthlyRecommendations(dashboard) {
    const recommendations = [];

    // Strategic recommendations based on monthly data
    if (dashboard.goals.subscribers.month1Progress < 80) {
      recommendations.push({
        priority: 'high',
        action: 'Implement subscriber growth strategies: end screens, CTAs, collaborations',
        reason: 'Monthly subscriber goal at risk'
      });
    }

    if (dashboard.trends.engagement.direction === 'down') {
      recommendations.push({
        priority: 'medium',
        action: 'Analyze top-performing content and replicate successful engagement tactics',
        reason: 'Engagement trend is declining over the month'
      });
    }

    return recommendations;
  }

  async saveDashboard(dashboard, filename) {
    try {
      const dashboardDir = path.join(__dirname, '../../generated/dashboards');
      await fs.ensureDir(dashboardDir);
      
      const filepath = path.join(dashboardDir, filename);
      await fs.writeJson(filepath, dashboard, { spaces: 2 });
      
      console.log(`Dashboard saved to ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error saving dashboard:', error);
      throw error;
    }
  }
}

module.exports = PerformanceDashboard;