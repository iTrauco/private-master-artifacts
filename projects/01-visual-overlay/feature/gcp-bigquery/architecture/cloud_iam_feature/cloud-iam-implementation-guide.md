# Cloud IAM Feature Implementation Guide

## 1. File Structure

Create these files:

```
public/
├── css/
│   └── cloudiam/
│       ├── base.css
│       ├── panels.css
│       └── controls.css
├── js/
│   └── cloudiam/
│       ├── controllers/
│       │   └── cloudiam-controller.js
│       ├── services/
│       │   └── cloudiam-service.js
│       └── utils/
│           └── chart-utils.js
├── pages/
│   └── cloudiam/
│       └── index.html
server/
├── routes/
│   ├── api/
│   │   └── cloudiam.js
│   └── pages.js (modify)
└── utils/
    └── cloudiam/
        └── iam-service.js
test/
└── unit/
    ├── routes/
    │   └── api/
    │       └── cloudiam.test.js
    └── utils/
        └── cloudiam/
            └── iam-service.test.js
```

## 2. Backend Implementation

### 2.1 Create Server Route (`server/routes/api/cloudiam.js`)

Create a new Express router for Cloud IAM API endpoints:
- GET `/api/cloudiam/roles` - Get all roles
- GET `/api/cloudiam/roles/:roleId` - Get role details
- GET `/api/cloudiam/permissions` - Get all permissions
- POST `/api/cloudiam/roles` - Create new role
- DELETE `/api/cloudiam/roles/:roleId` - Delete custom role

### 2.2 Create Mock Service (`server/utils/cloudiam/iam-service.js`)

Implement a mock service with:
- `getRoles()` - Returns list of roles
- `getRoleDetails(roleId)` - Returns detailed information for a role
- `getPermissions()` - Returns list of all permissions
- `createRole(config)` - Simulates role creation
- `deleteRole(roleId)` - Simulates role deletion

### 2.3 Update Page Routes (`server/routes/pages.js`)

Add the Cloud IAM route to the existing page routes.

## 3. Frontend Implementation

### 3.1 Create HTML Page (`public/pages/cloudiam/index.html`)

Structure with:
- Navigation bar (same as other pages)
- IAM dashboard panel with key metrics
- Roles list panel
- Role details panel
- Permissions panel
- Management panel with action buttons
- Control buttons for panel visibility

### 3.2 Create CSS Files

Create styles matching the existing appearance:
- `base.css` - Main layout and panel positioning
- `panels.css` - Panel styling, list items, tables
- `controls.css` - Buttons and controls styling

### 3.3 Create Frontend Service (`public/js/cloudiam/services/cloudiam-service.js`)

Implement a service with:
- `fetchRoles()` - Get all roles
- `fetchRoleDetails(roleId)` - Get role details
- `fetchPermissions()` - Get all permissions
- `createRole(config)` - Create new role
- `deleteRole(roleId)` - Delete role
- `startPolling(callback, interval)` - Poll for updates
- `stopPolling(intervalId)` - Stop polling

### 3.4 Create Controller (`public/js/cloudiam/controllers/cloudiam-controller.js`)

Implement a controller with:
- `init()` - Initialize controller
- `setupEventListeners()` - Set up UI event handlers
- `loadIamDashboard()` - Load and render IAM metrics dashboard
- `loadRoles()` - Load and render roles list
- `renderRoles(roles)` - Render roles in the list
- `renderRoleDetails(details)` - Render role details
- `renderPermissions(permissions)` - Render permissions list
- `renderIamDashboard(metrics)` - Render IAM dashboard metrics
- `handleRoleSelection(roleId)` - Handle role selection
- `handleCreateRole()` - Handle role creation
- `handleDeleteRole()` - Handle role deletion
- Panel visibility toggle handlers

### 3.5 Create Chart Utilities (`public/js/cloudiam/utils/chart-utils.js`)

Implement utilities for:
- `drawRoleTypesChart(data, canvas)` - Draw role types distribution chart
- `drawPermissionsChart(data, canvas)` - Draw permissions usage chart
- `drawActivityChart(data, canvas)` - Draw IAM activity timeline chart

## 4. Testing Implementation

### 4.1 Create API Route Tests (`test/unit/routes/api/cloudiam.test.js`)

Create tests for:
- GET `/api/cloudiam/roles`
- GET `/api/cloudiam/roles/:roleId`
- GET `/api/cloudiam/permissions`
- POST `/api/cloudiam/roles`
- DELETE `/api/cloudiam/roles/:roleId`

### 4.2 Create Service Tests (`test/unit/utils/cloudiam/iam-service.test.js`)

