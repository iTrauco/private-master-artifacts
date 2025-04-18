# Event Bus Implementation Guide: Paired Programming Approach

## Branch
`phase01/event-bus-core`

## Introduction
This guide documents a step-by-step approach for implementing an event bus system through paired programming between a senior developer and a systems engineer. The workflow follows an incremental approach with practical demonstrations at each stage.

## Prerequisites
- Node.js environment
- Basic understanding of JavaScript
- Git for version control

## Initial Setup

```bash
# Create project directory
mkdir event-bus-demo && cd event-bus-demo

# Initialize npm project
npm init -y

# Install development dependencies
npm install --save-dev chalk express ws
```

## Step 1: Core Event Bus Implementation

Create the basic event bus implementation:

```javascript
// renderer/core/event_bus.js
export class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();
```

This provides the pub/sub pattern for decoupled component communication.

## Step 2: Define Event Types

Create constants for event types:

```javascript
// renderer/config/constants.js
export const EventTypes = {
  SVG_SELECTED: 'SVG_SELECTED',
  SVG_DISPLAYED: 'SVG_DISPLAYED',
  SVG_REMOVED: 'SVG_REMOVED',
  SVG_VISIBILITY_CHANGED: 'SVG_VISIBILITY_CHANGED',
  
  COMMAND_LOAD_SVG_FILES: 'COMMAND_LOAD_SVG_FILES',
  COMMAND_SELECT_SVG: 'COMMAND_SELECT_SVG',
  COMMAND_DISPLAY_SVG: 'COMMAND_DISPLAY_SVG'
};
```

## Step 3: Create a Component Using the Event Bus

Implement a component that emits events:

```javascript
// renderer/components/svg_list.js
import { EventTypes } from '../config/constants.js';
import { eventBus } from '../core/event_bus.js';

export class SvgList {
  constructor() {
    this.containerId = 'svg-file-list';
    this.mounted = false;
    this.selectedId = null;
    
    this.handleSvgFileClick = this.handleSvgFileClick.bind(this);
  }
  
  mount() {
    if (this.mounted) return;
    console.log('Mounting SVG List component');
    this.render();
    this.mounted = true;
  }
  
  unmount() {
    if (!this.mounted) return;
    console.log('Unmounting SVG List component');
    this.mounted = false;
  }
  
  handleSvgFileClick(id) {
    console.log(`SVG file clicked: ${id}`);
    this.selectedId = id;
    eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id });
    this.render();
  }
  
  render() {
    console.log('Rendering SVG List');
    // Actual implementation would render to DOM
  }
}

export const svgList = new SvgList();
```

## Step 4: Create a Service that Listens for Events

Implement a service that responds to events:

```javascript
// renderer/services/svg_service.js
import { eventBus } from '../core/event_bus.js';
import { EventTypes } from '../config/constants.js';

export class SvgService {
  constructor() {
    this.svgCache = new Map();
    this.setupEventListeners();
    console.log('SVG Service created');
  }
  
  setupEventListeners() {
    eventBus.on(EventTypes.COMMAND_SELECT_SVG, this.handleSelectSvg.bind(this));
    eventBus.on(EventTypes.COMMAND_DISPLAY_SVG, this.handleDisplaySvg.bind(this));
  }
  
  handleSelectSvg(data) {
    if (!data || !data.id) return;
    console.log(`SVG selected: ${data.id}`);
    
    eventBus.emit(EventTypes.SVG_SELECTED, { id: data.id });
  }
  
  handleDisplaySvg(data) {
    if (!data || !data.id) return;
    console.log(`Displaying SVG: ${data.id}`);
    
    eventBus.emit(EventTypes.SVG_DISPLAYED, data);
  }
}

export const svgService = new SvgService();
```

## Step 5: Create a Component that Responds to Events

