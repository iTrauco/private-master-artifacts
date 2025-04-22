# Cloud Storage Feature Implementation Guide

## 1. File Structure

Create these files:

```
public/
├── css/
│   └── cloudstorage/
│       ├── base.css
│       ├── panels.css
│       └── controls.css
├── js/
│   └── cloudstorage/
│       ├── controllers/
│       │   └── cloudstorage-controller.js
│       ├── services/
│       │   └── cloudstorage-service.js
│       └── utils/
│           └── chart-utils.js
├── pages/
│   └── cloudstorage/
│       └── index.html
server/
├── routes/
│   ├── api/
│   │   └── cloudstorage.js
│   └── pages.js (modify)
└── utils/
    └── cloudstorage/
        └── storage-service.js
test/
└── unit/
    ├── routes/
    │   └── api/
    │       └── cloudstorage.test.js
    └── utils/
        └── cloudstorage/
            └── storage-service.test.js
```

## 2. Backend Implementation

### 2.1 Create Server Route (`server/routes/api/cloudstorage.js`)

Create a new Express router for Cloud Storage API endpoints:
- GET `/api/cloudstorage/buckets` - Get all buckets
- GET `/api/cloudstorage/buckets/:bucketId` - Get bucket details
- GET `/api/cloudstorage/buckets/:bucketId/files` - Get files in bucket
- POST `/api/cloudstorage/buckets` - Create new bucket
- DELETE `/api/cloudstorage/buckets/:bucketId` - Delete bucket
- POST `/api/cloudstorage/buckets/:bucketId/upload` - Upload file
- PUT `/api/cloudstorage/buckets/:bucketId/files/:fileId` - Edit file
- DELETE `/api/cloudstorage/buckets/:bucketId/files` - Delete all files

### 2.2 Create Mock Service (`server/utils/cloudstorage/storage-service.js`)

Implement a mock service with:
- `getBuckets()` - Returns list of buckets with stats
- `getBucketDetails(bucketId)` - Returns detailed information for a bucket
- `getFiles(bucketId)` - Returns files in a bucket
- `createBucket(config)` - Simulates bucket creation
- `deleteBucket(bucketId)` - Simulates bucket deletion
- `uploadFile(bucketId, file)` - Simulates file upload
- `editFile(bucketId, fileId, content)` - Simulates file edit
- `deleteAllFiles(bucketId)` - Simulates deletion of all files in a bucket

### 2.3 Update Page Routes (`server/routes/pages.js`)

Add the Cloud Storage route to the existing page routes.

## 3. Frontend Implementation

### 3.1 Create HTML Page (`public/pages/cloudstorage/index.html`)

Structure with:
- Navigation bar (same as other pages)
- Buckets list panel
- Bucket details panel
- File explorer panel
- Management panel with action buttons
- Control buttons for panel visibility

### 3.2 Create CSS Files

Create styles matching the existing appearance:
- `base.css` - Main layout and panel positioning
- `panels.css` - Panel styling, list items, tables
- `controls.css` - Buttons and controls styling

### 3.3 Create Frontend Service (`public/js/cloudstorage/services/cloudstorage-service.js`)

Implement a service with:
- `fetchBuckets()` - Get all buckets
- `fetchBucketDetails(bucketId)` - Get bucket details
- `fetchFiles(bucketId)` - Get files in a bucket
- `createBucket(config)` - Create new bucket
- `deleteBucket(bucketId)` - Delete bucket
- `uploadFile(bucketId, file)` - Upload a file
- `editFile(bucketId, fileId, content)` - Edit a file
- `deleteAllFiles(bucketId)` - Delete all files in a bucket
- `startPolling(callback, interval)` - Poll for updates
- `stopPolling(intervalId)` - Stop polling

### 3.4 Create Controller (`public/js/cloudstorage/controllers/cloudstorage-controller.js`)

Implement a controller with:
- `init()` - Initialize controller
- `setupEventListeners()` - Set up UI event handlers
- `loadBuckets()` - Load and render buckets list
- `renderBuckets(buckets)` - Render buckets in the list
- `renderBucketDetails(details)` - Render bucket details
- `renderFiles(files)` - Render files list
- `handleBucketSelection(bucketId)` - Handle bucket selection
- `handleCreateBucket()` - Handle bucket creation
- `handleDeleteBucket()` - Handle bucket deletion
- `handleFileUpload()` - Handle file upload
- `handleFileEdit()` - Handle file edit
- `handleDeleteAllFiles()` - Handle deletion of all files
- Panel visibility toggle handlers

### 3.5 Create Chart Utilities (`public/js/cloudstorage/utils/chart-utils.js`)

Implement utilities for:
- `drawStorageUsageChart(data, canvas)` - Draw storage usage chart
- `drawFileTypeDistributionChart(data, canvas)` - Draw file type distribution chart

## 4. Testing Implementation

### 4.1 Create API Route Tests (`test/unit/routes/api/cloudstorage.test.js`)

Create tests for:
- GET `/api/cloudstorage/buckets`
- GET `/api/cloudstorage/buckets/:bucketId`
- POST `/api/cloudstorage/buckets`
- DELETE `/api/cloudstorage/buckets/:bucketId`

### 4.2 Create Service Tests (`test/unit/utils/cloudstorage/storage-service.test.js`)

Create tests for:
- `getBuckets()`
- `getBucketDetails(bucketId)`
- `getFiles(bucketId)`
- `createBucket(config)`
- `deleteBucket(bucketId)`

## 5. Implementation Steps

1. Create folder structure
2. Implement backend mock service
3. Create API routes
4. Update page routes
5. Create HTML structure
6. Implement CSS styles
7. Create frontend service
8. Implement controller
9. Create chart utilities
10. Add basic tests
11. Test integration with existing app

## 6. Sample Code Templates

