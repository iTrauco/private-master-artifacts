# SVG Overlay Implementation Plan

## 1. Directory Structure

```
server/
  ├── routes/
  │   ├── api/
  │   │   └── svg.js          # SVG-specific API endpoints
  │   └── pages.js           # Add route for SVG page
  └── utils/
      └── svg/               # SVG utility functions
          └── scanner.js     # Directory scanning functions

public/
  ├── css/
  │   └── svg/
  │       ├── base.css       # Base styles for SVG feature
  │       ├── controls.css   # Styles for SVG controls
  │       ├── quadrants.css  # Styles for quadrant grid
  │       └── drag.css       # Styles for drag functionality
  ├── js/
  │   └── svg/
  │       ├── services/
  │       │   ├── svg-service.js     # SVG management service
  │       │   └── drag-manager.js    # Drag functionality service 
  │       └── controllers/
  │           └── svg-controller.js  # Main controller for SVG UI
  └── pages/
      └── svg/
          └── index.html     # SVG page HTML
```

## 2. Server-Side Components

### 2.1 Page Route Addition

Add to `server/routes/pages.js`:

```javascript
// SVG Overlay route
router.get('/svg', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/pages/svg/index.html'));
});
```

### 2.2 API Endpoints

Create `server/routes/api/svg.js`:

```javascript
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Get list of SVG files from directory
router.get('/list', (req, res) => {
  const svgDir = path.join(__dirname, '../../../public/assets/svgs');
  
  // Simple directory scanner (can be expanded later)
  fs.readdir(svgDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read SVG directory' });
    }
    
    // Filter for SVG files
    const svgFiles = files
      .filter(file => file.toLowerCase().endsWith('.svg'))
      .map(file => ({
        id: file.replace('.svg', ''),
        name: file,
        path: `/assets/svgs/${file}`
      }));
    
    res.json(svgFiles);
  });
});

module.exports = router;
```

Update `server/server.js` to include the new route:

```javascript
// Add this line with the other route imports
const svgApiRoutes = require('./routes/api/svg');

// Add this line with the other app.use statements
app.use('/api/svg', svgApiRoutes);
```

## 3. Client-Side Components

### 3.1 HTML Structure

Create `public/pages/svg/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SVG Overlay - OBS Hardware Overlay</title>
  
  <!-- Base styles -->
  <link rel="stylesheet" href="../../css/base/reset.css">
  <link rel="stylesheet" href="../../css/base/global.css">
  
  <!-- Navigation styles -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
  
  <!-- SVG-specific styles -->
  <link rel="stylesheet" href="../../css/svg/base.css">
  <link rel="stylesheet" href="../../css/svg/controls.css">
  <link rel="stylesheet" href="../../css/svg/quadrants.css">
  <link rel="stylesheet" href="../../css/svg/drag.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="main-nav">
    <ul>
      <li><a href="#" onclick="navigateTo('/')">Dashboard</a></li>
      <li><a href="#" onclick="navigateTo('/cpu')">CPU Stats</a></li>
      <li><a href="#" onclick="navigateTo('/gpu')">GPU Stats</a></li>
      <li><a href="#" onclick="navigateTo('/system')">System Info</a></li>
      <li><a href="#" class="active" onclick="navigateTo('/svg')">SVG Overlay</a></li>
      <li><a href="#" onclick="navigateTo('/settings')">Settings</a></li>
    </ul>
  </nav>
  
  <div class="container">
    <!-- Close button for navigation -->
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
    
    <!-- SVG Control Panel -->
    <div id="svg-control-panel" class="svg-control-panel">
      <h3>SVG Overlay Controls</h3>
      
      <!-- SVG File Selection -->
      <div class="control-section">
        <h4>SVG Files</h4>
        <div id="svg-file-list" class="svg-file-list">
          <!-- SVG files will be loaded here -->
          <div class="empty-state">No SVG files loaded</div>
        </div>
        <button id="load-svgs-btn" class="action-button">Load SVGs</button>
      </div>
      
      <!-- Active SVG Management -->
      <div class="control-section">
        <h4>Active SVGs</h4>
        <div id="active-svg-table" class="active-svg-table-container">
          <div class="empty-state">No active SVGs</div>
        </div>
        <div class="drag-controls">
          <button id="enable-drag-mode" class="action-button">Enable Drag Mode</button>
        </div>
      </div>
    </div>
    
    <!-- Main Content with Quadrants -->
    <div id="main-content" class="main-content">
      <div id="quadrant-grid" class="quadrant-grid">
        <div id="quadrant-1" class="quadrant" data-quadrant="1">1</div>
        <div id="quadrant-2" class="quadrant" data-quadrant="2">2</div>
        <div id="quadrant-3" class="quadrant" data-quadrant="3">3</div>
        <div id="quadrant-4" class="quadrant" data-quadrant="4">4</div>
      </div>
      
      <!-- Fullscreen Container -->
      <div id="fullscreen-container" class="fullscreen-container hidden"></div>
    </div>
  </div>
  
  <!-- Core Scripts -->
  <script src="../../js/navigation.js"></script>
  
  <!-- SVG Module Scripts (loaded as modules) -->
  <script type="module" src="../../js/svg/controllers/svg-controller.js"></script>
</body>
</html>
```

