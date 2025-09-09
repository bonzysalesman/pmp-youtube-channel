/**
 * Educational Content Quality Assurance Pipeline
 * PMI ECO validation, content accuracy review, and continuous improvement system
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class ContentQualityAssurance {
  constructor() {
    this.ecoValidator = new ECOValidator();
    this.contentReviewer = new ContentAccuracyReviewer();
    this.updateTracker = new PMIUpdateTracker();
    this.feedbackIntegrator = new UserFeedbackIntegrator();
        
    this.config = this.loadConfig();
    this.dataPath = path.join(__dirname, '../../data/quality-assurance.json');
    this.data = this.loadData();
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../../config/quality-assurance-config.json');
    if (fs.existsSync(configPath)) {
      return fs.readJsonSync(configPath);
    }
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      ecoValidation: {
        enabled: true,
        strictMode: true,
        requiredCoverage: 0.95 // 95% ECO coverage required
      },
      contentReview: {
        enabled: true,
        requireSMEApproval: true,
        reviewCycles: 2,
        accuracyThreshold: 0.98
      },
      updateTracking: {
        enabled: true,
        checkFrequency: 'weekly',
        autoFlag: true,
        sources: ['pmi.org', 'pmbok', 'eco-updates']
      },
      feedbackIntegration: {
        enabled: true,
        minimumFeedbackScore: 4.0,
        autoRevisionThreshold: 3.5,
        feedbackSources: ['youtube', 'discord', 'email', 'surveys']
      }
    };
  }

  loadData() {
    if (fs.existsSync(this.dataPath)) {
      return fs.readJsonSync(this.dataPath);
    }
    return {
      contentReviews: [],
      ecoValidations: [],
      flaggedContent: [],
      feedbackAnalysis: [],
      qualityMetrics: {
        overallScore: 0,
        ecoCompliance: 0,
        accuracyScore: 0,
        userSatisfaction: 0
      },
      lastUpdated: moment().toISOString()
    };
  }

  saveData() {
    fs.ensureDirSync(path.dirname(this.dataPath));
    this.data.lastUpdated = moment().toISOString();
    fs.writeJsonSync(this.dataPath, this.data, { spaces: 2 });
  }

  /**
     * Validate content against PMI ECO requirements
     */
  async validateContentECO(contentData) {
    const validation = await this.ecoValidator.validate(contentData);
        
    const validationRecord = {
      id: this.generateValidationId(),
      contentId: contentData.id,
      contentType: contentData.type,
      timestamp: moment().toISOString(),
      validation: validation,
      status: validation.isValid ? 'passed' : 'failed',
      issues: validation.issues || [],
      recommendations: validation.recommendations || []
    };

    this.data.ecoValidations.push(validationRecord);
        
    if (!validation.isValid) {
      this.flagContentForReview(contentData.id, 'eco_validation_failed', validation.issues);
    }

    this.updateQualityMetrics();
    this.saveData();

    return validationRecord;
  }

  /**
     * Submit content for accuracy review
     */
  async submitForAccuracyReview(contentData, reviewerData = {}) {
    const review = {
      id: this.generateReviewId(),
      contentId: contentData.id,
      contentType: contentData.type,
      submittedAt: moment().toISOString(),
      submittedBy: reviewerData.submittedBy || 'system',
      status: 'pending',
      reviewCycle: 1,
      maxCycles: this.config.contentReview.reviewCycles,
      reviewers: [],
      findings: [],
      approvals: [],
      finalScore: null,
      approved: false
    };

    this.data.contentReviews.push(review);
    this.saveData();

    // Auto-assign reviewers if configured
    if (this.config.contentReview.requireSMEApproval) {
      await this.assignSMEReviewers(review.id);
    }

    return review.id;
  }

  /**
     * Process reviewer feedback
     */
  async processReviewerFeedback(reviewId, reviewerFeedback) {
    const review = this.data.contentReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    const reviewerEntry = {
      reviewerId: reviewerFeedback.reviewerId,
      reviewerName: reviewerFeedback.reviewerName,
      reviewedAt: moment().toISOString(),
      accuracyScore: reviewerFeedback.accuracyScore, // 1-5 scale
      findings: reviewerFeedback.findings || [],
      recommendations: reviewerFeedback.recommendations || [],
      approved: reviewerFeedback.approved || false,
      comments: reviewerFeedback.comments
    };

    review.reviewers.push(reviewerEntry);
    review.findings.push(...reviewerFeedback.findings);

    // Calculate review status
    const approvedReviews = review.reviewers.filter(r => r.approved).length;
    const totalReviews = review.reviewers.length;
    const averageScore = review.reviewers.reduce((sum, r) => sum + r.accuracyScore, 0) / totalReviews;

    review.finalScore = averageScore;

    // Determine if content is approved
    if (averageScore >= this.config.contentReview.accuracyThreshold && 
            approvedReviews >= Math.ceil(totalReviews * 0.6)) {
      review.status = 'approved';
      review.approved = true;
      review.approvedAt = moment().toISOString();
    } else if (review.reviewCycle >= review.maxCycles) {
      review.status = 'rejected';
      review.approved = false;
      this.flagContentForReview(review.contentId, 'accuracy_review_failed', review.findings);
    } else {
      review.status = 'revision_required';
      review.reviewCycle++;
    }

    this.updateQualityMetrics();
    this.saveData();

    return {
      reviewStatus: review.status,
      finalScore: review.finalScore,
      approved: review.approved,
      nextSteps: this.getReviewNextSteps(review)
    };
  }

  /**
     * Check for PMI standard updates and flag affected content
     */
  async checkPMIUpdates() {
    const updates = await this.updateTracker.checkForUpdates();
    const flaggedContent = [];

    for (const update of updates) {
      const affectedContent = await this.identifyAffectedContent(update);
            
      for (const content of affectedContent) {
        const flagId = this.flagContentForReview(
          content.id, 
          'pmi_update_required', 
          [`PMI update: ${update.description}`]
        );
        flaggedContent.push({ contentId: content.id, flagId, update });
      }
    }

    return {
      updatesFound: updates.length,
      contentFlagged: flaggedContent.length,
      flaggedContent
    };
  }

  /**
     * Integrate user feedback for content improvement
     */
  async integrateUserFeedback(feedbackData) {
    const analysis = await this.feedbackIntegrator.analyzeFeedback(feedbackData);
        
    const feedbackRecord = {
      id: this.generateFeedbackId(),
      contentId: feedbackData.contentId,
      source: feedbackData.source,
      timestamp: moment().toISOString(),
      feedback: feedbackData,
      analysis: analysis,
      actionRequired: analysis.score < this.config.feedbackIntegration.autoRevisionThreshold,
      actions: []
    };

    this.data.feedbackAnalysis.push(feedbackRecord);

    // Auto-flag content if feedback score is below threshold
    if (analysis.score < this.config.feedbackIntegration.autoRevisionThreshold) {
      this.flagContentForReview(
        feedbackData.contentId,
        'user_feedback_concerns',
        analysis.issues
      );
    }

    this.updateQualityMetrics();
    this.saveData();

    return feedbackRecord;
  }

  /**
     * Flag content for review
     */
  flagContentForReview(contentId, reason, issues = []) {
    const flag = {
      id: this.generateFlagId(),
      contentId: contentId,
      reason: reason,
      issues: issues,
      flaggedAt: moment().toISOString(),
      priority: this.calculateFlagPriority(reason),
      status: 'open',
      assignedTo: null,
      resolvedAt: null,
      resolution: null
    };

    this.data.flaggedContent.push(flag);
    this.saveData();

    return flag.id;
  }

  /**
     * Get quality assurance dashboard data
     */
  async getQualityDashboard() {
    this.updateQualityMetrics();

    return {
      metrics: this.data.qualityMetrics,
      pendingReviews: this.data.contentReviews.filter(r => r.status === 'pending').length,
      flaggedContent: this.data.flaggedContent.filter(f => f.status === 'open').length,
      recentValidations: this.data.ecoValidations.slice(-10),
      highPriorityFlags: this.data.flaggedContent.filter(f => f.priority === 'high' && f.status === 'open'),
      feedbackSummary: this.getFeedbackSummary(),
      complianceStatus: this.getComplianceStatus()
    };
  }

  /**
     * Update quality metrics
     */
  updateQualityMetrics() {
    const recentValidations = this.data.ecoValidations.slice(-50);
    const recentReviews = this.data.contentReviews.slice(-50);
    const recentFeedback = this.data.feedbackAnalysis.slice(-50);

    // ECO Compliance Score
    const ecoCompliance = recentValidations.length > 0 
      ? recentValidations.filter(v => v.status === 'passed').length / recentValidations.length 
      : 0;

    // Accuracy Score
    const accuracyScore = recentReviews.length > 0
      ? recentReviews.filter(r => r.approved).reduce((sum, r) => sum + (r.finalScore || 0), 0) / recentReviews.length / 5
      : 0;

    // User Satisfaction Score
    const userSatisfaction = recentFeedback.length > 0
      ? recentFeedback.reduce((sum, f) => sum + f.analysis.score, 0) / recentFeedback.length / 5
      : 0;

    // Overall Quality Score
    const overallScore = (ecoCompliance + accuracyScore + userSatisfaction) / 3;

    this.data.qualityMetrics = {
      overallScore: Math.round(overallScore * 100) / 100,
      ecoCompliance: Math.round(ecoCompliance * 100) / 100,
      accuracyScore: Math.round(accuracyScore * 100) / 100,
      userSatisfaction: Math.round(userSatisfaction * 100) / 100,
      lastUpdated: moment().toISOString()
    };
  }

  /**
     * Get feedback summary
     */
  getFeedbackSummary() {
    const recentFeedback = this.data.feedbackAnalysis.slice(-30);
        
    return {
      totalFeedback: recentFeedback.length,
      averageScore: recentFeedback.length > 0 
        ? recentFeedback.reduce((sum, f) => sum + f.analysis.score, 0) / recentFeedback.length 
        : 0,
      bySource: this.groupFeedbackBySource(recentFeedback),
      commonIssues: this.extractCommonIssues(recentFeedback)
    };
  }

  /**
     * Get compliance status
     */
  getComplianceStatus() {
    const openFlags = this.data.flaggedContent.filter(f => f.status === 'open');
    const criticalFlags = openFlags.filter(f => f.priority === 'high');

    return {
      compliant: criticalFlags.length === 0,
      openFlags: openFlags.length,
      criticalFlags: criticalFlags.length,
      flagsByReason: this.groupFlagsByReason(openFlags)
    };
  }

  // Helper methods
  calculateFlagPriority(reason) {
    const highPriorityReasons = ['eco_validation_failed', 'accuracy_review_failed', 'pmi_update_required'];
    return highPriorityReasons.includes(reason) ? 'high' : 'medium';
  }

  getReviewNextSteps(review) {
    switch (review.status) {
    case 'approved':
      return ['Content approved for publication', 'Update content status', 'Schedule publication'];
    case 'rejected':
      return ['Content requires major revision', 'Assign to content creator', 'Schedule re-review'];
    case 'revision_required':
      return ['Address reviewer feedback', 'Make recommended changes', 'Resubmit for review'];
    default:
      return ['Awaiting reviewer feedback'];
    }
  }

  async identifyAffectedContent(update) {
    // This would analyze content against PMI updates
    // For now, return empty array - would be enhanced with actual content analysis
    return [];
  }

  groupFeedbackBySource(feedback) {
    const grouped = {};
    feedback.forEach(f => {
      if (!grouped[f.source]) {grouped[f.source] = [];}
      grouped[f.source].push(f);
    });
    return grouped;
  }

  extractCommonIssues(feedback) {
    const issues = {};
    feedback.forEach(f => {
      f.analysis.issues.forEach(issue => {
        issues[issue] = (issues[issue] || 0) + 1;
      });
    });
    return Object.entries(issues).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  groupFlagsByReason(flags) {
    const grouped = {};
    flags.forEach(f => {
      grouped[f.reason] = (grouped[f.reason] || 0) + 1;
    });
    return grouped;
  }

  async assignSMEReviewers(reviewId) {
    // Implementation for assigning subject matter expert reviewers
    console.log(`Assigning SME reviewers for review ${reviewId}`);
  }

  // ID generators
  generateValidationId() {
    return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateReviewId() {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateFeedbackId() {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateFlagId() {
    return `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ContentQualityAssurance;