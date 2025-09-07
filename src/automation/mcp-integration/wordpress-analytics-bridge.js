/**
 * WordPress Analytics Bridge
 * Collects analytics data from WordPress and integrates with existing analytics system
 * Handles real-time event processing and data synchronization
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

class WordPressAnalyticsBridge {
  constructor() {
    this.dataPath = path.join(__dirname, '../../generated/analytics');
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'wordpress',
      password: process.env.DB_PASSWORD || 'wordpress_password',
      database: process.env.DB_NAME || 'pmp_wordpress'
    };
    this.analyticsApiUrl = process.env.ANALYTICS_API_URL || 'http://localhost:3000/api';
    this.connection = null;
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Initialize database connection and ensure analytics directory exists
   */
  async initialize() {
    try {
      this.connection = await mysql.createConnection(this.dbConfig);
      await fs.ensureDir(this.dataPath);
      console.log('WordPress Analytics Bridge initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WordPress Analytics Bridge:', error);
      throw error;
    }
  }

  /**
   * Collect comprehensive WordPress analytics data
   */
  async collectWordPressAnalytics(dateRange = { startDate: '30 days ago', endDate: 'now' }) {
    try {
      const analytics = {
        timestamp: new Date().toISOString(),
        dateRange,
        pageViews: await this.collectPageViewData(dateRange),
        userEngagement: await this.collectUserEngagementData(dateRange),
        conversions: await this.collectConversionData(dateRange),
        ecommerce: await this.collectEcommerceData(dateRange),
        userJourney: await this.collectUserJourneyData(dateRange),
        realTimeMetrics: await this.collectRealTimeMetrics()
      };

      // Save WordPress analytics data
      const filename = `wordpress-analytics-${new Date().toISOString().split('T')[0]}.json`;
      await fs.writeJson(path.join(this.dataPath, filename), analytics, { spaces: 2 });

      return analytics;
    } catch (error) {
      console.error('WordPress analytics collection failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Collect page view data from WordPress
   */
  async collectPageViewData(dateRange) {
    try {
      const query = `
        SELECT 
          DATE(timestamp) as date,
          page_url,
          COUNT(*) as views,
          COUNT(DISTINCT user_id) as unique_views,
          COUNT(DISTINCT session_id) as sessions
        FROM events 
        WHERE event_type = 'page_view' 
          AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(timestamp), page_url
        ORDER BY date DESC, views DESC
      `;

      const [rows] = await this.connection.execute(query);
      
      const totalViews = rows.reduce((sum, row) => sum + row.views, 0);
      const uniqueViews = rows.reduce((sum, row) => sum + row.unique_views, 0);
      
      const byPage = {};
      const trending = [];
      
      rows.forEach(row => {
        if (!byPage[row.page_url]) {
          byPage[row.page_url] = 0;
        }
        byPage[row.page_url] += row.views;
      });

      // Get trending pages (top 10 by views)
      const sortedPages = Object.entries(byPage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([url, views]) => ({ url, views }));

      return {
        total: totalViews,
        unique: uniqueViews,
        byPage,
        trending: sortedPages,
        dailyBreakdown: this.groupByDate(rows)
      };
    } catch (error) {
      console.error('Page view data collection failed:', error);
      return { total: 0, unique: 0, byPage: {}, trending: [] };
    }
  }

  /**
   * Collect user engagement metrics
   */
  async collectUserEngagementData(dateRange) {
    try {
      const sessionQuery = `
        SELECT 
          session_id,
          MIN(timestamp) as session_start,
          MAX(timestamp) as session_end,
          COUNT(*) as page_views,
          COUNT(DISTINCT page_url) as unique_pages
        FROM events 
        WHERE event_type = 'page_view' 
          AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY session_id
      `;

      const [sessions] = await this.connection.execute(sessionQuery);
      
      let totalSessionDuration = 0;
      let totalPageViews = 0;
      let bouncedSessions = 0;

      sessions.forEach(session => {
        const duration = new Date(session.session_end) - new Date(session.session_start);
        totalSessionDuration += duration / 1000; // Convert to seconds
        totalPageViews += session.page_views;
        
        if (session.page_views === 1) {
          bouncedSessions++;
        }
      });

      const avgSessionDuration = sessions.length > 0 ? totalSessionDuration / sessions.length : 0;
      const pagesPerSession = sessions.length > 0 ? totalPageViews / sessions.length : 0;
      const bounceRate = sessions.length > 0 ? bouncedSessions / sessions.length : 0;

      return {
        sessions: sessions.length,
        avgSessionDuration: Math.round(avgSessionDuration),
        bounceRate: Math.round(bounceRate * 100) / 100,
        pagesPerSession: Math.round(pagesPerSession * 100) / 100
      };
    } catch (error) {
      console.error('User engagement data collection failed:', error);
      return { sessions: 0, avgSessionDuration: 0, bounceRate: 0, pagesPerSession: 0 };
    }
  }

  /**
   * Collect conversion data
   */
  async collectConversionData(dateRange) {
    try {
      const conversionQuery = `
        SELECT 
          event_type,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM events 
        WHERE event_type IN ('lead_capture', 'course_signup', 'purchase')
          AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY event_type
      `;

      const [conversions] = await this.connection.execute(conversionQuery);
      
      const conversionData = {
        leadMagnets: 0,
        courseSignups: 0,
        purchases: 0,
        conversionRate: 0
      };

      conversions.forEach(row => {
        switch (row.event_type) {
          case 'lead_capture':
            conversionData.leadMagnets = row.count;
            break;
          case 'course_signup':
            conversionData.courseSignups = row.count;
            break;
          case 'purchase':
            conversionData.purchases = row.count;
            break;
        }
      });

      // Calculate overall conversion rate
      const totalVisitorsQuery = `
        SELECT COUNT(DISTINCT session_id) as visitors
        FROM events 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      
      const [visitorResult] = await this.connection.execute(totalVisitorsQuery);
      const totalVisitors = visitorResult[0]?.visitors || 0;
      const totalConversions = conversionData.leadMagnets + conversionData.courseSignups + conversionData.purchases;
      
      conversionData.conversionRate = totalVisitors > 0 ? totalConversions / totalVisitors : 0;

      return conversionData;
    } catch (error) {
      console.error('Conversion data collection failed:', error);
      return { leadMagnets: 0, courseSignups: 0, purchases: 0, conversionRate: 0 };
    }
  }

  /**
   * Collect e-commerce data from WooCommerce
   */
  async collectEcommerceData(dateRange) {
    try {
      const ecommerceQuery = `
        SELECT 
          SUM(amount) as total_revenue,
          COUNT(*) as total_orders,
          AVG(amount) as avg_order_value,
          product_name,
          COUNT(*) as product_sales
        FROM purchases 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND payment_status = 'completed'
        GROUP BY product_name
        ORDER BY product_sales DESC
      `;

      const [orders] = await this.connection.execute(ecommerceQuery);
      
      let totalRevenue = 0;
      let totalOrders = 0;
      const topProducts = [];

      orders.forEach(order => {
        totalRevenue += parseFloat(order.total_revenue || 0);
        totalOrders += parseInt(order.total_orders || 0);
        
        if (order.product_name) {
          topProducts.push({
            name: order.product_name,
            sales: order.product_sales,
            revenue: order.total_revenue
          });
        }
      });

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        revenue: totalRevenue,
        orders: totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        topProducts: topProducts.slice(0, 5)
      };
    } catch (error) {
      console.error('E-commerce data collection failed:', error);
      return { revenue: 0, orders: 0, averageOrderValue: 0, topProducts: [] };
    }
  }

  /**
   * Collect user journey data
   */
  async collectUserJourneyData(dateRange) {
    try {
      // Entry points analysis
      const entryQuery = `
        SELECT 
          JSON_EXTRACT(utm_parameters, '$.source') as source,
          COUNT(*) as count
        FROM events 
        WHERE event_type = 'page_view' 
          AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND JSON_EXTRACT(utm_parameters, '$.source') IS NOT NULL
        GROUP BY source
        ORDER BY count DESC
      `;

      const [entryPoints] = await this.connection.execute(entryQuery);
      
      // Exit points analysis
      const exitQuery = `
        SELECT 
          page_url,
          COUNT(*) as exit_count
        FROM (
          SELECT 
            session_id,
            page_url,
            timestamp,
            ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY timestamp DESC) as rn
          FROM events 
          WHERE event_type = 'page_view' 
            AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ) last_pages
        WHERE rn = 1
        GROUP BY page_url
        ORDER BY exit_count DESC
      `;

      const [exitPoints] = await this.connection.execute(exitQuery);

      // Conversion paths analysis
      const pathQuery = `
        SELECT 
          user_id,
          GROUP_CONCAT(
            CONCAT(event_type, ':', page_url) 
            ORDER BY timestamp 
            SEPARATOR ' -> '
          ) as conversion_path
        FROM events 
        WHERE user_id IN (
          SELECT DISTINCT user_id 
          FROM events 
          WHERE event_type IN ('purchase', 'course_signup')
            AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        )
        GROUP BY user_id
      `;

      const [conversionPaths] = await this.connection.execute(pathQuery);

      return {
        entryPoints: this.formatEntryPoints(entryPoints),
        exitPoints: this.formatExitPoints(exitPoints),
        conversionPaths: conversionPaths.map(row => row.conversion_path),
        dropoffPoints: await this.analyzeDropoffPoints()
      };
    } catch (error) {
      console.error('User journey data collection failed:', error);
      return { entryPoints: {}, exitPoints: {}, conversionPaths: [], dropoffPoints: {} };
    }
  }

  /**
   * Collect real-time metrics
   */
  async collectRealTimeMetrics() {
    try {
      // Active users in last 5 minutes
      const activeUsersQuery = `
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM events 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      `;

      const [activeUsers] = await this.connection.execute(activeUsersQuery);

      // Current page views in last hour
      const currentPageViewsQuery = `
        SELECT COUNT(*) as current_views
        FROM events 
        WHERE event_type = 'page_view' 
          AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;

      const [currentViews] = await this.connection.execute(currentPageViewsQuery);

      // Live conversions in last hour
      const liveConversionsQuery = `
        SELECT COUNT(*) as live_conversions
        FROM events 
        WHERE event_type IN ('lead_capture', 'purchase', 'course_signup')
          AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `;

      const [liveConversions] = await this.connection.execute(liveConversionsQuery);

      return {
        activeUsers: activeUsers[0]?.active_users || 0,
        currentPageViews: currentViews[0]?.current_views || 0,
        liveConversions: liveConversions[0]?.live_conversions || 0
      };
    } catch (error) {
      console.error('Real-time metrics collection failed:', error);
      return { activeUsers: 0, currentPageViews: 0, liveConversions: 0 };
    }
  }

  /**
   * Process and queue WordPress events for analytics
   */
  async processWordPressEvent(eventData) {
    try {
      // Validate event data
      if (!this.validateEventData(eventData)) {
        throw new Error('Invalid event data');
      }

      // Add to event queue
      this.eventQueue.push({
        ...eventData,
        timestamp: new Date().toISOString(),
        platform: 'wordpress'
      });

      // Process queue if not already processing
      if (!this.isProcessing) {
        await this.processEventQueue();
      }

      return { success: true, eventId: eventData.id };
    } catch (error) {
      console.error('WordPress event processing failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process event queue and send to analytics API
   */
  async processEventQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        
        // Store in database
        await this.storeEventInDatabase(event);
        
        // Send to analytics API
        await this.sendToAnalyticsAPI(event);
        
        // Small delay to prevent overwhelming the API
        await this.delay(100);
      }
    } catch (error) {
      console.error('Event queue processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Store event in WordPress database
   */
  async storeEventInDatabase(event) {
    try {
      const query = `
        INSERT INTO events (
          id, timestamp, user_id, session_id, event_type, 
          event_category, platform, source, page_url, 
          referrer, utm_parameters, event_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        event.id || this.generateEventId(),
        event.timestamp,
        event.user_id || null,
        event.session_id || null,
        event.event_type,
        event.event_category || null,
        event.platform || 'wordpress',
        event.source || null,
        event.page_url || null,
        event.referrer || null,
        JSON.stringify(event.utm_parameters || {}),
        JSON.stringify(event.event_data || {})
      ];

      await this.connection.execute(query, values);
    } catch (error) {
      console.error('Database storage failed:', error);
      throw error;
    }
  }

  /**
   * Send event to analytics API
   */
  async sendToAnalyticsAPI(event) {
    try {
      const response = await axios.post(`${this.analyticsApiUrl}/events/track`, event, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ANALYTICS_API_KEY
        },
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      console.error('Analytics API call failed:', error);
      // Don't throw - we've already stored in database
    }
  }

  /**
   * Helper methods
   */
  validateEventData(eventData) {
    return eventData && 
           eventData.event_type && 
           typeof eventData.event_type === 'string';
  }

  generateEventId() {
    return `wp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  groupByDate(rows) {
    const grouped = {};
    rows.forEach(row => {
      const date = row.date;
      if (!grouped[date]) {
        grouped[date] = { views: 0, sessions: 0 };
      }
      grouped[date].views += row.views;
      grouped[date].sessions += row.sessions;
    });
    return grouped;
  }

  formatEntryPoints(entryPoints) {
    const formatted = {};
    entryPoints.forEach(point => {
      const source = point.source || 'direct';
      formatted[source] = point.count;
    });
    return formatted;
  }

  formatExitPoints(exitPoints) {
    const formatted = {};
    exitPoints.forEach(point => {
      formatted[point.page_url] = point.exit_count;
    });
    return formatted;
  }

  async analyzeDropoffPoints() {
    // Simplified dropoff analysis
    return {
      '/pricing': 0.3,
      '/checkout': 0.5,
      '/courses': 0.2
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.connection) {
      await this.connection.end();
    }
  }
}

module.exports = WordPressAnalyticsBridge;