# State Management Service Implementation Guide

## Overview

This guide outlines the implementation of a centralized State Management Service that will provide consistent state handling across the application. The service will manage UI state, user preferences, and feature configurations with support for real-time updates and persistence.

## Key Features

- Centralized state storage
- Observable state pattern with subscriber notifications
- Persistence via localStorage
- Automatic UI binding

## Implementation Steps

### 1. Create State Management Service Module

Create a new file `public/js/services/state-manager.js` with the following code:

```javascript
/**
 * State Manager
 * Provides centralized state management with observer pattern
 */
const StateManager = {
  /**
   * Private state storage
   */
  _state: {},
  
  /**
   * Subscribers for state changes
   */
  _subscribers: {},
  
  /**
   * Initialize state with default values
   * @param {Object} initialState - Default state values
   */
  init: function(initialState = {}) {
    this._state = {...initialState};
    
    // Load any saved state from localStorage
    this._loadPersistedState();
    
    console.log('StateManager initialized with state:', this._state);
  },
  
  /**
   * Get current state or a specific state property
   * @param {string} [key] - Optional property key
   * @returns {*} State value
   */
  get: function(key) {
    if (key === undefined) {
      // Return copy of entire state to prevent direct mutations
      return {...this._state};
    }
    
    return this._state[key];
  },
  
  /**
   * Set state value(s)
   * @param {string|Object} keyOrObject - Key to update or object with multiple updates
   * @param {*} [value] - New value if key is a string
   * @param {boolean} [persist=false] - Whether to persist to localStorage
   */
  set: function(keyOrObject, value, persist = false) {
    let changes = {};
    
    if (typeof keyOrObject === 'string') {
      // Single key update
      this._state[keyOrObject] = value;
      changes[keyOrObject] = value;
    } else if (typeof keyOrObject === 'object') {
      // Multiple updates
      Object.entries(keyOrObject).forEach(([key, val]) => {
        this._state[key] = val;
        changes[key] = val;
      });
    }
    
    // Persist changes if requested
    if (persist) {
      this._persistState(changes);
    }
    
    // Notify subscribers
    this._notifySubscribers(changes);
  },
  
  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Function to call when state changes
   * @returns {string} Subscription ID for unsubscribing
   */
  subscribe: function(key, callback) {
    const id = this._generateId();
    
    if (!this._subscribers[key]) {
      this._subscribers[key] = {};
    }
    
    this._subscribers[key][id] = callback;
    
    // Call immediately with current value
    callback(this.get(key));
    
    return id;
  },
  
  /**
   * Unsubscribe from state changes
   * @param {string} key - State key
   * @param {string} id - Subscription ID
   */
  unsubscribe: function(key, id) {
    if (this._subscribers[key] && this._subscribers[key][id]) {
      delete this._subscribers[key][id];
    }
  },
  
  /**
   * Load persisted state from localStorage
   * @private
   */
  _loadPersistedState: function() {
    if (!window.localStorage) return;
    
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Merge with current state
        Object.assign(this._state, parsedState);
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
  },
  
  /**
   * Persist state changes to localStorage
   * @param {Object} changes - State changes to persist
   * @private
   */
  _persistState: function(changes) {
    if (!window.localStorage) return;
    
    try {
      // Get current persisted state or empty object
      const savedState = localStorage.getItem('appState');
      const persistedState = savedState ? JSON.parse(savedState) : {};
      
      // Update with new changes
      const updatedState = {...persistedState, ...changes};
      
      // Save back to localStorage
      localStorage.setItem('appState', JSON.stringify(updatedState));
    } catch (e) {
      console.error('Error persisting state to localStorage:', e);
    }
  },
  
  /**
   * Notify subscribers of state changes
   * @param {Object} changes - State changes
   * @private
   */
  _notifySubscribers: function(changes) {
    Object.keys(changes).forEach(key => {
      const subscribers = this._subscribers[key];
      if (subscribers) {
        Object.values(subscribers).forEach(callback => {
          callback(changes[key]);
        });
      }
    });
  },
  
  /**
   * Generate a unique subscription ID
   * @private
   * @returns {string} Unique ID
   */
  _generateId: function() {
    return Math.random().toString(36).substr(2, 9);
  },
  
  /**
   * Clear all state and remove from localStorage
   */
  reset: function() {
    this._state = {};
    
    if (window.localStorage) {
      localStorage.removeItem('appState');
    }
    
    // Notify subscribers of reset
    Object.keys(this._subscribers).forEach(key => {
      this._notifySubscribers({ [key]: undefined });
    });
  },
  
  /**
   * Create a binding between a state key and a DOM element
   * @param {string} key - State key to bind
   * @param {string|Element} element - Element selector or DOM element
   * @param {Object} options - Binding options
   * @returns {string} Subscription ID
   */
  bindToElement: function(key, element, options = {}) {
    const defaultOptions = {
      attribute: 'value', // DOM attribute to update
      event: 'input',     // Event to listen for
      transform: null,    // Transform function for displaying value
      twoWay: true        // Enable two-way binding
    };
    
    const settings = {...defaultOptions, ...options};
    
    // Get DOM element if string selector provided
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) {
      console.error(`Element not found for binding: ${element}`);
      return null;
    }
    
    // Create subscriber to update element when state changes
    const subscriptionId = this.subscribe(key, (value) => {
      const displayValue = settings.transform ? settings.transform(value) : value;
      
      if (settings.attribute === 'value') {
        el.value = displayValue;
      } else if (settings.attribute === 'textContent') {
        el.textContent = displayValue;
      } else if (settings.attribute === 'innerHTML') {
        el.innerHTML = displayValue;
      } else if (settings.attribute === 'checked') {
        el.checked = displayValue;
      } else {
        el.setAttribute(settings.attribute, displayValue);
      }
    });
    
    // Add event listener for two-way binding
    if (settings.twoWay && settings.event) {
      el.addEventListener(settings.event, (e) => {
        let newValue;
        
        if (settings.attribute === 'value') {
          newValue = el.value;
        } else if (settings.attribute === 'checked') {
          newValue = el.checked;
        } else {
          newValue = el.getAttribute(settings.attribute);
        }
        
        // Update state (without notification to avoid loops)
        this.set(key, newValue);
      });
    }
    
    return subscriptionId;
  }
};

// Make state manager globally available
window.StateManager = StateManager;
```

