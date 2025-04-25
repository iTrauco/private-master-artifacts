/**
 * Path: /public/js/cloud-functions/controllers/index.js
 * Cloud Functions Main Controller
 * Initializes and coordinates Cloud Functions component controllers
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🧠 Cloud Functions controller initializing');
  
  // Initialize event bus for communication between controllers
  window.cfEventBus = {
    publish: function(event, data) {
      const customEvent = new CustomEvent(event, { detail: data });
      document.dispatchEvent(customEvent);
    },
    subscribe: function(event, callback) {
      document.addEventListener(event, callback);
    }
  };
  
  // Get environment variables from preload (if available)
  console.log('🔍 Checking for environment variables from preload script:');
  if (window.env) {
    console.log('✅ Environment variables from preload script found:');
    console.log('CF_PROJECT_ID:', window.env.CF_PROJECT_ID);
    console.log('CF_KEY_PATH:', window.env.CF_KEY_PATH);
    console.log('CF_REGION:', window.env.CF_REGION);
  } else {
    console.log('❌ No environment variables found from preload script');
  }
  
  // Initialize controllers
  const functionsController = window.functionsController.init();
  const logsController = window.logsController.init();
  const statsController = window.statsController.init();
  
  // Set up panel visibility controls
  setupPanelControls();
  
  // Setup settings panel
  setupSettingsPanel();
  
  function setupPanelControls() {
    const functionsPanel = document.getElementById('cf-functions-panel');
    const logsPanel = document.getElementById('cf-logs-panel');
    const statsPanel = document.getElementById('cf-stats-panel');
    const settingsPanel = document.getElementById('cf-settings-panel');
    
    if (!functionsPanel || !logsPanel || !statsPanel) {
      console.error('One or more panel elements not found');
      return;
    }
    
    // Show/hide panels
    const showAllBtn = document.getElementById('show-all-btn');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        if (functionsPanel) functionsPanel.style.display = 'block';
        if (logsPanel) logsPanel.style.display = 'block';
        if (statsPanel) statsPanel.style.display = 'block';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const hideAllBtn = document.getElementById('hide-all-btn');
    if (hideAllBtn) {
      hideAllBtn.addEventListener('click', () => {
        if (functionsPanel) functionsPanel.style.display = 'none';
        if (logsPanel) logsPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showFunctionsBtn = document.getElementById('show-functions-btn');
    if (showFunctionsBtn) {
      showFunctionsBtn.addEventListener('click', () => {
        if (functionsPanel) functionsPanel.style.display = 'block';
        if (logsPanel) logsPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showLogsBtn = document.getElementById('show-logs-btn');
    if (showLogsBtn) {
      showLogsBtn.addEventListener('click', () => {
        if (functionsPanel) functionsPanel.style.display = 'none';
        if (logsPanel) logsPanel.style.display = 'block';
        if (statsPanel) statsPanel.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showStatsBtn = document.getElementById('show-stats-btn');
    if (showStatsBtn) {
      showStatsBtn.addEventListener('click', () => {
        if (functionsPanel) functionsPanel.style.display = 'none';
        if (logsPanel) logsPanel.style.display = 'none';
        if (statsPanel) statsPanel.style.display = 'block';
        if (settingsPanel) settingsPanel.style.display = 'none';
      });
    }
    
    const showSettingsBtn = document.getElementById('show-settings-btn');
    if (showSettingsBtn && settingsPanel) {
      showSettingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    // Toggle navigation
    const toggleControlsBtn = document.getElementById('toggle-controls-btn');
    const showControlsBtn = document.getElementById('show-controls-btn');
    const controlPanel = document.querySelector('.hardware-controls');

    if (toggleControlsBtn && showControlsBtn && controlPanel) {
      toggleControlsBtn.addEventListener('click', () => {
        controlPanel.style.display = 'none';
        showControlsBtn.style.display = 'flex';
      });
      
      showControlsBtn.addEventListener('click', () => {
        controlPanel.style.display = 'flex';
        showControlsBtn.style.display = 'none';
      });
    }
  }
  
  function setupSettingsPanel() {
    const applySettingsBtn = document.getElementById('apply-settings');
    const useRealDataCheckbox = document.getElementById('use-real-data');
    const refreshIntervalInput = document.getElementById('refresh-interval');
    const refreshIntervalValue = document.getElementById('refresh-interval-value');
    
    if (!applySettingsBtn || !useRealDataCheckbox || !refreshIntervalInput) {
      console.error('One or more settings elements not found');
      return;
    }
    
    // Load saved settings
    const settings = loadSettings();
    
    // Apply saved settings to UI
    useRealDataCheckbox.checked = settings.useRealData;
    refreshIntervalInput.value = settings.refreshInterval;
    if (refreshIntervalValue) {
      refreshIntervalValue.textContent = settings.refreshInterval;
    }
    
    // Update refresh interval display
    if (refreshIntervalInput && refreshIntervalValue) {
      refreshIntervalInput.addEventListener('input', () => {
        refreshIntervalValue.textContent = refreshIntervalInput.value;
      });
    }
    
    applySettingsBtn.addEventListener('click', () => {
      const newSettings = { 
        useRealData: useRealDataCheckbox.checked,
        refreshInterval: parseInt(refreshIntervalInput.value),
        dataSourceChanged: settings.useRealData !== useRealDataCheckbox.checked
      };
      
      // Save settings to localStorage
      saveSettings(newSettings);
      
      // Notify controllers
      window.cfEventBus.publish('settingsChanged', newSettings);
      
      // Hide settings panel
      const settingsPanel = document.getElementById('cf-settings-panel');
      if (settingsPanel) {
        settingsPanel.style.display = 'none';
      }
    });
  }
  
  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem('cf_settings');
      console.log('🔄 Loading saved settings from localStorage:', savedSettings);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('🔄 Parsed settings:', parsedSettings);
        return parsedSettings;
      }
    } catch (e) {
      console.error('Error loading saved settings:', e);
    }
    
    // Default settings
    console.log('🔄 Using default settings (no saved settings found)');
    return {
      useRealData: false,
      refreshInterval: 30
    };
  }
  
  function saveSettings(settings) {
    try {
      localStorage.setItem('cf_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }
  
  console.log('🧠 Cloud Functions controller initialized successfully');
});

/**
 * Path: /public/js/cloud-functions/controllers/functions-controller.js
 * Functions Controller
 * Handles UI interactions for the functions panel
 */
