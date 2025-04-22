# Technical Architecture: Visual Effects Module Integration Guide

## 1. Architecture Overview

The Visual Effects framework follows a modular design with strict separation of concerns following the MVC pattern. This document provides essential guidelines for porting new visual applications into this architecture.

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Services   │◄────►│ Controllers  │◄────►│    Views     │
└──────────────┘      └──────────────┘      └──────────────┘
        ▲                     ▲                    ▲
        │                     │                    │
        ▼                     ▼                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Registry   │      │    Store     │      │    DOM UI    │
└──────────────┘      └──────────────┘      └──────────────┘
```

## 2. Module Structure Requirements

When adding a new visual effect, maintain this structure:

```
visualeffects/
├── services/
│   └── [effect-name]-service.js  # Data and effects logic
├── controllers/
│   └── [effect-name]-controller.js  # Event handling & UI updates
├── components/
│   └── [effect-name]-view.js  # Visual rendering component
├── models/
│   └── [effect-name]-settings.js  # Data models & default settings
└── utils/
    └── [effect-name]-utils.js  # Helper functions
```

## 3. Service Layer Requirements

The service layer manages the business logic and state:

### 3.1 Service Interface

Each visual effect service MUST implement:

```javascript
class VisualEffectService {
  constructor(dependencies) {
    // Services only depend on other services or store
    this.store = dependencies.store;
    this.initialized = false;
  }
  
  init() {
    // Initialize service, registers event listeners
    return true/false;
  }
  
  initializeScene(container) {
    // Set up the visual in the provided container
  }
  
  updateScene(state) {
    // Update based on state changes
  }
  
  destroy() {
    // Clean up resources
  }
  
  // Optional methods based on effect type
  applyPreset(presetName) {}
  toggleVisibility(visible) {}
}
```

### 3.2 Service Responsibilities

- Manage rendering logic and scene initialization
- Process state updates from store
- Provide effect-specific functions
- Clean up resources when destroyed
- AVOID direct DOM manipulation (except for container provided to initializeScene)
- AVOID direct event binding to DOM elements (use controller)

## 4. Controller Layer Requirements

The controller manages user interactions:

### 4.1 Controller Interface

```javascript
class VisualEffectController {
  constructor(dependencies) {
    // Controllers depend on services and DOM elements
    this.service = dependencies.[effect]Service;
    this.store = dependencies.store;
    this.initialized = false;
  }
  
  init() {
    // Find DOM elements
    // Set up event listeners
    return true/false;
  }
  
  render(state) {
    // Update UI based on state
  }
  
  setupEventListeners() {
    // Connect UI events to service methods
  }
  
  destroy() {
    // Remove event listeners and clean up
  }
}
```

### 4.2 Controller Responsibilities

- Attach event handlers to DOM elements
- Dispatch state updates to store
- Call service methods based on user actions
- Update UI based on state changes
- AVOID direct data manipulation (delegate to service)
- AVOID business logic (delegate to service)

## 5. View Component Requirements

View components handle the visual representation:

### 5.1 View Interface

```javascript
class VisualEffectView {
  constructor(dependencies) {
    this.service = dependencies.[effect]Service;
    this.controller = dependencies.[effect]Controller;
    this.initialized = false;
  }
  
  init() {
    // Create DOM elements
    return true/false;
  }
  
  createElements() {
    // Generate DOM structure
  }
  
  showView(visible) {
    // Toggle visibility
  }
  
  destroy() {
    // Remove DOM elements
  }
}
```

### 5.2 View Responsibilities

- Create effect's DOM structure
- Provide methods to show/hide the view
- Maintain proper styling
- AVOID attaching event handlers directly (delegate to controller)
- AVOID data processing (delegate to service)

## 6. Model/Settings Requirements

Define your effect's configuration:

### 6.1 Settings Structure

```javascript
const defaultSettings = {
  // Category groups
  elements: {
    // Individual elements with properties
    element1: {
      visible: true,
      property1: value,
      property2: value
    }
  },
  // Global properties
  property1: value,
  property2: value
};
```

### 6.2 Settings Responsibilities

- Provide default values
- Define data structure for state
- Document valid ranges and types
- AVOID logic in settings definition
- AVOID direct DOM references

## 7. Integration Points

### 7.1 Registry Integration

Add your effect to the Visual Effects Registry:

```javascript
// In visual-registry.js
thumbnails: {
  'your-effect': '../../assets/visualeffects/thumbnails/your-effect.jpg',
  // other effects...
},