### 3.2 CSS Styles

Create `public/css/svg/base.css`:

```css
/* Base styles for SVG overlay feature */

/* SVG page layout */
.container {
  margin-top: 60px;
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: visible;
}

/* Main content area */
.main-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  overflow: visible;
}

/* Control panel */
.svg-control-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 280px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(0, 170, 255, 0.7);
  border-radius: 8px;
  padding: 15px;
  color: white;
  z-index: 1000;
}

/* Section containers */
.control-section {
  margin-bottom: 15px;
  background: rgba(20, 24, 32, 0.5);
  border-radius: 5px;
  padding: 10px;
}

/* Empty state messages */
.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
}

/* Action buttons */
.action-button {
  background: rgba(0, 140, 210, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  margin-top: 10px;
  cursor: pointer;
  width: 100%;
}

.action-button:hover {
  background: rgba(0, 170, 255, 0.9);
}
```

Create `public/css/svg/controls.css`:

```css
/* SVG Controls Styles */

/* SVG file list */
.svg-file-list {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(30, 34, 42, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
  margin-top: 10px;
}

.svg-file-item {
  padding: 6px 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.svg-file-item:hover {
  background: rgba(0, 170, 255, 0.3);
}

.svg-file-item.selected {
  background: rgba(0, 170, 255, 0.5);
}

/* Active SVG table */
.active-svg-table-container {
  margin-top: 10px;
  background: rgba(30, 34, 42, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
}

.active-svg-table {
  width: 100%;
  border-collapse: collapse;
}

.active-svg-table th,
.active-svg-table td {
  padding: 6px;
  text-align: left;
  border-bottom: 1px solid #444;
}

.active-svg-table th {
  background: rgba(50, 54, 62, 0.8);
}

/* SVG action buttons */
.svg-actions {
  display: flex;
  gap: 5px;
}

.svg-action-btn {
  background: rgba(60, 70, 100, 0.7);
  color: white;
  border: none;
  border-radius: 3px;
  padding: 3px 5px;
  cursor: pointer;
  font-size: 11px;
}

.svg-action-btn.toggle {
  background: rgba(70, 100, 180, 0.7);
}

.svg-action-btn.fullscreen {
  background: rgba(70, 150, 70, 0.7);
}

.svg-action-btn.remove {
  background: rgba(150, 70, 70, 0.7);
}

.svg-action-btn:hover {
  opacity: 0.8;
}
```

Create `public/css/svg/quadrants.css`:

```css
/* Quadrant Grid Styles */

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

.quadrant.has-svg {
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

/* SVG container in quadrants */
.svg-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 30;
}

.svg-container svg {
  max-width: 90%;
  max-height: 90%;
  width: auto;
  height: auto;
}

/* Fullscreen container */
.fullscreen-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fullscreen-container.hidden {
  display: none;
}

/* Fullscreen close button */
.fullscreen-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: white;
  cursor: pointer;
  z-index: 910;
}
```

Create `public/css/svg/drag.css`:

