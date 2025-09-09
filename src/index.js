/**
 * Main Analytics API Server for WordPress Integration
 * Provides HTTP API endpoints for WordPress to communicate with analytics system
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { databaseManager } = require('./config/database');
const ContentAnalytics = require('./automation/mcp-integration/content-analytics');

class AnalyticsAPIServer {
  constructor() {
    this.app = express();
    this.port = process.env.API_PORT || 3000;
    this.contentAnalytics = new ContentAnalytics();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize database connections
      await databaseManager.initialize();
            
      // Initialize content analytics
      await this.contentAnalytics.initialize();
            
      // Setup Express middleware
      this.setupMiddleware();
            
      // Setup API routes
      this.setupRoutes();
            
      // Setup error handling
      this.setupErrorHandling();
            
      this.isInitialized = true;
      console.log('✅ Analytics API Server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Analytics API Server:', error);
      throw error;
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['\'self\''],
          styleSrc: ['\'self\'', '\'unsafe-inline\''],
          scriptSrc: ['\'self\''],
          imgSrc: ['\'self\'', 'data:', 'https:'],
        },
      },
    }));

    // CORS configuration for WordPress integration
    this.app.use(cors({
      origin: [
        'http://localhost:8080',
        'http://wordpress:80',
        process.env.WORDPRESS_URL
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const health = await databaseManager.healthCheck();
        const status = health.mysql && health.redis ? 'healthy' : 'unhealthy';
                
        res.status(status === 'healthy' ? 200 : 503).json({
          status,
          timestamp: new Date().toISOString(),
          services: health,
          version: process.env.npm_package_version || '1.0.0'
        });
      } catch (error) {
        res.status(503).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // API v1 routes
    const apiV1 = express.Router();
        
    // Event tracking endpoints
    apiV1.post('/events/track', this.trackEvent.bind(this));
    apiV1.post('/events/batch', this.trackBatchEvents.bind(this));
        
    // User management endpoints
    apiV1.post('/users/register', this.registerUser.bind(this));
    apiV1.get('/users/:id/journey', this.getUserJourney.bind(this));
        
    // Purchase tracking endpoints
    apiV1.post('/purchases/track', this.trackPurchase.bind(this));
        
    // Analytics endpoints
    apiV1.get('/analytics/dashboard', this.getDashboard.bind(this));
    apiV1.get('/analytics/reports/:type', this.getReport.bind(this));
        
    // Content performance endpoints
    apiV1.get('/content/:id/performance', this.getContentPerformance.bind(this));
    apiV1.post('/content/:id/performance', this.updateContentPerformance.bind(this));
        
    this.app.use('/api/v1', apiV1);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'PMP Analytics API',
        version: process.env.npm_package_version || '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          api: '/api/v1',
          docs: '/api/v1/docs'
        }
      });
    });
  }

  // Event tracking endpoint
  async trackEvent(req, res) {
    try {
      const eventData = req.body;
            
      // Validate required fields
      if (!eventData.event_type || !eventData.timestamp) {
        return res.status(400).json({
          error: 'Missing required fields: event_type, timestamp'
        });
      }

      // Add server-side data
      eventData.id = require('uuid').v4();
      eventData.platform = 'wordpress';
      eventData.processed = false;
      eventData.created_at = new Date().toISOString();

      // Store event in database
      await databaseManager.executeMySQL(
        `INSERT INTO events (id, timestamp, user_id, session_id, event_type, event_category, 
                 platform, source, page_url, referrer, utm_parameters, event_data, processed, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventData.id,
          eventData.timestamp,
          eventData.user_id || null,
          eventData.session_id || null,
          eventData.event_type,
          eventData.event_category || null,
          eventData.platform,
          eventData.source || null,
          eventData.page_url || null,
          eventData.referrer || null,
          JSON.stringify(eventData.utm_parameters || {}),
          JSON.stringify(eventData.event_data || {}),
          eventData.processed,
          eventData.created_at
        ]
      );

      res.status(201).json({
        success: true,
        event_id: eventData.id,
        message: 'Event tracked successfully'
      });

    } catch (error) {
      console.error('Error tracking event:', error);
      res.status(500).json({
        error: 'Failed to track event',
        message: error.message
      });
    }
  }

  // Batch event tracking
  async trackBatchEvents(req, res) {
    try {
      const events = req.body.events || [];
            
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
          error: 'Invalid events array'
        });
      }

      const results = [];
      for (const event of events) {
        try {
          // Process each event (similar to trackEvent)
          event.id = require('uuid').v4();
          event.platform = 'wordpress';
          event.created_at = new Date().toISOString();
                    
          await databaseManager.executeMySQL(
            `INSERT INTO events (id, timestamp, user_id, session_id, event_type, event_category, 
                         platform, source, page_url, referrer, utm_parameters, event_data, processed, created_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              event.id,
              event.timestamp,
              event.user_id || null,
              event.session_id || null,
              event.event_type,
              event.event_category || null,
              event.platform,
              event.source || null,
              event.page_url || null,
              event.referrer || null,
              JSON.stringify(event.utm_parameters || {}),
              JSON.stringify(event.event_data || {}),
              false,
              event.created_at
            ]
          );

          results.push({ success: true, event_id: event.id });
        } catch (error) {
          results.push({ success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        processed: results.length,
        results
      });

    } catch (error) {
      console.error('Error tracking batch events:', error);
      res.status(500).json({
        error: 'Failed to track batch events',
        message: error.message
      });
    }
  }

  // User registration endpoint
  async registerUser(req, res) {
    try {
      const userData = req.body;
            
      if (!userData.email) {
        return res.status(400).json({
          error: 'Email is required'
        });
      }

      const userId = require('uuid').v4();
      const now = new Date().toISOString();

      await databaseManager.executeMySQL(
        `INSERT INTO users (id, wordpress_id, email, first_name, last_name, 
                 registration_date, user_type, utm_attribution, preferences, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          userData.wordpress_id || null,
          userData.email,
          userData.first_name || null,
          userData.last_name || null,
          now,
          userData.user_type || 'prospect',
          JSON.stringify(userData.utm_attribution || {}),
          JSON.stringify(userData.preferences || {}),
          now,
          now
        ]
      );

      res.status(201).json({
        success: true,
        user_id: userId,
        message: 'User registered successfully'
      });

    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({
        error: 'Failed to register user',
        message: error.message
      });
    }
  }

  // Purchase tracking endpoint
  async trackPurchase(req, res) {
    try {
      const purchaseData = req.body;
            
      if (!purchaseData.user_id || !purchaseData.amount) {
        return res.status(400).json({
          error: 'Missing required fields: user_id, amount'
        });
      }

      const purchaseId = require('uuid').v4();
      const now = new Date().toISOString();

      await databaseManager.executeMySQL(
        `INSERT INTO purchases (id, timestamp, user_id, wordpress_order_id, product_id, 
                 product_name, product_type, amount, currency, payment_method, payment_status, 
                 utm_attribution, billing_data, metadata, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseId,
          purchaseData.timestamp || now,
          purchaseData.user_id,
          purchaseData.wordpress_order_id || null,
          purchaseData.product_id || null,
          purchaseData.product_name || null,
          purchaseData.product_type || 'course',
          purchaseData.amount,
          purchaseData.currency || 'USD',
          purchaseData.payment_method || null,
          purchaseData.payment_status || 'completed',
          JSON.stringify(purchaseData.utm_attribution || {}),
          JSON.stringify(purchaseData.billing_data || {}),
          JSON.stringify(purchaseData.metadata || {}),
          now,
          now
        ]
      );

      res.status(201).json({
        success: true,
        purchase_id: purchaseId,
        message: 'Purchase tracked successfully'
      });

    } catch (error) {
      console.error('Error tracking purchase:', error);
      res.status(500).json({
        error: 'Failed to track purchase',
        message: error.message
      });
    }
  }

  // Dashboard endpoint
  async getDashboard(req, res) {
    try {
      const dashboard = {
        timestamp: new Date().toISOString(),
        summary: {
          total_users: await this.getTotalUsers(),
          total_events: await this.getTotalEvents(),
          total_revenue: await this.getTotalRevenue(),
          active_sessions: await this.getActiveSessions()
        },
        recent_activity: await this.getRecentActivity(),
        top_content: await this.getTopContent()
      };

      res.json(dashboard);

    } catch (error) {
      console.error('Error generating dashboard:', error);
      res.status(500).json({
        error: 'Failed to generate dashboard',
        message: error.message
      });
    }
  }

  // Helper methods for dashboard data
  async getTotalUsers() {
    const result = await databaseManager.executeMySQL('SELECT COUNT(*) as count FROM users');
    return result[0]?.count || 0;
  }

  async getTotalEvents() {
    const result = await databaseManager.executeMySQL('SELECT COUNT(*) as count FROM events');
    return result[0]?.count || 0;
  }

  async getTotalRevenue() {
    const result = await databaseManager.executeMySQL(
      'SELECT SUM(amount) as total FROM purchases WHERE payment_status = "completed"'
    );
    return result[0]?.total || 0;
  }

  async getActiveSessions() {
    // Get sessions active in last hour
    const result = await databaseManager.executeMySQL(
      'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)'
    );
    return result[0]?.count || 0;
  }

  async getRecentActivity() {
    return await databaseManager.executeMySQL(
      'SELECT event_type, COUNT(*) as count FROM events WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY event_type ORDER BY count DESC LIMIT 10'
    );
  }

  async getTopContent() {
    return await databaseManager.executeMySQL(
      'SELECT page_url, COUNT(*) as views FROM events WHERE event_type = "page_view" AND timestamp > DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY page_url ORDER BY views DESC LIMIT 10'
    );
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });
  }

  async start() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const server = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🚀 Analytics API Server running on port ${this.port}`);
          console.log(`📊 Health check: http://localhost:${this.port}/health`);
          console.log(`🔗 API docs: http://localhost:${this.port}/api/v1`);
          resolve(server);
        }
      });

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        console.log('🔄 Shutting down gracefully...');
        server.close(async () => {
          await databaseManager.close();
          process.exit(0);
        });
      });
    });
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new AnalyticsAPIServer();
  server.start().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = AnalyticsAPIServer;