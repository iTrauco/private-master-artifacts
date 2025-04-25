/**
 * Path: /server/config/cloud-functions.js
 * Configuration for the Cloud Functions module
 */
require('dotenv').config();

// Log all environment variables for debugging
console.log('🔧 CF-CONFIG ENV VARIABLES:');
console.log('CF_PROJECT_ID:', process.env.CF_PROJECT_ID);
console.log('CF_KEY_PATH:', process.env.CF_KEY_PATH);
console.log('CF_REGION:', process.env.CF_REGION);

module.exports = {
  // Settings for Cloud Functions API access
  useRealData: process.env.CF_USE_REAL_DATA === 'true' || false, // Use env var or default to false
  rateLimitMs: 500, // Minimum milliseconds between API calls
  
  // Service account configuration
  serviceAccount: {
    keyPath: process.env.CF_KEY_PATH || '/home/trauco/Prod/private-tracking/01-visual-overlay/server/config/keys/trauco-functions-sa.json',
    defaultProjectId: process.env.CF_PROJECT_ID || 'atca-mvp-test',
    defaultRegion: process.env.CF_REGION || 'us-central1'
  },
  
  // Settings for mock data generation
  mockFunctions: {
    min: 3,
    max: 8
  },
  
  // Settings for logs
  logRetentionDays: 7, // Number of days of logs to display
  
  // Performance metrics
  invocationLimit: 5000, // Estimated invocation limit before warning
};

/**
 * Path: /server/routes/api/cloud-functions.js
 * API routes for Cloud Functions
 */
// 🟦 Imports
const createApiRouter = require('../../utils/route-template');
const cloudFunctionsService = require('../../utils/cloud-functions/functions-service');
const logger = require('../../utils/logger');
const config = require('../../config/cloud-functions');

// 🎯 Cloud Functions Route Handlers
const cloudFunctionsHandlers = {
  getFunctions: async (req, res, next) => {
    try {
      logger.info(`📊 Getting Cloud Functions`);
      
      // Get useRealData from query param or default to settings
      const useRealData = req.query.useRealData === 'true' || req.query.useRealData === true;
      
      const result = await cloudFunctionsService.getFunctions(useRealData);
      logger.info(`📁 Found ${result.functions.length} functions (isRealData: ${result.isRealData})`);
      
      // Add service account status information to the response
      const serviceAccountInfo = {
        keyPath: config.serviceAccount.keyPath,
        configuredProjectId: config.serviceAccount.defaultProjectId,
        configuredRegion: config.serviceAccount.defaultRegion,
        keyFileExists: result.keyFileExists || false
      };
      
      res.json({
        ...result,
        serviceAccountInfo
      });
    } catch (error) {
      logger.error('❌ Error fetching Cloud Functions:', error);
      next(error);
    }
  },

  getFunctionLogs: async (req, res, next) => {
    const { functionId } = req.params;
    const useRealData = req.query.useRealData === 'true' || req.query.useRealData === true;
    
    try {
      logger.info(`📈 Getting logs for function: ${functionId} (useRealData: ${useRealData})`);
      const result = await cloudFunctionsService.getFunctionLogs(functionId, useRealData);
      logger.info(`📊 Logs retrieved for function ${functionId} (isRealData: ${result.isRealData})`);
      
      res.json(result);
    } catch (error) {
      logger.error(`❌ Error fetching logs for function ${functionId}`, error);
      next(error);
    }
  },
  
  getFunctionStats: async (req, res, next) => {
    const { functionId } = req.params;
    const useRealData = req.query.useRealData === 'true' || req.query.useRealData === true;
    
    try {
      logger.info(`📈 Getting stats for function: ${functionId} (useRealData: ${useRealData})`);
      const result = await cloudFunctionsService.getFunctionStats(functionId, useRealData);
      logger.info(`📊 Stats retrieved for function ${functionId} (isRealData: ${result.isRealData})`);
      
      res.json(result);
    } catch (error) {
      logger.error(`❌ Error fetching stats for function ${functionId}`, error);
      next(error);
    }
  }
};