### HTML Template
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cloud Storage - OBS Hardware Overlay</title>
  
  <!-- Base styles -->
  <link rel="stylesheet" href="../../css/base/reset.css">
  <link rel="stylesheet" href="../../css/base/global.css">
  
  <!-- Navigation styles -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
  <link rel="stylesheet" href="../../css/navigation/controls.css">
  
  <!-- Cloud Storage styles -->
  <link rel="stylesheet" href="../../css/cloudstorage/base.css">
  <link rel="stylesheet" href="../../css/cloudstorage/panels.css">
  <link rel="stylesheet" href="../../css/cloudstorage/controls.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="main-nav">
    <ul>
      <li><a href="#" onclick="navigateTo('/')">Dashboard</a></li>
      <li><a href="#" onclick="navigateTo('/cpu')">CPU Stats</a></li>
      <li><a href="#" onclick="navigateTo('/gpu')">GPU Stats</a></li>
      <li><a href="#" onclick="navigateTo('/system')">System Info</a></li>
      <li><a href="#" onclick="navigateTo('/svg')">SVG Overlay</a></li>
      <li><a href="#" onclick="navigateTo('/bigquery')">BigQuery</a></li>
      <li><a href="#" onclick="navigateTo('/cloudfunctions')">Cloud Functions</a></li>
      <li><a href="#" class="active" onclick="navigateTo('/cloudstorage')">Cloud Storage</a></li>
      <li><a href="#" onclick="navigateTo('/settings')">Settings</a></li>
    </ul>
  </nav>
  
  <div class="container">
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
    
    <!-- Buckets List Panel -->
    <div id="cs-buckets-panel" class="cs-panel cs-buckets-panel">
      <div class="panel-title">Buckets</div>
      <div id="buckets-list" class="list-container">
        <div class="empty-state">No buckets loaded</div>
      </div>
      <div class="panel-actions">
        <button id="load-buckets-btn" class="action-button">Load Buckets</button>
        <button id="create-bucket-btn" class="action-button">Create Bucket</button>
      </div>
    </div>

    <!-- Bucket Details Panel -->
    <div id="cs-details-panel" class="cs-panel cs-details-panel">
      <div class="panel-title">Bucket Details</div>
      <div id="bucket-details" class="details-container">
        <div class="empty-state">Select a bucket to view details</div>
      </div>
      <canvas id="storage-usage-canvas"></canvas>
    </div>

    <!-- Files Panel -->
    <div id="cs-files-panel" class="cs-panel cs-files-panel">
      <div class="panel-title">Files</div>
      <div id="files-list" class="files-container">
        <div class="empty-state">Select a bucket to view files</div>
      </div>
      <div class="panel-actions">
        <button id="upload-file-btn" class="action-button" disabled>Upload File</button>
        <button id="delete-all-files-btn" class="action-button" disabled>Delete All Files</button>
      </div>
    </div>
    
    <!-- File Type Distribution Panel -->
    <div id="cs-filetypes-panel" class="cs-panel cs-filetypes-panel">
      <div class="panel-title">File Type Distribution</div>
      <canvas id="file-distribution-canvas"></canvas>
    </div>
  </div>

  <!-- Create Bucket Modal -->
  <div id="create-bucket-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>Create New Bucket</h2>
      <form id="create-bucket-form">
        <div class="form-group">
          <label for="bucket-name">Bucket Name:</label>
          <input type="text" id="bucket-name" name="bucketName" required>
        </div>
        <div class="form-group">
          <label for="bucket-location">Location:</label>
          <select id="bucket-location" name="location">
            <option value="us-central1">us-central1</option>
            <option value="us-east1">us-east1</option>
            <option value="us-west1">us-west1</option>
            <option value="europe-west1">europe-west1</option>
            <option value="asia-east1">asia-east1</option>
          </select>
        </div>
        <div class="form-group">
          <label for="storage-class">Storage Class:</label>
          <select id="storage-class" name="storageClass">
            <option value="STANDARD">Standard</option>
            <option value="NEARLINE">Nearline</option>
            <option value="COLDLINE">Coldline</option>
            <option value="ARCHIVE">Archive</option>
          </select>
        </div>
        <button type="submit" class="action-button">Create</button>
      </form>
    </div>
  </div>

  <!-- Upload File Modal -->
  <div id="upload-file-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>Upload File</h2>
      <form id="upload-file-form">
        <div class="form-group">
          <label for="file-path">File Path:</label>
          <input type="text" id="file-path" name="filePath" required>
        </div>
        <div class="form-group">
          <label for="file-content">Content Type:</label>
          <select id="content-type" name="contentType">
            <option value="text/plain">Text</option>
            <option value="application/json">JSON</option>
            <option value="image/jpeg">JPEG Image</option>
            <option value="application/octet-stream">Binary</option>
          </select>
        </div>
        <div class="form-group">
          <label for="file-size">Size (KB):</label>
          <input type="number" id="file-size" name="fileSize" min="1" max="10240" value="100">
        </div>
        <button type="submit" class="action-button">Upload</button>
      </form>
    </div>
  </div>

  <!-- Hardware Controls Bar -->
  <div class="hardware-controls">
    <button id="show-all-btn">Show All</button>
    <button id="hide-all-btn">Hide All</button>
    <button id="show-buckets-btn">Buckets Only</button>
    <button id="show-details-btn">Details Only</button>
    <button id="show-files-btn">Files Only</button>
    <button id="show-filetypes-btn">Distribution Only</button>
    <button id="toggle-controls-btn">≡</button>
  </div>
  <div id="show-controls-btn" style="display: none;">≡</div>

  <!-- Core Scripts -->
  <script src="../../js/navigation.js"></script>
  
  <!-- Cloud Storage Scripts -->
  <script src="../../js/cloudstorage/services/cloudstorage-service.js"></script>
  <script src="../../js/cloudstorage/utils/chart-utils.js"></script>
  <script src="../../js/cloudstorage/controllers/cloudstorage-controller.js"></script>
</body>
</html>
```

### API Route Template
```javascript
// server/routes/api/cloudstorage.js
const express = require('express');
const router = express.Router();
const cloudStorageService = require('../../utils/cloudstorage/storage-service');

// Get all buckets
router.get('/buckets', async (req, res) => {
    try {
        const buckets = await cloudStorageService.getBuckets();
        res.json(buckets);
    } catch (error) {
        console.error('Error fetching Cloud Storage buckets:', error);
        res.status(500).json({ error: 'Failed to fetch Cloud Storage buckets' });
    }
});

// Get bucket details
router.get('/buckets/:bucketId', async (req, res) => {
    try {
        const details = await cloudStorageService.getBucketDetails(req.params.bucketId);
        res.json(details);
    } catch (error) {
        console.error(`Error fetching bucket details for ${req.params.bucketId}:`, error);
        res.status(500).json({ error: 'Failed to fetch bucket details' });
    }
});

// Get files in bucket
router.get('/buckets/:bucketId/files', async (req, res) => {
    try {
        const files = await cloudStorageService.getFiles(req.params.bucketId);
        res.json(files);
    } catch (error) {
        console.error(`Error fetching files for bucket ${req.params.bucketId}:`, error);
        res.status(500).json({ error: 'Failed to fetch bucket files' });
    }
});

// Create new bucket
router.post('/buckets', async (req, res) => {
    try {
        const newBucket = await cloudStorageService.createBucket(req.body);
        res.status(201).json(newBucket);
    } catch (error) {
        console.error('Error creating bucket:', error);
        res.status(500).json({ error: 'Failed to create bucket' });
    }
});

