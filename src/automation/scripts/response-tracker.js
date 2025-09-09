/**
 * Response Tracker
 * Tracks response times across all platforms with 24-hour monitoring
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class ResponseTracker {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/response-tracking.json');
    this.targetResponseTime = 2; // hours
    this.data = this.loadData();
  }

  loadData() {
    if (fs.existsSync(this.dataPath)) {
      return fs.readJsonSync(this.dataPath);
    }
    return {
      responses: [],
      metrics: {
        totalResponses: 0,
        averageResponseTime: 0,
        violationsCount: 0,
        platformBreakdown: {}
      },
      lastUpdated: moment().toISOString()
    };
  }

  saveData() {
    fs.ensureDirSync(path.dirname(this.dataPath));
    fs.writeJsonSync(this.dataPath, this.data, { spaces: 2 });
  }

  /**
     * Record a new engagement that needs response
     */
  recordEngagement(engagement) {
    const record = {
      id: this.generateId(),
      platform: engagement.platform,
      type: engagement.type, // comment, message, mention, etc.
      userId: engagement.userId,
      content: engagement.content,
      timestamp: engagement.timestamp || moment().toISOString(),
      responseDeadline: moment(engagement.timestamp).add(this.targetResponseTime, 'hours').toISOString(),
      status: 'pending',
      responseTime: null,
      respondedAt: null,
      respondedBy: null
    };

    this.data.responses.push(record);
    this.saveData();
    return record.id;
  }

  /**
     * Record a response to an engagement
     */
  recordResponse(engagementId, responseData) {
    const engagement = this.data.responses.find(r => r.id === engagementId);
    if (!engagement) {
      throw new Error(`Engagement ${engagementId} not found`);
    }

    const responseTime = moment().diff(moment(engagement.timestamp), 'hours', true);
        
    engagement.status = 'responded';
    engagement.responseTime = responseTime;
    engagement.respondedAt = moment().toISOString();
    engagement.respondedBy = responseData.respondedBy || 'system';
    engagement.responseContent = responseData.content;

    this.updateMetrics();
    this.saveData();

    return {
      responseTime,
      withinTarget: responseTime <= this.targetResponseTime
    };
  }

  /**
     * Get pending responses that are overdue
     */
  getOverdueResponses() {
    const now = moment();
    return this.data.responses.filter(response => 
      response.status === 'pending' && 
            now.isAfter(moment(response.responseDeadline))
    );
  }

  /**
     * Get pending responses by platform
     */
  getPendingResponsesByPlatform(platform) {
    return this.data.responses.filter(response => 
      response.platform === platform && 
            response.status === 'pending'
    );
  }

  /**
     * Get response metrics
     */
  async getMetrics() {
    this.updateMetrics();
    return {
      ...this.data.metrics,
      overdueCount: this.getOverdueResponses().length,
      pendingCount: this.data.responses.filter(r => r.status === 'pending').length,
      last24Hours: this.getLast24HourMetrics(),
      platformBreakdown: this.getPlatformBreakdown()
    };
  }

  /**
     * Get average response time for a timeframe
     */
  async getAverageResponseTime(timeframe = 'week') {
    const startDate = moment().subtract(1, timeframe);
    const responses = this.data.responses.filter(r => 
      r.status === 'responded' && 
            moment(r.respondedAt).isAfter(startDate)
    );

    if (responses.length === 0) {
      return { average: 0, count: 0 };
    }

    const totalTime = responses.reduce((sum, r) => sum + r.responseTime, 0);
    return {
      average: totalTime / responses.length,
      count: responses.length,
      withinTarget: responses.filter(r => r.responseTime <= this.targetResponseTime).length
    };
  }

  /**
     * Update overall metrics
     */
  updateMetrics() {
    const respondedEngagements = this.data.responses.filter(r => r.status === 'responded');
    const violations = respondedEngagements.filter(r => r.responseTime > this.targetResponseTime);

    this.data.metrics = {
      totalResponses: respondedEngagements.length,
      averageResponseTime: respondedEngagements.length > 0 
        ? respondedEngagements.reduce((sum, r) => sum + r.responseTime, 0) / respondedEngagements.length 
        : 0,
      violationsCount: violations.length,
      violationRate: respondedEngagements.length > 0 
        ? (violations.length / respondedEngagements.length) * 100 
        : 0,
      platformBreakdown: this.getPlatformBreakdown(),
      lastUpdated: moment().toISOString()
    };
  }

  /**
     * Get platform breakdown of response metrics
     */
  getPlatformBreakdown() {
    const platforms = {};
        
    this.data.responses.forEach(response => {
      if (!platforms[response.platform]) {
        platforms[response.platform] = {
          total: 0,
          responded: 0,
          pending: 0,
          overdue: 0,
          averageResponseTime: 0,
          violations: 0
        };
      }

      platforms[response.platform].total++;
            
      if (response.status === 'responded') {
        platforms[response.platform].responded++;
        if (response.responseTime > this.targetResponseTime) {
          platforms[response.platform].violations++;
        }
      } else if (response.status === 'pending') {
        platforms[response.platform].pending++;
        if (moment().isAfter(moment(response.responseDeadline))) {
          platforms[response.platform].overdue++;
        }
      }
    });

    // Calculate average response times per platform
    Object.keys(platforms).forEach(platform => {
      const respondedForPlatform = this.data.responses.filter(r => 
        r.platform === platform && r.status === 'responded'
      );
            
      if (respondedForPlatform.length > 0) {
        platforms[platform].averageResponseTime = 
                    respondedForPlatform.reduce((sum, r) => sum + r.responseTime, 0) / respondedForPlatform.length;
      }
    });

    return platforms;
  }

  /**
     * Get metrics for last 24 hours
     */
  getLast24HourMetrics() {
    const last24Hours = moment().subtract(24, 'hours');
    const recentResponses = this.data.responses.filter(r => 
      moment(r.timestamp).isAfter(last24Hours)
    );

    const responded = recentResponses.filter(r => r.status === 'responded');
    const pending = recentResponses.filter(r => r.status === 'pending');

    return {
      total: recentResponses.length,
      responded: responded.length,
      pending: pending.length,
      averageResponseTime: responded.length > 0 
        ? responded.reduce((sum, r) => sum + r.responseTime, 0) / responded.length 
        : 0,
      violations: responded.filter(r => r.responseTime > this.targetResponseTime).length
    };
  }

  /**
     * Generate unique ID for tracking
     */
  generateId() {
    return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
     * Clean up old data (older than 90 days)
     */
  cleanupOldData() {
    const cutoffDate = moment().subtract(90, 'days');
    const originalCount = this.data.responses.length;
        
    this.data.responses = this.data.responses.filter(response => 
      moment(response.timestamp).isAfter(cutoffDate)
    );

    const removedCount = originalCount - this.data.responses.length;
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old response records`);
      this.updateMetrics();
      this.saveData();
    }

    return removedCount;
  }

  /**
     * Export response data for analysis
     */
  exportData(timeframe = 'month') {
    const startDate = moment().subtract(1, timeframe);
    const filteredResponses = this.data.responses.filter(r => 
      moment(r.timestamp).isAfter(startDate)
    );

    return {
      timeframe,
      startDate: startDate.toISOString(),
      endDate: moment().toISOString(),
      responses: filteredResponses,
      summary: {
        total: filteredResponses.length,
        responded: filteredResponses.filter(r => r.status === 'responded').length,
        pending: filteredResponses.filter(r => r.status === 'pending').length,
        violations: filteredResponses.filter(r => r.status === 'responded' && r.responseTime > this.targetResponseTime).length
      }
    };
  }
}

module.exports = ResponseTracker;