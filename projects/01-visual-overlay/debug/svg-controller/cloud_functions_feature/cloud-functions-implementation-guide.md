# Cloud Functions Feature Implementation Guide

## 1. File Structure

Create these files:

```
public/
├── css/
│   └── cloudfunctions/
│       ├── base.css
│       ├── panels.css
│       └── controls.css
├── js/
│   └── cloudfunctions/
│       ├── controllers/
│       │   └── cloudfunctions-controller.js
│       ├── services/
│       │   └── cloudfunctions-service.js
│       └── utils/
│           └── chart-utils.js
├── pages/
│   └── cloudfunctions/
│       └── index.html
server/
├── routes/
│   ├── api/
│   │   └── cloudfunctions.js
│   └── pages.js (modify)
└── utils/
    └── cloudfunctions/
        └── function-service.js
test/
└── unit/
    ├── routes/
    │   └── api/
    │       └── cloudfunctions.test.js
    └── utils/
        └── cloudfunctions/
            └── function-service.test.js
```

## 2. Backend Implementation

### 2.1 Create Server Route (`server/routes/api/cloudfunctions.js`)

Create a new Express router for Cloud Functions API endpoints:
- GET `/api/cloudfunctions/list` - Get all functions
- GET `/api/cloudfunctions/:functionId` - Get function details
- GET `/api/cloudfunctions/:functionId/logs` - Get function logs
- POST `/api/cloudfunctions/create` - Create new function
- DELETE `/api/cloudfunctions/:functionId` - Delete function

### 2.2 Create Mock Service (`server/utils/cloudfunctions/function-service.js`)

Implement a mock service with:
- `getFunctions()` - Returns list of functions with status
- `getFunctionDetails(functionId)` - Returns metrics for a function
- `getFunctionLogs(functionId)` - Returns logs for a function
- `createFunction(config)` - Simulates function creation
- `deleteFunction(functionId)` - Simulates function deletion

### 2.3 Update Page Routes (`server/routes/pages.js`)

Add the Cloud Functions route to the existing page routes.

## 3. Frontend Implementation

### 3.1 Create HTML Page (`public/pages/cloudfunctions/index.html`)

Structure with:
- Navigation bar (same as other pages)
- Functions list panel
- Details panel
- Logs panel
- Controls/actions panel
- Control buttons for panel visibility

### 3.2 Create CSS Files

Create styles matching the existing appearance:
- `base.css` - Main layout and panel positioning
- `panels.css` - Panel styling, list items, tables
- `controls.css` - Buttons and controls styling

### 3.3 Create Frontend Service (`public/js/cloudfunctions/services/cloudfunctions-service.js`)

Implement a service with:
- `fetchFunctions()` - Get all functions
- `fetchFunctionDetails(functionId)` - Get function details
- `fetchFunctionLogs(functionId)` - Get function logs
- `createFunction(config)` - Create new function
- `deleteFunction(functionId)` - Delete function
- `startPolling(callback, interval)` - Poll for updates
- `stopPolling(intervalId)` - Stop polling

### 3.4 Create Controller (`public/js/cloudfunctions/controllers/cloudfunctions-controller.js`)

Implement a controller with:
- `init()` - Initialize controller
- `setupEventListeners()` - Set up UI event handlers
- `loadFunctions()` - Load and render functions list
- `renderFunctions(functions)` - Render functions in the list
- `renderFunctionDetails(details)` - Render function details
- `renderFunctionLogs(logs)` - Render function logs
- `handleFunctionSelection(functionId)` - Handle function selection
- Panel visibility toggle handlers

### 3.5 Create Chart Utilities (`public/js/cloudfunctions/utils/chart-utils.js`)

Implement utilities for:
- `drawFunctionPerformanceChart(metrics, canvas)` - Draw performance chart
- `drawInvocationChart(data, canvas)` - Draw invocation chart

## 4. Testing Implementation

### 4.1 Create API Route Tests (`test/unit/routes/api/cloudfunctions.test.js`)

Create tests for:
- GET `/api/cloudfunctions/list`
- GET `/api/cloudfunctions/:functionId`
- GET `/api/cloudfunctions/:functionId/logs`

### 4.2 Create Service Tests (`test/unit/utils/cloudfunctions/function-service.test.js`)