// Delete bucket
router.delete('/buckets/:bucketId', async (req, res) => {
    try {
        await cloudStorageService.deleteBucket(req.params.bucketId);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting bucket ${req.params.bucketId}:`, error);
        res.status(500).json({ error: 'Failed to delete bucket' });
    }
});

// Upload file to bucket
router.post('/buckets/:bucketId/upload', async (req, res) => {
    try {
        const newFile = await cloudStorageService.uploadFile(req.params.bucketId, req.body);
        res.status(201).json(newFile);
    } catch (error) {
        console.error(`Error uploading file to bucket ${req.params.bucketId}:`, error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Edit file in bucket
router.put('/buckets/:bucketId/files/:fileId', async (req, res) => {
    try {
        const updatedFile = await cloudStorageService.editFile(
            req.params.bucketId, 
            req.params.fileId, 
            req.body
        );
        res.json(updatedFile);
    } catch (error) {
        console.error(`Error editing file ${req.params.fileId}:`, error);
        res.status(500).json({ error: 'Failed to edit file' });
    }
});

// Delete all files in bucket
router.delete('/buckets/:bucketId/files', async (req, res) => {
    try {
        await cloudStorageService.deleteAllFiles(req.params.bucketId);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting files from bucket ${req.params.bucketId}:`, error);
        res.status(500).json({ error: 'Failed to delete files' });
    }
});

module.exports = router;
```

### Mock Service Template
```javascript
// server/utils/cloudstorage/storage-service.js
/**
 * Cloud Storage Service Utility
 * Handles integration with the Google Cloud Storage API
 */

// Storage classes
const storageClasses = ['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE'];

// Locations
const locations = ['us-central1', 'us-east1', 'us-west1', 'europe-west1', 'asia-east1'];

// File types for simulation
const fileTypes = [
    { extension: '.jpg', contentType: 'image/jpeg' },
    { extension: '.png', contentType: 'image/png' },
    { extension: '.pdf', contentType: 'application/pdf' },
    { extension: '.txt', contentType: 'text/plain' },
    { extension: '.json', contentType: 'application/json' },
    { extension: '.csv', contentType: 'text/csv' },
    { extension: '.html', contentType: 'text/html' },
    { extension: '.js', contentType: 'application/javascript' },
    { extension: '.css', contentType: 'text/css' },
    { extension: '.zip', contentType: 'application/zip' }
];

