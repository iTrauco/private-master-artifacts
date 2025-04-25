// public/js/cloud-storage/services/cloud-storage-service.js
/**
 * Cloud Storage Frontend Service
 * Handles communication with the Cloud Storage API
 */

window.cloudStorageService = {
  /**
   * Fetch available storage buckets
   * @param {boolean} useRealData - Whether to use real data
   * @param {function} callback - Callback to handle response
   */
  fetchBuckets: function(useRealData, callback) {
    console.log(`🔍 Fetching Cloud Storage buckets (useRealData: ${useRealData})`);
    
    fetch(`/api/cloud-storage/buckets?useRealData=${useRealData}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📁 Buckets fetched:', data);
        callback(data);
      })
      .catch(error => {
        console.error('❌ Error fetching Cloud Storage buckets:', error);
        callback(null);
      });
  },
  
  /**
   * Fetch contents of a specific bucket
   * @param {string} bucketName - Bucket name
   * @param {boolean} useRealData - Whether to use real data
   * @param {function} callback - Callback to handle response
   */
  fetchBucketContents: function(bucketName, useRealData, callback) {
    console.log(`🔍 SERVICE: fetchBucketContents details - bucketName: ${bucketName}, useRealData: ${useRealData}`);
    
    fetch(`/api/cloud-storage/buckets/${bucketName}?useRealData=${useRealData}`)
      .then(response => {
        console.log(`📡 SERVICE: Response status: ${response.status}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📊 SERVICE: Bucket contents fetched:', data);
        console.log('📊 SERVICE: Files in response:', data.files ? data.files.length : 'none');
        callback(data);
      })
      .catch(error => {
        console.error(`❌ SERVICE: Error fetching contents for bucket ${bucketName}:`, error);
        callback(null);
      });
  },
  
  /**
   * Upload a file to a bucket
   * @param {string} bucketName - Bucket name
   * @param {File} file - File to upload
   * @param {string} destination - Destination path in bucket
   * @param {function} callback - Callback to handle response
   */
  uploadFile: function(bucketName, file, destination, callback) {
    console.log(`📤 SERVICE: Uploading file to bucket ${bucketName}`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('destination', destination);
    
    fetch(`/api/cloud-storage/buckets/${bucketName}/upload`, {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📤 SERVICE: File upload result:', data);
        callback(data);
      })
      .catch(error => {
        console.error(`❌ SERVICE: Error uploading file to bucket ${bucketName}:`, error);
        callback({
          success: false,
          error: error.message
        });
      });
  },
  
  /**
   * Start polling for bucket contents
   * @param {string} bucketName - Bucket name
   * @param {boolean} useRealData - Whether to use real data
   * @param {function} callback - Callback to handle response
   * @param {number} interval - Polling interval in milliseconds
   * @returns {number} Interval ID
   */
  startPolling: function(bucketName, useRealData, callback, interval = 30000) {
    // Initial fetch
    this.fetchBucketContents(bucketName, useRealData, callback);
    
    // Set up interval for continuous updates
    const pollingInterval = setInterval(() => {
      this.fetchBucketContents(bucketName, useRealData, callback);
    }, interval);
    
    return pollingInterval;
  },
  
  /**
   * Stop polling
   * @param {number} intervalId - Interval ID to stop
   */
  stopPolling: function(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  },
  
  /**
   * Get file download URL
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File name
   * @returns {string} Download URL
   */
  getDownloadUrl: function(bucketName, fileName) {
    return `/api/cloud-storage/buckets/${bucketName}/files/${encodeURIComponent(fileName)}`;
  },
  
  /**
   * Delete a file
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File name
   * @param {function} callback - Callback to handle response
   */
  deleteFile: function(bucketName, fileName, callback) {
    console.log(`🗑️ SERVICE: Deleting file ${fileName} from bucket ${bucketName}`);
    
    fetch(`/api/cloud-storage/buckets/${bucketName}/files/${encodeURIComponent(fileName)}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('🗑️ SERVICE: File deletion result:', data);
        callback(data);
      })
      .catch(error => {
        console.error(`❌ SERVICE: Error deleting file from bucket ${bucketName}:`, error);
        callback({
          success: false,
          error: error.message
        });
      });
  }
};

// public/js/cloud-storage/utils/chart-utils.js
/**
 * Cloud Storage Chart Utilities
 * Provides functions for visualizing Cloud Storage data
 */

window.CloudStorageCharts = {
  /**
   * Draw a file type distribution chart
   * @param {Object} fileStats - File statistics data
   * @param {HTMLCanvasElement} canvas - Canvas element to draw on
   */
  drawFileTypeChart: function(fileStats, canvas) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    if (!fileStats.fileTypes) return;
    
    // Extract data for visualization
    const fileTypes = Object.keys(fileStats.fileTypes);
    const counts = Object.values(fileStats.fileTypes);
    const total = counts.reduce((sum, value) => sum + value, 0);
    
    if (fileTypes.length === 0) return;
    
    // Draw pie chart
    let startAngle = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    // Color palette for file types
    const colors = [
      'rgba(66, 133, 244, 0.8)',  // Blue
      'rgba(219, 68, 55, 0.8)',   // Red
      'rgba(244, 180, 0, 0.8)',   // Yellow
      'rgba(15, 157, 88, 0.8)',   // Green
      'rgba(171, 71, 188, 0.8)'   // Purple
    ];
    
    // Draw slices
    fileTypes.forEach((type, index) => {
      const sliceAngle = (counts[index] / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // Calculate point for type label
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);
      
      // Add type label if slice is large enough
      if (sliceAngle > 0.2) {
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Get short type name
        const typeName = type.split('/').pop();
        ctx.fillText(typeName, labelX, labelY);
      }
      
      startAngle = endAngle;
    });
    
    // Add title
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('File Types Distribution', width / 2, 15);
  },
  
  /**
   * Draw a storage usage chart
   * @param {Array} files - Files data
   * @param {HTMLCanvasElement} canvas - Canvas element to draw on
   */
  drawStorageUsageChart: function(files, canvas) {
    if (!canvas || !files || files.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Group files by directory (first level)
    const dirSizes = {};
    let totalSize = 0;
    
    files.forEach(file => {
      const size = parseFloat(file.size.replace(' KB', '')) || 0;
      totalSize += size;
      
      const dir = file.name.split('/')[0] || 'Root';
      dirSizes[dir] = (dirSizes[dir] || 0) + size;
    });
    
    // Sort directories by size
    const sortedDirs = Object.keys(dirSizes).sort((a, b) => dirSizes[b] - dirSizes[a]);
    
    // Draw bar chart
    const barWidth = (width - 60) / sortedDirs.length;
    const maxBarHeight = height - 60;
    
    // Draw bars
    sortedDirs.forEach((dir, index) => {
      const size = dirSizes[dir];
      const percentage = totalSize === 0 ? 0 : (size / totalSize) * 100;
      const barHeight = (percentage / 100) * maxBarHeight;
      
      // Bar position
      const x = 30 + index * barWidth;
      const y = height - 30 - barHeight;
      
      // Draw bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, 'rgba(66, 133, 244, 0.9)');
      gradient.addColorStop(1, 'rgba(66, 133, 244, 0.5)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 5, barHeight);
      
      // Add directory label
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dir, x + (barWidth - 5) / 2, height - 15);
      
      // Add size label
      if (barHeight > 15) {
        ctx.fillText(`${percentage.toFixed(1)}%`, x + (barWidth - 5) / 2, y + barHeight / 2);
      }
    });
    
    // Add title
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Storage Usage by Directory', width / 2, 15);
  }
};

// public/js/cloud-storage/controllers/bucket-controller.js
/**
 * Bucket Controller
 * Handles UI interactions for the bucket panel
 */
window.bucketController = {
  init: function() {
    // DOM elements
    const bucketPanel = document.getElementById('cs-bucket-panel');
    const bucketList = document.getElementById('bucket-list');
    const loadBucketsBtn = document.getElementById('load-buckets-btn');
    
    // State
    let selectedBucketName = localStorage.getItem('cs_selected_bucket') || null;
    
    // Initialize panel
    createBucketPanelUI();
    setupEventListeners();
    
    // Load buckets on initialization
    loadBuckets();
    
    function createBucketPanelUI() {
      bucketPanel.innerHTML = `
        <div class="panel-title">
          Cloud Storage Buckets
          <span id="data-source-indicator" class="data-source-indicator">Loading...</span>
        </div>
        <div id="bucket-list" class="list-container">
          <div class="empty-state">No buckets loaded</div>
        </div>
        <button id="load-buckets-btn" class="action-button">Load Buckets</button>
        <div class="panel-footer">
          <span id="last-refreshed" class="refresh-timestamp">Not yet updated</span>
        </div>
        <button class="refresh-btn" title="Refresh data">
          <i class="fas fa-sync"></i>
        </button>
      `;
    }
    
    function setupEventListeners() {
      // Get fresh references after creating UI
      const loadBucketsBtn = document.getElementById('load-buckets-btn');
      const refreshBtn = bucketPanel.querySelector('.refresh-btn');
      
      if (loadBucketsBtn) {
        loadBucketsBtn.addEventListener('click', loadBuckets);
      }
      
      if (refreshBtn) {
        refreshBtn.addEventListener('click', loadBuckets);
      }
      
      // Subscribe to relevant events
      window.csEventBus.subscribe('settingsChanged', handleSettingsChanged);
    }
    
    function loadBuckets() {
      const loadBucketsBtn = document.getElementById('load-buckets-btn');
      const bucketList = document.getElementById('bucket-list');
      
      if (loadBucketsBtn) {
        loadBucketsBtn.disabled = true;
        loadBucketsBtn.textContent = 'Loading...';
      }
      
      // Get settings
      const settings = loadSettings();
      const useRealData = settings.useRealData || false;
      
      // Add a console log here to verify the value
      console.log('🔍 BUCKET CONTROLLER: loadBuckets with useRealData =', useRealData);
      
      window.cloudStorageService.fetchBuckets(useRealData, function(result) {
        console.log('📊 BUCKET CONTROLLER: fetchBuckets result:', result);
        console.log('📊 BUCKET CONTROLLER: isRealData =', result.isRealData);
        console.log('📊 BUCKET CONTROLLER: keyFileExists =', result.keyFileExists);
        
        if (result) {
          renderBuckets(result.buckets);
          updateDataSourceIndicator(result.isRealData);
          updateTimestamp();
        } else {
          if (bucketList) {
            bucketList.innerHTML = '<div class="error-state">Error loading buckets</div>';
          }
        }
        
        if (loadBucketsBtn) {
          loadBucketsBtn.disabled = false;
          loadBucketsBtn.textContent = 'Refresh Buckets';
        }
      });
    }
    
    function renderBuckets(buckets) {
      const bucketList = document.getElementById('bucket-list');
      if (!bucketList) return;
      
      if (!buckets || buckets.length === 0) {
        bucketList.innerHTML = '<div class="empty-state">No buckets available</div>';
        return;
      }
      
      let html = '';
      buckets.forEach(bucket => {
        const isSelected = bucket.id === selectedBucketName;
        html += `
          <div class="bucket-item ${isSelected ? 'selected' : ''}" 
               data-bucket-id="${bucket.id}">
            ${bucket.name}
          </div>
        `;
      });
      
      bucketList.innerHTML = html;
      
      // Add click handlers
      document.querySelectorAll('.bucket-item').forEach(item => {
        item.addEventListener('click', function() {
          selectBucket(this.dataset.bucketId);
        });
      });
      
      // Auto-select previous bucket if available
      if (selectedBucketName) {
        const selectedItem = document.querySelector(`.bucket-item[data-bucket-id="${selectedBucketName}"]`);
        if (selectedItem) {
          selectBucket(selectedBucketName);
        } else if (buckets.length > 0) {
          // If selected bucket not found, select the first one
          selectBucket(buckets[0].id);
        }
      } else if (buckets.length > 0) {
        // If no selected bucket, select the first one
        selectBucket(buckets[0].id);
      }
    }
    
    function selectBucket(bucketName) {
      console.log('🚀 BUCKET CONTROLLER: Selecting bucket:', bucketName);
      selectedBucketName = bucketName;
      localStorage.setItem('cs_selected_bucket', bucketName);
      
      // Update UI
      document.querySelectorAll('.bucket-item').forEach(item => {
        if (item.dataset.bucketId === bucketName) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
      
      // Notify other controllers
      console.log('📢 BUCKET CONTROLLER: Publishing bucketSelected event with bucketName:', bucketName);
      window.csEventBus.publish('bucketSelected', { bucketName });
    }
    
    function handleSettingsChanged(event) {
      const settings = event.detail;
      // Add this log
      console.log('📣 BUCKET CONTROLLER: Received settingsChanged event:', settings);
      
      if (settings.dataSourceChanged) {
        console.log('🔄 BUCKET CONTROLLER: Data source changed, reloading buckets');
        // Clear selection and reload buckets with new data source
        selectedBucketName = null;
        localStorage.removeItem('cs_selected_bucket');
        loadBuckets();
      }
    }
    
    function updateDataSourceIndicator(isRealData) {
      const indicator = document.getElementById('data-source-indicator');
      if (indicator) {
        if (isRealData) {
          indicator.textContent = 'Real Data';
          indicator.classList.remove('mock-data');
          indicator.classList.add('real-data');
        } else {
          indicator.textContent = 'Mock Data';
          indicator.classList.remove('real-data');
          indicator.classList.add('mock-data');
        }
      }
    }
    
    function updateTimestamp() {
      const timestampEl = document.getElementById('last-refreshed');
      if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
      }
    }
    
    function loadSettings() {
      try {
        const savedSettings = localStorage.getItem('cs_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
      
      return {
        useRealData: false,
        refreshInterval: 30
      };
    }
    
    // Public API
    return {
      loadBuckets,
      selectBucket
    };
  }
};

// public/js/cloud-storage/controllers/files-controller.js
/**
 * Files Controller
 * Handles UI interactions for the files panel
 */
window.filesController = {
  init: function() {
    // DOM elements
    const filesPanel = document.getElementById('cs-files-panel');
    let filesContainer = document.getElementById('files-container');
    let chartContainer = document.getElementById('files-chart-container');
    
    // State
    let selectedBucketName = null;
    let files = [];
    let pollingInterval = null;
    
    // Initialize panel
    createFilesPanelUI();
    setupEventListeners();
    
    function createFilesPanelUI() {
      filesPanel.innerHTML = `
        <div class="panel-title">Cloud Storage Files</div>
        <div id="files-chart-container" class="chart-container">
          <!-- Chart will be inserted here -->
        </div>
        <div class="controls-container">
          <input type="file" id="file-upload" class="file-input" style="display: none;">
          <button id="upload-file-btn" class="action-button">Upload File</button>
        </div>
        <div id="files-container" class="files-container">
          <div class="empty-state">Select a bucket to view files</div>
        </div>
        <div class="panel-footer">
          <span id="files-last-refreshed" class="refresh-timestamp">Not yet updated</span>
        </div>
        <button class="refresh-btn" title="Refresh data">
          <i class="fas fa-sync"></i>
        </button>
      `;
      
      // Get fresh references
      filesContainer = document.getElementById('files-container');
      chartContainer = document.getElementById('files-chart-container');
    }
    
    function setupEventListeners() {
      // Refresh button
      const refreshBtn = filesPanel.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          if (selectedBucketName) {
            fetchFiles(selectedBucketName);
          }
        });
      }
      
      // Upload button
      const uploadBtn = document.getElementById('upload-file-btn');
      const fileInput = document.getElementById('file-upload');
      
      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
          fileInput.click();
        });
        
        fileInput.addEventListener('change', handleFileUpload);
      }
      
      // Subscribe to events
      window.csEventBus.subscribe('bucketSelected', handleBucketSelected);
      window.csEventBus.subscribe('settingsChanged', handleSettingsChanged);
    }
    
    function handleBucketSelected(event) {
      console.log('📣 FILES CONTROLLER: Received bucketSelected event:', event.detail);
      const { bucketName } = event.detail;
      selectedBucketName = bucketName;
      
      // Clear existing files
      files = [];
      renderFiles([]);
      
      // Fetch files for selected bucket
      console.log('🔍 FILES CONTROLLER: Fetching files for bucket:', bucketName);
      fetchFiles(bucketName);
      
      // Start polling
      startPolling(bucketName);
    }
    
    function fetchFiles(bucketName) {
      console.log('🔄 FILES CONTROLLER: fetchFiles called with bucketName:', bucketName);
      if (!bucketName) {
        console.error('❌ FILES CONTROLLER: No bucketName provided to fetchFiles');
        return;
      }
      
      // Show loading state
      if (filesContainer) {
        filesContainer.innerHTML = '<div class="loading-state">Loading files...</div>';
      } else {
        console.error('❌ FILES CONTROLLER: filesContainer element not found in fetchFiles');
        return;
      }
      
      // Get settings
      const settings = loadSettings();
      const useRealData = settings.useRealData || false;
      
      // Fetch data
      console.log('📊 FILES CONTROLLER: Fetching bucket contents with useRealData:', useRealData);
      window.cloudStorageService.fetchBucketContents(bucketName, useRealData, function(result) {
        console.log('📊 FILES CONTROLLER: Received bucket contents result:', result);
        if (result && result.files) {
          console.log('📊 FILES CONTROLLER: Files received:', result.files.length);
          files = result.files;
          renderFiles(files);
          
          // Draw charts
          if (result.stats && settings.showCharts !== false) {
            drawFileCharts(result.stats, files);
          }
          
          updateTimestamp();
        } else {
          console.error('❌ FILES CONTROLLER: Failed to get files from result');
          if (filesContainer) {
            filesContainer.innerHTML = '<div class="error-state">Error loading files</div>';
          }
        }
      });
    }
    
    function renderFiles(files) {
      console.log('🎨 FILES CONTROLLER: renderFiles called with files:', files);
      
      // Refresh reference to filesContainer in case it was null earlier
      if (!filesContainer) {
        filesContainer = document.getElementById('files-container');
        console.log('🔍 FILES CONTROLLER: Getting filesContainer element in renderFiles:', filesContainer ? 'Found' : 'Not found');
        if (!filesContainer) {
          console.error('❌ FILES CONTROLLER: filesContainer element not found in renderFiles');
          return;
        }
      }
      
      if (!files || files.length === 0) {
        console.log('⚠️ FILES CONTROLLER: No files to render');
        filesContainer.innerHTML = '<div class="empty-state">No files available in this bucket</div>';
        return;
      }
      
      let html = `
        <table class="file-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Type</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Group files by directory
      const filesByDir = {};
      files.forEach(file => {
        const parts = file.name.split('/');
        const dirPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
        const dir = dirPath || 'Root';
        
        if (!filesByDir[dir]) {
          filesByDir[dir] = [];
        }
        
        filesByDir[dir].push(file);
      });
      
      // Sort directories
      const sortedDirs = Object.keys(filesByDir).sort();
      
      // Generate rows for each directory
      sortedDirs.forEach(dir => {
        const dirFiles = filesByDir[dir];
        
        // Add directory header
        if (dir !== 'Root') {
          html += `
            <tr class="directory-row">
              <td colspan="5">
                <div class="directory-name">
                  <i class="fas fa-folder"></i> ${dir}/
                </div>
              </td>
            </tr>
          `;
        }
        
        // Sort files by name
        const sortedFiles = dirFiles.sort((a, b) => {
          const aName = a.name.split('/').pop();
          const bName = b.name.split('/').pop();
          return aName.localeCompare(bName);
        });
        
        // Add file rows
        sortedFiles.forEach(file => {
          const fileName = file.name.split('/').pop();
          const formattedDate = new Date(file.updated).toLocaleString();
          
          html += `
            <tr class="file-row">
              <td>${fileName}</td>
              <td>${file.size}</td>
              <td>${file.contentType || 'Unknown'}</td>
              <td>${formattedDate}</td>
              <td>
                <div class="file-actions">
                  <button class="file-action-btn download" 
                          onclick="window.filesController.handleFileDownload('${selectedBucketName}', '${file.name}')" 
                          title="Download">
                    <i class="fas fa-download"></i>
                  </button>
                  <button class="file-action-btn delete"
                          onclick="window.filesController.handleFileDelete('${selectedBucketName}', '${file.name}')"
                          title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        });
      });
      
      html += `
          </tbody>
        </table>
      `;
      
      // Set the innerHTML and verify it was updated
      filesContainer.innerHTML = html;
      console.log('✅ FILES CONTROLLER: Files list rendered, HTML length:', html.length);
    }
    
    function drawFileCharts(stats, files) {
      // Check if chart container exists
      if (!chartContainer) {
        chartContainer = document.getElementById('files-chart-container');
        if (!chartContainer) {
          console.error('Chart container not found');
          return;
        }
      }
      
      // Create two canvases for different charts
      chartContainer.innerHTML = `
        <div class="chart-grid">
          <div class="chart-cell">
            <canvas id="file-types-canvas" width="300" height="200"></canvas>
          </div>
          <div class="chart-cell">
            <canvas id="storage-usage-canvas" width="300" height="200"></canvas>
          </div>
        </div>
      `;
      
      // Draw file types chart
      const typesCanvas = document.getElementById('file-types-canvas');
      if (typesCanvas && window.CloudStorageCharts) {
        window.CloudStorageCharts.drawFileTypeChart(stats, typesCanvas);
      }
      
      // Draw storage usage chart
      const usageCanvas = document.getElementById('storage-usage-canvas');
      if (usageCanvas && window.CloudStorageCharts) {
        window.CloudStorageCharts.drawStorageUsageChart(files, usageCanvas);
      }
    }
    
    function handleFileUpload(e) {
      if (!selectedBucketName) {
        alert('Please select a bucket first.');
        return;
      }
      
      const file = e.target.files[0];
      if (!file) return;
      
      // Get custom destination
      let destination = prompt('Enter destination path (leave blank for root):', '');
      
      // If canceled
      if (destination === null) return;
      
      // Add filename if destination is directory
      if (destination && !destination.endsWith('/')) {
        destination += '/';
      }
      destination += file.name;
      
      // Upload the file
      console.log(`Uploading ${file.name} to ${selectedBucketName}/${destination}`);
      
      window.cloudStorageService.uploadFile(selectedBucketName, file, destination, result => {
        // Reset the file input
        document.getElementById('file-upload').value = '';
        
        if (result.success) {
          alert('File uploaded successfully.');
          fetchFiles(selectedBucketName);
        } else {
          alert(`Upload failed: ${result.error}`);
        }
      });
    }
    
    window.filesController.handleFileDownload = function(bucketName, fileName) {
      const downloadUrl = window.cloudStorageService.getDownloadUrl(bucketName, fileName);
      
      // Open in new tab
      window.open(downloadUrl, '_blank');
    };
    
    window.filesController.handleFileDelete = function(bucketName, fileName) {
      if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
        return;
      }
      
      window.cloudStorageService.deleteFile(bucketName, fileName, result => {
        if (result.success) {
          alert('File deleted successfully.');
          fetchFiles(bucketName);
        } else {
          alert(`Delete failed: ${result.error}`);
        }
      });
    };
    
    function startPolling(bucketName) {
      // Clear existing interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      
      // Get settings
      const settings = loadSettings();
      const refreshInterval = (settings.refreshInterval || 30) * 1000; // Convert to milliseconds
      
      // Start new polling
      pollingInterval = setInterval(() => {
        if (selectedBucketName) {
          fetchFiles(selectedBucketName);
        }
      }, refreshInterval);
    }
    
    function handleSettingsChanged(event) {
      const settings = event.detail;
      
      // Update charts visibility
      if (chartContainer) {
        chartContainer.style.display = settings.showCharts !== false ? 'block' : 'none';
      }
      
      // Update refresh interval
      if (selectedBucketName) {
        startPolling(selectedBucketName);
      }
      
      // Reload data if source changed
      if (settings.dataSourceChanged && selectedBucketName) {
        fetchFiles(selectedBucketName);
      }
    }
    
    function updateTimestamp() {
      const timestampEl = document.getElementById('files-last-refreshed');
      if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
      }
    }
    
    function loadSettings() {
      try {
        const savedSettings = localStorage.getItem('cs_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
      
      return {
        useRealData: false,
        refreshInterval: 30,
        showCharts: true
      };
    }
    
    // Public API
    return {
      fetchFiles,
      handleFileDownload: window.filesController.handleFileDownload,
      handleFileDelete: window.filesController.handleFileDelete
    };
  }
};

// public/js/cloud-storage/controllers/stats-controller.js
/**
 * Stats Controller
 * Handles UI interactions for the stats panel
 */
window.statsController = {
  init: function() {
    // DOM elements
    const statsPanel = document.getElementById('cs-stats-panel');
    let statsContainer = document.getElementById('stats-container');
    
    // State
    let selectedBucketName = null;
    let bucketStats = null;
    
    // Initialize panel
    createStatsPanelUI();
    setupEventListeners();
    
    function createStatsPanelUI() {
      statsPanel.innerHTML = `
        <div class="panel-title">Storage Stats</div>
        <div id="stats-container" class="stats-container">
          <div class="empty-state">Select a bucket to view stats</div>
        </div>
        <div class="panel-footer">
          <span id="stats-last-refreshed" class="refresh-timestamp">Not yet updated</span>
        </div>
        <button class="refresh-btn" title="Refresh data">
          <i class="fas fa-sync"></i>
        </button>
      `;
      
      // Get fresh reference
      statsContainer = document.getElementById('stats-container');
    }
    
    function setupEventListeners() {
      // Refresh button
      const refreshBtn = statsPanel.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          if (selectedBucketName) {
            fetchStats(selectedBucketName);
          }
        });
      }
      
      // Subscribe to events
      window.csEventBus.subscribe('bucketSelected', handleBucketSelected);
    }
    
    function handleBucketSelected(event) {
      console.log('📣 STATS CONTROLLER: Received bucketSelected event:', event.detail);
      const { bucketName } = event.detail;
      selectedBucketName = bucketName;
      
      // Clear existing stats
      bucketStats = null;
      renderStats(null);
      
      // Fetch stats for selected bucket
      console.log('🔍 STATS CONTROLLER: Fetching stats for bucket:', bucketName);
      fetchStats(bucketName);
    }
    
    function fetchStats(bucketName) {
      console.log('🔄 STATS CONTROLLER: fetchStats called with bucketName:', bucketName);
      if (!bucketName) {
        console.error('❌ STATS CONTROLLER: No bucketName provided to fetchStats');
        return;
      }
      
      // Show loading state
      if (statsContainer) {
        statsContainer.innerHTML = '<div class="loading-state">Loading stats...</div>';
      } else {
        console.error('❌ STATS CONTROLLER: statsContainer element not found in fetchStats');
        return;
      }
      
      // Get settings
      const settings = loadSettings();
      const useRealData = settings.useRealData || false;
      
      // Fetch data
      console.log('📊 STATS CONTROLLER: Fetching bucket contents with useRealData:', useRealData);
      window.cloudStorageService.fetchBucketContents(bucketName, useRealData, function(result) {
        console.log('📊 STATS CONTROLLER: Received bucket contents result:', result);
        if (result && result.stats) {
          console.log('📊 STATS CONTROLLER: Stats received:', result.stats);
          bucketStats = result.stats;
          renderStats(bucketStats);
          updateTimestamp();
        } else {
          console.error('❌ STATS CONTROLLER: Failed to get stats from result');
          if (statsContainer) {
            statsContainer.innerHTML = '<div class="error-state">Error loading stats</div>';
          }
        }
      });
    }
    
    function renderStats(stats) {
      console.log('🎨 STATS CONTROLLER: renderStats called with stats:', stats);
      
      // Refresh reference to statsContainer in case it was null earlier
      if (!statsContainer) {
        statsContainer = document.getElementById('stats-container');
        console.log('🔍 STATS CONTROLLER: Getting statsContainer element in renderStats:', statsContainer ? 'Found' : 'Not found');
        if (!statsContainer) {
          console.error('❌ STATS CONTROLLER: statsContainer element not found in renderStats');
          return;
        }
      }
      
      if (!stats) {
        console.log('⚠️ STATS CONTROLLER: No stats to render');
        statsContainer.innerHTML = '<div class="empty-state">No stats available for this bucket</div>';
        return;
      }
      
      let html = `
        <div class="stats-summary">
          <div class="stat-item">
            <div class="


<div class="stat-value">${stats.totalFiles}</div>
            <div class="stat-label">Total Files</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${stats.totalSize}</div>
            <div class="stat-label">Total Size</div>
          </div>
        </div>
        
        <div class="file-types-distribution">
          <h3>File Types</h3>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Add file types
      if (stats.fileTypes) {
        Object.entries(stats.fileTypes).forEach(([type, count]) => {
          html += `
            <tr>
              <td>${type}</td>
              <td>${count}</td>
            </tr>
          `;
        });
      }
      
      html += `
            </tbody>
          </table>
        </div>
      `;
      
      // Add upload activity if available
      if (stats.uploadsByDay) {
        html += `
          <div class="upload-activity">
            <h3>Upload Activity</h3>
            <table class="stats-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Uploads</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        stats.uploadsByDay.forEach(day => {
          html += `
            <tr>
              <td>${day.day}</td>
              <td>${day.count}</td>
            </tr>
          `;
        });
        
        html += `
              </tbody>
            </table>
          </div>
        `;
      }
      
      // Set the innerHTML and verify it was updated
      statsContainer.innerHTML = html;
      console.log('✅ STATS CONTROLLER: Stats rendered, HTML length:', html.length);
    }
    
    function updateTimestamp() {
      const timestampEl = document.getElementById('stats-last-refreshed');
      if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
      }
    }
    
    function loadSettings() {
      try {
        const savedSettings = localStorage.getItem('cs_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
      
      return {
        useRealData: false,
        refreshInterval: 30
      };
    }
    
    // Public API
    return {
      fetchStats
    };
  }
};

// public/js/cloud-storage/controllers/index.js
/**
 * Cloud Storage Main Controller
 * Initializes and coordinates Cloud Storage component controllers
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🧠 Cloud Storage controller initializing');
  
  // Initialize event bus for communication between controllers
  window.csEventBus = {
    publish: function(event, data) {
      const customEvent = new CustomEvent(event, { detail: data });
      document.dispatchEvent(customEvent);
    },
    subscribe: function(event, callback) {
      document.addEventListener(event, callback);
    }
  };
  
  // Get environment variables from preload (if available)
  console.log('🔍 Checking for environment variables from preload script:');
  if (window.env) {
    console.log('✅ Environment variables from preload script found:');
    console.log('GCS_PROJECT_ID:', window.env.GCS_PROJECT_ID);
    console.log('GCS_KEY_PATH:', window.env.GCS_KEY_PATH);
    console.log('GCS_BUCKET_NAME:', window.env.GCS_BUCKET_NAME);
  } else {
    console.log('❌ No environment variables found from preload script');
  }
  
  // Initialize controllers
  const bucketController = window.bucketController.init();
  const filesController = window.filesController.init();
  const statsController = window.statsController.init();
  
  // Set up panel visibility controls
  setupPanelControls();
  
  // Setup settings panel
  setupSettingsPanel();
  
  function setupPanelControls() {
    const bucketPanel = document.getElementById('cs-bucket-panel');
    const filesPanel = document.getElementById('cs-files-panel');
    const statsPanel = document.getElementById('cs-stats-panel');
    const settingsPanel = document.getElementById('cs-settings-panel');
    
    if (!bucketPanel || !filesPanel || !statsPanel) {
      console.error('One or more panel elements not found');
      return;
    }
    
    // Show/hide panels
    const showAllBtn = document.getElementById('show-all-btn');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        if (bucketPanel) bucketPanel.style.display = 'block';
        if (filesPanel) filesPanel.style.display = 'block';
        if (statsPanel) statsPanel.style.display = 'block';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const hideAllBtn = document.getElementById('hide-all-btn');
    if (hideAllBtn) {
      hideAllBtn.addEventListener('click', () => {
        if (bucketPanel) bucketPanel.style.display = 'none';
        if (filesPanel) filesPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showBucketsBtn = document.getElementById('show-buckets-btn');
    if (showBucketsBtn) {
      showBucketsBtn.addEventListener('click', () => {
        if (bucketPanel) bucketPanel.style.display = 'block';
        if (filesPanel) filesPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showFilesBtn = document.getElementById('show-files-btn');
    if (showFilesBtn) {
      showFilesBtn.addEventListener('click', () => {
        if (bucketPanel) bucketPanel.style.display = 'none';
        if (filesPanel) filesPanel.style.display = 'block';
        if (statsPanel) statsPanel.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showStatsBtn = document.getElementById('show-stats-btn');
    if (showStatsBtn) {
      showStatsBtn.addEventListener('click', () => {
        if (bucketPanel) bucketPanel.style.display = 'none';
        if (filesPanel) filesPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'block';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showSettingsBtn = document.getElementById('show-settings-btn');
    if (showSettingsBtn && settingsPanel) {
      showSettingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    // Toggle navigation
    const toggleControlsBtn = document.getElementById('toggle-controls-btn');
    const showControlsBtn = document.getElementById('show-controls-btn');
    const controlPanel = document.querySelector('.hardware-controls');

    if (toggleControlsBtn && showControlsBtn && controlPanel) {
      toggleControlsBtn.addEventListener('click', () => {
        controlPanel.style.display = 'none';
        showControlsBtn.style.display = 'flex';
      });
      
      showControlsBtn.addEventListener('click', () => {
        controlPanel.style.display = 'flex';
        showControlsBtn.style.display = 'none';
      });
    }
  }
  
  function setupSettingsPanel() {
    const applySettingsBtn = document.getElementById('apply-settings');
    const useRealDataCheckbox = document.getElementById('use-real-data');
    const refreshIntervalInput = document.getElementById('refresh-interval');
    const refreshIntervalValue = document.getElementById('refresh-interval-value');
    
    if (!applySettingsBtn || !useRealDataCheckbox || !refreshIntervalInput) {
      console.error('One or more settings elements not found');
      return;
    }
    
    // Load saved settings
    const settings = loadSettings();
    
    // Apply saved settings to UI
    useRealDataCheckbox.checked = settings.useRealData;
    refreshIntervalInput.value = settings.refreshInterval;
    if (refreshIntervalValue) {
      refreshIntervalValue.textContent = settings.refreshInterval;
    }
    
    // Update refresh interval display
    if (refreshIntervalInput && refreshIntervalValue) {
      refreshIntervalInput.addEventListener('input', () => {
        refreshIntervalValue.textContent = refreshIntervalInput.value;
      });
    }
    
    applySettingsBtn.addEventListener('click', () => {
      const newSettings = { 
        useRealData: useRealDataCheckbox.checked,
        refreshInterval: parseInt(refreshIntervalInput.value),
        dataSourceChanged: settings.useRealData !== useRealDataCheckbox.checked
      };
      
      // Save settings to localStorage
      saveSettings(newSettings);
      
      // Notify controllers
      window.csEventBus.publish('settingsChanged', newSettings);
      
      // Hide settings panel
      const settingsPanel = document.getElementById('cs-settings-panel');
      if (settingsPanel) {
        settingsPanel.style.display = 'none';
      }
    });
  }
  
  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem('cs_settings');
      console.log('🔄 Loading saved settings from localStorage:', savedSettings);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('🔄 Parsed settings:', parsedSettings);
        return parsedSettings;
      }
    } catch (e) {
      console.error('Error loading saved settings:', e);
    }
    
    // Default settings
    console.log('🔄 Using default settings (no saved settings found)');
    return {
      useRealData: false,
      refreshInterval: 30
    };
  }
  
  function saveSettings(settings) {
    try {
      localStorage.setItem('cs_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }
  
  console.log('🧠 Cloud Storage controller initialized successfully');
});