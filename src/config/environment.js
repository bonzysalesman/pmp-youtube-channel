/**
 * Environment Configuration Manager
 * Handles loading and validation of environment variables
 */

require('dotenv').config();

class EnvironmentConfig {
  constructor() {
    this.requiredVars = [
      'YOUTUBE_API_KEY',
      'YOUTUBE_CHANNEL_ID',
      'CHANNEL_NAME',
      'CHANNEL_EMAIL'
    ];
    
    this.optionalVars = [
      'YOUTUBE_CLIENT_ID',
      'YOUTUBE_CLIENT_SECRET', 
      'YOUTUBE_REFRESH_TOKEN',
      'EMAIL_API_KEY',
      'GOOGLE_ANALYTICS_ID'
    ];

    this.validateEnvironment();
  }

  /**
   * Validate required environment variables
   */
  validateEnvironment() {
    const missing = this.requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('Missing required environment variables:');
      missing.forEach(varName => console.error(`  - ${varName}`));
      console.error('\nPlease copy .env.example to .env and fill in the required values.');
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }

    const optional = this.optionalVars.filter(varName => !process.env[varName]);
    if (optional.length > 0 && process.env.NODE_ENV !== 'test') {
      console.warn('Optional environment variables not set:');
      optional.forEach(varName => console.warn(`  - ${varName}`));
    }
  }

  /**
   * Get YouTube API configuration
   */
  getYouTubeConfig() {
    return {
      apiKey: process.env.YOUTUBE_API_KEY,
      channelId: process.env.YOUTUBE_CHANNEL_ID,
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN
    };
  }

  /**
   * Get channel configuration
   */
  getChannelConfig() {
    return {
      name: process.env.CHANNEL_NAME,
      email: process.env.CHANNEL_EMAIL,
      website: process.env.CHANNEL_WEBSITE,
      timezone: process.env.TIMEZONE || 'America/New_York'
    };
  }

  /**
   * Get lead magnet URLs
   */
  getLeadMagnetUrls() {
    return {
      calendar: process.env.LEAD_MAGNET_CALENDAR_URL,
      cheatsheet: process.env.LEAD_MAGNET_CHEATSHEET_URL,
      questions: process.env.LEAD_MAGNET_QUESTIONS_URL,
      ecoChecklist: process.env.LEAD_MAGNET_ECO_CHECKLIST_URL
    };
  }

  /**
   * Get playlist URLs
   */
  getPlaylistUrls() {
    return {
      main: process.env.MAIN_PLAYLIST_URL,
      people: process.env.PEOPLE_DOMAIN_PLAYLIST_URL,
      process: process.env.PROCESS_DOMAIN_PLAYLIST_URL,
      business: process.env.BUSINESS_DOMAIN_PLAYLIST_URL
    };
  }

  /**
   * Get email marketing configuration
   */
  getEmailConfig() {
    return {
      apiKey: process.env.EMAIL_API_KEY,
      listId: process.env.EMAIL_LIST_ID,
      fromAddress: process.env.EMAIL_FROM_ADDRESS,
      fromName: process.env.EMAIL_FROM_NAME
    };
  }

  /**
   * Get analytics configuration
   */
  getAnalyticsConfig() {
    return {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
      youtubeAnalyticsKey: process.env.YOUTUBE_ANALYTICS_API_KEY
    };
  }

  /**
   * Get social media configuration
   */
  getSocialMediaConfig() {
    return {
      linkedin: process.env.LINKEDIN_PAGE_URL,
      facebook: process.env.FACEBOOK_PAGE_URL,
      twitter: process.env.TWITTER_HANDLE,
      instagram: process.env.INSTAGRAM_HANDLE
    };
  }

  /**
   * Get course platform configuration
   */
  getCourseConfig() {
    return {
      apiKey: process.env.COURSE_PLATFORM_API_KEY,
      platformUrl: process.env.COURSE_PLATFORM_URL,
      mainCourseUrl: process.env.MAIN_COURSE_URL
    };
  }

  /**
   * Get affiliate configuration
   */
  getAffiliateConfig() {
    return {
      udemyId: process.env.UDEMY_AFFILIATE_ID,
      amazonId: process.env.AMAZON_AFFILIATE_ID,
      pmbokUrl: process.env.PMBOK_AFFILIATE_URL
    };
  }

  /**
   * Get storage configuration
   */
  getStorageConfig() {
    return {
      bucket: process.env.CLOUD_STORAGE_BUCKET,
      backupKey: process.env.BACKUP_STORAGE_KEY,
      cdnUrl: process.env.CDN_BASE_URL
    };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return {
      jwtSecret: process.env.JWT_SECRET,
      encryptionKey: process.env.ENCRYPTION_KEY,
      apiRateLimit: parseInt(process.env.API_RATE_LIMIT) || 100
    };
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig() {
    return {
      sentryDsn: process.env.SENTRY_DSN,
      uptimeMonitorUrl: process.env.UPTIME_MONITOR_URL
    };
  }

  /**
   * Get all configuration as a single object
   */
  getAllConfig() {
    return {
      youtube: this.getYouTubeConfig(),
      channel: this.getChannelConfig(),
      leadMagnets: this.getLeadMagnetUrls(),
      playlists: this.getPlaylistUrls(),
      email: this.getEmailConfig(),
      analytics: this.getAnalyticsConfig(),
      socialMedia: this.getSocialMediaConfig(),
      course: this.getCourseConfig(),
      affiliate: this.getAffiliateConfig(),
      storage: this.getStorageConfig(),
      security: this.getSecurityConfig(),
      monitoring: this.getMonitoringConfig(),
      environment: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
      port: parseInt(process.env.PORT) || 3000
    };
  }

  /**
   * Check if running in production
   */
  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment() {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  /**
   * Check if running in test mode
   */
  isTest() {
    return process.env.NODE_ENV === 'test';
  }
}

module.exports = new EnvironmentConfig();