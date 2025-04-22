# createApiRouter: Express Router Utility

## What createApiRouter Does

`createApiRouter(name, setupRoutes)` is a wrapper function that:

- 🔁 **Creates an express.Router() instance**
- 🧾 **Adds a logging middleware for all requests under that API**
  - Logs method, path, and API name (e.g., `[hardware] GET /`)
- 🎯 **Lets you define all actual route handlers**
  - You do this inside a callback: `(router) => { ... }`
- 💥 **Adds error handling scoped to this route**
  - Logs error messages if something fails in that route only
  - Passes the error to the global error handler later

## How to Use It

### Before (Traditional Approach)
In `hardware.js`:
```javascript
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => { ... });
module.exports = router;
```

### After (Using createApiRouter)
```javascript
const createApiRouter = require('../../utils/route-template');
module.exports = createApiRouter('hardware', (router) => {
  router.get('/', async (req, res, next) => {
    try {
      // ... your logic here
    } catch (error) {
      next(error); // Forward error to router's error handler
    }
  });
});
```

## Benefits

| Feature | Result |
|---------|--------|
| Centralized structure | Same pattern for every API file |
| Scoped logging | Each API logs requests clearly |
| Scoped error handling | Errors in one API don't pollute others |
| Global fallback logging | Errors still bubble up to final error middleware |