### 2. Create Application State Definition

Create a new file `public/js/state/app-state.js` to define the initial application state:

```javascript
/**
 * Application State Definition
 * Centralized definition of application state structure and defaults
 */
const AppState = {
  /**
   * Default application state
   */
  defaults: {
    // UI state
    ui: {
      darkMode: false,
      navExpanded: true,
      selectedTab: 'overview',
      panelLayout: 'default',
      sidebarWidth: 250,
      refreshInterval: 5000
    },
    
    // User preferences
    preferences: {
      autoRefresh: true,
      notifications: true,
      defaultPage: 'dashboard',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '24h'
    },
    
    // Feature flags
    features: {
      experimentalCharts: false,
      betaFeatures: false,
      detailedLogs: false
    },
    
    // Currently displayed data
    data: {
      selectedGpuId: null,
      selectedCpuCore: null,
      timeRange: '1h',
      metricType: 'temperature'
    }
  },
  
  /**
   * State keys that should be persisted to localStorage
   */
  persistedKeys: [
    'ui.darkMode',
    'ui.navExpanded',
    'ui.panelLayout',
    'ui.sidebarWidth',
    'ui.refreshInterval',
    'preferences',
    'features'
  ],
  
  /**
   * Initialize application state
   */
  init: function() {
    // Initialize state manager with defaults
    StateManager.init(this.defaults);
    
    // Set up persistence for specified keys
    this._setupPersistence();
    
    return StateManager;
  },
  
  /**
   * Setup automatic persistence for specific state keys
   * @private
   */
  _setupPersistence: function() {
    // Recursively get all state paths
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? `${prefix}.` : '';
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
        } else {
          acc[`${pre}${key}`] = obj[key];
        }
        
        return acc;
      }, {});
    };
    
    // Get all state paths
    const allPaths = flattenObject(this.defaults);
    
    // Set up subscribers for persisted keys
    this.persistedKeys.forEach(keyPattern => {
      // Find all matching keys
      const matchingKeys = Object.keys(allPaths).filter(key => {
        // Exact match
        if (key === keyPattern) return true;
        
        // Pattern with wildcard (e.g., 'preferences.*')
        if (keyPattern.endsWith('.*')) {
          const basePattern = keyPattern.slice(0, -2);
          return key.startsWith(basePattern);
        }
        
        return false;
      });
      
      // Subscribe to changes for each matching key
      matchingKeys.forEach(key => {
        StateManager.subscribe(key, (value) => {
          // Create an object with just this key-value pair
          const updateObj = { [key]: value };
          
          // Persist this change
          StateManager._persistState(updateObj);
        });
      });
    });
  }
};

// Make AppState globally available
window.AppState = AppState;
```

