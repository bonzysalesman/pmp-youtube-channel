/**
 * WordPress Analytics API Server
 * Express server to handle WordPress analytics events and webhooks
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WordPressAnalyticsBridge = require('./wordpress-analytics-bridge');

class WordPressAnalyticsAPIServer {
  constructor(options = {}) {
    this.app = express();
    this.port = options.port || process.env.WORDPRESS_API_PORT || 3001;
    this.bridge = new WordPressAnalyticsBridge();
    this.isRunning = false;

    // WordPress plugin authentication
    this.wordpressApiKeys = new Map();
    this.initializeWordPressAuth();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Initialize WordPress plugin authentication
   */
  initializeWordPressAuth() {
    // Load WordPress API keys from environment or database
    const defaultApiKey = process.env.WORDPRESS_PLUGIN_API_KEY || 'wp_default_key_' + Date.now();

    this.wordpressApiKeys.set('pmp-analytics-plugin', {
      api_key: defaultApiKey,
      permissions: ['track_events', 'manage_users', 'view_analytics'],
      created_at: new Date().toISOString(),
      last_used: null,
      active: true
    });

    console.log('🔐 WordPress plugin authentication initialized');
  }

  /**
   * Set up Express middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // WordPress plugin authentication middleware
    this.app.use('/api/v1', this.authenticateWordPressPlugin.bind(this));
  }

  /**
   * WordPress plugin authentication middleware
   */
  authenticateWordPressPlugin(req, res, next) {
    // Skip authentication for health check and root endpoints
    if (req.path === '/health' || req.path === '/' || req.path === '/api/v1/docs') {
      return next();
    }

    const apiKey = req.headers['x-wp-api-key'];
    const pluginId = req.headers['x-wp-plugin-id'] || 'pmp-analytics-plugin';
    const wpNonce = req.headers['x-wp-nonce'];

    // Check for API key
    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'WordPress API key is required',
        code: 'WP_AUTH_MISSING_API_KEY'
      });
    }

    // Validate API key
    const pluginAuth = this.wordpressApiKeys.get(pluginId);
    if (!pluginAuth || !pluginAuth.active) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid WordPress plugin ID',
        code: 'WP_AUTH_INVALID_PLUGIN'
      });
    }

    if (pluginAuth.api_key !== apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid WordPress API key',
        code: 'WP_AUTH_INVALID_KEY'
      });
    }

    // Validate WordPress nonce for additional security
    if (wpNonce && !this.validateWordPressNonce(wpNonce, pluginId)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid WordPress nonce',
        code: 'WP_AUTH_INVALID_NONCE'
      });
    }

    // Update last used timestamp
    pluginAuth.last_used = new Date().toISOString();

    // Add plugin info to request
    req.wordpressPlugin = {
      plugin_id: pluginId,
      permissions: pluginAuth.permissions,
      authenticated_at: new Date().toISOString()
    };

    next();
  }

  /**
   * Validate WordPress nonce
   */
  validateWordPressNonce(nonce, pluginId) {
    // In a real implementation, this would validate against WordPress nonce system
    // For now, we'll do basic validation
    if (!nonce || nonce.length < 10) {
      return false;
    }

    // Check if nonce follows WordPress pattern
    const noncePattern = /^[a-f0-9]{10}$/;
    return noncePattern.test(nonce);
  }

  /**
   * Set up API routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        bridge_initialized: this.bridge.isInitialized
      });
    });

    // API v1 routes
    const apiV1 = express.Router();

    // Event tracking endpoints
    apiV1.post('/events/track', this.handleTrackEvent.bind(this));
    apiV1.post('/events/batch', this.handleBatchEvents.bind(this));

    // User management endpoints
    apiV1.post('/users/register', this.handleUserRegistration.bind(this));
    apiV1.get('/users/:id/journey', this.handleGetUserJourney.bind(this));
    apiV1.delete('/users/:id/delete', this.handleDeleteUser.bind(this));

    // Purchase tracking endpoints
    apiV1.post('/purchases/track', this.handleTrackPurchase.bind(this));

    // Conversion tracking endpoints
    apiV1.post('/conversions/track', this.handleTrackConversion.bind(this));

    // Journey tracking endpoints
    apiV1.post('/journey/touchpoint', this.handleTrackTouchpoint.bind(this));

    // Analytics endpoints
    apiV1.get('/analytics/dashboard', this.handleGetDashboard.bind(this));
    apiV1.get('/analytics/reports', this.handleGetReports.bind(this));

    // Course performance endpoints
    apiV1.get('/courses/:id/performance', this.handleGetCoursePerformance.bind(this));

    // Webhook endpoints
    apiV1.post('/webhooks/wordpress/events', this.bridge.handleWordPressEventWebhook.bind(this.bridge));
    apiV1.post('/webhooks/wordpress/users', this.bridge.handleWordPressUserWebhook.bind(this.bridge));
    apiV1.post('/webhooks/wordpress/orders', this.bridge.handleWordPressOrderWebhook.bind(this.bridge));
    apiV1.post('/webhooks/wordpress/content', this.bridge.handleWordPressContentWebhook.bind(this.bridge));

    this.app.use('/api/v1', apiV1);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'WordPress Analytics API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          api: '/api/v1',
          documentation: '/api/v1/docs'
        }
      });
    });
  }

  /**
   * Set up error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('API Error:', err);

      res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Initialize the WordPress bridge
      await this.bridge.initialize();

      // Start the Express server
      this.server = this.app.listen(this.port, () => {
        console.log(`🚀 WordPress Analytics API Server running on port ${this.port}`);
        this.isRunning = true;
      });

      // Handle graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));

      return this.server;
    } catch (error) {
      console.error('❌ Failed to start WordPress Analytics API Server:', error);
      throw error;
    }
  }

  /**
   * Stop the server
   */
  async shutdown() {
    console.log('🛑 Shutting down WordPress Analytics API Server...');

    if (this.server) {
      this.server.close(() => {
        console.log('✅ WordPress Analytics API Server stopped');
        this.isRunning = false;
        process.exit(0);
      });
    }
  }

  /**
   * API endpoint handlers
   */
  async handleTrackEvent(req, res) {
    try {
      const eventData = req.body;

      // Validate WordPress event data
      const validationResult = this.validateWordPressEventData(eventData);
      if (!validationResult.valid) {
        return res.status(400).json({
          error: 'Bad Request',
          message: validationResult.message,
          code: 'WP_EVENT_VALIDATION_FAILED',
          details: validationResult.errors
        });
      }

      // Add server-side metadata
      eventData.server_timestamp = new Date().toISOString();
      eventData.ip_address = req.ip;
      eventData.user_agent = req.get('User-Agent');
      eventData.plugin_id = req.wordpressPlugin.plugin_id;

      // Process the event
      const result = await this.bridge.processWordPressEvent(eventData);

      res.json({
        success: true,
        event_id: this.generateEventId(),
        result: result,
        processed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Track event error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        code: 'WP_EVENT_PROCESSING_ERROR'
      });
    }
  }

  /**
   * Validate WordPress event data
   */
  validateWordPressEventData(eventData) {
    const errors = [];

    // Check required fields
    if (!eventData.event_type) {
      errors.push('event_type is required');
    }

    if (!eventData.timestamp) {
      errors.push('timestamp is required');
    }

    // Validate timestamp format
    if (eventData.timestamp && !this.isValidTimestamp(eventData.timestamp)) {
      errors.push('timestamp must be a valid ISO 8601 date string');
    }

    // Validate WordPress-specific event types
    const validWordPressEvents = [
      'page_view', 'user_registration', 'user_login', 'user_logout',
      'course_enrollment', 'course_progress', 'course_completion',
      'purchase_initiated', 'purchase_completed', 'purchase_failed',
      'lead_capture', 'form_submission', 'content_download',
      'email_subscription', 'comment_posted', 'search_performed',
      'session_start', 'session_end', 'cart_abandoned', 'refund_processed'
    ];

    if (eventData.event_type && !validWordPressEvents.includes(eventData.event_type)) {
      errors.push(`event_type '${eventData.event_type}' is not a valid WordPress event type`);
    }

    // Event-specific validation
    if (eventData.event_type) {
      const eventSpecificErrors = this.validateEventSpecificFields(eventData);
      errors.push(...eventSpecificErrors);
    }

    // Validate email format if present
    if (eventData.email && !this.isValidEmail(eventData.email)) {
      errors.push('email must be a valid email address');
    }

    // Validate user_id format if present
    if (eventData.user_id && typeof eventData.user_id !== 'string') {
      errors.push('user_id must be a string');
    }

    // Validate numeric fields
    if (eventData.total && (isNaN(parseFloat(eventData.total)) || parseFloat(eventData.total) < 0)) {
      errors.push('total must be a valid positive number');
    }

    return {
      valid: errors.length === 0,
      message: errors.length > 0 ? 'Event validation failed' : 'Event validation passed',
      errors: errors
    };
  }

  /**
   * Validate event-specific required fields
   */
  validateEventSpecificFields(eventData) {
    const errors = [];
    const eventType = eventData.event_type;

    switch (eventType) {
      case 'page_view':
        if (!eventData.page_url) errors.push('page_url is required for page_view events');
        if (!eventData.session_id) errors.push('session_id is required for page_view events');
        break;

      case 'user_registration':
        if (!eventData.user_id) errors.push('user_id is required for user_registration events');
        if (!eventData.email) errors.push('email is required for user_registration events');
        break;

      case 'course_enrollment':
        if (!eventData.user_id) errors.push('user_id is required for course_enrollment events');
        if (!eventData.course_id) errors.push('course_id is required for course_enrollment events');
        break;

      case 'purchase_completed':
        if (!eventData.user_id) errors.push('user_id is required for purchase_completed events');
        if (!eventData.order_id) errors.push('order_id is required for purchase_completed events');
        if (!eventData.total) errors.push('total is required for purchase_completed events');
        break;

      case 'lead_capture':
        if (!eventData.email) errors.push('email is required for lead_capture events');
        if (!eventData.lead_magnet_type) errors.push('lead_magnet_type is required for lead_capture events');
        break;

      case 'form_submission':
        if (!eventData.form_id) errors.push('form_id is required for form_submission events');
        break;

      case 'search_performed':
        if (!eventData.search_query) errors.push('search_query is required for search_performed events');
        break;
    }

    return errors;
  }

  async handleBatchEvents(req, res) {
    try {
      const { events } = req.body;

      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'events array is required and must not be empty',
          code: 'WP_BATCH_INVALID_INPUT'
        });
      }

      // Validate batch size
      if (events.length > 100) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Batch size cannot exceed 100 events',
          code: 'WP_BATCH_SIZE_EXCEEDED'
        });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < events.length; i++) {
        const eventData = events[i];

        try {
          // Validate each event
          const validationResult = this.validateWordPressEventData(eventData);
          if (!validationResult.valid) {
            errors.push({
              index: i,
              event_type: eventData.event_type,
              success: false,
              error: 'Validation failed',
              details: validationResult.errors
            });
            continue;
          }

          // Add server-side metadata
          eventData.server_timestamp = new Date().toISOString();
          eventData.ip_address = req.ip;
          eventData.user_agent = req.get('User-Agent');
          eventData.plugin_id = req.wordpressPlugin.plugin_id;

          const result = await this.bridge.processWordPressEvent(eventData);
          results.push({
            index: i,
            event_type: eventData.event_type,
            success: true,
            event_id: this.generateEventId(),
            result: result
          });
        } catch (error) {
          errors.push({
            index: i,
            event_type: eventData.event_type,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        total_events: events.length,
        processed: results.length,
        failed: errors.length,
        results: results,
        errors: errors,
        processed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Batch events error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        code: 'WP_BATCH_PROCESSING_ERROR'
      });
    }
  }

  async handleUserRegistration(req, res) {
    try {
      const userData = req.body;

      // Validate required fields
      if (!userData.email) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'email is required'
        });
      }

      // Process user registration
      const result = await this.bridge.processWordPressEvent({
        event_type: 'user_registration',
        ...userData,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        user_id: userData.user_id || this.generateUserId(),
        result: result
      });
    } catch (error) {
      console.error('❌ User registration error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleGetUserJourney(req, res) {
    try {
      const userId = req.params.id;

      // This would fetch user journey data from the analytics database
      const journey = await this.getUserJourneyData(userId);

      res.json({
        success: true,
        user_id: userId,
        journey: journey
      });
    } catch (error) {
      console.error('❌ Get user journey error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleDeleteUser(req, res) {
    try {
      const userId = req.params.id;

      // Process user deletion (GDPR compliance)
      await this.bridge.processWordPressEvent({
        event_type: 'user_deletion',
        user_id: userId,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'User data deletion initiated'
      });
    } catch (error) {
      console.error('❌ Delete user error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleTrackPurchase(req, res) {
    try {
      const purchaseData = req.body;

      // Validate required fields
      if (!purchaseData.order_id || !purchaseData.total) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'order_id and total are required'
        });
      }

      // Process purchase
      const result = await this.bridge.processWordPressEvent({
        event_type: 'purchase_completed',
        ...purchaseData,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        order_id: purchaseData.order_id,
        result: result
      });
    } catch (error) {
      console.error('❌ Track purchase error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleTrackConversion(req, res) {
    try {
      const conversionData = req.body;

      // Process conversion
      const result = await this.bridge.processWordPressEvent({
        event_type: 'conversion',
        ...conversionData,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        result: result
      });
    } catch (error) {
      console.error('❌ Track conversion error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleTrackTouchpoint(req, res) {
    try {
      const touchpointData = req.body;

      // Process touchpoint
      const result = await this.bridge.processWordPressEvent({
        event_type: 'journey_touchpoint',
        ...touchpointData,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        result: result
      });
    } catch (error) {
      console.error('❌ Track touchpoint error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleGetDashboard(req, res) {
    try {
      const params = req.query;

      // Generate dashboard data
      const dashboard = await this.generateDashboardData(params);

      res.json({
        success: true,
        dashboard: dashboard
      });
    } catch (error) {
      console.error('❌ Get dashboard error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleGetReports(req, res) {
    try {
      const { type, ...params } = req.query;

      // Generate report data
      const report = await this.generateReportData(type, params);

      res.json({
        success: true,
        report_type: type,
        report: report
      });
    } catch (error) {
      console.error('❌ Get reports error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async handleGetCoursePerformance(req, res) {
    try {
      const courseId = req.params.id;

      // Get course performance data
      const performance = await this.getCoursePerformanceData(courseId);

      res.json({
        success: true,
        course_id: courseId,
        performance: performance
      });
    } catch (error) {
      console.error('❌ Get course performance error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * Helper methods
   */
  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateUserId() {
    return 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getUserJourneyData(userId) {
    // This would fetch actual user journey data from the database
    return {
      user_id: userId,
      stages: ['awareness', 'interest', 'consideration'],
      touchpoints: [
        { stage: 'awareness', touchpoint: 'page_view', timestamp: new Date().toISOString() }
      ],
      conversion_events: [],
      total_value: 0
    };
  }

  async generateDashboardData(params) {
    // This would generate actual dashboard data
    return {
      summary: {
        page_views_today: 150,
        unique_visitors: 75,
        conversions: 5,
        revenue: 299.95
      },
      recent_events: [
        { event_type: 'page_view', user_id: 'usr_123', created_at: new Date().toISOString() }
      ]
    };
  }

  async generateReportData(type, params) {
    // This would generate actual report data based on type
    return {
      type: type,
      period: params.period || 'last_7_days',
      data: {
        total_events: 1000,
        unique_users: 250,
        conversion_rate: 0.05
      }
    };
  }

  async getCoursePerformanceData(courseId) {
    // This would fetch actual course performance data
    return {
      course_id: courseId,
      enrollments: 50,
      completion_rate: 0.75,
      average_rating: 4.5,
      revenue: 2499.50
    };
  }

  // Helper validation methods
  isValidTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date instanceof Date && !isNaN(date);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Register new WordPress plugin
   */
  async registerWordPressPlugin(pluginId, permissions = []) {
    const apiKey = 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);

    this.wordpressApiKeys.set(pluginId, {
      api_key: apiKey,
      permissions: permissions.length > 0 ? permissions : ['track_events', 'view_analytics'],
      created_at: new Date().toISOString(),
      last_used: null,
      active: true
    });

    console.log(`🔐 Registered WordPress plugin: ${pluginId}`);
    return { plugin_id: pluginId, api_key: apiKey };
  }

  /**
   * Revoke WordPress plugin access
   */
  async revokeWordPressPlugin(pluginId) {
    const plugin = this.wordpressApiKeys.get(pluginId);
    if (plugin) {
      plugin.active = false;
      plugin.revoked_at = new Date().toISOString();
      console.log(`🚫 Revoked WordPress plugin access: ${pluginId}`);
      return true;
    }
    return false;
  }
}

// Export for use in other modules
module.exports = WordPressAnalyticsAPIServer;

// Start server if run directly
if (require.main === module) {
  const server = new WordPressAnalyticsAPIServer();

  server.start()
    .then(() => {
      console.log('🎉 WordPress Analytics API Server started successfully!');
    })
    .catch(error => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
}