Create tests for:
- `getRoles()`
- `getRoleDetails(roleId)`
- `getPermissions()`
- `createRole(config)`
- `deleteRole(roleId)`

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
  <title>Cloud IAM - OBS Hardware Overlay</title>
  
  <!-- Base styles -->
  <link rel="stylesheet" href="../../css/base/reset.css">
  <link rel="stylesheet" href="../../css/base/global.css">
  
  <!-- Navigation styles -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
  <link rel="stylesheet" href="../../css/navigation/controls.css">
  
  <!-- Cloud IAM styles -->
  <link rel="stylesheet" href="../../css/cloudiam/base.css">
  <link rel="stylesheet" href="../../css/cloudiam/panels.css">
  <link rel="stylesheet" href="../../css/cloudiam/controls.css">
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
      <li><a href="#" onclick="navigateTo('/cloudstorage')">Cloud Storage</a></li>
      <li><a href="#" class="active" onclick="navigateTo('/cloudiam')">Cloud IAM</a></li>
      <li><a href="#" onclick="navigateTo('/settings')">Settings</a></li>
    </ul>
  </nav>
  
  <div class="container">
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
    
    <!-- IAM Dashboard Panel -->
    <div id="iam-dashboard-panel" class="iam-panel iam-dashboard-panel">
      <div class="panel-title">IAM Dashboard</div>
      <div class="metrics-container">
        <div class="metric-card">
          <div class="metric-title">Total Roles</div>
          <div class="metric-value" id="total-roles">Loading...</div>
          <div class="metric-trend positive">↑ 5%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Custom Roles</div>
          <div class="metric-value" id="custom-roles">Loading...</div>
          <div class="metric-trend positive">↑ 12%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Permissions</div>
          <div class="metric-value" id="total-permissions">Loading...</div>
          <div class="metric-trend neutral">- 0%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Security Score</div>
          <div class="metric-value" id="security-score">Loading...</div>
          <div class="metric-trend negative">↓ 3%</div>
        </div>
      </div>
      <canvas id="role-types-canvas"></canvas>
    </div>

    <!-- Roles List Panel -->
    <div id="iam-roles-panel" class="iam-panel iam-roles-panel">
      <div class="panel-title">Roles</div>
      <div id="roles-list" class="list-container">
        <div class="empty-state">No roles loaded</div>
      </div>
      <div class="panel-actions">
        <button id="load-roles-btn" class="action-button">Load Roles</button>
        <button id="create-role-btn" class="action-button">Create Role</button>
      </div>
    </div>

    <!-- Role Details Panel -->
    <div id="iam-details-panel" class="iam-panel iam-details-panel">
      <div class="panel-title">Role Details</div>
      <div id="role-details" class="details-container">
        <div class="empty-state">Select a role to view details</div>
      </div>
      <div class="panel-actions" id="role-actions" style="display: none;">
        <button id="delete-role-btn" class="action-button danger-button" disabled>Delete Role</button>
      </div>
    </div>

    <!-- Permissions Panel -->
    <div id="iam-permissions-panel" class="iam-panel iam-permissions-panel">
      <div class="panel-title">Permissions</div>
      <div id="permissions-list" class="permissions-container">
        <div class="empty-state">Loading permissions...</div>
      </div>
      <div class="permissions-filter">
        <input type="text" id="permissions-filter" placeholder="Filter permissions..." class="filter-input">
      </div>
    </div>
    
    <!-- Activity Panel -->
    <div id="iam-activity-panel" class="iam-panel iam-activity-panel">
      <div class="panel-title">Recent Activity</div>
      <canvas id="activity-canvas"></canvas>
    </div>
  </div>

  <!-- Create Role Modal -->
  <div id="create-role-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>Create Custom Role</h2>
      <form id="create-role-form">
        <div class="form-group">
          <label for="role-title">Role Title:</label>
          <input type="text" id="role-title" name="title" required>
        </div>
        <div class="form-group">
          <label for="role-id">Role ID:</label>
          <input type="text" id="role-id" name="roleId" required>
        </div>
        <div class="form-group">
          <label for="role-description">Description:</label>
          <textarea id="role-description" name="description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Permissions:</label>
          <div class="permissions-select-container">
            <div id="available-permissions" class="permissions-select">
              <div class="permissions-select-title">Available Permissions</div>
              <div class="permissions-select-list" id="available-permissions-list"></div>
            </div>
            <div class="permissions-select-actions">
              <button type="button" id="add-permission" class="action-button">&rarr;</button>
              <button type="button" id="remove-permission" class="action-button">&larr;</button>
            </div>
            <div id="selected-permissions" class="permissions-select">
              <div class="permissions-select-title">Selected Permissions</div>
              <div class="permissions-select-list" id="selected-permissions-list"></div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="role-stage">Stage:</label>
          <select id="role-stage" name="stage">
            <option value="ALPHA">Alpha</option>
            <option value="BETA">Beta</option>
            <option value="GA" selected>General Availability</option>
          </select>
        </div>
        <button type="submit" class="action-button">Create Role</button>
      </form>
    </div>
  </div>

  <!-- Hardware Controls Bar -->
  <div class="hardware-controls">
    <button id="show-all-btn">Show All</button>
    <button id="hide-all-btn">Hide All</button>
    <button id="show-dashboard-btn">Dashboard</button>
    <button id="show-roles-btn">Roles</button>
    <button id="show-details-btn">Details</button>
    <button id="show-permissions-btn">Permissions</button>
    <button id="toggle-controls-btn">≡</button>
  </div>
  <div id="show-controls-btn" style="display: none;">≡</div>

  <!-- Core Scripts -->
  <script src="../../js/navigation.js"></script>
  
  <!-- Cloud IAM Scripts -->
  <script src="../../js/cloudiam/services/cloudiam-service.js"></script>
  <script src="../../js/cloudiam/utils/chart-utils.js"></script>
  <script src="../../js/cloudiam/controllers/cloudiam-controller.js"></script>
</body>
</html>
```

### API Route Template
```javascript
// server/routes/api/cloudiam.js
const express = require('express');
const router = express.Router();
const cloudIamService = require('../../utils/cloudiam/iam-service');

// Get all roles
router.get('/roles', async (req, res) => {
    try {
        const roles = await cloudIamService.getRoles();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching IAM roles:', error);
        res.status(500).json({ error: 'Failed to fetch IAM roles' });
    }
});

// Get role details
router.get('/roles/:roleId', async (req, res) => {
    try {
        const details = await cloudIamService.getRoleDetails(req.params.roleId);
        res.json(details);
    } catch (error) {
        console.error(`Error fetching role details for ${req.params.roleId}:`, error);
        res.status(500).json({ error: 'Failed to fetch role details' });
    }
});

// Get all permissions
router.get('/permissions', async (req, res) => {
    try {
        const permissions = await cloudIamService.getPermissions();
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching IAM permissions:', error);
        res.status(500).json({ error: 'Failed to fetch IAM permissions' });
    }
});

// Get IAM dashboard metrics
router.get('/dashboard', async (req, res) => {
    try {
        const metrics = await cloudIamService.getDashboardMetrics();
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching IAM dashboard metrics:', error);
        res.status(500).json({ error: 'Failed to fetch IAM dashboard metrics' });
    }
});

