# Connecting Your Application to Real BigQuery Datasets

This guide outlines the steps needed to connect your monitoring application to actual BigQuery datasets using the Google Cloud BigQuery API.

## 1. Set up Google Cloud Project and Authentication

First, you'll need a Google Cloud project with BigQuery enabled:

1. Create or use an existing Google Cloud project
2. Enable the BigQuery API in the Google Cloud Console
3. Create a service account with appropriate permissions:
   - BigQuery Data Viewer (to read metadata)
   - BigQuery Job User (to run queries)
   - BigQuery User (for general access)

## 2. Install the BigQuery Client Library

```bash
npm install @google-cloud/bigquery
```

## 3. Update the Query Service with Real BigQuery Implementation

Replace your mock implementation in `server/utils/bigquery/query-service.js` with this:

```javascript
// server/utils/bigquery/query-service.js
const {BigQuery} = require('@google-cloud/bigquery');

// Initialize the BigQuery client
// This uses Application Default Credentials or the GOOGLE_APPLICATION_CREDENTIALS env variable
const bigquery = new BigQuery();

const bigQueryService = {
    /**
     * Get list of available GCP projects 
     * @returns {Promise<Array>} List of projects
     */
    getProjects: async function() {
        console.log('Getting BigQuery projects');
        try {
            // Get projects the service account has access to
            const [projects] = await bigquery.getProjects();
            return projects.map(project => ({
                id: project.id,
                name: project.friendlyName || project.id
            }));
        } catch (error) {
            console.error('Error getting BigQuery projects:', error);
            throw error;
        }
    },
    
    /**
     * Get BigQuery stats for a specific project
     * @param {string} projectId - GCP Project ID
     * @returns {Promise<Object>} Project statistics
     */
    getProjectStats: async function(projectId) {
        console.log(`Getting BigQuery stats for project: ${projectId}`);
        try {
            // Get datasets in the project
            const [datasets] = await bigquery.getDatasets({projectId});
            
            // Process datasets in parallel
            const datasetStats = await Promise.all(
                datasets.map(async (dataset) => {
                    const datasetId = dataset.id;
                    
                    // Get tables in the dataset
                    const [tables] = await dataset.getTables();
                    
                    // Get views (tables where type is 'VIEW')
                    const views = tables.filter(table => 
                        table.metadata && table.metadata.type === 'VIEW');
                    
                    // Get routines (stored procedures, UDFs, etc.)
                    let routines = [];
                    try {
                        [routines] = await dataset.getRoutines();
                    } catch (err) {
                        // Some datasets might not support routines API
                        console.log(`Could not get routines for ${datasetId}:`, err.message);
                    }
                    
                    // Get size information
                    let size = '0 MB';
                    try {
                        // This is an approximation, as getting exact dataset size requires
                        // querying INFORMATION_SCHEMA which can be expensive
                        const tablesSizes = await Promise.all(
                            tables
                                .filter(table => table.metadata && table.metadata.type === 'TABLE')
                                .map(async (table) => {
                                    try {
                                        const [metadata] = await table.getMetadata();
                                        return metadata.numBytes || 0;
                                    } catch (err) {
                                        return 0;
                                    }
                                })
                        );
                        
                        const totalBytes = tablesSizes.reduce((acc, curr) => acc + curr, 0);
                        if (totalBytes < 1024 * 1024) {
                            size = `${(totalBytes / 1024).toFixed(2)} KB`;
                        } else if (totalBytes < 1024 * 1024 * 1024) {
                            size = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
                        } else if (totalBytes < 1024 * 1024 * 1024 * 1024) {
                            size = `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
                        } else {
                            size = `${(totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
                        }
                    } catch (err) {
                        console.log(`Could not calculate size for ${datasetId}:`, err.message);
                    }
                    
                    return {
                        id: datasetId,
                        tables: tables.filter(t => t.metadata && t.metadata.type === 'TABLE').length,
                        views: views.length,
                        routines: routines.length,
                        size: size
                    };
                })
            );
            
            // Get query statistics
            let queryStats = {
                activeJobs: 0,
                averageBytes: '0 MB',
                dailyCost: '$0.00'
            };
            
            try {
                // Get recent jobs (last 24 hours)
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                const [jobs] = await bigquery.getJobs({
                    projectId: projectId,
                    stateFilter: 'all',
                    minCreationTime: yesterday
                });
                
                // Count active jobs
                const activeJobs = jobs.filter(job => 
                    job.metadata.status && job.metadata.status.state === 'RUNNING');
                
                // Calculate average bytes processed for QUERY jobs
                const queryJobs = jobs.filter(job => 
                    job.metadata.configuration && 
                    job.metadata.configuration.query);
                
                let totalBytes = 0;
                let processedJobs = 0;
                
                queryJobs.forEach(job => {
                    if (job.metadata.statistics && 
                        job.metadata.statistics.totalBytesProcessed) {
                        totalBytes += parseInt(job.metadata.statistics.totalBytesProcessed);
                        processedJobs++;
                    }
                });
                
                let avgBytes = 0;
                if (processedJobs > 0) {
                    avgBytes = totalBytes / processedJobs;
                }
                
                // Format average bytes
                let avgBytesFormatted = '0 MB';
                if (avgBytes < 1024 * 1024) {
                    avgBytesFormatted = `${(avgBytes / 1024).toFixed(2)} KB`;
                } else if (avgBytes < 1024 * 1024 * 1024) {
                    avgBytesFormatted = `${(avgBytes / (1024 * 1024)).toFixed(2)} MB`;
                } else if (avgBytes < 1024 * 1024 * 1024 * 1024) {
                    avgBytesFormatted = `${(avgBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
                } else {
                    avgBytesFormatted = `${(avgBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
                }
                
                // Estimate cost (very rough approximation)
                // Real cost calculation requires billing API or information_schema.JOBS
                const estimatedCostPerTB = 5; // $5 per TB for on-demand pricing
                const totalTB = totalBytes / (1024 * 1024 * 1024 * 1024);
                const estimatedCost = totalTB * estimatedCostPerTB;
                
                queryStats = {
                    activeJobs: activeJobs.length,
                    averageBytes: avgBytesFormatted,
                    dailyCost: `$${estimatedCost.toFixed(2)}`
                };
                
            } catch (err) {
                console.log(`Could not get query stats for ${projectId}:`, err.message);
            }
            
            return {
                projectId,
                datasets: datasetStats,
                queryStats: queryStats,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error getting BigQuery stats for project ${projectId}:`, error);
            throw error;
        }
    }
};