window.functionsController = {
  init: function() {
    // DOM elements
    const functionsPanel = document.getElementById('cf-functions-panel');
    const functionsList = document.getElementById('functions-list');
    const loadFunctionsBtn = document.getElementById('load-functions-btn');
    
    // State
    let selectedFunctionName = localStorage.getItem('cf_selected_function') || null;
    
    // Initialize panel
    createFunctionsPanelUI();
    setupEventListeners();
    
    // Load functions on initialization
    loadFunctions();
    
    function createFunctionsPanelUI() {
      functionsPanel.innerHTML = `
        <div class="panel-title">
          Cloud Functions
          <span id="data-source-indicator" class="data-source-indicator">Loading...</span>
        </div>
        <div id="functions-list" class="list-container">
          <div class="empty-state">No functions loaded</div>
        </div>
        <button id="load-functions-btn" class="action-button">Load Functions</button>
        <div class="panel-footer">
          <span id="last-refreshed" class="refresh-timestamp">Not yet updated</span>
        </div>
        <button class="refresh-btn" title="Refresh data">
          <i class="fas fa-sync"></i>
        </button>
      `;
    }
    
    function setupEventListeners() {
      // Get fresh references after creating UI
      const loadFunctionsBtn = document.getElementById('load-functions-btn');
      const refreshBtn = functionsPanel.querySelector('.refresh-btn');
      
      if (loadFunctionsBtn) {
        loadFunctionsBtn.addEventListener('click', loadFunctions);
      }
      
      if (refreshBtn) {
        refreshBtn.addEventListener('click', loadFunctions);
      }
      
      // Subscribe to relevant events
      window.cfEventBus.subscribe('settingsChanged', handleSettingsChanged);
    }
    
    function loadFunctions() {
      const loadFunctionsBtn = document.getElementById('load-functions-btn');
      const functionsList = document.getElementById('functions-list');
      
      if (loadFunctionsBtn) {
        loadFunctionsBtn.disabled = true;
        loadFunctionsBtn.textContent = 'Loading...';
      }
      
      // Get settings
      const settings = loadSettings();
      const useRealData = settings.useRealData || false;
      
      // Add a console log here to verify the value
      console.log('🔍 FUNCTIONS CONTROLLER: loadFunctions with useRealData =', useRealData);
      
      window.cloudFunctionsService.fetchFunctions(useRealData, function(result) {
        console.log('📊 FUNCTIONS CONTROLLER: fetchFunctions result:', result);
        console.log('📊 FUNCTIONS CONTROLLER: isRealData =', result.isRealData);
        console.log('📊 FUNCTIONS CONTROLLER: keyFileExists =', result.keyFileExists);
        
        if (result) {
          renderFunctions(result.functions);
          updateDataSourceIndicator(result.isRealData);
          updateTimestamp();
        } else {
          if (functionsList) {
            functionsList.innerHTML = '<div class="error-state">Error loading functions</div>';
          }
        }
        
        if (loadFunctionsBtn) {
          loadFunctionsBtn.disabled = false;
          loadFunctionsBtn.textContent = 'Refresh Functions';
        }
      });
    }
    
    function renderFunctions(functions) {
      const functionsList = document.getElementById('functions-list');
      if (!functionsList) return;
      
      if (!functions || functions.length === 0) {
        functionsList.innerHTML = '<div class="empty-state">No functions available</div>';
        return;
      }
      
      let html = '';
      functions.forEach(func => {
        const isSelected = func.id === selectedFunctionName;
        html += `
          <div class="function-item ${isSelected ? 'selected' : ''}" 
               data-function-id="${func.id}">
            <div class="function-name">${func.name}</div>
            <div class="function-status ${func.status.toLowerCase()}">${func.status}</div>
          </div>
        `;
      });
      
      functionsList.innerHTML = html;
      
      // Add click handlers
      document.querySelectorAll('.function-item').forEach(item => {
        item.addEventListener('click', function() {
          selectFunction(this.dataset.functionId);
        });
      });
      
      // Auto-select previous function if available
      if (selectedFunctionName) {
        const selectedItem = document.querySelector(`.function-item[data-function-id="${selectedFunctionName}"]`);
        if (selectedItem) {
          selectFunction(selectedFunctionName);
        } else if (functions.length > 0) {
          // If selected function not found, select the first one
          selectFunction(functions[0].id);
        }
      } else if (functions.length > 0) {
        // If no selected function, select the first one
        selectFunction(functions[0].id);
      }
    }
    
    function selectFunction(functionId) {
      console.log('🚀 FUNCTIONS CONTROLLER: Selecting function:', functionId);
      selectedFunctionName = functionId;
      localStorage.setItem('cf_selected_function', functionId);
      
      // Update UI
      document.querySelectorAll('.function-item').forEach(item => {
        if (item.dataset.functionId === functionId) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      });
      
      // Notify other controllers
      console.log('📢 FUNCTIONS CONTROLLER: Publishing functionSelected event with functionId:', functionId);
      window.cfEventBus.publish('functionSelected', { functionId });
    }
    
    function handleSettingsChanged(event) {
      const settings = event.detail;
      // Add this log
      console.log('📣 FUNCTIONS CONTROLLER: Received settingsChanged event:', settings);
      
      if (settings.dataSourceChanged) {
        console.log('🔄 FUNCTIONS CONTROLLER: Data source changed, reloading functions');
        // Clear selection and reload functions with new data source
        selectedFunctionName = null;
        localStorage.removeItem('cf_selected_function');
        loadFunctions();
      }
    }
    
    function updateDataSourceIndicator(isRealData) {
      const indicator = document.getElementById('data-source-indicator');
      if (indicator) {
        if (isRealData) {
          indicator.textContent = 'Real Data';
          indicator.classList.remove('mock-data');
          indicator.classList.add('real-data');
        } else {
          indicator.textContent = 'Mock Data';
          indicator.classList.remove('real-data');
          indicator.classList.add('mock-data');
        }
      }
    }
    
    function updateTimestamp() {
      const timestampEl = document.getElementById('last-refreshed');
      if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
      }
    }
    
    function loadSettings() {
      try {
        const savedSettings = localStorage.getItem('cf_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
      
      return {
        useRealData: false,
        refreshInterval: 30
      };
    }
    
    // Public API
    return {
      loadFunctions,
      selectFunction
    };
  }
};

/**
 * Path: /public/js/cloud-functions/controllers/logs-controller.js
 * Logs Controller
 * Handles UI interactions for the logs panel
 */
window.logsController = {
  init: function() {
    // DOM elements
    const logsPanel = document.getElementById('cf-logs-panel');
    let logsContainer = document.getElementById('logs-container');
    let chartContainer = document.getElementById('logs-chart-container');
    
    // State
    let selectedFunctionId = null;
    let logs = [];
    let pollingInterval = null;
    
    // Initialize panel
    createLogsPanelUI();
    setupEventListeners();
    
    function createLogsPanelUI() {
      logsPanel.innerHTML = `
        <div class="panel-title">Function Logs</div>
        <div id="logs-chart-container" class="chart-container">
          <!-- Chart will be inserted here -->
        </div>
        <div id="logs-container" class="logs-container">
          <div class="empty-state">Select a function to view logs</div>
        </div>
        <div class="panel-footer">
          <span id="logs-last-refreshed" class="refresh-timestamp">Not yet updated</span>
        </div>
        <button class="refresh-btn" title="Refresh data">
          <i class="fas fa-sync"></i>
        </button>
      `;
      
      // Get fresh references
      logsContainer = document.getElementById('logs-container');
      chartContainer = document.getElementById('logs-chart-container');
    }
    
    function setupEventListeners() {
      // Refresh button
      const refreshBtn = logsPanel.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          if (selectedFunctionId) {
            fetchLogs(selectedFunctionId);
          }
        });
      }
      
      // Subscribe to events
      window.cfEventBus.subscribe('functionSelected', handleFunctionSelected);
      window.cfEventBus.subscribe('settingsChanged', handleSettingsChanged);
    }
    
    function handleFunctionSelected(event) {
      console.log('📣 LOGS CONTROLLER: Received functionSelected event:', event.detail);
      const { functionId } = event.detail;
      selectedFunctionId = functionId;
      
      // Clear existing logs
      logs = [];
      renderLogs([]);
      
      // Fetch logs for selected function
      console.log('🔍 LOGS CONTROLLER: Fetching logs for function:', functionId);
      fetchLogs(functionId);
      
      // Start polling
      startPolling(functionId);
    }
    
    function fetchLogs(functionId) {
      console.log('🔄 LOGS CONTROLLER: fetchLogs called with functionId:', functionId);
      if (!functionId) {
        console.error('❌ LOGS CONTROLLER: No functionId provided to fetchLogs');
        return;
      }
      
      // Show loading state
      if (logsContainer) {
        logsContainer.innerHTML = '<div class="loading-state">Loading logs...</div>';
      } else {
        console.error('❌ LOGS CONTROLLER: logsContainer element not found in fetchLogs');
        return;
      }
      
      // Get settings
      const settings = loadSettings();
      const useRealData = settings.useRealData || false;
      
      // Fetch data
      console.log('📊 LOGS CONTROLLER: Fetching function logs with useRealData:', useRealData);
      window.cloudFunctionsService.fetchFunctionLogs(functionId, useRealData, function(result) {
        console.log('📊 LOGS CONTROLLER: Received function logs result:', result);
        if (result && result.logs) {
          console.log('📊 LOGS CONTROLLER: Logs received:', result.logs.length);
          logs = result.logs;
          renderLogs(logs);
          
          // Draw charts
          if (settings.showCharts !== false) {
            drawLogCharts(logs);
          }
          
          updateTimestamp();
        } else {
          console.error('❌ LOGS CONTROLLER: Failed to get logs from result');
          if (logsContainer) {
            logsContainer.innerHTML = '<div class="error-state">Error loading logs</div>';
          }
        }
      });
    }
    
    function renderLogs(logs) {
      console.log('🎨 LOGS CONTROLLER: renderLogs called with logs:', logs);
      
      // Refresh reference to logsContainer in case it was null earlier
      if (!logsContainer) {
        logsContainer = document.getElementById('logs-container');
        if (!logsContainer) {
          console.error('❌ LOGS CONTROLLER: logsContainer element not found in renderLogs');
          return;
        }
      }
      
      if (!logs || logs.length === 0) {
        console.log('⚠️ LOGS CONTROLLER: No logs to render');
        logsContainer.innerHTML = '<div class="empty-state">No logs available for this function</div>';
        return;
      }
      
      let html = `
        <div class="log-entries">
      `;
      
      // Sort logs by timestamp
      const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Generate log entries
      sortedLogs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        html += `
          <div class="log-entry ${log.severity.toLowerCase()}">
            <div class="log-header">
              <span class="log-severity">${log.severity}</span>
              <span class="log-timestamp">${timestamp}</span>
            </div>
            <div class="log-message">${log.message}</div>
          </div>
        `;
      });
      
      html += `
        </div>
      `;
      
      // Set the innerHTML and verify it was updated
      logsContainer.innerHTML = html;
      console.log('✅ LOGS CONTROLLER: Logs rendered, HTML length:', html.length);
    }
    
    function drawLogCharts(logs) {
      // Check if chart container exists
      if (!chartContainer) {
        chartContainer = document.getElementById('logs-chart-container');
        if (!chartContainer) {
          console.error('Chart container not found');
          return;
        }
      }
      
      if (!logs || logs.length === 0) {
        chartContainer.innerHTML = '<div class="empty-state">No log data available for charts</div>';
        return;
      }
      
      // Create canvas for logs chart
      chartContainer.innerHTML = `
        <canvas id="logs-severity-canvas" width="300" height="200"></canvas>
      `;
      
      const canvas = document.getElementById('logs-severity-canvas');
      if (canvas && window.CloudFunctionsCharts) {
        window.CloudFunctionsCharts.drawLogSeverityChart(logs, canvas);
      }
    }
    
    function startPolling(functionId) {
      // Clear existing interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      
      // Get settings
      const settings = loadSettings();
      const refreshInterval = (settings.refreshInterval || 30) * 1000; // Convert to milliseconds
      
      // Start new polling
      pollingInterval = setInterval(() => {
        if (selectedFunctionId) {
          fetchLogs(selectedFunctionId);
        }
      }, refreshInterval);
    }
    
    function handleSettingsChanged(event) {
      const settings = event.detail;
      
      // Update charts visibility
      if (chartContainer) {
        chartContainer.style.display = settings.showCharts !== false ? 'block' : 'none';
      }
      
      // Update refresh interval
      if (selectedFunctionId) {
        startPolling(selectedFunctionId);
      }
      
      // Reload data if source changed
      if (settings.dataSourceChanged && selectedFunctionId) {
        fetchLogs(selectedFunctionId);
      }
    }
    
    function updateTimestamp() {
      const timestampEl = document.getElementById('logs-last-refreshed');
      if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
      }
    }
    
    function loadSettings() {
      try {
        const savedSettings = localStorage.getItem('cf_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
      
      return {
        useRealData: false,
        refreshInterval: 30,
        showCharts: true
      };
    }
    
    // Public API
    return {
      fetchLogs
    };
  }
};

