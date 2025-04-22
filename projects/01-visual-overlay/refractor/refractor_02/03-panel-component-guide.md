# Panel Component System Implementation Guide

## Overview

This guide outlines the implementation of a standardized Panel Component System across all pages with consistent structure, collapsible behavior, and state persistence.

## Key Features

- Reusable panel component with consistent styling
- Collapsible behavior with toggle functionality
- Sidebar positioning options (left, right, top, bottom)
- State persistence using localStorage
- Customizable callback hooks for panel events

## Implementation Steps

### 1. Create Panel Component Utility

Create a new file `public/js/components/panel.js` with the following code:

```javascript
/**
 * Panel Manager
 * Standardizes panel behavior across the application
 */
const PanelManager = {
  /**
   * Initialize a panel with collapsible functionality
   * @param {string} panelId - ID of panel element
   * @param {Object} options - Configuration options
   */
  initPanel: function(panelId, options = {}) {
    const panel = document.getElementById(panelId);
    if (!panel) return null;
    
    const defaultOptions = {
      collapsible: true,
      sidebarPosition: 'right', // 'left', 'right', 'top', 'bottom'
      saveState: true,
      onCollapse: null,
      onExpand: null
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Add panel-container class for consistent styling
    panel.classList.add('panel-container');
    
    // Setup header with collapse control if panel has title
    const titleEl = panel.querySelector('.panel-title');
    if (titleEl && settings.collapsible) {
      // Create collapse toggle
      const toggleBtn = document.createElement('span');
      toggleBtn.className = 'panel-collapse-toggle';
      toggleBtn.innerHTML = '−'; // Minus sign
      toggleBtn.title = 'Collapse panel';
      
      // Insert toggle before title text
      titleEl.insertBefore(toggleBtn, titleEl.firstChild);
      
      // Add click handler
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel(panelId);
      });
    }
    
    // Restore state if enabled
    if (settings.saveState) {
      this.restorePanelState(panelId);
    }
    
    return {
      id: panelId,
      element: panel,
      settings
    };
  },
  
  /**
   * Collapse panel into sidebar
   * @param {string} panelId - ID of panel to collapse
   */
  collapsePanel: function(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    // Get content elements (everything except header)
    const titleEl = panel.querySelector('.panel-title');
    if (!titleEl) return;
    
    // Hide all children except title
    Array.from(panel.children).forEach(child => {
      if (child !== titleEl && !child.classList.contains('panel-collapse-toggle')) {
        child.style.display = 'none';
      }
    });
    
    // Update toggle button
    const toggleBtn = panel.querySelector('.panel-collapse-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = '+'; // Plus sign
      toggleBtn.title = 'Expand panel';
    }
    
    // Add collapsed class
    panel.classList.add('panel-collapsed');
    
    // Position against edge based on settings
    const settings = this.getPanelSettings(panelId);
    if (settings) {
      panel.classList.add(`panel-sidebar-${settings.sidebarPosition}`);
    }
    
    // Save state if enabled
    if (settings && settings.saveState) {
      this.savePanelState(panelId, 'collapsed');
    }
    
    // Call callback if provided
    if (settings && typeof settings.onCollapse === 'function') {
      settings.onCollapse(panel);
    }
  },
  
  /**
   * Expand panel from sidebar
   * @param {string} panelId - ID of panel to expand
   */
  expandPanel: function(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    // Show all children
    Array.from(panel.children).forEach(child => {
      child.style.display = '';
    });
    
    // Update toggle button
    const toggleBtn = panel.querySelector('.panel-collapse-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = '−'; // Minus sign
      toggleBtn.title = 'Collapse panel';
    }
    
    // Remove collapsed class and positioning
    panel.classList.remove('panel-collapsed');
    panel.classList.remove('panel-sidebar-left', 'panel-sidebar-right', 
                           'panel-sidebar-top', 'panel-sidebar-bottom');
    
    // Save state if enabled
    const settings = this.getPanelSettings(panelId);
    if (settings && settings.saveState) {
      this.savePanelState(panelId, 'expanded');
    }
    
    // Call callback if provided
    if (settings && typeof settings.onExpand === 'function') {
      settings.onExpand(panel);
    }
  },
  
  /**
   * Toggle panel between collapsed and expanded states
   * @param {string} panelId - ID of panel to toggle
   */
  togglePanel: function(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    if (panel.classList.contains('panel-collapsed')) {
      this.expandPanel(panelId);
    } else {
      this.collapsePanel(panelId);
    }
  },
  
  /**
   * Get panel settings
   * @param {string} panelId - ID of panel
   * @returns {Object|null} Panel settings or null if not found
   */
  getPanelSettings: function(panelId) {
    // Retrieve settings from data attribute or default to right sidebar
    const panel = document.getElementById(panelId);
    if (!panel) return null;
    
    try {
      return JSON.parse(panel.dataset.settings || '{}');
    } catch (e) {
      return { sidebarPosition: 'right', saveState: true };
    }
  },
  
  /**
   * Save panel state to localStorage
   * @param {string} panelId - ID of panel
   * @param {string} state - State to save ('collapsed' or 'expanded')
   */
  savePanelState: function(panelId, state) {
    if (!window.localStorage) return;
    
    try {
      // Get existing panel states
      const panelStates = JSON.parse(localStorage.getItem('panelStates') || '{}');
      
      // Update state for this panel
      panelStates[panelId] = state;
      
      // Save back to localStorage
      localStorage.setItem('panelStates', JSON.stringify(panelStates));
    } catch (e) {
      console.error('Error saving panel state:', e);
    }
  },
  
  /**
   * Restore panel state from localStorage
   * @param {string} panelId - ID of panel to restore
   */
  restorePanelState: function(panelId) {
    if (!window.localStorage) return;
    
    try {
      // Get saved panel states
      const panelStates = JSON.parse(localStorage.getItem('panelStates') || '{}');
      
      // Check if we have a saved state for this panel
      if (panelStates[panelId] === 'collapsed') {
        this.collapsePanel(panelId);
      } else if (panelStates[panelId] === 'expanded') {
        this.expandPanel(panelId);
      }
    } catch (e) {
      console.error('Error restoring panel state:', e);
    }
  },
  
  /**
   * Initialize all panels on a page
   */
  initializePanels: function() {
    document.querySelectorAll('.panel').forEach(panel => {
      if (panel.id) {
        this.initPanel(panel.id);
      }
    });
  }
};

// Auto-initialize panels when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PanelManager.initializePanels();
});

// Make panel manager globally available
window.PanelManager = PanelManager;
```

