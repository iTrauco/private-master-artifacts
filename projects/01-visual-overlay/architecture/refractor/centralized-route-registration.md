# 📦 Technical Refactor Artifact: Centralized Route Registration

## 🧠 Objective  
Refactor route registration in `server/server.js` to delegate all route mounting to a single, centralized router file (`server/routes/index.js`).

---

## 🎯 Goals
- Decouple route logic from core server setup
- Improve route management scalability
- Align project with modular backend best practices

---

## 📦 Affected Files
- ✅ `server/server.js` → remove individual route mounting
- ✅ `server/routes/index.js` → new file, handles all route imports and mounting
- ✅ `server/routes/api/interview.js` → no changes required, just imported

---

## 🛠️ Steps
1. **Create `server/routes/index.js`**
   - Import and register all API routes (`interviewRoutes`, etc.)
   - Mount under desired base path (e.g. `/interview`)
2. **Update `server/server.js`**
   - Replace direct route imports with a single `apiRoutes` import
   - Mount all routes under `/api`

---

## 🗂️ Example Directory Result
```
server/
├── routes/
│   ├── api/
│   │   ├── interview.js
│   └── index.js  ← ✅ central router file
├── server.js     ← ✅ uses the new centralized router
```

---

## 💻 Implementation Code

### 1. server/routes/index.js (New File)
```javascript
const express = require('express');
const router = express.Router();

// Import route modules
const interviewRoutes = require('./api/interview');
// Import other route modules as needed
// const userRoutes = require('./api/user');
// const authRoutes = require('./api/auth');

// Register routes with appropriate base paths
router.use('/interview', interviewRoutes);
// Register other routes as needed
// router.use('/users', userRoutes);
// router.use('/auth', authRoutes);

module.exports = router;
```

### 2. server/server.js (Updated)
```javascript
const express = require('express');
const app = express();
// ... other imports

// Import middleware
// ... middleware imports and setup

// Import centralized routes
const apiRoutes = require('./routes/index');

// Register middleware
// ... middleware registration

// Mount all API routes under /api
app.use('/api', apiRoutes);

// ... other server setup (error handling, etc.)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

---

## 🚀 Benefits
- **Modularity**: Server.js now focuses only on application setup
- **Scalability**: Adding new route modules requires changes to only one file
- **Organization**: Clear separation of concerns between server setup and routing
- **Maintainability**: Easier to understand routing structure at a glance

---

## 📝 Testing Notes
After implementing these changes, test all API endpoints to ensure they're still accessible at their expected paths, now with the `/api` prefix:
- `/api/interview/...` endpoints
- Any other API endpoints in your application
