# Shared Navigation Component Implementation Plan

## Overview
Create a single source of truth for navigation across all pages, ensuring consistency in layout, styling, and functionality while reducing code duplication.

## Current Issues
- Navigation HTML duplicated across multiple pages
- Inconsistent active page highlighting
- No central management for navigation state
- Menu structure not easily extensible
- Difficult to add new pages to navigation

## Goals
- Extract navigation into a reusable component
- Implement consistent active page highlighting
- Create configuration-driven menu generation
- Support nested menu items (dropdowns)
- Maintain navigation state between page loads

## Implementation Steps

### 1. Create Navigation Template (30 minutes)
- Create `public/js/components/navigation.js`
- Extract navigation HTML into template function
- Add parameters for active page configuration

```javascript
// public/js/components/navigation.js
function createNavigationMenu(container, activePageId = null) {
  // Navigation structure configuration
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', url: '/' },
    { id: 'cpu', label: 'CPU Stats', url: '/cpu' },
    { id: 'gpu', label: 'GPU Stats', url: '/gpu' },
    { id: 'system', label: 'System Info', url: '/system' },
    { id: 'svg', label: 'SVG Overlay', url: '/svg' },
    { id: 'bigquery', label: 'BigQuery', url: '/bigquery' },
    { id: 'interview', label: 'Interview Practice', url: '/interview' },
    { id: 'settings', label: 'Settings', url: '/settings' }
  ];

  // Create navigation markup
  const navHTML = `
    <nav class="main-nav">
      <ul>
        ${navItems.map(item => `
          <li>
            <a href="#" onclick="navigateTo('${item.url}')" 
              class="${item.id === activePageId ? 'active' : ''}">
              ${item.label}
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
  `;

  // Insert into container
  container.innerHTML = navHTML;
}

// Export functions
window.createNavigationMenu = createNavigationMenu;
```

### 2. Update Navigation Function (30 minutes)
- Enhance `navigation.js` for cross-page compatibility
- Add active route tracking functionality
- Implement route history management

```javascript
// Add to navigation.js
function navigateTo(page) {
  // Save current page for returning
  localStorage.setItem('lastPage', window.location.pathname);
  
  // Navigate to the requested page
  if (window.electron) {
    window.electron.navigateTo(page);
  } else {
    window.location.href = page;
  }
}

function toggleNavMenu() {
  const navMenu = document.querySelector('.main-nav');
  if (navMenu.style.display === 'none') {
    navMenu.style.display = 'block';
    localStorage.setItem('navMenuVisible', 'true');
  } else {
    navMenu.style.display = 'none';
    localStorage.setItem('navMenuVisible', 'false');
  }
}

// Initialize nav menu visibility from stored state
function initNavMenuState() {
  const navMenu = document.querySelector('.main-nav');
  const storedState = localStorage.getItem('navMenuVisible');
  
  if (storedState === 'false') {
    navMenu.style.display = 'none';
  }
}

// Determine active page from current URL
function getActivePageId() {
  const path = window.location.pathname;
  
  // Handle root path
  if (path === '/' || path === '') return 'dashboard';
  
  // Strip leading slash and potential trailing slash
  const cleanPath = path.replace(/^\/|\/$/g, '');
  
  // Special case for subpages
  if (cleanPath.startsWith('bigquery/')) return 'bigquery';
  if (cleanPath.startsWith('interview/')) return 'interview';
  
  return cleanPath;
}

// Export functions
window.navigateTo = navigateTo;
window.toggleNavMenu = toggleNavMenu;
window.initNavMenuState = initNavMenuState;
window.getActivePageId = getActivePageId;
```

### 3. Integrate Navigation Component (45 minutes)
- Update all HTML pages to use the shared component
- Add script tag to load the navigation component
- Initialize navigation with correct active page

Example integration (for each page):
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Existing head content -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
</head>
<body>
  <!-- Navigation container -->
  <div id="nav-container"></div>
  
  <!-- Rest of page content -->
  <div class="container">
    <!-- Page-specific content -->
  </div>

  <!-- Scripts -->
  <script src="../../js/components/navigation.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Create navigation with active page
      const navContainer = document.getElementById('nav-container');
      createNavigationMenu(navContainer, getActivePageId());
      initNavMenuState();
    });
  </script>
</body>
</html>
```

### 4. Add Dropdown Support (60 minutes)
- Enhance navigation component to support dropdown submenus
- Add CSS for dropdown styling
- Implement dropdown toggle functionality

```javascript
// Add to navigation.js - Enhanced menu structure
function createNavigationMenu(container, activePageId = null) {
  // Navigation structure with dropdowns
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', url: '/' },
    { id: 'hardware', label: 'Hardware', children: [
      { id: 'cpu', label: 'CPU Stats', url: '/cpu' },
      { id: 'gpu', label: 'GPU Stats', url: '/gpu' },
      { id: 'system', label: 'System Info', url: '/system' }
    ]},
    { id: 'svg', label: 'SVG Overlay', url: '/svg' },
    { id: 'gcp', label: 'GCP', children: [
      { id: 'bigquery', label: 'BigQuery', url: '/bigquery' },
      { id: 'cloudiam', label: 'Cloud IAM', url: '/cloudiam' }
    ]},
    { id: 'interview', label: 'Interview Practice', url: '/interview' },
    { id: 'settings', label: 'Settings', url: '/settings' }
  ];

  // Create HTML with dropdown support
  const navHTML = `
    <nav class="main-nav">
      <ul>
        ${renderMenuItems(navItems, activePageId)}
      </ul>
    </nav>
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
  `;
  
  container.innerHTML = navHTML;
  
  // Add dropdown toggle functionality
  setupDropdowns();
}

// Helper function to render menu items recursively
function renderMenuItems(items, activePageId) {
  return items.map(item => {
    // Check if item or any child is active
    const isActive = checkIfActive(item, activePageId);
    
    if (item.children) {
      // Render dropdown
      return `
        <li class="dropdown ${isActive ? 'active' : ''}">
          <a href="#" class="dropdown-toggle ${isActive ? 'active' : ''}">${item.label} ▾</a>
          <ul class="dropdown-menu">
            ${renderMenuItems(item.children, activePageId)}
          </ul>
        </li>
      `;
    } else {
      // Render regular item
      return `
        <li>
          <a href="#" onclick="navigateTo('${item.url}')" 
            class="${item.id === activePageId ? 'active' : ''}">
            ${item.label}
          </a>
        </li>
      `;
    }
  }).join('');
}

// Helper function to check if item or any child is active
function checkIfActive(item, activePageId) {
  if (item.id === activePageId) return true;
  
  if (item.children) {
    return item.children.some(child => checkIfActive(child, activePageId));
  }
  
  return false;
}

// Setup dropdown toggle behavior
function setupDropdowns() {
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const parentLi = this.parentElement;
      const dropdownMenu = parentLi.querySelector('.dropdown-menu');
      
      // Toggle active class
      parentLi.classList.toggle('active');
      
      // Store dropdown state
      const dropdownId = parentLi.querySelector('a').textContent.trim();
      const isActive = parentLi.classList.contains('active');
      localStorage.setItem(`dropdown_${dropdownId}`, isActive ? 'open' : 'closed');
    });
  });
}

// Restore dropdown states
function restoreDropdownStates() {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const dropdownId = dropdown.querySelector('a').textContent.trim();
    const storedState = localStorage.getItem(`dropdown_${dropdownId}`);
    
    if (storedState === 'open') {
      dropdown.classList.add('active');
    }
  });
}
```

### 5. Add Dropdown CSS Styles (30 minutes)
- Create or update CSS for dropdown navigation
- Ensure consistent styling across all pages

```css
/* Add to public/css/navigation/main-nav.css */

/* Dropdown menu styles */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 170, 255, 0.5);
  border-radius: 4px;
  min-width: 150px;
  z-index: 2100;
}

.dropdown.active .dropdown-menu {
  display: block;
}

.dropdown-menu li {
  margin: 0;
}

.dropdown-menu a {
  padding: 8px 12px;
  display: block;
  white-space: nowrap;
}

.dropdown-menu a:hover {
  background-color: rgba(0, 170, 255, 0.3);
}
```

### 6. Test Navigation Component (45 minutes)
- Create basic tests for navigation functionality
- Verify active page highlighting works correctly
- Test navigation state persistence
- Validate dropdown behavior

```javascript
// public/js/tests/navigation-test.js
function testNavigationComponent() {
  console.log('Testing navigation component...');
  
  // Test active page detection
  const tests = [
    { path: '/', expected: 'dashboard' },
    { path: '/cpu', expected: 'cpu' },
    { path: '/bigquery', expected: 'bigquery' },
    { path: '/bigquery/details', expected: 'bigquery' }
  ];
  
  let passCount = 0;
  
  // Mock location for testing
  const originalLocation = window.location;
  
  tests.forEach(test => {
    // Mock window.location
    delete window.location;
    window.location = new URL(`http://localhost${test.path}`);
    
    const result = getActivePageId();
    const passed = result === test.expected;
    
    console.log(`Path: ${test.path}, Expected: ${test.expected}, Got: ${result} - ${passed ? 'PASS' : 'FAIL'}`);
    
    if (passed) passCount++;
  });
  
  // Restore original location
  window.location = originalLocation;
  
  console.log(`${passCount}/${tests.length} tests passed`);
}

// Run tests
// Uncomment to run: testNavigationComponent();
```

## Results and Benefits
- Single source of truth for navigation structure
- Consistent appearance and behavior across pages
- Easy to add new navigation items
- Support for nested menu structure
- Persistent navigation state between pages
- Reduced code duplication and maintenance overhead
