# Emoji Comment System Update Format

## Purpose
This document defines the standard format for code update recommendations when using the Emoji Comment System. This format ensures developers can quickly identify exact locations in their codebase where updates need to be applied.

## Update Format

### 1. Update Location
When specifying where code should be updated, provide the exact emoji marker lines:

```
// 📌 Handle SVG file click
// 🔶 SECTION: rendering
```

### 2. Replacement Code
Provide the complete code block that should replace everything between the specified markers:

```javascript
// 📌 Handle SVG file click
handleSvgFileClick(id) {
  console.log(`SVG file clicked: ${id}`);

  // 📌 Update selected ID
  this.selectedId = id;
  
  // 📌 Publish event
  eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id });
  
  // 📌 Update UI
  this.render();
}

// 📌 New helper method
validateSvgId(id) {
  return id && typeof id === 'string';
}
```

## Example LLM Response

When an LLM recommends a code update, it should follow this format:

---

### Update Location
Replace code between these exact markers:

```
// 🔶 SECTION: event_handlers
// 🔷 END: event_handlers
```

### Replacement Code

```javascript
// 🔶 SECTION: event_handlers
// 📌 Handle SVG file click
handleSvgFileClick(id) {
  console.log(`SVG file clicked: ${id}`);

  if (!this.validateSvgId(id)) {
    console.error('Invalid SVG ID provided');
    return;
  }

  // 📌 Update selected ID
  this.selectedId = id;
  
  // 📌 Publish event
  eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id });
  
  // 📌 Update UI
  this.render();
}

// 📌 Validate SVG ID
validateSvgId(id) {
  return id && typeof id === 'string';
}
// 🔷 END: event_handlers
```

---

## Benefits
- Clear separation between location markers and replacement code
- Easy to copy both the markers (for finding the location) and the code (for replacing)
- Preserves the emoji comment system in the replacement code
- Ensures precise updates by providing the complete code block
