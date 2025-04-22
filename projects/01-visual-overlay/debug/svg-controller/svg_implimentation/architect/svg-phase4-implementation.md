# SVG Overlay Implementation - Phase 4 Technical Guide

## Overview
Phase 4 completes the SVG Overlay feature by implementing the drag functionality, allowing users to precisely position SVG elements anywhere on the screen. This phase builds on the foundation established in Phases 1-3 and adds the final layer of interactivity.

## Directory Structure Updates
```
public/
  ├── js/
  │   └── svg/
  │       ├── services/
  │       │   ├── svg-service.js     # UPDATE: Add drag-related methods
  │       │   └── drag-manager.js    # NEW: Drag functionality service 
  │       └── controllers/
  │           └── svg-controller.js  # UPDATE: Integrate drag functionality
```

## Files to Create/Modify

### 1. Drag Manager Service

#### A. Create `public/js/svg/services/drag-manager.js`
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
    
    // Move to main-content if not already a direct child
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
    
    // Return to original parent if needed
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

### 2. Update SVG Service

#### A. Update `public/js/svg/services/svg-service.js`
Add the following method to the SvgService class:

```javascript
/**
 * Set draggable state for an SVG
 * @param {string} instanceId - SVG instance ID
 * @param {boolean} draggable - Draggable state
 */
setDraggable(instanceId, draggable) {
  const svgInstance = this.activeSvgs.find(svg => svg.id === instanceId);
  if (!svgInstance) return;
  
  // Update state
  svgInstance.draggable = draggable;
  
  // Dispatch event
  this.dispatchEvent('svgDraggableChanged', {
    id: instanceId,
    draggable
  });
}
```

### 3. Update Controller with Drag Integration

#### A. Update `public/js/svg/controllers/svg-controller.js`
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
    this.handleDraggableToggle = this.handleDraggableToggle.bind(this);
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
    svgService.addEventListener('svgDraggableChanged', this.renderActiveSvgs);
    
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
    svgService.setDraggable(svgId, draggable);
    
    // Update drag manager
    if (draggable) {
      dragManager.makeDraggable(svgId);
    } else {
      dragManager.removeDraggable(svgId);
    }
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

### 1. Unit Tests for Drag Manager

Create `test/unit/svg/drag-manager.test.js`:

```javascript
// test/unit/svg/drag-manager.test.js
import { DragManager } from '../../../public/js/svg/services/drag-manager';

describe('Drag Manager', () => {
  let dragManager;
  
  beforeEach(() => {
    // Reset document body
    document.body.innerHTML = `
      <div id="main-content">
        <div id="quadrant-1"></div>
      </div>
    `;
    
    // Create a fresh instance
    dragManager = new DragManager();
  });

  describe('init', () => {
    it('should initialize successfully', () => {
      const result = dragManager.init();
      expect(result).toBe(true);
    });
  });
  
  describe('drag mode', () => {
    it('should enable drag mode', () => {
      dragManager.enableDragMode();
      
      expect(dragManager.dragEnabled).toBe(true);
      expect(document.body.classList.contains('drag-mode-active')).toBe(true);
    });
    
    it('should disable drag mode', () => {
      // Enable first
      dragManager.enableDragMode();
      
      // Then disable
      dragManager.disableDragMode();
      
      expect(dragManager.dragEnabled).toBe(false);
      expect(document.body.classList.contains('drag-mode-active')).toBe(false);
    });
    
    it('should toggle drag mode', () => {
      // Initially disabled
      expect(dragManager.dragEnabled).toBe(false);
      
      // Toggle on
      dragManager.toggleDragMode();
      expect(dragManager.dragEnabled).toBe(true);
      
      // Toggle off
      dragManager.toggleDragMode();
      expect(dragManager.dragEnabled).toBe(false);
    });
    
    it('should dispatch events when drag mode changes', () => {
      const mockCallback = jest.fn();
      dragManager.addEventListener('dragModeChanged', mockCallback);
      
      // Enable
      dragManager.enableDragMode();
      expect(mockCallback).toHaveBeenCalledWith({ enabled: true });
      
      // Disable
      dragManager.disableDragMode();
      expect(mockCallback).toHaveBeenCalledWith({ enabled: false });
    });
  });
  
  describe('makeDraggable', () => {
    let testElement;
    
    beforeEach(() => {
      // Create a test element
      testElement = document.createElement('div');
      testElement.dataset.instanceId = 'test-element';
      document.body.appendChild(testElement);
    });
    
    it('should register a draggable element', () => {
      const config = dragManager.makeDraggable('test-element');
      
      expect(dragManager.draggableElements.has('test-element')).toBe(true);
      expect(config.draggable).toBe(true);
    });
    
    it('should apply draggable features when drag mode is enabled', () => {
      // Enable drag mode first
      dragManager.enableDragMode();
      
      // Make element draggable
      dragManager.makeDraggable('test-element');
      
      // Element should have draggable class
      expect(testElement.classList.contains('draggable')).toBe(true);
    });
    
    it('should not apply draggable features when drag mode is disabled', () => {
      // Make element draggable with drag mode disabled
      dragManager.makeDraggable('test-element');
      
      // Element should not have draggable class yet
      expect(testElement.classList.contains('draggable')).toBe(false);
      
      // Enable drag mode
      dragManager.enableDragMode();
      
      // Now element should have draggable class
      expect(testElement.classList.contains('draggable')).toBe(true);
    });
  });
  
  describe('removeDraggable', () => {
    let testElement;
    
    beforeEach(() => {
      // Create a test element
      testElement = document.createElement('div');
      testElement.dataset.instanceId = 'test-element';
      document.body.appendChild(testElement);
      
      // Make it draggable
      dragManager.enableDragMode();
      dragManager.makeDraggable('test-element');
    });
    
    it('should remove a draggable element', () => {
      dragManager.removeDraggable('test-element');
      
      expect(dragManager.draggableElements.has('test-element')).toBe(false);
      expect(testElement.classList.contains('draggable')).toBe(false);
    });
  });
  
  // Mouse event handling tests would be more complex and may require a different approach
  // For simplicity, we'll focus on basic functionality tests in this example
});
```