```javascript
// renderer/components/svg_controller.js
import { EventTypes } from '../config/constants.js';
import { eventBus } from '../core/event_bus.js';

export class SvgController {
  constructor() {
    this.activeSvgs = [];
    this.setupEventListeners();
    console.log('SvgController created');
  }
  
  setupEventListeners() {
    this.unsubscribeSvgSelected = eventBus.on(
      EventTypes.SVG_SELECTED, 
      this.handleSvgSelected.bind(this)
    );
    
    this.unsubscribeSvgDisplayed = eventBus.on(
      EventTypes.SVG_DISPLAYED,
      this.handleSvgDisplayed.bind(this)
    );
  }
  
  handleSvgSelected(data) {
    console.log(`SvgController: SVG selected ${data.id}`);
    // Would update UI to show selection
  }
  
  handleSvgDisplayed(data) {
    console.log(`SvgController: SVG displayed ${data.id}`);
    this.activeSvgs.push(data);
    // Would update UI to show active SVGs
  }
  
  cleanup() {
    // Unsubscribe from events to prevent memory leaks
    this.unsubscribeSvgSelected();
    this.unsubscribeSvgDisplayed();
  }
}

export const svgController = new SvgController();
```

## Step 6: Terminal Demo for Visualization

Create a terminal-based visualization:

```javascript
// terminal_demo.js
const chalk = require('chalk');

class EventBus {
  constructor() {
    this.listeners = {};
    console.log(chalk.blue('EventBus initialized'));
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    let colorLog = console.log;
    
    if (event.startsWith('COMMAND_')) {
      colorLog = (msg, data) => console.log(chalk.yellow(msg), data);
    } else if (event === 'SVG_SELECTED') {
      colorLog = (msg, data) => console.log(chalk.blue(msg), data);
    } else if (event === 'SVG_DISPLAYED') {
      colorLog = (msg, data) => console.log(chalk.green(msg), data);
    }
    
    colorLog(`EVENT: ${event}`, data);
    
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

const EventTypes = {
  SVG_SELECTED: 'SVG_SELECTED',
  SVG_DISPLAYED: 'SVG_DISPLAYED',
  COMMAND_SELECT_SVG: 'COMMAND_SELECT_SVG',
  COMMAND_DISPLAY_SVG: 'COMMAND_DISPLAY_SVG'
};

const eventBus = new EventBus();
const svgFiles = ['logo.svg', 'chart.svg', 'diagram.svg'];
let activeQuadrants = {};

console.log(chalk.blue('Setting up components...'));

eventBus.on(EventTypes.COMMAND_SELECT_SVG, data => {
  console.log(chalk.blue('SVG Service received selection command for'), data.name);
  setTimeout(() => {
    eventBus.emit(EventTypes.SVG_SELECTED, data);
  }, 500);
});

eventBus.on(EventTypes.COMMAND_DISPLAY_SVG, data => {
  console.log(chalk.blue('SVG Service received display command for'), data.name);
  setTimeout(() => {
    activeQuadrants[data.quadrant] = data;
    console.log(chalk.blue('Active SVGs:'), activeQuadrants);
    eventBus.emit(EventTypes.SVG_DISPLAYED, data);
  }, 500);
});

function simulateUserAction() {
  console.log(chalk.gray('-----------------------------------------'));
  
  const randomIndex = Math.floor(Math.random() * svgFiles.length);
  const svgName = svgFiles[randomIndex];
  const id = `svg-${Date.now()}`;
  
  console.log(chalk.magenta('User selects:'), svgName);
  
  eventBus.emit(EventTypes.COMMAND_SELECT_SVG, { id, name: svgName });
  
  setTimeout(() => {
    const quadrant = Math.floor(Math.random() * 4) + 1;
    console.log(chalk.magenta('User displays in quadrant:'), quadrant);
    eventBus.emit(EventTypes.COMMAND_DISPLAY_SVG, { id, name: svgName, quadrant });
  }, 1000);
}

console.log(chalk.blue('Starting simulation...'));

let count = 0;
const interval = setInterval(() => {
  simulateUserAction();
  count++;
  if (count >= 3) {
    clearInterval(interval);
    setTimeout(() => {
      console.log(chalk.blue('Simulation complete. Final state:'));
      console.log(chalk.blue('Active SVGs:'), activeQuadrants);
      console.log(chalk.blue('Event bus demo finished.'));
    }, 2000);
  }
}, 3000);
```

## Step 7: Interactive Browser-Terminal Integration

