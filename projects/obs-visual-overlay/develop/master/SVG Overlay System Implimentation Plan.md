# Simplified SVG Overlay System Implementation Plan

## Project Overview

A streamlined Electron application that lets you load SVG files, position them on a transparent background, and use them as overlays in OBS Studio.

## Core Features

1. Load and display SVG files
2. Drag SVGs to position them
3. Transparent window compatibility with OBS
4. Simple control panel

## Step 1: Project Setup

```bash
# Create project directory
mkdir simple-svg-overlay
cd simple-svg-overlay

# Initialize npm project
npm init -y

# Install dependencies
npm install electron electron-builder
```

## Step 2: Basic Electron App Structure

Create the following files:

### package.json (update)

```json
{
  "name": "simple-svg-overlay",
  "version": "1.0.0",
  "description": "Simple SVG overlay system for OBS",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest"
  }
}
```

### main.js

```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Handle IPC messages from renderer
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'SVG Files', extensions: ['svg'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return { filePath, fileContent };
  }
  
  return null;
});
```

### preload.js

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog')
});
```

### index.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Simple SVG Overlay</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="control-panel">
    <button id="load-svg">Load SVG</button>
    <button id="toggle-controls">Hide Controls</button>
  </div>
  
  <div id="svg-container">
    <!-- SVGs will be loaded here -->
  </div>
  
  <script src="renderer.js"></script>
</body>
</html>
```

### renderer.js

```javascript
// DOM Elements
const loadSvgButton = document.getElementById('load-svg');
const toggleControlsButton = document.getElementById('toggle-controls');
const controlPanel = document.getElementById('control-panel');
const svgContainer = document.getElementById('svg-container');

// Variables to track SVG elements
let svgElements = [];
let draggedElement = null;
let dragOffset = { x: 0, y: 0 };

// Event Listeners
loadSvgButton.addEventListener('click', async () => {
  const result = await window.api.openFileDialog();
  if (result) {
    addSvgToContainer(result.fileContent);
  }
});

toggleControlsButton.addEventListener('click', () => {
  const isHidden = controlPanel.classList.toggle('hidden');
  toggleControlsButton.textContent = isHidden ? 'Show Controls' : 'Hide Controls';
});

// Functions
function addSvgToContainer(svgContent) {
  const wrapper = document.createElement('div');
  wrapper.className = 'svg-wrapper';
  wrapper.innerHTML = svgContent;
  
  // Make SVG draggable
  makeDraggable(wrapper);
  
  svgContainer.appendChild(wrapper);
  svgElements.push(wrapper);
}

function makeDraggable(element) {
  element.addEventListener('mousedown', startDrag);
  
  // Add draggable visual indicator
  element.classList.add('draggable');
}

function startDrag(e) {
  draggedElement = e.currentTarget;
  
  // Calculate the mouse offset within the element
  const rect = draggedElement.getBoundingClientRect();
  dragOffset = {
    x