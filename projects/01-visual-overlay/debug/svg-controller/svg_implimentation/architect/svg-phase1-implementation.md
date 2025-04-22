# SVG Overlay Implementation - Phase 1 Technical Guide

## Overview
Phase 1 focuses on establishing the foundation for the SVG Overlay feature. We'll set up the directory structure, implement the basic server-side components, and create the API endpoints necessary for SVG file management.

## Directory Structure to Create
```
server/
  ├── routes/
  │   ├── api/
  │   │   └── svg.js          # NEW: SVG-specific API endpoints
  │   └── pages.js           # MODIFY: Add route for SVG page
  └── utils/
      └── svg/               # NEW: SVG utility directory
          └── scanner.js     # NEW: Directory scanning functions

public/
  ├── css/
  │   └── svg/               # NEW: SVG styles directory
  │       └── base.css       # NEW: Placeholder for base styles
  ├── js/
  │   └── svg/               # NEW: SVG JavaScript directory
  │       └── services/      # NEW: SVG services directory
  └── pages/
      └── svg/               # NEW: SVG pages directory
          └── index.html     # NEW: Basic placeholder page

public/assets/
  └── svgs/                  # NEW: Directory for SVG file storage
      └── sample1.svg        # NEW: Sample SVG file for testing

test/
  └── unit/
      └── routes/
          └── api/
              └── svg.test.js # NEW: Tests for SVG API endpoints
```

## Files to Create/Modify

### 1. Server-Side Components

#### A. Create `server/routes/api/svg.js`
```javascript
// server/routes/api/svg.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const svgScanner = require('../../utils/svg/scanner');

// GET /api/svg/list - Get list of available SVG files
router.get('/list', async (req, res) => {
  try {
    const svgFiles = await svgScanner.getSvgFiles();
    res.json(svgFiles);
  } catch (error) {
    console.error('Error fetching SVG files:', error);
    res.status(500).json({ error: 'Failed to retrieve SVG files' });
  }
});

module.exports = router;
```

#### B. Create `server/utils/svg/scanner.js`
```javascript
// server/utils/svg/scanner.js
const fs = require('fs').promises;
const path = require('path');

/**
 * SVG Scanner Utility
 * Handles scanning directories for SVG files
 */
const svgScanner = {
  /**
   * Get all SVG files from the assets directory
   * @returns {Promise<Array>} Array of SVG file objects
   */
  getSvgFiles: async function () {
    try {
      const svgDir = path.join(__dirname, '../../../public/assets/svgs');
      const files = await fs.readdir(svgDir);
      
      // Filter for SVG files and create objects with metadata
      const svgFiles = files
        .filter(file => file.toLowerCase().endsWith('.svg'))
        .map(file => ({
          id: file.replace('.svg', ''),
          name: file,
          path: `/assets/svgs/${file}`
        }));
      
      return svgFiles;
    } catch (error) {
      console.error('Error scanning SVG directory:', error);
      return [];
    }
  }
};

module.exports = svgScanner;
```

#### C. Modify `server/routes/pages.js` to add the SVG route
Add this to the existing `pages.js` file:
```javascript
// Add to server/routes/pages.js
// SVG Overlay route
router.get('/svg', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/pages/svg/index.html'));
});
```

#### D. Modify `server/server.js` to include the new SVG API route
Add these lines to the existing `server.js` file:
```javascript
// Add to the imports section
const svgApiRoutes = require('./routes/api/svg');

// Add to the routes mounting section
app.use('/api/svg', svgApiRoutes);
```

### 2. Client-Side Components

#### A. Create `public/pages/svg/index.html` (basic placeholder)
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
</head>
<body>
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
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
    
    <div id="svg-placeholder">
      <h2>SVG Overlay Feature</h2>
      <p>This feature is currently under development. Phase 1 setup is complete.</p>
    </div>
  </div>
  
  <!-- Core Scripts -->
  <script src="../../js/navigation.js"></script>
</body>
</html>
```

#### B. Create `public/css/svg/base.css` (placeholder styles)
```css
/* Basic SVG Overlay styles */
#svg-placeholder {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 170, 255, 0.7);
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  text-align: center;
  color: white;
}

#svg-placeholder h2 {
  margin-bottom: 10px;
  color: rgba(0, 170, 255, 0.9);
}
```

#### C. Create a sample SVG file for testing
Create a file at `public/assets/svgs/sample1.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="rgba(0, 170, 255, 0.7)" />
  <text x="50" y="55" text-anchor="middle" fill="white" font-family="Arial" font-size="12">Sample SVG</text>
</svg>
```

## Tests to Implement

### 1. Create `test/unit/routes/api/svg.test.js`
```javascript
// test/unit/routes/api/svg.test.js
const request = require('supertest');
const express = require('express');
const svgRoutes = require('../../../../server/routes/api/svg');

// Mock the svg scanner module
jest.mock('../../../../server/utils/svg/scanner', () => ({
  getSvgFiles: jest.fn()
}));