// Default settings templates
defaultSettings: {
  'your-effect': {
    // Your effect's default settings
  },
  // other effects...
},

// Create settings UI method additions
createSettingsUI: function(visualId, container, settings, changeCallback) {
  // ...
  switch(visualId) {
    // ...
    case 'your-effect':
      this.createYourEffectSettings(container, settings, changeCallback);
      break;
  }
}
```

### 7.2 VisualEffectsService Integration

Add initialization support to the VisualEffectsService:

```javascript
// In visualeffects-service.js, update initializeVisual function
initializeVisual: function(visualId, quadrant) {
  // ...
  switch(visualId) {
    // ...
    case 'your-effect':
      this.initializeYourEffect(container);
      break;
  }
},

// Then add a new initialization method
initializeYourEffect: function(container) {
  // If your service is available
  if (window.yourEffectService) {
    window.yourEffectService.initializeScene(container);
  } else {
    // Create placeholder
    container.innerHTML = `...`;
  }
}
```

## 8. State Management

Every visual effect must follow the state management pattern:

### 8.1 Store Actions

Create actions for your effect in the store:

```javascript
// In store/your-effect-store.js
export const yourEffectActions = {
  setElementVisibility: (element, visible) => ({
    type: 'YOUR_EFFECT_SET_ELEMENT_VISIBILITY',
    payload: { element, visible }
  }),
  
  setElementProperty: (element, property, value) => ({
    type: 'YOUR_EFFECT_SET_ELEMENT_PROPERTY',
    payload: { element, property, value }
  }),
  
  // Other actions...
};
```

### 8.2 Store Subscription

Use the store subscription pattern:

```javascript
// In your service
constructor(dependencies) {
  this.store = dependencies.store;
  
  // Subscribe to store changes
  if (this.store) {
    this.unsubscribe = this.store.subscribe((state) => {
      this.updateScene(state.yourEffect);
    });
  }
}

// Clean up in destroy
destroy() {
  if (this.unsubscribe) {
    this.unsubscribe();
  }
}
```

## 9. Essential Patterns

### 9.1 Dependency Injection

Services and controllers must receive dependencies via constructor:

```javascript
constructor(dependencies) {
  this.store = dependencies.store;
  this.serviceProvider = dependencies.serviceProvider;
  this.otherService = dependencies.otherService;
}
```

### 9.2 Initialization Chain

Always follow this initialization pattern:

```javascript
init() {
  if (this.initialized) {
    console.log(`Already initialized`);
    return true;
  }
  
  try {
    // Setup steps...
    this.initialized = true;
    return true;
  } catch (error) {
    console.error(`Init failed: ${error.message}`);
    return false;
  }
}
```

### 9.3 Resource Cleanup

Thorough cleanup in destroy method:

```javascript
destroy() {
  // Unsubscribe from events
  if (this.unsubscribe) this.unsubscribe();
  
  // Clean up DOM elements
  if (this.element && this.element.parentNode) {
    this.element.parentNode.removeChild(this.element);
  }
  
  // Reset state
  this.initialized = false;
  
  // Clear references
  this.element = null;
}
```

## 10. Testing Requirements

Each visual effect module should include:

1. **Service Tests**: Verify service methods work correctly
2. **Controller Tests**: Verify DOM interactions
3. **Integration Tests**: Verify component interactions

Use the standard testing pattern:

```javascript
describe('YourEffect Service', () => {
  let service;
  let mockStore;
  
  beforeEach(() => {
    mockStore = { /* mock implementation */ };
    service = new YourEffectService({ store: mockStore });
  });
  
  it('should initialize correctly', () => {
    expect(service.init()).toBe(true);
    expect(service.initialized).toBe(true);
  });
  
  // Additional tests...
});
```

## 11. Performance Guidelines

### 11.1 Rendering Performance

- Use requestAnimationFrame for animations
- Throttle high-frequency updates
- Use appropriate rendering techniques based on effect type
- Batch DOM updates
- Use CSS transforms and opacity for animations when possible

### 11.2 Memory Management

- Clean up all resources in destroy()
- Remove event listeners when no longer needed
- Dispose of Three.js objects properly
- Limit resource-intensive features based on device capability

## 12. Integration Checklist

When porting an existing application, follow this checklist:

1. [ ] Break down the application into service/controller/view components
2. [ ] Define the settings model for the effect
3. [ ] Create service implementation
4. [ ] Create controller implementation
5. [ ] Create view implementation
6. [ ] Add to registry
7. [ ] Integrate with VisualEffectsService
8. [ ] Add store actions
9. [ ] Create unit tests
10. [ ] Implement initialization and cleanup

## 13. Common Anti-Patterns to Avoid

1. ❌ **Direct DOM manipulation in services**
   ✅ Services should only modify DOM elements provided to them

2. ❌ **Business logic in controllers**
   ✅ Controllers should delegate data operations to services

3. ❌ **Event listeners in views**
   ✅ Views should expose methods for controllers to call

4. ❌ **Hard-coded configuration**
   ✅ Use the settings model for configuration

5. ❌ **Synchronous APIs for asynchronous operations**
   ✅ Use promises or async/await for asynchronous operations

6. ❌ **Global state or singletons**
   ✅ Use dependency injection

7. ❌ **Tight coupling between components**
   ✅ Components should interact via defined interfaces

## 14. Example: Minimal Implementation

Here's a minimal example of a new visual effect:

### Service:
```javascript
class SimpleEffectService {
  constructor(dependencies) {
    this.store = dependencies.store;
    this.initialized = false;
    this.container = null;
    
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.initializeScene = this.initializeScene.bind(this);
    this.updateScene = this.updateScene.bind(this);
  }
  
