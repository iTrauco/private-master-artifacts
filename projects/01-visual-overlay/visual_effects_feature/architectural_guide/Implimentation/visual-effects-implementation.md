# Visual Effects Gallery Implementation Guide

## 1. File Structure

Create these files:

```
public/
├── css/
│   └── visualeffects/
│       ├── base.css
│       ├── panels.css
│       └── controls.css
├── js/
│   └── visualeffects/
│       ├── controllers/
│       │   └── visualeffects-controller.js
│       ├── services/
│       │   └── visualeffects-service.js
│       └── utils/
│           └── visual-registry.js
├── pages/
│   └── visualeffects/
│       └── index.html
server/
├── routes/
│   ├── api/
│   │   └── visualeffects.js
│   └── pages.js (modify)
└── utils/
    └── visualeffects/
        └── effects-service.js
```

## 2. Backend Implementation

### 2.1 Create Server Route (`server/routes/api/visualeffects.js`)

```javascript
// server/routes/api/visualeffects.js
const express = require('express');
const router = express.Router();
const visualEffectsService = require('../../utils/visualeffects/effects-service');

// Get all available visual effects
router.get('/list', async (req, res) => {
    try {
        const visuals = await visualEffectsService.getAvailableVisuals();
        res.json(visuals);
    } catch (error) {
        console.error('Error fetching visual effects:', error);
        res.status(500).json({ error: 'Failed to fetch visual effects' });
    }
});

// Get settings for a specific visual effect
router.get('/:visualId/settings', async (req, res) => {
    try {
        const settings = await visualEffectsService.getVisualSettings(req.params.visualId);
        res.json(settings);
    } catch (error) {
        console.error(`Error fetching settings for visual ${req.params.visualId}:`, error);
        res.status(500).json({ error: 'Failed to fetch visual settings' });
    }
});

// Update settings for a specific visual effect
router.post('/:visualId/settings', async (req, res) => {
    try {
        const updatedSettings = await visualEffectsService.updateVisualSettings(req.params.visualId, req.body);
        res.json(updatedSettings);
    } catch (error) {
        console.error(`Error updating settings for visual ${req.params.visualId}:`, error);
        res.status(500).json({ error: 'Failed to update visual settings' });
    }
});

module.exports = router;
```

### 2.2 Create Mock Service (`server/utils/visualeffects/effects-service.js`)

```javascript
// server/utils/visualeffects/effects-service.js
/**
 * Visual Effects Service Utility
 * Handles available visual effects and their settings
 */

// Define available visual effects
const availableVisuals = [
    {
        id: 'vaporwave',
        name: 'Vaporwave',
        description: 'Retro vaporwave visualization with 3D objects and grid',
        type: '3d',
        supportedOverlays: ['webcam', 'screen-capture'],
        configurable: true
    },
    {
        id: 'particles',
        name: 'Particle System',
        description: 'Dynamic particle effects with customizable behavior',
        type: '2d',
        supportedOverlays: ['webcam', 'screen-capture', 'browser-source'],
        configurable: true
    },
    {
        id: 'waveform',
        name: 'Audio Waveform',
        description: 'Real-time audio visualization with waveform display',
        type: '2d',
        supportedOverlays: ['webcam', 'screen-capture', 'browser-source'],
        configurable: true
    },
    {
        id: 'retrosun',
        name: 'Retro Sun',
        description: 'Classic 80s retro sun visualization with grid and mountains',
        type: '2d',
        supportedOverlays: ['webcam', 'screen-capture'],
        configurable: true
    }
];

// Default settings for each effect
const defaultSettings = {
    'vaporwave': {
        elements: {
            bust: { visible: true, scale: 1.0 },
            grid: { visible: true, speed: 1.0, color: '#00ffff' },
            mountains: { visible: true, height: 1.0 },
            palmTrees: { visible: true, count: 3 },
            retro: { visible: true, type: 'computer' },
            particles: { visible: true, density: 0.5 }
        },
        cameraMode: 'orbiting',
        rotationSpeed: 1.0,
        showVideo: true
    },
    'particles': {
        count: 100,
        speed: 2.0,
        size: 5,
        color: '#ffffff',
        opacity: 0.7,
        interactive: true,
        connectionLines: true
    },
    'waveform': {
        sensitivity: 1.0,
        color: '#00ff00',
        backgroundColor: 'transparent',
        lineWidth: 2,
        symmetrical: true,
        style: 'line'
    },
    'retrosun': {
        sunColor: '#ff6b35',
        gridColor: '#5e2ca5',
        backgroundColor: '#000000',
        speed: 1.0,
        showGrid: true,
        showMountains: true,
        lineWidth: 2
    }
};

// Track current settings (initially set to defaults)
let currentSettings = JSON.parse(JSON.stringify(defaultSettings));

// Visual effects service
const visualEffectsService = {
    /**
     * Get all available visual effects
     * @returns {Promise<Array>} List of visual effects
     */
    getAvailableVisuals: async function() {
        return availableVisuals;
    },
    
    /**
     * Get settings for a specific visual effect
     * @param {string} visualId - Visual effect ID
     * @returns {Promise<Object>} Visual effect settings
     */
    getVisualSettings: async function(visualId) {
        if (!currentSettings[visualId]) {
            throw new Error(`Settings not found for visual: ${visualId}`);
        }
        
        return currentSettings[visualId];
    },
    
    /**
     * Reset settings for a visual effect to defaults
     * @param {string} visualId - Visual effect ID
     * @returns {Promise<Object>} Updated visual effect settings
     */
    resetVisualSettings: async function(visualId) {
        if (!defaultSettings[visualId]) {
            throw new Error(`Default settings not found for visual: ${visualId}`);
        }
        
        currentSettings[visualId] = JSON.parse(JSON.stringify(defaultSettings[visualId]));
        return currentSettings[visualId];
    },
    
    /**
     * Update settings for a specific visual effect
     * @param {string} visualId - Visual effect ID
     * @param {Object} newSettings - New settings to apply
     * @returns {Promise<Object>} Updated visual effect settings
     */
    updateVisualSettings: async function(visualId, newSettings) {
        if (!currentSettings[visualId]) {
            throw new Error(`Settings not found for visual: ${visualId}`);
        }
        
        // Merge new settings with current settings
        currentSettings[visualId] = {
            ...currentSettings[visualId],
            ...newSettings
        };
        
        return currentSettings[visualId];
    }
};

module.exports = visualEffectsService;
```

