# SVG Overlay Troubleshooting Guide

## Overview of Issues

Your SVG Overlay implementation has two main categories of issues:

1. **Module Import/Export Inconsistencies**: Mixing ES modules (import/export) with CommonJS (require/module.exports)
2. **UI Debugging Requirements**: The UI is working but needs optimization and bug fixes

This guide provides a systematic approach to resolve these issues.

## Part 1: Fixing Module Import/Export Inconsistencies

### Step 1: Analyze Your Current Environment

First, determine what module system your environment supports:

```bash
# Check your package.json for:
# - "type": "module" (ES modules as default)
# - No "type" field (CommonJS as default)
```

Based on your Electron setup, you're likely using CommonJS for server-side code and ES Modules for client-side code.

### Step 2: Standardize Server-Side Code (Node.js/Electron)

Convert all server-side files to use CommonJS:

1. **In `server/routes/api/svg.js`**:
   ```javascript
   // Change from:
   export default router;
   
   // To:
   module.exports = router;
   ```

2. **In `server/utils/svg/scanner.js`**:
   ```javascript
   // Change from:
   export default svgScanner;
   
   // To:
   module.exports = svgScanner;
   ```

### Step 3: Standardize Client-Side Code (Browser)

Ensure all client-side JavaScript uses ES modules consistently:

1. **Check all import statements**:
   ```javascript
   // Update any require() statements to:
   import moduleName from './path/to/module.js';
   
   // For non-default exports:
   import { namedExport } from './path/to/module.js';
   ```

2. **Add file extensions to imports**:
   ```javascript
   // Change:
   import svgService from '../services/svg-service';
   
   // To:
   import svgService from '../services/svg-service.js';
   ```

3. **Fix export statements**:
   ```javascript
   // Change:
   module.exports = SvgService;
   
   // To:
   export default SvgService;
   // OR for named exports:
   export { SvgService };
   ```

### Step 4: Update HTML Script Tags

Ensure all script tags that load ES modules have the `type="module"` attribute:

```html
<!-- Change: -->
<script src="../../js/svg/controllers/svg-controller.js"></script>

<!-- To: -->
<script type="module" src="../../js/svg/controllers/svg-controller.js"></script>
```

### Step 5: Fix Test Files

Modify Jest test files to use the correct module system:

1. **Update test file imports**:
   ```javascript
   // Change:
   import svgController from '../../public/js/svg/controllers/svg-controller';
   
   // To Node.js-compatible imports:
   const svgController = require('../../public/js/svg/controllers/svg-controller');
   ```

2. **Configure Jest to handle ES modules**:
   Add to your Jest configuration (in package.json or jest.config.js):
   ```json
   "transformIgnorePatterns": [
     "node_modules/(?!(module-that-needs-to-be-transformed)/)"
   ],
   "transform": {
     "^.+\\.jsx?$": "babel-jest"
   }
   ```

3. **Create a Babel configuration**:
   Create a `.babelrc` file:
   ```json
   {
     "presets": [
       ["@babel/preset-env", { "targets": { "node": "current" } }]
     ]
   }
   ```

## Part 2: UI Debugging Steps

### Step 1: Console Error Analysis

1. **Check browser console for errors**:
   - Open Developer Tools (F12)
   - Look for errors in the Console tab
   - Note down all errors with their locations

2. **Categorize errors**:
   - Module loading errors
   - DOM manipulation errors
   - Event handling errors

### Step 2: SVG Loading and Display Issues

1. **Debug SVG loading**:
   ```javascript
   // Add to svg-service.js loadSvgFiles method:
   async loadSvgFiles() {
     try {
       console.log('Fetching SVG files from:', '/api/svg/list');
       const response = await fetch('/api/svg/list');
       
       if (!response.ok) {
         console.error('SVG API response not OK:', response.status, response.statusText);
         throw new Error('Failed to load SVGs');
       }
       
       const data = await response.json();
       console.log('SVG files loaded:', data);
       
       this.svgFiles = data;
       this.dispatchEvent('svgFilesLoaded', this.svgFiles);
       
       return this.svgFiles;
     } catch (error) {
       console.error('Error loading SVG files:', error);
       return [];
     }
   }
   ```

2. **Debug SVG display**:
   ```javascript
   // Add to createSvgElement method:
   async createSvgElement(svgInstance, parentContainer = null) {
     console.log('Creating SVG element:', svgInstance);
     
     // Rest of the method...
     
     // After fetch:
     try {
       console.log('Fetching SVG from path:', svgInstance.path);
       const response = await fetch(svgInstance.path);
       
       if (!response.ok) {
         console.error('SVG content fetch failed:', response.status, response.statusText);
         throw new Error('Failed to load SVG');
       }
       
       const svgContent = await response.text();
       console.log('SVG content length:', svgContent.length);
       svgContainer.innerHTML += svgContent;
       
       // Rest of the method...
     } catch (error) {
       console.error('Error loading SVG content:', error);
       svgContainer.innerHTML += `<div class="svg-error">Error loading SVG: ${error.message}</div>`;
     }
   }
   ```