### 2. Integration Tests

Update `test/integration/svg-controller.test.js` to include drag functionality tests:

```javascript
// Add to the existing test file

describe('Drag Functionality', () => {
  beforeEach(() => {
    // Mock the svg instance
    svgService.activeSvgs = [
      { id: 'svg-test', sourceId: 'svg1', name: 'test.svg', quadrant: 1, draggable: false }
    ];
    
    // Mock the drag manager methods
    jest.spyOn(dragManager, 'toggleDragMode');
    jest.spyOn(dragManager, 'makeDraggable');
    jest.spyOn(dragManager, 'removeDraggable');
    
    // Mock the SVG service method
    jest.spyOn(svgService, 'setDraggable');
  });
  
  it('should toggle drag mode', () => {
    const dragButton = document.getElementById('enable-drag-mode');
    dragButton.click();
    
    expect(dragManager.toggleDragMode).toHaveBeenCalled();
  });
  
  it('should handle draggable toggle', () => {
    svgController.handleDraggableToggle('svg-test', true);
    
    expect(svgService.setDraggable).toHaveBeenCalledWith('svg-test', true);
    expect(dragManager.makeDraggable).toHaveBeenCalledWith('svg-test');
    
    svgController.handleDraggableToggle('svg-test', false);
    
    expect(svgService.setDraggable).toHaveBeenCalledWith('svg-test', false);
    expect(dragManager.removeDraggable).toHaveBeenCalledWith('svg-test');
  });
});
```

### 3. Manual Testing

In addition to the automated tests, perform the following manual integration tests:

1. **Drag mode toggle test**
   - Load the `/svg` page
   - Click the "Enable Drag Mode" button
   - Verify that the button text changes to "Disable Drag Mode"
   - Verify that the quadrant borders change color (to gold)
   - Click again to disable and verify it reverts
   
2. **Draggable toggle test**
   - Display an SVG in a quadrant
   - Check the "Draggable" checkbox in the active SVGs table
   - Verify that the SVG element gets a gold border
   - Uncheck the checkbox and verify the border is removed
   
3. **Drag operation test**
   - Display an SVG in a quadrant
   - Enable drag mode
   - Make the SVG draggable
   - Click and drag the SVG
   - Verify that the SVG follows the mouse cursor
   - Release the mouse button and verify the SVG stays in the new position
   
4. **Multiple SVG test**
   - Display multiple SVGs in different quadrants
   - Make some draggable and others not
   - Verify that only draggable SVGs can be moved
   - Verify that SVGs maintain their draggable state when drag mode is toggled
   
5. **Z-index test**
   - Make multiple SVGs draggable
   - Drag one SVG over another
   - Verify that the dragged SVG appears on top during dragging
   - Release and verify the stacking order is preserved

## Code Standards

Follow these code standards for Phase 4:

1. **JavaScript Coding Standards**
   - Maintain modular architecture with clear separation of concerns
   - Use ES6 module syntax for imports and exports
   - Use descriptive variable and method names
   - Include proper error handling for DOM operations
   - Add JSDoc comments for all methods
   - Use proper event-based communication between components

2. **Testing Standards**
   - Test both success and error cases
   - Mock external dependencies and DOM elements
   - Use descriptive test names
   - Structure tests with describe and it blocks
   - Verify both function calls and state changes

## Implementation Steps

1. Create the drag-manager.js file with all drag functionality
2. Update the SVG service with draggable state methods
3. Enhance the SVG controller to integrate drag functionality
4. Create unit tests for the drag manager
5. Update integration tests for the controller
6. Manually test the full drag functionality

## Success Criteria

Phase 4 is complete when:

1. The drag manager is fully implemented
2. SVG elements can be made draggable via the UI
3. Draggable SVGs can be freely positioned anywhere on the screen
4. Drag mode can be toggled on and off
5. SVGs maintain their draggable state and position
6. All unit and integration tests pass
7. Manual testing confirms proper drag functionality

## Final Project Status

With the completion of Phase 4, the SVG Overlay feature is now fully implemented. The feature provides the following capabilities:

1. Loading and displaying SVG files from the server
2. Placing SVGs in quadrants or fullscreen mode
3. Managing SVGs through visibility controls
4. Precise positioning of SVGs through drag and drop
5. Organized UI with control panel and quadrant grid

The implementation follows a modular architecture with clear separation between:
- API endpoints for file management
- Service layer for SVG and drag operations
- Controller layer for UI interaction and state management
- Clean styling with responsive design

All components are thoroughly tested with both automated and manual tests, ensuring the feature is robust and maintainable. The code structure allows for future extensions such as SVG resizing, rotation, or additional effect controls.
