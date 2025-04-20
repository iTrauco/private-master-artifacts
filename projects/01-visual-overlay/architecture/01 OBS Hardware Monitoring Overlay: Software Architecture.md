01. Baseline OBS Visual System | dev@trau.co | https://claude.ai/chat/96120e9e-ca49-4509-934c-1ab656bf61d6


# OBS Hardware Monitoring Overlay: Software Architecture

## 1. Overview

The OBS Hardware Monitoring Overlay is a desktop application built with Electron and Node.js that provides real-time hardware metrics visualization. It features a transparent window that can be used standalone or captured in OBS for live streaming. The application follows a multi-page architecture with a client-server model for data collection and visualization.

## 2. System Architecture

### 2.1 High-Level Components

The application consists of three primary components:

1. **Electron App**: Creates a transparent, frameless window that displays hardware metrics
2. **Express Server**: Collects hardware metrics from the system and exposes them via an API
3. **Frontend Pages**: HTML/CSS/JavaScript pages for different views and visualizations

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Application                  │
│                                                         │
│  ┌─────────────┐        ┌───────────────────────────┐   │
│  │             │        │                           │   │
│  │  Express    │◄───────┤  Frontend (HTML/CSS/JS)   │   │
│  │  Server     │        │                           │   │
│  │             │        │                           │   │
│  └─────┬───────┘        └───────────────────────────┘   │
│        │                                                │
└────────┼────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│                 │
│  System         │
│  Hardware       │
│                 │
└─────────────────┘
```

### 2.2 Communication Flow

- The Express server collects hardware metrics from the system
- The frontend requests data from the server via API calls
- The Electron app loads different HTML pages based on navigation
- IPC (Inter-Process Communication) is used for window controls between frontend and Electron

## 3. Application Structure

### 3.1 Directory Structure

```
obs-hardware-overlay/
├── electron-app.js        # Main Electron entry point
├── preload.js             # Electron preload script for IPC
├── package.json           # Project configuration and dependencies
├── start.sh               # Development startup script
├── server/
│   └── server.js          # Express server for hardware metrics
└── public/
    ├── index.html         # Main HTML entry point
    ├── js/
    │   ├── navigation.js  # Navigation between pages
    │   └── overlay.js     # Hardware monitoring functionality
    ├── css/
    │   ├── style.css      # Global styles
    │   ├── nav.css        # Navigation styles
    │   ├── gpu-metrics.css
    │   ├── system-info.css
    │   └── process-monitor.css
    └── pages/
        ├── dashboard.html # Dashboard page
        ├── cpu.html       # CPU metrics page
        ├── gpu.html       # GPU metrics page
        ├── system.html    # System info page
        └── settings.html  # Settings page
```

### 3.2 Key Files and Their Responsibilities

- **electron-app.js**: Creates the transparent window, handles IPC events
- **preload.js**: Provides secure bridge between renderer and main process
- **server.js**: Collects hardware metrics using Node.js and exposes API
- **navigation.js**: Handles page navigation within the Electron app
- **overlay.js**: Fetches hardware data and updates visualizations

## 4. Design Patterns & Architectural Standards

### 4.1 Multi-Page Application (MPA) Pattern

The application follows a Multi-Page Application pattern where each view is a separate HTML file. This approach:

- Separates concerns by functionality (CPU, GPU, System, etc.)
- Makes the codebase more maintainable
- Allows for specialized optimizations per view

### 4.2 Client-Server Architecture

The application uses a client-server architecture where:

- The server (Node.js/Express) is responsible for data collection
- The client (HTML/CSS/JavaScript) is responsible for visualization
- RESTful API principles are followed for data exchange

### 4.3 IPC Communication Pattern

For Electron-specific features, the application uses the IPC (Inter-Process Communication) pattern:

- Main process (electron-app.js) handles system-level operations
- Renderer process (web pages) handles UI
- Preload script provides a secure bridge for communication

### 4.4 Component-Based Design (Future Implementation)

While not fully implemented yet, the architecture is being refactored to support:

- Reusable UI components for different hardware metrics
- Service Provider pattern for centralized service management
- Component Factory pattern for dynamic component creation

## 5. Technology Stack

### 5.1 Core Technologies

- **Electron**: For creating the desktop application
- **Node.js**: Server-side runtime environment
- **Express**: Web server framework
- **HTML/CSS/JavaScript**: Frontend technologies

### 5.2 Development Tools

- **Nodemon**: For automatic server restarting during development
- **Concurrently**: For running multiple commands simultaneously
- **NPM Scripts**: For defining development and build workflows

## 6. Deployment & Development

### 6.1 Development Workflow

The application uses a streamlined development workflow:

- **start.sh**: Runs both server and Electron app with auto-reload
- **Nodemon**: Watches for file changes and restarts server/app
- **Concurrently**: Runs server and Electron processes simultaneously

### 6.2 Deployment Considerations

For production deployment:

- Package the application using Electron Packager or Electron Forge
- Include all necessary dependencies
- Optimize for performance by minifying assets
- Configure for auto-startup (if desired)

## 7. Future Architecture Enhancements

Planned architectural improvements include:

- **Full Component-Based Architecture**: Reusable components for different visualizations
- **Service Provider Pattern**: Central registry for application services
- **State Management**: More sophisticated state management for settings and preferences
- **Plugin System**: Allow for custom visualizations and data sources
- **Theme Support**: Centralized theming system

## 8. Security Considerations

Key security aspects of the architecture:

- Electron's contextIsolation for secure IPC
- Careful use of nodeIntegration (currently disabled for security)
- Input validation for any user-configurable settings

## 9. Performance Optimizations

Performance considerations in the architecture:

- Throttled API calls to minimize system resource usage
- Efficient canvas-based rendering for visualizations
- Transparency optimizations for the Electron window