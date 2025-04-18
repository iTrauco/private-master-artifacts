# Code Section Comment Patterns for Precise Code Modification

This document outlines three distinct code section comment pattern systems designed to make code maintenance more efficient, especially when using LLMs to assist with code modifications.

## Purpose

These patterns allow you to:
- Precisely identify code sections for modification
- Enable targeted keyword searches in large codebases
- Minimize token usage when requesting changes from LLMs
- Visually distinguish different types of code sections

## Pattern 1: Alert/Siren Style

This pattern uses alert-like emojis for high visibility.

### Syntax

```javascript
// 🚨 START: [section name] 🚨
// Your code here
// 🛑 END: [section name] 🛑
```

### Examples

```javascript
// 🚨 START: Event handler registration 🚨
document.addEventListener('click', handleClick);
window.addEventListener('load', initialize);
// 🛑 END: Event handler registration 🛑

// 🚨 START: Error handling logic 🚨
try {
  processData(rawInput);
} catch (error) {
  logError(error);
  showUserFriendlyMessage();
}
// 🛑 END: Error handling logic 🛑
```

### LLM Query Format

"Replace all code between 🚨 START: Error handling logic 🚨 and 🛑 END: Error handling logic 🛑 with: [new code]"

## Pattern 2: Color-Based Style

This pattern uses colored shapes to visually categorize different types of code sections.

### Syntax

For primary functionality:
```javascript
// 🟢 START: [section name] 🟢
// Your code here
// 🔴 END: [section name] 🔴
```

For configuration:
```javascript
// 🟦 START: [section name] 🟦
// Your code here
// 🟧 END: [section name] 🟧
```

For utilities:
```javascript
// 🟣 START: [section name] 🟣
// Your code here
// 🟡 END: [section name] 🟡
```

### Examples

```javascript
// 🟢 START: Core event bus implementation 🟢
class EventBus {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    // Implementation
  }
  
  emit(event, data) {
    // Implementation
  }
}
// 🔴 END: Core event bus implementation 🔴

// 🟦 START: Event bus configuration 🟦
const eventBus = new EventBus();
const eventTypes = {
  MESSAGE: 'message',
  ERROR: 'error'
};
// 🟧 END: Event bus configuration 🟧
```

### LLM Query Format

"Replace all code between 🟦 START: Event bus configuration 🟦 and 🟧 END: Event bus configuration 🟧 with: [new code]"

## Pattern 3: Symbolic/Thematic Style

This pattern uses thematically-relevant symbols for different types of code functionality.

### Syntax

For data operations:
```javascript
// 💾 START: [section name] 💾
// Your code here
// 📤 END: [section name] 📤
```

For network operations:
```javascript
// 📡 START: [section name] 📡
// Your code here
// 🔌 END: [section name] 🔌
```

For UI components:
```javascript
// 🖼️ START: [section name] 🖼️
// Your code here
// 🎨 END: [section name] 🎨
```

### Examples

```javascript
// 💾 START: User data persistence 💾
function saveUserPreferences(preferences) {
  localStorage.setItem('userPrefs', JSON.stringify(preferences));
}

function loadUserPreferences() {
  return JSON.parse(localStorage.getItem('userPrefs') || '{}');
}
// 📤 END: User data persistence 📤

// 📡 START: API client implementation 📡
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}
// 🔌 END: API client implementation 🔌
```

### LLM Query Format

"Replace all code between 📡 START: API client implementation 📡 and 🔌 END: API client implementation 🔌 with: [new code]"

## Usage Best Practices

1. **Be consistent**: Choose one pattern system and stick to it throughout your project
2. **Use unique section names**: Make each section name descriptive and unique
3. **Nest appropriately**: You can nest sections but ensure proper hierarchy
4. **Avoid too many sections**: Don't over-fragment your code; focus on logical units
5. **Include in code style guide**: Document your chosen pattern in your project's style guide

## Integration with Development Workflow

- Add these patterns during the initial development or refactoring
- Create snippets in your IDE for quick insertion of comment patterns
- Consider automatic folding in editors that support code folding by comments
- Document the pattern system in your project's README or contributing guidelines
