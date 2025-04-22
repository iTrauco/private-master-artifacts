# Solar System Visualization - Complete Implementation

This document contains the complete implementation for the Solar System visualization module following the architectural guidelines from the Visual Effects Module Integration Guide.

## Table of Contents

1. [File Structure](#1-file-structure)
2. [Controller Implementation](#2-controller-implementation)
3. [View Implementation](#3-view-implementation) 
4. [Utils Implementation](#4-utils-implementation)
5. [Registry Integration](#5-registry-integration)
6. [Unit Tests](#6-unit-tests)
7. [Implementation Notes](#7-implementation-notes)

<a id="1-file-structure"></a>
## 1. File Structure

```
public/
├── css/
│   └── solarsystem/
│       ├── base.css
│       ├── panels.css
│       └── controls.css
├── js/
│   └── solarsystem/
│       ├── controllers/
│       │   └── solarsystem-controller.js
│       ├── services/
│       │   └── solarsystem-service.js
│       ├── components/
│       │   └── SolarSystemView.js
│       ├── models/
    const basisAText = this.scene.getObjectByName('basisAText');
    const basisBText = this.scene.getObjectByName('basisBText');
    
    if (basisAText && basisBText) {
        // Update basis labels
        const basisA = entanglementState.measurementBasis === 'random' ? 'Z' : entanglementState.measurementBasis.toUpperCase();
        const basisB = entanglementState.measurementBasis === 'random' ? 'X' : 
│       │   └── solarsystem-settings.js
│       └── utils/
│           └── solar-objects.js
├── pages/
│   └── solarsystem/
│       └── index.html
server/
├── routes/
│   ├── api/
│   │   └── solarsystem.js
│   └── pages.js (to modify)
└── utils/
    └── solarsystem/
        └── planet-service.js
```

<a id="2-controller-implementation"></a>
## 2. Controller Implementation

```javascript
/**
 * Solar System Controller
 * Manages user interactions with the solar system visualization
 */

class SolarSystemController {
    /**
     * Create a Solar System controller
     * @param {Object} dependencies - Dependencies for this controller
     */
    constructor(dependencies) {
        // Store dependencies
        this.solarSystemService = dependencies.solarSystemService;
        this.store = dependencies.store;
        this.initialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.render = this.render.bind(this);
        this.handlePlanetToggle = this.handlePlanetToggle.bind(this);
        this.handlePlanetScaleChange = this.handlePlanetScaleChange.bind(this);
        this.handleOrbitToggle = this.handleOrbitToggle.bind(this);
        this.handleLabelToggle = this.handleLabelToggle.bind(this);
        this.handleRotationSpeedChange = this.handleRotationSpeedChange.bind(this);
        this.handleCameraPositionChange = this.handleCameraPositionChange.bind(this);
        this.handleShowVideoToggle = this.handleShowVideoToggle.bind(this);
        this.handlePresetClick = this.handlePresetClick.bind(this);
        this.handleApplyChanges = this.handleApplyChanges.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
    }
    
    /**
     * Initialize the controller
     * @returns {boolean} Whether initialization was successful
     */
    init() {
        if (this.initialized) {
            console.log('Solar System controller already initialized');
            return true;
        }
        
        console.log('Initializing Solar System controller');
        
        try {
            // Find DOM elements
            this.findDOMElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Subscribe to store changes
            if (this.store) {
                this.unsubscribe = this.store.subscribe((state) => {
                    this.render(state.solarSystem);
                });
            }
            
            this.initialized = true;
            console.log('Solar System controller initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Solar System controller:', error);
            return false;
        }
    }
    
    /**
     * Find all required DOM elements
     */
    findDOMElements() {
        // Tab elements
        this.tabElements = document.querySelectorAll('.ss-tab');
        this.tabContentElements = document.querySelectorAll('.ss-tab-content');
        
        // Planet toggle elements
        this.planetToggleElements = {};
        this.planetScaleElements = {};
        
        // Get planet names from settings
        const planetNames = Object.keys(window.SolarSystemSettings.planetData);
        
        // Find toggle and scale elements for each planet
        planetNames.forEach(planet => {
            this.planetToggleElements[planet] = document.getElementById(`${planet}-toggle`);
            this.planetScaleElements[planet] = document.getElementById(`${planet}-scale`);
        });
        
        // Global settings elements
        this.showOrbitsToggle = document.getElementById('show-orbits-toggle');
        this.showLabelsToggle = document.getElementById('show-labels-toggle');
        this.rotationSpeedSlider = document.getElementById('rotation-speed-slider');
        this.showVideoToggle = document.getElementById('show-video');
        
        // Camera position sliders
        this.cameraXSlider = document.getElementById('camera-x-slider');
        this.cameraYSlider = document.getElementById('camera-y-slider');
        this.cameraZSlider = document.getElementById('camera-z-slider');
        
        // Preset buttons
        this.innerPlanetsPresetBtn = document.getElementById('inner-planets-preset');
        this.allPlanetsPresetBtn = document.getElementById('all-planets-preset');
        this.earthViewPresetBtn = document.getElementById('earth-view-preset');
        this.gasGiantsPresetBtn = document.getElementById('gas-giants-preset');
        
        // Apply changes button
        this.applyChangesBtn = document.getElementById('apply-changes-btn');
    }
    
    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Tab switching
        this.tabElements.forEach(tab => {
            tab.addEventListener('click', this.handleTabChange);
        });
        
        // Planet toggles and sliders
        Object.entries(this.planetToggleElements).forEach(([planet, element]) => {
            if (element) {
                element.addEventListener('change', e => this.handlePlanetToggle(planet, e.target.checked));
            }
        });
        
        Object.entries(this.planetScaleElements).forEach(([planet, element]) => {
            if (element) {
                element.addEventListener('input', e => this.handlePlanetScaleChange(planet, parseFloat(e.target.value)));
            }
        });
        
        // Global settings
        if (this.showOrbitsToggle) {
            this.showOrbitsToggle.addEventListener('change', e => this.handleOrbitToggle(e.target.checked));
        }
        
        if (this.showLabelsToggle) {
            this.showLabelsToggle.addEventListener('change', e => this.handleLabelToggle(e.target.checked));
        }
        
        if (this.rotationSpeedSlider) {
            this.rotationSpeedSlider.addEventListener('input', e => this.handleRotationSpeedChange(parseFloat(e.target.value)));
        }
        
        if (this.showVideoToggle) {
            this.showVideoToggle.addEventListener('change', e => this.handleShowVideoToggle(e.target.checked));
        }
        
        // Camera position
        if (this.cameraXSlider) {
            this.cameraXSlider.addEventListener('input', e => this.handleCameraPositionChange('x', parseInt(e.target.value)));
        }
        
        if (this.cameraYSlider) {
            this.cameraYSlider.addEventListener('input', e => this.handleCameraPositionChange('y', parseInt(e.target.value)));
        }
        
        if (this.cameraZSlider) {
            this.cameraZSlider.addEventListener('input', e => this.handleCameraPositionChange('z', parseInt(e.target.value)));
        }
        
        // Preset buttons
        if (this.innerPlanetsPresetBtn) {
            this.innerPlanetsPresetBtn.addEventListener('click', () => this.handlePresetClick('innerPlanets'));
        }
        
        if (this.allPlanetsPresetBtn) {
            this.allPlanetsPresetBtn.addEventListener('click', () => this.handlePresetClick('allPlanets'));
        }
        
        if (this.earthViewPresetBtn) {
            this.earthViewPresetBtn.addEventListener('click', () => this.handlePresetClick('earthView'));
        }
        
        if (this.gasGiantsPresetBtn) {
            this.gasGiantsPresetBtn.addEventListener('click', () => this.handlePresetClick('gasGiants'));
        }
        
        // Apply changes button
        if (this.applyChangesBtn) {
            this.applyChangesBtn.addEventListener('click', this.handleApplyChanges);
        }
    }
    
    /**
     * Handle tab change
     * @param {Event} event - Click event
     */
    handleTabChange(event) {
        const tabId = event.target.getAttribute('data-tab');
        
        // Update tab active states
        this.tabElements.forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update content visibility
        this.tabContentElements.forEach(content => {
            content.classList.remove('active');
            if (content.getAttribute('data-tab') === tabId) {
                content.classList.add('active');
            }
        });
    }
    
    /**
     * Handle planet visibility toggle
     * @param {string} planet - Planet name
     * @param {boolean} visible - Whether the planet should be visible
     */
    handlePlanetToggle(planet, visible) {
        if (this.store) {
            this.store.dispatch({
                type: 'SOLAR_SYSTEM_SET_PLANET_VISIBILITY',
                payload: { planet, visible }
            });
        }
    }
    
    /**
     * Handle planet scale change
     * @param {string} planet - Planet name
     * @param {number} scale - New scale value
     */
    handlePlanetScaleChange(planet, scale) {
        if (this.store) {
            this.store.dispatch({
                type: 'SOLAR_SYSTEM_SET_PLANET_SCALE',
                payload: { planet, scale }
            });
        }
    }
    
    /**
     * Handle orbit visibility toggle
     * @param {boolean} visible - Whether orbits should be visible
     */
    handleOrbitToggle(visible) {
        if (this.store) {
            this.store.dispatch({
                type: 'SOLAR_SYSTEM_SET_ORBITS_VISIBILITY',
                payload: { visible }
            });
        }
    }
    
    /**
     * Handle label visibility toggle
     * @param {boolean} visible - Whether labels should be visible
     */
    handleLabelToggle(visible) {
        if (this.store) {
            this.store.dispatch({
                type: 'SOLAR_SYSTEM_SET_LABELS_VISIBILITY',
                payload: { visible }
            });
        }
    }
    
    /**
     * Handle rotation speed change
     * @param {number} speed - New rotation speed
     */
    handleRotationSpeedChange(speed) {
        if (this.store) {
            this.store.dispatch({
                type: 'SOLAR_SYSTEM_SET_ROTATION_SPEED',
                payload: { speed }
            });
        }
    }
    
    /**
     * Handle camera position change
     * @param {string} axis - Axis to change (x, y, z)
     * @param {number} value - New position value
     */
    handleCameraPositionChange(axis, value) {
        if (this.store) {
            this.store.dispatch({
                type: 'SOLAR_SYSTEM_SET_CAMERA_POSITION',
                payload: { axis, value }
            });
        }
    }
    
    /**
     * Handle show video toggle
     * @param {boolean} visible - Whether video should be visible
     */
    handleShowVideoToggle(visible) {
        if (this.store) {
            this.store.dispatch({
                type: 'SOLAR_SYSTEM_SET_VIDEO_VISIBILITY',
                payload: { visible }
            });
        }
    }
    
    /**
     * Handle preset button click
     * @param {string} presetName - Name of the preset to apply
     */
    handlePresetClick(presetName) {
        if (this.solarSystemService) {
            this.solarSystemService.applyPreset(presetName)
                .then(() => {
                    // Show success indicator on the button
                    const button = document.getElementById(`${presetName}-preset`);
                    if (button) {
                        button.classList.add('success');
                        setTimeout(() => {
                            button.classList.remove('success');
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error(`Error applying preset ${presetName}:`, error);
                });
        }
    }
    
    /**
     * Handle apply changes button click
     */
    handleApplyChanges() {
        if (this.store) {
            const state = this.store.getState();
            if (this.solarSystemService) {
                this.solarSystemService.updateSolarSystemState(state)
                    .then(() => {
                        // Show success indicator
                        if (this.applyChangesBtn) {
                            this.applyChangesBtn.classList.add('success');
                            setTimeout(() => {
                                this.applyChangesBtn.classList.remove('success');
                            }, 1000);
                        }
                    })
                    .catch(error => {
                        console.error('Error applying changes:', error);
                    });
            }
        }
    }
    
    /**
     * Render UI based on state changes
     * @param {Object} state - Current state
     */
    render(state) {
        if (!state) return;
        
        // Update planet toggles and sliders
        Object.entries(state.planets || {}).forEach(([planet, settings]) => {
            const toggleElement = this.planetToggleElements[planet];
            const scaleElement = this.planetScaleElements[planet];
            
            if (toggleElement) {
                toggleElement.checked = settings.visible;
            }
            
            if (scaleElement) {
                // Apply scaling factor based on planet type
                let displayScale = settings.scale;
                if (planet === 'jupiter') displayScale = settings.scale / 11.2;
                else if (planet === 'saturn') displayScale = settings.scale / 9.5;
                else if (planet === 'uranus') displayScale = settings.scale / 4.0;
                else if (planet === 'neptune') displayScale = settings.scale / 3.9;
                
                scaleElement.value = displayScale;
                
                // Update value display if present
                const valueDisplay = document.getElementById(`${planet}-scale-value`);
                if (valueDisplay) {
                    valueDisplay.textContent = displayScale.toFixed(1);
                }
            }
        });
        
        // Update global settings
        if (this.showOrbitsToggle) {
            this.showOrbitsToggle.checked = state.showOrbits;
        }
        
        if (this.showLabelsToggle) {
            this.showLabelsToggle.checked = state.showLabels;
        }
        
        if (this.rotationSpeedSlider) {
            this.rotationSpeedSlider.value = state.rotationSpeed;
            
            // Update value display if present
            const valueDisplay = document.getElementById('rotation-speed-value');
            if (valueDisplay) {
                valueDisplay.textContent = state.rotationSpeed.toFixed(1);
            }
        }
        
        if (this.showVideoToggle) {
            this.showVideoToggle.checked = state.showVideo;
        }
        
        // Update camera position sliders
        if (state.cameraPosition) {
            if (this.cameraXSlider) {
                this.cameraXSlider.value = state.cameraPosition.x;
            }
            
            if (this.cameraYSlider) {
                this.cameraYSlider.value = state.cameraPosition.y;
            }
            
            if (this.cameraZSlider) {
                this.cameraZSlider.value = state.cameraPosition.z;
            }
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        console.log('Destroying Solar System controller');
        
        // Remove event listeners
        this.tabElements.forEach(tab => {
            tab.removeEventListener('click', this.handleTabChange);
        });
        
        Object.entries(this.planetToggleElements).forEach(([planet, element]) => {
            if (element) {
                element.removeEventListener('change', e => this.handlePlanetToggle(planet, e.target.checked));
            }
        });
        
        Object.entries(this.planetScaleElements).forEach(([planet, element]) => {
            if (element) {
                element.removeEventListener('input', e => this.handlePlanetScaleChange(planet, parseFloat(e.target.value)));
            }
        });
        
        if (this.showOrbitsToggle) {
            this.showOrbitsToggle.removeEventListener('change', e => this.handleOrbitToggle(e.target.checked));
        }
        
        if (this.showLabelsToggle) {
            this.showLabelsToggle.removeEventListener('change', e => this.handleLabelToggle(e.target.checked));
        }
        
        if (this.rotationSpeedSlider) {
            this.rotationSpeedSlider.removeEventListener('input', e => this.handleRotationSpeedChange(parseFloat(e.target.value)));
        }
        
        if (this.showVideoToggle) {
            this.showVideoToggle.removeEventListener('change', e => this.handleShowVideoToggle(e.target.checked));
        }
        
        if (this.cameraXSlider) {
            this.cameraXSlider.removeEventListener('input', e => this.handleCameraPositionChange('x', parseInt(e.target.value)));
        }
        
        if (this.cameraYSlider) {
            this.cameraYSlider.removeEventListener('input', e => this.handleCameraPositionChange('y', parseInt(e.target.value)));
        }
        
        if (this.cameraZSlider) {
            this.cameraZSlider.removeEventListener('input', e => this.handleCameraPositionChange('z', parseInt(e.target.value)));
        }
        
        if (this.innerPlanetsPresetBtn) {
            this.innerPlanetsPresetBtn.removeEventListener('click', () => this.handlePresetClick('innerPlanets'));
        }
        
        if (this.allPlanetsPresetBtn) {
            this.allPlanetsPresetBtn.removeEventListener('click', () => this.handlePresetClick('allPlanets'));
        }
        
        if (this.earthViewPresetBtn) {
            this.earthViewPresetBtn.removeEventListener('click', () => this.handlePresetClick('earthView'));
        }
        
        if (this.gasGiantsPresetBtn) {
            this.gasGiantsPresetBtn.removeEventListener('click', () => this.handlePresetClick('gasGiants'));
        }
        
        if (this.applyChangesBtn) {
            this.applyChangesBtn.removeEventListener('click', this.handleApplyChanges);
        }
        
        // Unsubscribe from store
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        // Reset properties
        this.tabElements = null;
        this.tabContentElements = null;
        this.planetToggleElements = {};
        this.planetScaleElements = {};
        this.showOrbitsToggle = null;
        this.showLabelsToggle = null;
        this.rotationSpeedSlider = null;
        this.showVideoToggle = null;
        this.cameraXSlider = null;
        this.cameraYSlider = null;
        this.cameraZSlider = null;
        this.innerPlanetsPresetBtn = null;
        this.allPlanetsPresetBtn = null;
        this.earthViewPresetBtn = null;
        this.gasGiantsPresetBtn = null;
        this.applyChangesBtn = null;
        
        this.initialized = false;
        
        console.log('Solar System controller destroyed');
    }
}

// Export the controller
window.SolarSystemController = SolarSystemController;
```

<a id="3-view-implementation"></a>
## 3. View Implementation

```javascript
/**
 * Solar System View Component
 * Handles the DOM structure for the solar system visualization
 */

class SolarSystemView {
    /**
     * Create a Solar System view
     * @param {Object} dependencies - Dependencies for this view
     */
    constructor(dependencies) {
        // Store dependencies
        this.solarSystemService = dependencies.solarSystemService;
        this.solarSystemController = dependencies.solarSystemController;
        this.initialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.createElements = this.createElements.bind(this);
        this.createPlanetControls = this.createPlanetControls.bind(this);
        this.createGlobalSettings = this.createGlobalSettings.bind(this);
        this.showView = this.showView.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    
    /**
     * Initialize the view
     * @returns {boolean} Whether initialization was successful
     */
    init() {
        if (this.initialized) {
            console.log('Solar System view already initialized');
            return true;
        }
        
        console.log('Initializing Solar System view');
        
        try {
            // Create DOM elements
            this.createElements();
            
            this.initialized = true;
            console.log('Solar System view initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Solar System view:', error);
            return false;
        }
    }
    
    /**
     * Create DOM elements for the view
     */
    createElements() {
        // Find container elements
        this.previewContainer = document.getElementById('solar-system-container');
        
        // Inner planets tab content
        this.innerPlanetsContainer = document.querySelector('.ss-tab-content[data-tab="inner-planets"]');
        if (this.innerPlanetsContainer) {
            this.innerPlanetsContainer.innerHTML = ''; // Clear loading state
            this.createPlanetControls(this.innerPlanetsContainer, ['mercury', 'venus', 'earth', 'mars']);
        }
        
        // Outer planets tab content
        this.outerPlanetsContainer = document.querySelector('.ss-tab-content[data-tab="outer-planets"]');
        if (this.outerPlanetsContainer) {
            this.outerPlanetsContainer.innerHTML = ''; // Clear loading state
            this.createPlanetControls(this.outerPlanetsContainer, ['jupiter', 'saturn', 'uranus', 'neptune']);
        }
        
        // Global settings tab content
        this.globalSettingsContainer = document.querySelector('.ss-tab-content[data-tab="global-settings"]');
        if (this.globalSettingsContainer) {
            this.globalSettingsContainer.innerHTML = ''; // Clear loading state
            this.createGlobalSettings(this.globalSettingsContainer);
        }
        
        // Initialize the 3D scene if preview container exists
        if (this.previewContainer && this.solarSystemService) {
            this.solarSystemService.initializeScene(this.previewContainer);
        }
    }
    
    /**
     * Create planet control elements
     * @param {HTMLElement} container - Container element
     * @param {Array<string>} planets - List of planet names to create controls for
     */
    createPlanetControls(container, planets) {
        const grid = document.createElement('div');
        grid.className = 'planet-grid';
        
        planets.forEach(planet => {
            // Get planet data
            const planetData = window.SolarSystemSettings.planetData[planet];
            if (!planetData) return;
            
            // Create planet card
            const planetCard = document.createElement('div');
            planetCard.className = 'planet-card';
            
            // Planet name header
            const planetHeader = document.createElement('h4');
            planetHeader.innerHTML = `${planetData.name} ${planetData.symbol}`;
            planetCard.appendChild(planetHeader);
            
            // Planet visibility toggle
            const toggleRow = document.createElement('div');
            toggleRow.className = 'setting-row';
            
            const toggleLabel = document.createElement('div');
            toggleLabel.className = 'setting-label';
            toggleLabel.textContent = 'Visible';
            
            const toggleControl = document.createElement('div');
            toggleControl.className = 'setting-control';
            
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.className = 'ss-checkbox';
            toggle.id = `${planet}-toggle`;
            toggle.checked = true;
            
            toggleControl.appendChild(toggle);
            toggleRow.appendChild(toggleLabel);
            toggleRow.appendChild(toggleControl);
            planetCard.appendChild(toggleRow);
            
            // Planet scale slider
            const scaleRow = document.createElement('div');
            scaleRow.className = 'setting-row';
            
            const scaleLabel = document.createElement('div');
            scaleLabel.className = 'setting-label';
            scaleLabel.textContent = 'Size Scale';
            
            const scaleControl = document.createElement('div');
            scaleControl.className = 'setting-control';
            
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'ss-slider-container';
            
            const scaleSlider = document.createElement('input');
            scaleSlider.type = 'range';
            scaleSlider.className = 'ss-slider';
            scaleSlider.id = `${planet}-scale`;
            scaleSlider.min = '0.1';
            scaleSlider.max = '2.0';
            scaleSlider.step = '0.1';
            scaleSlider.value = '1.0';
            
            const scaleValue = document.createElement('div');
            scaleValue.className = 'ss-slider-value';
            scaleValue.id = `${planet}-scale-value`;
            scaleValue.textContent = '1.0';
            
            sliderContainer.appendChild(scaleSlider);
            sliderContainer.appendChild(scaleValue);
            scaleControl.appendChild(sliderContainer);
            scaleRow.appendChild(scaleLabel);
            scaleRow.appendChild(scaleControl);
            planetCard.appendChild(scaleRow);
            
            // Add the planet card to the grid
            grid.appendChild(planetCard);
        });
        
        container.appendChild(grid);
    }
    
    /**
     * Create global settings controls
     * @param {HTMLElement} container - Container element
     */
    createGlobalSettings(container) {
        // Create settings section
        const visualSection = document.createElement('div');
        visualSection.className = 'ss-section';
        
        const visualHeader = document.createElement('h3');
        visualHeader.textContent = 'Visualization Settings';
        visualSection.appendChild(visualHeader);
        
        // Orbit visibility toggle
        const orbitRow = document.createElement('div');
        orbitRow.className = 'setting-row';
        
        const orbitLabel = document.createElement('div');
        orbitLabel.className = 'setting-label';
        orbitLabel.textContent = 'Show Orbit Paths';
        
        const orbitControl = document.createElement('div');
        orbitControl.className = 'setting-control';
        
        const orbitToggle = document.createElement('input');
        orbitToggle.type = 'checkbox';
        orbitToggle.className = 'ss-checkbox';
        orbitToggle.id = 'show-orbits-toggle';
        orbitToggle.checked = true;
        
        orbitControl.appendChild(orbitToggle);
        orbitRow.appendChild(orbitLabel);
        orbitRow.appendChild(orbitControl);
        visualSection.appendChild(orbitRow);
        
        // Label visibility toggle
        const labelRow = document.createElement('div');
        labelRow.className = 'setting-row';
        
        const labelLabel = document.createElement('div');
        labelLabel.className = 'setting-label';
        labelLabel.textContent = 'Show Planet Labels';
        
        const labelControl = document.createElement('div');
        labelControl.className = 'setting-control';
        
        const labelToggle = document.createElement('input');
        labelToggle.type = 'checkbox';
        labelToggle.className = 'ss-checkbox';
        labelToggle.id = 'show-labels-toggle';
        labelToggle.checked = true;
        
        labelControl.appendChild(labelToggle);
        labelRow.appendChild(labelLabel);
        labelRow.appendChild(labelControl);
        visualSection.appendChild(labelRow);
        
        // Rotation speed slider
        const speedRow = document.createElement('div');
        speedRow.className = 'setting-row';
        
        const speedLabel = document.createElement('div');
        speedLabel.className = 'setting-label';
        speedLabel.textContent = 'Rotation Speed';
        
        const speedControl = document.createElement('div');
        speedControl.className = 'setting-control';
        
        const speedSliderContainer = document.createElement('div');
        speedSliderContainer.className = 'ss-slider-container';
        
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.className = 'ss-slider';
        speedSlider.id = 'rotation-speed-slider';
        speedSlider.min = '0.1';
        speedSlider.max = '5.0';
        speedSlider.step = '0.1';
        speedSlider.value = '1.0';
        
        const speedValue = document.createElement('div');
        speedValue.className = 'ss-slider-value';
        speedValue.id = 'rotation-speed-value';
        speedValue.textContent = '1.0';
        
        speedSliderContainer.appendChild(speedSlider);
        speedSliderContainer.appendChild(speedValue);
        speedControl.appendChild(speedSliderContainer);
        speedRow.appendChild(speedLabel);
        speedRow.appendChild(speedControl);
        visualSection.appendChild(speedRow);
        
        container.appendChild(visualSection);
        
        // Camera position section
        const cameraSection = document.createElement('div');
        cameraSection.className = 'ss-section';
        
        const cameraHeader = document.createElement('h3');
        cameraHeader.textContent = 'Camera Position';
        cameraSection.appendChild(cameraHeader);
        
        // Create grid for camera controls
        const cameraGrid = document.createElement('div');
        cameraGrid.className = 'camera-controls';
        
        // X position
        const xControl = document.createElement('div');
        
        const xLabel = document.createElement('div');
        xLabel.className = 'setting-label';
        xLabel.textContent = 'X Position';
        
        const xSliderContainer = document.createElement('div');
        xSliderContainer.className = 'ss-slider-container';
        
        const xSlider = document.createElement('input');
        xSlider.type = 'range';
        xSlider.className = 'ss-slider';
        xSlider.id = 'camera-x-slider';
        xSlider.min = '-100';
        xSlider.max = '100';
        xSlider.step = '5';
        xSlider.value = '0';
        
        xSliderContainer.appendChild(xSlider);
        xControl.appendChild(xLabel);
        xControl.appendChild(xSliderContainer);
        
        // Y position
        const yControl = document.createElement('div');
        
        const yLabel = document.createElement('div');
        yLabel.className = 'setting-label';
        yLabel.textContent = 'Y Position';
        
        const ySliderContainer = document.createElement('div');
        ySliderContainer.className = 'ss-slider-container';
        
        const ySlider = document.createElement('input');
        ySlider.type = 'range';
        ySlider.className = 'ss-slider';
        ySlider.id = 'camera-y-slider';
        ySlider.min = '-100';
        ySlider.max = '100';
        ySlider.step = '5';
        ySlider.value = '20';
        
        ySliderContainer.appendChild(ySlider);
        yControl.appendChild(yLabel);
        yControl.appendChild(ySliderContainer);
        
        // Z position
        const zControl = document.createElement('div');
        
        const zLabel = document.createElement('div');
        zLabel.className = 'setting-label';
        zLabel.textContent = 'Distance (Z)';
        
        const zSliderContainer = document.createElement('div');
        zSliderContainer.className = 'ss-slider-container';
        
        const zSlider = document.createElement('input');
        zSlider.type = 'range';
        zSlider.className = 'ss-slider';
        zSlider.id = 'camera-z-slider';
        zSlider.min = '10';
        zSlider.max = '150';
        zSlider.step = '5';
        zSlider.value = '50';
        
        zSliderContainer.appendChild(zSlider);
        zControl.appendChild(zLabel);
        zControl.appendChild(zSliderContainer);
        
        // Reset camera button
        const resetControl = document.createElement('div');
        resetControl.style.marginTop = '15px';
        resetControl.style.gridColumn = 'span 3';
        
        const resetButton = document.createElement('button');
        resetButton.className = 'ss-button';
        resetButton.id = 'reset-camera-btn';
        resetButton.textContent = 'Reset Camera';
        resetButton.addEventListener('click', () => {
            if (this.solarSystemController) {
                // Update all camera positions to default
                this.solarSystemController.handleCameraPositionChange('x', 0);
                this.solarSystemController.handleCameraPositionChange('y', 20);
                this.solarSystemController.handleCameraPositionChange('z', 50);
            }
        });
        
        resetControl.appendChild(resetButton);
        
        // Add all controls to the grid
        cameraGrid.appendChild(xControl);
        cameraGrid.appendChild(yControl);
        cameraGrid.appendChild(zControl);
        cameraGrid.appendChild(resetControl);
        
        cameraSection.appendChild(cameraGrid);
        container.appendChild(cameraSection);
    }
    
    /**
     * Show or hide the view
     * @param {boolean} visible - Whether the view should be visible
     */
    showView(visible) {
        if (this.previewContainer) {
            this.previewContainer.style.display = visible ? 'block' : 'none';
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        console.log('Destroying Solar System view');
        
        // Clear container elements
        if (this.innerPlanetsContainer) {
            this.innerPlanetsContainer.innerHTML = '';
        }
        
        if (this.outerPlanetsContainer) {
            this.outerPlanetsContainer.innerHTML = '';
        }
        
        if (this.globalSettingsContainer) {
            this.globalSettingsContainer.innerHTML = '';
        }
        
        // Remove the reset camera button event listener
        const resetButton = document.getElementById('reset-camera-btn');
        if (resetButton) {
            resetButton.removeEventListener('click', () => {});
        }
        
        // Clean up references
        this.previewContainer = null;
        this.innerPlanetsContainer = null;
        this.outerPlanetsContainer = null;
        this.globalSettingsContainer = null;
        
        this.initialized = false;
        
        console.log('Solar System view destroyed');
    }
}

// Export the view
window.SolarSystemView = SolarSystemView;
```

<a id="4-utils-implementation"></a>
## 4. Utils Implementation

Let's complete the `solarsystem-service.js` file since it was incomplete in the previous materials:

```javascript
/**
 * Solar System Service
 * Handles the business logic and 3D rendering for the solar system
 */

class SolarSystemService {
    /**
     * Create a Solar System service
     * @param {Object} dependencies - Dependencies for this service
     */
    constructor(dependencies) {
        // Store dependencies
        this.store = dependencies.store;
        this.initialized = false;
        
        // Scene components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Animation and timing
        this.animationId = null;
        this.clock = null;
        
        // Planet objects
        this.planets = {};
        this.orbits = {};
        this.labels = {};
        this.sun = null;
        this.starfield = null;
        
        // State
        this.currentState = null;
        this.container = null;
        
        // Socket for real-time updates
        this.socket = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setupSocketConnection = this.setupSocketConnection.bind(this);
        this.initializeScene = this.initializeScene.bind(this);
        this.setupCamera = this.setupCamera.bind(this);
        this.setupControls = this.setupControls.bind(this);
        this.createPlanets = this.createPlanets.bind(this);
        this.animate = this.animate.bind(this);
        this.updateScene = this.updateScene.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.fetchSolarSystemState = this.fetchSolarSystemState.bind(this);
        this.updateSolarSystemState = this.updateSolarSystemState.bind(this);
        this.applyPreset = this.applyPreset.bind(this);
        this.resetToDefaultState = this.resetToDefaultState.bind(this);
        this.destroy = this.destroy.bind(this);
        this.disposeScene = this.disposeScene.bind(this);
        this.disposeMaterial = this.disposeMaterial.bind(this);
    }
    
    /**
     * Initialize the service
     * @returns {boolean} Whether initialization was successful
     */
    init() {
        if (this.initialized) {
            console.log('Solar System service already initialized');
            return true;
        }
        
        console.log('Initializing Solar System service');
        
        try {
            // Initialize timekeeping
            this.clock = new THREE.Clock();
            
            // Initialize state from settings
            this.currentState = window.SolarSystemSettings.getDefaultState();
            
            // Set up socket.io connection
            this.setupSocketConnection();
            
            this.initialized = true;
            console.log('Solar System service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Solar System service:', error);
            return false;
        }
    }
    
    /**
     * Set up WebSocket connection for real-time updates
     */
    setupSocketConnection() {
        // Create Socket.IO connection
        this.socket = io('http://localhost:3000');
        
        // Set up event handlers
        this.socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
            
            // Update connection status indicator
            const statusIndicator = document.getElementById('connection-status');
            if (statusIndicator) {
                statusIndicator.classList.add('connected');
            }
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
            
            // Update connection status indicator
            const statusIndicator = document.getElementById('connection-status');
            if (statusIndicator) {
                statusIndicator.classList.remove('connected');
            }
        });
        
        // Listen for solar system updates
        this.socket.on('solar-system-update', (newState) => {
            console.log('Received solar system update:', newState);
            this.currentState = newState;
            this.updateScene(newState.solarSystem);
        });
    }
    
    /**
     * Initialize the 3D scene
     * @param {HTMLElement} container - Container element for the renderer
     */
    initializeScene(container) {
        if (!container) {
            console.error('Container element is required');
            return;
        }
        
        console.log('Initializing 3D scene');
        this.container = container;
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true // For transparency
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        
        // Set up camera
        this.setupCamera();
        
        // Set up controls
        this.setupControls();
        
        // Set up lighting
        window.SolarObjectsUtil.setupLighting(this.scene);
        
        // Create starfield background
        this.starfield = window.SolarObjectsUtil.createStarfield();
        this.scene.add(this.starfield);
        
        // Create sun
        this.sun = window.SolarObjectsUtil.createSun(2);
        this.scene.add(this.sun);
        
        // Create planets, orbits, and labels
        this.createPlanets();
        
        // Start animation loop
        this.animate();
        
        // Add window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Fetch initial state
        this.fetchSolarSystemState();
    }
    
    /**
     * Set up the camera
     */
    setupCamera() {
        const { clientWidth: width, clientHeight: height } = this.container;
        const aspectRatio = width / height;
        
        this.camera = new THREE.PerspectiveCamera(
            45, // Field of view
            aspectRatio,
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        // Set initial camera position from state
        const cameraPos = this.currentState.solarSystem.cameraPosition;
        this.camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Set up orbit controls
     */
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI;
        
        // Add event listener for control changes
        this.controls.addEventListener('change', () => {
            // Update camera position in state
            this.currentState.solarSystem.cameraPosition = {
                x: Math.round(this.camera.position.x),
                y: Math.round(this.camera.position.y),
                z: Math.round(this.camera.position.z)
            };
            
            // Dispatch to store if available
            if (this.store) {
                this.store.dispatch({
                    type: 'SOLAR_SYSTEM_SET_CAMERA_POSITION_ALL',
                    payload: {
                        position: this.currentState.solarSystem.cameraPosition
                    }
                });
            }
        });
    }
    
    /**
     * Create all planets with orbits and labels
     */
    createPlanets() {
        // Get the planet names
        const planetNames = Object.keys(window.SolarSystemSettings.planetData);
        
        // Create each planet
        planetNames.forEach(name => {
            const planetData = window.SolarSystemSettings.planetData[name];
            const planetState = this.currentState.solarSystem.planets[name];
            
            if (!planetData || !planetState) return;
            
            // Create planet mesh
            const radius = name === 'saturn' ? planetState.scale * 0.5 : planetState.scale * 0.5;
            const planet = window.SolarObjectsUtil.createPlanet(
                name,
                radius,
                planetData.color
            );
            
            // Set planet position
            planet.position.set(
                planetData.orbitalRadius, 
                0, 
                0
            );
            
            // Create orbit
            const orbit = window.SolarObjectsUtil.createOrbit(planetData.orbitalRadius);
            orbit.visible = this.currentState.solarSystem.showOrbits;
            
            // Create label
            const label = window.SolarObjectsUtil.createLabel(
                planetData.name,
                planetData.symbol
            );
            label.position.set(
                planetData.orbitalRadius,
                radius * 2,
                0
            );
            label.visible = this.currentState.solarSystem.showLabels;
            
            // Special case for Saturn - add rings
            if (name === 'saturn') {
                const rings = window.SolarObjectsUtil.createSaturnRings(radius);
                planet.add(rings);
            }
            
            // Add label to planet
            planet.add(label);
            
            // Add to scene
            this.scene.add(planet);
            this.scene.add(orbit);
            
            // Store references
            this.planets[name] = planet;
            this.orbits[name] = orbit;
            this.labels[name] = label;
            
            // Set visibility from state
            planet.visible = planetState.visible;
        });
    }
    
    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Update orbital positions
        const rotationSpeed = this.currentState.solarSystem.rotationSpeed;
        
        Object.keys(this.planets).forEach(name => {
            const planet = this.planets[name];
            const planetData = window.SolarSystemSettings.planetData[name];
            
            if (planet && planetData) {
                // Update planet position based on orbital parameters and animation speed
                window.SolarObjectsUtil.updatePlanetPosition(
                    planet,
                    planetData.orbitalRadius,
                    planetData.orbitalPeriod,
                    elapsedTime * rotationSpeed
                );
                
                // Also rotate planet on its axis
                planet.rotation.y += delta * rotationSpeed * (1 / planetData.orbitalPeriod) * 10;
            }
        });
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * Update the scene based on new state
     * @param {Object} solarSystem - New solar system state
     */
    updateScene(solarSystem) {
        if (!solarSystem || !this.scene) return;
        
        // Update planet visibility and scale
        Object.keys(solarSystem.planets).forEach(name => {
            const planetState = solarSystem.planets[name];
            const planet = this.planets[name];
            
            if (planet && planetState) {
                // Update visibility
                planet.visible = planetState.visible;
                
                // Update scale (recreate geometry with new radius)
                const radius = name === 'saturn' ? planetState.scale * 0.5 : planetState.scale * 0.5;
                const planetData = window.SolarSystemSettings.planetData[name];
                
                // Replace geometry with new size
                const newGeometry = new THREE.SphereGeometry(radius, 32, 32);
                planet.geometry.dispose();
                planet.geometry = newGeometry;
                
                // Update label position
                const label = planet.children.find(child => child.name === `${name}-label`);
                if (label) {
                    label.position.y = radius * 2;
                }
                
                // Update rings for Saturn
                if (name === 'saturn') {
                    const rings = planet.children.find(child => child.name === 'saturn-rings');
                    if (rings) {
                        // Remove old rings
                        planet.remove(rings);
                        rings.geometry.dispose();
                        rings.material.dispose();
                        
                        // Create new rings
                        const newRings = window.SolarObjectsUtil.createSaturnRings(radius);
                        planet.add(newRings);
                    }
                }
            }
        });
        
        // Update orbit visibility
        Object.values(this.orbits).forEach(orbit => {
            orbit.visible = solarSystem.showOrbits;
        });
        
        // Update label visibility
        Object.values(this.planets).forEach(planet => {
            const label = planet.children.find(child => child.name.endsWith('-label'));
            if (label) {
                label.visible = solarSystem.showLabels;
            }
        });
        
        // Update rotation speed (handled in animate)
        
        // Update camera position if it's changed significantly
        const newCamPos = solarSystem.cameraPosition;
        const currentCamPos = this.camera.position;
        
        const positionDiff = Math.sqrt(
            Math.pow(newCamPos.x - currentCamPos.x, 2) +
            Math.pow(newCamPos.y - currentCamPos.y, 2) +
            Math.pow(newCamPos.z - currentCamPos.z, 2)
        );
        
        if (positionDiff > 1) {
            this.camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z);
            this.camera.lookAt(0, 0, 0);
            this.controls.update();
        }
        
        // Update video visibility if present
        const videoElement = document.getElementById('video');
        if (videoElement && solarSystem.showVideo !== undefined) {
            videoElement.style.opacity = solarSystem.showVideo ? '1' : '0';
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Update camera aspect ratio
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(width, height);
    }
    
    /**
     * Fetch solar system state from server
     */
    fetchSolarSystemState() {
        console.log('Fetching solar system state from server');
        
        fetch('/api/solarsystem/state')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched solar system state:', data);
                this.currentState = data;
                this.updateScene(data.solarSystem);
                
                // Update store if available
                if (this.store) {
                    this.store.dispatch({
                        type: 'SOLAR_SYSTEM_SET_STATE',
                        payload: data
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching solar system state:', error);
            });
    }
    
    /**
     * Update solar system state
     * @param {Object} newState - New state to apply
     * @returns {Promise<Object>} Updated state
     */
    updateSolarSystemState(newState) {
        return new Promise((resolve, reject) => {
            console.log('Updating solar system state:', newState);
            
            fetch('/api/solarsystem/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newState)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('State updated:', data);
                    this.currentState = data;
                    this.updateScene(data.solarSystem);
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error updating state:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * Apply a preset
     * @param {string} presetName - Name of preset to apply
     * @returns {Promise<Object>} Updated state with preset applied
     */
    applyPreset(presetName) {
        return new Promise((resolve, reject) => {
            console.log(`Applying preset: ${presetName}`);
            
            fetch(`/api/solarsystem/preset/${presetName}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Preset applied:', data);
                    this.currentState = data;
                    this.updateScene(data.solarSystem);
                    
                    // Update store if available
                    if (this.store) {
                        this.store.dispatch({
                            type: 'SOLAR_SYSTEM_SET_STATE',
                            payload: data
                        });
                    }
                    
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error applying preset:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * Reset to default state
     * @returns {Promise<Object>} Default state
     */
    resetToDefaultState() {
        return new Promise((resolve, reject) => {
            console.log('Resetting to default state');
            
            fetch('/api/solarsystem/reset', {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Reset to default state:', data);
                    this.currentState = data;
                    this.updateScene(data.solarSystem);
                    
                    // Update store if available
                    if (this.store) {
                        this.store.dispatch({
                            type: 'SOLAR_SYSTEM_SET_STATE',
                            payload: data
                        });
                    }
                    
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error resetting state:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        console.log('Destroying Solar System service');
        
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        // Dispose of Three.js resources
        if (this.scene) {
            this.disposeScene(this.scene);
        }
        
        // Disconnect socket
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        // Remove renderer from DOM
        if (this.renderer && this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        
        // Clean up controls
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        
        // Clean up renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        // Reset properties
        this.scene = null;
        this.camera = null;
        this.planets = {};
        this.orbits = {};
        this.labels = {};
        this.sun = null;
        this.starfield = null;
        this.container = null;
        this.initialized = false;
        
        console.log('Solar System service destroyed');
    }
    
    /**
     * Dispose of all objects in a scene
     * @param {THREE.Scene} scene - Scene to clean up
     */
    disposeScene(scene) {
        scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => this.disposeMaterial(material));
                } else {
                    this.disposeMaterial(object.material);
                }
            }
        });
    }
    
    /**
     * Dispose of a material and its textures
     * @param {THREE.Material} material - Material to dispose
     */
    disposeMaterial(material) {
        // Dispose textures
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();
        
        // Dispose material
        material.dispose();
    }
}

// Export the service
window.SolarSystemService = SolarSystemService;
```

<a id="5-registry-integration"></a>
## 5. Registry Integration

Now let's implement the integration with the Visual Effects Registry:

```javascript
/**
 * Registry integration for Solar System visualization
 * This file needs to be merged with the main visual-registry.js file
 */

// Add this to the main visual-registry.js thumbnails section
const registryThumbnails = {
    'solar-system': '../../assets/visualeffects/thumbnails/solar-system.jpg',
    // other effects...
};

// Add this to the defaultSettings section
const registryDefaultSettings = {
    'solar-system': {
        planets: {
            mercury: { visible: true, scale: 0.4 },
            venus: { visible: true, scale: 0.9 },
            earth: { visible: true, scale: 1.0 },
            mars: { visible: true, scale: 0.5 },
            jupiter: { visible: true, scale: 11.2 },
            saturn: { visible: true, scale: 9.5 },
            uranus: { visible: true, scale: 4.0 },
            neptune: { visible: true, scale: 3.9 },
        },
        showOrbits: true,
        rotationSpeed: 1.0,
        showLabels: true,
        showVideo: false,
        cameraPosition: { x: 0, y: 20, z: 50 }
    },
    // other effects...
};

// Add this to the createSettingsUI method
function createSolarSystemSettings(container, settings, changeCallback) {
    // Create container
    const settingsUI = document.createElement('div');
    settingsUI.className = 'visual-effect-settings';
    
    // Create tabs for different planet groups
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'settings-tabs';
    
    const innerPlanetsTab = document.createElement('div');
    innerPlanetsTab.className = 'settings-tab active';
    innerPlanetsTab.innerText = 'Inner Planets';
    innerPlanetsTab.dataset.tab = 'inner-planets';
    
    const outerPlanetsTab = document.createElement('div');
    outerPlanetsTab.className = 'settings-tab';
    outerPlanetsTab.innerText = 'Outer Planets';
    outerPlanetsTab.dataset.tab = 'outer-planets';
    
    const globalSettingsTab = document.createElement('div');
    globalSettingsTab.className = 'settings-tab';
    globalSettingsTab.innerText = 'Global Settings';
    globalSettingsTab.dataset.tab = 'global-settings';
    
    tabsContainer.appendChild(innerPlanetsTab);
    tabsContainer.appendChild(outerPlanetsTab);
    tabsContainer.appendChild(globalSettingsTab);
    
    // Create tab content containers
    const tabsContent = document.createElement('div');
    tabsContent.className = 'settings-tabs-content';
    
    const innerPlanetsContent = document.createElement('div');
    innerPlanetsContent.className = 'settings-tab-content active';
    innerPlanetsContent.dataset.tab = 'inner-planets';
    
    const outerPlanetsContent = document.createElement('div');
    outerPlanetsContent.className = 'settings-tab-content';
    outerPlanetsContent.dataset.tab = 'outer-planets';
    
    const globalSettingsContent = document.createElement('div');
    globalSettingsContent.className = 'settings-tab-content';
    globalSettingsContent.dataset.tab = 'global-settings';
    
    // Add inner planets settings
    this.createPlanetSettings(innerPlanetsContent, settings, changeCallback, [
        'mercury', 'venus', 'earth', 'mars'
    ]);
    
    // Add outer planets settings
    this.createPlanetSettings(outerPlanetsContent, settings, changeCallback, [
        'jupiter', 'saturn', 'uranus', 'neptune'
    ]);
    
    // Add global settings
    this.createGlobalSettings(globalSettingsContent, settings, changeCallback);
    
    // Add tab content to container
    tabsContent.appendChild(innerPlanetsContent);
    tabsContent.appendChild(outerPlanetsContent);
    tabsContent.appendChild(globalSettingsContent);
    
    // Add tab switching functionality
    tabsContainer.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabsContainer.querySelectorAll('.settings-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Update active content
            tabsContent.querySelectorAll('.settings-tab-content').forEach(c => {
                c.classList.remove('active');
            });
            const activeContent = tabsContent.querySelector(`.settings-tab-content[data-tab="${tab.dataset.tab}"]`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
    
    // Add tabs and content to main container
    settingsUI.appendChild(tabsContainer);
    settingsUI.appendChild(tabsContent);
    
    // Add to the provided container
    container.appendChild(settingsUI);
},

// Helper method to create planet settings
createPlanetSettings: function(container, settings, changeCallback, planetList) {
    planetList.forEach(planetName => {
        const planetData = settings.planets[planetName];
        if (!planetData) return;
        
        const planetCard = document.createElement('div');
        planetCard.className = 'planet-settings-card';
        
        // Planet name header
        const planetHeader = document.createElement('h4');
        planetHeader.innerText = planetName.charAt(0).toUpperCase() + planetName.slice(1);
        planetCard.appendChild(planetHeader);
        
        // Visibility toggle
        const visibilityLabel = document.createElement('label');
        visibilityLabel.className = 'settings-control-row';
        
        const visibilityText = document.createElement('span');
        visibilityText.innerText = 'Visible';
        
        const visibilityToggle = document.createElement('input');
        visibilityToggle.type = 'checkbox';
        visibilityToggle.checked = planetData.visible;
        visibilityToggle.addEventListener('change', () => {
            const newSettings = { ...settings };
            newSettings.planets[planetName].visible = visibilityToggle.checked;
            changeCallback(newSettings);
        });
        
        visibilityLabel.appendChild(visibilityText);
        visibilityLabel.appendChild(visibilityToggle);
        planetCard.appendChild(visibilityLabel);
        
        // Scale slider
        const scaleLabel = document.createElement('label');
        scaleLabel.className = 'settings-control-row';
        
        const scaleText = document.createElement('span');
        scaleText.innerText = 'Scale';
        
        const scaleSlider = document.createElement('input');
        scaleSlider.type = 'range';
        scaleSlider.min = '0.1';
        scaleSlider.max = '2.0';
        scaleSlider.step = '0.1';
        scaleSlider.value = planetData.scale;
        
        // Normalize scale for gas giants
        if (planetName === 'jupiter') scaleSlider.value = planetData.scale / 11.2;
        else if (planetName === 'saturn') scaleSlider.value = planetData.scale / 9.5;
        else if (planetName === 'uranus') scaleSlider.value = planetData.scale / 4.0;
        else if (planetName === 'neptune') scaleSlider.value = planetData.scale / 3.9;
        
        scaleSlider.addEventListener('input', () => {
            const newSettings = { ...settings };
            
            // Apply scaling factor for gas giants
            let scaleValue = parseFloat(scaleSlider.value);
            if (planetName === 'jupiter') scaleValue *= 11.2;
            else if (planetName === 'saturn') scaleValue *= 9.5;
            else if (planetName === 'uranus') scaleValue *= 4.0;
            else if (planetName === 'neptune') scaleValue *= 3.9;
            
            newSettings.planets[planetName].scale = scaleValue;
            changeCallback(newSettings);
        });
        
        scaleLabel.appendChild(scaleText);
        scaleLabel.appendChild(scaleSlider);
        planetCard.appendChild(scaleLabel);
        
        container.appendChild(planetCard);
    });
},

// Helper method to create global settings
createGlobalSettings: function(container, settings, changeCallback) {
    // Orbits visibility
    const orbitsLabel = document.createElement('label');
    orbitsLabel.className = 'settings-control-row';
    
    const orbitsText = document.createElement('span');
    orbitsText.innerText = 'Show Orbits';
    
    const orbitsToggle = document.createElement('input');
    orbitsToggle.type = 'checkbox';
    orbitsToggle.checked = settings.showOrbits;
    orbitsToggle.addEventListener('change', () => {
        const newSettings = { ...settings };
        newSettings.showOrbits = orbitsToggle.checked;
        changeCallback(newSettings);
    });
    
    orbitsLabel.appendChild(orbitsText);
    orbitsLabel.appendChild(orbitsToggle);
    container.appendChild(orbitsLabel);
    
    // Labels visibility
    const labelsLabel = document.createElement('label');
    labelsLabel.className = 'settings-control-row';
    
    const labelsText = document.createElement('span');
    labelsText.innerText = 'Show Labels';
    
    const labelsToggle = document.createElement('input');
    labelsToggle.type = 'checkbox';
    labelsToggle.checked = settings.showLabels;
    labelsToggle.addEventListener('change', () => {
        const newSettings = { ...settings };
        newSettings.showLabels = labelsToggle.checked;
        changeCallback(newSettings);
    });
    
    labelsLabel.appendChild(labelsText);
    labelsLabel.appendChild(labelsToggle);
    container.appendChild(labelsLabel);
    
    // Rotation speed
    const speedLabel = document.createElement('label');
    speedLabel.className = 'settings-control-row';
    
    const speedText = document.createElement('span');
    speedText.innerText = 'Rotation Speed';
    
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0.1';
    speedSlider.max = '5.0';
    speedSlider.step = '0.1';
    speedSlider.value = settings.rotationSpeed;
    speedSlider.addEventListener('input', () => {
        const newSettings = { ...settings };
        newSettings.rotationSpeed = parseFloat(speedSlider.value);
        changeCallback(newSettings);
    });
    
    speedLabel.appendChild(speedText);
    speedLabel.appendChild(speedSlider);
    container.appendChild(speedLabel);
    
    // Video background toggle
    const videoLabel = document.createElement('label');
    videoLabel.className = 'settings-control-row';
    
    const videoText = document.createElement('span');
    videoText.innerText = 'Show Video Background';
    
    const videoToggle = document.createElement('input');
    videoToggle.type = 'checkbox';
    videoToggle.checked = settings.showVideo || false;
    videoToggle.addEventListener('change', () => {
        const newSettings = { ...settings };
        newSettings.showVideo = videoToggle.checked;
        changeCallback(newSettings);
    });
    
    videoLabel.appendChild(videoText);
    videoLabel.appendChild(videoToggle);
    container.appendChild(videoLabel);
    
    // Preset buttons
    const presetsContainer = document.createElement('div');
    presetsContainer.className = 'presets-container';
    
    const presetsTitle = document.createElement('h4');
    presetsTitle.innerText = 'Presets';
    presetsContainer.appendChild(presetsTitle);
    
    // Inner planets preset
    const innerPlanetsButton = document.createElement('button');
    innerPlanetsButton.innerText = 'Inner Planets';
    innerPlanetsButton.addEventListener('click', () => {
        const newSettings = { ...window.SolarSystemSettings.getPreset('innerPlanets').solarSystem };
        changeCallback(newSettings);
    });
    presetsContainer.appendChild(innerPlanetsButton);
    
    // All planets preset
    const allPlanetsButton = document.createElement('button');
    allPlanetsButton.innerText = 'All Planets';
    allPlanetsButton.addEventListener('click', () => {
        const newSettings = { ...window.SolarSystemSettings.getPreset('allPlanets').solarSystem };
        changeCallback(newSettings);
    });
    presetsContainer.appendChild(allPlanetsButton);
    
    // Earth view preset
    const earthViewButton = document.createElement('button');
    earthViewButton.innerText = 'Earth View';
    earthViewButton.addEventListener('click', () => {
        const newSettings = { ...window.SolarSystemSettings.getPreset('earthView').solarSystem };
        changeCallback(newSettings);
    });
    presetsContainer.appendChild(earthViewButton);
    
    // Gas giants preset
    const gasGiantsButton = document.createElement('button');
    gasGiantsButton.innerText = 'Gas Giants';
    gasGiantsButton.addEventListener('click', () => {
        const newSettings = { ...window.SolarSystemSettings.getPreset('gasGiants').solarSystem };
        changeCallback(newSettings);
    });
    presetsContainer.appendChild(gasGiantsButton);
    
    container.appendChild(presetsContainer);
}

// Next add this to the VisualEffectsService integration
function initializeVisual(visualId, quadrant) {
    // ...
    switch(visualId) {
        // ...
        case 'solar-system':
            this.initializeSolarSystem(container);
            break;
    }
},

// Then add a new initialization method
function initializeSolarSystem(container) {
    try {
        // First check if we have the Solar System service available
        if (!window.SolarSystemService) {
            console.error('Solar System service not available');
            
            // Create placeholder
            container.innerHTML = `
                <div class="visual-effect-placeholder">
                    <div>Solar System Visualization</div>
                    <div class="placeholder-message">The Solar System module is not loaded.</div>
                </div>
            `;
            return;
        }
        
        console.log('Initializing Solar System in container:', container);
        
        // Create dependencies for the Solar System components
        const dependencies = {
            store: this.store,
            serviceProvider: this
        };
        
        // Create and initialize the service
        const solarSystemService = new window.SolarSystemService(dependencies);
        if (!solarSystemService.init()) {
            console.error('Failed to initialize Solar System service');
            return;
        }
        
        // Add to dependency object for subsequent components
        dependencies.solarSystemService = solarSystemService;
        
        // Create and initialize the controller
        const solarSystemController = new window.SolarSystemController(dependencies);
        if (!solarSystemController.init()) {
            console.error('Failed to initialize Solar System controller');
            solarSystemService.destroy();
            return;
        }
        
        // Add to dependency object for view
        dependencies.solarSystemController = solarSystemController;
        
        // Create and initialize the view
        const solarSystemView = new window.SolarSystemView(dependencies);
        if (!solarSystemView.init()) {
            console.error('Failed to initialize Solar System view');
            solarSystemController.destroy();
            solarSystemService.destroy();
            return;
        }
        
        // Initialize the scene in the container
        solarSystemService.initializeScene(container);
        
        // Store references to components for cleanup
        this.activeEffects[container.id] = {
            service: solarSystemService,
            controller: solarSystemController,
            view: solarSystemView
        };
        
        console.log('Solar System initialized successfully');
    } catch (error) {
        console.error('Error initializing Solar System:', error);
        
        // Create error placeholder
        container.innerHTML = `
            <div class="visual-effect-placeholder">
                <div>Solar System Visualization</div>
                <div class="placeholder-message">Error: ${error.message}</div>
            </div>
        `;
    }
}