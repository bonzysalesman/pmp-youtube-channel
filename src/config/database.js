// Database configuration for WordPress integration
const mysql = require('mysql2/promise');
const redis = require('redis');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseManager {
  constructor() {
    this.mysqlConnection = null;
    this.redisClient = null;
    this.sqliteDb = null;
    this.isInitialized = false;
  }

  // Initialize all database connections
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize MySQL connection for WordPress integration
      await this.initializeMySQL();
            
      // Initialize Redis connection for caching
      await this.initializeRedis();
            
      // Initialize SQLite for existing analytics (backward compatibility)
      await this.initializeSQLite();
            
      this.isInitialized = true;
      console.log('✅ All database connections initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database connections:', error);
      throw error;
    }
  }

  // Initialize MySQL connection
  async initializeMySQL() {
    const config = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      user: process.env.ANALYTICS_DB_USER || 'analytics',
      password: process.env.ANALYTICS_DB_PASSWORD || 'analytics_password',
      database: process.env.ANALYTICS_DB_NAME || 'pmp_analytics',
      charset: 'utf8mb4',
      timezone: '+00:00',
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      connectionLimit: 10
    };

    try {
      // Create connection pool
      this.mysqlConnection = mysql.createPool(config);
            
      // Test connection
      const connection = await this.mysqlConnection.getConnection();
      await connection.ping();
      connection.release();
            
      console.log('✅ MySQL connection established');
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      throw error;
    }
  }

  // Initialize Redis connection
  async initializeRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        
    try {
      this.redisClient = redis.createClient({
        url: redisUrl,
        password: process.env.REDIS_PASSWORD || 'redis_password',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis connection established');
      });

      await this.redisClient.connect();
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      throw error;
    }
  }

  // Initialize SQLite for backward compatibility
  async initializeSQLite() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '../../data/database.sqlite');
            
      this.sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ SQLite connection failed:', err.message);
          reject(err);
        } else {
          console.log('✅ SQLite connection established');
          resolve();
        }
      });
    });
  }

  // Get MySQL connection
  getMySQL() {
    if (!this.mysqlConnection) {
      throw new Error('MySQL connection not initialized');
    }
    return this.mysqlConnection;
  }

  // Get Redis client
  getRedis() {
    if (!this.redisClient) {
      throw new Error('Redis connection not initialized');
    }
    return this.redisClient;
  }

  // Get SQLite database
  getSQLite() {
    if (!this.sqliteDb) {
      throw new Error('SQLite connection not initialized');
    }
    return this.sqliteDb;
  }

  // Execute MySQL query with error handling
  async executeMySQL(query, params = []) {
    try {
      const [rows] = await this.mysqlConnection.execute(query, params);
      return rows;
    } catch (error) {
      console.error('MySQL query error:', error.message);
      console.error('Query:', query);
      console.error('Params:', params);
      throw error;
    }
  }

  // Execute Redis command with error handling
  async executeRedis(command, ...args) {
    try {
      return await this.redisClient[command](...args);
    } catch (error) {
      console.error('Redis command error:', error.message);
      console.error('Command:', command);
      console.error('Args:', args);
      throw error;
    }
  }

  // Execute SQLite query with error handling
  async executeSQLite(query, params = []) {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(query, params, (err, rows) => {
        if (err) {
          console.error('SQLite query error:', err.message);
          console.error('Query:', query);
          console.error('Params:', params);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Cache management utilities
  async cacheSet(key, value, expireSeconds = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.setEx(key, expireSeconds, serializedValue);
    } catch (error) {
      console.error('Cache set error:', error.message);
    }
  }

  async cacheGet(key) {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  async cacheDelete(key) {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error.message);
    }
  }

  // Health check for all connections
  async healthCheck() {
    const health = {
      mysql: false,
      redis: false,
      sqlite: false,
      timestamp: new Date().toISOString()
    };

    // Check MySQL
    try {
      const connection = await this.mysqlConnection.getConnection();
      await connection.ping();
      connection.release();
      health.mysql = true;
    } catch (error) {
      console.error('MySQL health check failed:', error.message);
    }

    // Check Redis
    try {
      await this.redisClient.ping();
      health.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error.message);
    }

    // Check SQLite
    try {
      await this.executeSQLite('SELECT 1');
      health.sqlite = true;
    } catch (error) {
      console.error('SQLite health check failed:', error.message);
    }

    return health;
  }

  // Graceful shutdown
  async close() {
    console.log('🔄 Closing database connections...');

    try {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
        console.log('✅ MySQL connection closed');
      }

      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis connection closed');
      }

      if (this.sqliteDb) {
        await new Promise((resolve) => {
          this.sqliteDb.close((err) => {
            if (err) {
              console.error('SQLite close error:', err.message);
            } else {
              console.log('✅ SQLite connection closed');
            }
            resolve();
          });
        });
      }

      this.isInitialized = false;
      console.log('✅ All database connections closed');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Export the manager and convenience functions
module.exports = {
  databaseManager,
    
  // Convenience functions
  getMySQL: () => databaseManager.getMySQL(),
  getRedis: () => databaseManager.getRedis(),
  getSQLite: () => databaseManager.getSQLite(),
    
  // Query functions
  executeMySQL: (query, params) => databaseManager.executeMySQL(query, params),
  executeRedis: (command, ...args) => databaseManager.executeRedis(command, ...args),
  executeSQLite: (query, params) => databaseManager.executeSQLite(query, params),
    
  // Cache functions
  cacheSet: (key, value, expire) => databaseManager.cacheSet(key, value, expire),
  cacheGet: (key) => databaseManager.cacheGet(key),
  cacheDelete: (key) => databaseManager.cacheDelete(key),
    
  // Utility functions
  healthCheck: () => databaseManager.healthCheck(),
  initialize: () => databaseManager.initialize(),
  close: () => databaseManager.close()
};