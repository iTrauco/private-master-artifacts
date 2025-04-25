# BigQuery Integration Architecture Implementation Guide

This guide provides a step-by-step approach to refactoring your BigQuery integration with minimal changes while improving maintainability and architecture.

<details>
<summary>Table of Contents</summary>

## Table of Contents
- [Prerequisites](#prerequisites)
- [Implementation Steps](#implementation-steps)
- [Testing Strategy](#testing-strategy)
- [Troubleshooting](#troubleshooting)
- [Further Enhancements](#further-enhancements)

</details>

<details>
<summary>Prerequisites</summary>

## Prerequisites

<details>
<summary>Dependencies to Install</summary>

### Dependencies to Install
```bash
# Install Google Cloud Resource Manager API
npm install @google-cloud/resource-manager --save

# Make sure other required dependencies are installed
npm install @google-cloud/bigquery dotenv --save
```

</details>

<details>
<summary>Environment Variables</summary>

### Environment Variables
Ensure you have a `.env` file at the project root with:
```
BQ_PROJECT_ID=your-project-id
BQ_KEY_PATH=/path/to/your/key.json
BQ_USE_REAL_DATA=true
```

</details>

</details>

<details>
<summary>Implementation Steps</summary>

## Implementation Steps

<details>
<summary>Step 1: Create API Client Abstraction</summary>

### Step 1: Create API Client Abstraction
Create a new file: `server/utils/bigquery/api-client.js`

```javascript
/**
 * BigQuery API Client Abstraction
 * Handles initialization and management of Google Cloud clients
 */
const { BigQuery } = require('@google-cloud/bigquery');
const { ProjectsClient } = require('@google-cloud/resource-manager');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');

// Client singletons
let bigQueryClient = null;
let projectsClient = null;

/**
 * Get key file information
 * @returns {Object} Key path, existence status, and project ID
 */
const getKeyInfo = () => {
  const keyPath = process.env.BQ_KEY_PATH || 
    path.join(__dirname, '../../config/keys/trauco-bq-monitor-dev-sa-ed1febb00448.json');
  return {
    keyPath,
    exists: fs.existsSync(keyPath),
    projectId: process.env.BQ_PROJECT_ID || 'atca-mvp-test'
  };
};

/**
 * Get or initialize BigQuery client
 * @returns {BigQuery|null} BigQuery client or null if initialization fails
 */
const getBigQueryClient = async () => {
  if (!bigQueryClient) {
    const { keyPath, exists, projectId } = getKeyInfo();
    if (!exists) {
      logger.error(`🔑 BigQuery service account key file not found at: ${keyPath}`);
      return null;
    }
    
    try {
      logger.info(`🔑 Initializing BigQuery client with key: ${keyPath}`);
      bigQueryClient = new BigQuery({
        keyFilename: keyPath,
        projectId: projectId
      });
      logger.info('✅ BigQuery client initialized successfully!');
    } catch (error) {
      logger.error(`❌ Failed to initialize BigQuery client: ${error.message}`);
      return null;
    }
  }
  return bigQueryClient;
};

/**
 * Get or initialize Resource Manager Projects client
 * @returns {ProjectsClient|null} Projects client or null if initialization fails
 */
const getProjectsClient = async () => {
  if (!projectsClient) {
    const { keyPath, exists } = getKeyInfo();
    if (!exists) {
      logger.error(`🔑 Service account key file not found at: ${keyPath}`);
      return null;
    }
    
    try {
      logger.info(`🔑 Initializing Projects client with key: ${keyPath}`);
      projectsClient = new ProjectsClient({
        keyFilename: keyPath
      });
      logger.info('✅ Projects client initialized successfully!');
    } catch (error) {
      logger.error(`❌ Failed to initialize Projects client: ${error.message}`);
      return null;
    }
  }
  return projectsClient;
};

/**
 * Reset clients (useful for testing)
 */
const resetClients = () => {
  bigQueryClient = null;
  projectsClient = null;
};

module.exports = {
  getBigQueryClient,
  getProjectsClient,
  getKeyInfo,
  resetClients
};
```

</details>

<details>
<summary>Step 2: Create a Constants File</summary>

### Step 2: Create a Constants File
Create `server/utils/constants.js`:

```javascript
/**
 * Application Constants
 * Centralizes configuration values and constants
 */
module.exports = {
  // Feature flags
  FEATURES: {
    USE_REAL_DATA: process.env.BQ_USE_REAL_DATA === 'true'
  },
  
  // API endpoints
  API_ENDPOINTS: {
    PROJECTS: '/api/bigquery/projects',
    PROJECT_STATS: '/api/bigquery/stats'
  },
  
  // BigQuery settings
  BQ_SETTINGS: {
    REFRESH_INTERVAL: 30, // seconds
    COST_PER_TB: 5, // dollars
    DATA_MOCK_MIN_DATASETS: 3,
    DATA_MOCK_MAX_DATASETS: 8
  }
};
```

</details>

<details>
<summary>Step 3: Create Environment Validator</summary>

### Step 3: Create Environment Validator
Create `server/utils/env-validator.js`:

```javascript
/**
 * Environment Validation Utilities
 * Validates required environment variables and configurations
 */
const fs = require('fs');
const logger = require('./logger');

/**
 * Validate BigQuery environment configuration
 * @returns {boolean} Whether the environment is valid
 */
function validateBigQueryEnvironment() {
  const requiredVars = ['BQ_PROJECT_ID', 'BQ_KEY_PATH'];
  let isValid = true;
  let missingVars = [];
  
  // Check required environment variables
  for (const key of requiredVars) {
    if (!process.env[key]) {
      missingVars.push(key);
      isValid = false;
    }
  }
  
  if (missingVars.length > 0) {
    logger.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  // Check if key file exists
  if (process.env.BQ_KEY_PATH && !fs.existsSync(process.env.BQ_KEY_PATH)) {
    logger.warn(`⚠️ BigQuery key file not found at ${process.env.BQ_KEY_PATH}`);
    isValid = false;
  }
  
  // Validate BQ_USE_REAL_DATA setting
  if (process.env.BQ_USE_REAL_DATA !== 'true' && process.env.BQ_USE_REAL_DATA !== 'false') {
    logger.warn(`⚠️ BQ_USE_REAL_DATA should be 'true' or 'false', found: ${process.env.BQ_USE_REAL_DATA}`);
  }
  
  return isValid;
}

module.exports = {
  validateBigQueryEnvironment
};
```

</details>

<details>
<summary>Step 4: Update Server.js for Environment Validation</summary>

### Step 4: Update Server.js for Environment Validation
Add the validation to `server/server.js` after your require statements:

```javascript
// After your require statements
const { validateBigQueryEnvironment } = require('./utils/env-validator');

// Before starting the server
logger.info('🔍 Validating BigQuery environment configuration...');
const bqEnvValid = validateBigQueryEnvironment();
if (!bqEnvValid) {
  logger.warn('⚠️ BigQuery environment is not properly configured. Some features may use mock data.');
} else {
  logger.info('✅ BigQuery environment configuration valid');
}
```

</details>

<details>
<summary>Step 5: Update query-service.js</summary>

### Step 5: Update query-service.js
Modify `server/utils/bigquery/query-service.js` to use the new abstraction:

```javascript
/**
 * BigQuery Service Utility
 * Handles integration with the Google BigQuery API
 */
const dotenv = require('dotenv');
dotenv.config();

// Log all environment variables for debugging
console.log('🔧 BIGQUERY-SERVICE ENV VARIABLES:');
console.log('BQ_PROJECT_ID:', process.env.BQ_PROJECT_ID);
console.log('BQ_KEY_PATH:', process.env.BQ_KEY_PATH);
console.log('BQ_USE_REAL_DATA:', process.env.BQ_USE_REAL_DATA);

// Import dependencies
const mockDataGenerator = require('./mock-data-generator');
const apiClient = require('./api-client');
const { FEATURES } = require('../constants');
const logger = require('../logger');

// BigQuery service implementation
const bigQueryService = {
  /**
   * Get list of available GCP projects 
   * @param {boolean} useRealData - Whether to use real data
   * @returns {Promise<Object>} Object containing projects and metadata
   */
  getProjects: async function(useRealData = false) {
    try {
      // Get key file info
      const { keyPath, exists } = apiClient.getKeyInfo();
      const keyFileExists = exists;

      // Add detailed logging
      console.log(`📊 SERVER: getProjects called with useRealData=${useRealData}, keyFileExists=${keyFileExists}`);
      console.log(`📊 SERVER: Key file path: ${keyPath}`);
      console.log(`📊 SERVER: Current working directory: ${process.cwd()}`);
      
      // Log the request details
      logger.info(`📊 getProjects called with useRealData=${useRealData}, keyFileExists=${keyFileExists}`);
      
      // If mock data is requested or key file doesn't exist
      if (!useRealData || !keyFileExists) {
        logger.info(useRealData ? '🔑 Service account key not found, using mock data' : '🧪 Mock data requested');
        const mockProjects = mockDataGenerator.generateMockProjects();
        logger.info(`📁 Returning ${mockProjects.length} mock projects`);
        return { 
          projects: mockProjects, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Get Projects client
      const client = await apiClient.getProjectsClient();
      
      if (!client) {
        logger.error('❌ Failed to get Projects client, falling back to mock data');
        const mockProjects = mockDataGenerator.generateMockProjects();
        return { 
          projects: mockProjects, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      logger.info('🔍 Fetching real GCP projects');
      
      // Get list of projects the service account has access to using Resource Manager API
      const [projects] = await client.searchProjects();
      logger.info(`📁 Found ${projects?.length || 0} real GCP projects`);
      
      if (!projects || projects.length === 0) {
        logger.warn('⚠️ No GCP projects found, falling back to mock data');
        const mockProjects = mockDataGenerator.generateMockProjects();
        logger.info(`📁 Returning ${mockProjects.length} mock projects as fallback`);
        return { 
          projects: mockProjects, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Format projects to match expected structure
      const formattedProjects = projects.map(project => ({
        id: project.name.split('/').pop(), // Resource Manager returns format "projects/project-id"
        name: project.displayName || project.name.split('/').pop()
      }));
      
      logger.info(`📁 Returning ${formattedProjects.length} real GCP projects`);
      return { 
        projects: formattedProjects, 
        isRealData: true,
        keyFileExists: keyFileExists
      };
    } catch (error) {
      logger.error(`❌ Error fetching real GCP projects: ${error.message}`);
      logger.error(error.stack);
      
      // Check if key file exists for status reporting
      const { exists } = apiClient.getKeyInfo();
      
      // Fall back to mock data on error
      const mockProjects = mockDataGenerator.generateMockProjects();
      return { 
        projects: mockProjects, 
        isRealData: false,
        keyFileExists: exists,
        error: error.message 
      };
    }
  },
  
  /**
   * Get BigQuery stats for a specific project
   * @param {string} projectId - GCP Project ID
   * @param {boolean} useRealData - Whether to use real data
   * @returns {Promise<Object>} Project statistics
   */
  getProjectStats: async function(projectId, useRealData = false) {
    try {
      // Get key file info from abstraction
      const { exists } = apiClient.getKeyInfo();
      const keyFileExists = exists;
      
      // If mock data is requested or key file doesn't exist
      if (!useRealData || !keyFileExists) {
        logger.info(useRealData ? '🔑 Service account key not found, using mock data' : '🧪 Mock data requested');
        const mockStats = mockDataGenerator.generateMockProjectStats(projectId);
        return { 
          ...mockStats, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Get BigQuery client using the abstraction
      const client = await apiClient.getBigQueryClient();
      
      if (!client) {
        logger.error('❌ Failed to get BigQuery client, falling back to mock data');
        const mockStats = mockDataGenerator.generateMockProjectStats(projectId);
        return { 
          ...mockStats, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      logger.info(`🔍 Fetching real BigQuery stats for project: ${projectId}`);
      
      // Rest of the existing implementation...
      // Get datasets for the project
      const [datasets] = await client.getDatasets({ projectId });
      
      if (!datasets || datasets.length === 0) {
        logger.warn(`⚠️ No datasets found for project ${projectId}, falling back to mock data`);
        const mockStats = mockDataGenerator.generateMockProjectStats(projectId);
        return { 
          ...mockStats, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Get dataset details
      const datasetStats = await Promise.all(
        datasets.map(async (dataset) => {
          const [tables] = await dataset.getTables();
          const [metadata] = await dataset.getMetadata();
          
          // Calculate dataset size - this is simplified and not accurate 
          // Real size calculation would require more complex queries
          let totalSize = 0;
          
          // Count views, tables, and routines
          let viewCount = 0;
          let tableCount = 0;
          let routineCount = 0;
          
          for (const table of tables) {
            const [tableMetadata] = await table.getMetadata();
            if (tableMetadata.type === 'VIEW') {
              viewCount++;
            } else {
              tableCount++;
              // Add table size if available
              if (tableMetadata.numBytes) {
                totalSize += parseInt(tableMetadata.numBytes, 10);
              }
            }
          }
          
          // Format size
          let sizeStr = '';
          if (totalSize < 1024 * 1024 * 1024) {
            sizeStr = `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
          } else if (totalSize < 1024 * 1024 * 1024 * 1024) {
            sizeStr = `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`;
          } else {
            sizeStr = `${(totalSize / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
          }
          
          return {
            id: dataset.id,
            tables: tableCount,
            views: viewCount,
            routines: routineCount,
            size: sizeStr,
            lastModified: metadata.lastModifiedTime
          };
        })
      );
      
      // Query stats are more complex to get accurately
      // This is a simplified version
      const queryStats = {
        activeJobs: Math.floor(Math.random() * 5), // Replace with actual query
        averageBytes: `${(Math.random() * 10).toFixed(1)} GB`, // Replace with actual query
        dailyCost: `$${(Math.random() * 100).toFixed(2)}` // Replace with actual query
      };
      
      return {
        projectId,
        datasets: datasetStats,
        queryStats,
        timestamp: new Date().toISOString(),
        isRealData: true,
        keyFileExists: keyFileExists
      };
      
    } catch (error) {
      logger.error(`❌ Error fetching real BigQuery stats for project ${projectId}`, error);
      // Fall back to mock data on error
      const mockStats = mockDataGenerator.generateMockProjectStats(projectId);
      return { 
        ...mockStats, 
        isRealData: false,
        error: error.message 
      };
    }
  },
  
  // Add additional methods here as needed
};

module.exports = bigQueryService;
```

</details>

</details>

<details>
<summary>Testing Strategy</summary>

## Testing Strategy

<details>
<summary>Step 1: Verify Environment Setup</summary>

### Step 1: Verify Environment Setup
```bash
# Check if your .env file is properly configured
cat .env
```

Verify that these variables are set:
- `BQ_PROJECT_ID`
- `BQ_KEY_PATH`
- `BQ_USE_REAL_DATA=true`

</details>

<details>
<summary>Step 2: Verify Service Account Key</summary>

### Step 2: Verify Service Account Key
```bash
# Check if the key file exists and is valid JSON
cat $BQ_KEY_PATH
```

</details>

<details>
<summary>Step 3: Test API Client Independently</summary>

### Step 3: Test API Client Independently
Create `test-api-client.js`:

```javascript
// Simple test script for API client
const apiClient = require('./server/utils/bigquery/api-client');
const dotenv = require('dotenv');
dotenv.config();

async function testClients() {
  console.log('Testing key info...');
  const keyInfo = apiClient.getKeyInfo();
  console.log('Key info:', keyInfo);
  
  console.log('\nTesting BigQuery client...');
  const bqClient = await apiClient.getBigQueryClient();
  console.log('BigQuery client initialized:', !!bqClient);
  
  console.log('\nTesting Projects client...');
  const projectsClient = await apiClient.getProjectsClient();
  console.log('Projects client initialized:', !!projectsClient);
  
  if (projectsClient) {
    try {
      console.log('\nTesting projects listing...');
      const [projects] = await projectsClient.searchProjects();
      console.log(`Found ${projects.length} projects`);
      projects.forEach(p => {
        console.log(`- ${p.name}: ${p.displayName || 'No display name'}`);
      });
    } catch (error) {
      console.error('Error listing projects:', error);
    }
  }
}

testClients().catch(console.error);
```

Run the test:
```bash
node test-api-client.js
```

</details>

<details>
<summary>Step 4: End-to-End Testing</summary>

### Step 4: End-to-End Testing

Start your server and verify:
1. Check the server logs for environment validation messages
2. Open the application and check if real projects are displayed
3. Verify that the "Real Data" indicator shows in the UI
4. Check if datasets are displayed when selecting a project

</details>

</details>

<details>
<summary>Troubleshooting</summary>

## Troubleshooting

<details>
<summary>Common Issues and Solutions</summary>

### Common Issues and Solutions

<details>
<summary>1. "Client.searchProjects is not a function"</summary>

#### 1. "Client.searchProjects is not a function"
- **Cause**: Resource Manager package is not installed or imported correctly
- **Solution**: 
  ```bash
  npm install @google-cloud/resource-manager --save
  ```

</details>

<details>
<summary>2. "No projects returned" or "Mock data used despite useRealData=true"</summary>

#### 2. "No projects returned" or "Mock data used despite useRealData=true"
- **Cause**: Service account doesn't have permissions to list projects
- **Solution**: Verify GCP IAM permissions for the service account; it needs at least `resourcemanager.projects.list` permission

</details>

<details>
<summary>3. "Error: Cannot find module '@google-cloud/resource-manager'"</summary>

#### 3. "Error: Cannot find module '@google-cloud/resource-manager'"
- **Cause**: Package not installed
- **Solution**: Install the package as mentioned above

</details>

<details>
<summary>4. "Error: Service account key file not found"</summary>

#### 4. "Error: Service account key file not found"
- **Cause**: BQ_KEY_PATH is incorrect or file doesn't exist
- **Solution**: 
  - Check the full path: `ls -la $BQ_KEY_PATH`
  - Ensure the path is absolute: `/home/user/...` instead of relative
  - Check file permissions: `chmod 600 $BQ_KEY_PATH`

</details>

<details>
<summary>5. "ServiceAccountJwtAccessError"</summary>

#### 5. "ServiceAccountJwtAccessError"
- **Cause**: Invalid service account key file
- **Solution**: Verify the key is valid and not corrupted:
  - Check JSON format: `jq . $BQ_KEY_PATH`
  - Generate a new key if necessary from GCP console

</details>

<details>
<summary>6. "Data source indicator shows Mock Data despite configuration"</summary>

#### 6. "Data source indicator shows Mock Data despite configuration"
- **Cause**: Frontend not receiving correct settings from server
- **Solution**: Check browser Network tab for API responses:
  - Look at `/api/bigquery/projects` response
  - Verify `isRealData` property is `true`
  - Check localStorage settings: open browser console and type `localStorage.getItem('bq_settings')`

</details>

</details>

</details>

<details>
<summary>Further Enhancements</summary>

## Further Enhancements

Once the basic architecture is working, consider these improvements:

1. **Add Unit Tests**:
   ```javascript
   // Example test structure with Jest
   describe('BigQuery API Client', () => {
     test('should get key info', () => {
       const keyInfo = apiClient.getKeyInfo();
       expect(keyInfo).toHaveProperty('exists');
     });
   });
   ```

2. **Implement Data Normalization Module**:
   Create a separate module to standardize data formats between real and mock data.

3. **Add Query Caching**:
   Implement a simple caching layer to reduce API calls for frequently accessed data.

4. **Implement Logging Middleware**:
   Create a middleware to track and log BigQuery usage for troubleshooting.

5. **Use TypeScript**:
   Consider migrating to TypeScript for better type safety and developer experience.

</details>
