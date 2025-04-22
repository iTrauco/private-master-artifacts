# Modular Route Organization Implementation Plan

## Overview
This segment refactors the server-side routing system to create a modular, maintainable structure that separates concerns and reduces complexity in the main server.js file.

## Implementation Steps with Logging

### 1. Add Enhanced Logging Setup (15 minutes)

Create a new logger utility at `server/utils/logger.js`:

```javascript
// server/utils/logger.js
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log file streams
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'), 
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'), 
  { flags: 'a' }
);

// Simple logger implementation
const logger = {
  info: (message) => {
    const logEntry = `[INFO] ${new Date().toISOString()} - ${message}\n`;
    console.log(logEntry);
    accessLogStream.write(logEntry);
  },
  
  error: (message, error) => {
    const errorDetails = error ? `\n${error.stack || error}` : '';
    const logEntry = `[ERROR] ${new Date().toISOString()} - ${message}${errorDetails}\n`;
    console.error(logEntry);
    errorLogStream.write(logEntry);
  },
  
  request: (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logEntry = `[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url} ${res.statusCode} ${duration}ms\n`;
      accessLogStream.write(logEntry);
    });
    next();
  }
};

module.exports = logger;
```

Update the server.js file to use the logger:

```javascript
// At the top of server.js
const logger = require('./utils/logger');

// Add logger middleware
app.use(logger.request);

// In the server start section
const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`API endpoint: http://localhost:${PORT}/api/hardware`);
});
```

### 2. Create Routes Index File (30 minutes)

Create a centralized index.js in the routes directory:

```javascript
// server/routes/index.js
const express = require('express');
const logger = require('../utils/logger');

// Import route modules
const pageRoutes = require('./pages');
const apiRoutes = {
  hardware: require('./api/hardware'),
  svg: require('./api/svg'),
  bigquery: require('./api/bigquery'),
  interview: require('./api/interview'),
  // Add other API routes here
};

function setupRoutes(app) {
  logger.info('Setting up routes...');
  
  // Mount page routes
  app.use('/', pageRoutes);
  logger.info('✓ Page routes mounted');
  
  // Mount API routes
  Object.entries(apiRoutes).forEach(([name, router]) => {
    app.use(`/api/${name}`, router);
    logger.info(`✓ API routes mounted at /api/${name}`);
  });
  
  // Error handling for routes
  app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.status = 404;
    logger.error(`404 - Route not found: ${req.originalUrl}`);
    next(error);
  });
  
  app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    logger.error(`Error ${statusCode} - ${err.message}`, err);
    res.status(statusCode).json({
      error: err.message,
      status: statusCode
    });
  });
  
  logger.info('All routes set up successfully');
}

module.exports = setupRoutes;
```

### 3. Standardize API Route Structure (45 minutes)

Create a base route template for consistency:

```javascript
// server/utils/route-template.js
const express = require('express');
const logger = require('./logger');

/**
 * Creates a standardized API router with consistent error handling
 * @param {string} name - Route name for logging
 * @param {function} setupRoutes - Function to set up specific routes
 * @returns {express.Router} Configured router
 */
function createApiRouter(name, setupRoutes) {
  const router = express.Router();
  
  // Log all requests to this router
  router.use((req, res, next) => {
    logger.info(`API Request: [${name}] ${req.method} ${req.path}`);
    next();
  });
  
  // Setup the specific routes
  setupRoutes(router);
  
  // Add route-specific error handler
  router.use((err, req, res, next) => {
    logger.error(`API Error [${name}]: ${err.message}`, err);
    
    // Pass to main error handler
    next(err);
  });
  
  return router;
}

module.exports = createApiRouter;
```

### 4. Refactor Hardware API Routes (30 minutes)

Update the hardware API routes to use the new structure:

```javascript
// server/routes/api/hardware.js
const createApiRouter = require('../../utils/route-template');
const { getCpuInfo, getGpuInfo, getMemoryInfo } = require('../../utils/hardware-info');
const logger = require('../../utils/logger');