### 2.3 Update Page Routes (`server/routes/pages.js`)

Add this to your existing routes:

```javascript
// Visual Effects Gallery route
router.get('/visualeffects', (req, res) => {
    console.log('Visual Effects Gallery page requested');
    try {
        const filePath = path.join(__dirname, '../../public/pages/visualeffects/index.html');
        console.log('Attempting to serve file:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving Visual Effects Gallery page:', error);
        res.status(500).send('Error loading Visual Effects Gallery page');
    }
});
```

### 2.4 Update Server.js

Add the new route in your server.js:

```javascript
// Add to the imports section in server.js
const visualEffectsApiRoutes = require('./routes/api/visualeffects');

// Add to the routes mounting section
app.use('/api/visualeffects', visualEffectsApiRoutes);
console.log('Visual Effects API routes mounted at /api/visualeffects');
```

## 3. Frontend Implementation

### 3.1 Create HTML Page (`public/pages/visualeffects/index.html`)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Visual Effects Gallery - OBS Hardware Overlay</title>
  
  <!-- Base styles -->
  <link rel="stylesheet" href="../../css/base/reset.css">
  <link rel="stylesheet" href="../../css/base/global.css">
  
  <!-- Navigation styles -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
  <link rel="stylesheet" href="../../css/navigation/controls.css">
  
  <!-- Visual Effects styles -->
  <link rel="stylesheet" href="../../css/visualeffects/base.css">
  <link rel="stylesheet" href="../../css/visualeffects/panels.css">
  <link rel="stylesheet" href="../../css/visualeffects/controls.css">
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
      <li><a href="#" class="active" onclick="navigateTo('/visualeffects')">Visual Effects</a></li>
      <li><a href="#" onclick="navigateTo('/settings')">Settings</a></li>
    </ul>
  </nav>
  
  <div class="container">
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
    
    <!-- Gallery Panel -->
    <div id="ve-gallery-panel" class="ve-panel ve-gallery-panel">
      <div class="panel-title">Visual Effects Gallery</div>
      <div id="visuals-grid" class="visuals-grid">
        <div class="empty-state">Loading visual effects...</div>
      </div>
    </div>

    <!-- Preview Panel -->
    <div id="ve-preview-panel" class="ve-panel ve-preview-panel">
      <div class="panel-title">Preview</div>
      <div id="preview-container" class="preview-container">
        <div class="quadrant-grid">
          <div id="quadrant-1" class="quadrant" data-quadrant="1">1</div>
          <div id="quadrant-2" class="quadrant" data-quadrant="2">2</div>
          <div id="quadrant-3" class="quadrant" data-quadrant="3">3</div>
          <div id="quadrant-4" class="quadrant" data-quadrant="4">4</div>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div id="ve-settings-panel" class="ve-panel ve-settings-panel">
      <div class="panel-title">Effect Settings</div>
      <div id="effect-settings" class="settings-container">
        <div class="empty-state">Select a visual effect to adjust settings</div>
      </div>
    </div>

    <!-- Active Effects Panel -->
    <div id="ve-active-panel" class="ve-panel ve-active-panel">
      <div class="panel-title">Active Effects</div>
      <div id="active-effects-list" class="active-list">
        <div class="empty-state">No active effects</div>
      </div>
      <div class="action-buttons">
        <button id="show-selected-effect" class="action-button">Show Selected</button>
        <button id="hide-selected-effect" class="action-button">Hide Selected</button>
      </div>
    </div>
  </div>

  <!-- Hardware Controls Bar -->
  <div class="hardware-controls">
    <button id="show-all-btn">Show All</button>
    <button id="hide-all-btn">Hide All</button>
    <button id="show-gallery-btn">Gallery</button>
    <button id="show-preview-btn">Preview</button>
    <button id="show-settings-btn">Settings</button>
    <button id="show-active-btn">Active</button>
    <button id="toggle-controls-btn">≡</button>
  </div>
  <div id="show-controls-btn" style="display: none;">≡</div>

  <!-- Core Scripts -->
  <script src="../../js/navigation.js"></script>
  
  <!-- Visual Effects Scripts -->
  <script src="../../js/visualeffects/utils/visual-registry.js"></script>
  <script src="../../js/visualeffects/services/visualeffects-service.js"></script>
  <script src="../../js/visualeffects/controllers/visualeffects-controller.js"></script>
