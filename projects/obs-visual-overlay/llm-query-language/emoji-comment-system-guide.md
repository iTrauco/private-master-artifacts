# Emoji Comment System Guide

## Purpose
This system creates consistent visual markers in code to enable precise references for modification requests and implementation.

## Marker Types

### Section Markers
Used to define logical code blocks:

- **Start marker**: `// 🔶 SECTION: [section_name]`
- **End marker**: `// 🔷 END: [section_name]`

#### When to use:
- Major functional blocks (imports, class definitions, exports)
- Logical groupings of related methods
- Configuration blocks
- Nested subsections within larger sections

### Comment Markers
Used for individual code elements:

- **Standard marker**: `// 📌 [comment_description]`

#### When to use:
- Method purpose descriptions
- Step explanations within functions
- Important state changes
- Edge case handling
- Entry/exit points

## Implementation Rules

1. **Maintain hierarchy**: Section markers create parent containers, comment markers provide details
2. **Preserve markers in generated code**: Always include appropriate markers in any generated code
3. **Include end markers**: Every section start must have a corresponding end marker
4. **Use descriptive names**: Section and comment descriptions should be clear and specific
5. **Maintain existing marker style**: Don't alter the emoji patterns when modifying code

## Examples

### Proper Section Layout
```javascript
// 🔶 SECTION: event_handlers
// 📌 Handle user input events
handleUserInput(event) {
  // Implementation
}

// 📌 Handle system events
handleSystemEvent(event) {
  // Implementation
}
// 🔷 END: event_handlers
```

### Nested Sections
```javascript
// 🔶 SECTION: class_definition
export class Component {
  // 🔶 SECTION: constructor
  constructor() {
    // Implementation
  }
  // 🔷 END: constructor
  
  // Methods...
}
// 🔷 END: class_definition
```

### Comment Markers Within Code
```javascript
function processData(data) {
  // 📌 Validate input
  if (!data) return null;
  
  // 📌 Transform data
  const transformed = transform(data);
  
  // 📌 Return result
  return transformed;
}
```