describe('SVG API Routes', () => {
  let app;
  
  beforeEach(() => {
    // Create a fresh Express app and mount our routes for each test
    app = express();
    app.use('/api/svg', svgRoutes);
    
    // Reset and setup mocks
    const svgScanner = require('../../../../server/utils/svg/scanner');
    
    // Mock sample SVG files for testing
    svgScanner.getSvgFiles.mockResolvedValue([
      {
        id: 'sample1',
        name: 'sample1.svg',
        path: '/assets/svgs/sample1.svg'
      },
      {
        id: 'sample2',
        name: 'sample2.svg',
        path: '/assets/svgs/sample2.svg'
      }
    ]);
  });
  
  describe('GET /api/svg/list', () => {
    it('should return a list of SVG files', async () => {
      const response = await request(app).get('/list');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id', 'sample1');
      expect(response.body[0]).toHaveProperty('name', 'sample1.svg');
      expect(response.body[0]).toHaveProperty('path', '/assets/svgs/sample1.svg');
    });
    
    it('should handle errors when scanning for SVG files', async () => {
      // Set up the mock to return an error
      const svgScanner = require('../../../../server/utils/svg/scanner');
      svgScanner.getSvgFiles.mockRejectedValue(new Error('Test error'));
      
      const response = await request(app).get('/list');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### 2. Create `test/unit/utils/svg/scanner.test.js`
```javascript
// test/unit/utils/svg/scanner.test.js
const svgScanner = require('../../../../server/utils/svg/scanner');
const fs = require('fs').promises;
const path = require('path');

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn()
  }
}));

// Mock path.join to return predictable paths
jest.mock('path', () => ({
  join: jest.fn(() => '/mocked/path/to/svgs')
}));

describe('SVG Scanner Utility', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('getSvgFiles', () => {
    it('should return formatted SVG file objects', async () => {
      // Mock readdir to return sample files
      fs.readdir.mockResolvedValue(['sample1.svg', 'sample2.svg', 'notsvg.txt']);
      
      const result = await svgScanner.getSvgFiles();
      
      // Verify correct files are returned and formatted
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'sample1',
        name: 'sample1.svg',
        path: '/assets/svgs/sample1.svg'
      });
      expect(result[1]).toEqual({
        id: 'sample2',
        name: 'sample2.svg',
        path: '/assets/svgs/sample2.svg'
      });
      
      // Verify fs.readdir was called
      expect(fs.readdir).toHaveBeenCalledWith('/mocked/path/to/svgs');
    });
    
    it('should return an empty array when an error occurs', async () => {
      // Mock readdir to throw an error
      fs.readdir.mockRejectedValue(new Error('Directory not found'));
      
      const result = await svgScanner.getSvgFiles();
      
      // Should return empty array on error
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
```

## Code Standards

Follow these code standards throughout the implementation:

1. **File and Directory Naming**:
   - Use kebab-case for directory names and file names (e.g., `svg-scanner.js`)
   - Use `.js` extension for JavaScript files, `.css` for stylesheets, and `.html` for HTML files

2. **JavaScript Coding Standards**:
   - Use ES6 syntax where appropriate
   - Use `const` for variables that don't change, `let` for variables that do
   - Use async/await for asynchronous operations
   - Add JSDoc comments for functions and classes
   - Use meaningful variable and function names
   - Include error handling for all async operations
   - Use consistent indentation (2 spaces)

3. **CSS Coding Standards**:
   - Use descriptive class names
   - Group related styles together
   - Use comments to separate sections
   - Keep selectors as simple as possible
   - Use consistent indentation (2 spaces)

4. **HTML Coding Standards**:
   - Use semantic HTML elements
   - Add descriptive IDs and classes
   - Maintain consistent indentation (2 spaces)
   - Include proper doctype and charset declarations

5. **Testing Standards**:
   - Test both success and error cases
   - Use descriptive test names
   - Mock external dependencies
   - Follow AAA pattern (Arrange, Act, Assert)
   - Create focused tests that test one thing at a time

## Implementation Steps

1. Create all the necessary directories
2. Implement the server-side components:
   - Create the SVG scanner utility
   - Implement the SVG API routes
   - Add the SVG page route
   - Update the server.js file
3. Create basic client-side components:
   - Add the SVG page placeholder
   - Add basic CSS
   - Add sample SVG files
4. Implement tests:
   - Write tests for API routes
   - Write tests for SVG scanner utility
5. Run the tests to verify functionality
6. Manually verify by accessing the routes in a browser

## Success Criteria

Phase 1 is complete when:

1. All directories and files are created with the proper structure
2. The server can be started without errors
3. The `/svg` page route loads the placeholder page
4. The `/api/svg/list` endpoint returns a list of SVG files
5. All tests pass

## Next Steps

After completing Phase 1, proceed to Phase 2, which will focus on implementing the HTML and CSS structure for the SVG Overlay feature.