</body>
</html>
```

### 3.2 Create CSS Files

#### 3.2.1 Base Styles (`public/css/visualeffects/base.css`)

```css
/* Base styles for Visual Effects Gallery feature */

/* Main content area */
.container {
  margin-top: 60px;
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: visible;
}

/* Panel positioning */
.ve-gallery-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 250px;
  height: calc(100% - 40px);
  overflow-y: auto;
}

.ve-preview-panel {
  position: absolute;
  top: 20px;
  left: 280px;
  width: calc(100% - 580px);
  height: calc(100% - 40px);
}

.ve-settings-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  height: calc(50% - 30px);
}

.ve-active-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 280px;
  height: calc(50% - 30px);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .ve-preview-panel {
    width: calc(100% - 560px);
  }
  
  .ve-settings-panel, .ve-active-panel {
    width: 260px;
  }
}

@media (max-width: 1000px) {
  .ve-gallery-panel {
    width: 220px;
  }
  
  .ve-preview-panel {
    left: 250px;
    width: calc(100% - 500px);
  }
  
  .ve-settings-panel, .ve-active-panel {
    width: 230px;
  }
}

/* Quadrant grid in preview panel */
.quadrant-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
}

.quadrant {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  font-size: 24px;
  color: rgba(255, 255, 255, 0.2);
  overflow: visible;
  transition: border-color 0.3s;
}

.quadrant:hover {
  border-color: rgba(0, 170, 255, 0.5);
}

.quadrant.has-visual {
  color: transparent;
}

/* Quadrant colors for visual distinction */
#quadrant-1 {
  background: rgba(255, 100, 70, 0.05);
}

#quadrant-2 {
  background: rgba(70, 150, 230, 0.05);
}

#quadrant-3 {
  background: rgba(50, 180, 100, 0.05);
}

#quadrant-4 {
  background: rgba(180, 100, 220, 0.05);
}

/* Empty state and loading states */
.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
}

.loading-state {
  padding: 15px;
  text-align: center;
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
  margin: 10px 0;
}
```

#### 3.2.2 Panel Styles (`public/css/visualeffects/panels.css`)

```css
/* Panel styles for Visual Effects Gallery */

/* Base panel styling */
.ve-panel {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.7);
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Panel titles */
.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 6px;
}

/* Visual effects grid */
.visuals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

@media (max-width: 1200px) {
  .visuals-grid {
    grid-template-columns: 1fr;
  }
}

