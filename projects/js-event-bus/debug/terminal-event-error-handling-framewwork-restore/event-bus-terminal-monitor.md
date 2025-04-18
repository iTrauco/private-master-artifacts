# Event Bus Terminal Monitor: Live Event Visualization

This document provides implementation details for terminal-based monitoring tools that visualize your Electron application's event bus activity in real-time, helping you understand the mechanics of what's happening behind the UI.

## Table of Contents

1. [Terminal Event Monitor](#terminal-event-monitor)
2. [Event Injector Tool](#event-injector-tool)
3. [Event Flow Visualizer](#event-flow-visualizer)
4. [Integration with Electron](#integration-with-electron)
5. [Usage Examples](#usage-examples)

## Terminal Event Monitor

The Terminal Event Monitor displays all events flowing through your event bus in real-time with color-coded, emoji-based visual indicators.

### Implementation

```javascript
// 🚀 START: Terminal Event Monitor 🚀
const WebSocket = require('ws');
const chalk = require('chalk');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

// 🔷 START: Configuration 🔷
const config = {
  port: 8080,
  maxEvents: 1000,
  refreshRate: 100, // ms
  filterRegex: null,
  colorTheme: {
    command: 'yellow',
    ui: 'cyan',
    service: 'green',
    error: 'red',
    system: 'blue',
    default: 'white'
  },
  emojiMap: {
    // Command events
    'command:': '⚡ ',  // Lightning bolt
    // UI events
    'ui:': '🖼️ ',      // Picture frame
    // Component events
    'component:': '🧩 ', // Puzzle piece
    // Service events
    'service:': '🔧 ',  // Wrench
    // SVG events
    'svg:': '🎨 ',      // Artist palette
    // Error events
    'error:': '❌ ',    // Cross mark
    'app:error': '💥 ', // Collision
    // System events
    'app:': '🚀 ',      // Rocket
    'window:': '🪟 ',   // Window
    // Default
    'default': '📡 '    // Satellite antenna
  }
};
// 🔹 END: Configuration 🔹

// 🔷 START: UI Setup 🔷
// Create a screen object
const screen = blessed.screen({
  smartCSR: true,
  title: 'Event Bus Monitor'
});

// Create layout grid
const grid = new contrib.grid({
  rows: 12,
  cols: 12,
  screen: screen
});

// Event log (main display)
const eventLog = grid.set(0, 0, 8, 12, contrib.log, {
  fg: 'white',
  selectedFg: 'white',
  label: 'Event Stream',
  interactive: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    inverse: true
  }
});

// Event count by type
const eventCountChart = grid.set(8, 0, 4, 4, contrib.bar, {
  label: 'Events by Type',
  barWidth: 5,
  barSpacing: 6,
  xOffset: 2,
  maxHeight: 9
});

// Event rate chart
const eventRateLineChart = grid.set(8, 4, 4, 8, contrib.line, {
  style: {
    line: 'yellow',
    text: 'green',
    baseline: 'black'
  },
  xLabelPadding: 3,
  xPadding: 5,
  showLegend: true,
  wholeNumbersOnly: true,
  label: 'Events Per Second'
});

// Set up key handlers
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.key('p', function() {
  isPaused = !isPaused;
  updateStatus();
});

screen.key('c', function() {
  clearEvents();
  updateStatus();
});

screen.key('f', function() {
  setFilter();
});

// Status bar
const statusBar = blessed.box({
  bottom: 0,
  left: 0,
  right: 0,
  height: 1,
  content: ' {bold}Event Bus Monitor{/bold} | Press [p] to pause, [c] to clear, [f] to filter, [q] to quit',
  tags: true,
  style: {
    fg: 'white',
    bg: 'blue'
  }
});

screen.append(statusBar);
screen.render();
// 🔹 END: UI Setup 🔹

// 🔷 START: Event Monitoring 🔷
// Storage variables
let events = [];
let eventCounts = {};
let eventRates = [];
let eventCountBySecond = 0;
let isPaused = false;
let wsServer;

// Set up filtering
function setFilter() {
  const prompt = blessed.prompt({
    parent: screen,
    border: 'line',
    height: 'shrink',
    width: 'half',
    top: 'center',
    left: 'center',
    label: ' Filter Events ',
    tags: true,
    keys: true,
    vi: true
  });

  prompt.input('Enter filter regex (empty for none):', '', function(err, value) {
    if (value === '') {
      config.filterRegex = null;
      updateStatus('Filter cleared');
    } else {
      try {
        config.filterRegex = new RegExp(value, 'i');
        updateStatus(`Filter set: ${value}`);
      } catch (e) {
        updateStatus(`Invalid regex: ${e.message}`);
      }
    }
    screen.render();
  });
}

function updateStatus(message = null) {
  const status = message || (isPaused ? 'PAUSED' : 'RUNNING');
  const filterInfo = config.filterRegex ? `| Filter: ${config.filterRegex.toString()}` : '';
  
  statusBar.setContent(
    ` {bold}Event Bus Monitor{/bold} | Status: ${status} ${filterInfo} | Events: ${events.length} | Press [p] to pause, [c] to clear, [f] to filter, [q] to quit`
  );
  screen.render();
}

function clearEvents() {
  events = [];
  eventLog.logLines = [];
  eventLog.setContent('');
  eventCounts = {};
  updateCharts();
}

// Format event for display
function formatEvent(event) {
  const timestamp = new Date(event.timestamp).toLocaleTimeString();
  const prefix = findEmojiPrefix(event.type);
  
  // Choose color based on event type
  let color = config.colorTheme.default;
  
  if (event.type.startsWith('command:')) color = config.colorTheme.command;
  else if (event.type.startsWith('ui:')) color = config.colorTheme.ui;
  else if (event.type.startsWith('service:')) color = config.colorTheme.service;
  else if (event.type.includes('error')) color = config.colorTheme.error;
  else if (event.type.startsWith('app:') || event.type.startsWith('window:')) {
    color = config.colorTheme.system;
  }
  
  const formattedData = event.data 
    ? '\n  ' + JSON.stringify(event.data, null, 2).replace(/\n/g, '\n  ')
    : '';
  
  return `${chalk[color](`${timestamp} ${prefix}${event.type}`)}${formattedData}`;
}

// Find emoji prefix for event type
function findEmojiPrefix(eventType) {
  for (const [prefix, emoji] of Object.entries(config.emojiMap)) {
    if (eventType.startsWith(prefix)) {
      return emoji;
    }
  }
  return config.emojiMap.default;
}

// Add event to log
function addEvent(event) {
  if (isPaused) return;
  
  // Apply filter if set
  if (config.filterRegex && !config.filterRegex.test(event.type)) {
    return;
  }
  
  events.push(event);
  eventCountBySecond++;
  
  // Update event counts by type
  const category = event.type.split(':')[0] + ':';
  eventCounts[category] = (eventCounts[category] || 0) + 1;
  
  // Log to display
  eventLog.log(formatEvent(event));
  
  // Trim events if over max
  if (events.length > config.maxEvents) {
    events.shift();
  }
}

// Update charts
function updateCharts() {
  // Update bar chart
  const categories = Object.keys(eventCounts);
  const counts = categories.map(c => eventCounts[c]);
  
  eventCountChart.setData({
    titles: categories,
    data: counts
  });
  
  // Update line chart
  if (eventRates.length > 20) eventRates.shift();
  
  eventRateLineChart.setData([{
    title: 'Events/sec',
    x: [...Array(eventRates.length).keys()].map(String),
    y: eventRates,
    style: { line: 'yellow' }
  }]);
  
  screen.render();
}

// Set up WebSocket server for monitoring
function startWebSocketServer() {
  wsServer = new WebSocket.Server({ port: config.port });
  console.log(`WebSocket server started on port ${config.port}`);
  
  wsServer.on('connection', function connection(ws) {
    console.log('New monitor connection established');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'monitor:connected',
      data: {
        message: 'Connected to Event Bus Monitor',
        timestamp: Date.now()
      },
      timestamp: Date.now()
    }));
    
    ws.on('message', function incoming(message) {
      try {
        const event = JSON.parse(message);
        if (!event.timestamp) event.timestamp = Date.now();
        addEvent(event);
      } catch (e) {
        console.error('Failed to parse event:', e);
      }
    });
    
    ws.on('close', function() {
      console.log('Monitor connection closed');
    });
  });
}

// Set up refresh timer
setInterval(function() {
  updateCharts();
}, config.refreshRate);

// Set up event rate calculation
setInterval(function() {
  eventRates.push(eventCountBySecond);
  eventCountBySecond = 0;
}, 1000);

// Start the server
try {
  startWebSocketServer();
  updateStatus('Server started');
} catch (e) {
  updateStatus(`Error: ${e.message}`);
}
// 🔹 END: Event Monitoring 🔹
// 🛬 END: Terminal Event Monitor 🛬
```

## Event Injector Tool

The Event Injector lets you trigger test events from the terminal to simulate user interactions or system events.

### Implementation

```javascript
// 🚀 START: Event Injector Tool 🚀
const WebSocket = require('ws');
const readline = require('readline');
const chalk = require('chalk');

// 🔷 START: Configuration 🔷
const config = {
  monitorPort: 8080,
  appPort: 8081,
  eventTemplates: {
    'select-svg': {
      type: 'command:select-svg',
      data: { id: 'svg-001' }
    },
    'display-svg': {
      type: 'command:display-svg',
      data: { id: 'svg-001', target: 'quadrant-1' }
    },
    'error': {
      type: 'app:error',
      data: { message: 'Test error', source: 'injector' }
    },
    'ui-change': {
      type: 'ui:theme-changed',
      data: { theme: 'dark' }
    }
  }
};
// 🔹 END: Configuration 🔹

// 🔷 START: Tool Setup 🔷
// Create WebSocket connections
let monitorSocket;
let appSocket;

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green('event-injector> ')
});

// Initialize connections
function initializeConnections() {
  // Connect to monitor
  monitorSocket = new WebSocket(`ws://localhost:${config.monitorPort}`);
  
  monitorSocket.on('open', () => {
    console.log(chalk.green('✓ Connected to Event Monitor'));
  });
  
  monitorSocket.on('error', (error) => {
    console.error(chalk.red('✗ Monitor connection error:'), error.message);
  });
  
  // Connect to application
  appSocket = new WebSocket(`ws://localhost:${config.appPort}`);
  
  appSocket.on('open', () => {
    console.log(chalk.green('✓ Connected to Application'));
  });
  
  appSocket.on('error', (error) => {
    console.error(chalk.red('✗ Application connection error:'), error.message);
  });
  
  // Start prompt
  rl.prompt();
}

// Display help message
function showHelp() {
  console.log(chalk.cyan('\nEvent Injector Commands:'));
  console.log(chalk.yellow('  send <event-type> [JSON data]') + ' - Send custom event');
  console.log(chalk.yellow('  template <template-name>') + ' - Use predefined event template');
  console.log(chalk.yellow('  list') + ' - List available templates');
  console.log(chalk.yellow('  exit') + ' - Exit the program');
  console.log(chalk.yellow('  help') + ' - Show this help');
  console.log();
  
  rl.prompt();
}

// List available templates
function listTemplates() {
  console.log(chalk.cyan('\nAvailable Templates:'));
  
  Object.entries(config.eventTemplates).forEach(([name, event]) => {
    console.log(chalk.yellow(`  ${name}`) + ` - ${event.type}`);
  });
  console.log();
  
  rl.prompt();
}

// Send event to both monitor and application
function sendEvent(event) {
  if (!event.timestamp) {
    event.timestamp = Date.now();
  }
  
  const eventJson = JSON.stringify(event);
  
  // Send to monitor
  if (monitorSocket && monitorSocket.readyState === WebSocket.OPEN) {
    monitorSocket.send(eventJson);
  }
  
  // Send to application
  if (appSocket && appSocket.readyState === WebSocket.OPEN) {
    appSocket.send(eventJson);
  }
  
  console.log(chalk.green('✓ Event sent:'), chalk.yellow(event.type));
  rl.prompt();
}

// Process command
function processCommand(command) {
  const parts = command.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  
  switch (cmd) {
    case 'help':
      showHelp();
      break;
      
    case 'list':
      listTemplates();
      break;
      
    case 'send':
      if (parts.length < 2) {
        console.log(chalk.red('✗ Error: Event type required'));
        break;
      }
      
      const eventType = parts[1];
      let eventData = {};
      
      // Parse JSON data if provided
      if (parts.length > 2) {
        try {
          const jsonStr = parts.slice(2).join(' ');
          eventData = JSON.parse(jsonStr);
        } catch (e) {
          console.log(chalk.red('✗ Error parsing JSON:'), e.message);
          break;
        }
      }
      
      sendEvent({
        type: eventType,
        data: eventData
      });
      break;
      
    case 'template':
      if (parts.length < 2) {
        console.log(chalk.red('✗ Error: Template name required'));
        break;
      }
      
      const templateName = parts[1];
      const template = config.eventTemplates[templateName];
      
      if (!template) {
        console.log(chalk.red(`✗ Error: Template '${templateName}' not found`));
        break;
      }
      
      sendEvent(template);
      break;
      
    case 'exit':
    case 'quit':
      console.log(chalk.green('Goodbye!'));
      process.exit(0);
      break;
      
    default:
      console.log(chalk.red(`✗ Unknown command: ${cmd}`));
      showHelp();
      break;
  }
  
  rl.prompt();
}

// Initialize and start
console.log(chalk.cyan('=== Event Injector Tool ==='));
console.log(chalk.cyan('Connecting to Event Monitor and Application...'));

initializeConnections();

// Set up command handling
rl.on('line', (line) => {
  processCommand(line.trim());
}).on('close', () => {
  console.log(chalk.green('Goodbye!'));
  process.exit(0);
});

// Show initial help
showHelp();
// 🔹 END: Tool Setup 🔹
// 🛬 END: Event Injector Tool 🛬
```

## Event Flow Visualizer

The Event Flow Visualizer tracks the sequence and timing of related events to visualize event chains and calculate performance metrics.

### Implementation

```javascript
// 🚀 START: Event Flow Visualizer 🚀
const WebSocket = require('ws');
const chalk = require('chalk');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const { v4: uuidv4 } = require('uuid');

// 🔷 START: Configuration 🔷
const config = {
  port: 8080,
  eventGroups: [
    {
      name: 'SVG Selection Flow',
      startEvent: 'command:select-svg',
      relatedEvents: ['svg:selected', 'ui:updated'],
      color: 'yellow'
    },
    {
      name: 'SVG Display Flow',
      startEvent: 'command:display-svg',
      relatedEvents: ['service:svg-processed', 'svg:displayed', 'ui:updated'],
      color: 'green'
    },
    {
      name: 'Error Flow',
      startEvent: 'app:error',
      relatedEvents: ['ui:error-displayed'],
      color: 'red'
    }
  ],
  maxFlows: 10,
  timeThreshold: 5000 // ms - max time to consider events related
};
// 🔹 END: Configuration 🔹

// 🔷 START: UI Setup 🔷
// Create a screen object
const screen = blessed.screen({
  smartCSR: true,
  title: 'Event Flow Visualizer'
});

// Create layout grid
const grid = new contrib.grid({
  rows: 12,
  cols: 12,
  screen: screen
});

// Flow table
const flowTable = grid.set(0, 0, 6, 12, contrib.table, {
  keys: true,
  vi: true,
  interactive: true,
  columnSpacing: 3,
  columnWidth: [24, 16, 10, 12, 10],
  fg: 'white',
  selectedFg: 'white',
  selectedBg: 'blue',
  label: 'Event Flows'
});

// Flow timing chart
const flowTimingChart = grid.set(6, 0, 6, 8, contrib.bar, {
  label: 'Event Flow Duration (ms)',
  barWidth: 5,
  barSpacing: 6,
  xOffset: 2,
  maxHeight: 9
});

// Flow details
const flowDetails = grid.set(6, 8, 6, 4, blessed.box, {
  label: 'Flow Details',
  content: 'Select a flow to view details',
  scrollable: true,
  mouse: true,
  keys: true,
  vi: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    inverse: true
  }
});

// Set up key handlers
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.key('c', function() {
  clearFlows();
});

// Status bar
const statusBar = blessed.box({
  bottom: 0,
  left: 0,
  right: 0,
  height: 1,
  content: ' {bold}Event Flow Visualizer{/bold} | Press [c] to clear, [q] to quit',
  tags: true,
  style: {
    fg: 'white',
    bg: 'blue'
  }
});

screen.append(statusBar);
screen.render();
// 🔹 END: UI Setup 🔹

// 🔷 START: Flow Tracking 🔷
// Storage variables
let eventFlows = []; // Active and completed flows
let activeFlows = new Map(); // In-progress flows by ID

// Find event group for an event
function findEventGroup(eventType) {
  return config.eventGroups.find(group => 
    group.startEvent === eventType || group.relatedEvents.includes(eventType)
  );
}

// Create a new flow
function createFlow(event, group) {
  const flow = {
    id: uuidv4(),
    group: group.name,
    startEvent: event.type,
    startTime: event.timestamp,
    events: [{ ...event, timeSinceStart: 0 }],
    endTime: null,
    completed: false,
    duration: null,
    color: group.color
  };
  
  // Add to active flows
  activeFlows.set(flow.id, flow);
  
  // Add to all flows
  eventFlows.unshift(flow);
  
  // Trim flows if over limit
  if (eventFlows.length > config.maxFlows) {
    eventFlows.pop();
  }
  
  return flow;
}

// Add event to flow
function addEventToFlow(flow, event) {
  const timeSinceStart = event.timestamp - flow.startTime;
  
  flow.events.push({
    ...event,
    timeSinceStart
  });
  
  // Check if this completes the flow
  const group = config.eventGroups.find(g => g.name === flow.group);
  const allEventsPresent = group.relatedEvents.every(eventType => 
    flow.events.some(e => e.type === eventType)
  );
  
  if (allEventsPresent) {
    flow.completed = true;
    flow.endTime = event.timestamp;
    flow.duration = flow.endTime - flow.startTime;
    
    // Remove from active flows
    activeFlows.delete(flow.id);
  }
}

// Handle new event
function handleEvent(event) {
  // Find the event group
  const eventGroup = findEventGroup(event.type);
  if (!eventGroup) return; // Not a tracked event
  
  if (event.type === eventGroup.startEvent) {
    // Start event - create new flow
    createFlow(event, eventGroup);
  } else {
    // Related event - find active flows in this group
    for (const [id, flow] of activeFlows.entries()) {
      if (flow.group === eventGroup.name) {
        // Add to this flow if within time threshold
        const timeSinceStart = event.timestamp - flow.startTime;
        if (timeSinceStart <= config.timeThreshold) {
          addEventToFlow(flow, event);
        }
      }
    }
  }
  
  // Update the UI
  updateFlowTable();
  updateFlowChart();
  screen.render();
}

// Update flow table
function updateFlowTable() {
  const data = [
    ['Flow Group', 'Start Event', 'Status', 'Duration (ms)', 'Events']
  ];
  
  eventFlows.forEach(flow => {
    data.push([
      flow.group,
      flow.startEvent,
      flow.completed ? 'Completed' : 'In Progress',
      flow.duration ? flow.duration.toString() : '-',
      flow.events.length.toString()
    ]);
  });
  
  flowTable.setData({
    headers: data[0],
    data: data.slice(1)
  });
  
  // Set up selection handling
  flowTable.rows.on('select', function(item) {
    const idx = flowTable.rows.selected;
    showFlowDetails(eventFlows[idx]);
  });
}

// Show flow details
function showFlowDetails(flow) {
  if (!flow) {
    flowDetails.setContent('No flow selected');
    return;
  }
  
  let content = `{bold}${flow.group}{/bold}\n`;
  content += `Status: ${flow.completed ? 'Completed' : 'In Progress'}\n`;
  content += `Duration: ${flow.duration ? flow.duration + 'ms' : 'In progress'}\n\n`;
  content += '{underline}Events:{/underline}\n';
  
  flow.events.forEach(event => {
    content += `${event.timeSinceStart}ms - ${event.type}\n`;
    if (event.data) {
      const dataStr = JSON.stringify(event.data)
        .replace(/{/g, '')
        .replace(/}/g, '')
        .replace(/"/g, '')
        .replace(/,/g, ', ');
      content += `  ${dataStr}\n`;
    }
  });
  
  flowDetails.setContent(content);
  screen.render();
}

// Update flow chart
function updateFlowChart() {
  const completedFlows = eventFlows.filter(flow => flow.completed);
  
  if (completedFlows.length === 0) {
    flowTimingChart.setData({
      titles: ['No completed flows'],
      data: [0]
    });
    return;
  }
  
  // Group flows by type
  const flowsByGroup = {};
  
  completedFlows.forEach(flow => {
    if (!flowsByGroup[flow.group]) {
      flowsByGroup[flow.group] = [];
    }
    flowsByGroup[flow.group].push(flow.duration);
  });
  
  // Calculate averages
  const groups = [];
  const durations = [];
  
  for (const [group, times] of Object.entries(flowsByGroup)) {
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    groups.push(group);
    durations.push(Math.round(avg));
  }
  
  flowTimingChart.setData({
    titles: groups,
    data: durations
  });
}

// Clear flows
function clearFlows() {
  eventFlows = [];
  activeFlows.clear();
  
  updateFlowTable();
  updateFlowChart();
  flowDetails.setContent('No flow selected');
  
  screen.render();
}

// Set up WebSocket server for monitoring
let wsServer;

function startWebSocketServer() {
  wsServer = new WebSocket.Server({ port: config.port });
  console.log(`WebSocket server started on port ${config.port}`);
  
  wsServer.on('connection', function connection(ws) {
    console.log('New flow monitor connection established');
    
    ws.on('message', function incoming(message) {
      try {
        const event = JSON.parse(message);
        if (!event.timestamp) event.timestamp = Date.now();
        handleEvent(event);
      } catch (e) {
        console.error('Failed to parse event:', e);
      }
    });
  });
}

// Start the server
try {
  startWebSocketServer();
  statusBar.setContent(' {bold}Event Flow Visualizer{/bold} | Server started on port ' + config.port + ' | Press [c] to clear, [q] to quit');
} catch (e) {
  statusBar.setContent(' {bold}Event Flow Visualizer{/bold} | Error: ' + e.message);
}

screen.render();
// 🔹 END: Flow Tracking 🔹
// 🛬 END: Event Flow Visualizer 🛬
```

## Integration with Electron

To integrate these monitoring tools with your Electron app, you'll need to create a bridge that sends events from your event bus to the monitoring tools.

### Event Bus Integration

```javascript
// 🚀 START: Event Bus Monitor Integration 🚀
// Add this to your EventBus implementation in both main and renderer processes

// 🔷 START: Monitor Connection 🔷
/**
 * Add monitoring capabilities to EventBus
 */
function setupMonitoring(eventBus, options = {}) {
  const config = {
    monitorUrl: options.monitorUrl || 'ws://localhost:8080',
    enabled: options.enabled !== false,
    filters: options.filters || [],
    processName: options.processName || (process.type === 'browser' ? 'main' : 'renderer')
  };
  
  let monitorSocket = null;
  let reconnectTimer = null;
  let connected = false;
  
  // Connect to monitor
  function connect() {
    if (!config.enabled) return;
    
    try {
      monitorSocket = new WebSocket(config.monitorUrl);
      
      monitorSocket.onopen = () => {
        connected = true;
        console.log(`Connected to event monitor on ${config.monitorUrl}`);
        
        // Send hello event
        sendToMonitor({
          type: 'monitor:connected',
          data: {
            process: config.processName,
            pid: process.pid
          }
        });
      };
      
      monitorSocket.onclose = () => {
        connected = false;
        console.log('Disconnected from event monitor, reconnecting in 5s...');
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 5000);
      };
      
      monitorSocket.onerror = (error) => {
        console.error('Monitor connection error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to monitor:', error);
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 5000);
    }
  }
  
  // Send event to monitor
  function sendToMonitor(event) {
    if (!connected || !monitorSocket) return;
    
    // Apply filters
    if (config.filters.length > 0) {
      const isFiltered = config.filters.some(filter => event.type.includes(filter));
      if (isFiltered) return;
    }
    
    // Add process info and timestamp
    const enrichedEvent = {
      ...event,
      process: config.processName,
      timestamp: event.timestamp || Date.now()
    };
    
    try {
      monitorSocket.send(JSON.stringify(enrichedEvent));
    } catch (error) {
      console.error('Failed to send event to monitor:', error);
    }
  }
  
  // Hook into event bus
  const originalEmit = eventBus.emit;
  
  eventBus.emit = function(event, data) {
    // Call original implementation
    const result = originalEmit.call(this, event, data);
    
    // Send to monitor
    sendToMonitor({
      type: event,
      data: data
    });
    
    return result;
  };
  
  // Start the connection
  connect();
  
  // Add control methods to event bus
  eventBus.monitor = {
    connect,
    disconnect: () => {
      if (monitorSocket) {
        monitorSocket.close();
      }
      clearTimeout(reconnectTimer);
    },
    setEnabled: (enabled) => {
      config.enabled = enabled;
      if (enabled) {
        connect();
      } else {
        if (monitorSocket) {
          monitorSocket.close();
        }
        clearTimeout(reconnectTimer);
      }
    }
  };
  
  return eventBus;
}
// 🔹 END: Monitor Connection 🔹

// Usage example:
// Main process
const eventBus = new EventBus();
setupMonitoring(eventBus, {
  processName: 'main',
  filters: ['mouse:', 'mousemove'] // Filter out noisy events
});

// Renderer process
const rendererEventBus = new EventBus();
setupMonitoring(rendererEventBus, {
  processName: 'renderer'
});
// 🛬 END: Event Bus Monitor Integration 🛬
```

## Usage Examples

### Starting the Monitoring Tools

1. **Start the Event Monitor:**
   ```bash
   # Terminal 1
   node event-monitor.js
   ```

2. **Start the Event Injector:**
   ```bash
   # Terminal 2
   node event-injector.js
   ```

3. **Start the Flow Visualizer:**
   ```bash
   # Terminal 3
   node event-flow-visualizer.js
   ```

4. **Start your Electron app with monitoring enabled:**
   ```bash
   # Terminal 4
   MONITOR_ENABLED=true npm start
   ```

### Monitoring App Behavior

With all tools running, here's what you'll see:

1. **Event Monitor Terminal:**
   ```
   17:42:15.123 🚀 app:ready
     {"timestamp":1682789535123}
   17:42:15.456 🖼️ ui:initialized
     {"components":["svg-list","svg-controller"]}
   17:42:16.789 ⚡ command:select-svg
     {"id":"svg-001"}
   17:42:16.901 🔧 service:svg-loaded
     {"id":"svg-001","size":1024}
   17:42:17.012 🎨 svg:selected
     {"id":"svg-001","name":"circle.svg"}
   ```

2. **Event Flow Visualizer:**
   ```
   SVG Selection Flow
   Status: Completed
   Duration: 223ms

   Events:
   0ms - command:select-svg
     id: svg-001
   112ms - service:svg-loaded
     id: svg-001, size: 1024
   223ms - svg:selected
     id: svg-001, name: circle.svg
   ```

3. **Event Injector Terminal:**
   ```
   event-injector> template select-svg
   ✓ Event sent: command:select-svg
   
   event-injector> send ui:theme-changed {"theme":"dark"}
   ✓ Event sent: ui:theme-changed
   ```

### Key Benefits

1. **Real-time Visibility:** See events as they happen across processes
2. **Performance Tracking:** Measure time between related events
3. **Debugging:** Quickly identify issues in event flow
4. **Testing:** Inject test events without UI interaction
5. **Visual Patterns:** Emoji icons make event types easy to recognize
6. **Flow Analysis:** Track event chains to understand system behavior

These tools provide deep insight into what's happening "under the hood" of your application, making it easier to understand, debug, and optimize the event-driven architecture.
