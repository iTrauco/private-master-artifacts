# Climate System Dynamics Simulator - Implementation Plan

This document outlines the implementation plan for the Climate System Dynamics Simulator, following the same architectural standards used in the Solar System visualization.

## 1. File Structure

```
public/
├── css/
│   └── climatesystem/
│       ├── base.css
│       ├── panels.css
│       └── controls.css
├── js/
│   └── climatesystem/
│       ├── controllers/
│       │   └── climatesystem-controller.js
│       ├── services/
│       │   └── climatesystem-service.js
│       ├── components/
│       │   └── ClimateSystemView.js
│       ├── models/
│       │   └── climatesystem-settings.js
│       └── utils/
│           └── climate-math.js
├── pages/
│   └── climatesystem/
│       └── index.html
server/
├── routes/
│   ├── api/
│   │   └── climatesystem.js
│   └── pages.js (to modify)
└── utils/
    └── climatesystem/
        └── climate-data-service.js
```

## 2. Models/Settings Implementation

```javascript
/**
 * Climate System Settings Model
 * Defines default settings and data structure for the climate system simulator
 */

window.ClimateSystemSettings = {
    // Default settings
    defaultState: {
        climateSystem: {
            // Visualization layers
            layers: {
                atmosphere: { visible: true, opacity: 0.7 },
                oceans: { visible: true, opacity: 0.8 },
                landmass: { visible: true, opacity: 1.0 },
                iceSheets: { visible: true, opacity: 0.9 },
                clouds: { visible: true, opacity: 0.5 },
                currents: { visible: true, opacity: 0.6 }
            },
            
            // Energy parameters
            energy: {
                solarRadiation: 1370, // W/m²
                greenhouseEffect: 1.0, // Multiplier
                albedo: 0.3, // Earth's reflectivity
                co2Level: 415, // ppm
                methaneLevel: 1.9, // ppm
                temperature: 14.0 // °C (global average)
            },
            
            // Simulation parameters
            simulation: {
                speed: 1.0,
                year: 2025,
                timeScale: "decades", // "years", "decades", "centuries"
                autoRotate: true,
                rotationSpeed: 0.5
            },
            
            // Display options
            display: {
                visualizationType: "standard", // "standard", "temperature", "precipitation", "co2"
                colorScale: "default", // "default", "enhanced", "technical"
                showAxes: true,
                showGrid: false,
                showLabels: true,
                showLegend: true,
                darkMode: true, 
                detailLevel: "medium" // "low", "medium", "high"
            },
            
            // Camera settings
            cameraPosition: { x: 0, y: 0, z: 2.5 }
        }
    },
    
    // Predefined presets
    presets: {
        // Current climate
        current: {
            climateSystem: {
                layers: {
                    atmosphere: { visible: true, opacity: 0.7 },
                    oceans: { visible: true, opacity: 0.8 },
                    landmass: { visible: true, opacity: 1.0 },
                    iceSheets: { visible: true, opacity: 0.9 },
                    clouds: { visible: true, opacity: 0.5 },
                    currents: { visible: true, opacity: 0.6 }
                },
                energy: {
                    solarRadiation: 1370,
                    greenhouseEffect: 1.0,
                    albedo: 0.3,
                    co2Level: 415,
                    methaneLevel: 1.9,
                    temperature: 14.0
                },
                simulation: {
                    speed: 1.0,
                    year: 2025,
                    timeScale: "decades",
                    autoRotate: true,
                    rotationSpeed: 0.5
                },
                display: {
                    visualizationType: "standard",
                    colorScale: "default",
                    showAxes: true,
                    showGrid: false,
                    showLabels: true,
                    showLegend: true,
                    darkMode: true,
                    detailLevel: "medium"
                },
                cameraPosition: { x: 0, y: 0, z: 2.5 }
            }
        },
        
        // Pre-industrial climate
        preindustrial: {
            climateSystem: {
                layers: {
                    atmosphere: { visible: true, opacity: 0.7 },
                    oceans: { visible: true, opacity: 0.8 },
                    landmass: { visible: true, opacity: 1.0 },
                    iceSheets: { visible: true, opacity: 1.0 },
                    clouds: { visible: true, opacity: 0.5 },
                    currents: { visible: true, opacity: 0.6 }
                },
                energy: {
                    solarRadiation: 1370,
                    greenhouseEffect: 0.85,
                    albedo: 0.32,
                    co2Level: 280,
                    methaneLevel: 0.7,
                    temperature: 13.0
                },
                simulation: {
                    speed: 1.0,
                    year: 1850,
                    timeScale: "decades",
                    autoRotate: true,
                    rotationSpeed: 0.5
                },
                display: {
                    visualizationType: "standard",
                    colorScale: "default",
                    showAxes: true,
                    showGrid: false,
                    showLabels: true,
                    showLegend: true,
                    darkMode: true,
                    detailLevel: "medium"
                },
                cameraPosition: { x: 0, y: 0, z: 2.5 }
            }
        },
        
        // High emissions scenario (RCP 8.5 equivalent)
        highEmissions: {
            climateSystem: {
                layers: {
                    atmosphere: { visible: true, opacity: 0.7 },
                    oceans: { visible: true, opacity: 0.8 },
                    landmass: { visible: true, opacity: 1.0 },
                    iceSheets: { visible: true, opacity: 0.5 },
                    clouds: { visible: true, opacity: 0.6 },
                    currents: { visible: true, opacity: 0.6 }
                },
                energy: {
                    solarRadiation: 1370,
                    greenhouseEffect: 1.3,
                    albedo: 0.27,
                    co2Level: 1000,
                    methaneLevel: 3.7,
                    temperature: 19.0
                },
                simulation: {
                    speed: 1.0,
                    year: 2100,
                    timeScale: "decades",
                    autoRotate: true,
                    rotationSpeed: 0.5
                },
                display: {
                    visualizationType: "temperature",
                    colorScale: "enhanced",
                    showAxes: true,
                    showGrid: false,
                    showLabels: true,
                    showLegend: true,
                    darkMode: true,
                    detailLevel: "medium"
                },
                cameraPosition: { x: 0, y: 0, z: 2.5 }
            }
        },
        
        // Low emissions scenario (Paris Agreement targets)
        parisAgreement: {
            climateSystem: {
                layers: {
                    atmosphere: { visible: true, opacity: 0.7 },
                    oceans: { visible: true, opacity: 0.8 },
                    landmass: { visible: true, opacity: 1.0 },
                    iceSheets: { visible: true, opacity: 0.8 },
                    clouds: { visible: true, opacity: 0.5 },
                    currents: { visible: true, opacity: 0.6 }
                },
                energy: {
                    solarRadiation: 1370,
                    greenhouseEffect: 1.1,
                    albedo: 0.29,
                    co2Level: 450,
                    methaneLevel: 2.1,
                    temperature: 15.5
                },
                simulation: {
                    speed: 1.0,
                    year: 2100,
                    timeScale: "decades",
                    autoRotate: true,
                    rotationSpeed: 0.5
                },
                display: {
                    visualizationType: "temperature",
                    colorScale: "default",
                    showAxes: true,
                    showGrid: false,
                    showLabels: true,
                    showLegend: true,
                    darkMode: true,
                    detailLevel: "medium"
                },
                cameraPosition: { x: 0, y: 0, z: 2.5 }
            }
        },
        
        // Focus on ocean circulation
        oceanCirculation: {
            climateSystem: {
                layers: {
                    atmosphere: { visible: false, opacity: 0.7 },
                    oceans: { visible: true, opacity: 1.0 },
                    landmass: { visible: true, opacity: 0.7 },
                    iceSheets: { visible: true, opacity: 0.9 },
                    clouds: { visible: false, opacity: 0.5 },
                    currents: { visible: true, opacity: 1.0 }
                },
                energy: {
                    solarRadiation: 1370,
                    greenhouseEffect: 1.0,
                    albedo: 0.3,
                    co2Level: 415,
                    methaneLevel: 1.9,
                    temperature: 14.0
                },
                simulation: {
                    speed: 2.0,
                    year: 2025,
                    timeScale: "decades",
                    autoRotate: true,
                    rotationSpeed: 0.3
                },
                display: {
                    visualizationType: "currents",
                    colorScale: "technical",
                    showAxes: false,
                    showGrid: false,
                    showLabels: true,
                    showLegend: true,
                    darkMode: true,
                    detailLevel: "high"
                },
                cameraPosition: { x: 0, y: 0, z: 2.5 }
            }
        }
    },
    
    // Climate data structure
    climateData: {
        // Temperature bands (latitude)
        temperatureBands: [
            { latitude: 90, averageTemp: -25 },  // North Pole
            { latitude: 60, averageTemp: 0 },    // Northern high latitudes
            { latitude: 30, averageTemp: 15 },   // Northern mid latitudes
            { latitude: 0, averageTemp: 26 },    // Equator
            { latitude: -30, averageTemp: 15 },  // Southern mid latitudes
            { latitude: -60, averageTemp: 0 },   // Southern high latitudes
            { latitude: -90, averageTemp: -20 }  // South Pole
        ],
        
        // Major ocean currents
        oceanCurrents: [
            { 
                name: "Gulf Stream", 
                path: [
                    [25, -80], [30, -75], [35, -70], [40, -60], [45, -40], [50, -20]
                ],
                type: "warm",
                strength: 1.0
            },
            { 
                name: "Humboldt Current", 
                path: [
                    [-50, -80], [-40, -82], [-30, -84], [-20, -85], [-10, -85], [0, -85]
                ],
                type: "cold",
                strength: 0.8
            },
            // Additional currents would be defined here
        ],
        
        // Major wind patterns
        windPatterns: [
            {
                name: "Trade Winds",
                latitudeBand: [0, 30],
                direction: "easterly",
                strength: 1.0
            },
            {
                name: "Westerlies",
                latitudeBand: [30, 60],
                direction: "westerly",
                strength: 1.0
            },
            {
                name: "Polar Easterlies",
                latitudeBand: [60, 90],
                direction: "easterly",
                strength: 0.7
            }
            // Equivalent southern hemisphere patterns would be defined here
        ]
    },

    // Get a deep copy of a preset state
    getPreset: function(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.error(`Preset "${presetName}" not found`);
            return JSON.parse(JSON.stringify(this.defaultState));
        }
        return JSON.parse(JSON.stringify(preset));
    },

    // Get a deep copy of the default state
    getDefaultState: function() {
        return JSON.parse(JSON.stringify(this.defaultState));
    },

    // Calculate temperature change based on CO2 change using simplified climate sensitivity
    calculateTemperatureChange: function(initialCO2, finalCO2) {
        // Simplified logarithmic relationship with a climate sensitivity of ~3°C per doubling of CO2
        const climateSensitivity = 3.0;
        return climateSensitivity * (Math.log(finalCO2 / initialCO2) / Math.log(2));
    },
    
    // Calculate albedo change based on ice sheet coverage change
    calculateAlbedoChange: function(iceSheetChange) {
        // Simplified linear relationship
        // iceSheetChange should be a value between -1 (complete loss) and 1 (doubling)
        const albedoSensitivity = 0.03; // Maximum albedo change
        return iceSheetChange * albedoSensitivity;
    }
};
```