### 3. Create UI Binding Utility

Create a new file `public/js/utils/ui-binding.js` to handle automatic UI bindings:

```javascript
/**
 * UI Binding Utility
 * Handles automatic binding between DOM elements and application state
 */
const UiBinding = {
  /**
   * Active bindings
   */
  _bindings: [],
  
  /**
   * Initialize bindings from data attributes
   */
  init: function() {
    // Find elements with data-bind attribute
    const boundElements = document.querySelectorAll('[data-bind]');
    
    boundElements.forEach(el => {
      const key = el.getAttribute('data-bind');
      const attribute = el.getAttribute('data-bind-attr') || 'value';
      const event = el.getAttribute('data-bind-event') || 'input';
      const transform = el.getAttribute('data-bind-transform');
      
      // Get transform function if specified
      let transformFn = null;
      if (transform) {
        try {
          transformFn = new Function('value', `return ${transform}`);
        } catch (e) {
          console.error(`Invalid transform function: ${transform}`);
        }
      }
      
      // Create binding
      const id = StateManager.bindToElement(key, el, {
        attribute,
        event,
        transform: transformFn,
        twoWay: el.getAttribute('data-bind-readonly') !== 'true'
      });
      
      if (id) {
        this._bindings.push({ id, key, element: el });
      }
    });
    
    console.log(`Initialized ${this._bindings.length} UI bindings`);
  },
  
  /**
   * Clean up all bindings
   */
  cleanup: function() {
    this._bindings.forEach(binding => {
      StateManager.unsubscribe(binding.key, binding.id);
    });
    
    this._bindings = [];
  }
};

// Initialize bindings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  UiBinding.init();
});

// Make UiBinding globally available
window.UiBinding = UiBinding;
```

### 4. Create Integration Examples

#### 4.1 Example: Theme Switching

```javascript
// public/js/features/theme-switcher.js
const ThemeSwitcher = {
  init: function() {
    // Get theme toggle element
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Bind to state
    StateManager.bindToElement('ui.darkMode', themeToggle, {
      attribute: 'checked',
      event: 'change'
    });
    
    // Subscribe to changes to update theme
    StateManager.subscribe('ui.darkMode', (isDarkMode) => {
      this.applyTheme(isDarkMode);
    });
  },
  
  applyTheme: function(isDarkMode) {
    // Apply theme to document
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
};

// Initialize theme switcher when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ThemeSwitcher.init();
});
```

#### 4.2 Example: Panel Layout Control