Create tests for:
- `getFunctions()`
- `getFunctionDetails(functionId)`
- `getFunctionLogs(functionId)`

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
  <title>Cloud Functions - OBS Hardware Overlay</title>
  
  <!-- Base styles -->
  <link rel="stylesheet" href="../../css/base/reset.css">
  <link rel="stylesheet" href="../../css/base/global.css">
  
  <!-- Navigation styles -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
  <link rel="stylesheet" href="../../css/navigation/controls.css">
  
  <!-- Cloud Functions styles -->
  <link rel="stylesheet" href="../../css/cloudfunctions/base.css">
  <link rel="stylesheet" href="../../css/cloudfunctions/panels.css">
  <link rel="stylesheet" href="../../css/cloudfunctions/controls.css">
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
      <li><a href="#" class="active" onclick="navigateTo('/cloudfunctions')">Cloud Functions</a></li>
      <li><a href="#" onclick="navigateTo('/settings')">Settings</a></li>
    </ul>
  </nav>
  
  <div class="container">
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
    
    <!-- Functions List Panel -->
    <div id="cf-functions-panel" class="cf-panel cf-functions-panel">
      <div class="panel-title">Cloud Functions</div>
      <div id="functions-list" class="list-container">
        <div class="empty-state">No functions loaded</div>
      </div>
      <button id="load-functions-btn" class="action-button">Load Functions</button>
    </div>

    <!-- Function Details Panel -->
    <div id="cf-details-panel" class="cf-panel cf-details-panel">
      <div class="panel-title">Function Details</div>
      <div id="function-details" class="details-container">
        <div class="empty-state">Select a function to view details</div>
      </div>
      <canvas id="performance-canvas"></canvas>
    </div>

    <!-- Function Logs Panel -->
    <div id="cf-logs-panel" class="cf-panel cf-logs-panel">
      <div class="panel-title">Function Logs</div>
      <div id="function-logs" class="logs-container">
        <div class="empty-state">Select a function to view logs</div>
      </div>
    </div>
  </div>

  <!-- Hardware Controls Bar -->
  <div class="hardware-controls">
    <button id="show-all-btn">Show All</button>
    <button id="hide-all-btn">Hide All</button>
    <button id="show-functions-btn">Functions Only</button>
    <button id="show-details-btn">Details Only</button>
    <button id="show-logs-btn">Logs Only</button>
    <button id="toggle-controls-btn">≡</button>
  </div>
  <div id="show-controls-btn" style="display: none;">≡</div>

  <!-- Core Scripts -->
  <script src="../../js/navigation.js"></script>
  
  <!-- Cloud Functions Scripts -->
  <script src="../../js/cloudfunctions/services/cloudfunctions-service.js"></script>
  <script src="../../js/cloudfunctions/utils/chart-utils.js"></script>
  <script src="../../js/cloudfunctions/controllers/cloudfunctions-controller.js"></script>
</body>
</html>
```

### API Route Template
```javascript
// server/routes/api/cloudfunctions.js
const express = require('express');
const router = express.Router();
const cloudFunctionsService = require('../../utils/cloudfunctions/function-service');

// Get all functions
router.get('/list', async (req, res) => {
    try {
        const functions = await cloudFunctionsService.getFunctions();
        res.json(functions);
    } catch (error) {
        console.error('Error fetching Cloud Functions:', error);
        res.status(500).json({ error: 'Failed to fetch Cloud Functions' });
    }
});

// Get function details
router.get('/:functionId', async (req, res) => {
    try {
        const details = await cloudFunctionsService.getFunctionDetails(req.params.functionId);
        res.json(details);
    } catch (error) {
        console.error(`Error fetching function details for ${req.params.functionId}:`, error);
        res.status(500).json({ error: 'Failed to fetch function details' });
    }
});

// Get function logs
router.get('/:functionId/logs', async (req, res) => {
    try {
        const logs = await cloudFunctionsService.getFunctionLogs(req.params.functionId);
        res.json(logs);
    } catch (error) {
        console.error(`Error fetching logs for ${req.params.functionId}:`, error);
        res.status(500).json({ error: 'Failed to fetch function logs' });
    }
});

// Create new function
router.post('/create', async (req, res) => {
    try {
        const newFunction = await cloudFunctionsService.createFunction(req.body);
        res.status(201).json(newFunction);
    } catch (error) {
        console.error('Error creating function:', error);
        res.status(500).json({ error: 'Failed to create function' });
    }
});

