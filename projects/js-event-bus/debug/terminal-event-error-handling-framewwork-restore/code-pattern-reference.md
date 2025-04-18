# Emoji-Based Code Section Pattern Standard

This document defines our standard for marking code sections using emoji-based comment patterns to facilitate precise code modifications and improved readability.

## Pattern Types

### Core System Components

```
// 🟢 START: Component Name 🟢
// Core component code goes here
// 🔴 END: Component Name 🔴
```

### Configuration Sections

```
// 🟦 START: Configuration Name 🟦
// Configuration code goes here
// 🟧 END: Configuration Name 🟧
```

### Error Handling

```
// 🚨 START: Error Handler Name 🚨
// Error handling code goes here
// 🛑 END: Error Handler Name 🛑
```

### Data Operations

```
// 💾 START: Data Operation Name 💾
// Data operation code goes here
// 📤 END: Data Operation Name 📤
```

### UI Components

```
// 🖼️ START: UI Component Name 🖼️
// UI component code goes here
// 🎨 END: UI Component Name 🎨
```

### Utility Functions

```
// 🔧 START: Utility Name 🔧
// Utility functions go here
// 🔩 END: Utility Name 🔩
```

## Usage Examples

### Basic Component

```javascript
// 🟢 START: Event Bus Core 🟢
class EventBus {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    // Implementation
  }
  
  off(event, callback) {
    // Implementation
  }
  
  emit(event, data) {
    // Implementation
  }
}
// 🔴 END: Event Bus Core 🔴
```

### Nested Sections

```javascript
// 🟢 START: Server Setup 🟢
const express = require('express');
const app = express();

// 🟦 START: Middleware Configuration 🟦
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 🟧 END: Middleware Configuration 🟧

// 🟦 START: Route Definitions 🟦
app.get('/', (req, res) => {
  res.send('Hello World');
});
// 🟧 END: Route Definitions 🟧

// 🚨 START: Global Error Handler 🚨
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// 🛑 END: Global Error Handler 🚨

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// 🔴 END: Server Setup 🔴
```

## Implementation Guidelines

### Naming Conventions

1. Section names should be:
   - Brief but descriptive
   - In PascalCase or Title Case
   - Unique within their scope

2. Examples:
   - `EventBusCore` or `Event Bus Core`
   - `DatabaseConnection` or `Database Connection`
   - `UserAuthentication` or `User Authentication`

### Nesting Rules

1. Sections can be nested for logical grouping
2. Each nested section should have its own unique emoji pair
3. Maintain consistent indentation for nested sections
4. Maximum nesting depth: 3 levels

### Placement Guidelines

1. Place comment markers on their own lines
2. Add a blank line after opening markers and before closing markers for large sections
3. For small sections (1-3 lines), no blank lines are necessary
4. Always align opening and closing emoji pairs for visual clarity

## Code Modification Instructions

When requesting modifications to code sections marked with this pattern, use these formats:

### To Replace a Section

```
Replace the code between 
// 🟢 START: Section Name 🟢 
and 
// 🔴 END: Section Name 🔴 
with:

// New code here
```

### To Add After a Section

```
Add this code after 
// 🔴 END: Section Name 🔴
:

// New code here
```

### To Add Before a Section

```
Add this code before 
// 🟢 START: Section Name 🟢
:

// New code here
```

### To Remove a Section

```
Remove all code between 
// 🟢 START: Section Name 🟢 
and 
// 🔴 END: Section Name 🔴 
(including these comment lines).
```

## File Organization

1. Place highest-level section markers at the file scope
2. Group related functionality within the same section
3. Order sections from most general to most specific
4. Consider the following general order:
   - Imports/Requires
   - Configuration
   - Core Components
   - Utility Functions
   - Initialization
   - Exports

## Integration with Tools

1. Configure your IDE to recognize these comment patterns for code folding
2. Create snippets for quick insertion of comment patterns
3. Document this standard in your project's style guide or README
4. Use consistent patterns across all project files