```javascript
// public/js/features/panel-layout.js
const PanelLayoutManager = {
  init: function() {
    // Get layout control elements
    const layoutControls = document.querySelectorAll('[data-layout]');
    if (layoutControls.length === 0) return;
    
    // Add click handlers
    layoutControls.forEach(control => {
      const layout = control.getAttribute('data-layout');
      
      control.addEventListener('click', () => {
        StateManager.set('ui.panelLayout', layout, true);
      });
    });
    
    // Subscribe to layout changes
    StateManager.subscribe('ui.panelLayout', (layout) => {
      this.applyLayout(layout);
      this.updateActiveControl(layout);
    });
  },
  
  applyLayout: function(layout) {
    // Remove existing layout classes
    document.body.classList.remove('layout-default', 'layout-compact', 'layout-expanded');
    
    // Add new layout class
    document.body.classList.add(`layout-${layout}`);
    
    // Update panels based on layout
    if (layout === 'compact') {
      // Collapse non-essential panels
      const nonEssentialPanels = ['logs-panel', 'details-panel'];
      nonEssentialPanels.forEach(panelId => {
        PanelManager.collapsePanel(panelId);
      });
    } else if (layout === 'expanded') {
      // Expand all panels
      document.querySelectorAll('.panel').forEach(panel => {
        if (panel.id) {
          PanelManager.expandPanel(panel.id);
        }
      });
    }
  },
  
  updateActiveControl: function(layout) {
    // Update active state on controls
    const layoutControls = document.querySelectorAll('[data-layout]');
    
    layoutControls.forEach(control => {
      const controlLayout = control.getAttribute('data-layout');
      
      if (controlLayout === layout) {
        control.classList.add('active');
      } else {
        control.classList.remove('active');
      }
    });
  }
};

// Initialize panel layout manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PanelLayoutManager.init();
});
```

### 5. Application Initialization

Update `public/js/app.js` to initialize the state management:

```javascript
/**
 * Main Application Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing application...');
  
  // Initialize application state
  AppState.init();
  
  // Initialize panel manager
  PanelManager.initializePanels();
  
  // Initialize feature-specific modules
  ThemeSwitcher.init();
  PanelLayoutManager.init();
  
  console.log('Application initialized');
});
```

## Testing

### 1. Unit Tests for State Manager

Create a test file at `test/unit/services/state-manager.test.js`:

```javascript
describe('State Manager', () => {
  beforeEach(() => {
    // Reset state manager before each test
    StateManager._state = {};
    StateManager._subscribers = {};
    
    // Mock localStorage
    const mockStorage = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => mockStorage[key]);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { mockStorage[key] = value; });
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(key => { delete mockStorage[key]; });
  });
  
  it('should initialize with default state', () => {
    const initialState = { test: 'value' };
    StateManager.init(initialState);
    
    expect(StateManager.get('test')).toBe('value');
  });
  
  it('should update state with set method', () => {
    StateManager.init();
    
    StateManager.set('testKey', 'testValue');
    expect(StateManager.get('testKey')).toBe('testValue');
    
    StateManager.set({ multiple: 'values', another: 123 });
    expect(StateManager.get('multiple')).toBe('values');
    expect(StateManager.get('another')).toBe(123);
  });
  
  it('should notify subscribers when state changes', () => {
    StateManager.init();
    
    const mockCallback = jest.fn();
    StateManager.subscribe('observed', mockCallback);
    
    // Initial call with current value (undefined)
    expect(mockCallback).toHaveBeenCalledWith(undefined);
    
    // Update value
    StateManager.set('observed', 'new value');
    
    // Should be called with new value
    expect(mockCallback).toHaveBeenCalledWith('new value');
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });
  
  it('should persist state to localStorage when requested', () => {
    StateManager.init();
    
    StateManager.set('persisted', 'saved value', true);
    
    // Check that localStorage.setItem was called
    expect(localStorage.setItem).toHaveBeenCalled();
    
    // The call should include the state in JSON format
    const setItemCall = localStorage.setItem.mock.calls[0];
    expect(setItemCall[0]).toBe('appState');
    
    // Parse the JSON to verify structure
    const savedState = JSON.parse(setItemCall[1]);
    expect(savedState.persisted).toBe('saved value');
  });
  
  it('should load persisted state on initialization', () => {
    // Set up mock localStorage with initial data
    localStorage.getItem.mockReturnValue(JSON.stringify({
      savedKey: 'previously saved'
    }));
    
    // Initialize state manager
    StateManager.init({ newKey: 'new value' });
    
    // Should merge saved state with initial state
    expect(StateManager.get('savedKey')).toBe('previously saved');
    expect(StateManager.get('newKey')).toBe('new value');
  });
});
```

