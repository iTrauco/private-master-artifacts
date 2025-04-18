# LLM Code Modification Instruction Examples

This document demonstrates how to use emoji-based code section markers to request precise code modifications from LLMs.

## Example File Structure

```javascript
// app.js - Example application with emoji-marked sections

// 🟢 START: Imports 🟢
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
// 🔴 END: Imports 🔴

// 🟦 START: Configuration 🟦
const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';
// 🟧 END: Configuration 🟧

// 🟢 START: Middleware Setup 🟢
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// 🔴 END: Middleware Setup 🔴

// 🟦 START: Route Definitions 🟦
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/about', (req, res) => {
  res.send('About page');
});

app.get('/users', (req, res) => {
  res.send('Users list');
});
// 🟧 END: Route Definitions 🟧

// 🚨 START: Error Handling 🚨
app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// 🛑 END: Error Handling 🛑

// 🟢 START: Server Initialization 🟢
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (isDevelopment) {
    console.log('Running in development mode');
  }
});
// 🔴 END: Server Initialization 🟢
```

## Example 1: Adding a new route

**Your request:**
"Add a new route for user authentication to our app.js file."

**Ideal LLM response:**
```
Add this code before 
// 🟧 END: Route Definitions 🟧
:

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  // Authentication logic here
  res.json({ token: 'sample-token' });
});
```

## Example 2: Updating configuration

**Your request:**
"Update the configuration to add a database connection string."

**Ideal LLM response:**
```
Replace the code between 
// 🟦 START: Configuration 🟦 
and 
// 🟧 END: Configuration 🟧 
with:

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';
const DB_CONNECTION = process.env.DB_CONNECTION || 'mongodb://localhost:27017/myapp';
```

## Example 3: Fixing an error (inconsistent emoji)

**Your request:**
"Fix the inconsistency in the Server Initialization section's closing tag."

**Ideal LLM response:**
```
Replace 
// 🔴 END: Server Initialization 🟢
with
// 🔴 END: Server Initialization 🔴
```

## Example 4: Adding a complete new section

**Your request:**
"Add a database connection section after the imports."

**Ideal LLM response:**
```
Add this code after 
// 🔴 END: Imports 🔴
:

// 💾 START: Database Connection 💾
const mongoose = require('mongoose');
mongoose.connect(DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Database connection error:', err));
// 📤 END: Database Connection 📤
```

## Benefits of This Approach

- **Precision**: Instructions reference exact locations in your code
- **Minimal text**: Reduces token usage in LLM responses
- **Visual clarity**: Emoji markers make sections easy to identify
- **Standardization**: Consistent patterns across your codebase

By using this approach consistently, you can get precise code modification instructions without having the LLM output your entire codebase, making interactions more efficient.