/* Visual effect card */
.visual-card {
  background-color: rgba(30, 34, 42, 0.8);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.visual-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.visual-card.selected {
  border: 2px solid rgba(0, 170, 255, 0.9);
}

.visual-preview {
  width: 100%;
  height: 120px;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.visual-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.visual-info {
  padding: 10px;
}

.visual-name {
  font-weight: bold;
  margin-bottom: 2px;
}

.visual-description {
  font-size: 11px;
  color: #aaa;
  margin-bottom: 5px;
}

.visual-badges {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.visual-badge {
  background-color: rgba(0, 170, 255, 0.2);
  color: #00aaff;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 10px;
}

/* Preview container */
.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

/* Settings container */
.settings-container {
  height: calc(100% - 35px);
  overflow-y: auto;
}

.settings-section {
  background-color: rgba(30, 34, 42, 0.5);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
}

.settings-section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.setting-label {
  flex: 1;
  font-size: 12px;
}

.setting-control {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

/* Active effects list */
.active-list {
  height: calc(100% - 95px);
  overflow-y: auto;
  background: rgba(30, 34, 42, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
  margin-top: 10px;
}

.active-effect-item {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.active-effect-item:hover {
  background: rgba(0, 170, 255, 0.3);
}

.active-effect-item.selected {
  background: rgba(0, 170, 255, 0.5);
}

.effect-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
}

.effect-status {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #aaa;
}

.effect-status.visible {
  color: #52c41a;
}

.effect-status.hidden {
  color: #ff4d4f;
}

.effect-location {
  font-size: 11px;
  color: #aaa;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
```

#### 3.2.3 Controls Styles (`public/css/visualeffects/controls.css`)

```css
/* Controls styles for Visual Effects Gallery */

/* Action buttons */
.action-button {
  background: rgba(0, 140, 210, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  flex: 1;
  text-align: center;
}

.action-button:hover {
  background: rgba(0, 170, 255, 0.9);
}

.action-button:disabled {
  background: rgba(100, 100, 100, 0.5);
  cursor: not-allowed;
}

/* Input controls */
.ve-input {
  background-color: rgba(40, 44, 52, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: white;
  padding: 5px 8px;
  width: 100%;
  font-size: 12px;
}

.ve-select {
  background-color: rgba(40, 44, 52, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: white;
  padding: 5px 8px;
  width: 100%;
  font-size: 12px;
}

.ve-checkbox {
  margin-right: 5px;
}

/* Sliders */
.ve-slider-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ve-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.ve-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(0, 170, 255, 0.9);
  cursor: pointer;
  border: none;
}

.ve-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(0, 170, 255, 0.9);
  cursor: pointer;
  border: none;
}

.ve-slider-value {
  width: 30px;
  text-align: right;
  font-size: 11px;
}

/* Color pickers */
.ve-color-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ve-color-display {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.ve-color-picker {
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

/* Tabs */
.ve-tabs {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ve-tab {
  padding: 8px 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  transition: all 0.2s;
}

.ve-tab:hover {
  background-color: rgba(0, 170, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.ve-tab.active {
  background-color: rgba(0, 170, 255, 0.3);
  color: white;
  border-bottom: 2px solid rgba(0, 170, 255, 0.9);
}

.ve-tab-content {
  display: none;
}

.ve-tab-content.active {
  display: block;
}

/* Presets */
.presets-section {
  margin-top: 15px;
}

.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 5px;
}

.preset-button {
  background-color: rgba(40, 44, 52, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: white;
  padding: 5px 8px;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
}

.preset-button:hover {
  background-color: rgba(0, 170, 255, 0.3);
}
```

### 3.3 Create Frontend Service (`public/js/visualeffects/services/visualeffects-service.js`)

```javascript
/**
 * Visual Effects Service Module
 * Handles fetching and managing visual effects
 */

// Create a global VisualEffectsService object
window.VisualEffectsService = {
    // State
    activeVisuals: [],
    selectedVisualId: null,
    availableVisuals: [],
    
    // Initialize the service
    init: function() {
        console.log('Initializing Visual Effects Service');
        return this.fetchVisuals();
    },
    
    // Fetch available visual effects
    fetchVisuals: function() {
        return new Promise((resolve, reject) => {
            console.log('Fetching visual effects');
            fetch('/api/visualeffects/list')
                .then(response => response.json())
                .then(data => {
                    console.log('Visual effects fetched:', data);
                    this.availableVisuals = data;
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error fetching visual effects:', error);
                    reject(error);
                });
        });
    },
    
    // Fetch settings for a specific visual effect
    fetchVisualSettings: function(visualId) {
        return new Promise((resolve, reject) => {
            console.log(`Fetching settings for visual: ${visualId}`);
            fetch(`/api/visualeffects/${visualId}/settings`)
                .then(response => response.json())
                .then(data => {
                    console.log('Visual settings fetched:', data);
                    resolve(data);
                })
                .catch(error => {
                    console.error(`Error fetching settings for visual ${visualId}:`, error);
                    reject(error);
                });
        });
    },
    
    // Update settings for a specific visual effect
    updateVisualSettings: function(visualId, settings) {
        return new Promise((resolve, reject) => {
            console.log(`Updating settings for visual: ${visualId}`, settings);
            fetch(`/api/visualeffects/${visualId}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Visual settings updated:', data);
                    resolve(data);
                })
                .catch(error => {
                    console.error(`Error updating settings for visual ${visualId}:`, error);
                    reject(error);
                });
        });
    },
    
    // Get a visual by ID
    getVisualById: function(visualId) {
        return this.availableVisuals.find(visual => visual.id === visualId);
    },
    
    // Select a visual
    selectVisual: function(visualId) {
        this.selectedVisualId = visualId;
        return this.getVisualById(visualId);
    },
    
    // Apply a visual to a quadrant
    applyVisualToQuadrant: function(visualId, quadrant) {
        // Check if this quadrant already has a visual
        const existingIndex = this.activeVisuals.findIndex(v => v.quadrant === quadrant);
        if (existingIndex >= 0) {
            // Replace it
            this.activeVisuals[existingIndex] = {
                id: visualId,
                quadrant,
                visible: true,
                settings: {}
            };
        } else {
            // Add new
            this.activeVisuals.push({
                id: visualId,
                quadrant,
                visible: true,
                settings: {}
            });
        }
        
        // Trigger any visual effect initialization here
        this.initializeVisual(visualId, quadrant);
        
        return this.activeVisuals.find(v => v.id === visualId && v.quadrant === quadrant);
    },
    
    // Remove a visual from a quadrant
    removeVisualFromQuadrant: function(quadrant) {
        const visualToRemove = this.activeVisuals.find(v => v.quadrant === quadrant);
        if (visualToRemove) {
            // Clean up any visual resources
            this.destroyVisual(visualToRemove.id, quadrant);
            
            // Remove from active list
            this.activeVisuals = this.activeVisuals.filter(v => v.quadrant !== quadrant);
        }
        return visualToRemove;
    },
    
    // Show a visual
    showVisual: function(visualId, quadrant) {
        const visual = this.activeVisuals.find(v => v.id === visualId && v.quadrant === quadrant);
        if (visual) {
            visual.visible = true;
            
            // Update visibility in the DOM
            const container = document.querySelector(`#quadrant-${quadrant} .visual-container[data-visual-id="${visualId}"]`);
            if (container) {
                container.style.display = 'block';
            }
        }
        return visual;
    },
    
    // Hide a visual
    hideVisual: function(visualId, quadrant) {
        const visual = this.activeVisuals.find(v => v.id === visualId && v.quadrant === quadrant);
        if (visual) {
            visual.visible = false;
            
            // Update visibility in the DOM
            const container = document.querySelector(`#quadrant-${quadrant} .visual-container[data-visual-id="${visualId}"]`);
            if (container) {
                container.style.display = 'none';
            }
        }
        return visual;
    },
    
    // Hide all visuals
    hideAllVisuals: function() {
        this.activeVisuals.forEach(visual => {
            this.hideVisual(visual.id, visual.quadrant);
        });
    },
    
    // Show all visuals
    showAllVisuals: function() {
        this.activeVisuals.forEach(visual => {
            this.showVisual(visual.id, visual.quadrant);
        });
    },
    
    // Initialize a visual in a quadrant
    initializeVisual: function(visualId, quadrant) {
        // Get the visual type
        const visual = this.getVisualById(visualId);
        if (!visual) return;
        
        // Get the quadrant element
        const quadrantEl = document.getElementById(`quadrant-${quadrant}`);
        if (!quadrantEl) return;
        
        // Create container for the visual
        const container = document.createElement('div');
        container.className = 'visual-container';
        container.dataset.visualId = visualId;
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '25';
        
        // Add to quadrant
        quadrantEl.appendChild(container);
        quadrantEl.classList.add('has-visual');
        
        // Initialize based on visual type
        switch(visualId) {
            case 'vaporwave':
                this.initializeVaporwave(container);
                break;
            case 'particles':
                this.initializeParticles(container);
                break;
            case 'waveform':
                this.initializeWaveform(container);
                break;
            case 'retrosun':
                this.initializeRetroSun(container);
                break;
        }
    },
    
    // Initialize vaporwave visualization
    initializeVaporwave: function(container) {
        // For now, just show a placeholder
        container.innerHTML = `
            <div style="width: 100%; height: 100%; background: linear-gradient(45deg, #ff00ff, #00ffff); display: flex; justify-content: center; align-items: center;">
                <div style="font-size: 20px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    Vaporwave Visualization
                </div>
            </div>
        `;
    },
    
    // Initialize particles visualization
    initializeParticles: function(container) {
        // Placeholder
        container.innerHTML = `
            <div style="width: 100%; height: 100%; background: black; display: flex; justify-content: center; align-items: center;">
                <div style="font-size: 20px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    Particle System
                </div>
            </div>
        `;
    },
    
    // Initialize waveform visualization
    initializeWaveform: function(container) {
        // Placeholder
        container.innerHTML = `
            <div style="width: 100%; height: 100%; background: black; display: flex; justify-content: center; align-items: center;">
                <div style="font-size: 20px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    Audio Waveform
                </div>
            </div>
        `;
    },
    
    // Initialize retro sun visualization
    initializeRetroSun: function(container) {
        // Placeholder
        container.innerHTML = `
            <div style="width: 100%; height: 100%; background: linear-gradient(to bottom, #000033, #660066); display: flex; justify-content: center; align-items: center;">
                <div style="font-size: 20px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    Retro Sun Visualization
                </div>
            </div>
        `;
    },
    
    // Destroy a visual
    destroyVisual: function(visualId, quadrant) {
        // Get the quadrant element
        const quadrantEl = document.getElementById(`quadrant-${quadrant}`);
        if (!quadrantEl) return;
        
        // Remove the visual container
        const container = quadrantEl.querySelector(`.visual-container[data-visual-id="${visualId}"]`);
        if (container) {
            container.remove();
        }
        
        // Remove the has-visual class if no visuals remain
        const remainingContainers = quadrantEl.querySelectorAll('.visual-container');
        if (remainingContainers.length === 0) {
            quadrantEl.classList.remove('has-visual');
        }
    }
};
```

### 3.4 Create Visual Registry Utility (`public/js/visualeffects/utils/visual-registry.js`)

```javascript
/**
 * Visual Effects Registry
 * Provides information about available visual effects
 */

window.VisualEffectsRegistry = {
    // Registry of visual effect thumbnails and configurations
    thumbnails: {
        'vaporwave': '../../assets/visualeffects/thumbnails/vaporwave.jpg',
        'particles': '../../assets/visualeffects/thumbnails/particles.jpg',
        'waveform': '../../assets/visualeffects/thumbnails/waveform.jpg',
        'retrosun': '../../assets/visualeffects/thumbnails/retrosun.jpg'
    },
    
    // Default settings templates
    defaultSettings: {
        'vaporwave': {
            elements: {
                bust: { visible: true, scale: 1.0 },
                grid: { visible: true, speed: 1.0, color: '#00ffff' },
                mountains: { visible: true, height: 1.0 },
                palmTrees: { visible: true, count: 3 },
                retro: { visible: true, type: 'computer' },
                particles: { visible: true, density: 0.5 }
            },
            cameraMode: 'orbiting',
            rotationSpeed: 1.0,
            showVideo: true
        },
        'particles': {
            count: 100,
            speed: 2.0,
            size: 5,
            color: '#ffffff',
            opacity: 0.7,
            interactive: true,
            connectionLines: true
        },
        'waveform': {
            sensitivity: 1.0,
            color: '#00ff00',
            backgroundColor: 'transparent',
            lineWidth: 2,
            symmetrical: true,
            style: 'line'
        },
        'retrosun': {
            sunColor: '#ff6b35',
            gridColor: '#5e2ca5',
            backgroundColor: '#000000',
            speed: 1.0,
            showGrid: true,
            showMountains: true,
            lineWidth: 2
        }
    },
    
    // Get thumbnail URL for a visual
    getThumbnail: function(visualId) {
        return this.thumbnails[visualId] || '../../assets/visualeffects/thumbnails/placeholder.jpg';
    },
    
    // Get default settings for a visual
    getDefaultSettings: function(visualId) {
        return JSON.parse(JSON.stringify(this.defaultSettings[visualId] || {}));
    },
    
    // Create settings UI for a visual
    createSettingsUI: function(visualId, container, settings, changeCallback) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Get visual type
        switch(visualId) {
            case 'vaporwave':
                this.createVaporwaveSettings(container, settings, changeCallback);
                break;
            case 'particles':
                this.createParticlesSettings(container, settings, changeCallback);
                break;
            case 'waveform':
                this.createWaveformSettings(container, settings, changeCallback);
                break;
            case 'retrosun':
                this.createRetroSunSettings(container, settings, changeCallback);
                break;
            default:
                container.innerHTML = '<div class="empty-state">No settings available for this effect</div>';
        }
    },
    
    // Create settings UI for vaporwave effect
    createVaporwaveSettings: function(container, settings, changeCallback) {
        // Elements section
        const elementsSection = document.createElement('div');
        elementsSection.className = 'settings-section';
        elementsSection.innerHTML = `
            <div class="settings-section-title">Elements</div>
        `;
        
        // Create element controls
        const elements = ['bust', 'grid', 'mountains', 'palmTrees', 'retro', 'particles'];
        const elementLabels = {
            bust: 'Greek Bust',
            grid: 'Grid',
            mountains: 'Mountains',
            palmTrees: 'Palm Trees',
            retro: 'Retro Items',
            particles: 'Particles'
        };
        
        elements.forEach(element => {
            const elementRow = document.createElement('div');
            elementRow.className = 'setting-row';
            
            // Create visibility toggle
            elementRow.innerHTML = `
                <div class="setting-label">${elementLabels[element]}</div>
                <div class="setting-control">
                    <input type="checkbox" id="${element}-visible" class="ve-checkbox" 
                           ${settings.elements[element].visible ? 'checked' : ''}>
                    <label for="${element}-visible">Visible</label>
                </div>
            `;
            
            // Add event listener
            const checkbox = elementRow.querySelector(`#${element}-visible`);
            checkbox.addEventListener('change', e => {
                settings.elements[element].visible = e.target.checked;
                if (changeCallback) changeCallback(settings);
            });
            
            elementsSection.appendChild(elementRow);
            
            // Add element-specific controls
            if (element === 'grid') {
                // Grid color
                const colorRow = document.createElement('div');
                colorRow.className = 'setting-row';
                colorRow.innerHTML = `
                    <div class="setting-label">Grid Color</div>
                    <div class="setting-control ve-color-container">
                        <div class="ve-color-display" id="grid-color-display" style="background-color: ${settings.elements.grid.color}"></div>
                        <input type="color" id="grid-color" class="ve-color-picker" value="${settings.elements.grid.color}">
                    </div>
                `;
                
                const colorPicker = colorRow.querySelector('#grid-color');
                const colorDisplay = colorRow.querySelector('#grid-color-display');
                
                colorPicker.addEventListener('input', e => {
                    settings.elements.grid.color = e.target.value;
                    colorDisplay.style.backgroundColor = e.target.value;
                });
                
                colorPicker.addEventListener('change', e => {
                    if (changeCallback) changeCallback(settings);
                });
                
                elementsSection.appendChild(colorRow);
                
                // Grid speed
                const speedRow = document.createElement('div');
                speedRow.className = 'setting-row';
                speedRow.innerHTML = `
                    <div class="setting-label">Grid Speed</div>
                    <div class="setting-control ve-slider-container">
                        <input type="range" id="grid-speed" class="ve-slider" 
                               min="0.1" max="3.0" step="0.1" value="${settings.elements.grid.speed}">
                        <span id="grid-speed-value" class="ve-slider-value">${settings.elements.grid.speed.toFixed(1)}</span>
                    </div>
                `;
                
                const slider = speedRow.querySelector('#grid-speed');
                const valueDisplay = speedRow.querySelector('#grid-speed-value');
                
                slider.addEventListener('input', e => {
                    const value = parseFloat(e.target.value);
                    settings.elements.grid.speed = value;
                    valueDisplay.textContent = value.toFixed(1);
                });
                
                slider.addEventListener('change', e => {
                    if (changeCallback) changeCallback(settings);
                });
                
                elementsSection.appendChild(speedRow);
            }
        });
        
        container.appendChild(elementsSection);
        
        // Camera section
        const cameraSection = document.createElement('div');
        cameraSection.className = 'settings-section';
        cameraSection.innerHTML = `
            <div class="settings-section-title">Camera</div>
            
            <div class="setting-row">
                <div class="setting-label">Camera Mode</div>
                <div class="setting-control">
                    <select id="camera-mode" class="ve-select">
                        <option value="orbiting" ${settings.cameraMode === 'orbiting' ? 'selected' : ''}>Orbiting</option>
                        <option value="panning" ${settings.cameraMode === 'panning' ? 'selected' : ''}>Panning</option>
                        <option value="static" ${settings.cameraMode === 'static' ? 'selected' : ''}>Static</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Animation Speed</div>
                <div class="setting-control ve-slider-container">
                    <input type="range" id="rotation-speed" class="ve-slider" 
                           min="0.1" max="3.0" step="0.1" value="${settings.rotationSpeed}">
                    <span id="rotation-speed-value" class="ve-slider-value">${settings.rotationSpeed.toFixed(1)}</span>
                </div>
            </div>
        `;
        
        // Add event listeners
        const modeSelect = cameraSection.querySelector('#camera-mode');
        modeSelect.addEventListener('change', e => {
            settings.cameraMode = e.target.value;
            if (changeCallback) changeCallback(settings);
        });
        
        const speedSlider = cameraSection.querySelector('#rotation-speed');
        const speedValue = cameraSection.querySelector('#rotation-speed-value');
        
        speedSlider.addEventListener('input', e => {
            const value = parseFloat(e.target.value);
            settings.rotationSpeed = value;
            speedValue.textContent = value.toFixed(1);
        });
        
        speedSlider.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        container.appendChild(cameraSection);
        
        // Presets section
        const presetsSection = document.createElement('div');
        presetsSection.className = 'settings-section presets-section';
        presetsSection.innerHTML = `
            <div class="settings-section-title">Presets</div>
            
            <div class="preset-buttons">
                <button class="preset-button" data-preset="bustAndGrid">Bust & Grid</button>
                <button class="preset-button" data-preset="fullScene">Full Scene</button>
                <button class="preset-button" data-preset="minimal">Minimal</button>
                <button class="preset-button" data-preset="retroTech">Retro Tech</button>
            </div>
        `;
        
        // Add event listeners to preset buttons
        const presetButtons = presetsSection.querySelectorAll('.preset-button');
        presetButtons.forEach(button => {
            button.addEventListener('click', e => {
                const preset = e.target.dataset.preset;
                // Apply preset (this would be handled by your vaporwave service)
                alert(`Preset ${preset} applied!`);
            });
        });
        
        container.appendChild(presetsSection);
    },
    
    // Create settings UI for particles effect
    createParticlesSettings: function(container, settings, changeCallback) {
        // Main settings section
        const mainSection = document.createElement('div');
        mainSection.className = 'settings-section';
        mainSection.innerHTML = `
            <div class="settings-section-title">Particle Settings</div>
            
            <div class="setting-row">
                <div class="setting-label">Particle Count</div>
                <div class="setting-control ve-slider-container">
                    <input type="range" id="particle-count" class="ve-slider" 
                           min="10" max="500" step="10" value="${settings.count}">
                    <span id="particle-count-value" class="ve-slider-value">${settings.count}</span>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Particle Size</div>
                <div class="setting-control ve-slider-container">
                    <input type="range" id="particle-size" class="ve-slider" 
                           min="1" max="10" step="1" value="${settings.size}">
                    <span id="particle-size-value" class="ve-slider-value">${settings.size}</span>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Movement Speed</div>
                <div class="setting-control ve-slider-container">
                    <input type="range" id="particle-speed" class="ve-slider" 
                           min="0.5" max="5.0" step="0.1" value="${settings.speed}">
                    <span id="particle-speed-value" class="ve-slider-value">${settings.speed.toFixed(1)}</span>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Opacity</div>
                <div class="setting-control ve-slider-container">
                    <input type="range" id="particle-opacity" class="ve-slider" 
                           min="0.1" max="1.0" step="0.1" value="${settings.opacity}">
                    <span id="particle-opacity-value" class="ve-slider-value">${settings.opacity.toFixed(1)}</span>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Particle Color</div>
                <div class="setting-control ve-color-container">
                    <div class="ve-color-display" id="particle-color-display" style="background-color: ${settings.color}"></div>
                    <input type="color" id="particle-color" class="ve-color-picker" value="${settings.color}">
                </div>
            </div>
        `;
        
        // Add event listeners
        const countSlider = mainSection.querySelector('#particle-count');
        const countValue = mainSection.querySelector('#particle-count-value');
        
        countSlider.addEventListener('input', e => {
            const value = parseInt(e.target.value);
            settings.count = value;
            countValue.textContent = value;
        });
        
        countSlider.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        const sizeSlider = mainSection.querySelector('#particle-size');
        const sizeValue = mainSection.querySelector('#particle-size-value');
        
        sizeSlider.addEventListener('input', e => {
            const value = parseInt(e.target.value);
            settings.size = value;
            sizeValue.textContent = value;
        });
        
        sizeSlider.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        const speedSlider = mainSection.querySelector('#particle-speed');
        const speedValue = mainSection.querySelector('#particle-speed-value');
        
        speedSlider.addEventListener('input', e => {
            const value = parseFloat(e.target.value);
            settings.speed = value;
            speedValue.textContent = value.toFixed(1);
        });
        
        speedSlider.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        const opacitySlider = mainSection.querySelector('#particle-opacity');
        const opacityValue = mainSection.querySelector('#particle-opacity-value');
        
        opacitySlider.addEventListener('input', e => {
            const value = parseFloat(e.target.value);
            settings.opacity = value;
            opacityValue.textContent = value.toFixed(1);
        });
        
        opacitySlider.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        const colorPicker = mainSection.querySelector('#particle-color');
        const colorDisplay = mainSection.querySelector('#particle-color-display');
        
        colorPicker.addEventListener('input', e => {
            settings.color = e.target.value;
            colorDisplay.style.backgroundColor = e.target.value;
        });
        
        colorPicker.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        container.appendChild(mainSection);
        
        // Options section
        const optionsSection = document.createElement('div');
        optionsSection.className = 'settings-section';
        optionsSection.innerHTML = `
            <div class="settings-section-title">Additional Options</div>
            
            <div class="setting-row">
                <div class="setting-label">Interactive</div>
                <div class="setting-control">
                    <input type="checkbox" id="particle-interactive" class="ve-checkbox" 
                           ${settings.interactive ? 'checked' : ''}>
                    <label for="particle-interactive">Mouse Interaction</label>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Connection Lines</div>
                <div class="setting-control">
                    <input type="checkbox" id="particle-connections" class="ve-checkbox" 
                           ${settings.connectionLines ? 'checked' : ''}>
                    <label for="particle-connections">Show Connections</label>
                </div>
            </div>
        `;
        
        // Add event listeners
        const interactiveCheckbox = optionsSection.querySelector('#particle-interactive');
        interactiveCheckbox.addEventListener('change', e => {
            settings.interactive = e.target.checked;
            if (changeCallback) changeCallback(settings);
        });
        
        const connectionsCheckbox = optionsSection.querySelector('#particle-connections');
        connectionsCheckbox.addEventListener('change', e => {
            settings.connectionLines = e.target.checked;
            if (changeCallback) changeCallback(settings);
        });
        
        container.appendChild(optionsSection);
    },
    
    // Create settings UI for waveform effect
    createWaveformSettings: function(container, settings, changeCallback) {
        // Main settings section
        const mainSection = document.createElement('div');
        mainSection.className = 'settings-section';
        mainSection.innerHTML = `
            <div class="settings-section-title">Waveform Settings</div>
            
            <div class="setting-row">
                <div class="setting-label">Sensitivity</div>
                <div class="setting-control ve-slider-container">
                    <input type="range" id="waveform-sensitivity" class="ve-slider" 
                           min="0.1" max="3.0" step="0.1" value="${settings.sensitivity}">
                    <span id="waveform-sensitivity-value" class="ve-slider-value">${settings.sensitivity.toFixed(1)}</span>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Line Width</div>
                <div class="setting-control ve-slider-container">
                    <input type="range" id="waveform-linewidth" class="ve-slider" 
                           min="1" max="10" step="1" value="${settings.lineWidth}">
                    <span id="waveform-linewidth-value" class="ve-slider-value">${settings.lineWidth}</span>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Waveform Color</div>
                <div class="setting-control ve-color-container">
                    <div class="ve-color-display" id="waveform-color-display" style="background-color: ${settings.color}"></div>
                    <input type="color" id="waveform-color" class="ve-color-picker" value="${settings.color}">
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Background Color</div>
                <div class="setting-control ve-color-container">
                    <div class="ve-color-display" id="waveform-bg-display" style="background-color: ${settings.backgroundColor}"></div>
                    <input type="color" id="waveform-bg" class="ve-color-picker" value="${settings.backgroundColor}">
                </div>
            </div>
        `;
        
        // Add event listeners
        const sensitivitySlider = mainSection.querySelector('#waveform-sensitivity');
        const sensitivityValue = mainSection.querySelector('#waveform-sensitivity-value');
        
        sensitivitySlider.addEventListener('input', e => {
            const value = parseFloat(e.target.value);
            settings.sensitivity = value;
            sensitivityValue.textContent = value.toFixed(1);
        });
        
        sensitivitySlider.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        const lineWidthSlider = mainSection.querySelector('#waveform-linewidth');
        const lineWidthValue = mainSection.querySelector('#waveform-linewidth-value');
        
        lineWidthSlider.addEventListener('input', e => {
            const value = parseInt(e.target.value);
            settings.lineWidth = value;
            lineWidthValue.textContent = value;
        });
        
        lineWidthSlider.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        const colorPicker = mainSection.querySelector('#waveform-color');
        const colorDisplay = mainSection.querySelector('#waveform-color-display');
        
        colorPicker.addEventListener('input', e => {
            settings.color = e.target.value;
            colorDisplay.style.backgroundColor = e.target.value;
        });
        
        colorPicker.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        const bgPicker = mainSection.querySelector('#waveform-bg');
        const bgDisplay = mainSection.querySelector('#waveform-bg-display');
        
        bgPicker.addEventListener('input', e => {
            settings.backgroundColor = e.target.value;
            bgDisplay.style.backgroundColor = e.target.value;
        });
        
        bgPicker.addEventListener('change', e => {
            if (changeCallback) changeCallback(settings);
        });
        
        container.appendChild(mainSection);
        
        // Options section
        const optionsSection = document.createElement('div');
        optionsSection.className = 'settings-section';
        optionsSection.innerHTML = `
            <div class="settings-section-title">Display Options</div>
            
            <div class="setting-row">
                <div class="setting-label">Symmetrical</div>
                <div class="setting-control">
                    <input type="checkbox" id="waveform-symmetrical" class="ve-checkbox" 
                           ${settings.symmetrical ? 'checked' : ''}>
                    <label for="waveform-symmetrical">Mirror Display</label>
                </div>
            </div>
            
            <div class="setting-row">
                <div class="setting-label">Style</div>
                <div class="setting-control">
                    <select id="waveform-style" class="ve-select">
                        <option value="line" ${settings.style === 'line' ? 'selected' : ''}>Line</option>
                        <option value="bar" ${settings.style === 'bar' ? 'selected' : ''}>Bars</option>
                        <option value="circle" ${settings.style === 'circle' ? 'selected' : ''}>Circle</option>
                    </select>
                </div>
            </div>
        `;
        
        // Add event listeners
        const symmetricalCheckbox = optionsSection.querySelector('#waveform-symmetrical');
        symmetricalCheckbox.addEventListener('change', e => {
            settings.symmetrical = e.target.checked;
            if (changeCallback) changeCallback(settings);
        });
        
        const styleSelect = optionsSection.querySelector('#waveform-style');
        styleSelect.addEventListener('change', e => {
            settings.style = e.target.value;
            if (changeCallback) changeCallback(settings);
        });
        
        container.appendChild(optionsSection);
    },
    
    // Create settings UI for retro sun effect
    createRetroSunSettings: function(container, settings, changeCallback) {
        // Colors section
        const colorsSection = document.createElement('div');
        colorsSection.className = 'settings-section';
        colorsSection.innerHTML = `
            <div class="settings-section-title">Colors</div>
            
            <div class="setting-row">
                <div class