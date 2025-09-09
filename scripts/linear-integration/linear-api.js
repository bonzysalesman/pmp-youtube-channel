/**
 * Linear API Client
 * 
 * Provides comprehensive integration with Linear's GraphQL API including:
 * - Authentication and connection management
 * - Core API methods for issues, teams, and webhooks
 * - Error handling and retry mechanisms
 * - Rate limiting and request optimization
 */

const axios = require('axios');
const { EventEmitter } = require('events');

class LinearAPI extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.apiKey = options.apiKey || process.env.LINEAR_API_KEY;
    this.baseURL = options.baseURL || 'https://api.linear.app/graphql';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Rate limiting configuration
    this.rateLimit = {
      requests: 0,
      resetTime: Date.now() + 60000, // Reset every minute
      maxRequests: 1000 // Linear's rate limit
    };
    
    // Initialize axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PMP-YouTube-Channel/1.0.0'
      }
    });
    
    // Setup request/response interceptors
    this.setupInterceptors();
    
    // Validate configuration
    this.validateConfig();
  }

  /**
   * Validate API configuration
   */
  validateConfig() {
    if (!this.apiKey) {
      throw new Error('Linear API key is required. Set LINEAR_API_KEY environment variable.');
    }
    
    if (!this.apiKey.startsWith('lin_api_')) {
      throw new Error('Invalid Linear API key format. Key should start with "lin_api_"');
    }
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  setupInterceptors() {
    // Request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config) => {
        await this.checkRateLimit();
        this.emit('request', { url: config.url, method: config.method });
        return config;
      },
      (error) => {
        this.emit('error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        this.updateRateLimit(response.headers);
        this.emit('response', { status: response.status, data: response.data });
        return response;
      },
      (error) => {
        this.emit('error', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check and enforce rate limiting
   */
  async checkRateLimit() {
    const now = Date.now();
    
    // Reset rate limit counter if time window has passed
    if (now > this.rateLimit.resetTime) {
      this.rateLimit.requests = 0;
      this.rateLimit.resetTime = now + 60000;
    }
    
    // Check if we've exceeded rate limit
    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      const waitTime = this.rateLimit.resetTime - now;
      this.emit('rateLimitExceeded', { waitTime });
      await this.sleep(waitTime);
    }
    
    this.rateLimit.requests++;
  }

  /**
   * Update rate limit info from response headers
   */
  updateRateLimit(headers) {
    if (headers['x-ratelimit-remaining']) {
      this.rateLimit.requests = this.rateLimit.maxRequests - parseInt(headers['x-ratelimit-remaining']);
    }
    
    if (headers['x-ratelimit-reset']) {
      this.rateLimit.resetTime = parseInt(headers['x-ratelimit-reset']) * 1000;
    }
  }

  /**
   * Execute GraphQL query with retry logic
   */
  async executeQuery(query, variables = {}, options = {}) {
    const requestData = {
      query,
      variables
    };
    
    let lastError;
    const maxRetries = options.maxRetries || this.maxRetries;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.post('', requestData);
        
        // Check for GraphQL errors
        if (response.data.errors && response.data.errors.length > 0) {
          throw new LinearAPIError('GraphQL Error', response.data.errors);
        }
        
        return response.data.data;
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication or client errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Calculate exponential backoff delay
        const delay = this.calculateRetryDelay(attempt);
        this.emit('retry', { attempt, delay, error: error.message });
        
        await this.sleep(delay);
      }
    }
    
    throw new LinearAPIError('Max retries exceeded', lastError);
  }

  /**
   * Check if error should not be retried
   */
  isNonRetryableError(error) {
    if (error.response) {
      const status = error.response.status;
      // Don't retry on 4xx errors (except 429 rate limit)
      return status >= 400 && status < 500 && status !== 429;
    }
    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt) {
    const baseDelay = this.retryDelay;
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  /**
   * Sleep utility function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test API connection and authentication
   */
  async testConnection() {
    try {
      const query = `
        query {
          viewer {
            id
            name
            email
          }
        }
      `;
      
      const result = await this.executeQuery(query);
      this.emit('connectionTest', { success: true, user: result.viewer });
      return result.viewer;
    } catch (error) {
      this.emit('connectionTest', { success: false, error: error.message });
      throw error;
    }
  }

  // Issue Management Methods
  
  /**
   * Create a new issue in Linear
   */
  async createIssue(data) {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
            }
            assignee {
              id
              name
            }
            team {
              id
              name
            }
            priority
            createdAt
            updatedAt
          }
        }
      }
    `;
    
    const variables = {
      input: {
        title: data.title,
        description: data.description,
        teamId: data.teamId,
        assigneeId: data.assigneeId,
        priority: data.priority,
        stateId: data.stateId,
        labelIds: data.labelIds || []
      }
    };
    
    const result = await this.executeQuery(mutation, variables);
    
    if (!result.issueCreate.success) {
      throw new LinearAPIError('Failed to create issue', result.issueCreate);
    }
    
    return result.issueCreate.issue;
  }

  /**
   * Update an existing issue
   */
  async updateIssue(issueId, data) {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            state {
              id
              name
            }
            assignee {
              id
              name
            }
            priority
            updatedAt
          }
        }
      }
    `;
    
    const variables = {
      id: issueId,
      input: data
    };
    
    const result = await this.executeQuery(mutation, variables);
    
    if (!result.issueUpdate.success) {
      throw new LinearAPIError('Failed to update issue', result.issueUpdate);
    }
    
    return result.issueUpdate.issue;
  }

  /**
   * Get issue by ID or identifier
   */
  async getIssue(issueId) {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          state {
            id
            name
          }
          assignee {
            id
            name
            email
          }
          team {
            id
            name
          }
          priority
          labels {
            nodes {
              id
              name
              color
            }
          }
          createdAt
          updatedAt
          url
        }
      }
    `;
    
    const variables = { id: issueId };
    const result = await this.executeQuery(query, variables);
    
    return result.issue;
  }

  /**
   * Search issues with filters
   */
  async searchIssues(filters = {}) {
    const query = `
      query SearchIssues($filter: IssueFilter, $first: Int, $after: String) {
        issues(filter: $filter, first: $first, after: $after) {
          nodes {
            id
            identifier
            title
            description
            state {
              id
              name
            }
            assignee {
              id
              name
            }
            team {
              id
              name
            }
            priority
            createdAt
            updatedAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    
    const variables = {
      filter: filters,
      first: filters.limit || 50,
      after: filters.cursor
    };
    
    const result = await this.executeQuery(query, variables);
    return result.issues;
  }

  // Team Management Methods
  
  /**
   * Get all teams
   */
  async getTeams() {
    const query = `
      query GetTeams {
        teams {
          nodes {
            id
            name
            key
            description
            states {
              nodes {
                id
                name
                type
                position
              }
            }
            members {
              nodes {
                id
                name
                email
              }
            }
          }
        }
      }
    `;
    
    const result = await this.executeQuery(query);
    return result.teams.nodes;
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId) {
    const query = `
      query GetTeam($id: String!) {
        team(id: $id) {
          id
          name
          key
          description
          states {
            nodes {
              id
              name
              type
              position
            }
          }
          members {
            nodes {
              id
              name
              email
            }
          }
        }
      }
    `;
    
    const variables = { id: teamId };
    const result = await this.executeQuery(query, variables);
    
    return result.team;
  }

  // Webhook Management Methods
  
  /**
   * Create a webhook
   */
  async createWebhook(data) {
    const mutation = `
      mutation CreateWebhook($input: WebhookCreateInput!) {
        webhookCreate(input: $input) {
          success
          webhook {
            id
            url
            enabled
            resourceTypes
          }
        }
      }
    `;
    
    const variables = {
      input: {
        url: data.url,
        resourceTypes: data.resourceTypes || ['Issue', 'Comment'],
        enabled: data.enabled !== false
      }
    };
    
    const result = await this.executeQuery(mutation, variables);
    
    if (!result.webhookCreate.success) {
      throw new LinearAPIError('Failed to create webhook', result.webhookCreate);
    }
    
    return result.webhookCreate.webhook;
  }

  /**
   * Get all webhooks
   */
  async getWebhooks() {
    const query = `
      query GetWebhooks {
        webhooks {
          nodes {
            id
            url
            enabled
            resourceTypes
            createdAt
          }
        }
      }
    `;
    
    const result = await this.executeQuery(query);
    return result.webhooks.nodes;
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId) {
    const mutation = `
      mutation DeleteWebhook($id: String!) {
        webhookDelete(id: $id) {
          success
        }
      }
    `;
    
    const variables = { id: webhookId };
    const result = await this.executeQuery(mutation, variables);
    
    if (!result.webhookDelete.success) {
      throw new LinearAPIError('Failed to delete webhook', result.webhookDelete);
    }
    
    return true;
  }

  // User Management Methods
  
  /**
   * Get current user info
   */
  async getCurrentUser() {
    const query = `
      query GetCurrentUser {
        viewer {
          id
          name
          email
          avatarUrl
          isMe
        }
      }
    `;
    
    const result = await this.executeQuery(query);
    return result.viewer;
  }

  /**
   * Get organization info
   */
  async getOrganization() {
    const query = `
      query GetOrganization {
        organization {
          id
          name
          urlKey
          logoUrl
        }
      }
    `;
    
    const result = await this.executeQuery(query);
    return result.organization;
  }
}

/**
 * Custom error class for Linear API errors
 */
class LinearAPIError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'LinearAPIError';
    this.details = details;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LinearAPIError);
    }
  }
}

module.exports = {
  LinearAPI,
  LinearAPIError
};