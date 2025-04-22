# SVG Overlay Implementation - Phase 2 Technical Guide

## Overview
Phase 2 builds on the foundation established in Phase 1, focusing on the HTML structure and CSS styling for the SVG Overlay feature. We'll implement the quadrant grid system for SVG placement, create the control panel UI for SVG management, and set up the basic interaction elements.

## Directory Structure Updates
```
public/
  ├── css/
  │   └── svg/
  │       ├── base.css       # UPDATE: Expand base styles
  │       ├── controls.css   # NEW: Styles for SVG controls
  │       ├── quadrants.css  # NEW: Styles for quadrant grid
  │       └── drag.css       # NEW: Basic styles for drag functionality
  ├── js/
  │   └── svg/
  │       └── controllers/
  │           └── svg-controller.js  # NEW: Basic controller skeleton
  └── pages/
      └── svg/
          └── index.html     # UPDATE: Full implementation of SVG page
```

## Files to Create/Modify

### 1. HTML Structure

#### A. Update `public/pages/svg/index.html`
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

### 2. CSS Styles

#### A. Create/Update `public/css/svg/base.css`
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

#### B. Create `public/css/svg/controls.css`
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

#### C. Create `public/css/svg/quadrants.css`
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

#### D. Create `public/css/svg/drag.css`
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

### 3. JavaScript Controller Skeleton

#### A. Create `public/js/svg/controllers/svg-controller.js`
```javascript
/**
 * SVG Controller - Basic skeleton for the SVG overlay feature
 * This will be expanded in Phase 3 with full functionality
 */
class SvgController {
  constructor() {
    console.log('SVG Controller initialized (skeleton)');
    this.init();
  }

  /**
   * Initialize the controller
   */
  init() {
    // Get DOM elements
    this.svgFileList = document.getElementById('svg-file-list');
    this.activeSvgTable = document.getElementById('active-svg-table');
    this.loadSvgsBtn = document.getElementById('load-svgs-btn');
    this.enableDragModeBtn = document.getElementById('enable-drag-mode');
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Load SVGs button
    if (this.loadSvgsBtn) {
      this.loadSvgsBtn.addEventListener('click', () => {
        console.log('Load SVGs button clicked - functionality will be implemented in Phase 3');
        this.loadSampleData(); // Temporary for Phase 2 demo
      });
    }
    
    // Enable drag mode button
    if (this.enableDragModeBtn) {
      this.enableDragModeBtn.addEventListener('click', () => {
        console.log('Enable drag mode button clicked - functionality will be implemented in Phase 3');
        document.body.classList.toggle('drag-mode-active'); // Visual-only for Phase 2
      });
    }
    
    // Quadrant click events
    for (let i = 1; i <= 4; i++) {
      const quadrant = document.getElementById(`quadrant-${i}`);
      if (quadrant) {
        quadrant.addEventListener('click', () => {
          console.log(`Quadrant ${i} clicked - functionality will be implemented in Phase 3`);
        });
      }
    }
  }
  
  /**
   * Load sample data for Phase 2 demo
   * This is just for visual testing and will be replaced in Phase 3
   */
  loadSampleData() {
    // Display sample file list
    const files = [
      { id: 'sample1', name: 'sample1.svg' },
      { id: 'sample2', name: 'sample2.svg' },
      { id: 'logo', name: 'logo.svg' }
    ];
    
    let html = '';
    files.forEach(file => {
      html += `
        <div class="svg-file-item" data-svg-id="${file.id}">
          ${file.name}
        </div>
      `;
    });
    
    if (this.svgFileList) {
      this.svgFileList.innerHTML = html;
    }
    
    // Display sample active SVGs
    if (this.activeSvgTable) {
      this.activeSvgTable.innerHTML = `
        <table class="active-svg-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>sample1.svg</td>
              <td>Q1</td>
              <td>
                <div class="svg-actions">
                  <button class="svg-action-btn toggle">👁️</button>
                  <button class="svg-action-btn fullscreen">🔍</button>
                  <button class="svg-action-btn remove">❌</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `;
    }
  }
}

// Create and initialize controller
const svgController = new SvgController();

// Export for potential future use as a module
export default svgController;
```

## Manual Testing

Since this phase is primarily focused on UI components and structure, we'll rely on manual testing to verify functionality. Here are the test cases:

### Visual Layout Testing

1. **Test the SVG page loads correctly**
   - Navigate to `/svg` in the application
   - Verify that the navigation bar shows the SVG option as active
   - Verify that the control panel appears on the left side
   - Verify that the quadrant grid is visible

2. **Test the control panel structure**
   - Verify that the SVG Files section is visible
   - Verify that the Active SVGs section is visible
   - Verify that the buttons are styled correctly
   - Click the "Load SVGs" button and verify the sample data appears

3. **Test the quadrant grid layout**
   - Verify that the screen is divided into 4 equal quadrants
   - Verify that each quadrant has a different subtle background color
   - Verify that hovering over a quadrant highlights its border
   - Verify that the quadrant numbers (1-4) are visible

4. **Test the drag mode visual toggle**
   - Click the "Enable Drag Mode" button
   - Verify that the button changes color
   - Verify that the quadrant borders change to gold dashed lines
   - Click the button again to toggle off and verify it reverts

5. **Test responsive behavior**
   - Resize the window to different dimensions
   - Verify that the quadrant grid scales appropriately
   - Verify that the control panel remains accessible

## Code Standards

Follow these code standards for Phase 2:

1. **HTML Standards**
   - Use semantic HTML elements appropriately
   - Maintain consistent indentation (2 spaces)
   - Use descriptive IDs and classes
   - Keep proper nesting of elements

2. **CSS Standards**
   - Organize CSS logically by component
   - Use consistent naming conventions
   - Group related styles together
   - Add comments to explain complex styling
   - Use variables for common colors and values

3. **JavaScript Standards**
   - Follow ES6 class syntax
   - Add JSDoc comments for methods
   - Use meaningful variable and function names
   - Handle potential null/undefined DOM elements

## Implementation Steps

1. Create all CSS files with the provided code
2. Update the SVG page HTML with the full structure
3. Create the skeleton JavaScript controller
4. Test the page visually to verify layout and styling
5. Verify that basic interactions (button clicks) work
6. Make any necessary adjustments to the styling

## Success Criteria

Phase 2 is complete when:

1. The SVG page displays with proper layout and styling
2. The quadrant grid appears correctly
3. The control panel is properly positioned and styled
4. Sample data appears when clicking the "Load SVGs" button
5. The drag mode toggle changes the appearance of the page
6. No console errors appear during basic interactions

## Next Steps

After completing Phase 2, proceed to Phase 3, which will focus on implementing the SVG service to manage SVG files, display SVGs in quadrants, and handle basic SVG operations.