// 🚀 Export router using the route template
module.exports = createApiRouter('cloud-functions', (router) => {
  router.get('/functions', cloudFunctionsHandlers.getFunctions);
  router.get('/logs/:functionId', cloudFunctionsHandlers.getFunctionLogs);
  router.get('/stats/:functionId', cloudFunctionsHandlers.getFunctionStats);
  logger.info('☁️ Cloud Functions API routes initialized');
});

/**
 * Path: /server/utils/cloud-functions/mock-data-generator.js
 * Generator for mock Cloud Functions data
 */
// Helper to generate random number within range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to get random item from array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMockFunctions() {
  // Function name prefixes for realistic names
  const prefixes = ['process', 'handle', 'trigger', 'create', 'update', 'delete', 'get', 'transform', 'schedule', 'notify'];
  const domains = ['user', 'order', 'payment', 'notification', 'email', 'document', 'api', 'backup', 'auth', 'analytics'];
  const statuses = ['ACTIVE', 'DEPLOYING', 'FAILED', 'OFFLINE'];
  const runtimes = ['nodejs14', 'nodejs16', 'nodejs18', 'python39', 'python310', 'go116', 'go119', 'java11', 'java17'];
  
  const numFunctions = randomInt(5, 10);
  const functions = [];
  
  for (let i = 0; i < numFunctions; i++) {
    const prefix = randomItem(prefixes);
    const domain = randomItem(domains);
    const name = `${prefix}-${domain}`;
    const status = randomItem(statuses);
    const runtime = randomItem(runtimes);
    
    functions.push({
      id: `function-${i + 1}`,
      name: name,
      status: status,
      runtime: runtime,
      version: `v${randomInt(1, 5)}`,
      lastUpdated: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      region: 'us-central1',
      memoryMb: randomItem([128, 256, 512, 1024, 2048])
    });
  }
  
  return functions;
}

function generateMockLogs(functionId) {
  const severities = ['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL'];
  const messageTemplates = [
    'Function execution started',
    'Function execution completed',
    'Function execution took {time}ms',
    'Processing request with ID: {id}',
    'Connecting to database',
    'Database query completed in {time}ms',
    'API request to {service} started',
    'API request to {service} completed in {time}ms',
    'Error: {error}',
    'Warning: {warning}',
    'Memory usage: {memory}MB',
    'CPU usage: {cpu}%',
    'Cache hit ratio: {ratio}%',
    'Processed {count} items',
    'Function invoked by trigger: {trigger}'
  ];
  
  const services = ['Firestore', 'Cloud Storage', 'Pub/Sub', 'BigQuery', 'Auth', 'Stripe', 'Twilio', 'SendGrid'];
  const errors = ['Connection timeout', 'API rate limit exceeded', 'Invalid argument', 'Permission denied', 'Resource not found'];
  const warnings = ['High latency detected', 'Low memory available', 'Deprecated method used', 'Rate limit approaching', 'Cache miss rate high'];
  const triggers = ['HTTP', 'Pub/Sub', 'Firestore', 'Storage', 'Auth', 'Scheduler', 'Analytics'];
  
  const numLogs = randomInt(20, 50);
  const logs = [];
  
  // Generate logs with timestamps spanning the last 24 hours
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  for (let i = 0; i < numLogs; i++) {
    const severity = randomItem(severities);
    let messageTemplate = randomItem(messageTemplates);
    
    // Replace placeholders
    let message = messageTemplate
      .replace('{time}', randomInt(10, 5000))
      .replace('{id}', `req-${randomInt(1000, 9999)}`)
      .replace('{service}', randomItem(services))
      .replace('{error}', randomItem(errors))
      .replace('{warning}', randomItem(warnings))
      .replace('{memory}', randomInt(50, 500))
      .replace('{cpu}', randomInt(5, 95))
      .replace('{ratio}', randomInt(0, 100))
      .replace('{count}', randomInt(1, 1000))
      .replace('{trigger}', randomItem(triggers));
    
    // Generate random timestamp within the last 24 hours
    const timestamp = new Date(oneDayAgo + randomInt(0, 24 * 60 * 60 * 1000)).toISOString();
    
    logs.push({
      functionId: functionId,
      severity: severity,
      timestamp: timestamp,
      message: message,
      execution_id: `exec-${randomInt(10000, 99999)}`
    });
  }
  
  // Sort logs by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return logs;
}