// Delete function
router.delete('/:functionId', async (req, res) => {
    try {
        await cloudFunctionsService.deleteFunction(req.params.functionId);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting function ${req.params.functionId}:`, error);
        res.status(500).json({ error: 'Failed to delete function' });
    }
});

module.exports = router;
```

### Mock Service Template
```javascript
// server/utils/cloudfunctions/function-service.js
/**
 * Cloud Functions Service Utility
 * Handles integration with the Google Cloud Functions API
 */

// Runtime options for functions
const runtimes = ['nodejs16', 'nodejs14', 'python39', 'go116', 'java11'];

// Status options
const statuses = ['ACTIVE', 'DEPLOYING', 'FAILED'];

// Generate a random function
function generateMockFunction(id) {
    const runtime = runtimes[Math.floor(Math.random() * runtimes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
        id: id || `function-${Math.floor(Math.random() * 1000)}`,
        name: `example-function-${Math.floor(Math.random() * 100)}`,
        runtime,
        status,
        region: 'us-central1',
        memory: `${Math.pow(2, Math.floor(Math.random() * 5) + 6)}MB`, // 128MB to 2GB
        lastDeployed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        httpsTrigger: Math.random() > 0.5
    };
}

// Generate metrics for a function
function generateMetrics(functionId) {
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    
    // Generate hourly data points for the last 24 hours
    const invocations = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now - (23 - i) * hourMs).toISOString(),
        count: Math.floor(Math.random() * 100)
    }));
    
    return {
        functionId,
        totalInvocations: invocations.reduce((sum, point) => sum + point.count, 0),
        averageExecutionTime: `${Math.floor(Math.random() * 1000)}ms`,
        errorRate: `${(Math.random() * 5).toFixed(2)}%`,
        memoryUsage: `${(Math.random() * 100).toFixed(2)}%`,
        invocations
    };
}

// Generate logs for a function
function generateLogs(functionId, count = 20) {
    const now = Date.now();
    const severities = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
    const messageTemplates = [
        'Function execution started',
        'Function execution took {time}ms',
        'Function completed successfully',
        'Error: {error}',
        'Received request with payload size {size}',
        'Memory usage: {memory}MB'
    ];
    
    return Array.from({ length: count }, (_, i) => {
        const severity = severities[Math.floor(Math.random() * severities.length)];
        let message = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        
        // Replace placeholders
        message = message
            .replace('{time}', Math.floor(Math.random() * 1000))
            .replace('{error}', 'Connection refused')
            .replace('{size}', Math.floor(Math.random() * 100))
            .replace('{memory}', Math.floor(Math.random() * 256));
        
        return {
            timestamp: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            severity,
            message,
            functionId
        };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort newest first
}

// Mock implementation
const cloudFunctionsService = {
    /**
     * Get list of Cloud Functions
     * @returns {Promise<Array>} List of functions
     */
    getFunctions: async function() {
        console.log('Getting Cloud Functions (mock)');
        
        // Generate 5-10 random functions
        const count = Math.floor(Math.random() * 6) + 5;
        const functions = Array.from({ length: count }, () => generateMockFunction());
        
        return functions;
    },
    
    /**
     * Get details for a specific Cloud Function
     * @param {string} functionId - Function ID
     * @returns {Promise<Object>} Function details and metrics
     */
    getFunctionDetails: async function(functionId) {
        console.log(`Getting details for function: ${functionId} (mock)`);
        
        // Generate function details
        const functionDetails = generateMockFunction(functionId);
        const metrics = generateMetrics(functionId);
        
        return {
            ...functionDetails,
            metrics
        };
    },
    
    /**
     * Get logs for a specific Cloud Function
     * @param {string} functionId - Function ID
     * @returns {Promise<Array>} Function logs
     */
    getFunctionLogs: async function(functionId) {
        console.log(`Getting logs for function: ${functionId} (mock)`);
        
        // Generate logs
        const logs = generateLogs(functionId);
        
        return logs;
    },
    
    /**
     * Create a new Cloud Function
     * @param {Object} config - Function configuration
     * @returns {Promise<Object>} Newly created function
     */
    createFunction: async function(config) {
        console.log(`Creating new function with config:`, config);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a new function with the provided name if present
        const newFunction = generateMockFunction();
        if (config && config.name) {
            newFunction.name = config.name;
        }
        if (config && config.runtime) {
            newFunction.runtime = config.runtime;
        }
        
        return newFunction;
    },
    
    /**
     * Delete a Cloud Function
     * @param {string} functionId - Function ID to delete
     * @returns {Promise<void>}
     */
    deleteFunction: async function(functionId) {
        console.log(`Deleting function: ${functionId} (mock)`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Nothing to return, just simulate success
        return;
    }
};

module.exports = cloudFunctionsService;
```

### Frontend Service Template
```javascript
/**
 * Cloud Functions Service Module
 * Handles fetching Cloud Functions data from the API
 */

// Create a global CloudFunctionsService object
window.CloudFunctionsService = {
    // Fetch available Cloud Functions
    fetchFunctions: function(callback) {
        console.log('Fetching Cloud Functions');
        fetch('/api/cloudfunctions/list')
            .then(response => response.json())
            .then(data => {
                console.log('Functions fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error fetching Cloud Functions:', error);
                callback(null);
            });
    },
    
    // Fetch details for a specific function
    fetchFunctionDetails: function(functionId, callback) {
        console.log(`Fetching details for function: ${functionId}`);
        fetch(`/api/cloudfunctions/${functionId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Function details fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error(`Error fetching details for function ${functionId}:`, error);
                callback(null);
            });
    },
    
    // Fetch logs for a specific function
    fetchFunctionLogs: function(functionId, callback) {
        console.log(`Fetching logs for function: ${functionId}`);
        fetch(`/api/cloudfunctions/${functionId}/logs`)
            .then(response => response.json())
            .then(data => {
                console.log('Function logs fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error(`Error fetching logs for function ${functionId}:`, error);
                callback(null);
            });
    },
    
    // Create a new function
    createFunction: function(config, callback) {
        console.log('Creating new function:', config);
        fetch('/api/cloudfunctions/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Function created:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error creating function:', error);
                callback(null);
            });
    },
    
    // Delete a function
    deleteFunction: function(functionId, callback) {
        console.log(`Deleting function: ${functionId}`);
        fetch(`/api/cloudfunctions/${functionId}`, {
            method: 'DELETE'
        })
            .then(response => {
                console.log(`Function ${functionId} deleted`);
                callback(true);
            })
            .catch(error => {
                console.error(`Error deleting function ${functionId}:`, error);
                callback(false);
            });
    },
    
    // Start polling for function updates
    startPolling: function(functionId, callback, interval = 10000) {
        // Initial fetch
        this.fetchFunctionDetails(functionId, callback);
        
        // Set up interval for continuous updates
        this.pollingInterval = setInterval(() => {
            this.fetchFunctionDetails(functionId, callback);
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
 * Cloud Functions Controller Module
 * Handles UI interactions for Cloud Functions monitoring
 */

// Main controller
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cloud Functions controller initializing');
    
    // DOM elements
    const functionsPanel = document.getElementById('cf-functions-panel');
    const detailsPanel = document.getElementById('cf-details-panel');
    const logsPanel = document.getElementById('cf-logs-panel');
    const functionsList = document.getElementById('functions-list');
    const functionDetails = document.getElementById('function-details');
    const functionLogs = document.getElementById('function-logs');
    const loadFunctionsBtn = document.getElementById('load-functions-btn');
    
    // Canvas for performance visualization
    const performanceCanvas = document.getElementById('performance-canvas');
    let performanceCtx = null;
    if (performanceCanvas) {
        performanceCtx = performanceCanvas.getContext('2d');
        
        // Set canvas dimensions
        performanceCanvas.width = performanceCanvas.offsetWidth;
        performanceCanvas.height = performanceCanvas.offsetHeight;
    }
    
    // State
    let selectedFunctionId = null;
    let pollingInterval = null;
    
    // Initialize controller
    function init() {
        setupEventListeners();
        window.addEventListener('resize', resizeCanvas);
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Function loading
        if (loadFunctionsBtn) {
            loadFunctionsBtn.addEventListener('click', loadFunctions);
        }
        
        // Control panel buttons
        document.querySelector('#show-all-btn').addEventListener('click', () => {
            functionsPanel.style.display = 'block';
            detailsPanel.style.display = 'block';
            logsPanel.style.display = 'block';
        });
        
        document.querySelector('#hide-all-btn').addEventListener('click', () => {
            functionsPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            logsPanel.style.display = 'none';
        });
        
        document.querySelector('#show-functions-btn').addEventListener('click', () => {
            functionsPanel.style.display = 'block';
            detailsPanel.style.display = 'none';
            logsPanel.style.display = 'none';
        });
        
        document.querySelector('#show-details-btn').addEventListener('click', () => {
            functionsPanel.style.display = 'none';
            detailsPanel.style.display = 'block';
            logsPanel.style.display = 'none';
        });
        
        document.querySelector('#show-logs-btn').addEventListener('click', () => {
            functionsPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            logsPanel.style.display = 'block';
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
    
    // Load functions from API
    function loadFunctions() {
        if (loadFunctionsBtn) {
            loadFunctionsBtn.disabled = true;
            loadFunctionsBtn.textContent = 'Loading...';
        }
        
        window.CloudFunctionsService.fetchFunctions(renderFunctions);
    }
    
    // Render functions list
    function renderFunctions(functions) {
        if (loadFunctionsBtn) {
            loadFunctionsBtn.disabled = false;
            loadFunctionsBtn.textContent = 'Refresh Functions';
        }
        
        if (!functions || !functionsList) return;
        
        if (functions.length === 0) {
            functionsList.innerHTML = '<div class="empty-state">No functions available</div>';
            return;
        }
        
        let html = '';
        functions.forEach(func => {
            const isSelected = func.id === selectedFunctionId;
            const statusClass = getStatusClass(func.status);
            
            html += `
                <div class="function-item ${isSelected ? 'selected' : ''} ${statusClass}" 
                     data-function-id="${func.id}"
                     onclick="selectFunction('${func.id}')">
                    <div class="function-name">${func.name}</div>
                    <div class="function-info">
                        <span class="function-runtime">${func.runtime}</span>
                        <span class="function-status">${func.status}</span>
                    </div>
                </div>
            `;
        });
        
        functionsList.innerHTML = html;
    }
    
    // Get status CSS class based on function status
    function getStatusClass(status) {
        switch (status) {
            case 'ACTIVE':
                return 'status-active';
            case 'DEPLOYING':
                return 'status-deploying';
            case 'FAILED':
                return 'status-failed';
            default:
                return '';
        }
    }
    
    // Select a function
    window.selectFunction = function(functionId) {
        console.log(`Function selected: ${functionId}`);
        selectedFunctionId = functionId;
        
        // Update UI to show selection
        const items = document.querySelectorAll('.function-item');
        items.forEach(item => {
            if (item.dataset.functionId === functionId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Load function details
        window.CloudFunctionsService.fetchFunctionDetails(functionId, renderFunctionDetails);
        
        // Load function logs
        window.CloudFunctionsService.fetchFunctionLogs(functionId, renderFunctionLogs);
        
        // Start polling for this function's details
        if (pollingInterval) {
            window.CloudFunctionsService.stopPolling(pollingInterval);
        }
        
        pollingInterval = window.CloudFunctionsService.startPolling(functionId, renderFunctionDetails);
    };
    
    // Render function details
    function renderFunctionDetails(data) {
        if (!data || !functionDetails) return;
        
        let html = `
            <div class="details-header">
                <h3>${data.name}</h3>
                <span class="status ${getStatusClass(data.status)}">${data.status}</span>
            </div>
            <div class="details-content">
                <div class="detail-item">
                    <div class="detail-label">Region:</div>
                    <div class="detail-value">${data.region}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Runtime:</div>
                    <div class="detail-value">${data.runtime}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Memory:</div>
                    <div class="detail-value">${data.memory}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Trigger:</div>
                    <div class="detail-value">${data.httpsTrigger ? 'HTTPS' : 'Event'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Last Deployed:</div>
                    <div class="detail-value">${new Date(data.lastDeployed).toLocaleString()}</div>
                </div>
            </div>
            <div class="metrics-header">Metrics</div>
            <div class="metrics-content">
                <div class="metric-item">
                    <div class="metric-label">Total Invocations:</div>
                    <div class="metric-value">${data.metrics.totalInvocations}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Avg. Execution Time:</div>
                    <div class="metric-value">${data.metrics.averageExecutionTime}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Error Rate:</div>
                    <div class="metric-value">${data.metrics.errorRate}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Memory Usage:</div>
                    <div class="metric-value">${data.metrics.memoryUsage}</div>
                </div>
            </div>
        `;
        
        functionDetails.innerHTML = html;
        
        // Draw performance chart if we have canvas and data
        if (performanceCtx && data.metrics.invocations) {
            drawPerformanceChart(data.metrics.invocations);
        }
    }
    
    // Render function logs
    function renderFunctionLogs(logs) {
        if (!logs || !functionLogs) return;
        
        if (logs.length === 0) {
            functionLogs.innerHTML = '<div class="empty-state">No logs available</div>';
            return;
        }
        
        let html = '<div class="logs-list">';
        logs.forEach(log => {
            const severityClass = `severity-${log.severity.toLowerCase()}`;
            
            html += `
                <div class="log-item ${severityClass}">
                    <div class="log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div class="log-severity">${log.severity}</div>
                    <div class="log-message">${log.message}</div>
                </div>
            `;
        });
        html += '</div>';
        
        functionLogs.innerHTML = html;
    }
    
    // Draw performance chart
    function drawPerformanceChart(invocations) {
        if (!performanceCtx) return;
        
        // Get canvas dimensions
        const width = performanceCanvas.width;
        const height = performanceCanvas.height;
        
        // Clear canvas
        performanceCtx.clearRect(0, 0, width, height);
        
        // Draw background
        performanceCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        performanceCtx.fillRect(0, 0, width, height);
        
        // Prepare data for chart
        const dataCount = invocations.length;
        const maxCount = Math.max(...invocations.map(i => i.count));
        const barWidth = (width - 40) / dataCount;
        const barMaxHeight = height - 40;
        
        // Draw bars
        performanceCtx.fillStyle = 'rgba(66, 133, 244, 0.7)';
        
        invocations.forEach((dataPoint, index) => {
            const barHeight = (dataPoint.count / maxCount) * barMaxHeight;
            const barX = 20 + index * barWidth;
            const barY = height - 20 - barHeight;
            
            performanceCtx.fillRect(barX, barY, barWidth - 2, barHeight);
        });
        
        // Add title
        performanceCtx.fillStyle = 'white';
        performanceCtx.font = '12px Arial';
        performanceCtx.textAlign = 'center';
        performanceCtx.fillText('Invocations (Last 24 Hours)', width / 2, 15);
    }
    
    // Resize canvas on window resize
    function resizeCanvas() {
        if (!performanceCanvas) return;
        
        performanceCanvas.width = performanceCanvas.offsetWidth;
        performanceCanvas.height = performanceCanvas.offsetHeight;
        
        // Redraw if we have a selected function
        if (selectedFunctionId) {
            window.CloudFunctionsService.fetchFunctionDetails(selectedFunctionId, renderFunctionDetails);
        }
    }
    
    // Initialize controller
    init();
});
```

### Basic Test Templates

```javascript
// test/unit/routes/api/cloudfunctions.test.js
const request = require('supertest');
const express = require('express');
const cloudFunctionsRoutes = require('../../../../server/routes/api/cloudfunctions');

// Mock the cloud-functions-service module
jest.mock('../../../../server/utils/cloudfunctions/function-service', () => ({
  getFunctions: jest.fn(),
  getFunctionDetails: jest.fn(),
  getFunctionLogs: jest.fn(),
  createFunction: jest.fn(),
  deleteFunction: jest.fn()
}));

describe('Cloud Functions API Routes', () => {
  let app;
  
  beforeEach(() => {
    // Create a fresh Express app and mount our routes for each test
    app = express();
    app.use('/', cloudFunctionsRoutes);
    
    // Reset and setup mocks
    const cloudFunctionsService = require('../../../../server/utils/cloudfunctions/function-service');
    
    cloudFunctionsService.getFunctions.mockResolvedValue([
      { id: 'function-1', name: 'Test Function 1', status: 'ACTIVE' },
      { id: 'function-2', name: 'Test Function 2', status: 'DEPLOYING' }
    ]);
    
    cloudFunctionsService.getFunctionDetails.mockResolvedValue({
      id: 'function-1',
      name: 'Test Function 1',
      status: 'ACTIVE',
      metrics: {
        totalInvocations: 100,
        averageExecutionTime: '200ms'
      }
    });
    
    cloudFunctionsService.getFunctionLogs.mockResolvedValue([
      { timestamp: '2023-01-01T00:00:00Z', severity: 'INFO', message: 'Test log 1' }
    ]);
  });
  
  describe('GET /list', () => {
    it('should return a list of functions', async () => {
      const response = await request(app).get('/list');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id', 'function-1');
    });
  });
  
  describe('GET /:functionId', () => {
    it('should return function details', async () => {
      const response = await request(app).get('/function-1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'function-1');
      expect(response.body).toHaveProperty('metrics');
    });
  });
});
```
