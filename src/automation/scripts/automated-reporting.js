const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const PerformanceDashboard = require('./performance-dashboard');
const YouTubeAnalyticsIntegration = require('./youtube-analytics-integration');

class AutomatedReporting {
  constructor() {
    this.dashboard = new PerformanceDashboard();
    this.analytics = new YouTubeAnalyticsIntegration();
    this.scheduledJobs = new Map();
    this.reportConfig = {
      daily: {
        enabled: true,
        time: '09:00', // 9 AM
        timezone: 'America/New_York'
      },
      weekly: {
        enabled: true,
        day: 'monday',
        time: '08:00', // 8 AM Monday
        timezone: 'America/New_York'
      },
      monthly: {
        enabled: true,
        day: 1, // First day of month
        time: '07:00', // 7 AM
        timezone: 'America/New_York'
      }
    };
  }

  async initialize() {
    await this.dashboard.initialize();
    await this.analytics.initialize();
    this.setupScheduledReports();
    console.log('Automated Reporting System initialized');
  }

  setupScheduledReports() {
    // Daily report - every day at 9 AM
    if (this.reportConfig.daily.enabled) {
      const dailyCron = `0 9 * * *`; // 9 AM every day
      const dailyJob = cron.schedule(dailyCron, async () => {
        await this.generateDailyReport();
      }, {
        scheduled: false,
        timezone: this.reportConfig.daily.timezone
      });
      
      this.scheduledJobs.set('daily', dailyJob);
      console.log('Daily report scheduled for 9:00 AM');
    }

    // Weekly report - every Monday at 8 AM
    if (this.reportConfig.weekly.enabled) {
      const weeklyCron = `0 8 * * 1`; // 8 AM every Monday
      const weeklyJob = cron.schedule(weeklyCron, async () => {
        await this.generateWeeklyReport();
      }, {
        scheduled: false,
        timezone: this.reportConfig.weekly.timezone
      });
      
      this.scheduledJobs.set('weekly', weeklyJob);
      console.log('Weekly report scheduled for Monday 8:00 AM');
    }

    // Monthly report - first day of month at 7 AM
    if (this.reportConfig.monthly.enabled) {
      const monthlyCron = `0 7 1 * *`; // 7 AM on 1st of every month
      const monthlyJob = cron.schedule(monthlyCron, async () => {
        await this.generateMonthlyReport();
      }, {
        scheduled: false,
        timezone: this.reportConfig.monthly.timezone
      });
      
      this.scheduledJobs.set('monthly', monthlyJob);
      console.log('Monthly report scheduled for 1st of month 7:00 AM');
    }
  }

  startScheduledReports() {
    this.scheduledJobs.forEach((job, type) => {
      job.start();
      console.log(`${type} report scheduling started`);
    });
  }

  stopScheduledReports() {
    this.scheduledJobs.forEach((job, type) => {
      job.stop();
      console.log(`${type} report scheduling stopped`);
    });
  }