```javascript
// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const chalk = require('chalk');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

class EventBus {
  constructor() {
    this.listeners = {};
    console.log(chalk.blue('EventBus initialized'));
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (event.startsWith('COMMAND_')) {
      console.log(chalk.yellow(`EVENT: ${event}`), data);
    } else if (event === 'SVG_SELECTED') {
      console.log(chalk.blue(`EVENT: ${event}`), data);
    } else if (event === 'SVG_DISPLAYED') {
      console.log(chalk.green(`EVENT: ${event}`), data);
    } else {
      console.log(`EVENT: ${event}`, data);
    }
    
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

const EventTypes = {
  SVG_SELECTED: 'SVG_SELECTED',
  SVG_DISPLAYED: 'SVG_DISPLAYED',
  COMMAND_SELECT_SVG: 'COMMAND_SELECT_SVG',
  COMMAND_DISPLAY_SVG: 'COMMAND_DISPLAY_SVG'
};

const eventBus = new EventBus();
let activeQuadrants = {};

wss.on('connection', (ws) => {
  console.log(chalk.green('✓ Browser connected'));
  
  const svgFiles = [
    { id: 'svg-001', name: 'logo.svg' },
    { id: 'svg-002', name: 'diagram.svg' },
    { id: 'svg-003', name: 'chart.svg' }
  ];
  
  ws.send(JSON.stringify({ type: 'SVG_LIST', data: svgFiles }));

  ws.on('message', (message) => {
    const { type, data } = JSON.parse(message);
    eventBus.emit(type, data);
  });

  eventBus.on(EventTypes.COMMAND_SELECT_SVG, data => {
    console.log(chalk.blue('SVG Service processing selection:'), data.id);
    
    setTimeout(() => {
      eventBus.emit(EventTypes.SVG_SELECTED, data);
      ws.send(JSON.stringify({ type: EventTypes.SVG_SELECTED, data }));
    }, 500);
  });

  eventBus.on(EventTypes.COMMAND_DISPLAY_SVG, data => {
    console.log(chalk.blue('SVG Service processing display:'), data);
    
    setTimeout(() => {
      activeQuadrants[data.quadrant] = data;
      console.log(chalk.blue('Active SVGs:'), activeQuadrants);
      
      eventBus.emit(EventTypes.SVG_DISPLAYED, data);
      ws.send(JSON.stringify({ type: EventTypes.SVG_DISPLAYED, data }));
    }, 500);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(chalk.green(`Server running at http://localhost:${PORT}`));
  console.log(chalk.blue('Open the browser to interact with the event bus demo'));
});
```

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Event Bus Demo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .container { display: flex; gap: 20px; }
    .panel { flex: 1; border: 1px solid #ccc; padding: 15px; border-radius: 5px; }
    .svg-item { 
      cursor: pointer; padding: 8px; margin: 5px 0; 
      background: #eee; border-radius: 4px; transition: all 0.3s;
    }
    .svg-item:hover { background: #ddd; }
    .svg-item.selected { background: #a0c0ff; }
    .quadrant { 
      width: 100px; height: 100px; margin: 5px; 
      border: 1px solid #ccc; display: inline-block;
      position: relative; text-align: center;
    }
    .active-svg {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(200, 200, 255, 0.5);
    }
    h3 { margin-top: 0; }
    button { 
      padding: 8px 12px; background: #4c5c96; color: white; 
      border: none; border-radius: 4px; cursor: pointer;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h2>Event Bus Demo</h2>
  <p>Click on SVG files to trigger events (watch the terminal for event flow)</p>
  
  <div class="container">
    <div class="panel">
      <h3>SVG Files</h3>
      <div id="svg-list"></div>
    </div>
    
    <div class="panel">
      <h3>Quadrants</h3>
      <div id="quadrants">
        <div class="quadrant" data-id="1">Quadrant 1</div>
        <div class="quadrant" data-id="2">Quadrant 2</div>
        <div class="quadrant" data-id="3">Quadrant 3</div>
        <div class="quadrant" data-id="4">Quadrant 4</div>
      </div>
    </div>
  </div>
  
  <script>
    const socket = new WebSocket(`ws://${window.location.host}`);
    let selectedSvgId = null;
    
    const EventTypes = {
      SVG_SELECTED: 'SVG_SELECTED',
      SVG_DISPLAYED: 'SVG_DISPLAYED',
      COMMAND_SELECT_SVG: 'COMMAND_SELECT_SVG',
      COMMAND_DISPLAY_SVG: 'COMMAND_DISPLAY_SVG'
    };
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'SVG_LIST') {
        renderSvgList(message.data);
      } else if (message.type === EventTypes.SVG_SELECTED) {
        selectedSvgId = message.data.id;
        renderSvgList();
      } else if (message.type === EventTypes.SVG_DISPLAYED) {
        renderActiveQuadrant(message.data);
      }
    };
    
    function renderSvgList(svgFiles = []) {
      const listElement = document.getElementById('svg-list');
      if (!listElement) return;
      
      if (svgFiles.length > 0) {
        window.svgFiles = svgFiles;
      }
      
      if (!window.svgFiles || window.svgFiles.length === 0) {
        listElement.innerHTML = '<div>No SVG files available</div>';
        return;
      }
      
      listElement.innerHTML = '';
      window.svgFiles.forEach(file => {
        const item = document.createElement('div');
        item.className = `svg-item ${file.id === selectedSvgId ? 'selected' : ''}`;
        item.textContent = file.name;
        item.onclick = () => handleSvgClick(file);
        listElement.appendChild(item);
      });
    }
    
    function handleSvgClick(file) {
      socket.send(JSON.stringify({
        type: EventTypes.COMMAND_SELECT_SVG,
        data: file
      }));
    }
    
    function setupQuadrants() {
      const quadrants = document.querySelectorAll('.quadrant');
      quadrants.forEach(quadrant => {
        quadrant.onclick = () => {
          if (!selectedSvgId) {
            alert('Please select an SVG file first');
            return;
          }
          
          const quadrantId = parseInt(quadrant.dataset.id);
          const file = window.svgFiles.find(f => f.id === selectedSvgId);
          
          socket.send(JSON.stringify({
            type: EventTypes.COMMAND_DISPLAY_SVG,
            data: { ...file, quadrant: quadrantId }
          }));
        };
      });
    }
    
    function renderActiveQuadrant(data) {
      const quadrant = document.querySelector(`.quadrant[data-id="${data.quadrant}"]`);
      if (!quadrant) return;
      
      const existing = quadrant.querySelector('.active-svg');
      if (existing) existing.remove();
      
      const svgElement = document.createElement('div');
      svgElement.className = 'active-svg';
      svgElement.textContent = data.name;
      quadrant.appendChild(svgElement);
    }
    
    setupQuadrants();
  </script>
