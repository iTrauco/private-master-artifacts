# SVG Overlay Implementation - Phase 3 Technical Guide

## Overview
Phase 3 builds on the UI foundation established in Phase 2, focusing on implementing the core SVG service functionality. We'll create the SVG service module that manages loading, displaying, and manipulating SVG elements within the quadrant grid.

## Directory Structure Updates
```
public/
  ├── js/
  │   └── svg/
  │       ├── services/
  │       │   └── svg-service.js     # NEW: SVG management service
  │       └── controllers/
  │           └── svg-controller.js  # UPDATE: Enhanced with real functionality
```

## Files to Create/Modify

### 1. SVG Service Implementation

#### A. Create `public/js/svg/services/svg-service.js`
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
    
    // Load SVG content
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

### 2. Enhanced SVG Controller

#### A. Update `public/js/svg/controllers/svg-controller.js`
```javascript
/**
 * SVG Controller - Main controller for the SVG overlay feature
 */
import svgService from '../services/svg-service.js';

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
    
    // Initialize service
    await svgService.init();
    
    // Setup event listeners
    this.setupEventListeners();
    
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
      this.enableDragModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('drag-mode-active');
        this.enableDragModeBtn.textContent = 
          document.body.classList.contains('drag-mode-active')
            ? 'Disable Drag Mode'
            : 'Enable Drag Mode';
      });
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
      this.loadSvgsBtn.textContent = 'Reload SVGs';
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    activeSvgs.forEach(svg => {
      const locationText = svg.fullScreen ? 'Full' : `Q${svg.quadrant}`;
      const visibilityIcon = svg.visible ? '👁️' : '👁️‍🗨️';
      
      html += `
        <tr data-svg-id="${svg.id}">
          <td>${svg.name}</td>
          <td>${locationText}</td>
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

## Testing Plan

### 1. Unit Tests for SVG Service

Create `test/unit/svg/svg-service.test.js`:

```javascript
// test/unit/svg/svg-service.test.js
import { SvgService } from '../../../public/js/svg/services/svg-service';

// Mock fetch globally
global.fetch = jest.fn();

describe('SVG Service', () => {
  let svgService;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh instance
    svgService = new SvgService();
    
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="quadrant-1"></div>
      <div id="quadrant-2"></div>
      <div id="quadrant-3"></div>
      <div id="quadrant-4"></div>
      <div id="fullscreen-container" class="hidden"></div>
    `;
    
    // Mock fetch for SVG content
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/svg/list')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'svg1', name: 'svg1.svg', path: '/assets/svgs/svg1.svg' },
            { id: 'svg2', name: 'svg2.svg', path: '/assets/svgs/svg2.svg' }
          ])
        });
      } else if (url.includes('.svg')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('<svg width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>')
        });
      } else {
        return Promise.reject(new Error('Unknown URL'));
      }
    });
  });
  
  describe('init', () => {
    it('should initialize successfully', () => {
      const result = svgService.init();
      expect(result).toBe(true);
    });
  });
  
  describe('loadSvgFiles', () => {
    it('should load SVG files from the API', async () => {
      const files = await svgService.loadSvgFiles();
      
      expect(fetch).toHaveBeenCalledWith('/api/svg/list');
      expect(files).toHaveLength(2);
      expect(files[0].id).toBe('svg1');
      expect(svgService.svgFiles).toEqual(files);
    });
    
    it('should handle API errors', async () => {
      global.fetch.mockImplementationOnce(() => Promise.resolve({
        ok: false
      }));
      
      const files = await svgService.loadSvgFiles();
      
      expect(files).toEqual([]);
      expect(svgService.svgFiles).toEqual([]);
    });
    
    it('should dispatch an event when files are loaded', async () => {
      const mockCallback = jest.fn();
      svgService.addEventListener('svgFilesLoaded', mockCallback);
      
      await svgService.loadSvgFiles();
      
      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback.mock.calls[0][0]).toHaveLength(2);
    });
  });
  
  describe('displaySvgInQuadrant', () => {
    beforeEach(async () => {
      // Load SVG files first
      await svgService.loadSvgFiles();
    });
    
    it('should display an SVG in the specified quadrant', () => {
      const instance = svgService.displaySvgInQuadrant('svg1', 1);
      
      expect(instance).not.toBeNull();
      expect(instance.quadrant).toBe(1);
      expect(instance.sourceId).toBe('svg1');
      expect(svgService.activeSvgs).toContain(instance);
    });
    
    it('should remove existing SVG from the quadrant', () => {
      // Add first SVG
      const instance1 = svgService.displaySvgInQuadrant('svg1', 1);
      
      // Add second SVG to same quadrant
      const instance2 = svgService.displaySvgInQuadrant('svg2', 1);
      
      expect(svgService.activeSvgs).not.toContain(instance1);
      expect(svgService.activeSvgs).toContain(instance2);
    });
    
    it('should dispatch an event when SVG is displayed', () => {
      const mockCallback = jest.fn();
      svgService.addEventListener('svgDisplayed', mockCallback);
      
      const instance = svgService.displaySvgInQuadrant('svg1', 1);
      
      expect(mockCallback).toHaveBeenCalledWith(instance);
    });
  });
  
  describe('toggleSvgVisibility', () => {
    let instance;
    
    beforeEach(async () => {
      await svgService.loadSvgFiles();
      instance = svgService.displaySvgInQuadrant('svg1', 1);
      
      // Mock container
      document.body.innerHTML += `
        <div class="svg-container" data-instance-id="${instance.id}"></div>
      `;
    });
    
    it('should toggle SVG visibility', () => {
      // Initially visible
      expect(instance.visible).toBe(true);
      
      // Hide
      svgService.toggleSvgVisibility(instance.id, false);
      expect(instance.visible).toBe(false);
      
      // Show again
      svgService.toggleSvgVisibility(instance.id, true);
      expect(instance.visible).toBe(true);
    });
    
    it('should dispatch an event when visibility changes', () => {
      const mockCallback = jest.fn();
      svgService.addEventListener('svgVisibilityChanged', mockCallback);
      
      svgService.toggleSvgVisibility(instance.id, false);
      
      expect(mockCallback).toHaveBeenCalledWith({
        id: instance.id,
        visible: false
      });
    });
  });
});
```

### 2. Integration Tests

Create `test/integration/svg-controller.test.js`:

```javascript
// test/integration/svg-controller.test.js
import svgController from '../../public/js/svg/controllers/svg-controller';
import svgService from '../../public/js/svg/services/svg-service';

// Mock the SVG service
jest.mock('../../public/js/svg/services/svg-service', () => {
  return {
    __esModule: true,
    default: {
      init: jest.fn().mockResolvedValue(true),
      loadSvgFiles: jest.fn().mockResolvedValue([
        { id: 'svg1', name: 'svg1.svg', path: '/assets/svgs/svg1.svg' },
        { id: 'svg2', name: 'svg2.svg', path: '/assets/svgs/svg2.svg' }
      ]),
      svgFiles: [
        { id: 'svg1', name: 'svg1.svg', path: '/assets/svgs/svg1.svg' },
        { id: 'svg2', name: 'svg2.svg', path: '/assets/svgs/svg2.svg' }
      ],
      activeSvgs: [],
      displaySvgInQuadrant: jest.fn(),
      removeSvgFromQuadrant: jest.fn(),
      displayInFullscreen: jest.fn(),
      removeFullscreenSvg: jest.fn(),
      toggleSvgVisibility: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }
  };
});