module.exports = bigQueryService;
```

## 4. Set Up Authentication Credentials

There are several ways to set up authentication:

### Option 1: Environment Variable

Download your service account key file and set an environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
```

### Option 2: Explicit Authentication in Code

You can also authenticate explicitly in code (though this is less recommended for security reasons):

```javascript
const {BigQuery} = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId: 'your-project-id',
  keyFilename: '/path/to/your-service-account-key.json'
});
```

## 5. Error Handling and Rate Limiting

Add better error handling and respect API rate limits:

```javascript
// Add this to your bigQueryService

// Simple rate limiting 
const rateLimiter = {
  lastRequestTime: 0,
  minRequestInterval: 500, // ms between requests
  
  async throttle() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      // Wait for the appropriate time
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }
};

// Then call rateLimiter.throttle() before each BigQuery API call
```

## 6. Testing in Development

For development, you might want to keep your mock data as a fallback:

```javascript
// Add a flag to switch between real and mock data
const USE_REAL_DATA = process.env.NODE_ENV === 'production';

// Then in your methods:
getProjects: async function() {
  if (!USE_REAL_DATA) {
    return mockDataGenerator.generateMockProjects();
  }
  
  // Real implementation...
}
```

## 7. API Optimization Considerations

BigQuery can be expensive if not used carefully. Consider these optimizations:

- Cache frequently accessed metadata
- Limit the frequency of job and dataset stats refreshes
- Use cost controls and quotas in your Google Cloud project
- Consider using INFORMATION_SCHEMA views for more efficient metadata queries

## 8. Advanced Features to Consider

Once you have the basic integration working, consider adding these enhancements:

1. **Query History Tracking**
   - Store query history in your application database
   - Track costs and performance over time

2. **User-Specific Views**
   - Allow users to save custom views of their most used datasets
   - Personalize the monitoring experience

3. **Cost Alerts**
   - Set up thresholds for query costs
   - Send notifications when thresholds are exceeded

4. **Performance Optimization Suggestions**
   - Analyze query patterns
   - Suggest table partitioning or clustering

5. **Integration with BigQuery ML**
   - Monitor ML models in BigQuery
   - Track training and prediction jobs
