# Emoji Code Comment System

## Overview
The Emoji Code Comment System provides precise reference points for code modifications when working with LLMs. This system uses distinctive emoji patterns to mark code sections and individual comments.

## Marker Types

### Section Markers
Used to define logical code blocks:

```javascript
// 🔶 SECTION: [section_name]
// Code here
// 🔷 END: [section_name]
```

### Individual Comment Markers
Used for specific code elements:

```javascript
// 📌 [comment_description]
```

## Usage

### Referencing Code Sections
When requesting code updates from an LLM, reference the exact marker lines:

```
"Update code between these exact markers:
// 🔶 SECTION: event_handlers
// 🔷 END: event_handlers"
```

### Referencing Individual Lines
For more granular updates:

```
"Replace code between these exact markers:
// 📌 Update selected ID
// 📌 Publish event"
```

## Benefits
- Creates consistent visual anchors
- Provides exact string patterns for search
- Minimizes token usage in LLM interactions
- Enables precise code location without line numbers

## Implementation Example

```javascript
// 🔶 SECTION: imports
// 📌 Component to display and manage SVG file selection
import { EventTypes } from '../config/constants.js';
import { eventBus } from '../core/event_bus.js';
// 🔷 END: imports

// 🔶 SECTION: class_definition
export class SvgList {
  // 🔶 SECTION: constructor
  constructor() {
    this.containerId = 'svg-file-list';
    this.mounted = false;
    
    // 📌 Bind event handlers
    this.handleSvgFileClick = this.handleSvgFileClick.bind(this);
  }
  // 🔷 END: constructor
}
// 🔷 END: class_definition
```

## Best Practices
1. Use consistent emoji patterns throughout the project
2. Create descriptive section names
3. Maintain hierarchical nesting where appropriate
4. Apply markers at logical code boundaries