function generateMockFunctionStats(functionId) {
  // Generate random stats
  const invocations = randomInt(100, 10000);
  const errors = randomInt(0, invocations * 0.1); // 0-10% error rate
  const avgExecutionTime = `${randomInt(50, 2000)}ms`;
  const memoryUsage = `${randomInt(64, 512)}MB`;
  
  // Generate execution history for past 7 days
  const executionHistory = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const dayInvocations = randomInt(10, 1500);
    const dayErrors = randomInt(0, dayInvocations * 0.1);
    
    executionHistory.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toISOString().split('T')[0],
      invocations: dayInvocations,
      errors: dayErrors
    });
  }
  
  return {
    functionId: functionId,
    invocations: invocations,
    errors: errors,
    avgExecutionTime: avgExecutionTime,
    memoryUsage: memoryUsage,
    executionHistory: executionHistory,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateMockFunctions,
  generateMockLogs,
  generateMockFunctionStats
};

/**
 * Path: /server/utils/cloud-functions/functions-service.js
 * Service for handling Cloud Functions data
 */
/**
 * Cloud Functions Service Utility
 * Handles integration with the Google Cloud Functions API
 */
// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Log all environment variables for debugging
console.log('🔧 CLOUD-FUNCTIONS-SERVICE ENV VARIABLES:');
console.log('CF_PROJECT_ID:', process.env.CF_PROJECT_ID);
console.log('CF_KEY_PATH:', process.env.CF_KEY_PATH);
console.log('CF_REGION:', process.env.CF_REGION);

// Import dependencies
const mockDataGenerator = require('./mock-data-generator');
const { CloudFunctionsServiceClient } = require('@google-cloud/functions');
const { v1 } = require('@google-cloud/logging');
const path = require('path');
const fs = require('fs');
const logger = require('../logger');

// Initialize Cloud Functions client
let functionsClient = null;
let loggingClient = null;

// Function to initialize Cloud Functions client
async function getCloudFunctionsClient() {
  if (!functionsClient) {
    try {
      // Get service account key file path from config
      const keyFilePath = process.env.CF_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-functions-sa.json');
      const projectId = process.env.CF_PROJECT_ID || 'atca-mvp-test';
      
      logger.info(`🔑 Attempting to initialize Cloud Functions client with key: ${keyFilePath}`);
      
      // Check if the key file exists
      if (!fs.existsSync(keyFilePath)) {
        logger.error(`🔑 Cloud Functions service account key file not found at: ${keyFilePath}`);
        logger.error(`🔍 Current working directory: ${process.cwd()}`);
        return null;
      }
      
      // Initialize the client
      functionsClient = new CloudFunctionsServiceClient({
        keyFilename: keyFilePath,
        projectId: projectId
      });
      
      return functionsClient;
    } catch (error) {
      logger.error(`❌ Failed to initialize Cloud Functions client: ${error.message}`);
      logger.error(error.stack);
      return null;
    }
  }
  
  return functionsClient;
}

// Function to initialize Logging client
async function getLoggingClient() {
  if (!loggingClient) {
    try {
      // Get service account key file path from config
      const keyFilePath = process.env.CF_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-functions-sa.json');
      const projectId = process.env.CF_PROJECT_ID || 'atca-mvp-test';
      
      logger.info(`🔑 Attempting to initialize Logging client with key: ${keyFilePath}`);
      
      // Check if the key file exists
      if (!fs.existsSync(keyFilePath)) {
        logger.error(`🔑 Cloud Functions service account key file not found at: ${keyFilePath}`);
        return null;
      }
      
      // Initialize the client
      loggingClient = new v1.LoggingServiceV2Client({
        keyFilename: keyFilePath,
        projectId: projectId
      });
      
      return loggingClient;
    } catch (error) {
      logger.error(`❌ Failed to initialize Logging client: ${error.message}`);
      logger.error(error.stack);
      return null;
    }
  }
  
  return loggingClient;
}