  init() {
    if (this.initialized) return true;
    
    if (this.store) {
      this.unsubscribe = this.store.subscribe((state) => {
        if (this.container) {
          this.updateScene(state.simpleEffect);
        }
      });
    }
    
    this.initialized = true;
    return true;
  }
  
  initializeScene(container) {
    this.container = container;
    
    // Create simple visualization
    this.container.innerHTML = `
      <div class="simple-effect" style="width: 100%; height: 100%;">
        <div class="simple-effect-circle"></div>
      </div>
    `;
    
    // Get initial state and update
    if (this.store) {
      const state = this.store.getState().simpleEffect;
      this.updateScene(state);
    }
  }
  
  updateScene(state) {
    if (!this.container) return;
    
    const circle = this.container.querySelector('.simple-effect-circle');
    if (!circle) return;
    
    // Update based on state
    if (state.color) {
      circle.style.backgroundColor = state.color;
    }
    
    if (state.size) {
      circle.style.width = `${state.size}px`;
      circle.style.height = `${state.size}px`;
    }
  }
  
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    this.container = null;
    this.initialized = false;
  }
}
```

### Controller:
```javascript
class SimpleEffectController {
  constructor(dependencies) {
    this.simpleEffectService = dependencies.simpleEffectService;
    this.store = dependencies.store;
    this.initialized = false;
    
    this.init = this.init.bind(this);
    this.destroy = this.destroy.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleSizeChange = this.handleSizeChange.bind(this);
  }
  
  init() {
    if (this.initialized) return true;
    
    // Find DOM elements
    this.colorInput = document.getElementById('simple-effect-color');
    this.sizeInput = document.getElementById('simple-effect-size');
    
    if (this.colorInput && this.sizeInput) {
      // Set up event listeners
      this.colorInput.addEventListener('change', this.handleColorChange);
      this.sizeInput.addEventListener('input', this.handleSizeChange);
    }
    
    this.initialized = true;
    return true;
  }
  
  handleColorChange(event) {
    if (this.store) {
      this.store.dispatch(simpleEffectActions.setColor(event.target.value));
    }
  }
  
  handleSizeChange(event) {
    if (this.store) {
      this.store.dispatch(simpleEffectActions.setSize(parseInt(event.target.value)));
    }
  }
  
  destroy() {
    // Remove event listeners
    if (this.colorInput) {
      this.colorInput.removeEventListener('change', this.handleColorChange);
    }
    
    if (this.sizeInput) {
      this.sizeInput.removeEventListener('input', this.handleSizeChange);
    }
    
    this.initialized = false;
  }
}
```

By following this architecture, you ensure that all visual effects maintain consistent patterns, facilitate easy debugging, and enable robust integration with the overall system.