```css
/* Drag Functionality Styles */

/* Drag mode global state */
body.drag-mode-active .quadrant {
  border: 2px dashed rgba(255, 215, 0, 0.5);
  background-color: rgba(0, 0, 0, 0.05);
}

/* Draggable elements */
.svg-container.draggable {
  position: absolute !important;
  cursor: move;
  border: 2px solid gold;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  z-index: 500;
  transition: box-shadow 0.3s;
}

/* Active dragging state */
.svg-container.dragging {
  box-shadow: 0 0 20px rgba(255, 165, 0, 0.8);
  opacity: 0.9;
  z-index: 1000;
}

/* Draggable table styles */
tr.draggable-enabled {
  background-color: rgba(255, 215, 0, 0.15);
}

/* Drag controls */
.drag-controls {
  margin-top: 10px;
  text-align: center;
}

#enable-drag-mode {
  transition: background-color 0.3s;
}

body.drag-mode-active #enable-drag-mode {
  background-color: #ff8c00;
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
}
```

### 3.3 JavaScript Service Modules

Create `public/js/svg/services/svg-service.js`:

```javascript
/**
 * SVG Service - Handles loading and management of SVGs
 */
export class SvgService {
  constructor() {
    this.svgFiles = [];
    this.activeSvgs = [];
    this.eventListeners = {};
  }

  /**
   * Initialize the SVG service
   */
  init() {
    console.log('SVG Service initialized');
    return true;
  }

  /**
   * Load SVG files from the server
   * @returns {Promise<Array>} Array of SVG file objects
   */
  async loadSvgFiles() {
    try {
      const response = await fetch('/api/svg/list');
      if (!response.ok) {
        throw new Error('Failed to load SVGs');
      }
      
      this.svgFiles = await response.json();
      this.dispatchEvent('svgFilesLoaded', this.svgFiles);
      
      return this.svgFiles;
    } catch (error) {
      console.error('Error loading SVG files:', error);
      return [];
    }
  }

  /**
   * Display an SVG in a quadrant
   * @param {string} svgId - ID of SVG to display
   * @param {number} quadrant - Quadrant number (1-4)
   * @returns {Object} The active SVG instance object
   */
  displaySvgInQuadrant(svgId, quadrant) {
    const svg = this.svgFiles.find(file => file.id === svgId);
    if (!svg) return null;

    // Remove any existing SVG from this quadrant
    this.removeSvgFromQuadrant(quadrant);
    
    // Create a new SVG instance
    const instanceId = `svg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const svgInstance = {
      id: instanceId,
      sourceId: svg.id,
      name: svg.name,
      path: svg.path,
      quadrant,
      fullScreen: false,
      visible: true,
      draggable: false
    };
    
    // Add to active SVGs
    this.activeSvgs.push(svgInstance);
    
    // Create the SVG element
    this.createSvgElement(svgInstance);
    
    // Dispatch event
    this.dispatchEvent('svgDisplayed', svgInstance);
    
    return svgInstance;
  }

  /**
   * Remove SVG from a quadrant
   * @param {number} quadrant - Quadrant number
   */
  removeSvgFromQuadrant(quadrant) {
    const svgInstance = this.activeSvgs.find(
      svg => svg.quadrant === quadrant && !svg.fullScreen
    );
    
    if (svgInstance) {
      // Remove from DOM
      const container = document.querySelector(
        `.svg-container[data-instance-id="${svgInstance.id}"]`
      );
      if (container) container.remove();
      
      // Remove from active SVGs
      this.activeSvgs = this.activeSvgs.filter(svg => svg.id !== svgInstance.id);
      
      // Dispatch event
      this.dispatchEvent('svgRemoved', { 
        id: svgInstance.id, 
        quadrant 
      });
    }
  }

  /**
   * Display SVG in fullscreen
   * @param {string} svgId - ID of SVG to display
   * @returns {Object} The active SVG instance object
   */
  displayInFullscreen(svgId) {
    const svg = this.svgFiles.find(file => file.id === svgId);
    if (!svg) return null;

    // Remove any existing fullscreen SVG
    this.removeFullscreenSvg();
    
    // Create a new SVG instance
    const instanceId = `fullscreen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const svgInstance = {
      id: instanceId,
      sourceId: svg.id,
      name: svg.name,
      path: svg.path,
      quadrant: null,
      fullScreen: true,
      visible: true,
      draggable: false
    };
    
    // Add to active SVGs
    this.activeSvgs.push(svgInstance);
    
    // Show fullscreen container
    const fullscreenContainer = document.getElementById('fullscreen-container');
    if (fullscreenContainer) {
      fullscreenContainer.classList.remove('hidden');
    }
    
    // Create the SVG element
    this.createSvgElement(svgInstance, fullscreenContainer);
    
    // Dispatch event
    this.dispatchEvent('svgDisplayed', svgInstance);
    
    return svgInstance;
  }

  /**
   * Remove fullscreen SVG
   */
  removeFullscreenSvg() {
    const svgInstance = this.activeSvgs.find(svg => svg.fullScreen);
    
    if (svgInstance) {
      // Remove from DOM
      const container = document.querySelector(
        `.svg-container[data-instance-id="${svgInstance.id}"]`
      );
      if (container) container.remove();
      
      // Remove from active SVGs
      this.activeSvgs = this.activeSvgs.filter(svg => svg.id !== svgInstance.id);
      
      // Hide fullscreen container
      const fullscreenContainer = document.getElementById('fullscreen-container');
      if (fullscreenContainer) {
        fullscreenContainer.classList.add('hidden');
      }
      
      // Dispatch event
      this.dispatchEvent('svgRemoved', { 
        id: svgInstance.id, 
        fullScreen: true 
      });
    }
  }

  /**
   * Toggle SVG visibility
   * @param {string} instanceId - SVG instance ID
   * @param {boolean} visible - Visibility state
   */
  toggleSvgVisibility(instanceId, visible) {
    const svgInstance = this.activeSvgs.find(svg => svg.id === instanceId);
    if (!svgInstance) return;
    
    // Update state
    svgInstance.visible = visible;
    
    // Update DOM
    const container = document.querySelector(
      `.svg-container[data-instance-id="${instanceId}"]`
    );
    if (container) {
      container.style.display = visible ? 'flex' : 'none';
    }
    
    // Dispatch event
    this.dispatchEvent('svgVisibilityChanged', {
      id: instanceId,
      visible
    });
  }

  /**
   * Create SVG element in the DOM
   * @param {Object} svgInstance - SVG instance object
   * @param {HTMLElement} parentContainer - Optional parent container
   */
  async createSvgElement(svgInstance, parentContainer = null) {
    // Determine container
    let container;
    if (svgInstance.fullScreen) {
      container = parentContainer || document.getElementById('fullscreen-container');
    } else {
      container = parentContainer || document.getElementById(`quadrant-${svgInstance.quadrant}`);
    }
    
    if (!container) return;
    
    // Add has-svg class to quadrant
    if (!svgInstance.fullScreen) {
      container.classList.add('has-svg');
    }
    
    // Create SVG container
    const svgContainer = document.createElement('div');
    svgContainer.className = 'svg-container';
    svgContainer.dataset.instanceId = svgInstance.id;
    
    // Optional: Add close button for fullscreen
    if (svgInstance.fullScreen) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'fullscreen-close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.onclick = () => this.removeFullscreenSvg();
      svgContainer.appendChild(closeBtn);
    }
    
    // Load SVG content (simplified for skeleton)
    try {
      const response = await fetch(svgInstance.path);
      if (!response.ok) throw new Error('Failed to load SVG');
      
      const svgContent = await response.text();
      svgContainer.innerHTML += svgContent;
      
      // Adjust SVG element styling
      const svgElement = svgContainer.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '90%';
        svgElement.style.maxHeight = '90%';
        svgElement.style.width = 'auto';
        svgElement.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error loading SVG content:', error);
      svgContainer.innerHTML += `<div class="svg-error">Error loading SVG</div>`;
    }
    
    // Add to DOM
    container.appendChild(svgContainer);
  }

  /**
   * Event system
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event]
      .filter(cb => cb !== callback);
  }
  
  dispatchEvent(event, data) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => callback(data));
  }
}

// Export a singleton instance
export default new SvgService();
```

Create `public/js/svg/services/drag-manager.js`:

```javascript
/**
 * Drag Manager Service - Handles draggable SVG elements
 */
export class DragManager {
  constructor() {
    this.dragEnabled = false;
    this.draggableElements = new Map();
    this.isDragging = false;
    this.currentElement = null;
    this.eventListeners = {};
    
    // Bind methods to maintain 'this' context
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  /**
   * Initialize the drag manager
   */
  init() {
    console.log('Drag Manager initialized');
    return true;
  }

  /**
   * Enable drag mode
   */
  enableDragMode() {
    this.dragEnabled = true;
    document.body.classList.add('drag-mode-active');
    
    // Enable all registered draggable elements
    this.draggableElements.forEach((config, elementId) => {
      const element = document.querySelector(`[data-instance-id="${elementId}"]`);
      if (element && config.draggable) {
        this.applyDraggable(element);
      }
    });
    
    this.dispatchEvent('dragModeChanged', { enabled: true });
  }

  /**
   * Disable drag mode
   */
  disableDragMode() {
    this.dragEnabled = false;
    document.body.classList.remove('drag-mode-active');
    
    // Disable all draggable elements
    this.draggableElements.forEach((config, elementId) => {
      const element = document.querySelector(`[data-instance-id="${elementId}"]`);
      if (element) {
        this.removeDraggableFeatures(element);
      }
    });
    
    this.dispatchEvent('dragModeChanged', { enabled: false });
  }

  /**
   * Toggle drag mode
   */
  toggleDragMode() {
    if (this.dragEnabled) {
      this.disableDragMode();
    } else {
      this.enableDragMode();
    }
  }

  /**
   * Make an element draggable
   * @param {string} elementId - Element ID to make draggable
   * @param {Object} config - Configuration options
   */
  makeDraggable(elementId, config = {}) {
    const defaultConfig = {
      draggable: true,
      containerId: 'main-content'
    };
    
    const mergedConfig = { ...defaultConfig, ...config };
    
    // Store configuration
    this.draggableElements.set(elementId, mergedConfig);
    
    // If drag mode is enabled, apply draggable features
    if (this.dragEnabled && mergedConfig.draggable) {
      const element = document.querySelector(`[data-instance-id="${elementId}"]`);
      if (element) {
        this.applyDraggable(element);
      }
    }
    
    return mergedConfig;
  }

  /**
   * Remove draggable functionality from an element
   * @param {string} elementId - Element ID to remove draggable from
   */
  removeDraggable(elementId) {
    // Remove from registry
    this.draggableElements.delete(elementId);
    
    // Remove features from DOM
    const element = document.querySelector(`[data-instance-id="${elementId}"]`);
    if (element) {
      this.removeDraggableFeatures(element);
    }
  }

  /**
   * Apply draggable features to an element
   * @param {HTMLElement} element - Element to make draggable
   */
  applyDraggable(element) {
    // Add draggable class
    element.classList.add('draggable');
    
    // Ensure element has a position style
    if (element.style.position !== 'absolute') {
      const rect = element.getBoundingClientRect();
      element.style.position = 'absolute';
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
    }
    
    // CRITICAL: Move to main-content if not already a direct child
    // This ensures it can move freely anywhere in the window
    const mainContent = document.getElementById('main-content');
    if (mainContent && element.parentElement !== mainContent) {
      // Store original parent and position
      element.dataset.originalParent = element.parentElement.id;
      
      // Calculate position relative to main content
      const mainRect = mainContent.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      
      // Move to main content
      mainContent.appendChild(element);
      
      // Adjust position to maintain visual location
      element.style.left = `${elemRect.left - mainRect.left}px`;
      element.style.top = `${elemRect.top - mainRect.top}px`;
    }
    
    // Add event listener
    element.addEventListener('mousedown', this.handleMouseDown);
  }

  /**
   * Remove draggable features from an element
   * @param {HTMLElement} element - Element to remove draggable from
   */
  removeDraggableFeatures(element) {
    // Remove draggable classes
    element.classList.remove('draggable');
    element.classList.remove('dragging');
    
    // Remove event listener
    element.removeEventListener('mousedown', this.handleMouseDown);
    
    // Optional: Return to original parent if needed
    if (element.dataset.originalParent) {
      const originalParent = document.getElementById(element.dataset.originalParent);
      if (originalParent) {
        // Store position for later reference
        const position = {
          left: element.style.left,
          top: element.style.top
        };
        element.dataset.lastPosition = JSON.stringify(position);
        
        // Move back to original parent
        originalParent.appendChild(element);
        
        // Reset positioning
        element.style.position = 'relative';
        element.style.left = '0';
        element.style.top = '0';
        
        // Clean up dataset
        delete element.dataset.originalParent;
      }
    }
  }

  /**
   * Handle mouse down on draggable element
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseDown(e) {
    if (!this.dragEnabled || e.button !== 0) return;
    
    e.preventDefault();
    
    const element = e.currentTarget;
    
    // Add dragging class
    element.classList.add('dragging');
    
    // Store reference to current element
    this.currentElement = element;
    this.isDragging = true;
    
    // Calculate offset (where in the element the user clicked)
    const rect = element.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Store drag data
    this.dragData = {
      element,
      offsetX,
      offsetY,
      startX: e.clientX,
      startY: e.clientY,
      originalZIndex: element.style.zIndex
    };
    
    // Set higher z-index during drag
    element.style.zIndex = '1000';
    
    // Set up global mouse move and up handlers
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    this.dispatchEvent('dragStarted', {
      elementId: element.dataset.instanceId,
      position: { x: rect.left, y: rect.top }
    });
  }

  /**
   * Handle mouse move during drag
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    if (!this.isDragging || !this.currentElement) return;
    
    e.preventDefault();
    
    const { offsetX, offsetY } = this.dragData;
    
    // Calculate new position
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Apply new position
    this.currentElement.style.left = `${x}px`;
    this.currentElement.style.top = `${y}px`;
    
    this.dispatchEvent('dragMoved', {
      elementId: this.currentElement.dataset.instanceId,
      position: { x, y }
    });
  }

  /**
   * Handle mouse up to end dragging
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseUp(e) {
    if (!this.isDragging || !this.currentElement) return;
    
    e.preventDefault();
    
    // Remove dragging class
    this.currentElement.classList.remove('dragging');
    
    // Restore original z-index
    this.currentElement.style.zIndex = this.dragData.originalZIndex || '100';
    
    // Get final position
    const rect = this.currentElement.getBoundingClientRect();
    
    this.dispatchEvent('dragEnded', {
      elementId: this.currentElement.dataset.instanceId,
      position: { x: rect.left, y: rect.top }
    });
    
    // Clean up
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    this.isDragging = false;
    this.currentElement = null;
    this.dragData = null;
  }

  /**
   * Event system
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event]
      .filter(cb => cb !== callback);
  }
  
  dispatchEvent(event, data) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => callback(data));
  }
}

// Export a singleton instance
export default new DragManager();
```

### 3.4 JavaScript Controller Module

Create `public/js/svg/controllers/svg-controller.js`:

```javascript
/**
 * SVG Controller - Main controller for the SVG overlay feature
 */
import svgService from '../services/svg-service.js';
import dragManager from '../services/drag-manager.js';

class SvgController {
  constructor() {
    // Element references
    this.svgFileList = null;
    this.activeSvgTable = null;
    this.loadSvgsBtn = null;
    this.enableDragModeBtn = null;
    
    // State
    this.selectedSvgId = null;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
    this.renderSvgFiles = this.renderSvgFiles.bind(this);
    this.renderActiveSvgs = this.renderActiveSvgs.bind(this);
    this.handleSvgSelection = this.handleSvgSelection.bind(this);
    this.handleQuadrantClick = this.handleQuadrantClick.bind(this);
    this.handleDragModeToggle = this.handleDragModeToggle.bind(this);
  }

  /**
   * Initialize the controller
   */
  async init() {
    console.log('Initializing SVG Controller');
    
    // Get DOM elements
    this.svgFileList = document.getElementById('svg-file-list');
    this.activeSvgTable = document.getElementById('active-svg-table');
    this.loadSvgsBtn = document.getElementById('load-svgs-btn');
    this.enableDragModeBtn = document.getElementById('enable-drag-mode');
    
    // Initialize services
    await svgService.init();
    await dragManager.init();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load SVG files initially
    await this.loadSvgFiles();
    
    console.log('SVG Controller initialized successfully');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Load SVGs button
    if (this.loadSvgsBtn) {
      this.loadSvgsBtn.addEventListener('click', () => this.loadSvgFiles());
    }
    
    // Enable drag mode button
    if (this.enableDragModeBtn) {
      this.enableDragModeBtn.addEventListener('click', this.handleDragModeToggle);
    }
    
    // Quadrant click events
    for (let i = 1; i <= 4; i++) {
      const quadrant = document.getElementById(`quadrant-${i}`);
      if (quadrant) {
        quadrant.addEventListener('click', e => this.handleQuadrantClick(e, i));
      }
    }
    
    // Service events
    svgService.addEventListener('svgFilesLoaded', this.renderSvgFiles);
    svgService.addEventListener('svgDisplayed', this.renderActiveSvgs);
    svgService.addEventListener('svgRemoved', this.renderActiveSvgs);
    svgService.addEventListener('svgVisibilityChanged', this.renderActiveSvgs);
    
    dragManager.addEventListener('dragModeChanged', (data) => {
      if (this.enableDragModeBtn) {
        this.enableDragModeBtn.textContent = data.enabled 
          ? 'Disable Drag Mode' 
          : 'Enable Drag Mode';
      }
    });
  }

  /**
   * Load SVG files
   */
  async loadSvgFiles() {
    if (this.loadSvgsBtn) {
      this.loadSvgsBtn.disabled = true;
      this.loadSvgsBtn.textContent = 'Loading...';
    }
    
    await svgService.loadSvgFiles();
    
    if (this.loadSvgsBtn) {
      this.loadSvgsBtn.disabled = false;
      this.loadSvgsBtn.textContent = 'Load SVGs';
    }
  }

  /**
   * Render SVG files in the list
   * @param {Array} files - SVG files
   */
  renderSvgFiles(files) {
    if (!this.svgFileList) return;
    
    if (!files || files.length === 0) {
      this.svgFileList.innerHTML = '<div class="empty-state">No SVG files found</div>';
      return;
    }
    
    let html = '';
    files.forEach(file => {
      const isSelected = file.id === this.selectedSvgId;
      html += `
        <div class="svg-file-item ${isSelected ? 'selected' : ''}" 
             data-svg-id="${file.id}" 
             onclick="window.svgController.handleSvgSelection('${file.id}')">
          ${file.name}
        </div>
      `;
    });
    
    this.svgFileList.innerHTML = html;
  }

  /**
   * Render active SVGs in the table
   */
  renderActiveSvgs() {
    if (!this.activeSvgTable) return;
    
    const activeSvgs = svgService.activeSvgs;
    
    if (!activeSvgs || activeSvgs.length === 0) {
      this.activeSvgTable.innerHTML = '<div class="empty-state">No active SVGs</div>';
      return;
    }
    
    let html = `
      <table class="active-svg-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Draggable</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    activeSvgs.forEach(svg => {
      const locationText = svg.fullScreen ? 'Full' : `Q${svg.quadrant}`;
      const visibilityIcon = svg.visible ? '👁️' : '👁️‍🗨️';
      const isDraggable = svg.draggable ? 'draggable-enabled' : '';
      
      html += `
        <tr data-svg-id="${svg.id}" class="${isDraggable}">
          <td>${svg.name}</td>
          <td>${locationText}</td>
          <td>
            <input type="checkbox" 
                   ${svg.draggable ? 'checked' : ''} 
                   onchange="window.svgController.handleDraggableToggle('${svg.id}', this.checked)">
          </td>
          <td>
            <div class="svg-actions">
              <button class="svg-action-btn toggle" 
                      onclick="window.svgController.handleVisibilityToggle('${svg.id}', ${!svg.visible})" 
                      title="${svg.visible ? 'Hide' : 'Show'}">
                ${visibilityIcon}
              </button>
              <button class="svg-action-btn fullscreen"
                      onclick="window.svgController.handleFullscreenDisplay('${svg.sourceId}')"
                      title="Fullscreen">
                🔍
              </button>
              <button class="svg-action-btn remove"
                      onclick="window.svgController.handleRemoveSvg('${svg.id}')"
                      title="Remove">
                ❌
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    this.activeSvgTable.innerHTML = html;
  }

  /**
   * Handle SVG selection
   * @param {string} svgId - SVG ID
   */
  handleSvgSelection(svgId) {
    this.selectedSvgId = svgId;
    this.renderSvgFiles(svgService.svgFiles);
  }

  /**
   * Handle quadrant click
   * @param {Event} event - Click event
   * @param {number} quadrant - Quadrant number
   */
  handleQuadrantClick(event, quadrant) {
    // Only proceed if we have a selected SVG
    if (!this.selectedSvgId) return;
    
    // Display the selected SVG in this quadrant
    svgService.displaySvgInQuadrant(this.selectedSvgId, quadrant);
  }

  /**
   * Handle drag mode toggle
   */
  handleDragModeToggle() {
    dragManager.toggleDragMode();
  }

  /**
   * Handle draggable toggle
   * @param {string} svgId - SVG ID
   * @param {boolean} draggable - Draggable state
   */
  handleDraggableToggle(svgId, draggable) {
    // Update SVG state
    const svg = svgService.activeSvgs.find(s => s.id === svgId);
    if (svg) {
      svg.draggable = draggable;
    }
    
    // Update drag manager
    if (draggable) {
      dragManager.makeDraggable(svgId);
    } else {
      dragManager.removeDraggable(svgId);
    }
    
    // Re-render
    this.renderActiveSvgs();
  }

  /**
   * Handle visibility toggle
   * @param {string} svgId - SVG ID
   * @param {boolean} visible - Visibility state
   */
  handleVisibilityToggle(svgId, visible) {
    svgService.toggleSvgVisibility(svgId, visible);
  }

  /**
   * Handle fullscreen display
   * @param {string} sourceId - Source SVG ID
   */
  handleFullscreenDisplay(sourceId) {
    svgService.displayInFullscreen(sourceId);
  }

  /**
   * Handle SVG removal
   * @param {string} svgId - SVG ID
   */
  handleRemoveSvg(svgId) {
    const svg = svgService.activeSvgs.find(s => s.id === svgId);
    if (!svg) return;
    
    if (svg.fullScreen) {
      svgService.removeFullscreenSvg();
    } else if (svg.quadrant) {
      svgService.removeSvgFromQuadrant(svg.quadrant);
    }
  }
}

// Create and export a singleton instance
const svgController = new SvgController();

// Make it available globally for event handlers in HTML
window.svgController = svgController;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', svgController.init);

export default svgController;
```

## 4. Integration with Main Application

### 4.1 Navigation Updates

Make sure the SVG page is included in the main navigation of existing pages. For each page, add this line in the navigation list:

```html
<li><a href="#" onclick="navigateTo('/svg')">SVG Overlay</a></li>
```

### 4.2 Assets Directory

Create a directory for storing SVG files:

```
public/assets/svgs/
```

You can place some sample SVG files here for testing purposes.

## 5. Implementation Steps

1. **Directory Setup**:
   - Create all the directory structures as outlined
   - Set up CSS and JavaScript file templates

2. **Server-Side Implementation**:
   - Add the SVG page route to `pages.js`
   - Create the SVG API endpoints
   - Update server.js to include the new routes

3. **Client-Side Development**:
   - Create the HTML page with all required elements
   - Implement the CSS styles for the interface
   - Develop the JavaScript service modules
   - Build the controller module

4. **Integration**:
   - Update navigation in existing pages to include SVG route
   - Test navigation between pages

5. **Testing**:
   - Test SVG loading functionality
   - Verify quadrant placement
   - Ensure fullscreen mode works
   - Test SVG visibility toggling
   - Validate drag-and-drop functionality

## 6. Extending the Implementation

Once the basic skeleton is working, you can enhance it with:

1. **Additional SVG Sources**:
   - Add Git repository integration
   - Support loading from URL
   - Enable SVG upload

2. **Enhanced Drag Functionality**:
   - Add rotation and scaling
   - Support snap-to-grid
   - Implement constraints and boundaries

3. **Visual Effects**:
   - Add animations and transitions
   - Implement filters and effects
   - Support layer management

4. **State Persistence**:
   - Save configurations to localStorage
   - Export/import layouts
   - Preset management

This implementation plan provides a solid foundation for a modular SVG overlay feature that can be extended incrementally while maintaining clean separation from the rest of the application.