  async generateDailyReport() {
    try {
      console.log('Generating daily performance report...');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startDate = yesterday.toISOString().split('T')[0];
      const endDate = startDate;

      // Get yesterday's metrics
      const channelMetrics = await this.analytics.getChannelMetrics(startDate, endDate);
      const engagementMetrics = await this.analytics.getEngagementMetrics(startDate, endDate);

      const report = {
        type: 'daily',
        date: startDate,
        generated: new Date().toISOString(),
        metrics: {
          views: channelMetrics.summary.totalViews,
          watchTime: Math.round(channelMetrics.summary.totalWatchTime / 60), // hours
          subscribers: channelMetrics.summary.subscribersGained - channelMetrics.summary.subscribersLost,
          engagement: {
            likes: channelMetrics.summary.totalLikes,
            comments: channelMetrics.summary.totalComments,
            shares: channelMetrics.summary.totalShares,
            rate: engagementMetrics.summary.averageEngagementRate
          },
          ctr: channelMetrics.summary.averageCTR
        },
        alerts: this.generateDailyAlerts(channelMetrics, engagementMetrics),
        summary: this.generateDailySummary(channelMetrics, engagementMetrics)
      };

      // Save report
      const filename = `daily-report-${startDate}.json`;
      await this.saveReport(report, filename);

      // Generate and save summary email/notification content
      await this.generateDailyNotification(report);

      console.log(`Daily report generated for ${startDate}`);
      return report;
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  }

  async generateWeeklyReport() {
    try {
      console.log('Generating weekly performance report...');
      
      const report = await this.dashboard.generateWeeklyReport();
      
      // Add weekly-specific analysis
      report.weeklyAnalysis = await this.generateWeeklyAnalysis();
      report.contentRecommendations = await this.generateContentRecommendations();
      
      // Save report
      const weekStart = new Date(report.period.startDate);
      const filename = `weekly-report-${weekStart.toISOString().split('T')[0]}.json`;
      await this.saveReport(report, filename);

      // Generate weekly summary
      await this.generateWeeklyNotification(report);

      console.log('Weekly report generated successfully');
      return report;
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  }

  async generateMonthlyReport() {
    try {
      console.log('Generating monthly performance report...');
      
      const report = await this.dashboard.generateMonthlyReport();
      
      // Add monthly-specific analysis
      report.monthlyAnalysis = await this.generateMonthlyAnalysis();
      report.strategicRecommendations = await this.generateStrategicRecommendations(report);
      report.goalProgress = await this.generateGoalProgressReport(report);
      
      // Save report
      const monthStart = new Date(report.period.startDate);
      const filename = `monthly-report-${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}.json`;
      await this.saveReport(report, filename);

      // Generate monthly summary
      await this.generateMonthlyNotification(report);

      console.log('Monthly report generated successfully');
      return report;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }

  generateDailyAlerts(channelMetrics, engagementMetrics) {
    const alerts = [];

    // Check for unusual drops
    if (channelMetrics.summary.totalViews === 0) {
      alerts.push({
        type: 'warning',
        message: 'No views recorded yesterday - check if content was published'
      });
    }

    if (channelMetrics.summary.averageCTR < 2) {
      alerts.push({
        type: 'alert',
        message: `Very low CTR (${channelMetrics.summary.averageCTR.toFixed(2)}%) - review titles and thumbnails`
      });
    }

    return alerts;
  }

  generateDailySummary(channelMetrics, engagementMetrics) {
    const summary = [];

    if (channelMetrics.summary.totalViews > 0) {
      summary.push(`📊 ${channelMetrics.summary.totalViews} views yesterday`);
    }

    if (channelMetrics.summary.subscribersGained > 0) {
      summary.push(`👥 +${channelMetrics.summary.subscribersGained} new subscribers`);
    }

    if (engagementMetrics.summary.averageEngagementRate > 5) {
      summary.push(`🎯 Strong engagement at ${engagementMetrics.summary.averageEngagementRate.toFixed(1)}%`);
    }

    return summary.length > 0 ? summary : ['📈 Monitoring daily performance'];
  }

  async generateWeeklyAnalysis() {
    // Get 7-day and 14-day data for comparison
    const currentWeek = await this.analytics.getChannelMetrics(
      this.getDateDaysAgo(7),
      this.getDateDaysAgo(0)
    );
    
    const previousWeek = await this.analytics.getChannelMetrics(
      this.getDateDaysAgo(14),
      this.getDateDaysAgo(7)
    );

    return {
      viewsGrowth: this.calculateGrowthRate(previousWeek.summary.totalViews, currentWeek.summary.totalViews),
      subscriberGrowth: this.calculateGrowthRate(
        previousWeek.summary.subscribersGained - previousWeek.summary.subscribersLost,
        currentWeek.summary.subscribersGained - currentWeek.summary.subscribersLost
      ),
      engagementTrend: currentWeek.summary.averageCTR > previousWeek.summary.averageCTR ? 'improving' : 'declining'
    };
  }

  async generateContentRecommendations() {
    const topVideos = await this.analytics.getTopVideos(this.getDateDaysAgo(7), this.getDateDaysAgo(0), 5);
    
    const recommendations = [];

    if (topVideos.length > 0) {
      const bestPerformer = topVideos[0];
      recommendations.push({
        type: 'content',
        priority: 'high',
        action: `Analyze and replicate elements from top video (${bestPerformer.views} views)`,
        category: 'optimization'
      });
    }

    // Add more content recommendations based on performance patterns
    recommendations.push({
      type: 'scheduling',
      priority: 'medium',
      action: 'Maintain consistent daily upload schedule',
      category: 'consistency'
    });

    return recommendations;
  }

  async generateMonthlyAnalysis() {
    // Compare current month to previous month
    const currentMonth = await this.analytics.getChannelMetrics(
      this.getDateDaysAgo(30),
      this.getDateDaysAgo(0)
    );
    
    const previousMonth = await this.analytics.getChannelMetrics(
      this.getDateDaysAgo(60),
      this.getDateDaysAgo(30)
    );

    return {
      monthOverMonthGrowth: {
        views: this.calculateGrowthRate(previousMonth.summary.totalViews, currentMonth.summary.totalViews),
        subscribers: this.calculateGrowthRate(
          previousMonth.summary.subscribersGained - previousMonth.summary.subscribersLost,
          currentMonth.summary.subscribersGained - currentMonth.summary.subscribersLost
        ),
        watchTime: this.calculateGrowthRate(previousMonth.summary.totalWatchTime, currentMonth.summary.totalWatchTime)
      },
      keyAchievements: this.identifyMonthlyAchievements(currentMonth),
      areasForImprovement: this.identifyImprovementAreas(currentMonth)
    };
  }

  generateStrategicRecommendations(report) {
    const recommendations = [];

    // Based on goal progress
    if (report.goals.subscribers.month1Progress < 50) {
      recommendations.push({
        type: 'growth',
        priority: 'high',
        action: 'Implement aggressive subscriber growth tactics',
        details: 'Focus on end screens, CTAs, and community engagement'
      });
    }

    if (report.trends.engagement.direction === 'down') {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        action: 'Revise content strategy to boost engagement',
        details: 'Analyze top-performing content and increase interactive elements'
      });
    }

    return recommendations;
  }

  generateGoalProgressReport(report) {
    return {
      subscribers: {
        current: report.goals.subscribers.current,
        targets: {
          month1: report.goals.subscribers.month1Target,
          month3: report.goals.subscribers.month3Target,
          month6: report.goals.subscribers.month6Target
        },
        progress: {
          month1: report.goals.subscribers.month1Progress,
          month3: report.goals.subscribers.month3Progress,
          month6: report.goals.subscribers.month6Progress
        },
        onTrack: report.goals.subscribers.month1Progress > 80
      },
      engagement: {
        current: report.goals.engagement.currentRate,
        target: report.goals.engagement.targetRate,
        onTrack: report.goals.engagement.progress > 80
      }
    };
  }

  calculateGrowthRate(previous, current) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  identifyMonthlyAchievements(metrics) {
    const achievements = [];

    if (metrics.summary.totalViews > 10000) {
      achievements.push('Exceeded 10K monthly views');
    }

    if (metrics.summary.averageCTR > 5) {
      achievements.push('Maintained excellent CTR above 5%');
    }

    return achievements;
  }

  identifyImprovementAreas(metrics) {
    const areas = [];

    if (metrics.summary.averageViewDuration < 300) {
      areas.push('Improve content retention and watch time');
    }

    if (metrics.summary.averageCTR < 3) {
      areas.push('Optimize titles and thumbnails for better CTR');
    }

    return areas;
  }

  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  async generateDailyNotification(report) {
    const notification = {
      subject: `Daily Performance Update - ${report.date}`,
      summary: report.summary.join(' | '),
      metrics: report.metrics,
      alerts: report.alerts
    };

    await this.saveNotification(notification, `daily-notification-${report.date}.json`);
    return notification;
  }

  async generateWeeklyNotification(report) {
    const notification = {
      subject: `Weekly Performance Report - Week of ${report.period.startDate}`,
      summary: `${report.summary.views} views, ${report.summary.subscribers} new subscribers`,
      highlights: report.insights.slice(0, 3),
      recommendations: report.recommendations.slice(0, 3)
    };

    await this.saveNotification(notification, `weekly-notification-${report.period.startDate}.json`);
    return notification;
  }

  async generateMonthlyNotification(report) {
    const notification = {
      subject: `Monthly Performance Report - ${new Date(report.period.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      summary: `${report.summary.views} views, ${report.summary.subscribers} new subscribers`,
      goalProgress: report.goalProgress,
      strategicRecommendations: report.strategicRecommendations.slice(0, 5)
    };

    await this.saveNotification(notification, `monthly-notification-${report.period.startDate}.json`);
    return notification;
  }

  async saveReport(report, filename) {
    try {
      const reportsDir = path.join(__dirname, '../../generated/reports');
      await fs.ensureDir(reportsDir);
      
      const filepath = path.join(reportsDir, filename);
      await fs.writeJson(filepath, report, { spaces: 2 });
      
      console.log(`Report saved to ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  async saveNotification(notification, filename) {
    try {
      const notificationsDir = path.join(__dirname, '../../generated/notifications');
      await fs.ensureDir(notificationsDir);
      
      const filepath = path.join(notificationsDir, filename);
      await fs.writeJson(filepath, notification, { spaces: 2 });
      
      return filepath;
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  // Manual report generation methods
  async generateReportNow(type = 'daily') {
    switch (type) {
      case 'daily':
        return await this.generateDailyReport();
      case 'weekly':
        return await this.generateWeeklyReport();
      case 'monthly':
        return await this.generateMonthlyReport();
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }
}

module.exports = AutomatedReporting;