// Create new role
router.post('/roles', async (req, res) => {
    try {
        const newRole = await cloudIamService.createRole(req.body);
        res.status(201).json(newRole);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
});

// Delete role
router.delete('/roles/:roleId', async (req, res) => {
    try {
        await cloudIamService.deleteRole(req.params.roleId);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting role ${req.params.roleId}:`, error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

module.exports = router;
```

### Mock Service Template
```javascript
// server/utils/cloudiam/iam-service.js
/**
 * Cloud IAM Service Utility
 * Handles integration with the Google Cloud IAM API
 */

// Role prefixes
const PREDEFINED_ROLE_PREFIX = 'roles/';
const CUSTOM_ROLE_PREFIX = 'projects/example-project/roles/';

// Stage options
const stages = ['ALPHA', 'BETA', 'GA', 'DEPRECATED', 'DISABLED'];

// Generate a random role
function generateMockRole(id, isCustom = false) {
    const prefix = isCustom ? CUSTOM_ROLE_PREFIX : PREDEFINED_ROLE_PREFIX;
    const roleId = id || `${isCustom ? 'custom' : ''}role-${Math.floor(Math.random() * 1000)}`;
    const fullRoleId = `${prefix}${roleId}`;
    
    // Generate random number of permissions (5-30)
    const permCount = Math.floor(Math.random() * 26) + 5;
    const permissions = [];
    
    for (let i = 0; i < permCount; i++) {
        permissions.push(`${getRandomService()}.${getRandomResource()}.${getRandomAction()}`);
    }
    
    return {
        id: roleId,
        name: fullRoleId,
        title: `${isCustom ? 'Custom ' : ''}${capitalizeFirstLetter(roleId.replace(/[-_]/g, ' '))}`,
        description: `${isCustom ? 'Custom role' : 'Predefined role'} for ${getRandomService()} operations`,
        permissions,
        stage: isCustom ? getRandomStage() : 'GA',
        etag: generateEtag(),
        isCustom,
        createTime: isCustom ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : null,
        updateTime: isCustom ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        deleted: false
    };
}

// Generate random ETag
function generateEtag() {
    return `"${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}"`;
}

// Get random service name
function getRandomService() {
    const services = [
        'compute', 'storage', 'bigquery', 'iam', 'pubsub', 'cloudfunctions', 
        'cloudrun', 'servicemanagement', 'monitoring', 'logging'
    ];
    return services[Math.floor(Math.random() * services.length)];
}

// Get random resource name
function getRandomResource() {
    const resources = [
        'instances', 'disks', 'images', 'firewalls', 'buckets', 'objects',
        'datasets', 'tables', 'jobs', 'roles', 'subscriptions', 'topics',
        'functions', 'services', 'metrics', 'logs', 'zones', 'folders'
    ];
    return resources[Math.floor(Math.random() * resources.length)];
}

// Get random action
function getRandomAction() {
    const actions = [
        'get', 'list', 'create', 'delete', 'update', 'set', 'use', 
        'modify', 'write', 'read', 'view', 'start', 'stop', 'reset'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
}

// Get random stage
function getRandomStage() {
    return stages[Math.floor(Math.random() * 3)]; // Mostly return ALPHA, BETA, or GA
}

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Generate permission categories
function generatePermissionCategories() {
    const categories = [
        'Storage', 'Compute', 'BigQuery', 'IAM', 'Networking', 
        'Monitoring', 'Logging', 'Cloud Functions', 'Cloud Run', 'Security'
    ];
    
    return categories.map(category => {
        // Generate 10-30 permissions per category
        const count = Math.floor(Math.random() * 21) + 10;
        const permissions = [];
        
        const service = category.toLowerCase().replace(' ', '');
        
        for (let i = 0; i < count; i++) {
            permissions.push({
                id: `${service}.${getRandomResource()}.${getRandomAction()}`,
                title: `${category} ${getRandomResource()} ${getRandomAction()}`,
                description: `Allows ${getRandomAction()} operations on ${getRandomResource()} in ${category}`,
                stage: 'GA'
            });
        }
        
        return {
            name: category,
            permissions
        };
    });
}

// Generate fake metrics for the dashboard
function generateDashboardMetrics() {
    const totalRoles = Math.floor(Math.random() * 50) + 100; // 100-150 roles
    const customRoles = Math.floor(Math.random() * 30) + 20; // 20-50 custom roles
    const predefinedRoles = totalRoles - customRoles;
    
    const totalPermissions = Math.floor(Math.random() * 500) + 1000; // 1000-1500 permissions
    const securityScore = Math.floor(Math.random() * 30) + 70; // 70-100 security score
    
    // Role type distribution
    const roleTypes = [
        { type: 'Admin', count: Math.floor(Math.random() * 10) + 10 }, // 10-20
        { type: 'Editor', count: Math.floor(Math.random() * 20) + 30 }, // 30-50
        { type: 'Viewer', count: Math.floor(Math.random() * 20) + 30 }, // 30-50
        { type: 'Custom', count: customRoles }
    ];
    
    // Calculate percentage for each role type
    const totalCount = roleTypes.reduce((sum, type) => sum + type.count, 0);
    roleTypes.forEach(type => {
        type.percentage = Math.round((type.count / totalCount) * 100);
    });
    
    // Recent activity
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    const activityData = [];
    for (let i = 30; i >= 0; i--) {
        activityData.push({
            date: new Date(now - i * day).toISOString().split('T')[0],
            roleCreations: Math.floor(Math.random() * 3),
            roleDeletions: Math.floor(Math.random() * 2),
            policyChanges: Math.floor(Math.random() * 5) + 1
        });
    }
    
    return {
        totalRoles,
        customRoles,
        predefinedRoles,
        totalPermissions,
        securityScore,
        roleTypes,
        activityData
    };
}

// Mock implementation
const cloudIamService = {
    /**
     * Get list of IAM roles
     * @returns {Promise<Array>} List of roles
     */
    getRoles: async function() {
        console.log('Getting IAM roles (mock)');
        
        // Generate 100-150 roles, with 20-50 custom roles
        const customRoleCount = Math.floor(Math.random() * 31) + 20; // 20-50
        const predefinedRoleCount = Math.floor(Math.random() * 51) + 70; // 70-120
        
        const customRoles = Array.from({ length: customRoleCount }, () => generateMockRole(null, true));
        const predefinedRoles = Array.from({ length: predefinedRoleCount }, () => generateMockRole());
        
        const roles = [...customRoles, ...predefinedRoles];
        
        return roles;
    },
    
    /**
     * Get details for a specific IAM role
     * @param {string} roleId - Role ID
     * @returns {Promise<Object>} Role details
     */
    getRoleDetails: async function(roleId) {
        console.log(`Getting details for role: ${roleId} (mock)`);
        
        // Check if it's a custom role (starts with projects/)
        const isCustom = roleId.includes('/roles/') || roleId.startsWith('custom');
        
        // Generate role details
        const roleDetails = generateMockRole(roleId, isCustom);
        
        return roleDetails;
    },
    
    /**
     * Get all IAM permissions
     * @returns {Promise<Array>} List of permissions grouped by category
     */
    getPermissions: async function() {
        console.log('Getting IAM permissions (mock)');
        
        // Generate permissions grouped by category
        const permissionCategories = generatePermissionCategories();
        
        return permissionCategories;
    },
    
    /**
     * Get dashboard metrics
     * @returns {Promise<Object>} Dashboard metrics
     */
    getDashboardMetrics: async function() {
        console.log('Getting IAM dashboard metrics (mock)');
        
        // Generate dashboard metrics
        const metrics = generateDashboardMetrics();
        
        return metrics;
    },
    
    /**
     * Create a new IAM role
     * @param {Object} config - Role configuration
     * @returns {Promise<Object>} Newly created role
     */
    createRole: async function(config) {
        console.log(`Creating new role with config:`, config);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create the new role
        const newRole = {
            id: config.roleId,
            name: `${CUSTOM_ROLE_PREFIX}${config.roleId}`,
            title: config.title,
            description: config.description || `Custom role ${config.title}`,
            permissions: config.permissions || [],
            stage: config.stage || 'GA',
            etag: generateEtag(),
            isCustom: true,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            deleted: false
        };
        
        return newRole;
    },
    
    /**
     * Delete an IAM role
     * @param {string} roleId - Role ID to delete
     * @returns {Promise<void>}
     */
    deleteRole: async function(roleId) {
        console.log(`Deleting role: ${roleId} (mock)`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Nothing to return, just simulate success
        return;
    }
};

module.exports = cloudIamService;
```

### Frontend Service Template
```javascript
/**
 * Cloud IAM Service Module
 * Handles fetching Cloud IAM data from the API
 */

// Create a global CloudIamService object
window.CloudIamService = {
    // Fetch available IAM roles
    fetchRoles: function(callback) {
        console.log('Fetching IAM roles');
        fetch('/api/cloudiam/roles')
            .then(response => response.json())
            .then(data => {
                console.log('Roles fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error fetching IAM roles:', error);
                callback(null);
            });
    },
    
    // Fetch details for a specific role
    fetchRoleDetails: function(roleId, callback) {
        console.log(`Fetching details for role: ${roleId}`);
        fetch(`/api/cloudiam/roles/${roleId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Role details fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error(`Error fetching details for role ${roleId}:`, error);
                callback(null);
            });
    },
    
    // Fetch all IAM permissions
    fetchPermissions: function(callback) {
        console.log('Fetching IAM permissions');
        fetch('/api/cloudiam/permissions')
            .then(response => response.json())
            .then(data => {
                console.log('Permissions fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error fetching IAM permissions:', error);
                callback(null);
            });
    },
    
    // Fetch IAM dashboard metrics
    fetchDashboardMetrics: function(callback) {
        console.log('Fetching IAM dashboard metrics');
        fetch('/api/cloudiam/dashboard')
            .then(response => response.json())
            .then(data => {
                console.log('Dashboard metrics fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error fetching IAM dashboard metrics:', error);
                callback(null);
            });
    },
    
    // Create a new role
    createRole: function(config, callback) {
        console.log('Creating new role:', config);
        fetch('/api/cloudiam/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Role created:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error creating role:', error);
                callback(null);
            });
    },
    
    // Delete a role
    deleteRole: function(roleId, callback) {
        console.log(`Deleting role: ${roleId}`);
        fetch(`/api/cloudiam/roles/${roleId}`, {
            method: 'DELETE'
        })
            .then(response => {
                console.log(`Role ${roleId} deleted`);
                callback(true);
            })
            .catch(error => {
                console.error(`Error deleting role ${roleId}:`, error);
                callback(false);
            });
    },
    
    // Start polling for updates
    startPolling: function(callback, interval = 30000) {
        // Initial fetch
        this.fetchDashboardMetrics(callback);
        
        // Set up interval for continuous updates
        this.pollingInterval = setInterval(() => {
            this.fetchDashboardMetrics(callback);
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
 * Cloud IAM Controller Module
 * Handles UI interactions for Cloud IAM monitoring
 */

// Main controller
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cloud IAM controller initializing');
    
    // DOM elements
    const dashboardPanel = document.getElementById('iam-dashboard-panel');
    const rolesPanel = document.getElementById('iam-roles-panel');
    const detailsPanel = document.getElementById('iam-details-panel');
    const permissionsPanel = document.getElementById('iam-permissions-panel');
    const activityPanel = document.getElementById('iam-activity-panel');
    
    const rolesList = document.getElementById('roles-list');
    const roleDetails = document.getElementById('role-details');
    const permissionsList = document.getElementById('permissions-list');
    const roleActions = document.getElementById('role-actions');
    const deleteRoleBtn = document.getElementById('delete-role-btn');
    const loadRolesBtn = document.getElementById('load-roles-btn');
    const createRoleBtn = document.getElementById('create-role-btn');
    const permissionsFilter = document.getElementById('permissions-filter');
    
    // Metric elements
    const totalRolesElement = document.getElementById('total-roles');
    const customRolesElement = document.getElementById('custom-roles');
    const totalPermissionsElement = document.getElementById('total-permissions');
    const securityScoreElement = document.getElementById('security-score');
    
    // Canvas for charts
    const roleTypesCanvas = document.getElementById('role-types-canvas');
    const activityCanvas = document.getElementById('activity-canvas');
    let roleTypesCtx = null;
    let activityCtx = null;
    
    if (roleTypesCanvas) {
        roleTypesCtx = roleTypesCanvas.getContext('2d');
        roleTypesCanvas.width = roleTypesCanvas.offsetWidth;
        roleTypesCanvas.height = roleTypesCanvas.offsetHeight;
    }
    
    if (activityCanvas) {
        activityCtx = activityCanvas.getContext('2d');
        activityCanvas.width = activityCanvas.offsetWidth;
        activityCanvas.height = activityCanvas.offsetHeight;
    }
    
    // Modal elements
    const createRoleModal = document.getElementById('create-role-modal');
    const createRoleForm = document.getElementById('create-role-form');
    const availablePermissionsList = document.getElementById('available-permissions-list');
    const selectedPermissionsList = document.getElementById('selected-permissions-list');
    const addPermissionBtn = document.getElementById('add-permission');
    const removePermissionBtn = document.getElementById('remove-permission');
    
    // State
    let selectedRoleId = null;
    let allPermissions = [];
    let filteredPermissions = [];
    let selectedPermissions = [];
    let pollingInterval = null;
    
    // Initialize controller
    function init() {
        setupEventListeners();
        window.addEventListener('resize', resizeCanvases);
        
        // Load initial data
        loadIamDashboard();
        loadPermissions();
        
        // Start polling for dashboard updates
        pollingInterval = window.CloudIamService.startPolling(renderIamDashboard);
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Roles loading
        if (loadRolesBtn) {
            loadRolesBtn.addEventListener('click', loadRoles);
        }
        
        // Create role
        if (createRoleBtn) {
            createRoleBtn.addEventListener('click', showCreateRoleModal);
        }
        
        // Delete role
        if (deleteRoleBtn) {
            deleteRoleBtn.addEventListener('click', confirmDeleteRole);
        }
        
        // Create role form
        if (createRoleForm) {
            createRoleForm.addEventListener('submit', handleCreateRole);
        }
        
        // Permission select controls
        if (addPermissionBtn) {
            addPermissionBtn.addEventListener('click', addSelectedPermission);
        }
        
        if (removePermissionBtn) {
            removePermissionBtn.addEventListener('click', removeSelectedPermission);
        }
        
        // Permission filter
        if (permissionsFilter) {
            permissionsFilter.addEventListener('input', filterPermissions);
        }
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                createRoleModal.style.display = 'none';
            });
        });
        
        // Control panel buttons
        document.querySelector('#show-all-btn').addEventListener('click', () => {
            dashboardPanel.style.display = 'block';
            rolesPanel.style.display = 'block';
            detailsPanel.style.display = 'block';
            permissionsPanel.style.display = 'block';
            activityPanel.style.display = 'block';
        });
        
        document.querySelector('#hide-all-btn').addEventListener('click', () => {
            dashboardPanel.style.display = 'none';
            rolesPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            permissionsPanel.style.display = 'none';
            activityPanel.style.display = 'none';
        });
        
        document.querySelector('#show-dashboard-btn').addEventListener('click', () => {
            dashboardPanel.style.display = 'block';
            rolesPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            permissionsPanel.style.display = 'none';
            activityPanel.style.display = 'block';
        });
        
        document.querySelector('#show-roles-btn').addEventListener('click', () => {
            dashboardPanel.style.display = 'none';
            rolesPanel.style.display = 'block';
            detailsPanel.style.display = 'block';
            permissionsPanel.style.display = 'none';
            activityPanel.style.display = 'none';
        });
        
        document.querySelector('#show-details-btn').addEventListener('click', () => {
            dashboardPanel.style.display = 'none';
            rolesPanel.style.display = 'none';
            detailsPanel.style.display = 'block';
            permissionsPanel.style.display = 'none';
            activityPanel.style.display = 'none';
        });
        
        document.querySelector('#show-permissions-btn').addEventListener('click', () => {
            dashboardPanel.style.display = 'none';
            rolesPanel.style.display = 'none';
            detailsPanel.style.display = 'none';
            permissionsPanel.style.display = 'block';
            activityPanel.style.display = 'none';
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
    
    // Load IAM dashboard
    function loadIamDashboard() {
        window.CloudIamService.fetchDashboardMetrics(renderIamDashboard);
    }
    
    // Load roles
    function loadRoles() {
        if (loadRolesBtn) {
            loadRolesBtn.disabled = true;
            loadRolesBtn.textContent = 'Loading...';
        }
        
        window.CloudIamService.fetchRoles(renderRoles);
    }
    
    // Load permissions
    function loadPermissions() {
        window.CloudIamService.fetchPermissions(renderPermissions);
    }
    
    // Render IAM dashboard
    function renderIamDashboard(metrics) {
        if (!metrics) return;
        
        // Update metric values
        if (totalRolesElement) {
            totalRolesElement.textContent = metrics.totalRoles;
        }
        
        if (customRolesElement) {
            customRolesElement.textContent = metrics.customRoles;
        }
        
        if (totalPermissionsElement) {
            totalPermissionsElement.textContent = metrics.totalPermissions;
        }
        
        if (securityScoreElement) {
            securityScoreElement.textContent = `${metrics.securityScore}/100`;
        }
        
        // Draw role types chart
        if (roleTypesCtx && metrics.roleTypes) {
            window.CloudIamCharts.drawRoleTypesChart(metrics.roleTypes, roleTypesCanvas);
        }
        
        // Draw activity chart
        if (activityCtx && metrics.activityData) {
            window.CloudIamCharts.drawActivityChart(metrics.activityData, activityCanvas);
        }
    }
    
    // Render roles list
    function renderRoles(roles) {
        if (loadRolesBtn) {
            loadRolesBtn.disabled = false;
            loadRolesBtn.textContent = 'Refresh Roles';
        }
        
        if (!roles || !rolesList) return;
        
        if (roles.length === 0) {
            rolesList.innerHTML = '<div class="empty-state">No roles available</div>';
            return;
        }
        
        // Sort roles by custom first, then alphabetically
        roles.sort((a, b) => {
            if (a.isCustom !== b.isCustom) {
                return a.isCustom ? -1 : 1; // Custom roles first
            }
            return a.title.localeCompare(b.title);
        });
        
        let html = '';
        roles.forEach(role => {
            const isSelected = role.id === selectedRoleId;
            const roleClass = role.isCustom ? 'custom-role' : 'predefined-role';
            
            html += `
                <div class="role-item ${isSelected ? 'selected' : ''} ${roleClass}" 
                     data-role-id="${role.id}"
                     onclick="selectRole('${role.id}')">
                    <div class="role-name">
                        <span class="role-title">${role.title}</span>
                        ${role.isCustom ? '<span class="role-custom-badge">Custom</span>' : ''}
                    </div>
                    <div class="role-info">
                        <span class="role-id">${role.name}</span>
                        <span class="role-permissions-count">${role.permissions.length} permissions</span>
                    </div>
                </div>
            `;
        });
        
        rolesList.innerHTML = html;
    }
    
    // Render role details
    function renderRoleDetails(role) {
        if (!role || !roleDetails) return;
        
        let html = `
            <div class="details-header">
                <h3>${role.title}</h3>
                ${role.isCustom ? '<span class="role-custom-badge">Custom</span>' : ''}
            </div>
            <div class="details-content">
                <div class="detail-item">
                    <div class="detail-label">ID:</div>
                    <div class="detail-value">${role.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Description:</div>
                    <div class="detail-value">${role.description}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Stage:</div>
                    <div class="detail-value">${role.stage}</div>
                </div>
        `;
        
        if (role.isCustom) {
            html += `
                <div class="detail-item">
                    <div class="detail-label">Created:</div>
                    <div class="detail-value">${new Date(role.createTime).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Updated:</div>
                    <div class="detail-value">${new Date(role.updateTime).toLocaleString()}</div>
                </div>
            `;
        }
        
        html += `
            </div>
            <div class="permissions-header">Permissions (${role.permissions.length})</div>
            <div class="permissions-list">
        `;
        
        if (role.permissions.length > 0) {
            html += '<div class="role-permissions">';
            role.permissions.forEach(permission => {
                html += `<div class="permission-item">${permission}</div>`;
            });
            html += '</div>';
        } else {
            html += '<div class="empty-state">No permissions found for this role</div>';
        }
        
        html += '</div>';
        
        roleDetails.innerHTML = html;
        
        // Show/hide role actions based on whether it's a custom role
        if (roleActions) {
            roleActions.style.display = role.isCustom ? 'flex' : 'none';
        }
        
        if (deleteRoleBtn) {
            deleteRoleBtn.disabled = !role.isCustom;
        }
    }
    
    // Render permissions list
    function renderPermissions(permissionCategories) {
        if (!permissionCategories || !permissionsList) return;
        
        if (permissionCategories.length === 0) {
            permissionsList.innerHTML = '<div class="empty-state">No permissions available</div>';
            return;
        }
        
        // Flatten permissions for filtering
        allPermissions = [];
        permissionCategories.forEach(category => {
            category.permissions.forEach(permission => {
                allPermissions.push({
                    ...permission,
                    category: category.name
                });
            });
        });
        
        filteredPermissions = [...allPermissions];
        
        let html = '';
        permissionCategories.forEach(category => {
            html += `
                <div class="permission-category">
                    <div class="category-header">${category.name}</div>
                    <div class="category-permissions">
            `;
            
            if (category.permissions.length > 0) {
                category.permissions.forEach(permission => {
                    html += `
                        <div class="permission-item">
                            <div class="permission-title">${permission.title}</div>
                            <div class="permission-id">${permission.id}</div>
                            <div class="permission-description">${permission.description}</div>
                        </div>
                    `;
                });
            } else {
                html += '<div class="empty-state">No permissions in this category</div>';
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        permissionsList.innerHTML = html;
        
        // Also update available permissions in create role modal
        updateAvailablePermissions();
    }
    
    // Filter permissions based on search input
    function filterPermissions() {
        if (!permissionsFilter || !allPermissions) return;
        
        const filterText = permissionsFilter.value.toLowerCase();
        
        if (!filterText) {
            filteredPermissions = [...allPermissions];
            renderFilteredPermissions();
            return;
        }
        
        filteredPermissions = allPermissions.filter(permission => {
            return permission.id.toLowerCase().includes(filterText) ||
                permission.title.toLowerCase().includes(filterText) ||
                permission.description.toLowerCase().includes(filterText) ||
                permission.category.toLowerCase().includes(filterText);
        });
        
        renderFilteredPermissions();
    }
    
    // Render filtered permissions
    function renderFilteredPermissions() {
        if (!permissionsList || !filteredPermissions) return;
        
        if (filteredPermissions.length === 0) {
            permissionsList.innerHTML = '<div class="empty-state">No permissions match your filter</div>';
            return;
        }
        
        // Group filtered permissions by category
        const groupedPermissions = {};
        
        filteredPermissions.forEach(permission => {
            if (!groupedPermissions[permission.category]) {
                groupedPermissions[permission.category] = [];
            }
            groupedPermissions[permission.category].push(permission);
        });
        
        let html = '';
        Object.keys(groupedPermissions).forEach(category => {
            const permissions = groupedPermissions[category];
            
            html += `
                <div class="permission-category">
                    <div class="category-header">${category}</div>
                    <div class="category-permissions">
            `;
            
            permissions.forEach(permission => {
                html += `
                    <div class="permission-item">
                        <div class="permission-title">${permission.title}</div>
                        <div class="permission-id">${permission.id}</div>
                        <div class="permission-description">${permission.description}</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        permissionsList.innerHTML = html;
    }
    
    // Show create role modal
    function showCreateRoleModal() {
        if (createRoleModal) {
            createRoleModal.style.display = 'block';
            
            // Reset form
            if (createRoleForm) {
                createRoleForm.reset();
            }
            
            // Reset selected permissions
            selectedPermissions = [];
            updateSelectedPermissions();
            updateAvailablePermissions();
        }
    }
    
    // Update available permissions in create role modal
    function updateAvailablePermissions() {
        if (!availablePermissionsList || !allPermissions) return;
        
        // Filter out already selected permissions
        const selectedIds = selectedPermissions.map(p => p.id);
        const available = allPermissions.filter(p => !selectedIds.includes(p.id));
        
        let html = '';
        available.forEach(permission => {
            html += `
                <div class="modal-permission-item" data-permission-id="${permission.id}" 
                     onclick="selectAvailablePermission(this)">
                    ${permission.id}
                </div>
            `;
        });
        
        availablePermissionsList.innerHTML = html;
    }
    
    // Update selected permissions in create role modal
    function updateSelectedPermissions() {
        if (!selectedPermissionsList) return;
        
        let html = '';
        selectedPermissions.forEach(permission => {
            html += `
                <div class="modal-permission-item" data-permission-id="${permission.id}" 
                     onclick="selectSelectedPermission(this)">
                    ${permission.id}
                </div>
            `;
        });
        
        selectedPermissionsList.innerHTML = html || '<div class="empty-state">No permissions selected</div>';
    }
    
    // Select an available permission
    window.selectAvailablePermission = function(element) {
        const permissionId = element.dataset.permissionId;
        const permission = allPermissions.find(p => p.id === permissionId);
        
        if (permission) {
            // Add class to highlight
            element.classList.add('selected');
        }
    };
    
    // Select a selected permission
    window.selectSelectedPermission = function(element) {
        const permissionId = element.dataset.permissionId;
        
        // Add class to highlight
        element.classList.add('selected');
    };
    
    // Add selected permission
    function addSelectedPermission() {
        const selectedElements = availablePermissionsList.querySelectorAll('.modal-permission-item.selected');
        
        selectedElements.forEach(element => {
            const permissionId = element.dataset.permissionId;
            const permission = allPermissions.find(p => p.id === permissionId);
            
            if (permission && !selectedPermissions.find(p => p.id === permissionId)) {
                selectedPermissions.push(permission);
            }
        });
        
        updateSelectedPermissions();
        updateAvailablePermissions();
    }
    
    // Remove selected permission
    function removeSelectedPermission() {
        const selectedElements = selectedPermissionsList.querySelectorAll('.modal-permission-item.selected');
        
        selectedElements.forEach(element => {
            const permissionId = element.dataset.permissionId;
            selectedPermissions = selectedPermissions.filter(p => p.id !== permissionId);
        });
        
        updateSelectedPermissions();
        updateAvailablePermissions();
    }
    
    // Handle create role form submission
    function handleCreateRole(event) {
        event.preventDefault();
        
        const formData = new FormData(createRoleForm);
        const roleData = {
            title: formData.get('title'),
            roleId: formData.get('roleId'),
            description: formData.get('description'),
            stage: formData.get('stage'),
            permissions: selectedPermissions.map(p => p.id)
        };
        
        // Hide modal and show loading state
        createRoleModal.style.display = 'none';
        
        // Create role
        window.CloudIamService.createRole(roleData, function(newRole) {
            if (newRole) {
                // Refresh roles list
                loadRoles();
                // Refresh dashboard metrics
                loadIamDashboard();
            } else {
                alert('Failed to create role. Please try again.');
            }
        });
    }
    
    // Confirm delete role
    function confirmDeleteRole() {
        if (!selectedRoleId) return;
        
        if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            window.CloudIamService.deleteRole(selectedRoleId, function(success) {
                if (success) {
                    // Refresh roles list
                    loadRoles();
                    // Clear selection
                    selectedRoleId = null;
                    roleDetails.innerHTML = '<div class="empty-state">Select a role to view details</div>';
                    roleActions.style.display = 'none';
                    // Refresh dashboard metrics
                    loadIamDashboard();
                } else {
                    alert('Failed to delete role. Please try again.');
                }
            });
        }
    }
    
    // Select a role
    window.selectRole = function(roleId) {
        console.log(`Role selected: ${roleId}`);
        selectedRoleId = roleId;
        
        // Update UI to show selection
        const items = document.querySelectorAll('.role-item');
        items.forEach(item => {
            if (item.dataset.roleId === roleId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Load role details
        window.CloudIamService.fetchRoleDetails(roleId, renderRoleDetails);
    };
    
    // Resize canvases on window resize
    function resizeCanvases() {
        if (roleTypesCanvas) {
            roleTypesCanvas.width = roleTypesCanvas.offsetWidth;
            roleTypesCanvas.height = roleTypesCanvas.offsetHeight;
        }
        
        if (activityCanvas) {
            activityCanvas.width = activityCanvas.offsetWidth;
            activityCanvas.height = activityCanvas.offsetHeight;
        }
        
        // Redraw charts if we have data
        window.CloudIamService.fetchDashboardMetrics(renderIamDashboard);
    }
    
    // Initialize controller
    init();
});
```

### Chart Utilities Template
```javascript
/**
 * Cloud IAM Chart Utilities
 * Provides utility functions for drawing Cloud IAM charts
 */

// Draw role types distribution chart (pie chart)
function drawRoleTypesChart(data, canvas) {
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
        'rgba(52, 152, 219, 0.8)', // Blue - Admin
        'rgba(46, 204, 113, 0.8)', // Green - Editor
        'rgba(155, 89, 182, 0.8)', // Purple - Viewer
        'rgba(241, 196, 15, 0.8)'  // Yellow - Custom
    ];
    
    // Draw pie chart
    let startAngle = 0;
    data.forEach((item, index) => {
        const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Add label if slice is big enough
        if (item.percentage > 5) {
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${item.percentage}%`, labelX, labelY);
        }
        
        startAngle += sliceAngle;
    });
    
    // Add chart title
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Role Types Distribution', centerX, 10);
    
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

// Draw activity chart (line chart for role changes over time)
function drawActivityChart(data, canvas) {
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
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Get max value for scaling
    const maxValue = Math.max(
        ...data.map(d => Math.max(d.roleCreations, d.roleDeletions, d.policyChanges))
    );
    
    // Scale for a better visualization (min 5 for y-axis)
    const yScale = chartHeight / Math.max(maxValue, 5);
    const xScale = chartWidth / (data.length - 1);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    
    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (chartHeight / 5) * i;
        
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Add y-axis labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(maxValue / 5 * i), padding - 5, y);
    }
    
    // Vertical grid lines (only draw a few to avoid crowding)
    const step = Math.max(1, Math.floor(data.length / 10));
    for (let i = 0; i < data.length; i += step) {
        const x = padding + i * xScale;
        
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
        
        // Add x-axis labels (dates) for a few points
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Format date as MM/DD
        const date = new Date(data[i].date);
        const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
        
        ctx.fillText(dateLabel, x, height - padding + 5);
    }
    
    // Draw line for role creations
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.8)'; // Green
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - data[0].roleCreations * yScale);
    
    for (let i = 1; i < data.length; i++) {
        const x = padding + i * xScale;
        const y = height - padding - data[i].roleCreations * yScale;
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    // Draw line for role deletions
    ctx.strokeStyle = 'rgba(231, 76, 60, 0.8)'; // Red
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - data[0].roleDeletions * yScale);
    
    for (let i = 1; i < data.length; i++) {
        const x = padding + i * xScale;
        const y = height - padding - data[i].roleDeletions * yScale;
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    // Draw line for policy changes
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)'; // Blue
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - data[0].policyChanges * yScale);
    
    for (let i = 1; i < data.length; i++) {
        const x = padding + i * xScale;
        const y = height - padding - data[i].policyChanges * yScale;
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    
    // Add legend
    const legendX = width - padding - 130;
    const legendY = padding + 10;
    
    // Role creations
    ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
    ctx.fillRect(legendX, legendY, 15, 2);
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Role Creations', legendX + 20, legendY);
    
    // Role deletions
    ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
    ctx.fillRect(legendX, legendY + 15, 15, 2);
    ctx.fillStyle = 'white';
    ctx.fillText('Role Deletions', legendX + 20, legendY + 15);
    
    // Policy changes
    ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
    ctx.fillRect(legendX, legendY + 30, 15, 2);
    ctx.fillStyle = 'white';
    ctx.fillText('Policy Changes', legendX + 20, legendY + 30);
    
    // Add chart title
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('IAM Activity (Last 30 Days)', centerX, 10);
}

// Export the utilities
window.CloudIamCharts = {
    drawRoleTypesChart,
    drawActivityChart
};
```

### Basic Test Templates

```javascript
// test/unit/routes/api/cloudiam.test.js
const request = require('supertest');
const express = require('express');
const cloudIamRoutes = require('../../../../server/routes/api/cloudiam');

// Mock the cloud-iam-service module
jest.mock('../../../../server/utils/cloudiam/iam-service', () => ({
  getRoles: jest.fn(),
  getRoleDetails: jest.fn(),
  getPermissions: jest.fn(),
  getDashboardMetrics: jest.fn(),
  createRole: jest.fn(),
  deleteRole: jest.fn()
}));

describe('Cloud IAM API Routes', () => {
  let app;
  
  beforeEach(() => {
    // Create a fresh Express app and mount our routes for each test
    app = express();
    app.use('/', cloudIamRoutes);
    
    // Reset and setup mocks
    const cloudIamService = require('../../../../server/utils/cloudiam/iam-service');
    
    cloudIamService.getRoles.mockResolvedValue([
      { id: 'admin', name: 'roles/admin', title: 'Admin', isCustom: false },
      { id: 'custom-role', name: 'projects/example/roles/custom-role', title: 'Custom Role', isCustom: true }
    ]);
    
    cloudIamService.getRoleDetails.mockResolvedValue({
      id: 'admin',
      name: 'roles/admin',
      title: 'Admin',
      description: 'Full access to all resources',
      permissions: ['resource.get', 'resource.list'],
      isCustom: false
    });
    
    cloudIamService.getPermissions.mockResolvedValue([
      {
        name: 'Compute',
        permissions: [
          { id: 'compute.instances.get', title: 'Get Instance' }
        ]
      }
    ]);
    
    cloudIamService.getDashboardMetrics.mockResolvedValue({
      totalRoles: 120,
      customRoles: 30,
      totalPermissions: 1200,
      securityScore: 85
    });
  });
  
  describe('GET /roles', () => {
    it('should return a list of roles', async () => {
      const response = await request(app).get('/roles');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id', 'admin');
    });
  });
  
  describe('GET /roles/:roleId', () => {
    it('should return role details', async () => {
      const response = await request(app).get('/roles/admin');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'admin');
      expect(response.body).toHaveProperty('permissions');
    });
  });
  
  describe('GET /permissions', () => {
    it('should return a list of permissions', async () => {
      const response = await request(app).get('/permissions');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('name', 'Compute');
      expect(Array.isArray(response.body[0].permissions)).toBe(true);
    });
  });
  
  describe('GET /dashboard', () => {
    it('should return dashboard metrics', async () => {
      const response = await request(app).get('/dashboard');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRoles');
      expect(response.body).toHaveProperty('customRoles');
      expect(response.body).toHaveProperty('totalPermissions');
      expect(response.body).toHaveProperty('securityScore');
    });
  });
});
```

## 7. CSS Templates

### Base CSS Template
```css
/* public/css/cloudiam/base.css */
/* Base styles for Cloud IAM overlay feature */

/* Main content area */
.container {
  margin-top: 60px;
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: visible;
}

/* Panel styles */
.iam-panel {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.7); /* Green border for IAM */
  padding: 15px;
  margin: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Panel positioning */
.iam-dashboard-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 300px;
  height: 250px;
}

