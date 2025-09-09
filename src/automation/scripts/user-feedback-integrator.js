/**
 * User Feedback Integrator
 * Collects and analyzes user feedback for continuous content improvement
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class UserFeedbackIntegrator {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/user-feedback.json');
    this.data = this.loadData();
    this.sentimentAnalyzer = new SimpleSentimentAnalyzer();
    this.feedbackSources = this.loadFeedbackSources();
  }

  loadData() {
    if (fs.existsSync(this.dataPath)) {
      return fs.readJsonSync(this.dataPath);
    }
    return {
      feedback: [],
      analysis: [],
      actionItems: [],
      metrics: {
        totalFeedback: 0,
        averageRating: 0,
        sentimentDistribution: {},
        responseRate: 0
      },
      lastUpdated: moment().toISOString()
    };
  }

  loadFeedbackSources() {
    return {
      youtube: {
        types: ['comments', 'likes', 'dislikes', 'community_posts'],
        weight: 0.4,
        realtime: true
      },
      discord: {
        types: ['messages', 'reactions', 'polls'],
        weight: 0.3,
        realtime: true
      },
      email: {
        types: ['replies', 'surveys', 'direct_feedback'],
        weight: 0.2,
        realtime: false
      },
      surveys: {
        types: ['course_feedback', 'content_rating', 'improvement_suggestions'],
        weight: 0.1,
        realtime: false
      }
    };
  }

  /**
     * Analyze feedback data
     */
  async analyzeFeedback(feedbackData) {
    const analysis = {
      id: this.generateAnalysisId(),
      feedbackId: feedbackData.id,
      contentId: feedbackData.contentId,
      source: feedbackData.source,
      timestamp: moment().toISOString(),
      rawFeedback: feedbackData,
      sentiment: {},
      score: 0,
      categories: [],
      issues: [],
      suggestions: [],
      actionable: false
    };

    try {
      // Perform sentiment analysis
      analysis.sentiment = await this.analyzeSentiment(feedbackData);
            
      // Calculate feedback score
      analysis.score = this.calculateFeedbackScore(feedbackData, analysis.sentiment);
            
      // Categorize feedback
      analysis.categories = this.categorizeFeedback(feedbackData);
            
      // Extract issues and suggestions
      analysis.issues = this.extractIssues(feedbackData, analysis.sentiment);
      analysis.suggestions = this.extractSuggestions(feedbackData);
            
      // Determine if actionable
      analysis.actionable = this.isActionable(analysis);

      // Store analysis
      this.data.analysis.push(analysis);
            
      // Generate action items if needed
      if (analysis.actionable) {
        await this.generateActionItems(analysis);
      }

      this.updateMetrics();
      this.saveData();

    } catch (error) {
      console.error('Error analyzing feedback:', error);
      analysis.error = error.message;
    }

    return analysis;
  }

  /**
     * Analyze sentiment of feedback
     */
  async analyzeSentiment(feedbackData) {
    const text = this.extractFeedbackText(feedbackData);
        
    return {
      overall: this.sentimentAnalyzer.analyze(text),
      aspects: this.analyzeAspectSentiment(text),
      confidence: this.sentimentAnalyzer.getConfidence(text),
      emotions: this.detectEmotions(text)
    };
  }

  /**
     * Extract text from feedback data
     */
  extractFeedbackText(feedbackData) {
    let text = '';
        
    if (feedbackData.comment) {text += feedbackData.comment + ' ';}
    if (feedbackData.message) {text += feedbackData.message + ' ';}
    if (feedbackData.review) {text += feedbackData.review + ' ';}
    if (feedbackData.suggestion) {text += feedbackData.suggestion + ' ';}
        
    return text.trim();
  }

  /**
     * Analyze sentiment for specific aspects
     */
  analyzeAspectSentiment(text) {
    const aspects = {
      content_quality: this.getAspectSentiment(text, ['quality', 'helpful', 'clear', 'confusing', 'excellent']),
      presentation: this.getAspectSentiment(text, ['video', 'audio', 'visual', 'slides', 'presentation']),
      difficulty: this.getAspectSentiment(text, ['easy', 'hard', 'difficult', 'complex', 'simple']),
      pace: this.getAspectSentiment(text, ['fast', 'slow', 'pace', 'speed', 'rushed']),
      engagement: this.getAspectSentiment(text, ['boring', 'interesting', 'engaging', 'captivating', 'dull'])
    };

    return aspects;
  }

  /**
     * Get sentiment for specific aspect
     */
  getAspectSentiment(text, keywords) {
    const relevantText = this.extractRelevantText(text, keywords);
    if (!relevantText) {return null;}
        
    return this.sentimentAnalyzer.analyze(relevantText);
  }

  /**
     * Extract text relevant to specific keywords
     */
  extractRelevantText(text, keywords) {
    const sentences = text.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence => 
      keywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );
        
    return relevantSentences.join('. ').trim();
  }

  /**
     * Detect emotions in feedback
     */
  detectEmotions(text) {
    const emotionKeywords = {
      frustration: ['frustrated', 'annoying', 'irritating', 'confusing', 'unclear'],
      satisfaction: ['satisfied', 'happy', 'pleased', 'great', 'excellent'],
      excitement: ['excited', 'amazing', 'awesome', 'fantastic', 'love'],
      concern: ['worried', 'concerned', 'unsure', 'doubt', 'question'],
      gratitude: ['thank', 'grateful', 'appreciate', 'helpful', 'thanks']
    };

    const detectedEmotions = [];
    const lowerText = text.toLowerCase();

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions.push({
          emotion,
          confidence: matches.length / keywords.length,
          triggers: matches
        });
      }
    });

    return detectedEmotions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
     * Calculate overall feedback score
     */
  calculateFeedbackScore(feedbackData, sentiment) {
    let score = 0;
    let factors = 0;

    // Explicit rating
    if (feedbackData.rating) {
      score += feedbackData.rating / 5; // Normalize to 0-1
      factors++;
    }

    // Sentiment score
    if (sentiment.overall) {
      const sentimentScore = this.sentimentToScore(sentiment.overall);
      score += sentimentScore;
      factors++;
    }

    // Engagement indicators
    if (feedbackData.likes || feedbackData.reactions) {
      const engagementScore = this.calculateEngagementScore(feedbackData);
      score += engagementScore;
      factors++;
    }

    // Source weight
    const sourceWeight = this.feedbackSources[feedbackData.source]?.weight || 1;
        
    return factors > 0 ? (score / factors) * sourceWeight : 0;
  }

  /**
     * Convert sentiment to score
     */
  sentimentToScore(sentiment) {
    const sentimentMap = {
      'very_positive': 1.0,
      'positive': 0.8,
      'neutral': 0.6,
      'negative': 0.4,
      'very_negative': 0.2
    };
        
    return sentimentMap[sentiment] || 0.6;
  }

  /**
     * Calculate engagement score
     */
  calculateEngagementScore(feedbackData) {
    let score = 0.6; // Base neutral score
        
    if (feedbackData.likes > 0) {score += 0.2;}
    if (feedbackData.shares > 0) {score += 0.1;}
    if (feedbackData.replies > 0) {score += 0.1;}
        
    return Math.min(score, 1.0);
  }

  /**
     * Categorize feedback
     */
  categorizeFeedback(feedbackData) {
    const text = this.extractFeedbackText(feedbackData).toLowerCase();
    const categories = [];

    const categoryKeywords = {
      content_quality: ['quality', 'accurate', 'correct', 'wrong', 'mistake', 'error'],
      presentation: ['video', 'audio', 'visual', 'slides', 'screen', 'sound'],
      difficulty: ['easy', 'hard', 'difficult', 'complex', 'simple', 'basic'],
      pace: ['fast', 'slow', 'pace', 'speed', 'rushed', 'quick'],
      engagement: ['boring', 'interesting', 'engaging', 'fun', 'dull'],
      technical: ['bug', 'error', 'problem', 'issue', 'broken', 'not working'],
      suggestion: ['suggest', 'recommend', 'should', 'could', 'would be better'],
      praise: ['great', 'excellent', 'amazing', 'fantastic', 'love', 'perfect'],
      complaint: ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointed']
    };

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword));
      if (matches.length > 0) {
        categories.push({
          category,
          confidence: matches.length / keywords.length,
          keywords: matches
        });
      }
    });

    return categories.sort((a, b) => b.confidence - a.confidence);
  }

  /**
     * Extract issues from feedback
     */
  extractIssues(feedbackData, sentiment) {
    const text = this.extractFeedbackText(feedbackData);
    const issues = [];

    // Look for negative sentiment with specific issues
    if (sentiment.overall === 'negative' || sentiment.overall === 'very_negative') {
      const issuePatterns = [
        { pattern: /confusing|unclear|don't understand/i, type: 'clarity', severity: 'medium' },
        { pattern: /wrong|incorrect|mistake|error/i, type: 'accuracy', severity: 'high' },
        { pattern: /too fast|too slow|rushed/i, type: 'pacing', severity: 'low' },
        { pattern: /boring|dull|uninteresting/i, type: 'engagement', severity: 'medium' },
        { pattern: /audio|sound|video quality/i, type: 'technical', severity: 'medium' },
        { pattern: /outdated|old|not current/i, type: 'currency', severity: 'high' }
      ];

      issuePatterns.forEach(({ pattern, type, severity }) => {
        if (pattern.test(text)) {
          issues.push({
            type,
            severity,
            description: this.extractIssueDescription(text, pattern),
            source: feedbackData.source,
            contentId: feedbackData.contentId
          });
        }
      });
    }

    return issues;
  }

  /**
     * Extract issue description
     */
  extractIssueDescription(text, pattern) {
    const sentences = text.split(/[.!?]+/);
    const relevantSentence = sentences.find(sentence => pattern.test(sentence));
    return relevantSentence ? relevantSentence.trim() : 'Issue detected in feedback';
  }

  /**
     * Extract suggestions from feedback
     */
  extractSuggestions(feedbackData) {
    const text = this.extractFeedbackText(feedbackData);
    const suggestions = [];

    const suggestionPatterns = [
      /suggest|recommend|should|could|would be better|maybe|perhaps/i,
      /add|include|cover|explain|show/i,
      /improve|enhance|make better/i
    ];

    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (suggestionPatterns.some(pattern => pattern.test(sentence))) {
        suggestions.push({
          text: sentence.trim(),
          type: this.classifySuggestion(sentence),
          priority: this.prioritizeSuggestion(sentence),
          source: feedbackData.source
        });
      }
    });

    return suggestions;
  }

  /**
     * Classify suggestion type
     */
  classifySuggestion(suggestion) {
    const text = suggestion.toLowerCase();
        
    if (text.includes('add') || text.includes('include') || text.includes('cover')) {
      return 'content_addition';
    }
    if (text.includes('explain') || text.includes('clarify') || text.includes('show')) {
      return 'content_clarification';
    }
    if (text.includes('improve') || text.includes('enhance') || text.includes('better')) {
      return 'content_improvement';
    }
    if (text.includes('example') || text.includes('demo') || text.includes('practice')) {
      return 'practical_example';
    }
        
    return 'general_suggestion';
  }

  /**
     * Prioritize suggestion
     */
  prioritizeSuggestion(suggestion) {
    const text = suggestion.toLowerCase();
        
    // High priority indicators
    if (text.includes('important') || text.includes('critical') || text.includes('must')) {
      return 'high';
    }
        
    // Medium priority indicators
    if (text.includes('should') || text.includes('recommend') || text.includes('better')) {
      return 'medium';
    }
        
    return 'low';
  }

  /**
     * Determine if feedback is actionable
     */
  isActionable(analysis) {
    // High severity issues are always actionable
    if (analysis.issues.some(issue => issue.severity === 'high')) {
      return true;
    }

    // Low scores are actionable
    if (analysis.score < 0.4) {
      return true;
    }

    // Multiple medium issues are actionable
    if (analysis.issues.filter(issue => issue.severity === 'medium').length >= 2) {
      return true;
    }

    // High priority suggestions are actionable
    if (analysis.suggestions.some(suggestion => suggestion.priority === 'high')) {
      return true;
    }

    return false;
  }

  /**
     * Generate action items from analysis
     */
  async generateActionItems(analysis) {
    const actionItems = [];

    // Create action items for issues
    analysis.issues.forEach(issue => {
      actionItems.push({
        id: this.generateActionId(),
        type: 'issue_resolution',
        priority: issue.severity,
        title: `Address ${issue.type} issue`,
        description: issue.description,
        contentId: analysis.contentId,
        source: analysis.source,
        createdAt: moment().toISOString(),
        status: 'open',
        assignedTo: this.getAssigneeForIssue(issue),
        estimatedEffort: this.estimateEffort(issue),
        dueDate: this.calculateDueDate(issue.severity)
      });
    });

    // Create action items for high-priority suggestions
    analysis.suggestions
      .filter(suggestion => suggestion.priority === 'high' || suggestion.priority === 'medium')
      .forEach(suggestion => {
        actionItems.push({
          id: this.generateActionId(),
          type: 'content_improvement',
          priority: suggestion.priority,
          title: `Implement suggestion: ${suggestion.type}`,
          description: suggestion.text,
          contentId: analysis.contentId,
          source: analysis.source,
          createdAt: moment().toISOString(),
          status: 'open',
          assignedTo: this.getAssigneeForSuggestion(suggestion),
          estimatedEffort: this.estimateEffort(suggestion),
          dueDate: this.calculateDueDate(suggestion.priority)
        });
      });

    // Store action items
    this.data.actionItems.push(...actionItems);
        
    return actionItems;
  }

  /**
     * Get assignee for issue
     */
  getAssigneeForIssue(issue) {
    const assigneeMap = {
      'accuracy': 'content_expert',
      'technical': 'technical_team',
      'clarity': 'content_manager',
      'engagement': 'instructional_designer',
      'pacing': 'content_manager',
      'currency': 'content_expert'
    };
        
    return assigneeMap[issue.type] || 'content_manager';
  }

  /**
     * Get assignee for suggestion
     */
  getAssigneeForSuggestion(suggestion) {
    const assigneeMap = {
      'content_addition': 'content_expert',
      'content_clarification': 'content_manager',
      'content_improvement': 'instructional_designer',
      'practical_example': 'content_manager',
      'general_suggestion': 'content_manager'
    };
        
    return assigneeMap[suggestion.type] || 'content_manager';
  }

  /**
     * Estimate effort for action item
     */
  estimateEffort(item) {
    // Simple effort estimation in hours
    if (item.severity === 'high' || item.priority === 'high') {
      return 8; // 1 day
    }
    if (item.severity === 'medium' || item.priority === 'medium') {
      return 4; // Half day
    }
    return 2; // 2 hours
  }

  /**
     * Calculate due date based on priority
     */
  calculateDueDate(priority) {
    const daysMap = {
      'high': 3,
      'medium': 7,
      'low': 14
    };
        
    const days = daysMap[priority] || 7;
    return moment().add(days, 'days').toISOString();
  }

  /**
     * Update metrics
     */
  updateMetrics() {
    const recentFeedback = this.data.analysis.filter(a => 
      moment(a.timestamp).isAfter(moment().subtract(30, 'days'))
    );

    this.data.metrics = {
      totalFeedback: this.data.analysis.length,
      recentFeedback: recentFeedback.length,
      averageRating: this.calculateAverageRating(recentFeedback),
      sentimentDistribution: this.calculateSentimentDistribution(recentFeedback),
      actionablePercentage: this.calculateActionablePercentage(recentFeedback),
      openActionItems: this.data.actionItems.filter(a => a.status === 'open').length,
      bySource: this.groupFeedbackBySource(recentFeedback),
      topIssues: this.getTopIssues(recentFeedback),
      topSuggestions: this.getTopSuggestions(recentFeedback)
    };
  }

  /**
     * Calculate average rating
     */
  calculateAverageRating(feedback) {
    const scores = feedback.map(f => f.score).filter(s => s > 0);
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }

  /**
     * Calculate sentiment distribution
     */
  calculateSentimentDistribution(feedback) {
    const distribution = {};
    feedback.forEach(f => {
      const sentiment = f.sentiment.overall;
      distribution[sentiment] = (distribution[sentiment] || 0) + 1;
    });
    return distribution;
  }

  /**
     * Calculate actionable percentage
     */
  calculateActionablePercentage(feedback) {
    const actionable = feedback.filter(f => f.actionable).length;
    return feedback.length > 0 ? (actionable / feedback.length) * 100 : 0;
  }

  /**
     * Group feedback by source
     */
  groupFeedbackBySource(feedback) {
    const grouped = {};
    feedback.forEach(f => {
      grouped[f.source] = (grouped[f.source] || 0) + 1;
    });
    return grouped;
  }

  /**
     * Get top issues
     */
  getTopIssues(feedback) {
    const issues = {};
    feedback.forEach(f => {
      f.issues.forEach(issue => {
        const key = issue.type;
        issues[key] = (issues[key] || 0) + 1;
      });
    });
        
    return Object.entries(issues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  /**
     * Get top suggestions
     */
  getTopSuggestions(feedback) {
    const suggestions = {};
    feedback.forEach(f => {
      f.suggestions.forEach(suggestion => {
        const key = suggestion.type;
        suggestions[key] = (suggestions[key] || 0) + 1;
      });
    });
        
    return Object.entries(suggestions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  /**
     * Save data
     */
  saveData() {
    fs.ensureDirSync(path.dirname(this.dataPath));
    this.data.lastUpdated = moment().toISOString();
    fs.writeJsonSync(this.dataPath, this.data, { spaces: 2 });
  }

  // ID generators
  generateAnalysisId() {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateActionId() {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
     * Get feedback summary for dashboard
     */
  getFeedbackSummary() {
    this.updateMetrics();
    return {
      metrics: this.data.metrics,
      recentAnalysis: this.data.analysis.slice(-10),
      urgentActionItems: this.data.actionItems.filter(a => 
        a.status === 'open' && a.priority === 'high'
      ),
      trends: this.calculateTrends()
    };
  }

  /**
     * Calculate feedback trends
     */
  calculateTrends() {
    const last30Days = this.data.analysis.filter(a => 
      moment(a.timestamp).isAfter(moment().subtract(30, 'days'))
    );
    const previous30Days = this.data.analysis.filter(a => 
      moment(a.timestamp).isBetween(
        moment().subtract(60, 'days'),
        moment().subtract(30, 'days')
      )
    );

    const currentAvg = this.calculateAverageRating(last30Days);
    const previousAvg = this.calculateAverageRating(previous30Days);

    return {
      ratingTrend: currentAvg - previousAvg,
      volumeTrend: last30Days.length - previous30Days.length,
      actionableTrend: this.calculateActionablePercentage(last30Days) - 
                           this.calculateActionablePercentage(previous30Days)
    };
  }
}

/**
 * Simple Sentiment Analyzer
 */
class SimpleSentimentAnalyzer {
  constructor() {
    this.positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'fantastic', 'wonderful', 'perfect',
      'helpful', 'clear', 'easy', 'love', 'like', 'awesome', 'brilliant', 'outstanding'
    ];
        
    this.negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'confusing',
      'unclear', 'difficult', 'hard', 'boring', 'wrong', 'mistake', 'error'
    ];
  }

  analyze(text) {
    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (this.positiveWords.includes(word)) {positiveCount++;}
      if (this.negativeWords.includes(word)) {negativeCount++;}
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {return 'neutral';}

    const ratio = positiveCount / total;
    if (ratio >= 0.8) {return 'very_positive';}
    if (ratio >= 0.6) {return 'positive';}
    if (ratio >= 0.4) {return 'neutral';}
    if (ratio >= 0.2) {return 'negative';}
    return 'very_negative';
  }

  getConfidence(text) {
    const words = text.toLowerCase().split(/\W+/);
    const sentimentWords = words.filter(word => 
      this.positiveWords.includes(word) || this.negativeWords.includes(word)
    );
        
    return Math.min(sentimentWords.length / Math.max(words.length, 1), 1);
  }
}

module.exports = UserFeedbackIntegrator;