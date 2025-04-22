feature/bigquery-monitoring-panel
│
├── server/
│   ├── routes/api/bigquery.js           # API endpoints for BigQuery data
│   └── utils/bigquery/
│       └── query-service.js             # BigQuery querying utilities
│
├── public/
│   ├── css/bigquery/
│   │   ├── base.css                     # Base styles for BigQuery components
│   │   ├── panels.css                   # Panel-specific styles
│   │   └── controls.css                 # Control elements styles
│   │
│   ├── js/bigquery/
│   │   ├── services/
│   │   │   └── bigquery-service.js      # Client-side service for BigQuery data
│   │   ├── controllers/
│   │   │   └── bigquery-controller.js   # Main controller for BigQuery UI
│   │   └── components/
│   │       ├── project-selector.js      # Project selection component
│   │       ├── dataset-panel.js         # Dataset statistics panel
│   │       └── query-panel.js           # Query performance panel
│   │
│   └── pages/bigquery/
│       └── index.html                   # BigQuery monitoring page