### 2. Add Panel CSS Styles

Create or update `public/css/components/panels.css` with the following styles:

```css
/* Base panel container */
.panel-container {
  position: relative;
  transition: all 0.3s ease;
}

/* Collapsed panel styles */
.panel-collapsed {
  width: auto !important;
  height: auto !important;
  padding: 10px !important;
  overflow: hidden;
}

/* Panel title with collapse control */
.panel-title {
  cursor: default;
  user-select: none;
  display: flex;
  align-items: center;
}

/* Collapse toggle button */
.panel-collapse-toggle {
  cursor: pointer;
  display: inline-block;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  margin-right: 5px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.panel-collapse-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Sidebar positioning classes */
.panel-sidebar-left {
  position: absolute !important;
  left: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  border-radius: 0 8px 8px 0 !important;
  border-left: none !important;
}

.panel-sidebar-right {
  position: absolute !important;
  right: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  border-radius: 8px 0 0 8px !important;
  border-right: none !important;
}

.panel-sidebar-top {
  position: absolute !important;
  top: 0 !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  border-radius: 0 0 8px 8px !important;
  border-top: none !important;
}

.panel-sidebar-bottom {
  position: absolute !important;
  bottom: 0 !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  border-radius: 8px 8px 0 0 !important;
  border-bottom: none !important;
}
```

### 3. Update Panel HTML Structure

Use the following structure for all panels across your application:

```html
<!-- Standard panel HTML structure -->
<div id="example-panel" class="panel some-panel-class">
  <div class="panel-title">Panel Title</div>
  <div class="panel-content">
    <!-- Panel content goes here -->
    <p>Panel content</p>
  </div>
  <div class="panel-footer">
    <!-- Optional footer content -->
    <button>Action</button>
  </div>
</div>
```

### 4. Page Integration Example

Here's how to implement panels on a specific page:

```javascript
// Example integration in a page's JS file
document.addEventListener('DOMContentLoaded', function() {
  // Initialize panels with custom options
  PanelManager.initPanel('gpu-panel', {
    sidebarPosition: 'left',
    onCollapse: function(panel) {
      console.log('GPU panel collapsed');
    }
  });
  
  PanelManager.initPanel('cpu-panel', {
    sidebarPosition: 'right'
  });
  
  PanelManager.initPanel('system-panel', {
    sidebarPosition: 'bottom'
  });
  
  // Initialize all other panels with defaults
  document.querySelectorAll('.panel:not(#gpu-panel):not(#cpu-panel):not(#system-panel)').forEach(panel => {
    if (panel.id) {
      PanelManager.initPanel(panel.id);
    }
  });
});
```

## Testing

### 1. Unit Tests for Panel Component