.iam-roles-panel {
  position: absolute;
  top: 290px;
  left: 20px;
  width: 300px;
  height: calc(100% - 310px);
  display: flex;
  flex-direction: column;
}

.iam-details-panel {
  position: absolute;
  top: 20px;
  left: 340px;
  width: 320px;
  height: 320px;
  display: flex;
  flex-direction: column;
}

.iam-permissions-panel {
  position: absolute;
  top: 360px;
  left: 340px;
  width: 320px;
  height: calc(100% - 380px);
  display: flex;
  flex-direction: column;
}

.iam-activity-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  height: 250px;
}

/* Panel title styles */
.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  color: white;
}

/* Metrics container */
.metrics-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

/* List containers */
.list-container, 
.details-container,
.permissions-container {
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
  border: 1px solid rgba(76, 175, 80, 0.7);
  width: 500px;
  position: relative;
  color: white;
  max-height: 80vh;
  overflow-y: auto;
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
textarea,
select {
  width: 100%;
  padding: 8px;
  background: rgba(20, 24, 32, 0.8);
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

input[type="text"]:focus,
textarea:focus,
select:focus {
  border-color: rgba(76, 175, 80, 0.7);
  outline: none;
}

/* Filter input */
.permissions-filter {
  margin-top: 10px;
}

.filter-input {
  width: 100%;
  padding: 8px;
  background: rgba(20, 24, 32, 0.8);
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
}

.filter-input:focus {
  border-color: rgba(76, 175, 80, 0.7);
  outline: none;
}
```

### Panels CSS Template
```css
/* public/css/cloudiam/panels.css */
/* Styles for IAM metrics, roles, permissions panels */

/* Metric cards */
.metric-card {
  background: rgba(30, 34, 42, 0.8);
  border-radius: 4px;
  padding: 10px;
  text-align: center;
}

.metric-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.metric-value {
  font-size: 16px;
  font-weight: bold;
}

.metric-trend {
  font-size: 10px;
  margin-top: 5px;
}

.metric-trend.positive {
  color: #4caf50;
}

.metric-trend.negative {
  color: #f44336;
}

.metric-trend.neutral {
  color: #9e9e9e;
}

/* Role list items */
.role-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.role-item:hover {
  background: rgba(76, 175, 80, 0.3);
}

.role-item.selected {
  background: rgba(76, 175, 80, 0.5);
}

.role-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-custom-badge {
  background-color: rgba(76, 175, 80, 0.7);
  color: white;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: normal;
}

.role-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.role-id {
  opacity: 0.7;
  font-family: monospace;
  font-size: 11px;
}

.role-permissions-count {
  font-size: 11px;
}

/* Role details */
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

.details-content {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  margin-bottom: 5px;
  font-size: 12px;
}

.detail-label {
  width: 80px;
  color: rgba(255, 255, 255, 0.7);
}

.detail-value {
  flex: 1;
  word-break: break-word;
}

.permissions-header {
  font-size: 14px;
  font-weight: bold;
  margin-top: 15px;
  margin-bottom: 10px;
  padding-top: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.role-permissions {
  max-height: 100px;
  overflow-y: auto;
}

/* Permission items */
.permission-category {
  margin-bottom: 15px;
}

.category-header {
  font-weight: bold;
  font-size: 14px;
  padding: 5px;
  background: rgba(20, 24, 32, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.category-permissions {
  padding: 5px;
}

.permission-item {
  padding: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.permission-title {
  font-weight: bold;
}

.permission-id {
  font-family: monospace;
  opacity: 0.7;
  font-size: 11px;
}

.permission-description {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 3px;
}

/* Permission selection for role creation */
.permissions-select-container {
  display: flex;
  gap: 10px;
  height: 200px;
}

.permissions-select {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #555;
  border-radius: 4px;
  overflow: hidden;
}

.permissions-select-title {
  padding: 5px;
  background: rgba(20, 24, 32, 0.8);
  border-bottom: 1px solid #555;
  font-size: 12px;
  text-align: center;
}

.permissions-select-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.permissions-select-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.modal-permission-item {
  padding: 5px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
  font-family: monospace;
}

.modal-permission-item:hover {
  background: rgba(76, 175, 80, 0.3);
}

.modal-permission-item.selected {
  background: rgba(76, 175, 80, 0.5);
}
```

### Controls CSS Template
```css
/* public/css/cloudiam/controls.css */
/* Styles for buttons and controls */

/* Action buttons */
.action-button {
  background: rgba(76, 175, 80, 0.7);
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
  background: rgba(76, 175, 80, 0.9);
}

.action-button:disabled {
  background: rgba(100, 100, 100, 0.5);
  cursor: not-allowed;
}

.danger-button {
  background: rgba(244, 67, 54, 0.7);
}

.danger-button:hover {
  background: rgba(244, 67, 54, 0.9);
}

/* Panel actions container */
.panel-actions {
  display: flex;
  gap: 10px;
}

.panel-actions .action-button {
  flex: 1;
}

/* Role types */
.custom-role {
  border-left: 3px solid rgba(76, 175, 80, 0.7);
}

.predefined-role {
  border-left: 3px solid rgba(3, 169, 244, 0.7);
}

/* Hardware Controls Override */
.hardware-controls {
  z-index: 1001; /* Ensure controls stay above modals */
}
```