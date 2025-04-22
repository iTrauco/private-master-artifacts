# OBS Hardware Overlay - Design Patterns & Styling Architecture

## Design Patterns

### 1. Module Pattern
The application extensively uses the JavaScript module pattern to encapsulate functionality and create reusable components. This is evident in:

- Module exports in backend code (`hardware-info.js`)
- Frontend UI component modules (`cpu-panel.js`, `gpu-panel.js`)
- Data service module exposing a public API

Example from `server/utils/hardware-info.js`:
```javascript
// Module with private functions exposed through a public API
module.exports = {
    getCpuInfo,
    getGpuInfo,
    getMemoryInfo
};
```

### 2. Service Pattern
The application implements a service pattern for data access through the `DataService` object, which:

- Abstracts the data fetching mechanism
- Handles polling for real-time updates
- Centralizes error handling
- Provides a callback mechanism for UI updates

Example from `public/js/modules/data-service.js`:
```javascript
window.DataService = {
    fetchHardwareData: function(callback) { ... },
    startPolling: function(callback, interval = 1000) { ... },
    stopPolling: function(intervalId) { ... }
};
```

### 3. Observer Pattern
The application uses a callback-based observer pattern for updating UI components when new data arrives:

- The data service fetches data and notifies observers
- UI components register as observers by providing callbacks
- UI updates occur in response to data changes

### 4. Facade Pattern
The preload script in Electron implements a facade pattern to provide a simplified interface to IPC functionality:

```javascript
contextBridge.exposeInMainWorld(
  'electron',
  {
    navigateTo: (page) => {
      ipcRenderer.send('navigate', page);
    },
    closeWindow: () => {
      ipcRenderer.send('close-window');
    }
  }
);
```

### 5. Routes and Controller Pattern
The Express backend uses a routes pattern to organize API endpoints and page serving:

- Routes are modularized by function
- Controllers are abstracted in utility functions
- Clean separation of concerns between routes and business logic

## Styling Architecture

The application uses a modular, component-based CSS architecture with a clear organization pattern:

### 1. CSS Organization

```
public/css/
  ├── base/                 # Base styles and resets
  │   ├── global.css        # Global styles
  │   └── reset.css         # CSS reset
  ├── components/           # Reusable UI components
  │   ├── buttons.css       # Button styles
  │   ├── charts.css        # Chart visualization styles
  │   └── panels.css        # Panel container styles
  ├── layout/               # Layout utilities
  │   ├── grid.css          # Grid system
  │   └── positioning.css   # Positioning utilities
  └── navigation/           # Navigation elements
      ├── controls.css      # Hardware controls
      └── main-nav.css      # Main navigation bar
```

### 2. Styling Principles

#### Component-Based CSS
Each UI component has its own CSS file with scoped classes, promoting:
- Reusability
- Maintainability
- Isolation of styles

#### CSS Class Naming
The CSS follows a functional/semantic naming convention:
- `.panel` - Base component class
- `.gpu-panel`, `.cpu-panel` - Component variants
- `.panel-title`, `.stats` - Component elements
- `.position-top-right` - Utility classes

#### Responsive Design Considerations
The application includes:
- Percentage-based layouts
- Grid systems for alignment
- Positioning utilities for responsive placement

#### Visual Styling Patterns
Consistent styling patterns across components:
- Semi-transparent dark backgrounds (`rgba(0, 0, 0, 0.6)`)
- Blue accent color (`rgba(0, 170, 255, 0.7)`)
- Consistent border-radius values (4-8px)
- Gradient-based status indicators

### 3. Animation and Visual Feedback
The application defines animations for dynamic elements:
```css
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 4. Canvas Rendering