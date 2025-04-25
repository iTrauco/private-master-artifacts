# Google Cloud Storage Integration Guide

## Required Packages
You'll need to install the following npm packages:

```bash
npm install @google-cloud/storage multer dotenv path fs
```

Here's what each package does:
- **@google-cloud/storage** - Official Google Cloud Storage client library for Node.js
- **multer** - Middleware for handling multipart/form-data (file uploads)
- **dotenv** - Loads environment variables from .env file
- **path** and **fs** - Core Node.js modules for file system operations

## Setting Up a Google Cloud Service Account

### Step 1: Create a Google Cloud Project (if not already done)
- Go to the Google Cloud Console
- Click on "Select a project" at the top of the page
- Click "New Project"
- Enter a project name and click "Create"

### Step 2: Enable Cloud Storage API
- In your Google Cloud Console, navigate to "APIs & Services" > "Library"
- Search for "Cloud Storage API"
- Click on it and then click "Enable"

### Step 3: Create a Service Account
- Go to "IAM & Admin" > "Service Accounts"
- Click "Create Service Account"
- Enter a service account name (e.g., "obs-storage-sa") and description
- Click "Create and Continue"
- Assign the following roles:
  - Storage Admin (roles/storage.admin)
  - Storage Object Admin (roles/storage.objectAdmin)
- Click "Continue" and then "Done"

### Step 4: Create and Download Service Account Key
- Find your newly created service account in the list
- Click on the three dots (actions menu) on the right
- Select "Manage keys"
- Click "Add Key" > "Create new key"
- Choose "JSON" format
- Click "Create" - this will download the key file

### Step 5: Create a Storage Bucket
- Navigate to "Cloud Storage" > "Buckets"
- Click "Create Bucket"
- Enter a unique name for your bucket
- Choose a location for your data
- Configure other settings as needed
- Click "Create"

## Environment Configuration
Create or update your `.env` file with the following variables:

```
# Google Cloud Storage Settings
GCS_PROJECT_ID=your-project-id
GCS_KEY_PATH=/path/to/your-service-account-key.json
GCS_BUCKET_NAME=your-bucket-name
```

Place your service account key file in the specified path, preferably in a secure location like `server/config/keys/`.

## Configuring Electron Integration (if applicable)
If you're using Electron, you'll need to expose these environment variables to the renderer process. Update your `preload.js` file to include:

```javascript
// Expose environment variables to the renderer process
contextBridge.exposeInMainWorld(
  'env',
  {
    // Existing variables
    BQ_PROJECT_ID: process.env.BQ_PROJECT_ID || 'atca-mvp-test',
    BQ_KEY_PATH: process.env.BQ_KEY_PATH || '/path/to/key.json',
    BQ_USE_REAL_DATA: process.env.BQ_USE_REAL_DATA === 'true' || true,
    
    // New Cloud Storage variables
    GCS_PROJECT_ID: process.env.GCS_PROJECT_ID || 'atca-mvp-test',
    GCS_KEY_PATH: process.env.GCS_KEY_PATH || '/path/to/key.json',
    GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'visual-overlay-assets'
  }
);
```

## Adding the Route to Your Express Server
Update your `server/routes/index.js` to include the new cloud storage route:

```javascript
// 🟦 Modular Route Imports
const pageRoutes = require('./pages');
const apiRoutes = {
  hardware: require('./api/hardware'),
  svg: require('./api/svg'),
  bigquery: require('./api/bigquery'),
  interview: require('./api/interview'),
  'cloud-storage': require('./api/cloud-storage'), // Add this line
  // Add more API modules here
};
```

## Testing Your Setup
To verify your setup is working correctly:

Create a simple test script (e.g., `test/manual/test-cloud-storage-connection.js`):

```javascript
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

async function testCloudStorageConnection() {
  try {
    console.log('🔍 Testing Cloud Storage connection...');
    
    // Get key file path
    const keyFilePath = process.env.GCS_KEY_PATH || path.join(__dirname, '../../server/config/keys/your-key-file.json');
    console.log(`🔑 Looking for key file at: ${keyFilePath}`);
    
    // Check if file exists
    if (!fs.existsSync(keyFilePath)) {
      console.error(`❌ Key file not found at: ${keyFilePath}`);
      console.error(`🔍 Current working directory: ${process.cwd()}`);
      return false;
    }
    
    console.log('✅ Key file found, initializing client...');
    
    // Initialize client
    const storageClient = new Storage({
      keyFilename: keyFilePath,
      projectId: process.env.GCS_PROJECT_ID || 'your-project-id'
    });
    
    // Try to list buckets
    console.log('🔍 Testing connection by listing buckets...');
    const [buckets] = await storageClient.getBuckets();
    console.log(`✅ Successfully connected! Found ${buckets.length} buckets.`);
    
    // Print bucket details
    buckets.forEach((bucket, i) => {
      console.log(`  ${i+1}. ${bucket.name}`);
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Error testing Cloud Storage connection:`);
    console.error(`   ${error.message}`);
    console.error(error.stack);
    return false;
  }
}

// Run the test
testCloudStorageConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Cloud Storage connection test passed!');
    } else {
      console.error('❌ Cloud Storage connection test failed!');
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error in test:', error);
  });
```

Run the test script:

```bash
node test/manual/test-cloud-storage-connection.js
```

## Configuring File Upload Limits and Security
The code provided in the artifacts already includes basic security measures, but you might want to customize:

File Upload Limits: Adjust the limits configuration in the multer setup in `server/routes/api/cloud-storage.js`:

```javascript
const upload = multer({
  dest: 'uploads/',
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type filtering
    // Example: Only allow certain file types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/json', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

CORS Configuration: If you're accessing the API from different origins, update your CORS settings in `server.js`.

By following these instructions, you'll have a fully functional Cloud Storage module integrated with your OBS visual overlay application, with all the necessary security considerations and configuration in place.