### Step 3: Event Handling Debugging

1. **Verify event listener connections**:
   ```javascript
   // In svg-controller.js setupEventListeners method:
   setupEventListeners() {
     console.log('Setting up event listeners');
     
     // Add these to debug event bindings:
     if (this.loadSvgsBtn) {
       console.log('Load SVGs button found');
       this.loadSvgsBtn.addEventListener('click', () => {
         console.log('Load SVGs button clicked');
         this.loadSvgFiles();
       });
     } else {
       console.error('Load SVGs button not found in DOM');
     }
     
     // Repeat for other event listeners...
   }
   ```

2. **Debug SVG selection and quadrant interaction**:
   ```javascript
   handleSvgSelection(svgId) {
     console.log('SVG selected:', svgId);
     this.selectedSvgId = svgId;
     this.renderSvgFiles(svgService.svgFiles);
   }
   
   handleQuadrantClick(event, quadrant) {
     console.log('Quadrant clicked:', quadrant);
     console.log('Selected SVG ID:', this.selectedSvgId);
     
     // Only proceed if we have a selected SVG
     if (!this.selectedSvgId) {
       console.log('No SVG selected, ignoring quadrant click');
       return;
     }
     
     // Display the selected SVG in this quadrant
     console.log('Displaying SVG in quadrant:', this.selectedSvgId, quadrant);
     svgService.displaySvgInQuadrant(this.selectedSvgId, quadrant);
   }
   ```

### Step 4: Drag Functionality Debugging

1. **Debug drag mode toggling**:
   ```javascript
   // In drag-manager.js
   toggleDragMode() {
     console.log('Toggling drag mode, current state:', this.dragEnabled);
     
     if (this.dragEnabled) {
       this.disableDragMode();
     } else {
       this.enableDragMode();
     }
   }
   ```

2. **Debug mouse event handling**:
   ```javascript
   // In drag-manager.js
   handleMouseDown(e) {
     console.log('Mouse down event:', e.target.dataset.instanceId);
     if (!this.dragEnabled || e.button !== 0) {
       console.log('Ignoring mouse down: dragEnabled=', this.dragEnabled, 'button=', e.button);
       return;
     }
     
     // Rest of the method...
   }
   
   handleMouseMove(e) {
     if (!this.isDragging || !this.currentElement) {
       return;
     }
     
     // Log every 100px moved to avoid console flooding
     if (e.clientX % 100 < 10 && e.clientY % 100 < 10) {
       console.log('Dragging to:', e.clientX, e.clientY);
     }
     
     // Rest of the method...
   }
   ```

## Part 3: Common Issues and Fixes

### Issue 1: SVG Files Not Loading

**Fix:**
1. Verify your SVG directory structure:
   ```bash
   # Create this directory if it doesn't exist:
   mkdir -p public/assets/svgs
   ```

2. Add sample SVG files to test with:
   ```bash
   # Copy some SVG files to:
   public/assets/svgs/
   ```

3. Check API endpoint in browser:
   ```
   http://localhost:3000/api/svg/list
   ```

### Issue 2: SVG Not Appearing in Quadrants

**Fix:**
1. Check CSS styles in the browser inspector
2. Verify the SVG container is positioned correctly
3. Check if SVG content is being loaded properly

### Issue 3: Drag Functionality Not Working

**Fix:**
1. Verify drag mode is enabled
2. Check if SVG elements have the correct classes
3. Inspect the element to see if event listeners are attached
4. Test with this debugging code:
   ```javascript
   // Add to a draggable SVG container:
   console.log('Element should be draggable:', 
     document.querySelector('.svg-container').classList.contains('draggable'));
   ```

## Part 4: Final Testing Procedure

1. **Frontend Module Testing**:
   ```javascript
   // Add to the end of each service/controller file:
   console.log('Module loaded successfully:', 'file-name.js');
   ```

2. **Event Flow Testing**:
   - Load the page and check console for module loading messages
   - Click the "Load SVGs" button and verify API call
   - Select an SVG and verify selection state
   - Click a quadrant and verify SVG display
   - Test visibility toggle, fullscreen, and removal
   - Enable drag mode and test dragging functionality

3. **Run the Updated Tests**:
   ```bash
   npm test
   ```

## Conclusion

Following this systematic approach should resolve both the module inconsistency issues and the UI debugging requirements. Remember to:

1. Stick to one module system per environment (CommonJS for server, ES Modules for browser)
2. Add proper debug logging to identify the exact points of failure
3. Check the browser console frequently for error messages
4. Test each functionality incrementally before moving to the next one

Once these steps are completed, your SVG Overlay feature should work correctly with all functionality operational as designed.
