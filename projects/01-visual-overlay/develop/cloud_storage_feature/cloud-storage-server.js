// server/utils/cloud-storage/storage-service.js
/**
 * Cloud Storage Service Utility
 * Handles integration with the Google Cloud Storage API
 */
require('dotenv').config();

// Log environment variables for debugging
console.log('🔧 CLOUD-STORAGE-SERVICE ENV VARIABLES:');
console.log('GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID);
console.log('GCS_KEY_PATH:', process.env.GCS_KEY_PATH);
console.log('GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);

// Import dependencies
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const logger = require('../logger');

// Initialize Storage client
let storageClient = null;

// Function to initialize Storage client
async function getStorageClient() {
  if (!storageClient) {
    try {
      // Get service account key file path from config
      const keyFilePath = process.env.GCS_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-bq-monitor-dev-sa-ed1febb00448.json');
      const projectId = process.env.GCS_PROJECT_ID || 'atca-mvp-test';
      
      logger.info(`🔑 Attempting to initialize Cloud Storage client with key: ${keyFilePath}`);
      
      // Check if the key file exists
      if (!fs.existsSync(keyFilePath)) {
        logger.error(`🔑 Cloud Storage service account key file not found at: ${keyFilePath}`);
        logger.error(`🔍 Current working directory: ${process.cwd()}`);
        return null;
      }
      
      // Initialize the client
      storageClient = new Storage({
        keyFilename: keyFilePath,
        projectId: projectId
      });
      
      // Verify client is working by making a simple API call
      try {
        logger.info('🔍 Verifying Cloud Storage client connection...');
        // Try to list buckets as a connection test
        const [buckets] = await storageClient.getBuckets();
        logger.info(`✅ Cloud Storage client initialized successfully! Found ${buckets.length} buckets.`);
        return storageClient;
      } catch (verifyError) {
        logger.error(`❌ Cloud Storage client verification failed: ${verifyError.message}`);
        logger.error(verifyError.stack);
        storageClient = null;
        return null;
      }
    } catch (error) {
      logger.error(`❌ Failed to initialize Cloud Storage client: ${error.message}`);
      logger.error(error.stack);
      return null;
    }
  }
  
  return storageClient;
}

// Mock generators for testing and development
const mockDataGenerator = {
  generateMockBuckets() {
    return [
      { id: 'mock-bucket-1', name: 'Visual Overlay Assets' },
      { id: 'mock-bucket-2', name: 'System Backups' },
      { id: 'mock-bucket-3', name: 'User Data' }
    ];
  },
  
  generateMockFiles(bucketName) {
    return [
      { 
        name: 'dashboards/system-overview.json',
        size: '24.5 KB',
        contentType: 'application/json',
        updated: new Date().toISOString()
      },
      { 
        name: 'images/logo.svg',
        size: '12.8 KB',
        contentType: 'image/svg+xml',
        updated: new Date().toISOString()
      },
      { 
        name: 'config/settings.json',
        size: '3.2 KB',
        contentType: 'application/json',
        updated: new Date().toISOString()
      }
    ];
  },
  
  generateMockFileStats(bucketName) {
    return {
      totalFiles: 28,
      totalSize: '512.3 MB',
      fileTypes: {
        'image/svg+xml': 12,
        'application/json': 8,
        'text/plain': 5,
        'application/octet-stream': 3
      },
      uploadsByDay: [
        { day: 'Mon', count: 3 },
        { day: 'Tue', count: 7 },
        { day: 'Wed', count: 4 },
        { day: 'Thu', count: 9 },
        { day: 'Fri', count: 5 }
      ]
    };
  }
};

// Cloud Storage service implementation
const cloudStorageService = {
  /**
   * Get list of available storage buckets 
   * @param {boolean} useRealData - Whether to use real data
   * @returns {Promise<Object>} Object containing buckets and metadata
   */
  getBuckets: async function(useRealData = false) {
    try {
      // Get key file path from config
      const keyFilePath = process.env.GCS_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-bq-monitor-dev-sa-ed1febb00448.json');
      const keyFileExists = fs.existsSync(keyFilePath);
      
      // Log the request details
      logger.info(`📊 getBuckets called with useRealData=${useRealData}, keyFileExists=${keyFileExists}`);
      
      // If mock data is requested or key file doesn't exist
      if (!useRealData || !keyFileExists) {
        logger.info(useRealData ? '🔑 Service account key not found, using mock data' : '🧪 Mock data requested');
        const mockBuckets = mockDataGenerator.generateMockBuckets();
        logger.info(`📁 Returning ${mockBuckets.length} mock buckets`);
        return { 
          buckets: mockBuckets, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Get Storage client
      const client = await getStorageClient();
      
      if (!client) {
        logger.error('❌ Failed to get Cloud Storage client, falling back to mock data');
        const mockBuckets = mockDataGenerator.generateMockBuckets();
        return { 
          buckets: mockBuckets, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      logger.info('🔍 Fetching real Cloud Storage buckets');
      
      // Get list of buckets
      const [buckets] = await client.getBuckets();
      logger.info(`📁 Found ${buckets.length} real Cloud Storage buckets`);
      
      if (!buckets || buckets.length === 0) {
        logger.warn('⚠️ No Cloud Storage buckets found, falling back to mock data');
        const mockBuckets = mockDataGenerator.generateMockBuckets();
        logger.info(`📁 Returning ${mockBuckets.length} mock buckets as fallback`);
        return { 
          buckets: mockBuckets, 
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      // Format buckets to match expected structure
      const formattedBuckets = buckets.map(bucket => ({
        id: bucket.id || bucket.name,
        name: bucket.name
      }));
      
      logger.info(`📁 Returning ${formattedBuckets.length} real Cloud Storage buckets`);
      return { 
        buckets: formattedBuckets, 
        isRealData: true,
        keyFileExists: keyFileExists
      };
    } catch (error) {
      logger.error(`❌ Error fetching real Cloud Storage buckets: ${error.message}`);
      logger.error(error.stack);
      // Check if key file exists for status reporting
      const keyFilePath = process.env.GCS_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-bq-monitor-dev-sa-ed1febb00448.json');
      const keyFileExists = fs.existsSync(keyFilePath);
      
      // Fall back to mock data on error
      const mockBuckets = mockDataGenerator.generateMockBuckets();
      return { 
        buckets: mockBuckets, 
        isRealData: false,
        keyFileExists: keyFileExists,
        error: error.message 
      };
    }
  },
  
  /**
   * Get files in a specific bucket
   * @param {string} bucketName - Cloud Storage bucket name
   * @param {boolean} useRealData - Whether to use real data
   * @returns {Promise<Object>} Bucket contents and statistics
   */
  getBucketContents: async function(bucketName, useRealData = false) {
    try {
      // Check if key file exists for status reporting
      const keyFilePath = process.env.GCS_KEY_PATH || path.join(__dirname, '../../config/keys/trauco-bq-monitor-dev-sa-ed1febb00448.json');
      const keyFileExists = fs.existsSync(keyFilePath);
      
      // If mock data is requested or key file doesn't exist
      if (!useRealData || !keyFileExists) {
        logger.info(useRealData ? '🔑 Service account key not found, using mock data' : '🧪 Mock data requested');
        const mockFiles = mockDataGenerator.generateMockFiles(bucketName);
        const mockStats = mockDataGenerator.generateMockFileStats(bucketName);
        return { 
          bucketName,
          files: mockFiles,
          stats: mockStats,
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      const client = await getStorageClient();
      
      if (!client) {
        logger.error('❌ Failed to get Cloud Storage client, falling back to mock data');
        const mockFiles = mockDataGenerator.generateMockFiles(bucketName);
        const mockStats = mockDataGenerator.generateMockFileStats(bucketName);
        return { 
          bucketName,
          files: mockFiles,
          stats: mockStats,
          isRealData: false,
          keyFileExists: keyFileExists
        };
      }
      
      logger.info(`🔍 Fetching real Cloud Storage contents for bucket: ${bucketName}`);
      
      // Get bucket and list files
      const bucket = client.bucket(bucketName);
      const [files] = await bucket.getFiles();
      
      // Process files to extract metadata
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const [metadata] = await file.getMetadata();
          return {
            name: file.name,
            size: `${(parseInt(metadata.size, 10) / 1024).toFixed(1)} KB`,
            contentType: metadata.contentType,
            updated: metadata.updated
          };
        })
      );
      
      // Calculate stats
      const totalSize = files.reduce((sum, file) => {
        const [metadata] = file.getMetadata();
        return sum + parseInt(metadata.size, 10);
      }, 0);
      
      // Group files by type
      const filesByType = {};
      for (const file of processedFiles) {
        const type = file.contentType;
        filesByType[type] = (filesByType[type] || 0) + 1;
      }
      
      // Format total size
      let formattedSize = '';
      if (totalSize < 1024 * 1024) {
        formattedSize = `${(totalSize / 1024).toFixed(1)} KB`;
      } else if (totalSize < 1024 * 1024 * 1024) {
        formattedSize = `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
      } else {
        formattedSize = `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      }
      
      const stats = {
        totalFiles: files.length,
        totalSize: formattedSize,
        fileTypes: filesByType
      };
      
      return {
        bucketName,
        files: processedFiles,
        stats,
        timestamp: new Date().toISOString(),
        isRealData: true,
        keyFileExists: keyFileExists
      };
    } catch (error) {
      logger.error(`❌ Error fetching real Cloud Storage contents for bucket ${bucketName}: ${error.message}`);
      logger.error(error.stack);
      
      // Fall back to mock data on error
      const mockFiles = mockDataGenerator.generateMockFiles(bucketName);
      const mockStats = mockDataGenerator.generateMockFileStats(bucketName);
      return { 
        bucketName,
        files: mockFiles,
        stats: mockStats,
        isRealData: false,
        error: error.message 
      };
    }
  },
  
  /**
   * Upload a file to Cloud Storage
   * @param {string} bucketName - Target bucket name
   * @param {string} filePath - Local file path to upload
   * @param {string} destination - Destination path in bucket
   * @returns {Promise<Object>} Upload result
   */
  uploadFile: async function(bucketName, filePath, destination) {
    try {
      const client = await getStorageClient();
      
      if (!client) {
        logger.error('❌ Failed to get Cloud Storage client');
        return { 
          success: false,
          error: 'Storage client initialization failed'
        };
      }
      
      logger.info(`📤 Uploading file from ${filePath} to ${bucketName}/${destination}`);
      
      const bucket = client.bucket(bucketName);
      const [file] = await bucket.upload(filePath, {
        destination: destination,
        // Optional: set a generation-match precondition to avoid overwriting files
        // preconditionOpts: {ifGenerationMatch: 0}
      });
      
      const [metadata] = await file.getMetadata();
      
      logger.info(`✅ File uploaded successfully to ${metadata.name}`);
      return {
        success: true,
        file: {
          name: metadata.name,
          size: `${(parseInt(metadata.size, 10) / 1024).toFixed(1)} KB`,
          contentType: metadata.contentType,
          updated: metadata.updated
        }
      };
    } catch (error) {
      logger.error(`❌ Error uploading file to ${bucketName}/${destination}: ${error.message}`);
      logger.error(error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Download a file from Cloud Storage
   * @param {string} bucketName - Source bucket name
   * @param {string} fileName - File path in bucket
   * @param {string} destination - Local destination path
   * @returns {Promise<Object>} Download result
   */
  downloadFile: async function(bucketName, fileName, destination) {
    try {
      const client = await getStorageClient();
      
      if (!client) {
        logger.error('❌ Failed to get Cloud Storage client');
        return { 
          success: false,
          error: 'Storage client initialization failed'
        };
      }
      
      logger.info(`📥 Downloading file from ${bucketName}/${fileName} to ${destination}`);
      
      const bucket = client.bucket(bucketName);
      const file = bucket.file(fileName);
      
      const options = {
        destination: destination,
      };
      
      await file.download(options);
      
      logger.info(`✅ File downloaded successfully to ${destination}`);
      return {
        success: true,
        destination: destination
      };
    } catch (error) {
      logger.error(`❌ Error downloading file from ${bucketName}/${fileName}: ${error.message}`);
      logger.error(error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Delete a file from Cloud Storage
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File path in bucket
   * @returns {Promise<Object>} Deletion result
   */
  deleteFile: async function(bucketName, fileName) {
    try {
      const client = await getStorageClient();
      
      if (!client) {
        logger.error('❌ Failed to get Cloud Storage client');
        return { 
          success: false,
          error: 'Storage client initialization failed'
        };
      }
      
      logger.info(`🗑️ Deleting file ${bucketName}/${fileName}`);
      
      const bucket = client.bucket(bucketName);
      const file = bucket.file(fileName);
      
      await file.delete();
      
      logger.info(`✅ File deleted successfully`);
      return {
        success: true
      };
    } catch (error) {
      logger.error(`❌ Error deleting file ${bucketName}/${fileName}: ${error.message}`);
      logger.error(error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = cloudStorageService;

// server/routes/api/cloud-storage.js
// 🟦 Imports
const createApiRouter = require('../../utils/route-template');
const cloudStorageService = require('../../utils/cloud-storage/storage-service');
const logger = require('../../utils/logger');
const config = require('../../config/bigquery'); // Reuse existing config for now
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/', { recursive: true });
}

// 🎯 Cloud Storage Route Handlers
const cloudStorageHandlers = {
  getBuckets: async (req, res, next) => {
    try {
      logger.info(`📊 Getting Cloud Storage buckets`);
      
      // Get useRealData from query param or default to settings
      const useRealData = req.query.useRealData === 'true' || req.query.useRealData === true;
      
      const result = await cloudStorageService.getBuckets(useRealData);
      logger.info(`📁 Found ${result.buckets.length} buckets (isRealData: ${result.isRealData})`);
      
      res.json(result);
    } catch (error) {
      logger.error('❌ Error fetching Cloud Storage buckets', error);
      next(error);
    }
  },

  getBucketContents: async (req, res, next) => {
    const { bucketName } = req.params;
    const useRealData = req.query.useRealData === 'true' || req.query.useRealData === true;
    
    try {
      logger.info(`📂 Getting contents for bucket: ${bucketName} (useRealData: ${useRealData})`);
      const result = await cloudStorageService.getBucketContents(bucketName, useRealData);
      logger.info(`📊 Contents retrieved for bucket ${bucketName} (isRealData: ${result.isRealData})`);
      
      res.json(result);
    } catch (error) {
      logger.error(`❌ Error fetching contents for bucket ${bucketName}`, error);
      next(error);
    }
  },
  
  uploadFile: async (req, res, next) => {
    // multer middleware has already processed the file
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }
    
    const { bucketName } = req.params;
    const destination = req.body.destination || path.basename(req.file.originalname);
    
    try {
      logger.info(`📤 Processing upload to bucket: ${bucketName}`);
      const result = await cloudStorageService.uploadFile(
        bucketName, 
        req.file.path, 
        destination
      );
      
      // Clean up temp file after upload
      fs.unlinkSync(req.file.path);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      // Clean up temp file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      logger.error(`❌ Error uploading file to bucket ${bucketName}`, error);
      next(error);
    }
  },
  
  downloadFile: async (req, res, next) => {
    const { bucketName, fileName } = req.params;
    
    try {
      logger.info(`📥 Processing download from bucket: ${bucketName}, file: ${fileName}`);
      
      // Create temp file path
      const tempPath = path.join('uploads', path.basename(fileName));
      
      const result = await cloudStorageService.downloadFile(
        bucketName, 
        fileName, 
        tempPath
      );
      
      if (result.success) {
        // Send file to client
        res.download(tempPath, path.basename(fileName), (err) => {
          // Clean up temp file after sending
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          
          // Handle download errors
          if (err) {
            logger.error(`❌ Error sending file to client: ${err.message}`);
          }
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      logger.error(`❌ Error downloading file from bucket ${bucketName}`, error);
      next(error);
    }
  },
  
  deleteFile: async (req, res, next) => {
    const { bucketName, fileName } = req.params;
    
    try {
      logger.info(`🗑️ Processing delete from bucket: ${bucketName}, file: ${fileName}`);
      
      const result = await cloudStorageService.deleteFile(bucketName, fileName);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      logger.error(`❌ Error deleting file from bucket ${bucketName}`, error);
      next(error);
    }
  }
};

// 🚀 Export router using the route template
module.exports = createApiRouter('cloud-storage', (router) => {
  router.get('/buckets', cloudStorageHandlers.getBuckets);
  router.get('/buckets/:bucketName', cloudStorageHandlers.getBucketContents);
  router.post('/buckets/:bucketName/upload', upload.single('file'), cloudStorageHandlers.uploadFile);
  router.get('/buckets/:bucketName/files/:fileName', cloudStorageHandlers.downloadFile);
  router.delete('/buckets/:bucketName/files/:fileName', cloudStorageHandlers.deleteFile);
  logger.info('☁️ Cloud Storage API routes initialized');
});