Create a test file at `test/unit/components/panel.test.js`:

```javascript
describe('Panel Manager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-panel" class="panel">
        <div class="panel-title">Test Panel</div>
        <div class="panel-content">Content</div>
      </div>
    `;
  });

  it('should initialize panel with collapse button', () => {
    PanelManager.initPanel('test-panel');
    const toggleBtn = document.querySelector('#test-panel .panel-collapse-toggle');
    expect(toggleBtn).not.toBeNull();
    expect(toggleBtn.innerHTML).toBe('−');
  });

  it('should collapse panel when toggle is clicked', () => {
    PanelManager.initPanel('test-panel');
    const toggleBtn = document.querySelector('#test-panel .panel-collapse-toggle');
    const content = document.querySelector('#test-panel .panel-content');
    
    toggleBtn.click();
    
    expect(content.style.display).toBe('none');
    expect(document.getElementById('test-panel').classList.contains('panel-collapsed')).toBe(true);
  });

  it('should restore panel state from localStorage', () => {
    // Mock localStorage
    const mockStorage = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => mockStorage[key]);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { mockStorage[key] = value; });
    
    // Set initial state
    mockStorage['panelStates'] = JSON.stringify({'test-panel': 'collapsed'});
    
    PanelManager.initPanel('test-panel');
    
    expect(document.getElementById('test-panel').classList.contains('panel-collapsed')).toBe(true);
  });
});
```

### 2. Integration Tests

Create a test file at `test/integration/panel-integration.test.js`:

```javascript
describe('Panel Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container">
        <div id="panel1" class="panel">
          <div class="panel-title">Panel 1</div>
          <div class="panel-content">Content 1</div>
        </div>
        <div id="panel2" class="panel">
          <div class="panel-title">Panel 2</div>
          <div class="panel-content">Content 2</div>
        </div>
      </div>
    `;
    
    // Initialize panels
    PanelManager.initializePanels();
  });

  it('should initialize all panels on the page', () => {
    const toggleBtns = document.querySelectorAll('.panel-collapse-toggle');
    expect(toggleBtns.length).toBe(2);
  });

  it('should maintain proper layout when panels are collapsed', () => {
    // Collapse first panel
    PanelManager.collapsePanel('panel1');
    
    expect(document.getElementById('panel1').classList.contains('panel-collapsed')).toBe(true);
    expect(document.getElementById('panel2').classList.contains('panel-collapsed')).toBe(false);
    
    // Check that page layout is still intact
    expect(document.querySelector('.container')).not.toBeNull();
  });
});
```

## Integration Steps

1. **Update HTML Templates**: Modify all page templates to use the standard panel structure
2. **Include Required Files**: Add the JS and CSS files to each page that uses panels
3. **Initialize Panels**: Add initialization code in each page's JS file
4. **Convert Existing Panels**: Update any existing panels to use the new standard structure
5. **Test Across Pages**: Verify that panels work consistently across all pages

## Usage Examples

### Basic Panel

```html
<div id="simple-panel" class="panel">
  <div class="panel-title">Simple Panel</div>
  <div class="panel-content">
    <p>This is a basic panel with default behavior.</p>
  </div>
</div>

<script>
  // Auto-initialization will handle this panel
</script>
```

### Custom Panel with Options

```html
<div id="custom-panel" class="panel">
  <div class="panel-title">Custom Panel</div>
  <div class="panel-content">
    <p>This panel has custom behavior.</p>
  </div>
</div>

<script>
  // Custom initialization
  PanelManager.initPanel('custom-panel', {
    sidebarPosition: 'left',
    saveState: false,
    onCollapse: function(panel) {
      // Custom callback when panel collapses
      console.log('Panel collapsed');
      
      // Update other UI elements
      document.getElementById('status').textContent = 'Panel hidden';
    },
    onExpand: function(panel) {
      // Custom callback when panel expands
      console.log('Panel expanded');
      
      // Update other UI elements
      document.getElementById('status').textContent = 'Panel visible';
    }
  });
</script>
```

### Programmatic Control

```javascript
// Collapse a panel
PanelManager.collapsePanel('my-panel');

// Expand a panel
PanelManager.expandPanel('my-panel');

// Toggle a panel
PanelManager.togglePanel('my-panel');

// Get panel settings
const settings = PanelManager.getPanelSettings('my-panel');
console.log('Panel position:', settings.sidebarPosition);
```

## Next Steps

After implementing the Panel Component System, proceed with the following refactoring segments:

1. State Management Service
2. Controls Standardization
3. Content Template System
4. Shared Navigation Component (if not already implemented)

These segments will build upon the Panel Component System to create a more modular, maintainable application architecture.