## 3. Climate Math Utilities

```javascript
/**
 * Climate Math Utility
 * Provides mathematical functions for climate calculations
 */

window.ClimateMathUtil = {
    /**
     * Calculate global energy balance
     * @param {number} solarRadiation - Incoming solar radiation in W/m²
     * @param {number} albedo - Earth's albedo (reflectivity)
     * @param {number} greenhouseEffect - Greenhouse effect multiplier
     * @returns {number} Global energy balance in W/m²
     */
    calculateEnergyBalance: function(solarRadiation, albedo, greenhouseEffect) {
        // Incoming energy
        const incomingEnergy = solarRadiation * (1 - albedo) / 4; // Divide by 4 for Earth's surface
        
        // Outgoing energy (Stefan-Boltzmann law with greenhouse effect)
        const stefanBoltzmann = 5.67e-8; // Stefan-Boltzmann constant
        const earthTemperature = 288; // K (15°C)
        const outgoingEnergy = stefanBoltzmann * Math.pow(earthTemperature, 4) / greenhouseEffect;
        
        // Energy balance
        return incomingEnergy - outgoingEnergy;
    },
    
    /**
     * Calculate temperature from CO2 concentration using logarithmic relationship
     * @param {number} co2Level - CO2 concentration in ppm
     * @param {number} baselineCO2 - Baseline CO2 level (typically pre-industrial 280 ppm)
     * @param {number} baselineTemp - Baseline temperature (typically pre-industrial ~13.7°C)
     * @param {number} climateSensitivity - Climate sensitivity (°C per doubling of CO2)
     * @returns {number} Global average temperature in °C
     */
    calculateTemperatureFromCO2: function(co2Level, baselineCO2 = 280, baselineTemp = 13.7, climateSensitivity = 3.0) {
        // Calculate temperature change using logarithmic relationship
        const tempChange = climateSensitivity * (Math.log(co2Level / baselineCO2) / Math.log(2));
        
        // Return new temperature
        return baselineTemp + tempChange;
    },
    
    /**
     * Calculate the temperature distribution by latitude
     * @param {number} averageTemp - Global average temperature in °C
     * @param {Array} latitudeBands - Array of latitude band definitions
     * @returns {Array} Temperature at each latitude
     */
    calculateLatitudeTemperatures: function(averageTemp, latitudeBands) {
        // Calculate temperature anomaly (difference from current global average)
        const tempAnomaly = averageTemp - 14.0; // 14.0°C is current global average
        
        // Apply anomaly to each latitude band with polar amplification factor
        return latitudeBands.map(band => {
            let amplificationFactor = 1.0;
            
            // Polar amplification (warming affects poles more)
            if (Math.abs(band.latitude) > 60) {
                amplificationFactor = 2.0; // Stronger at poles
            } else if (Math.abs(band.latitude) > 30) {
                amplificationFactor = 1.5; // Moderate at mid-latitudes
            }
            
            return {
                latitude: band.latitude,
                temperature: band.averageTemp + (tempAnomaly * amplificationFactor)
            };
        });
    },
    
    /**
     * Calculate sea level rise from temperature change
     * @param {number} tempChange - Temperature change in °C
     * @returns {number} Sea level rise in meters
     */
    calculateSeaLevelRise: function(tempChange) {
        // Simplified model: 
        // - Thermal expansion: ~0.2m per °C 
        // - Ice melt contribution: non-linear
        const thermalExpansion = 0.2 * tempChange;
        
        // Ice melt contribution (simplified non-linear relationship)
        let iceMeltContribution = 0;
        if (tempChange > 0) {
            // Accelerating ice melt with higher temperatures
            iceMeltContribution = 0.1 * Math.pow(tempChange, 2);
        }
        
        return thermalExpansion + iceMeltContribution;
    },
    
    /**
     * Calculate changes in ocean circulation strength
     * @param {number} tempChange - Temperature change in °C
     * @param {Object} current - Ocean current data
     * @returns {number} New circulation strength (0-1 multiplier)
     */
    calculateCirculationChanges: function(tempChange, current) {
        let strengthMultiplier = 1.0;
        
        // Different impacts on warm vs. cold currents
        if (current.type === "warm") {
            // Gulf Stream-like currents may weaken with warming due to freshwater input
            if (current.name === "Gulf Stream") {
                strengthMultiplier = 1.0 - (tempChange * 0.1);
            } else {
                strengthMultiplier = 1.0 - (tempChange * 0.05);
            }
        } else if (current.type === "cold") {
            // Cold currents may strengthen slightly with small warming
            if (tempChange < 2) {
                strengthMultiplier = 1.0 + (tempChange * 0.02);
            } else {
                // But weaken with more warming
                strengthMultiplier = 1.04 - ((tempChange - 2) * 0.05);
            }
        }
        
        // Keep within reasonable bounds
        return Math.max(0.2, Math.min(1.5, strengthMultiplier * current.strength));
    },
    
    /**
     * Calculate ice sheet volume change
     * @param {number} tempChange - Temperature change in °C
     * @returns {number} Ice volume change multiplier (0-1)
     */
    calculateIceSheetChange: function(tempChange) {
        // No change or slight growth for cooling
        if (tempChange <= 0) {
            return 1.0 - (tempChange * 0.02); // Slight growth with cooling
        }
        
        // Simplified ice melt model (accelerating with higher temperatures)
        if (tempChange < 2) {
            return 1.0 - (tempChange * 0.05); // Slow initial melt
        } else {
            // Accelerating melt at higher temperatures
            return 0.9 - ((tempChange - 2) * 0.15);
        }
    },
    
    /**
     * Calculate cloud cover changes
     * @param {number} tempChange - Temperature change in °C
     * @returns {number} Cloud cover multiplier
     */
    calculateCloudChanges: function(tempChange) {
        // Simple model with some increase in clouds with warming (more evaporation)
        // But region-dependent (not implemented here)
        return 1.0 + (tempChange * 0.02);
    },
    
    /**
     * Create a latitude-longitude grid of temperature values
     * @param {Array} latTemps - Temperature by latitude
     * @param {number} resolution - Grid resolution
     * @returns {Array} 2D grid of temperature values
     */
    createTemperatureGrid: function(latTemps, resolution = 36) {
        const grid = [];
        
        // Create grid with resolution x (resolution*2) points (latitude x longitude)
        for (let i = 0; i < resolution; i++) {
            const lat = 90 - (i * 180 / (resolution - 1));
            
            const row = [];
            for (let j = 0; j < resolution * 2; j++) {
                const lon = -180 + (j * 360 / (resolution * 2 - 1));
                
                // Interpolate temperature from latitude temperature array
                const temp = this.interpolateLatitudeTemperature(lat, latTemps);
                
                // Apply longitudinal variations (simplified)
                const lonVariation = this.calculateLongitudeVariation(lat, lon);
                
                row.push(temp + lonVariation);
            }
            
            grid.push(row);
        }
        
        return grid;
    },
    
    /**
     * Interpolate temperature for a specific latitude
     * @param {number} latitude - Target latitude
     * @param {Array} latTemps - Array of latitude temperature points
     * @returns {number} Interpolated temperature
     */
    interpolateLatitudeTemperature: function(latitude, latTemps) {
        // Find the two closest latitude points
        let lowerPoint = null;
        let upperPoint = null;
        
        for (let i = 0; i < latTemps.length; i++) {
            if (latTemps[i].latitude >= latitude && (upperPoint === null || latTemps[i].latitude < upperPoint.latitude)) {
                upperPoint = latTemps[i];
            }
            
            if (latTemps[i].latitude <= latitude && (lowerPoint === null || latTemps[i].latitude > lowerPoint.latitude)) {
                lowerPoint = latTemps[i];
            }
        }
        
        // If we're at or beyond the range, return the endpoint temperature
        if (lowerPoint === null) return upperPoint.temperature;
        if (upperPoint === null) return lowerPoint.temperature;
        
        // Interpolate between the two points
        const latRange = upperPoint.latitude - lowerPoint.latitude;
        const tempRange = upperPoint.temperature - lowerPoint.temperature;
        
        const ratio = (latitude - lowerPoint.latitude) / latRange;
        return lowerPoint.temperature + (ratio * tempRange);
    },
    
    /**
     * Calculate temperature variation with longitude (simplified)
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {number} Temperature variation in °C
     */
    calculateLongitudeVariation: function(lat, lon) {
        // Simplified model of continent/ocean differences
        // Positive values for land (warmer), negative for ocean (cooler)
        
        // Northern hemisphere continental effects
        if (lat > 20 && lat < 70) {
            // North America
            if (lon > -140 && lon < -60) return 2;
            
            // Europe/Asia
            if (lon > 0 && lon < 140) return 3;
        }
        
        // Southern hemisphere continental effects
        if (lat < -15 && lat > -50) {
            // South America
            if (lon > -80 && lon < -35) return 1;
            
            // Africa
            if (lon > 10 && lon < 40) return 2;
            
            // Australia
            if (lon > 115 && lon < 155) return 2;
        }
        
        // Default to slightly cooler for oceans
        return -1;
    }
};
```