</body>
</html>
```

## Git Workflow Integration

After completing each step, commit the changes:

```bash
# After step 1-3
git add renderer/core/event_bus.js renderer/config/constants.js renderer/components/svg_list.js
git commit -m "feat(event-bus): implement core event bus components

- Create event_bus.js with pub/sub pattern
- Add constants.js with event type definitions
- Implement svg_list.js component using event bus"

# After steps 4-5
git add renderer/services/svg_service.js renderer/components/svg_controller.js
git commit -m "feat(event-bus): add service and controller components

- Implement svg_service.js to process events
- Create svg_controller.js to respond to events
- Complete event flow between components"

# After steps 6-7
git add terminal_demo.js server.js public/index.html
git commit -m "feat(demo): create interactive demos

- Add terminal_demo.js for command-line visualization
- Implement browser-terminal interactive demo with WebSockets
- Support real-time event visualization"
```

## Suggested Branch Strategy

- `main` - Stable production code
- `develop` - Integration branch
- `feature/event-bus-core` - Core event bus implementation
- `feature/event-bus-components` - Event bus component integration
- `feature/event-bus-demo` - Demo implementations

## Key Concepts to Emphasize During Paired Programming

1. **Decoupled Communication** - Components communicate without direct dependencies
2. **Single Responsibility** - Each file handles one aspect of the system
3. **Event Flow** - Clear chain of events throughout the application
4. **Progressive Enhancement** - Building incrementally from simple to complex
5. **Practical Demonstration** - Visualizing concepts through working examples

## Next Steps for Advanced Implementation

1. Add error handling to the event bus
2. Implement event namespacing for better organization
3. Create debugging tools for event flow visualization
4. Add automatic event logging for development
5. Implement asynchronous event handling

## Debugging Techniques

1. **Event Logging** - Add timestamps and event details to logs
2. **Visual Flow Diagram** - Use terminal colors to represent event types
3. **Event Chain Tracing** - Follow the flow of an event through multiple components
4. **State Snapshots** - Log application state at key points during event flow

## Common Patterns and Best Practices

1. **Return Unsubscribe Function** - Allow easy cleanup to prevent memory leaks
2. **Consistent Naming Conventions** - Use verb-noun format for event names
3. **Command/Event Separation** - Distinguish between commands and events
4. **Component Isolation** - Components should not know about other components
5. **Error Handling** - Wrap callbacks in try/catch to prevent failures from breaking the event chain