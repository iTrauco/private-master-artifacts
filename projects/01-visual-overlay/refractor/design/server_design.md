# Modular Express Server Design Standard 🧱

## 🧩 Overview
This standard defines how to structure and maintain an Express server using clean code principles. It focuses on centralized routing, modular middleware, enhanced logging, and scalable maintainability.

---

## 🗂️ Directory Structure
```
server/
├── server.js              # Main entry point
├── routes/
│   ├── index.js           # Route initializer (central hub)
│   ├── pages.js           # Page routes
│   └── api/
│       ├── hardware.js
│       ├── svg.js
│       ├── bigquery.js
│       └── interview.js
├── utils/
│   ├── logger.js          # Logging utility
│   └── route-template.js  # Standard API route wrapper
logs/
├── access.log
└── error.log
```

---

## 🚦 server.js Responsibilities
- Initialize Express application
- Register core middleware (`CORS`, `JSON`, `static`, `logger`)
- Use centralized route initializer (`routes/index.js`)
- Start server if main module
- Export app for testability

### ✅ Example
```js
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const setupRoutes = require('./routes');
const app = express();
const PORT = process.env.PORT || 3000;

logger.info('Initializing server...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.request);
app.use(express.static('public'));
app.use('/js', express.static(path.join(__dirname, '../public/js'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Centralized route loading
setupRoutes(app);

if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down...');
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  });
}

module.exports = app;
```

## 🔗 Route Initialization Pattern
Handled in routes/index.js:
- Loads pageRoutes and apiRoutes dynamically
- Uses logger to confirm each route registration
- Adds 404 and error handlers

### ✅ Benefits:
- 🔁 Centralized control
- 🧼 Cleaner server.js
- 📋 Consistent logs

## 📝 Logging
Use utils/logger.js to log:
- [INFO] application events
- [REQUEST] HTTP traffic
- [ERROR] internal errors

Log files:
- logs/access.log
- logs/error.log

## ✅ Best Practices Checklist
- [ ] Modularize route setup via routes/index.js
- [ ] Use a consistent logging utility
- [ ] Add 404 + error middleware at the bottom of route loading
- [ ] Keep server.js clean: no direct route mounting
- [ ] Export app instance for testing
- [ ] Add graceful shutdown on SIGTERM

## 🛠️ Next Steps
- Apply route-template.js to all API routes
- Validate request bodies using express-validator
- Add unit tests for all route modules
- Generate OpenAPI/Swagger docs for the API