### 2. Integration Tests

Create a test file at `test/integration/state-integration.test.js`:

```javascript
describe('State Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="app-container">
        <input id="test-input" data-bind="ui.testValue" type="text" value="initial">
        <span id="test-display" data-bind="ui.testValue" data-bind-attr="textContent"></span>
        <input id="theme-toggle" type="checkbox" data-bind="ui.darkMode">
      </div>
    `;
    
    // Reset state
    StateManager._state = {};
    StateManager._subscribers = {};
    
    // Initialize
    AppState.init();
    UiBinding.init();
  });
  
  it('should bind UI elements to state', () => {
    // Get bound elements
    const input = document.getElementById('test-input');
    const display = document.getElementById('test-display');
    
    // Initially both should be empty/default
    expect(input.value).toBe('initial');
    expect(display.textContent).toBe('');
    
    // Update state
    StateManager.set('ui.testValue', 'changed value');
    
    // Both elements should update
    expect(input.value).toBe('changed value');
    expect(display.textContent).toBe('changed value');
  });
  
  it('should update state when bound inputs change', () => {
    // Get input element
    const input = document.getElementById('test-input');
    
    // Change input value and trigger event
    input.value = 'user input';
    input.dispatchEvent(new Event('input'));
    
    // State should be updated
    expect(StateManager.get('ui.testValue')).toBe('user input');
  });
  
  it('should apply theme based on state change', () => {
    // Initialize the theme switcher
    ThemeSwitcher.init();
    
    // Toggle theme via state
    StateManager.set('ui.darkMode', true);
    
    // Check that theme was applied
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(document.body.classList.contains('light-theme')).toBe(false);
    
    // Toggle back
    StateManager.set('ui.darkMode', false);
    
    // Check that theme was updated
    expect(document.body.classList.contains('dark-theme')).toBe(false);
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });
});
```

## Usage Examples

### 1. Basic State Management

```javascript
// Initialize with default values
StateManager.init({
  counter: 0,
  user: {
    name: 'Guest',
    isLoggedIn: false
  }
});

// Get values
const counter = StateManager.get('counter');
const user = StateManager.get('user');

// Update single value
StateManager.set('counter', counter + 1);

// Update multiple values
StateManager.set({
  counter: counter + 1,
  'user.name': 'John'
});

// Subscribe to changes
const subscriptionId = StateManager.subscribe('counter', (newValue) => {
  console.log('Counter updated:', newValue);
  document.getElementById('counter-display').textContent = newValue;
});

// Unsubscribe later
StateManager.unsubscribe('counter', subscriptionId);
```

### 2. HTML Declarative Binding

```html
<!-- Automatically bound input -->
<input type="text" 
       data-bind="user.name"
       placeholder="Username">

<!-- Display element bound to same state -->
<span data-bind="user.name" 
      data-bind-attr="textContent"></span>

<!-- Checkbox with transform -->
<input type="checkbox" 
       data-bind="user.accessLevel" 
       data-bind-transform="value >= 5">

<!-- Read-only display with custom transform -->
<div data-bind="stats.lastUpdated" 
     data-bind-attr="textContent" 
     data-bind-readonly="true" 
     data-bind-transform="new Date(value).toLocaleString()"></div>
```

### 3. Integrating with Panel Component System

```javascript
// Panel visibility based on state
StateManager.subscribe('ui.showDetailsPanel', (visible) => {
  const panelId = 'details-panel';
  
  if (visible) {
    PanelManager.expandPanel(panelId);
  } else {
    PanelManager.collapsePanel(panelId);
  }
});

// Update state when panel is manually collapsed/expanded
PanelManager.initPanel('details-panel', {
  onCollapse: () => {
    StateManager.set('ui.showDetailsPanel', false);
  },
  onExpand: () => {
    StateManager.set('ui.showDetailsPanel', true);
  }
});
```

## Next Steps

After implementing the State Management Service, proceed with the following refactoring segments:

1. Controls Standardization
2. Content Template System

These segments will build upon both the Panel Component System and State Management Service to create a more modular, maintainable application architecture.