// Cloud Functions service implementation
const cloudFunctionsService = {
  /**
   * Get list of available cloud functions 
   * @param {boolean} useRealData - Whether to use real data
   * @returns {Promise<Object>} Object containing functions and metadata
   */
  getFunctions: async function(useRealData = false) {
    try {
      // Get key file path from config
      const keyFilePath = process.env.CF_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-functions-sa.json');
      const keyFileExists = fs.existsSync(keyFilePath);
      
      // Log the request details
      logger.info(`📊 getFunctions called with useRealData=${useRealData}, keyFileExists=${keyFileExists}`);
      
      // If mock data is requested or key file doesn't exist
      if (!useRealData || !keyFileExists) {
        logger.info(useRealData ? '🔑 Service account key not found, using mock data' : '🧪 Mock data requested');
        const mockFunctions = mockDataGenerator.generateMockFunctions();
        return { 
          functions: mockFunctions, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Get Cloud Functions client
      const client = await getCloudFunctionsClient();
      
      if (!client) {
        logger.error('❌ Failed to get Cloud Functions client, falling back to mock data');
        const mockFunctions = mockDataGenerator.generateMockFunctions();
        return { 
          functions: mockFunctions, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      logger.info('🔍 Fetching real Cloud Functions');
      
      // Get Cloud Functions list
      const projectId = process.env.CF_PROJECT_ID || 'atca-mvp-test';
      const locationId = process.env.CF_REGION || 'us-central1';
      const parent = `projects/${projectId}/locations/${locationId}`;
      
      const [functions] = await client.listFunctions({ parent });
      
      if (!functions || functions.length === 0) {
        logger.warn('⚠️ No Cloud Functions found, falling back to mock data');
        const mockFunctions = mockDataGenerator.generateMockFunctions();
        return { 
          functions: mockFunctions, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Format functions to match expected structure
      const formattedFunctions = functions.map(func => {
        const name = func.name.split('/').pop();
        const status = func.status;
        const lastUpdated = func.updateTime;
        
        return {
          id: name,
          name: name,
          status: status,
          runtime: func.runtime,
          version: func.versionId || 'v1',
          lastUpdated: lastUpdated,
          region: locationId,
          memoryMb: func.availableMemoryMb
        };
      });
      
      return { 
        functions: formattedFunctions, 
        isRealData: true,
        keyFileExists: keyFileExists
      };
    } catch (error) {
      logger.error(`❌ Error fetching real Cloud Functions: ${error.message}`);
      logger.error(error.stack);
      
      // Check if key file exists for status reporting
      const keyFilePath = process.env.CF_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-functions-sa.json');
      const keyFileExists = fs.existsSync(keyFilePath);
      
      // Fall back to mock data on error
      const mockFunctions = mockDataGenerator.generateMockFunctions();
      return { 
        functions: mockFunctions, 
        isRealData: false,
        keyFileExists: keyFileExists,
        error: error.message 
      };
    }
  },
  
  /**
   * Get logs for a specific cloud function
   * @param {string} functionId - Function ID
   * @param {boolean} useRealData - Whether to use real data
   * @returns {Promise<Object>} Function logs
   */
  getFunctionLogs: async function(functionId, useRealData = false) {
    try {
      // Check if key file exists for status reporting
      const keyFilePath = process.env.CF_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-functions-sa.json');
      const keyFileExists = fs.existsSync(keyFilePath);
      
      // If mock data is requested or key file doesn't exist
      if (!useRealData || !keyFileExists) {
        logger.info(useRealData ? '🔑 Service account key not found, using mock data' : '🧪 Mock data requested');
        const mockLogs = mockDataGenerator.generateMockLogs(functionId);
        return { 
          functionId,
          logs: mockLogs, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Get Logging client
      const client = await getLoggingClient();
      
      if (!client) {
        logger.error('❌ Failed to get Logging client, falling back to mock data');
        const mockLogs = mockDataGenerator.generateMockLogs(functionId);
        return { 
          functionId,
          logs: mockLogs, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      logger.info(`🔍 Fetching real logs for Cloud Function: ${functionId}`);
      
      // Define the log filter for the specific function
      const projectId = process.env.CF_