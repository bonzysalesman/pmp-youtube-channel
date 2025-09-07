/**
 * Course Sales Integration and Tracking System
 * Integrates with course platform APIs for sales tracking
 * Tracks conversion from YouTube to course purchases
 * Analyzes customer journey and optimizes conversion paths
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class CourseSalesTracking {
  constructor() {
    this.dataPath = path.join(__dirname, '../../generated/course-sales');
    this.platforms = [
      'teachable',
      'thinkific',
      'kajabi',
      'gumroad',
      'stripe',
      'paypal',
      'custom_platform'
    ];
    this.products = [
      'pmp_study_guide',
      'video_course_basic',
      'video_course_premium',
      'practice_exams',
      'coaching_sessions',
      'group_mentoring',
      'corporate_training'
    ];
    this.initializeSystem();
  }

  async initializeSystem() {
    try {
      // Ensure data directory exists
      await fs.ensureDir(this.dataPath);
      
      // Initialize platform integrations
      await this.initializePlatformIntegrations();
      
      // Initialize conversion tracking
      await this.initializeConversionTracking();
      
      // Initialize customer journey mapping
      await this.initializeCustomerJourneyMapping();
      
      console.log('Course sales tracking system initialized');
    } catch (error) {
      console.error('Failed to initialize course sales tracking system:', error);
    }
  }

  /**
   * Track course sale
   */
  async trackCourseSale(saleData) {
    try {
      const sale = {
        id: this.generateSaleId(),
        timestamp: new Date().toISOString(),
        platform: saleData.platform,
        product: saleData.product,
        customerId: saleData.customerId,
        customerEmail: saleData.customerEmail,
        amount: saleData.amount,
        currency: saleData.currency || 'USD',
        paymentMethod: saleData.paymentMethod,
        source: saleData.source, // youtube, email, website, social, direct
        campaign: saleData.campaign,
        referrer: saleData.referrer,
        utmParameters: saleData.utmParameters || {},
        couponCode: saleData.couponCode,
        discount: saleData.discount || 0,
        affiliateId: saleData.affiliateId,
        metadata: saleData.metadata || {}
      };

      // Save sale data
      await this.saveSale(sale);

      // Update customer profile
      await this.updateCustomerProfile(sale);

      // Track conversion funnel
      await this.trackConversionFunnel(sale);

      // Update sales analytics
      await this.updateSalesAnalytics(sale);

      // Trigger post-sale automation
      await this.triggerPostSaleAutomation(sale);

      return sale;
    } catch (error) {
      console.error('Failed to track course sale:', error);
      return null;
    }
  }

  /**
   * Integrate with course platform APIs
   */
  async integratePlatformAPI(platform, credentials) {
    try {
      const integration = {
        platform,
        credentials,
        lastSync: new Date().toISOString(),
        status: 'active',
        webhookUrl: `${process.env.WEBHOOK_BASE_URL}/course-sales/${platform}`,
        apiEndpoints: await this.getPlatformEndpoints(platform)
      };

      // Test API connection
      const connectionTest = await this.testPlatformConnection(platform, credentials);
      if (!connectionTest.success) {
        throw new Error(`Failed to connect to ${platform}: ${connectionTest.error}`);
      }

      // Save integration configuration
      await this.savePlatformIntegration(integration);

      // Set up webhook if supported
      if (integration.apiEndpoints.webhook) {
        await this.setupWebhook(platform, integration.webhookUrl, credentials);
      }

      // Perform initial data sync
      await this.syncPlatformData(platform);

      return integration;
    } catch (error) {
      console.error(`Failed to integrate with ${platform}:`, error);
      return null;
    }
  }

  /**
   * Sync sales data from platform
   */
  async syncPlatformData(platform, dateRange = null) {
    try {
      const integration = await this.getPlatformIntegration(platform);
      if (!integration) {
        throw new Error(`No integration found for platform: ${platform}`);
      }

      const salesData = await this.fetchPlatformSales(platform, integration.credentials, dateRange);
      const syncResults = {
        platform,
        timestamp: new Date().toISOString(),
        salesSynced: 0,
        errors: []
      };

      for (const saleData of salesData) {
        try {
          // Convert platform-specific data to our format
          const normalizedSale = await this.normalizeSaleData(platform, saleData);
          
          // Check if sale already exists
          const existingSale = await this.findExistingSale(normalizedSale);
          if (!existingSale) {
            await this.trackCourseSale(normalizedSale);
            syncResults.salesSynced++;
          }
        } catch (error) {
          syncResults.errors.push({
            saleId: saleData.id,
            error: error.message
          });
        }
      }

      // Update last sync time
      integration.lastSync = new Date().toISOString();
      await this.savePlatformIntegration(integration);

      // Save sync results
      await this.saveSyncResults(syncResults);

      return syncResults;
    } catch (error) {
      console.error(`Failed to sync data from ${platform}:`, error);
      return null;
    }
  }

  /**
   * Track YouTube to course conversion
   */
  async trackYouTubeConversion(conversionData) {
    try {
      const conversion = {
        id: this.generateConversionId(),
        timestamp: new Date().toISOString(),
        youtubeData: {
          videoId: conversionData.videoId,
          channelId: conversionData.channelId,
          watchTime: conversionData.watchTime,
          engagement: conversionData.engagement,
          subscribed: conversionData.subscribed
        },
        customerData: {
          customerId: conversionData.customerId,
          email: conversionData.email,
          source: 'youtube',
          firstTouch: conversionData.firstTouch,
          lastTouch: conversionData.lastTouch
        },
        saleData: {
          saleId: conversionData.saleId,
          product: conversionData.product,
          amount: conversionData.amount,
          timeToConversion: conversionData.timeToConversion
        },
        attributionData: {
          touchpoints: conversionData.touchpoints || [],
          attributionModel: 'last_click', // or 'first_click', 'linear', 'time_decay'
          attributionWeight: this.calculateAttributionWeight(conversionData.touchpoints)
        }
      };

      // Save conversion data
      await this.saveYouTubeConversion(conversion);

      // Update video performance metrics
      await this.updateVideoPerformanceMetrics(conversion);

      // Update attribution analysis
      await this.updateAttributionAnalysis(conversion);

      return conversion;
    } catch (error) {
      console.error('Failed to track YouTube conversion:', error);
      return null;
    }
  }

  /**
   * Analyze customer journey
   */
  async analyzeCustomerJourney(customerId = null) {
    try {
      const journeyData = customerId 
        ? await this.getCustomerJourney(customerId)
        : await this.getAllCustomerJourneys();

      const analysis = {
        timestamp: new Date().toISOString(),
        customerId,
        journeyAnalysis: {
          averageJourneyLength: await this.calculateAverageJourneyLength(journeyData),
          commonTouchpoints: await this.identifyCommonTouchpoints(journeyData),
          conversionPaths: await this.analyzeConversionPaths(journeyData),
          dropoffPoints: await this.identifyDropoffPoints(journeyData),
          timeToConversion: await this.analyzeTimeToConversion(journeyData)
        },
        channelAnalysis: {
          youtubeImpact: await this.analyzeYouTubeImpact(journeyData),
          emailImpact: await this.analyzeEmailImpact(journeyData),
          websiteImpact: await this.analyzeWebsiteImpact(journeyData),
          socialImpact: await this.analyzeSocialImpact(journeyData)
        },
        optimizationOpportunities: await this.identifyJourneyOptimizations(journeyData),
        recommendations: await this.generateJourneyRecommendations(journeyData)
      };

      // Save journey analysis
      const analysisFile = path.join(this.dataPath, `journey-analysis-${Date.now()}.json`);
      await fs.writeJson(analysisFile, analysis, { spaces: 2 });

      return analysis;
    } catch (error) {
      console.error('Failed to analyze customer journey:', error);
      return null;
    }
  }

  /**
   * Generate sales performance report
   */
  async generateSalesReport(dateRange = null) {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        dateRange,
        summary: await this.generateSalesSummary(dateRange),
        productAnalysis: await this.analyzeProductPerformance(dateRange),
        channelAnalysis: await this.analyzeChannelPerformance(dateRange),
        customerAnalysis: await this.analyzeCustomerPerformance(dateRange),
        conversionAnalysis: await this.analyzeConversionPerformance(dateRange),
        revenueAnalysis: await this.analyzeRevenuePerformance(dateRange),
        trends: await this.analyzeSalesTrends(dateRange),
        forecasts: await this.generateSalesForecasts(),
        recommendations: await this.generateSalesRecommendations(dateRange)
      };

      // Save sales report
      const reportFile = path.join(this.dataPath, `sales-report-${Date.now()}.json`);
      await fs.writeJson(reportFile, report, { spaces: 2 });

      return report;
    } catch (error) {
      console.error('Failed to generate sales report:', error);
      return null;
    }
  }

  /**
   * Optimize conversion funnel
   */
  async optimizeConversionFunnel() {
    try {
      const optimization = {
        timestamp: new Date().toISOString(),
        currentPerformance: await this.analyzeCurrentFunnelPerformance(),
        bottlenecks: await this.identifyFunnelBottlenecks(),
        optimizationOpportunities: await this.identifyFunnelOptimizations(),
        testingRecommendations: await this.generateTestingRecommendations(),
        expectedImpact: await this.calculateOptimizationImpact(),
        implementationPlan: await this.createOptimizationPlan()
      };

      // Save optimization analysis
      const optimizationFile = path.join(this.dataPath, 'funnel-optimization.json');
      await fs.writeJson(optimizationFile, optimization, { spaces: 2 });

      return optimization;
    } catch (error) {
      console.error('Failed to optimize conversion funnel:', error);
      return null;
    }
  }

  // Helper methods for system initialization and configuration

  async initializePlatformIntegrations() {
    const platformConfigs = {
      teachable: {
        name: 'Teachable',
        apiUrl: 'https://developers.teachable.com/v1',
        authType: 'api_key',
        webhookSupport: true,
        endpoints: {
          sales: '/sales',
          students: '/students',
          courses: '/courses',
          webhook: '/webhooks'
        }
      },
      thinkific: {
        name: 'Thinkific',
        apiUrl: 'https://api.thinkific.com/api/public/v1',
        authType: 'api_key',
        webhookSupport: true,
        endpoints: {
          sales: '/enrollments',
          students: '/users',
          courses: '/courses',
          webhook: '/webhooks'
        }
      },
      kajabi: {
        name: 'Kajabi',
        apiUrl: 'https://api.kajabi.com',
        authType: 'oauth',
        webhookSupport: true,
        endpoints: {
          sales: '/purchases',
          students: '/people',
          courses: '/products',
          webhook: '/webhooks'
        }
      },
      gumroad: {
        name: 'Gumroad',
        apiUrl: 'https://api.gumroad.com/v2',
        authType: 'oauth',
        webhookSupport: true,
        endpoints: {
          sales: '/sales',
          products: '/products',
          webhook: '/resource_subscriptions'
        }
      },
      stripe: {
        name: 'Stripe',
        apiUrl: 'https://api.stripe.com/v1',
        authType: 'api_key',
        webhookSupport: true,
        endpoints: {
          sales: '/charges',
          customers: '/customers',
          products: '/products',
          webhook: '/webhook_endpoints'
        }
      }
    };

    const configFile = path.join(this.dataPath, 'platform-configs.json');
    await fs.writeJson(configFile, platformConfigs, { spaces: 2 });
  }

  async initializeConversionTracking() {
    const trackingConfig = {
      attributionModels: ['first_click', 'last_click', 'linear', 'time_decay', 'position_based'],
      touchpointTypes: ['youtube_view', 'email_open', 'website_visit', 'social_click', 'ad_click'],
      conversionWindows: {
        view: 30, // days
        click: 7, // days
        email: 14 // days
      },
      utmTracking: {
        required: ['utm_source', 'utm_medium', 'utm_campaign'],
        optional: ['utm_content', 'utm_term']
      }
    };

    const trackingFile = path.join(this.dataPath, 'conversion-tracking-config.json');
    await fs.writeJson(trackingFile, trackingConfig, { spaces: 2 });
  }

  async initializeCustomerJourneyMapping() {
    const journeyConfig = {
      stages: [
        'awareness',
        'interest',
        'consideration',
        'intent',
        'purchase',
        'onboarding',
        'engagement',
        'advocacy'
      ],
      touchpointMapping: {
        youtube: ['awareness', 'interest', 'consideration'],
        email: ['interest', 'consideration', 'intent'],
        website: ['consideration', 'intent', 'purchase'],
        social: ['awareness', 'interest'],
        ads: ['awareness', 'interest', 'intent']
      },
      journeyMetrics: [
        'time_to_conversion',
        'touchpoint_count',
        'channel_diversity',
        'engagement_depth'
      ]
    };

    const journeyFile = path.join(this.dataPath, 'journey-mapping-config.json');
    await fs.writeJson(journeyFile, journeyConfig, { spaces: 2 });
  }

  generateSaleId() {
    return `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateConversionId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async saveSale(sale) {
    // Save individual sale
    const saleFile = path.join(this.dataPath, 'sales', `${sale.id}.json`);
    await fs.ensureDir(path.dirname(saleFile));
    await fs.writeJson(saleFile, sale, { spaces: 2 });

    // Save to daily index
    const saleDate = sale.timestamp.split('T')[0];
    const dailySalesFile = path.join(this.dataPath, 'daily-sales', `${saleDate}.json`);
    await fs.ensureDir(path.dirname(dailySalesFile));
    
    let dailySales = [];
    if (await fs.pathExists(dailySalesFile)) {
      dailySales = await fs.readJson(dailySalesFile);
    }
    
    dailySales.push(sale.id);
    await fs.writeJson(dailySalesFile, dailySales, { spaces: 2 });
  }

  async updateCustomerProfile(sale) {
    const customerFile = path.join(this.dataPath, 'customers', `${sale.customerId}.json`);
    await fs.ensureDir(path.dirname(customerFile));
    
    let customer = {
      id: sale.customerId,
      email: sale.customerEmail,
      firstPurchase: sale.timestamp,
      lastPurchase: sale.timestamp,
      totalSpent: 0,
      purchaseCount: 0,
      products: [],
      sources: new Set(),
      campaigns: new Set()
    };
    
    if (await fs.pathExists(customerFile)) {
      customer = await fs.readJson(customerFile);
      customer.sources = new Set(customer.sources);
      customer.campaigns = new Set(customer.campaigns);
    }
    
    // Update customer data
    customer.lastPurchase = sale.timestamp;
    customer.totalSpent += sale.amount;
    customer.purchaseCount += 1;
    customer.products.push(sale.product);
    customer.sources.add(sale.source);
    if (sale.campaign) customer.campaigns.add(sale.campaign);
    
    // Convert Sets back to arrays for JSON serialization
    customer.sources = Array.from(customer.sources);
    customer.campaigns = Array.from(customer.campaigns);
    
    await fs.writeJson(customerFile, customer, { spaces: 2 });
  }

  async trackConversionFunnel(sale) {
    const funnelEntry = {
      saleId: sale.id,
      customerId: sale.customerId,
      timestamp: sale.timestamp,
      source: sale.source,
      campaign: sale.campaign,
      product: sale.product,
      amount: sale.amount,
      funnelStage: 'purchase'
    };

    const funnelFile = path.join(this.dataPath, 'conversion-funnel.json');
    let funnelData = [];
    if (await fs.pathExists(funnelFile)) {
      funnelData = await fs.readJson(funnelFile);
    }
    
    funnelData.push(funnelEntry);
    await fs.writeJson(funnelFile, funnelData, { spaces: 2 });
  }

  async updateSalesAnalytics(sale) {
    const analyticsFile = path.join(this.dataPath, 'sales-analytics.json');
    let analytics = {
      totalSales: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      lastUpdated: new Date().toISOString()
    };
    
    if (await fs.pathExists(analyticsFile)) {
      analytics = await fs.readJson(analyticsFile);
    }
    
    analytics.totalSales += 1;
    analytics.totalRevenue += sale.amount;
    analytics.averageOrderValue = analytics.totalRevenue / analytics.totalSales;
    analytics.lastUpdated = new Date().toISOString();
    
    await fs.writeJson(analyticsFile, analytics, { spaces: 2 });
  }

  async triggerPostSaleAutomation(sale) {
    // Placeholder for post-sale automation triggers
    console.log(`Triggered post-sale automation for sale ${sale.id}`);
    
    // Could trigger:
    // - Welcome email sequence
    // - Course access provisioning
    // - Affiliate commission tracking
    // - Customer onboarding workflow
  }

  // Platform integration methods
  async getPlatformEndpoints(platform) {
    const platformConfigs = await this.getPlatformConfigs();
    return platformConfigs[platform]?.endpoints || {};
  }

  async testPlatformConnection(platform, credentials) {
    try {
      // Placeholder for actual API connection testing
      // Would make a test API call to verify credentials
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async savePlatformIntegration(integration) {
    const integrationFile = path.join(this.dataPath, 'integrations', `${integration.platform}.json`);
    await fs.ensureDir(path.dirname(integrationFile));
    await fs.writeJson(integrationFile, integration, { spaces: 2 });
  }

  async getPlatformIntegration(platform) {
    try {
      const integrationFile = path.join(this.dataPath, 'integrations', `${platform}.json`);
      if (await fs.pathExists(integrationFile)) {
        return await fs.readJson(integrationFile);
      }
      return null;
    } catch (error) {
      console.error(`Failed to get platform integration for ${platform}:`, error);
      return null;
    }
  }

  async setupWebhook(platform, webhookUrl, credentials) {
    // Placeholder for webhook setup
    console.log(`Setting up webhook for ${platform}: ${webhookUrl}`);
  }

  async fetchPlatformSales(platform, credentials, dateRange) {
    // Placeholder for actual API calls to fetch sales data
    // Would implement platform-specific API calls
    return [
      {
        id: 'platform_sale_1',
        customer_email: 'customer@example.com',
        amount: 97,
        product: 'pmp_study_guide',
        created_at: new Date().toISOString()
      }
    ];
  }

  async normalizeSaleData(platform, saleData) {
    // Convert platform-specific data format to our standard format
    return {
      platform,
      product: saleData.product || 'unknown',
      customerId: saleData.customer_id || this.generateCustomerId(saleData.customer_email),
      customerEmail: saleData.customer_email,
      amount: saleData.amount || 0,
      currency: saleData.currency || 'USD',
      source: 'platform_sync',
      metadata: { originalData: saleData }
    };
  }

  generateCustomerId(email) {
    return `cust_${Buffer.from(email).toString('base64').substr(0, 10)}`;
  }

  async findExistingSale(saleData) {
    // Check if sale already exists based on platform and external ID
    // Placeholder implementation
    return null;
  }

  async saveSyncResults(results) {
    const syncFile = path.join(this.dataPath, 'sync-results', `${results.platform}-${Date.now()}.json`);
    await fs.ensureDir(path.dirname(syncFile));
    await fs.writeJson(syncFile, results, { spaces: 2 });
  }

  // YouTube conversion tracking methods
  calculateAttributionWeight(touchpoints) {
    if (!touchpoints || touchpoints.length === 0) return 1;
    
    // Simple linear attribution - equal weight to all touchpoints
    return 1 / touchpoints.length;
  }

  async saveYouTubeConversion(conversion) {
    const conversionFile = path.join(this.dataPath, 'youtube-conversions', `${conversion.id}.json`);
    await fs.ensureDir(path.dirname(conversionFile));
    await fs.writeJson(conversionFile, conversion, { spaces: 2 });
  }

  async updateVideoPerformanceMetrics(conversion) {
    const metricsFile = path.join(this.dataPath, 'video-metrics.json');
    let metrics = {};
    
    if (await fs.pathExists(metricsFile)) {
      metrics = await fs.readJson(metricsFile);
    }
    
    const videoId = conversion.youtubeData.videoId;
    if (!metrics[videoId]) {
      metrics[videoId] = {
        conversions: 0,
        revenue: 0,
        conversionRate: 0
      };
    }
    
    metrics[videoId].conversions += 1;
    metrics[videoId].revenue += conversion.saleData.amount;
    
    await fs.writeJson(metricsFile, metrics, { spaces: 2 });
  }

  async updateAttributionAnalysis(conversion) {
    const attributionFile = path.join(this.dataPath, 'attribution-analysis.json');
    let attribution = {
      totalConversions: 0,
      youtubeAttribution: 0,
      multiTouchConversions: 0
    };
    
    if (await fs.pathExists(attributionFile)) {
      attribution = await fs.readJson(attributionFile);
    }
    
    attribution.totalConversions += 1;
    if (conversion.customerData.source === 'youtube') {
      attribution.youtubeAttribution += conversion.attributionData.attributionWeight;
    }
    if (conversion.attributionData.touchpoints.length > 1) {
      attribution.multiTouchConversions += 1;
    }
    
    await fs.writeJson(attributionFile, attribution, { spaces: 2 });
  }

  // Customer journey analysis methods
  async getCustomerJourney(customerId) {
    // Get all touchpoints and interactions for a specific customer
    const customerFile = path.join(this.dataPath, 'customers', `${customerId}.json`);
    if (await fs.pathExists(customerFile)) {
      return await fs.readJson(customerFile);
    }
    return null;
  }

  async getAllCustomerJourneys() {
    // Get journey data for all customers
    const customersDir = path.join(this.dataPath, 'customers');
    if (!await fs.pathExists(customersDir)) return [];
    
    const customerFiles = await fs.readdir(customersDir);
    const journeys = [];
    
    for (const file of customerFiles) {
      if (file.endsWith('.json')) {
        const customer = await fs.readJson(path.join(customersDir, file));
        journeys.push(customer);
      }
    }
    
    return journeys;
  }

  async calculateAverageJourneyLength(journeyData) {
    if (!Array.isArray(journeyData) || journeyData.length === 0) return 0;
    
    const journeyLengths = journeyData.map(journey => {
      if (journey.firstPurchase && journey.lastPurchase) {
        return new Date(journey.lastPurchase) - new Date(journey.firstPurchase);
      }
      return 0;
    }).filter(length => length > 0);
    
    if (journeyLengths.length === 0) return 0;
    
    const avgLengthMs = journeyLengths.reduce((sum, length) => sum + length, 0) / journeyLengths.length;
    return avgLengthMs / (1000 * 60 * 60 * 24); // Convert to days
  }

  async identifyCommonTouchpoints(journeyData) {
    const touchpointCounts = {};
    
    journeyData.forEach(journey => {
      if (journey.sources) {
        journey.sources.forEach(source => {
          touchpointCounts[source] = (touchpointCounts[source] || 0) + 1;
        });
      }
    });
    
    return Object.entries(touchpointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([touchpoint, count]) => ({ touchpoint, count }));
  }

  async analyzeConversionPaths(journeyData) {
    const pathCounts = {};
    
    journeyData.forEach(journey => {
      if (journey.sources && journey.sources.length > 0) {
        const path = journey.sources.join(' -> ');
        pathCounts[path] = (pathCounts[path] || 0) + 1;
      }
    });
    
    return Object.entries(pathCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));
  }

  async identifyDropoffPoints(journeyData) {
    // Placeholder for dropoff analysis
    return [
      { stage: 'awareness_to_interest', dropoffRate: 0.7 },
      { stage: 'interest_to_consideration', dropoffRate: 0.5 },
      { stage: 'consideration_to_purchase', dropoffRate: 0.8 }
    ];
  }

  async analyzeTimeToConversion(journeyData) {
    const conversionTimes = journeyData.map(journey => {
      if (journey.firstPurchase) {
        // Calculate time from first touch to purchase
        // Placeholder calculation
        return Math.random() * 30; // 0-30 days
      }
      return null;
    }).filter(time => time !== null);
    
    if (conversionTimes.length === 0) return { average: 0, median: 0, distribution: {} };
    
    const average = conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length;
    const sorted = conversionTimes.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return { average, median, distribution: this.calculateTimeDistribution(conversionTimes) };
  }

  calculateTimeDistribution(times) {
    const buckets = { '0-7': 0, '8-14': 0, '15-30': 0, '31+': 0 };
    
    times.forEach(time => {
      if (time <= 7) buckets['0-7']++;
      else if (time <= 14) buckets['8-14']++;
      else if (time <= 30) buckets['15-30']++;
      else buckets['31+']++;
    });
    
    return buckets;
  }

  // Channel impact analysis methods
  async analyzeYouTubeImpact(journeyData) {
    const youtubeCustomers = journeyData.filter(journey => 
      journey.sources && journey.sources.includes('youtube')
    );
    
    return {
      customerCount: youtubeCustomers.length,
      totalRevenue: youtubeCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0),
      averageOrderValue: youtubeCustomers.length > 0 ? 
        youtubeCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) / youtubeCustomers.length : 0,
      conversionRate: journeyData.length > 0 ? youtubeCustomers.length / journeyData.length : 0
    };
  }

  async analyzeEmailImpact(journeyData) {
    const emailCustomers = journeyData.filter(journey => 
      journey.sources && journey.sources.includes('email')
    );
    
    return {
      customerCount: emailCustomers.length,
      totalRevenue: emailCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0),
      averageOrderValue: emailCustomers.length > 0 ? 
        emailCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) / emailCustomers.length : 0,
      conversionRate: journeyData.length > 0 ? emailCustomers.length / journeyData.length : 0
    };
  }

  async analyzeWebsiteImpact(journeyData) {
    const websiteCustomers = journeyData.filter(journey => 
      journey.sources && journey.sources.includes('website')
    );
    
    return {
      customerCount: websiteCustomers.length,
      totalRevenue: websiteCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0),
      averageOrderValue: websiteCustomers.length > 0 ? 
        websiteCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) / websiteCustomers.length : 0,
      conversionRate: journeyData.length > 0 ? websiteCustomers.length / journeyData.length : 0
    };
  }

  async analyzeSocialImpact(journeyData) {
    const socialCustomers = journeyData.filter(journey => 
      journey.sources && journey.sources.some(source => source.includes('social'))
    );
    
    return {
      customerCount: socialCustomers.length,
      totalRevenue: socialCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0),
      averageOrderValue: socialCustomers.length > 0 ? 
        socialCustomers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) / socialCustomers.length : 0,
      conversionRate: journeyData.length > 0 ? socialCustomers.length / journeyData.length : 0
    };
  }

  // Sales reporting methods
  async generateSalesSummary(dateRange) {
    const sales = await this.getSales(dateRange);
    
    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
      averageOrderValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length : 0,
      uniqueCustomers: new Set(sales.map(sale => sale.customerId)).size,
      topProduct: this.getTopProduct(sales),
      topSource: this.getTopSource(sales)
    };
  }

  async analyzeProductPerformance(dateRange) {
    const sales = await this.getSales(dateRange);
    const productPerformance = {};
    
    this.products.forEach(product => {
      const productSales = sales.filter(sale => sale.product === product);
      productPerformance[product] = {
        sales: productSales.length,
        revenue: productSales.reduce((sum, sale) => sum + sale.amount, 0),
        averageOrderValue: productSales.length > 0 ? 
          productSales.reduce((sum, sale) => sum + sale.amount, 0) / productSales.length : 0,
        uniqueCustomers: new Set(productSales.map(sale => sale.customerId)).size
      };
    });
    
    return productPerformance;
  }

  async analyzeChannelPerformance(dateRange) {
    const sales = await this.getSales(dateRange);
    const channelPerformance = {};
    
    const channels = ['youtube', 'email', 'website', 'social', 'direct', 'ads'];
    channels.forEach(channel => {
      const channelSales = sales.filter(sale => sale.source === channel);
      channelPerformance[channel] = {
        sales: channelSales.length,
        revenue: channelSales.reduce((sum, sale) => sum + sale.amount, 0),
        averageOrderValue: channelSales.length > 0 ? 
          channelSales.reduce((sum, sale) => sum + sale.amount, 0) / channelSales.length : 0,
        conversionRate: this.calculateChannelConversionRate(channel, channelSales.length)
      };
    });
    
    return channelPerformance;
  }

  async getSales(dateRange = null) {
    try {
      const salesDir = path.join(this.dataPath, 'sales');
      if (!await fs.pathExists(salesDir)) return [];
      
      const saleFiles = await fs.readdir(salesDir);
      const sales = [];
      
      for (const file of saleFiles) {
        if (file.endsWith('.json')) {
          const sale = await fs.readJson(path.join(salesDir, file));
          
          if (!dateRange || (
            new Date(sale.timestamp) >= new Date(dateRange.start) &&
            new Date(sale.timestamp) <= new Date(dateRange.end)
          )) {
            sales.push(sale);
          }
        }
      }
      
      return sales;
    } catch (error) {
      console.error('Failed to get sales:', error);
      return [];
    }
  }

  getTopProduct(sales) {
    const productCounts = {};
    sales.forEach(sale => {
      productCounts[sale.product] = (productCounts[sale.product] || 0) + 1;
    });
    
    return Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
  }

  getTopSource(sales) {
    const sourceCounts = {};
    sales.forEach(sale => {
      sourceCounts[sale.source] = (sourceCounts[sale.source] || 0) + 1;
    });
    
    return Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
  }

  calculateChannelConversionRate(channel, sales) {
    // Placeholder - would calculate based on traffic/impression data
    return Math.random() * 0.1; // 0-10% conversion rate
  }

  async getPlatformConfigs() {
    try {
      const configFile = path.join(this.dataPath, 'platform-configs.json');
      return await fs.readJson(configFile);
    } catch (error) {
      console.error('Failed to get platform configs:', error);
      return {};
    }
  }

  // Placeholder methods for complex analysis (would be fully implemented in production)
  async analyzeCustomerPerformance(dateRange) { return {}; }
  async analyzeConversionPerformance(dateRange) { return {}; }
  async analyzeRevenuePerformance(dateRange) { return {}; }
  async analyzeSalesTrends(dateRange) { return {}; }
  async generateSalesForecasts() { return {}; }
  async generateSalesRecommendations(dateRange) { return []; }
  async identifyJourneyOptimizations(journeyData) { return []; }
  async generateJourneyRecommendations(journeyData) { return []; }
  async analyzeCurrentFunnelPerformance() { return {}; }
  async identifyFunnelBottlenecks() { return []; }
  async identifyFunnelOptimizations() { return []; }
  async generateTestingRecommendations() { return []; }
  async calculateOptimizationImpact() { return {}; }
  async createOptimizationPlan() { return {}; }
}

module.exports = CourseSalesTracking;