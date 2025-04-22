# SVG Overlay Implementation Strategy

## Detailed Current Structure Analysis

### 1. Server-Side Structure
```
server/
├── routes/
│   ├── api/
│   │   └── hardware.js         # Hardware API endpoints
│   └── pages.js                # Page routing
├── utils/
│   └── hardware-info.js        # Hardware data collection
└── server.js                   # Main Express server
```

### 2. Client-Side Structure
```
public/
├── css/
│   ├── base/                   # Base styles
│   ├── components/             # Component-specific styles
│   ├── layout/                 # Layout utilities
│   └── navigation/             # Navigation styles
├── js/
│   ├── modules/
│   │   ├── cpu-panels.js       # CPU visualization
│   │   ├── data-service.js     # Data fetching service
│   │   ├── gpu-panel.js        # GPU visualization
│   │   └── system-panel.js     # System info visualization
│   ├── main.js                 # Main entry point
│   └── navigation.js           # Navigation utilities
└── pages/                      # Individual pages
    ├── cpu.html
    ├── dashboard.html
    ├── gpu.html
    ├── settings.html
    └── system.html
```

### 3. Electron Structure
```
electron-app.js                # Main Electron process
preload.js                     # Preload script for IPC
```

## Proposed SVG Overlay Structure

For a fully isolated SVG overlay feature, I recommend this structure:

```
server/
├── routes/
│   ├── api/
│   │   ├── hardware.js
│   │   └── svg/                # NEW: SVG-specific API endpoints
│   │       └── templates.js    # NEW: SVG template management
│   └── pages.js               # Updated with SVG route
└── utils/
    ├── hardware-info.js
    └── svg/                   # NEW: SVG utility functions
        └── parser.js          # NEW: SVG parsing/manipulation

public/
├── css/
│   └── svg/                   # NEW: SVG-specific styles
│       ├── base.css           # NEW: Base SVG styles
│       ├── controls.css       # NEW: SVG control panel styles
│       └── editor.css         # NEW: SVG editor styles
├── js/
│   ├── svg/                   # NEW: SVG-specific JS modules
│   │   ├── components/        # NEW: SVG UI components
│   │   │   ├── editor.js      # NEW: SVG editor component
│   │   │   ├── library.js     # NEW: SVG template library
│   │   │   └── preview.js     # NEW: SVG preview component
│   │   ├── services/          # NEW: SVG-specific services
│   │   │   ├── svg-service.js # NEW: SVG data service
│   │   │   └── export.js      # NEW: SVG export service
│   │   └── utils/             # NEW: SVG utility functions
│   │       ├── parser.js      # NEW: Frontend SVG parsing
│   │       └── transform.js   # NEW: SVG transformation utilities
│   └── modules/               # Existing modules unchanged
└── pages/
    ├── svg/                   # NEW: SVG-specific pages
    │   ├── editor.html        # NEW: SVG editor page
    │   ├── library.html       # NEW: SVG template library
    │   └── preview.html       # NEW: SVG preview page
    └── [existing pages]       # Unmodified existing pages
```

## Implementation Strategy

### 1. Isolate the SVG Feature

Create a completely separate directory structure for SVG-related code:

- **Separate routes**: Create a dedicated `/api/svg` route directory
- **Separate pages**: Create a `/pages/svg` directory
- **Separate styles**: Create a `/css/svg` directory
- **Separate JavaScript**: Create a `/js/svg` directory

### 2. Create a Dedicated SVG Service

Unlike the current `DataService` which is exposed globally, create a modular SVG service:

```javascript
// public/js/svg/services/svg-service.js
export default class SvgService {
  constructor() {
    // Initialize service
  }
  
  // SVG-specific methods
  loadTemplate(id) { /* ... */ }
  saveTemplate(svg) { /* ... */ }
  // etc.
}
```

### 3. Component Isolation

Each SVG component should be self-contained:

```javascript
// public/js/svg/components/editor.js
import SvgService from '../services/svg-service.js';

export default class SvgEditor {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.service = new SvgService();
    // No dependencies on hardware components
  }
  
  init() { /* ... */ }
  // Component-specific methods
}
```

### 4. Page Integration

The SVG pages would only load SVG-specific JavaScript:

```html
<!-- public/pages/svg/editor.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- Base styles -->
  <link rel="stylesheet" href="../../css/base/reset.css">
  <link rel="stylesheet" href="../../css/base/global.css">
  
  <!-- SVG-specific styles only -->
  <link rel="stylesheet" href="../../css/svg/base.css">
  <link rel="stylesheet" href="../../css/svg/editor.css">
  
  <!-- Navigation is the only shared component -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="main-nav">
    <!-- Include SVG pages in navigation -->
  </nav>
  
  <!-- SVG-specific content -->
  <div id="svg-editor-container"></div>
  
  <!-- Only include necessary scripts -->
  <script src="../../js/navigation.js"></script>
  <script type="module">
    import SvgEditor from '../../js/svg/components/editor.js';
    
    // Initialize only SVG components
    const editor = new SvgEditor('svg-editor-container');
    editor.init();
  </script>
</body>
</html>
```

### 5. Route Registration

Add SVG routes to the Express server, but keep them isolated:

```javascript
// server/routes/pages.js
router.get('/svg/editor', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/pages/svg/editor.html'));
});

router.get('/svg/library', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/pages/svg/library.html'));
});

router.get('/svg/preview', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/pages/svg/preview.html'));
});
```

## Benefits of This Approach

1. **Complete isolation**: SVG feature has its own directory structure
2. **Zero coupling**: No dependencies on hardware components
3. **Independent development**: Can develop, test, and deploy SVG features without affecting hardware metrics
4. **Clear organization**: Easy to understand the codebase structure
5. **Future extensibility**: This pattern can be reused for Three.js or other visualization types

This strategy ensures that the SVG overlay feature is truly independent while still fitting into the overall application architecture. It allows you to work on the feature without worrying about breaking existing functionality.