/**
 * Path: /public/js/cloud-functions/controllers/stats-controller.js
 * Stats Controller
 * Handles UI interactions for the stats panel
 */
window.statsController = {
  init: function() {
    // DOM elements
    const statsPanel = document.getElementById('cf-stats-panel');
    let statsContainer = document.getElementById('stats-container');
    
    // State
    let selectedFunctionId = null;
    let functionStats = null;
    
    // Initialize panel
    createStatsPanelUI();
    setupEventListeners();
    
    function createStatsPanelUI() {
      statsPanel.innerHTML = `
        <div class="panel-title">Function Stats</div>
        <div id="stats-container" class="stats-container">
          <div class="empty-state">Select a function to view stats</div>
        </div>
        <div class="panel-footer">
          <span id="stats-last-refreshed" class="refresh-timestamp">Not yet updated</span>
        </div>
        <button class="refresh-btn" title="Refresh data">
          <i class="fas fa-sync"></i>
        </button>
      `;
      
      // Get fresh reference
      statsContainer = document.getElementById('stats-container');
    }
    
    function setupEventListeners() {
      // Refresh button
      const refreshBtn = statsPanel.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          if (selectedFunctionId) {
            fetchStats(selectedFunctionId);
          }
        });
      }
      
      // Subscribe to events
      window.cfEventBus.subscribe('functionSelected', handleFunctionSelected);
    }
    
    function handleFunctionSelected(event) {
      console.log('📣 STATS CONTROLLER: Received functionSelected event:', event.detail);
      const { functionId } = event.detail;
      selectedFunctionId = functionId;
      
      // Clear existing stats
      functionStats = null;
      renderStats(null);
      
      // Fetch stats for selected function
      console.log('🔍 STATS CONTROLLER: Fetching stats for function:', functionId);
      fetchStats(functionId);
    }
    
    function fetchStats(functionId) {
      console.log('🔄 STATS CONTROLLER: fetchStats called with functionId:', functionId);
      if (!functionId) {
        console.error('❌ STATS CONTROLLER: No functionId provided to fetchStats');
        return;
      }
      
      // Show loading state
      if (statsContainer) {
        statsContainer.innerHTML = '<div class="loading-state">Loading stats...</div>';
      } else {
        console.error('❌ STATS CONTROLLER: statsContainer element not found in fetchStats');
        return;
      }
      
      // Get settings
      const settings = loadSettings();
      const useRealData = settings.useRealData || false;
      
      // Fetch data
      console.log('📊 STATS CONTROLLER: Fetching function stats with useRealData:', useRealData);
      window.cloudFunctionsService.fetchFunctionStats(functionId, useRealData, function(result) {
        console.log('📊 STATS CONTROLLER: Received function stats result:', result);
        if (result && result.stats) {
          console.log('📊 STATS CONTROLLER: Stats received:', result.stats);
          functionStats = result.stats;
          renderStats(functionStats);
          updateTimestamp();
        } else {
          console.error('❌ STATS CONTROLLER: Failed to get stats from result');
          if (statsContainer) {
            statsContainer.innerHTML = '<div class="error-state">Error loading stats</div>';
          }
        }
      });
    }
    
    function renderStats(stats) {
      console.log('🎨 STATS CONTROLLER: renderStats called with stats:', stats);
      
      // Refresh reference to statsContainer in case it was null earlier
      if (!statsContainer) {
        statsContainer = document.getElementById('stats-container');
        if (!statsContainer) {
          console.error('❌ STATS CONTROLLER: statsContainer element not found in renderStats');
          return;
        }
      }
      
      if (!stats) {
        console.log('⚠️ STATS CONTROLLER: No stats to render');
        statsContainer.innerHTML = '<div class="empty-state">No stats available for this function</div>';
        return;
      }
      
      let html = `
        <div class="stats-summary">
          <div class="stat-item">
            <div class="stat-value">${stats.invocations}</div>
            <div class="stat-label">Total Invocations</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${stats.avgExecutionTime}</div>
            <div class="stat-label">Avg. Execution Time</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${stats.errors}</div>
            <div class="stat-label">Errors</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${stats.memoryUsage}</div>
            <div class="stat-label">Memory Usage</div>
          </div>
        </div>
        
        <div class="execution-history">
          <h3>Execution History</h3>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Invocations</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Add execution history
      if (stats.executionHistory) {
        stats.executionHistory.forEach(day => {
          html += `
            <tr>
              <td>${day.day}</td>
              <td>${day.invocations}</td>
              <td>${day.errors}</td>
            </tr>
          `;
        });
      }
      
      html += `
            </tbody>
          </table>
        </div>
      `;
      
      // Set the innerHTML and verify it was updated
      statsContainer.innerHTML = html;
      console.log('✅ STATS CONTROLLER: Stats rendered, HTML length:', html.length);
    }
    
    function updateTimestamp() {
      const timestampEl = document.getElementById('stats-last-refreshed');
      if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
      }
    }
    
    function loadSettings() {
      try {
        const savedSettings = localStorage.getItem('cf_settings');
        if (savedSettings) {
          return JSON.parse(savedSettings);
        }
      } catch (e) {
        console.error('Error loading saved settings:', e);
      }
      
      return {
        useRealData: false,
        refreshInterval: 30
      };
    }
    
    // Public API
    return {
      fetchStats
    };
  }
};

/**
 * Path: /public/js/cloud-functions/services/cloud-functions-service.js
 * Cloud Functions Frontend Service
 * Handles communication with the Cloud Functions API
 */

window.cloudFunctionsService = {
  /**
   * Fetch available cloud functions
   * @param {boolean} useRealData - Whether to use real data
   * @param {function} callback - Callback to handle response
   */
  fetchFunctions: function(useRealData, callback) {
    console.log(`🔍 Fetching Cloud Functions (useRealData: ${useRealData})`);
    
    fetch(`/api/cloud-functions/functions?useRealData=${useRealData}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📁 Functions fetched:', data);
        callback(data);
      })
      .catch(error => {
        console.error('❌ Error fetching Cloud Functions:', error);
        callback(null);
      });
  },
  
  /**
   * Fetch logs for a specific function
   * @param {string} functionId - Function ID
   * @param {boolean} useRealData - Whether to use real data
   * @param {function} callback - Callback to handle response
   */
  fetchFunctionLogs: function(functionId, useRealData, callback) {
    console.log(`🔍 SERVICE: fetchFunctionLogs details - functionId: ${functionId}, useRealData: ${useRealData}`);
    
    fetch(`/api/cloud-functions/logs/${functionId}?useRealData=${useRealData}`)
      .then(response => {
        console.log(`📡 SERVICE: Response status: ${response.status}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📊 SERVICE: Function logs fetched:', data);
        callback(data);
      })
      .catch(error => {
        console.error(`❌ SERVICE: Error fetching logs for function ${functionId}:`, error);
        callback(null);
      });
  },
  
  /**
   * Fetch stats for a specific function
   * @param {string} functionId - Function ID
   * @param {boolean} useRealData - Whether to use real data
   * @param {function} callback - Callback to handle response
   */
  fetchFunctionStats: function(functionId, useRealData, callback) {
    console.log(`🔍 SERVICE: fetchFunctionStats details - functionId: ${functionId}, useRealData: ${useRealData}`);
    
    fetch(`/api/cloud-functions/stats/${functionId}?useRealData=${useRealData}`)
      .then(response => {
        console.log(`📡 SERVICE: Response status: ${response.status}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('📊 SERVICE: Function stats fetched:', data);
        callback(data);
      })
      .catch(error => {
        console.error(`❌ SERVICE: Error fetching stats for function ${functionId}:`, error);
        callback(null);
      });
  },
  
  /**
   * Start polling for function logs
   * @param {string} functionId - Function ID
   * @param {boolean} useRealData - Whether to use real data
   * @param {function} callback - Callback to handle response
   * @param {number} interval - Polling interval in milliseconds
   * @returns {number} Interval ID
   */
  startPolling: function(functionId, useRealData, callback, interval = 30000) {
    // Initial fetch
    this.fetchFunctionLogs(functionId, useRealData, callback);
    
    // Set up interval for continuous updates
    const pollingInterval = setInterval(() => {
      this.fetchFunctionLogs(functionId, useRealData, callback);
    }, interval);
    
    return pollingInterval;
  },
  
  /**
   * Stop polling
   * @param {number} intervalId - Interval ID to stop
   */
  stopPolling: function(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
};

/**
 * Path: /public/js/cloud-functions/utils/chart-utils.js
 * Cloud Functions Chart Utilities
 * Provides functions for visualizing Cloud Functions data
 */

window.CloudFunctionsCharts = {
  /**
   * Draw a log severity distribution chart
   * @param {Array} logs - Log entries
   * @param {HTMLCanvasElement} canvas - Canvas element to draw on
   */
  drawLogSeverityChart: function(logs, canvas) {
    if (!canvas || !logs || logs.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Count logs by severity
    const severityCounts = {};
    logs.forEach(log => {
      const severity = log.severity.toLowerCase();
      severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });
    
    // Define severity colors
    const severityColors = {
      debug: 'rgba(75, 192, 192, 0.8)',  // Teal
      info: 'rgba(54, 162, 235, 0.8)',   // Blue
      notice: 'rgba(153, 102, 255, 0.8)', // Purple
      warning: 'rgba(255, 206, 86, 0.8)', // Yellow
      error: 'rgba(255, 99, 132, 0.8)',   // Red
      critical: 'rgba(255, 0, 0, 0.8)',   // Bright red
      alert: 'rgba(139, 0, 0, 0.8)',      // Dark red
      emergency: 'rgba(0, 0, 0, 0.8)'     // Black
    };
    
    // Draw pie chart
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    let startAngle = 0;
    const total = logs.length;
    
    Object.entries(severityCounts).forEach(([severity, count]) => {
      const sliceAngle = (count / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = severityColors[severity] || 'rgba(128, 128, 128, 0.8)';
      ctx.fill();
      
      // Add label if slice is large enough
      if (sliceAngle > 0.2) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(midAngle);
        const labelY = centerY + labelRadius * Math.sin(midAngle);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(severity, labelX, labelY);
      }
      
      startAngle = endAngle;
    });
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Log Severity Distribution', centerX, 10);
    
    // Draw legend
    const legendX = 10;
    let legendY = height - 10 - Object.keys(severityCounts).length * 20;
    
    Object.entries(severityCounts).forEach(([severity, count]) => {
      // Draw color box
      ctx.fillStyle = severityColors[severity] || 'rgba(128, 128, 128, 0.8)';
      ctx.fillRect(legendX, legendY, 15, 15);
      
      // Draw label
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const percentage = Math.round((count / total) * 100);
      ctx.fillText(`${severity}: ${count} (${percentage}%)`, legendX + 20, legendY + 7);
      
      legendY += 20;
    });
  }
};