// Generate a random bucket
function generateMockBucket(id, name) {
    const storageClass = storageClasses[Math.floor(Math.random() * storageClasses.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const fileCount = Math.floor(Math.random() * 1000) + 1;
    const totalSize = fileCount * (Math.random() * 10 + 0.1); // MB
    
    return {
        id: id || `bucket-${Math.floor(Math.random() * 1000)}`,
        name: name || `example-bucket-${Math.floor(Math.random() * 100)}`,
        storageClass,
        location,
        created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        fileCount,
        totalSize: totalSize.toFixed(2),
        isPublic: Math.random() > 0.7
    };
}

// Generate bucket details
function generateBucketDetails(bucketId, bucketName) {
    const bucket = generateMockBucket(bucketId, bucketName);
    
    // Generate file type distribution
    const fileTypeDistribution = [];
    let remainingPercentage = 100;
    
    for (let i = 0; i < fileTypes.length - 1; i++) {
        const percentage = i === fileTypes.length - 2 
            ? remainingPercentage 
            : Math.floor(Math.random() * remainingPercentage);
        
        remainingPercentage -= percentage;
        
        if (percentage > 0) {
            fileTypeDistribution.push({
                type: fileTypes[i].extension,
                percentage,
                count: Math.floor((percentage / 100) * bucket.fileCount)
            });
        }
    }
    
    return {
        ...bucket,
        versioning: Math.random() > 0.5,
        lifecycle: {
            enabled: Math.random() > 0.5,
            rules: [
                {
                    action: 'Delete',
                    condition: 'Age > 365 days'
                }
            ]
        },
        encryption: {
            type: Math.random() > 0.5 ? 'Google-managed' : 'Customer-managed',
            keyName: Math.random() > 0.5 ? 'projects/example/keys/key-1' : null
        },
        cors: Math.random() > 0.7,
        logging: Math.random() > 0.8,
        fileTypeDistribution
    };
}

// Generate files in a bucket
function generateFiles(bucketId, count = 20) {
    const files = [];
    const now = Date.now();
    const directoryPaths = ['', 'images/', 'documents/', 'backups/', 'data/'];
    
    for (let i = 0; i < count; i++) {
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        const fileName = `file-${i + 1}${fileType.extension}`;
        const directoryPath = directoryPaths[Math.floor(Math.random() * directoryPaths.length)];
        const fullPath = `${directoryPath}${fileName}`;
        
        files.push({
            id: `file-${bucketId}-${i}`,
            name: fileName,
            path: fullPath,
            contentType: fileType.contentType,
            size: (Math.random() * 10 + 0.01).toFixed(2), // MB
            created: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated: new Date(now - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
            md5Hash: Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            downloadUrl: `https://storage.googleapis.com/${bucketId}/${fullPath}`
        });
    }
    
    return files;
}

// Mock implementation
const cloudStorageService = {
    /**
     * Get list of Cloud Storage buckets
     * @returns {Promise<Array>} List of buckets
     */
    getBuckets: async function() {
        console.log('Getting Cloud Storage buckets (mock)');
        
        // Generate 3-10 random buckets
        const count = Math.floor(Math.random() * 8) + 3;
        const buckets = Array.from({ length: count }, () => generateMockBucket());
        
        return buckets;
    },
    
    /**
     * Get details for a specific Cloud Storage bucket
     * @param {string} bucketId - Bucket ID
     * @returns {Promise<Object>} Bucket details
     */
    getBucketDetails: async function(bucketId) {
        console.log(`Getting details for bucket: ${bucketId} (mock)`);
        
        // Generate bucket details
        const bucketDetails = generateBucketDetails(bucketId);
        
        return bucketDetails;
    },
    
    /**
     * Get files in a specific Cloud Storage bucket
     * @param {string} bucketId - Bucket ID
     * @returns {Promise<Array>} Files in the bucket
     */
    getFiles: async function(bucketId) {
        console.log(`Getting files for bucket: ${bucketId} (mock)`);
        
        // Get bucket details to determine file count
        const bucketDetails = await this.getBucketDetails(bucketId);
        const fileCount = Math.min(bucketDetails.fileCount, 50); // Limit to 50 files for UI
        
        // Generate files
        const files = generateFiles(bucketId, fileCount);
        
        return files;
    },
    
    /**
     * Create a new Cloud Storage bucket
     * @param {Object} config - Bucket configuration
     * @returns {Promise<Object>} Newly created bucket
     */
    createBucket: async function(config) {
        console.log(`Creating new bucket with config:`, config);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a new bucket with the provided configuration
        const newBucket = generateMockBucket(null, config.bucketName);
        
        if (config.location) {
            newBucket.location = config.location;
        }
        
        if (config.storageClass) {
            newBucket.storageClass = config.storageClass;
        }
        
        // Update dates to now
        newBucket.created = new Date().toISOString();
        newBucket.updated = new Date().toISOString();
        
        return newBucket;
    },
    
    /**
     * Delete a Cloud Storage bucket
     * @param {string} bucketId - Bucket ID to delete
     * @returns {Promise<void>}
     */
    deleteBucket: async function(bucketId) {
        console.log(`Deleting bucket: ${bucketId} (mock)`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Nothing to return, just simulate success
        return;
    },
    
    /**
     * Upload a file to a Cloud Storage bucket
     * @param {string} bucketId - Bucket ID
     * @param {Object} fileData - File data
     * @returns {Promise<Object>} Newly uploaded file
     */
    uploadFile: async function(bucketId, fileData) {
        console.log(`Uploading file to bucket ${bucketId}:`, fileData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Determine file type based on provided content type or path
        let fileExtension = '.bin';
        let contentType = fileData.contentType || 'application/octet-stream';
        
        const fileTypeMatch = fileTypes.find(type => type.contentType === contentType);
        if (fileTypeMatch) {
            fileExtension = fileTypeMatch.extension;
        } else if (fileData.filePath) {
            // Try to extract extension from path
            const pathParts = fileData.filePath.split('.');
            if (pathParts.length > 1) {
                fileExtension = `.${pathParts[pathParts.length - 1]}`;
            }
        }
        
        // Create the new file object
        const newFile = {
            id: `file-${bucketId}-${Date.now()}`,
            name: fileData.filePath.split('/').pop() || `uploaded-file-${Date.now()}${fileExtension}`,
            path: fileData.filePath || `uploaded-file-${Date.now()}${fileExtension}`,
            contentType,
            size: (fileData.fileSize / 1024 || Math.random() * 5 + 0.01).toFixed(2), // MB
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            md5Hash: Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            downloadUrl: `https://storage.googleapis.com/${bucketId}/${fileData.filePath || `uploaded-file-${Date.now()}${fileExtension}`}`
        };
        
        return newFile;
    },
    
    /**
     * Edit a file in a Cloud Storage bucket
     * @param {string} bucketId - Bucket ID
     * @param {string} fileId - File ID
     * @param {Object} fileData - Updated file data
     * @returns {Promise<Object>} Updated file
     */
    editFile: async function(bucketId, fileId, fileData) {
        console.log(`Editing file ${fileId} in bucket ${bucketId}:`, fileData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 900));
        
        // Simulate retrieving current file data
        const file = {
            id: fileId,
            name: fileData.name || `file-${fileId}`,
            path: fileData.path || `file-${fileId}`,
            contentType: fileData.contentType || 'application/octet-stream',
            size: (fileData.size || Math.random() * 5 + 0.01).toFixed(2), // MB
            created: fileData.created || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated: new Date().toISOString(), // Update timestamp
            md5Hash: Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            downloadUrl: `https://storage.googleapis.com/${bucketId}/${fileData.path || `file-${fileId}`}`
        };
        
        return file;
    },
    
    /**
     * Delete all files in a Cloud Storage bucket
     * @param {string} bucketId - Bucket ID
     * @returns {Promise<void>}
     */
    deleteAllFiles: async function(bucketId) {
        console.log(`Deleting all files from bucket: ${bucketId} (mock)`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Nothing to return, just simulate success
        return;
    }
};

module.exports = cloudStorageService;
```

### Frontend Service Template
```javascript
/**
 * Cloud Storage Service Module
 * Handles fetching Cloud Storage data from the API
 */

// Create a global CloudStorageService object
window.CloudStorageService = {
    // Fetch available Cloud Storage buckets
    fetchBuckets: function(callback) {
        console.log('Fetching Cloud Storage buckets');
        fetch('/api/cloudstorage/buckets')
            .then(response => response.json())
            .then(data => {
                console.log('Buckets fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error fetching Cloud Storage buckets:', error);
                callback(null);
            });
    },
    
    // Fetch details for a specific bucket
    fetchBucketDetails: function(bucketId, callback) {
        console.log(`Fetching details for bucket: ${bucketId}`);
        fetch(`/api/cloudstorage/buckets/${bucketId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Bucket details fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error(`Error fetching details for bucket ${bucketId}:`, error);
                callback(null);
            });
    },
    
    // Fetch files in a specific bucket
    fetchFiles: function(bucketId, callback) {
        console.log(`Fetching files for bucket: ${bucketId}`);
        fetch(`/api/cloudstorage/buckets/${bucketId}/files`)
            .then(response => response.json())
            .then(data => {
                console.log('Files fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error(`Error fetching files for bucket ${bucketId}:`, error);
                callback(null);
            });
    },
    
    // Create a new bucket
    createBucket: function(config, callback) {
        console.log('Creating new bucket:', config);
        fetch('/api/cloudstorage/buckets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Bucket created:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error creating bucket:', error);
                callback(null);
            });
    },
    
    // Delete a bucket
    deleteBucket: function(bucketId, callback) {
        console.log(`Deleting bucket: ${bucketId}`);
        fetch(`/api/cloudstorage/buckets/${bucketId}`, {
            method: 'DELETE'
        })
            .then(response => {
                console.log(`Bucket ${bucketId} deleted`);
                callback(true);
            })
            .catch(error => {
                console.error(`Error deleting bucket ${bucketId}:`, error);
                callback(false);
            });
    },
    
    // Upload a file to a bucket
    uploadFile: function(bucketId, fileData, callback) {
        console.log(`Uploading file to bucket ${bucketId}:`, fileData);
        fetch(`/api/cloudstorage/buckets/${bucketId}/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fileData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('File uploaded:', data);
                callback(data);
            })
            .catch(error => {
                console.error(`Error uploading file to bucket ${bucketId}:`, error);
                callback(null);
            });
    },
    
    // Edit a file in a bucket
    editFile: function(bucketId, fileId, fileData, callback) {
        console.log(`Editing file ${fileId} in bucket ${bucketId}:`, fileData);
        fetch(`/api/cloudstorage/buckets/${bucketId}/files/${fileId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fileData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('File edited:', data);
                callback(data);
            })
            .catch(error => {
                console.error(`Error editing file ${fileId}:`, error);
                callback(null);
            });
    },
    
    // Delete all files in a bucket
    deleteAllFiles: function(bucketId, callback) {
        console.log(`Deleting all files from bucket ${bucketId}`);
        fetch(`/api/cloudstorage/buckets/${bucketId}/files`, {
            method: 'DELETE'
        })
            .then(response => {
                console.log(`All files deleted from bucket ${bucketId}`);
                callback(true);
            })
            .catch(error => {
                console.error(`Error deleting files from bucket ${bucketId}:`, error);
                callback(false);
            });
    },
    
    // Start polling for bucket updates
    startPolling: function(bucketId, callback, interval = 30000) {
        // Initial fetch
        this.fetchBucketDetails(bucketId, callback);
        
        // Set up interval for continuous updates
        this.pollingInterval = setInterval(() => {
            this.fetchBucketDetails(bucketId, callback);
        }, interval);
        
        return this.pollingInterval;
    },
    
    // Stop polling
    stopPolling: function(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
        }
    }
};
```

### Controller Template
```javascript
/**
 * Cloud Storage Controller Module
 * Handles UI interactions for Cloud Storage monitoring
 */

// Main controller
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cloud Storage controller initializing');
    
    // DOM elements
    const bucketsPanel = document.getElementById('cs-buckets-panel');
    const detailsPanel = document.getElementById('cs-details-panel');
    const filesPanel = document.getElementById('cs-files-panel');
    const fileTypesPanel = document.getElementById('cs-filetypes-panel');
    const bucketsList = document.getElementById('buckets-list');
    const bucketDetails = document.getElementById('bucket-details');
    const filesList = document.getElementById('files-list');
    const loadBucketsBtn = document.getElementById('load-buckets-btn');
    const createBucketBtn = document.getElementById('create-bucket-btn');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    const deleteAllFilesBtn = document.getElementById('delete-all-files-btn');
    
    // Modals
    const createBucketModal = document.getElementById('create-bucket-modal');
    const uploadFileModal = document.getElementById('upload-file-modal');
    const createBucketForm = document.getElementById('create-bucket-form');
    const uploadFileForm = document.getElementById('upload-file-form');
    
    // Canvas for charts
    const storageUsageCanvas = document.getElementById('storage-usage-canvas');
    const fileDistributionCanvas = document.getElementById('file-distribution-canvas');
    let storageUsageCtx = null;
    let fileDistributionCtx = null;
    
    if (storageUsageCanvas) {
        storageUsageCtx = storageUsageCanvas.getContext('2d');
        storageUsageCanvas.width = storageUsageCanvas.offsetWidth;
        storageUsageCanvas.height = storageUsageCanvas.offsetHeight;
    }
    
    if (fileDistributionCanvas) {
        fileDistributionCtx = fileDistributionCanvas.getContext('2d');
        fileDistributionCanvas.width = fileDistributionCanvas.offsetWidth;
        fileDistributionCanvas.height = fileDistributionCanvas.offsetHeight;
    }
    
    // State
    let selectedBucketId = null;
    let pollingInterval = null;
    
    // Initialize controller
    function init() {
        setupEventListeners();
        window.addEventListener('resize', resizeCanvases);
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Bucket loading
        if (loadBucketsBtn) {
            loadBucketsBtn.addEventListener('click', loadBuckets);
        }
        
        // Create bucket
        if (createBucketBtn) {
            createBucketBtn.addEventListener('click', showCreateBucketModal);
        }
        
        // Upload file
        if (uploadFileBtn) {
            uploadFileBtn.addEventListener('click', showUploadFileModal);
        }
        
        // Delete all files
        if (deleteAllFilesBtn) {
            deleteAllFilesBtn.addEventListener('click', confirmDeleteAllFiles);
        }
        
        // Form submissions
        if (createBucketForm) {
            createBucketForm.addEventListener('submit', handleCreateBucket);
        }
        
        if (uploadFileForm) {
            uploadFileForm.addEventListener('submit', handleFileUpload);
        }
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                createBucketModal.style.display = 'none';
                uploadFileModal.style.display = 'none';
            });
        });
        
        // Control panel buttons
        document.querySelector('#show-all-btn').addEventListener('click', () => {
            bucketsPanel.style.display = 'block';
            detailsPanel.style.display = 'block';
            filesPanel.style.display = 'block';
            fileTypesPanel.style.display = 'block';
        });
        
        document.querySelector('#hide-all-btn').addEventListener('click', () => {
            bucketsPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            filesPanel.style.display = 'none';
            fileTypesPanel.style.display = 'none';
        });
        
        document.querySelector('#show-buckets-btn').addEventListener('click', () => {
            bucketsPanel.style.display = 'block';
            detailsPanel.style.display = 'none';
            filesPanel.style.display = 'none';
            fileTypesPanel.style.display = 'none';
        });
        
        document.querySelector('#show-details-btn').addEventListener('click', () => {
            bucketsPanel.style.display = 'none';
            detailsPanel.style.display = 'block';
            filesPanel.style.display = 'none';
            fileTypesPanel.style.display = 'none';
        });
        
        document.querySelector('#show-files-btn').addEventListener('click', () => {
            bucketsPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            filesPanel.style.display = 'block';
            fileTypesPanel.style.display = 'none';
        });
        
        document.querySelector('#show-filetypes-btn').addEventListener('click', () => {
            bucketsPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            filesPanel.style.display = 'none';
            fileTypesPanel.style.display = 'block';
        });
        
        // Toggle controls visibility
        const toggleControlsBtn = document.getElementById('toggle-controls-btn');
        const showControlsBtn = document.getElementById('show-controls-btn');
        const controlPanel = document.querySelector('.hardware-controls');

        if (toggleControlsBtn) {
            toggleControlsBtn.addEventListener('click', () => {
                controlPanel.style.display = 'none';
                showControlsBtn.style.display = 'flex';
            });
        }

        if (showControlsBtn) {
            showControlsBtn.addEventListener('click', () => {
                controlPanel.style.display = 'flex';
                showControlsBtn.style.display = 'none';
            });
        }
    }
    
    // Load buckets from API
    function loadBuckets() {
        if (loadBucketsBtn) {
            loadBucketsBtn.disabled = true;
            loadBucketsBtn.textContent = 'Loading...';
        }
        
        window.CloudStorageService.fetchBuckets(renderBuckets);
    }
    
    // Render buckets list
    function renderBuckets(buckets) {
        if (loadBucketsBtn) {
            loadBucketsBtn.disabled = false;
            loadBucketsBtn.textContent = 'Refresh Buckets';
        }
        
        if (!buckets || !bucketsList) return;
        
        if (buckets.length === 0) {
            bucketsList.innerHTML = '<div class="empty-state">No buckets available</div>';
            return;
        }
        
        let html = '';
        buckets.forEach(bucket => {
            const isSelected = bucket.id === selectedBucketId;
            const publicIndicator = bucket.isPublic ? '<span class="public-indicator">Public</span>' : '';
            
            html += `
                <div class="bucket-item ${isSelected ? 'selected' : ''}" 
                     data-bucket-id="${bucket.id}"
                     onclick="selectBucket('${bucket.id}')">
                    <div class="bucket-name">${bucket.name} ${publicIndicator}</div>
                    <div class="bucket-info">
                        <span class="bucket-location">${bucket.location}</span>
                        <span class="bucket-class">${bucket.storageClass}</span>
                    </div>
                    <div class="bucket-stats">
                        <span class="bucket-size">${bucket.totalSize} MB</span>
                        <span class="bucket-count">${bucket.fileCount} files</span>
                    </div>
                </div>
            `;
        });
        
        bucketsList.innerHTML = html;
    }
    
    // Render bucket details
    function renderBucketDetails(bucket) {
        if (!bucket || !bucketDetails) return;
        
        let html = `
            <div class="details-header">
                <h3>${bucket.name}</h3>
                <span class="public-status ${bucket.isPublic ? 'public' : 'private'}">
                    ${bucket.isPublic ? 'Public' : 'Private'}
                </span>
            </div>
            <div class="details-content">
                <div class="detail-item">
                    <div class="detail-label">Location:</div>
                    <div class="detail-value">${bucket.location}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Storage Class:</div>
                    <div class="detail-value">${bucket.storageClass}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Created:</div>
                    <div class="detail-value">${new Date(bucket.created).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Last Updated:</div>
                    <div class="detail-value">${new Date(bucket.updated).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Versioning:</div>
                    <div class="detail-value">${bucket.versioning ? 'Enabled' : 'Disabled'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Lifecycle Rules:</div>
                    <div class="detail-value">${bucket.lifecycle && bucket.lifecycle.enabled ? 'Enabled' : 'None'}</div>
                </div>
            </div>
            <div class="storage-header">Storage Stats</div>
            <div class="storage-content">
                <div class="storage-item">
                    <div class="storage-label">File Count:</div>
                    <div class="storage-value">${bucket.fileCount.toLocaleString()}</div>
                </div>
                <div class="storage-item">
                    <div class="storage-label">Total Size:</div>
                    <div class="storage-value">${bucket.totalSize} MB</div>
                </div>
            </div>
        `;
        
        bucketDetails.innerHTML = html;
        
        // Draw storage usage chart
        if (storageUsageCtx) {
            drawStorageUsageChart(bucket);
        }
        
        // Draw file type distribution chart
        if (fileDistributionCtx && bucket.fileTypeDistribution) {
            drawFileTypeDistributionChart(bucket.fileTypeDistribution);
        }
        
        // Enable/disable file related buttons
        if (uploadFileBtn) {
            uploadFileBtn.disabled = false;
        }
        
        if (deleteAllFilesBtn) {
            deleteAllFilesBtn.disabled = false;
        }
    }
    
    // Render files list
    function renderFiles(files) {
        if (!files || !filesList) return;
        
        if (files.length === 0) {
            filesList.innerHTML = '<div class="empty-state">No files in this bucket</div>';
            return;
        }
        
        let html = `
            <table class="files-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Last Modified</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        files.forEach(file => {
            html += `
                <tr class="file-row" data-file-id="${file.id}">
                    <td class="file-name">${file.path}</td>
                    <td class="file-type">${file.contentType}</td>
                    <td class="file-size">${file.size} MB</td>
                    <td class="file-updated">${new Date(file.updated).toLocaleString()}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        filesList.innerHTML = html;
    }
    
    // Draw storage usage chart
    function drawStorageUsageChart(bucket) {
        if (!storageUsageCtx) return;
        
        // Clear canvas
        storageUsageCtx.clearRect(0, 0, storageUsageCanvas.width, storageUsageCanvas.height);
        
        // Draw background
        storageUsageCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        storageUsageCtx.fillRect(0, 0, storageUsageCanvas.width, storageUsageCanvas.height);
        
        // Set up dimensions
        const width = storageUsageCanvas.width;
        const height = storageUsageCanvas.height;
        const barWidth = width * 0.6;
        const barHeight = 30;
        const barX = (width - barWidth) / 2;
        const barY = (height - barHeight) / 2;
        
        // Draw storage usage bar
        storageUsageCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        storageUsageCtx.fillRect(barX, barY, barWidth, barHeight);
        
        // Calculate size in GB for visualization
        const sizeInGB = parseFloat(bucket.totalSize) / 1024;
        const maxSize = 10; // 10 GB for visualization purposes
        const usageRatio = Math.min(sizeInGB / maxSize, 1);
        
        // Draw usage fill
        const gradient = storageUsageCtx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, 'rgba(52, 152, 219, 0.8)');
        gradient.addColorStop(1, 'rgba(41, 128, 185, 0.8)');
        
        storageUsageCtx.fillStyle = gradient;
        storageUsageCtx.fillRect(barX, barY, barWidth * usageRatio, barHeight);
        
        // Add labels
        storageUsageCtx.fillStyle = 'white';
        storageUsageCtx.font = '14px Arial';
        storageUsageCtx.textAlign = 'center';
        storageUsageCtx.fillText('Storage Usage', width / 2, barY - 10);
        
        storageUsageCtx.font = '12px Arial';
        storageUsageCtx.fillText(`${bucket.totalSize} MB / ${maxSize.toFixed(2)} GB`, width / 2, barY + barHeight + 20);
        
        // Add percentage
        storageUsageCtx.font = 'bold 12px Arial';
        storageUsageCtx.fillText(`${(usageRatio * 100).toFixed(1)}%`, width / 2, barY + barHeight / 2 + 4);
    }
    
    // Draw file type distribution chart
    function drawFileTypeDistributionChart(fileTypeDistribution) {
        if (!fileDistributionCtx || !fileTypeDistribution || fileTypeDistribution.length === 0) return;
        
        // Clear canvas
        fileDistributionCtx.clearRect(0, 0, fileDistributionCanvas.width, fileDistributionCanvas.height);
        
        // Draw background
        fileDistributionCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        fileDistributionCtx.fillRect(0, 0, fileDistributionCanvas.width, fileDistributionCanvas.height);
        
        // Set up dimensions
        const width = fileDistributionCanvas.width;
        const height = fileDistributionCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 30;
        
        // Colors for pie chart
        const colors = [
            'rgba(52, 152, 219, 0.8)',
            'rgba(46, 204, 113, 0.8)',
            'rgba(155, 89, 182, 0.8)',
            'rgba(241, 196, 15, 0.8)',
            'rgba(231, 76, 60, 0.8)',
            'rgba(52, 73, 94, 0.8)',
            'rgba(26, 188, 156, 0.8)',
            'rgba(243, 156, 18, 0.8)',
            'rgba(211, 84, 0, 0.8)',
            'rgba(41, 128, 185, 0.8)'
        ];
        
        // Sort by percentage for better visualization
        const sortedData = [...fileTypeDistribution].sort((a, b) => b.percentage - a.percentage);
        
        // Draw pie chart
        let startAngle = 0;
        sortedData.forEach((item, index) => {
            const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
            
            fileDistributionCtx.beginPath();
            fileDistributionCtx.moveTo(centerX, centerY);
            fileDistributionCtx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            fileDistributionCtx.closePath();
            
            fileDistributionCtx.fillStyle = colors[index % colors.length];
            fileDistributionCtx.fill();
            
            // Add label if slice is large enough
            if (item.percentage > 5) {
                const labelAngle = startAngle + sliceAngle / 2;
                const labelX = centerX + radius * 0.7 * Math.cos(labelAngle);
                const labelY = centerY + radius * 0.7 * Math.sin(labelAngle);
                
                fileDistributionCtx.fillStyle = 'white';
                fileDistributionCtx.font = 'bold 12px Arial';
                fileDistributionCtx.textAlign = 'center';
                fileDistributionCtx.textBaseline = 'middle';
                fileDistributionCtx.fillText(`${item.percentage}%`, labelX, labelY);
            }
            
            startAngle += sliceAngle;
        });
        
        // Add title
        fileDistributionCtx.fillStyle = 'white';
        fileDistributionCtx.font = '14px Arial';
        fileDistributionCtx.textAlign = 'center';
        fileDistributionCtx.textBaseline = 'top';
        fileDistributionCtx.fillText('File Type Distribution', centerX, 10);
        
        // Add legend
        const legendX = 20;
        let legendY = height - 10 - sortedData.length * 20;
        
        sortedData.forEach((item, index) => {
            const color = colors[index % colors.length];
            
            fileDistributionCtx.fillStyle = color;
            fileDistributionCtx.fillRect(legendX, legendY, 15, 15);
            
            fileDistributionCtx.fillStyle = 'white';
            fileDistributionCtx.font = '12px Arial';
            fileDistributionCtx.textAlign = 'left';
            fileDistributionCtx.textBaseline = 'middle';
            fileDistributionCtx.fillText(`${item.type} (${item.count})`, legendX + 25, legendY + 7.5);
            
            legendY += 20;
        });
    }
    
    // Show create bucket modal
    function showCreateBucketModal() {
        if (createBucketModal) {
            createBucketModal.style.display = 'block';
            
            // Reset form
            if (createBucketForm) {
                createBucketForm.reset();
            }
        }
    }
    
    // Show upload file modal
    function showUploadFileModal() {
        if (!selectedBucketId) {
            alert('Please select a bucket first');
            return;
        }
        
        if (uploadFileModal) {
            uploadFileModal.style.display = 'block';
            
            // Reset form
            if (uploadFileForm) {
                uploadFileForm.reset();
            }
        }
    }
    
    // Handle create bucket form submission
    function handleCreateBucket(event) {
        event.preventDefault();
        
        const formData = new FormData(createBucketForm);
        const bucketData = {
            bucketName: formData.get('bucketName'),
            location: formData.get('location'),
            storageClass: formData.get('storageClass')
        };
        
        // Hide modal and show loading state
        createBucketModal.style.display = 'none';
        
        // Create bucket
        window.CloudStorageService.createBucket(bucketData, function(newBucket) {
            if (newBucket) {
                // Refresh buckets list
                loadBuckets();
            } else {
                alert('Failed to create bucket. Please try again.');
            }
        });
    }
    
    // Handle file upload form submission
    function handleFileUpload(event) {
        event.preventDefault();
        
        if (!selectedBucketId) {
            alert('Please select a bucket first');
            return;
        }
        
        const formData = new FormData(uploadFileForm);
        const fileData = {
            filePath: formData.get('filePath'),
            contentType: formData.get('contentType'),
            fileSize: formData.get('fileSize')
        };
        
        // Hide modal and show loading state
        uploadFileModal.style.display = 'none';
        
        // Upload file
        window.CloudStorageService.uploadFile(selectedBucketId, fileData, function(newFile) {
            if (newFile) {
                // Refresh files list and bucket details
                window.CloudStorageService.fetchFiles(selectedBucketId, renderFiles);
                window.CloudStorageService.fetchBucketDetails(selectedBucketId, renderBucketDetails);
            } else {
                alert('Failed to upload file. Please try again.');
            }
        });
    }
    
    // Confirm delete all files
    function confirmDeleteAllFiles() {
        if (!selectedBucketId) {
            alert('Please select a bucket first');
            return;
        }
        
        if (confirm('Are you sure you want to delete all files in this bucket? This action cannot be undone.')) {
            window.CloudStorageService.deleteAllFiles(selectedBucketId, function(success) {
                if (success) {
                    // Refresh files list and bucket details
                    window.CloudStorageService.fetchFiles(selectedBucketId, renderFiles);
                    window.CloudStorageService.fetchBucketDetails(selectedBucketId, renderBucketDetails);
                } else {
                    alert('Failed to delete files. Please try again.');
                }
            });
        }
    }
    
    // Select a bucket
    window.selectBucket = function(bucketId) {
        console.log(`Bucket selected: ${bucketId}`);
        selectedBucketId = bucketId;
        
        // Update UI to show selection
        const items = document.querySelectorAll('.bucket-item');
        items.forEach(item => {
            if (item.dataset.bucketId === bucketId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Load bucket details
        window.CloudStorageService.fetchBucketDetails(bucketId, renderBucketDetails);
        
        // Load files
        window.CloudStorageService.fetchFiles(bucketId, renderFiles);
        
        // Start polling for this bucket's details
        if (pollingInterval) {
            window.CloudStorageService.stopPolling(pollingInterval);
        }
        
        pollingInterval = window.CloudStorageService.startPolling(bucketId, renderBucketDetails);
    };
    
    // Resize canvases on window resize
    function resizeCanvases() {
        if (storageUsageCanvas) {
            storageUsageCanvas.width = storageUsageCanvas.offsetWidth;
            storageUsageCanvas.height = storageUsageCanvas.offsetHeight;
        }
        
        if (fileDistributionCanvas) {
            fileDistributionCanvas.width = fileDistributionCanvas.offsetWidth;
            fileDistributionCanvas.height = fileDistributionCanvas.offsetHeight;
        }
        
        // Redraw if we have a selected bucket
        if (selectedBucketId) {
            window.CloudStorageService.fetchBucketDetails(selectedBucketId, renderBucketDetails);
        }
    }
    
    // Initialize controller
    init();
});
```

### Chart Utilities Template
```javascript
/**
 * Cloud Storage Chart Utilities
 * Provides utility functions for drawing Cloud Storage charts
 */

// Draw storage usage chart
function drawStorageUsageChart(data, canvas) {
    if (!canvas || !data) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Set up bar dimensions
    const barWidth = width * 0.7;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = (height - barHeight) / 2;
    
    // Draw empty bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Calculate usage percentage
    const usagePercentage = data.usedPercentage || Math.random() * 80 + 10; // Random value for demo
    
    // Draw filled bar
    const fillWidth = barWidth * (usagePercentage / 100);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.9)'); // Blue
    gradient.addColorStop(1, 'rgba(26, 188, 156, 0.9)'); // Green
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, fillWidth, barHeight);
    
    // Add percentage text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(usagePercentage)}%`, barX + barWidth / 2, barY + barHeight / 2);
    
    // Add labels
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Storage Usage', width / 2, barY - 15);
}

// Draw file type distribution chart
function drawFileTypeDistributionChart(data, canvas) {
    if (!canvas || !data || !data.length) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Chart configuration
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    
    // Colors for pie chart
    const colors = [
        'rgba(52, 152, 219, 0.8)', // Blue
        'rgba(46, 204, 113, 0.8)', // Green
        'rgba(155, 89, 182, 0.8)', // Purple
        'rgba(241, 196, 15, 0.8)', // Yellow
        'rgba(231, 76, 60, 0.8)',  // Red
        'rgba(26, 188, 156, 0.8)', // Turquoise
        'rgba(230, 126, 34, 0.8)', // Orange
        'rgba(149, 165, 166, 0.8)'  // Gray
    ];
    
    // Draw pie chart
    let startAngle = 0;
    let total = data.reduce((sum, item) => sum + item.percentage, 0);
    
    data.forEach((item, index) => {
        const sliceAngle = (item.percentage / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Add label if slice is big enough
        if (item.percentage / total > 0.05) {
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round(item.percentage)}%`, labelX, labelY);
        }
        
        startAngle += sliceAngle;
    });
    
    // Add chart title
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('File Type Distribution', centerX, 10);
    
    // Draw legend
    const legendX = 15;
    let legendY = height - 10 - (data.length * 20);
    
    data.forEach((item, index) => {
        // Draw color square
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(legendX, legendY, 15, 15);
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${item.type} (${item.count})`, legendX + 20, legendY + 7.5);
        
        legendY += 20;
    });
}

// Export the utilities
window.CloudStorageCharts = {
    drawStorageUsageChart,
    drawFileTypeDistributionChart
};
```

### Basic Test Templates

```javascript
// test/unit/routes/api/cloudstorage.test.js
const request = require('supertest');
const express = require('express');
const cloudStorageRoutes = require('../../../../server/routes/api/cloudstorage');

// Mock the cloud-storage-service module
jest.mock('../../../../server/utils/cloudstorage/storage-service', () => ({
  getBuckets: jest.fn(),
  getBucketDetails: jest.fn(),
  getFiles: jest.fn(),
  createBucket: jest.fn(),
  deleteBucket: jest.fn(),
  uploadFile: jest.fn(),
  deleteAllFiles: jest.fn()
}));

describe('Cloud Storage API Routes', () => {
  let app;
  
  beforeEach(() => {
    // Create a fresh Express app and mount our routes for each test
    app = express();
    app.use('/', cloudStorageRoutes);
    
    // Reset and setup mocks
    const cloudStorageService = require('../../../../server/utils/cloudstorage/storage-service');
    
    cloudStorageService.getBuckets.mockResolvedValue([
      { id: 'bucket-1', name: 'Test Bucket 1', location: 'us-central1' },
      { id: 'bucket-2', name: 'Test Bucket 2', location: 'us-east1' }
    ]);
    
    cloudStorageService.getBucketDetails.mockResolvedValue({
      id: 'bucket-1',
      name: 'Test Bucket 1',
      location: 'us-central1',
      fileCount: 10,
      totalSize: '5.25'
    });
    
    cloudStorageService.getFiles.mockResolvedValue([
      { id: 'file-1', name: 'test.txt', path: 'test.txt', contentType: 'text/plain' }
    ]);
  });
  
  describe('GET /buckets', () => {
    it('should return a list of buckets', async () => {
      const response = await request(app).get('/buckets');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id', 'bucket-1');
    });
  });
  
  describe('GET /buckets/:bucketId', () => {
    it('should return bucket details', async () => {
      const response = await request(app).get('/buckets/bucket-1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'bucket-1');
      expect(response.body).toHaveProperty('fileCount');
      expect(response.body).toHaveProperty('totalSize');
    });
  });
  
  describe('GET /buckets/:bucketId/files', () => {
    it('should return files in a bucket', async () => {
      const response = await request(app).get('/buckets/bucket-1/files');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('id', 'file-1');
    });
  });
});
```

## 7. CSS Templates

### Base CSS Template
```css
/* public/css/cloudstorage/base.css */
/* Base styles for Cloud Storage overlay feature */

/* Main content area */
.container {
  margin-top: 60px;
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: visible;
}

/* Panel styles */
.cs-panel {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(52, 152, 219, 0.7); /* Blue border */
  padding: 15px;
  margin: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Panel positioning */
.cs-buckets-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 250px;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
}

.cs-details-panel {
  position: absolute;
  top: 20px;
  left: 290px;
  width: 280px;
  height: 240px;
}

.cs-files-panel {
  position: absolute;
  top: 280px;
  left: 290px;
  width: 280px;
  height: calc(100% - 300px);
  display: flex;
  flex-direction: column;
}

.cs-filetypes-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 250px;
  height: calc(100% - 40px);
}

/* Panel title styles */
.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  color: white;
}

/* List containers */
.list-container, 
.details-container,
.files-container {
  flex: 1;
  overflow-y: auto;
  background: rgba(30, 34, 42, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
  margin-bottom: 10px;
}

/* Empty state message */
.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
}

/* Modal styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: rgba(30, 34, 42, 0.95);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(52, 152, 219, 0.7);
  width: 400px;
  position: relative;
  color: white;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
}

.close-modal:hover {
  color: white;
}

/* Form styling */
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 8px;
  background: rgba(20, 24, 32, 0.8);
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  border-color: rgba(52, 152, 219, 0.7);
  outline: none;
}
```

### Panels CSS Template
```css
/* public/css/cloudstorage/panels.css */
/* Styles for bucket items, file lists, and details */

/* Bucket list items */
.bucket-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.bucket-item:hover {
  background: rgba(52, 152, 219, 0.3);
}

.bucket-item.selected {
  background: rgba(52, 152, 219, 0.5);
}

.bucket-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}

.bucket-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.bucket-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.public-indicator {
  background-color: rgba(46, 204, 113, 0.5);
  color: white;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
}

/* Bucket details */
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.details-header h3 {
  margin: 0;
  font-size: 16px;
}

.public-status {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: bold;
}

.public-status.public {
  background-color: rgba(46, 204, 113, 0.7);
}

.public-status.private {
  background-color: rgba(231, 76, 60, 0.7);
}

.details-content,
.storage-content {
  margin-bottom: 15px;
}

.detail-item,
.storage-item {
  display: flex;
  margin-bottom: 5px;
  font-size: 12px;
}

.detail-label,
.storage-label {
  width: 100px;
  color: rgba(255, 255, 255, 0.7);
}

.detail-value,
.storage-value {
  flex: 1;
}

.storage-header {
  font-size: 14px;
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 10px;
  padding-top: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Files table */
.files-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.files-table th {
  text-align: left;
  padding: 8px;
  background-color: rgba(20, 24, 32, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.files-table td {
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.file-row:hover {
  background-color: rgba(52, 152, 219, 0.2);
}

.file-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### Controls CSS Template
```css
/* public/css/cloudstorage/controls.css */
/* Styles for buttons and controls */

/* Action buttons */
.action-button {
  background: rgba(52, 152, 219, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  margin-top: 5px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.action-button:hover {
  background: rgba(52, 152, 219, 0.9);
}

.action-button:disabled {
  background: rgba(100, 100, 100, 0.5);
  cursor: not-allowed;
}

/* Panel actions container */
.panel-actions {
  display: flex;
  gap: 10px;
}

.panel-actions .action-button {
  flex: 1;
}

/* Status indicators */
.status-active {
  color: #2ecc71;
}

.status-deploying {
  color: #f39c12;
}

.status-failed {
  color: #e74c3c;
}

/* File type colors */
.file-type-image {
  color: #3498db;
}

.file-type-document {
  color: #2ecc71;
}

.file-type-archive {
  color: #9b59b6;
}

/* Hardware Controls Override */
.hardware-controls {
  z-index: 1001; /* Ensure controls stay above modals */
}
```