## 4. Core Service Implementation

```javascript
/**
 * Climate System Service
 * Handles the business logic and 3D rendering for climate system simulation
 */

class ClimateSystemService {
    /**
     * Create a Climate System service
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
        
        // Earth components
        this.earth = null;
        this.atmosphere = null;
        this.clouds = null;
        this.iceCaps = null;
        this.oceanCurrents = null;
        
        // Animation and timing
        this.clock = null;
        this.animationId = null;
        
        // State
        this.currentState = null;
        this.container = null;
        
        // Simulation data
        this.temperatureGrid = null;
        this.precipitationGrid = null;
        this.co2Distribution = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.initializeScene = this.initializeScene.bind(this);
        this.setupCamera = this.setupCamera.bind(this);
        this.setupControls = this.setupControls.bind(this);
        this.createEarth = this.createEarth.bind(this);
        this.createAtmosphere = this.createAtmosphere.bind(this);
        this.createClouds = this.createClouds.bind(this);
        this.createIceCaps = this.createIceCaps.bind(this);
        this.createOceanCurrents = this.createOceanCurrents.bind(this);
        this.updateClimateData = this.updateClimateData.bind(this);
        this.animate = this.animate.bind(this);
        this.updateScene = this.updateScene.bind(this);
        this.updateVisualization = this.updateVisualization.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.fetchClimateSystemState = this.fetchClimateSystemState.bind(this);
        this.updateClimateSystemState = this.updateClimateSystemState.bind(this);
        this.applyPreset = this.applyPreset.bind(this);
        this.resetToDefaultState = this.resetToDefaultState.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    
    /**
     * Initialize the service
     * @returns {boolean} Whether initialization was successful
     */
    init() {
        if (this.initialized) {
            console.log('Climate System service already initialized');
            return true;
        }
        
        console.log('Initializing Climate System service');
        
        try {
            // Initialize timekeeping
            this.clock = new THREE.Clock();
            
            // Initialize state from settings
            this.currentState = window.ClimateSystemSettings.getDefaultState();
            
            this.initialized = true;
            console.log('Climate System service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Climate System service:', error);
            return false;
        }
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
        
        console.log('Initializing 3D scene for Climate System visualization');
        this.container = container;
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Set background color based on dark mode setting
        const darkMode = this.currentState.climateSystem.display.darkMode;
        this.scene.background = new THREE.Color(darkMode ? 0x111111 : 0xf0f0f0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            logarithmicDepthBuffer: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        
        // Set up camera
        this.setupCamera();
        
        // Set up controls
        this.setupControls();
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 3, 5);
        this.scene.add(sunLight);
        
        // Create Earth components
        this.createEarth();
        this.createAtmosphere();
        this.createClouds();
        this.createIceCaps();
        this.createOceanCurrents();
        
        // Generate initial climate data
        this.updateClimateData();
        
        // Update visualization based on selected type
        this.updateVisualization(this.currentState.climateSystem.display.visualizationType);
        
        // Start animation loop
        this.animate();
        
        // Add window resize handler
        window.addEventListener('resize', this.handleResize);
        
        // Fetch initial state from server
        this.fetchClimateSystemState();
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
        const cameraPos = this.currentState.climateSystem.cameraPosition;
        this.camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * Set up controls
     */
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.5;
        this.controls.minDistance = 1.5;
        this.controls.maxDistance = 10;
        this.controls.enablePan = true;
        this.controls.autoRotate = this.currentState.climateSystem.simulation.autoRotate;
        this.controls.autoRotateSpeed = this.currentState.climateSystem.simulation.rotationSpeed * 2;
        
        // Listen for control changes to update camera position in state
        this.controls.addEventListener('change', () => {
            if (this.currentState && this.currentState.climateSystem) {
                this.currentState.climateSystem.cameraPosition = {
                    x: this.camera.position.x,
                    y: this.camera.position.y,
                    z: this.camera.position.z
                };
                
                // Dispatch to store if available
                if (this.store) {
                    this.store.dispatch({
                        type: 'CLIMATE_SYSTEM_SET_CAMERA_POSITION',
                        payload: {
                            position: this.currentState.climateSystem.cameraPosition
                        }
                    });
                }
            }
        });
    }
    
    /**
     * Create the Earth model
     */
    createEarth() {
        // Create Earth geometry
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Create materials with texture maps
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('/assets/textures/earth_daymap.jpg'),
            bumpMap: new THREE.TextureLoader().load('/assets/textures/earth_bumpmap.jpg'),
            bumpScale: 0.05,
            specularMap: new THREE.TextureLoader().load('/assets/textures/earth_specular.jpg'),
            specular: new THREE.Color(0x333333)
        });
        
        // Create Earth mesh
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.name = 'earth';
        this.scene.add(this.earth);
        
        // Add axial tilt (Earth's tilt is about 23.5 degrees)
        this.earth.rotation.z = 23.5 * Math.PI / 180;
    }
    
    /**
     * Create atmosphere layer
     */
    createAtmosphere() {
        // Create slightly larger sphere for atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(1.03, 64, 64);
        
        // Create atmosphere material
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('/assets/textures/earth_clouds.jpg'),
            transparent: true,
            opacity: this.currentState.climateSystem.layers.atmosphere.opacity,
            blending: THREE.AdditiveBlending
        });
        
        // Create atmosphere mesh
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.atmosphere.name = 'atmosphere';
        this.atmosphere.visible = this.currentState.climateSystem.layers.atmosphere.visible;
        this.scene.add(this.atmosphere);
    }
    
    /**
     * Create cloud layer
     */
    createClouds() {
        // Create slightly larger sphere for clouds
        const cloudGeometry = new THREE.SphereGeometry(1.02, 64, 64);
        
        // Create cloud material
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('/assets/textures/earth_clouds.jpg'),
            transparent: true,
            opacity: this.currentState.climateSystem.layers.clouds.opacity,
            blending: THREE.NormalBlending
        });
        
        // Create clouds mesh
        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.clouds.name = 'clouds';
        this.clouds.visible = this.currentState.climateSystem.layers.clouds.visible;
        this.scene.add(this.clouds);
    }
    
    /**
     * Create ice caps
     */
    createIceCaps() {
        // Create ice cap geometry
        const northCapGeometry = new THREE.CircleGeometry(0.3, 32);
        const southCapGeometry = new THREE.CircleGeometry(0.4, 32);
        
        // Create ice cap material
        const iceMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: this.currentState.climateSystem.layers.iceSheets.opacity
        });
        
        // Create ice cap meshes
        const northCap = new THREE.Mesh(northCapGeometry, iceMaterial);
        northCap.position.set(0, 1, 0);
        northCap.rotation.x = -Math.PI / 2;
        northCap.name = 'northIceCap';
        
        const southCap = new THREE.Mesh(southCapGeometry, iceMaterial);
        southCap.position.set(0, -1, 0);
        southCap.rotation.x = Math.PI / 2;
        southCap.name = 'southIceCap';
        
        // Create a group for both caps
        this.iceCaps = new THREE.Group();
        this.iceCaps.add(northCap);
        this.iceCaps.add(southCap);
        this.iceCaps.name = 'iceCaps';
        this.iceCaps.visible = this.currentState.climateSystem.layers.iceSheets.visible;
        
        // Add Earth's tilt to ice caps
        this.iceCaps.rotation.z = 23.5 * Math.PI / 180;
        
        this.scene.add(this.iceCaps);
    }
    
    /**
     * Create ocean currents visualization
     */
    createOceanCurrents() {
        // Get ocean current data
        const currents = window.ClimateSystemSettings.climateData.oceanCurrents;
        
        // Create a group for all currents
        this.oceanCurrents = new THREE.Group();
        this.oceanCurrents.name = 'oceanCurrents';
        
        currents.forEach(current => {
            // Convert path to 3D points on the globe
            const points = current.path.map(coord => {
                return this.latLonToVector3(coord[0], coord[1], 1.01);
            });
            
            // Create geometry from points
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            // Create material based on current type
            const material = new THREE.LineBasicMaterial({
                color: current.type === 'warm' ? 0xff5500 : 0x0088ff,
                linewidth: 2,
                transparent: true,
                opacity: this.currentState.climateSystem.layers.currents.opacity
            });
            
            // Create line
            const line = new THREE.Line(geometry, material);
            line.name = `current-${current.name}`;
            
            // Add to group
            this.oceanCurrents.add(line);
        });
        
        // Add to scene
        this.oceanCurrents.visible = this.currentState.climateSystem.layers.currents.visible;
        this.scene.add(this.oceanCurrents);
    }
    
    /**
     * Convert latitude and longitude to 3D position
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} radius - Radius
     * @returns {THREE.Vector3} 3D position
     */
    latLonToVector3(lat, lon, radius = 1) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lon + 180) * Math.PI / 180;
        
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        return new THREE.Vector3(x, y, z);
    }
    
    /**
     * Update climate data based on current state
     */
    updateClimateData() {
        // Get current state values
        const energySettings = this.currentState.climateSystem.energy;
        const climateData = window.ClimateSystemSettings.climateData;
        
        // Calculate temperature distribution
        const latTemps = window.ClimateMathUtil.calculateLatitudeTemperatures(
            energySettings.temperature,
            climateData.temperatureBands
        );
        
        // Generate temperature grid
        const detailLevel = this.currentState.climateSystem.display.detailLevel;
        let resolution = 36; // Default medium resolution
        
        if (detailLevel === 'low') {
            resolution = 18;
        } else if (detailLevel === 'high') {
            resolution = 72;
        }
        
        this.temperatureGrid = window.ClimateMathUtil.createTemperatureGrid(
            latTemps,
            resolution
        );
        
        // Calculate sea level rise
        const preindustrialTemp = 13.7;
        const tempChange = energySettings.temperature - preindustrialTemp;
        const seaLevelRise = window.ClimateMathUtil.calculateSeaLevelRise(tempChange);
        
        // Calculate ice sheet change
        const iceSheetChange = window.ClimateMathUtil.calculateIceSheetChange(tempChange);
        
        // Update ice caps based on calculated change
        if (this.iceCaps) {
            const northCap = this.iceCaps.getObjectByName('northIceCap');
            const southCap = this.iceCaps.getObjectByName('southIceCap');
            
            if (northCap && southCap) {
                // Scale ice caps based on calculated change
                northCap.scale.set(iceSheetChange, iceSheetChange, 1);
                southCap.scale.set(iceSheetChange, iceSheetChange, 1);
            }
        }
        
        // Calculate ocean current changes
        if (this.oceanCurrents) {
            this.oceanCurrents.children.forEach(currentLine => {
                const currentName = currentLine.name.replace('current-', '');
                const currentData = climateData.oceanCurrents.find(c => c.name === currentName);
                
                if (currentData) {
                    const newStrength = window.ClimateMathUtil.calculateCirculationChanges(
                        tempChange,
                        currentData
                    );
                    
                    // Adjust line opacity based on current strength
                    currentLine.material.opacity = 
                        this.currentState.climateSystem.layers.currents.opacity * (newStrength / currentData.strength);
                }
            });
        }
        
        // Calculate cloud changes
        const cloudChange = window.ClimateMathUtil.calculateCloudChanges(tempChange);
        
        if (this.clouds) {
            // Adjust cloud opacity based on calculated change
            const baseOpacity = this.currentState.climateSystem.layers.clouds.opacity;
            this.clouds.material.opacity = baseOpacity * cloudChange;
        }
    }
    
    /**
     * Update visualization based on selected type
     * @param {string} visualizationType - Type of visualization to show
     */
    updateVisualization(visualizationType) {
        // Remove existing visualization overlays
        if (this.earth) {
            // Reset to standard texture
            this.earth.material.map = new THREE.TextureLoader().load('/assets/textures/earth_daymap.jpg');
            this.earth.material.needsUpdate = true;
        }
        
        // Apply new visualization
        switch (visualizationType) {
            case 'temperature':
                this.applyTemperatureVisualization();
                break;
            case 'precipitation':
                this.applyPrecipitationVisualization();
                break;
            case 'co2':
                this.applyCO2Visualization();
                break;
            case 'currents':
                this.applyCurrentsVisualization();
                break;
            default:
                // Standard visualization (already reset above)
                break;
        }
    }
    
    /**
     * Apply temperature visualization
     */
    applyTemperatureVisualization() {
        // Create temperature visualization texture
        const texture = this.createTemperatureTexture();
        
        // Apply to Earth
        this.earth.material.map = texture;
        this.earth.material.needsUpdate = true;
    }
    
    /**
     * Create temperature visualization texture
     * @returns {THREE.Texture} Generated texture
     */
    createTemperatureTexture() {
        // Create canvas for texture
        const canvas = document.createElement('canvas');
        const size = 1024;
        canvas.width = size * 2; // 2:1 aspect ratio for longitude:latitude
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        
        // Draw temperature data
        for (let y = 0; y < this.temperatureGrid.length; y++) {
            for (let x = 0; x < this.temperatureGrid[y].length; x++) {
                const temp = this.temperatureGrid[y][x];
                
                // Map to canvas coordinates
                const canvasX = (x / this.temperatureGrid[y].length) * canvas.width;
                const canvasY = (y / this.temperatureGrid.length) * canvas.height;
                const pixelWidth = canvas.width / this.temperatureGrid[y].length;
                const pixelHeight = canvas.height / this.temperatureGrid.length;
                
                // Color based on temperature
                ctx.fillStyle = this.getTemperatureColor(temp);
                ctx.fillRect(canvasX, canvasY, pixelWidth + 1, pixelHeight + 1); // +1 to avoid gaps
            }
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    /**
     * Get color for temperature visualization
     * @param {number} temp - Temperature in °C
     * @returns {string} Color in CSS format
     */
    getTemperatureColor(temp) {
        // Define color scale from cold to hot
        const colorScale = this.currentState.climateSystem.display.colorScale;
        
        if (colorScale === 'enhanced') {
            // Enhanced color scale with more differentiation
            if (temp < -30) return '#000080'; // Deep blue
            if (temp < -20) return '#0000FF'; // Blue
            if (temp < -10) return '#0080FF'; // Light blue
            if (temp < 0) return '#00FFFF';   // Cyan
            if (temp < 5) return '#00FF80';   // Blue-green
            if (temp < 10) return '#00FF00';  // Green
            if (temp < 15) return '#80FF00';  // Yellow-green
            if (temp < 20) return '#FFFF00';  // Yellow
            if (temp < 25) return '#FF8000';  // Orange
            if (temp < 30) return '#FF0000';  // Red
            return '#800000';                 // Dark red
        } else if (colorScale === 'technical') {
            // Technical color scale (viridis-like)
            if (temp < -30) return '#440154';
            if (temp < -20) return '#472D7B';
            if (temp < -10) return '#3B528B';
            if (temp < 0) return '#2C728E';
            if (temp < 5) return '#21908C';
            if (temp < 10) return '#27AD81';
            if (temp < 15) return '#5DC963';
            if (temp < 20) return '#AADC32';
            if (temp < 25) return '#FDE725';
            if (temp < 30) return '#FEAA23';
            return '#F98316';
        } else {
            // Default color scale
            if (temp < -20) return '#0000FF'; // Blue
            if (temp < -10) return '#0080FF'; // Light blue
            if (temp < 0) return '#00FFFF';   // Cyan
            if (temp < 10) return '#00FF00';  // Green
            if (temp < 20) return '#FFFF00';  // Yellow
            if (temp < 30) return '#FF0000';  // Red
            return '#FF00FF';                 // Magenta
        }
    }
    
    /**
     * Apply precipitation visualization
     */
    applyPrecipitationVisualization() {
        // Simplified implementation (would use real precipitation data in a full implementation)
        const texture = new THREE.TextureLoader().load('/assets/textures/earth_precipitation.jpg');
        
        // Apply to Earth
        this.earth.material.map = texture;
        this.earth.material.needsUpdate = true;
    }
    
    /**
     * Apply CO2 visualization
     */
    applyCO2Visualization() {
        // Simplified implementation (would generate real CO2 distribution in a full implementation)
        const texture = new THREE.TextureLoader().load('/assets/textures/earth_co2.jpg');
        
        // Apply to Earth
        this.earth.material.map = texture;
        this.earth.material.needsUpdate = true;
    }
    
    /**
     * Apply ocean currents visualization
     */
    applyCurrentsVisualization() {
        // Make base map darker to highlight currents
        const texture = new THREE.TextureLoader().load('/assets/textures/earth_bathymetry.jpg');
        
        // Apply to Earth
        this.earth.material.map = texture;
        this.earth.material.needsUpdate = true;
        
        // Make sure currents are visible
        if (this.oceanCurrents) {
            this.oceanCurrents.visible = true;
            
            // Increase current visibility
            this.oceanCurrents.children.forEach(current => {
                current.material.opacity = Math.min(1.0, current.material.opacity * 1.5);
            });
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Rotate clouds slightly faster than Earth
        if (this.clouds) {
            this.clouds.rotation.y += delta * 0.05 * this.currentState.climateSystem.simulation.speed;
        }
        
        // Rotate atmosphere even faster to simulate wind patterns
        if (this.atmosphere) {
            this.atmosphere.rotation.y += delta * 0.02 * this.currentState.climateSystem.simulation.speed;
        }
        
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
     * Update scene based on new state
     * @param {Object} climateSystem - New climate system state
     */
    updateScene(climateSystem) {
        if (!climateSystem || !this.scene) return;
        
        // Update layer visibility and opacity
        if (climateSystem.layers) {
            // Atmosphere layer
            if (this.atmosphere) {
                this.atmosphere.visible = climateSystem.layers.atmosphere.visible;
                this.atmosphere.material.opacity = climateSystem.layers.atmosphere.opacity;
            }
            
            // Clouds layer
            if (this.clouds) {
                this.clouds.visible = climateSystem.layers.clouds.visible;
                this.clouds.material.opacity = climateSystem.layers.clouds.opacity;
            }
            
            // Ice caps
            if (this.iceCaps) {
                this.iceCaps.visible = climateSystem.layers.iceSheets.visible;
                
                // Update opacity for all ice cap children
                this.iceCaps.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = climateSystem.layers.iceSheets.opacity;
                    }
                });
            }
            
            // Ocean currents
            if (this.oceanCurrents) {
                this.oceanCurrents.visible = climateSystem.layers.currents.visible;
                
                // Update opacity for all current lines
                this.oceanCurrents.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = climateSystem.layers.currents.opacity;
                    }
                });
            }
        }
        
        // Update simulation parameters
        if (climateSystem.simulation) {
            // Auto-rotation
            if (this.controls) {
                this.controls.autoRotate = climateSystem.simulation.autoRotate;
                this.controls.autoRotateSpeed = climateSystem.simulation.rotationSpeed * 2;
            }
        }
        
        // Update display settings
        if (climateSystem.display) {
            // Change background color based on dark mode
            if (this.scene) {
                this.scene.background = new THREE.Color(
                    climateSystem.display.darkMode ? 0x111111 : 0xf0f0f0
                );
            }
            
            // Update visualization type
            if (climateSystem.display.visualizationType !== this.currentState.climateSystem.display.visualizationType) {
                this.updateVisualization(climateSystem.display.visualizationType);
            }
        }
        
        // Update climate data if energy parameters have changed
        if (climateSystem.energy) {
            const currentEnergy = this.currentState.climateSystem.energy;
            const newEnergy = climateSystem.energy;
            
            // Check if any relevant parameter has changed
            if (
                newEnergy.temperature !== currentEnergy.temperature ||
                newEnergy.co2Level !== currentEnergy.co2Level ||
                newEnergy.greenhouseEffect !== currentEnergy.greenhouseEffect ||
                newEnergy.albedo !== currentEnergy.albedo
            ) {
                this.updateClimateData();
                
                // Update visualization if it's showing temperature or CO2
                const vizType = climateSystem.display.visualizationType;
                if (vizType === 'temperature' || vizType === 'co2') {
                    this.updateVisualization(vizType);
                }
            }
        }
        
        // Update camera position if changed significantly
        if (climateSystem.cameraPosition) {
            const newCamPos = climateSystem.cameraPosition;
            const currentCamPos = this.camera.position;
            
            const positionDiff = Math.sqrt(
                Math.pow(newCamPos.x - currentCamPos.x, 2) +
                Math.pow(newCamPos.y - currentCamPos.y, 2) +
                Math.pow(newCamPos.z - currentCamPos.z, 2)
            );
            
            if (positionDiff > 0.1) {
                this.camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z);
                this.camera.lookAt(0, 0, 0);
                this.controls.update();
            }
        }
        
        // Keep track of the current state
        this.currentState.climateSystem = climateSystem;
    }
    
    /**
     * Fetch climate system state from server
     */
    fetchClimateSystemState() {
        console.log('Fetching climate system state from server');
        
        fetch('/api/climatesystem/state')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched climate system state:', data);
                this.currentState = data;
                this.updateScene(data.climateSystem);
                
                // Update store if available
                if (this.store) {
                    this.store.dispatch({
                        type: 'CLIMATE_SYSTEM_SET_STATE',
                        payload: data
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching climate system state:', error);
            });
    }
    
    /**
     * Update climate system state
     * @param {Object} newState - New state to apply
     * @returns {Promise<Object>} Updated state
     */
    updateClimateSystemState(newState) {
        return new Promise((resolve, reject) => {
            console.log('Updating climate system state:', newState);
            
            fetch('/api/climatesystem/state', {
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
                    this.updateScene(data.climateSystem);
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
            
            fetch(`/api/climatesystem/preset/${presetName}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Preset applied:', data);
                    this.currentState = data;
                    this.updateScene(data.climateSystem);
                    
                    // Update store if available
                    if (this.store) {
                        this.store.dispatch({
                            type: 'CLIMATE_SYSTEM_SET_STATE',
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
            
            fetch('/api/climatesystem/reset', {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Reset to default state:', data);
                    this.currentState = data;
                    this.updateScene(data.climateSystem);
                    
                    // Update store if available
                    if (this.store) {
                        this.store.dispatch({
                            type: 'CLIMATE_SYSTEM_SET_STATE',
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
        console.log('Destroying Climate System service');
        
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        // Dispose of Three.js resources
        if (this.scene) {
            this.scene.traverse(object => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => {
                            if (material.map) material.map.dispose();
                            material.dispose();
                        });
                    } else {
                        if (object.material.map) object.material.map.dispose();
                        object.material.dispose();
                    }
                }
            });
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
        this.earth = null;
        this.atmosphere = null;
        this.clouds = null;
        this.iceCaps = null;
        this.oceanCurrents = null;
        this.container = null;
        this.initialized = false;
        
        console.log('Climate System service destroyed');
    }
}

// Export the service
window.ClimateSystemService = ClimateSystemService;
```

## 5. Registry Integration

```javascript
/**
 * Registry integration for Climate System visualization
 * This file needs to be merged with the main visual-registry.js file
 */

// Add this to the main visual-registry.js thumbnails section
const registryThumbnails = {
    'climate-system': '../../assets/visualeffects/thumbnails/climate-system.jpg',
    // other effects...
};

// Add this to the defaultSettings section
const registryDefaultSettings = {
    'climate-system': window.ClimateSystemSettings.getDefaultState().climateSystem,
    // other effects...
};

// Add this to the createSettingsUI method
function createClimateSystemSettings(container, settings, changeCallback) {
    // Create container
    const settingsUI = document.createElement('div');
    settingsUI.className = 'visual-effect-settings';
    
    // Create tabs for different setting groups
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'settings-tabs';
    
    const layersTab = document.createElement('div');
    layersTab.className = 'settings-tab active';
    layersTab.innerText = 'Layers';
    layersTab.dataset.tab = 'layers';
    
    const energyTab = document.createElement('div');
    energyTab.className = 'settings-tab';
    energyTab.innerText = 'Energy & Climate';
    energyTab.dataset.tab = 'energy';
    
    const displayTab = document.createElement('div');
    displayTab.className = 'settings-tab';
    displayTab.innerText = 'Display';
    displayTab.dataset.tab = 'display';
    
    const presetsTab = document.createElement('div');
    presetsTab.className = 'settings-tab';
    presetsTab.innerText = 'Presets';
    presetsTab.dataset.tab =