// Define route handler functions
const hardwareHandlers = {
  getHardwareInfo: async (req, res, next) => {
    try {
      logger.info('Collecting hardware data...');
      
      // Collect hardware data from system
      const [cpu, gpu, memory] = await Promise.all([
        getCpuInfo(),
        getGpuInfo(),
        getMemoryInfo()
      ]);
      
      logger.info('Hardware data collected successfully');
      
      res.json({
        cpu,
        gpu,
        ram: memory,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to collect hardware data', error);
      next(error);
    }
  }
};

// Create and export the router
module.exports = createApiRouter('hardware', (router) => {
  // Hardware data endpoint
  router.get('/', hardwareHandlers.getHardwareInfo);
  
  logger.info('Hardware API routes initialized');
});
```

### 5. Refactor SVG API Routes (30 minutes)

Update the SVG API routes following the same pattern:

```javascript
// server/routes/api/svg.js
const createApiRouter = require('../../utils/route-template');
const svgScanner = require('../../utils/svg/scanner');
const logger = require('../../utils/logger');

// Define route handler functions
const svgHandlers = {
  getSvgFiles: async (req, res, next) => {
    try {
      logger.info('Fetching SVG files...');
      const svgFiles = await svgScanner.getSvgFiles();
      logger.info(`Found ${svgFiles.length} SVG files`);
      res.json(svgFiles);
    } catch (error) {
      logger.error('Error fetching SVG files', error);
      next(error);
    }
  }
};

// Create and export the router
module.exports = createApiRouter('svg', (router) => {
  // Get list of available SVG files
  router.get('/list', svgHandlers.getSvgFiles);
  
  logger.info('SVG API routes initialized');
});
```

### 6. Refactor BigQuery API Routes (30 minutes)

Update the BigQuery API routes:

```javascript
// server/routes/api/bigquery.js
const createApiRouter = require('../../utils/route-template');
const bigQueryService = require('../../utils/bigquery/query-service');
const logger = require('../../utils/logger');

// Define route handler functions
const bigQueryHandlers = {
  getProjects: async (req, res, next) => {
    try {
      logger.info('Getting BigQuery projects');
      const projects = await bigQueryService.getProjects();
      logger.info(`Found ${projects.length} projects`);
      res.json(projects);
    } catch (error) {
      logger.error('Error fetching BigQuery projects', error);
      next(error);
    }
  },
  
  getProjectStats: async (req, res, next) => {
    const { projectId } = req.params;
    try {
      logger.info(`Getting BigQuery stats for project: ${projectId}`);
      const stats = await bigQueryService.getProjectStats(projectId);
      logger.info(`Retrieved stats for project ${projectId}`);
      res.json(stats);
    } catch (error) {
      logger.error(`Error fetching BigQuery stats for project ${projectId}`, error);
      next(error);
    }
  }
};

// Create and export the router
module.exports = createApiRouter('bigquery', (router) => {
  // Get projects endpoint
  router.get('/projects', bigQueryHandlers.getProjects);
  
  // Get project stats endpoint
  router.get('/stats/:projectId', bigQueryHandlers.getProjectStats);
  
  logger.info('BigQuery API routes initialized');
});
```

### 7. Refactor Interview API Routes (30 minutes)

Update the Interview API routes:

```javascript
// server/routes/api/interview.js
const createApiRouter = require('../../utils/route-template');
const questionService = require('../../utils/interview/question-service');
const logger = require('../../utils/logger');

// Define route handler functions
const interviewHandlers = {
  getQuestionSets: async (req, res, next) => {
    try {
      logger.info('Fetching interview question sets');
      const sets = await questionService.getQuestionSets();
      logger.info(`Found ${sets.length} question sets`);
      res.json(sets);
    } catch (error) {
      logger.error('Error fetching question sets', error);
      next(error);
    }
  },
  
  getQuestionSet: async (req, res, next) => {
    try {
      const setId = req.params.setId;
      logger.info(`Fetching question set: ${setId}`);
      
      const set = await questionService.getQuestionSet(setId);
      if (!set) {
        logger.info(`Question set not found: ${setId}`);
        return res.status(404).json({ error: 'Question set not found' });
      }
      
      logger.info(`Retrieved question set ${setId} with ${set.questions?.length || 0} questions`);
      res.json(set);
    } catch (error) {
      logger.error(`Error fetching question set ${req.params.setId}`, error);
      next(error);
    }
  },
  
  // Add other handlers (getQuestion, addQuestion, updateQuestion, deleteQuestion)
};

// Create and export the router
module.exports = createApiRouter('interview', (router) => {
  // Get question sets
  router.get('/sets', interviewHandlers.getQuestionSets);
  
  // Get a specific question set
  router.get('/sets/:setId', interviewHandlers.getQuestionSet);
  
  // Add other routes
  // router.get('/questions/:questionId', ...);
  // router.post('/questions', ...);
  // etc.
  
  logger.info('Interview API routes initialized');
});
```

### 8. Refactor Pages Routes (45 minutes)

Update the pages routes:

```javascript
// server/routes/pages.js
const express = require('express');
const path = require('path');
const logger = require('../utils/logger');

const router = express.Router();

// Define page routes with logging
const pageRoutes = [
  { path: '/', file: 'dashboard.html', name: 'Dashboard' },
  { path: '/cpu', file: 'cpu.html', name: 'CPU Stats' },
  { path: '/gpu', file: 'gpu.html', name: 'GPU Stats' },
  { path: '/system', file: 'system.html', name: 'System Info' },
  { path: '/settings', file: 'settings.html', name: 'Settings' },
  { path: '/svg', file: 'svg/index.html', name: 'SVG Overlay' },
  { path: '/bigquery', file: 'bigquery/index.html', name: 'BigQuery' },
  { path: '/interview', file: 'interview/index.html', name: 'Interview Practice' }
];

// Set up each page route
pageRoutes.forEach(({ path: routePath, file, name }) => {
  router.get(routePath, (req, res) => {
    logger.info(`Page requested: ${name} (${routePath})`);
    try {
      const filePath = path.join(__dirname, '../../public/pages', file);
      logger.info(`Serving file: ${filePath}`);
      res.sendFile(filePath);
    } catch (error) {
      logger.error(`Error serving ${name} page`, error);
      res.status(500).send(`Error loading ${name} page`);
    }
  });
});

// Log route setup
logger.info(`Set up ${pageRoutes.length} page routes`);

module.exports = router;
```

### 9. Update Main Server File (45 minutes)

Refactor the server.js file to use the new route organization:

```javascript
// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const setupRoutes = require('./routes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

logger.info('Initializing server...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.request);

// Serve static files
app.use(express.static('public'));
app.use('/js', express.static(path.join(__dirname, '../public/js'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

logger.info('Middleware configured');

// Setup all routes
setupRoutes(app);

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;
```

### 10. Add Simple Testing (60 minutes)

Create basic test for the refactored routes:

```javascript
// test/unit/routes/index.test.js
const express = require('express');
const setupRoutes = require('../../../server/routes');

describe('Route Setup', () => {
  let app;
  let useSpy;
  
  beforeEach(() => {
    app = express();
    useSpy = jest.spyOn(app, 'use');
  });
  
  afterEach(() => {
    useSpy.mockRestore();
  });
  
  it('should mount all routes correctly', () => {
    // Call the setup function
    setupRoutes(app);
    
    // Check that routes were mounted
    expect(useSpy).toHaveBeenCalledWith('/', expect.any(Function));
    expect(useSpy).toHaveBeenCalledWith('/api/hardware', expect.any(Function));
    expect(useSpy).toHaveBeenCalledWith('/api/svg', expect.any(Function));
    expect(useSpy).toHaveBeenCalledWith('/api/bigquery', expect.any(Function));
    expect(useSpy).toHaveBeenCalledWith('/api/interview', expect.any(Function));
    
    // Check that error handlers were mounted
    // These are the last two calls to app.use
    const calls = useSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    const secondLastCall = calls[calls.length - 2];
    
    // Last one should have 4 params (err handler)
    expect(lastCall[0]).toBeInstanceOf(Function);
    expect(lastCall[0].length).toBe(4); // err, req, res, next
    
    // Second last should be 404 handler
    expect(secondLastCall[0]).toBeInstanceOf(Function);
  });
});
```

## Verification Steps

### 1. Log Analysis Verification

After implementing the changes, run the server and check for proper logging:

```bash
# Start the server
npm start

# In another terminal, tail the logs to see the activity
tail -f logs/access.log
```

Expected output should include:
```
[INFO] 2025-04-22T... - Setting up routes...
[INFO] 2025-04-22T... - ✓ Page routes mounted
[INFO] 2025-04-22T... - ✓ API routes mounted at /api/hardware
[INFO] 2025-04-22T... - ✓ API routes mounted at /api/svg
[INFO] 2025-04-22T... - ✓ API routes mounted at /api/bigquery
[INFO] 2025-04-22T... - ✓ API routes mounted at /api/interview
[INFO] 2025-04-22T... - All routes set up successfully
[INFO] 2025-04-22T... - Server running on http://localhost:3000
```

### 2. Functionality Verification

Test each API endpoint to ensure functionality is preserved:

```bash
# Test hardware endpoint
curl http://localhost:3000/api/hardware

# Test SVG endpoint
curl http://localhost:3000/api/svg/list

# Test BigQuery endpoints
curl http://localhost:3000/api/bigquery/projects
curl http://localhost:3000/api/bigquery/stats/project-1  

# Test Interview endpoints
curl http://localhost:3000/api/interview/sets
```

Verify the logs show the requests and responses:
```bash
tail -f logs/access.log
```

### 3. Error Handling Verification

Test error handling by accessing non-existent routes:

```bash
# Test non-existent API endpoint
curl http://localhost:3000/api/nonexistent
```

Verify error logs:
```bash
tail -f logs/error.log
```

Expected output should include:
```
[ERROR] 2025-04-22T... - 404 - Route not found: /api/nonexistent
```

### 4. Run Automated Tests

Run the new tests to verify route structure:

```bash
npm test -- test/unit/routes/index.test.js
```

All tests should pass, confirming the route organization is working correctly.

## Benefits of Implementation

1. **Separation of Concerns**: Each route file is responsible for only its specific domain
2. **Improved Logging**: Enhanced logging for better debugging and monitoring
3. **Standardized Error Handling**: Consistent approach to errors across all routes
4. **Simplified Maintenance**: Easier to add new routes or modify existing ones
5. **Better Testing**: Route-specific tests are now possible and more focused
6. **Centralized Configuration**: Route setup is managed in one place
7. **Clear Structure**: New developers can easily understand the routing system

## Next Steps

1. Apply the same pattern to any routes we missed
2. Consider adding route validation using a library like express-validator
3. Implement API documentation using OpenAPI/Swagger
4. Add more comprehensive tests for individual route handlers