describe('SVG Controller', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up DOM
    document.body.innerHTML = `
      <div id="svg-file-list"></div>
      <div id="active-svg-table"></div>
      <button id="load-svgs-btn">Load SVGs</button>
      <button id="enable-drag-mode">Enable Drag Mode</button>
      <div id="quadrant-1"></div>
      <div id="quadrant-2"></div>
      <div id="quadrant-3"></div>
      <div id="quadrant-4"></div>
    `;
    
    // Initialize controller
    svgController.init();
  });
  
  it('should initialize the controller', () => {
    expect(svgService.init).toHaveBeenCalled();
    expect(svgController.svgFileList).not.toBeNull();
    expect(svgController.activeSvgTable).not.toBeNull();
    expect(svgController.loadSvgsBtn).not.toBeNull();
    expect(svgController.enableDragModeBtn).not.toBeNull();
  });
  
  it('should load SVG files when button is clicked', () => {
    const loadButton = document.getElementById('load-svgs-btn');
    loadButton.click();
    
    expect(svgService.loadSvgFiles).toHaveBeenCalled();
  });
  
  it('should toggle drag mode when button is clicked', () => {
    const dragButton = document.getElementById('enable-drag-mode');
    
    // Initially not in drag mode
    expect(document.body.classList.contains('drag-mode-active')).toBe(false);
    
    // Enable drag mode
    dragButton.click();
    expect(document.body.classList.contains('drag-mode-active')).toBe(true);
    expect(dragButton.textContent).toBe('Disable Drag Mode');
    
    // Disable drag mode
    dragButton.click();
    expect(document.body.classList.contains('drag-mode-active')).toBe(false);
    expect(dragButton.textContent).toBe('Enable Drag Mode');
  });
  
  it('should handle SVG selection', () => {
    svgController.handleSvgSelection('svg1');
    expect(svgController.selectedSvgId).toBe('svg1');
  });
  
  it('should display SVG in quadrant when quadrant is clicked', () => {
    // Select an SVG first
    svgController.handleSvgSelection('svg1');
    
    // Click quadrant
    const quadrant = document.getElementById('quadrant-1');
    quadrant.click();
    
    expect(svgService.displaySvgInQuadrant).toHaveBeenCalledWith('svg1', 1);
  });
  
  it('should not display SVG if none is selected', () => {
    // No SVG selected
    svgController.selectedSvgId = null;
    
    // Click quadrant
    const quadrant = document.getElementById('quadrant-1');
    quadrant.click();
    
    expect(svgService.displaySvgInQuadrant).not.toHaveBeenCalled();
  });
});
```

### 3. Manual Integration Testing

In addition to the automated tests, perform the following manual integration tests:

1. **Load SVG files test**
   - Load the `/svg` page
   - Click the "Load SVGs" button
   - Verify that the SVG file list is populated
   
2. **SVG selection test**
   - Load SVG files
   - Click on an SVG in the file list
   - Verify that it becomes highlighted
   
3. **SVG display test**
   - Select an SVG
   - Click on a quadrant
   - Verify that the SVG appears in the quadrant
   - Verify that the active SVGs table is updated
   
4. **SVG visibility test**
   - Display an SVG in a quadrant
   - Click the visibility toggle button in the active SVGs table
   - Verify that the SVG disappears/appears
   
5. **SVG fullscreen test**
   - Display an SVG in a quadrant
   - Click the fullscreen button in the active SVGs table
   - Verify that the SVG appears in fullscreen mode
   - Click the close button
   - Verify that fullscreen mode is exited
   
6. **SVG removal test**
   - Display an SVG in a quadrant
   - Click the remove button in the active SVGs table
   - Verify that the SVG is removed and the active SVGs table is updated

## Code Standards

Follow these code standards for Phase 3:

1. **JavaScript Coding Standards**
   - Use ES6 module syntax for imports and exports
   - Maintain class-based architecture for services and controllers
   - Use descriptive variable and method names
   - Include proper error handling for asynchronous operations
   - Add JSDoc comments for all methods
   - Use proper event-based communication between components

2. **Testing Standards**
   - Test both success and error cases
   - Mock external dependencies and DOM elements
   - Use descriptive test names
   - Structure tests with describe and it blocks
   - Verify both function calls and state changes

## Implementation Steps

1. Create the SVG service file with all the required methods
2. Update the SVG controller to use the service
3. Create unit tests for the SVG service
4. Create integration tests for the controller
5. Manually test the full integration on the actual page

## Success Criteria

Phase 3 is complete when:

1. The SVG service is fully implemented with all methods
2. The SVG controller is updated to use the service
3. Clicking "Load SVGs" retrieves and displays SVG files from the server
4. SVGs can be selected from the list and displayed in quadrants
5. SVGs can be toggled, shown in fullscreen, and removed
6. All unit and integration tests pass
7. Manual testing confirms proper functionality

## Next Steps

After completing Phase 3, proceed to Phase 4, which will focus on implementing the drag functionality to allow SVGs to be repositioned within the interface.
