# Interview Practice Module Implementation Guide

## 1. Overview

This implementation guide outlines the development of a new Interview Practice module for the OBS overlay application. The module will allow users to practice interview questions loaded from CSV files, with a simple UI for reviewing and managing questions.

## 2. File Structure

Create these files:

```
public/
├── css/
│   └── interview/
│       ├── base.css
│       ├── panels.css
│       └── controls.css
├── js/
│   └── interview/
│       ├── controllers/
│       │   └── interview-controller.js
│       ├── services/
│       │   └── question-service.js
│       └── utils/
│           └── csv-parser.js
├── pages/
│   └── interview/
│       └── index.html
server/
├── routes/
│   ├── api/
│   │   └── interview.js
│   └── pages.js (modify)
└── utils/
    └── interview/
        ├── csv-loader.js
        └── question-service.js
test/
└── unit/
    ├── routes/
    │   └── api/
    │       └── interview.test.js
    └── utils/
        └── interview/
            ├── csv-loader.test.js
            └── question-service.test.js
```

## 3. Backend Implementation

### 3.1 Create Server Route (`server/routes/api/interview.js`)

Create a new Express router for Interview API endpoints:
- GET `/api/interview/sets` - Get all question sets
- GET `/api/interview/sets/:setId` - Get a specific question set
- GET `/api/interview/questions/:questionId` - Get a specific question
- POST `/api/interview/questions` - Add a new question
- PUT `/api/interview/questions/:questionId` - Update a question
- DELETE `/api/interview/questions/:questionId` - Delete a question

```javascript
// server/routes/api/interview.js
const express = require('express');
const router = express.Router();
const questionService = require('../../utils/interview/question-service');

// Get all question sets
router.get('/sets', async (req, res) => {
    try {
        const sets = await questionService.getQuestionSets();
        res.json(sets);
    } catch (error) {
        console.error('Error fetching question sets:', error);
        res.status(500).json({ error: 'Failed to fetch question sets' });
    }
});

// Get a specific question set
router.get('/sets/:setId', async (req, res) => {
    try {
        const set = await questionService.getQuestionSet(req.params.setId);
        if (!set) {
            return res.status(404).json({ error: 'Question set not found' });
        }
        res.json(set);
    } catch (error) {
        console.error(`Error fetching question set ${req.params.setId}:`, error);
        res.status(500).json({ error: 'Failed to fetch question set' });
    }
});

// Get a specific question
router.get('/questions/:questionId', async (req, res) => {
    try {
        const question = await questionService.getQuestion(req.params.questionId);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        console.error(`Error fetching question ${req.params.questionId}:`, error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// Add a new question
router.post('/questions', async (req, res) => {
    try {
        const newQuestion = await questionService.addQuestion(req.body);
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Failed to add question' });
    }
});

// Update a question
router.put('/questions/:questionId', async (req, res) => {
    try {
        const updatedQuestion = await questionService.updateQuestion(
            req.params.questionId,
            req.body
        );
        if (!updatedQuestion) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(updatedQuestion);
    } catch (error) {
        console.error(`Error updating question ${req.params.questionId}:`, error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

// Delete a question
router.delete('/questions/:questionId', async (req, res) => {
    try {
        const success = await questionService.deleteQuestion(req.params.questionId);
        if (!success) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting question ${req.params.questionId}:`, error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

module.exports = router;
```

### 3.2 Create CSV Loader (`server/utils/interview/csv-loader.js`)

Implement a CSV loader that can read questions from CSV files:

```javascript
// server/utils/interview/csv-loader.js
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * CSV Loader for Interview Questions
 * Handles loading and parsing CSV files from the data/qa directory
 */
const csvLoader = {
    /**
     * Get list of all available CSV files in the data/qa directory
     * @returns {Promise<Array>} Array of CSV file metadata
     */
    getAvailableCsvFiles: async function() {
        try {
            const qaDir = path.join(__dirname, '../../../data/qa');
            const files = await fs.readdir(qaDir);
            
            // Filter for CSV files and create metadata objects
            const csvFiles = await Promise.all(files
                .filter(file => file.toLowerCase().endsWith('.csv'))
                .map(async (file) => {
                    const filePath = path.join(qaDir, file);
                    const stats = await fs.stat(filePath);
                    
                    return {
                        id: file.replace('.csv', ''),
                        name: file,
                        path: filePath,
                        modified: stats.mtime,
                        size: stats.size
                    };
                }));
            
            return csvFiles;
        } catch (error) {
            console.error('Error scanning for CSV files:', error);
            return [];
        }
    },
    
    /**
     * Load and parse a specific CSV file
     * @param {string} fileId - ID of the CSV file to load
     * @returns {Promise<Array>} Array of parsed questions
     */
    loadCsvFile: async function(fileId) {
        try {
            const qaDir = path.join(__dirname, '../../../data/qa');
            const filePath = path.join(qaDir, `${fileId}.csv`);
            
            // Read file
            const content = await fs.readFile(filePath, 'utf8');
            
            // Parse CSV
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
            
            // Convert to question objects
            const questions = records.map((record, index) => ({
                id: `${fileId}-${index}`,
                setId: fileId,
                question: record.Question || '',
                category: record.Category || '',
                difficulty: record.Difficulty || 'Medium',
                tags: record.Tags ? record.Tags.split(',').map(tag => tag.trim()) : []
            }));
            
            return questions;
        } catch (error) {
            console.error(`Error loading CSV file ${fileId}:`, error);
            return [];
        }
    },
    
    /**
     * Save questions back to a CSV file
     * @param {string} fileId - ID of the CSV file to save to
     * @param {Array} questions - Array of question objects to save
     * @returns {Promise<boolean>} Success status
     */
    saveCsvFile: async function(fileId, questions) {
        try {
            const qaDir = path.join(__dirname, '../../../data/qa');
            const filePath = path.join(qaDir, `${fileId}.csv`);
            
            // Convert questions to CSV format
            const headers = ['Question', 'Category', 'Difficulty', 'Tags'];
            
            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            
            // Add each question as a row
            questions.forEach(question => {
                const row = [
                    `"${question.question.replace(/"/g, '""')}"`,
                    `"${question.category || ''}"`,
                    `"${question.difficulty || 'Medium'}"`,
                    `"${(question.tags || []).join(',')}"`,
                ];
                csvContent += row.join(',') + '\n';
            });
            
            // Write to file
            await fs.writeFile(filePath, csvContent, 'utf8');
            
            return true;
        } catch (error) {
            console.error(`Error saving CSV file ${fileId}:`, error);
            return false;
        }
    }
};

module.exports = csvLoader;
```

### 3.3 Create Question Service (`server/utils/interview/question-service.js`)

Implement a service to manage interview questions:

```javascript
// server/utils/interview/question-service.js
const csvLoader = require('./csv-loader');

/**
 * Question Service
 * Manages interview question data and operations
 */
const questionService = {
    // In-memory cache of question sets
    questionSets: {},
    
    /**
     * Get all available question sets
     * @returns {Promise<Array>} List of question sets
     */
    getQuestionSets: async function() {
        try {
            // Get CSV files
            const csvFiles = await csvLoader.getAvailableCsvFiles();
            
            // Return as question sets
            return csvFiles.map(file => ({
                id: file.id,
                name: file.name.replace('.csv', ''),
                lastModified: file.modified,
                size: file.size
            }));
        } catch (error) {
            console.error('Error getting question sets:', error);
            return [];
        }
    },
    
    /**
     * Get a specific question set with all questions
     * @param {string} setId - ID of the question set
     * @returns {Promise<Object>} Question set with questions
     */
    getQuestionSet: async function(setId) {
        try {
            // Check cache first
            if (this.questionSets[setId]) {
                return this.questionSets[setId];
            }
            
            // Load questions from CSV
            const questions = await csvLoader.loadCsvFile(setId);
            
            if (questions.length === 0) {
                return null;
            }
            
            // Create set object
            const questionSet = {
                id: setId,
                name: setId,
                questions
            };
            
            // Cache for future use
            this.questionSets[setId] = questionSet;
            
            return questionSet;
        } catch (error) {
            console.error(`Error getting question set ${setId}:`, error);
            return null;
        }
    },
    
    /**
     * Get a specific question by ID
     * @param {string} questionId - ID of the question (format: setId-index)
     * @returns {Promise<Object>} Question object
     */
    getQuestion: async function(questionId) {
        try {
            // Parse setId from questionId
            const [setId, index] = questionId.split('-');
            
            // Get the question set
            const set = await this.getQuestionSet(setId);
            
            if (!set) {
                return null;
            }
            
            // Find the question by index
            const question = set.questions.find(q => q.id === questionId);
            
            return question || null;
        } catch (error) {
            console.error(`Error getting question ${questionId}:`, error);
            return null;
        }
    },
    
    /**
     * Add a new question to a set
     * @param {Object} questionData - Question data
     * @returns {Promise<Object>} Newly created question
     */
    addQuestion: async function(questionData) {
        try {
            const { setId } = questionData;
            
            // Get the question set
            let set = await this.getQuestionSet(setId);
            
            if (!set) {
                return null;
            }
            
            // Create new question
            const newQuestion = {
                id: `${setId}-${set.questions.length}`,
                setId,
                question: questionData.question || '',
                category: questionData.category || '',
                difficulty: questionData.difficulty || 'Medium',
                tags: questionData.tags || []
            };
            
            // Add to set
            set.questions.push(newQuestion);
            
            // Save to CSV
            await csvLoader.saveCsvFile(setId, set.questions);
            
            return newQuestion;
        } catch (error) {
            console.error('Error adding question:', error);
            return null;
        }
    },
    
    /**
     * Update an existing question
     * @param {string} questionId - ID of the question to update
     * @param {Object} questionData - Updated question data
     * @returns {Promise<Object>} Updated question
     */
    updateQuestion: async function(questionId, questionData) {
        try {
            // Parse setId from questionId
            const [setId, index] = questionId.split('-');
            
            // Get the question set
            const set = await this.getQuestionSet(setId);
            
            if (!set) {
                return null;
            }
            
            // Find the question
            const questionIndex = set.questions.findIndex(q => q.id === questionId);
            
            if (questionIndex === -1) {
                return null;
            }
            
            // Update question
            set.questions[questionIndex] = {
                ...set.questions[questionIndex],
                question: questionData.question || set.questions[questionIndex].question,
                category: questionData.category || set.questions[questionIndex].category,
                difficulty: questionData.difficulty || set.questions[questionIndex].difficulty,
                tags: questionData.tags || set.questions[questionIndex].tags
            };
            
            // Save to CSV
            await csvLoader.saveCsvFile(setId, set.questions);
            
            return set.questions[questionIndex];
        } catch (error) {
            console.error(`Error updating question ${questionId}:`, error);
            return null;
        }
    },
    
    /**
     * Delete a question
     * @param {string} questionId - ID of the question to delete
     * @returns {Promise<boolean>} Success status
     */
    deleteQuestion: async function(questionId) {
        try {
            // Parse setId from questionId
            const [setId, index] = questionId.split('-');
            
            // Get the question set
            const set = await this.getQuestionSet(setId);
            
            if (!set) {
                return false;
            }
            
            // Find and remove the question
            const questionIndex = set.questions.findIndex(q => q.id === questionId);
            
            if (questionIndex === -1) {
                return false;
            }
            
            // Remove question
            set.questions.splice(questionIndex, 1);
            
            // Update IDs for all subsequent questions
            for (let i = questionIndex; i < set.questions.length; i++) {
                set.questions[i].id = `${setId}-${i}`;
            }
            
            // Save to CSV
            await csvLoader.saveCsvFile(setId, set.questions);
            
            return true;
        } catch (error) {
            console.error(`Error deleting question ${questionId}:`, error);
            return false;
        }
    }
};

module.exports = questionService;
```

### 3.4 Update Page Routes (`server/routes/pages.js`)

Add the Interview module route to the existing page routes:

```javascript
// Add this after the existing routes but before the module.exports line

// Interview practice route
router.get('/interview', (req, res) => {
  console.log('Interview practice page requested');
  try {
    const filePath = path.join(__dirname, '../../public/pages/interview/index.html');
    console.log('Attempting to serve file:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving Interview practice page:', error);
    res.status(500).send('Error loading Interview practice page');
  }
});
```

## 4. Frontend Implementation

### 4.1 Create HTML Page (`public/pages/interview/index.html`)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Interview Practice - OBS Hardware Overlay</title>
  
  <!-- Base styles -->
  <link rel="stylesheet" href="../../css/base/reset.css">
  <link rel="stylesheet" href="../../css/base/global.css">
  
  <!-- Navigation styles -->
  <link rel="stylesheet" href="../../css/navigation/main-nav.css">
  <link rel="stylesheet" href="../../css/navigation/controls.css">
  
  <!-- Interview practice styles -->
  <link rel="stylesheet" href="../../css/interview/base.css">
  <link rel="stylesheet" href="../../css/interview/panels.css">
  <link rel="stylesheet" href="../../css/interview/controls.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="main-nav">
    <ul>
      <li><a href="#" onclick="navigateTo('/')">Dashboard</a></li>
      <li><a href="#" onclick="navigateTo('/cpu')">CPU Stats</a></li>
      <li><a href="#" onclick="navigateTo('/gpu')">GPU Stats</a></li>
      <li><a href="#" onclick="navigateTo('/system')">System Info</a></li>
      <li><a href="#" onclick="navigateTo('/svg')">SVG Overlay</a></li>
      <li><a href="#" onclick="navigateTo('/bigquery')">BigQuery</a></li>
      <li><a href="#" class="active" onclick="navigateTo('/interview')">Interview Practice</a></li>
      <li><a href="#" onclick="navigateTo('/settings')">Settings</a></li>
    </ul>
  </nav>
  
  <div class="container">
    <div class="close-btn" onclick="toggleNavMenu()">≡</div>
    
    <!-- Question Sets Panel -->
    <div id="int-sets-panel" class="int-panel int-sets-panel">
      <div class="panel-title">Question Sets</div>
      <div id="question-sets" class="list-container">
        <div class="empty-state">No question sets loaded</div>
      </div>
      <button id="load-sets-btn" class="action-button">Load Question Sets</button>
    </div>

    <!-- Current Question Panel -->
    <div id="int-question-panel" class="int-panel int-question-panel">
      <div class="panel-title">Current Question</div>
      <div id="current-question" class="question-container">
        <div class="empty-state">Select a question set to begin</div>
      </div>
      <div class="navigation-controls">
        <button id="prev-question-btn" class="nav-button" disabled>Previous</button>
        <span id="question-counter" class="counter">0/0</span>
        <button id="next-question-btn" class="nav-button" disabled>Next</button>
      </div>
    </div>

    <!-- Question Editor Panel -->
    <div id="int-editor-panel" class="int-panel int-editor-panel">
      <div class="panel-title">Question Editor</div>
      <div id="question-editor" class="editor-container">
        <form id="question-form">
          <div class="form-group">
            <label for="question-text">Question:</label>
            <textarea id="question-text" rows="4" placeholder="Enter question..."></textarea>
          </div>
          <div class="form-group">
            <label for="question-category">Category:</label>
            <input type="text" id="question-category" placeholder="Category">
          </div>
          <div class="form-group">
            <label for="question-difficulty">Difficulty:</label>
            <select id="question-difficulty">
              <option value="Easy">Easy</option>
              <option value="Medium" selected>Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div class="form-group">
            <label for="question-tags">Tags (comma-separated):</label>
            <input type="text" id="question-tags" placeholder="Tag1, Tag2, ...">
          </div>
          <div class="button-group">
            <button type="button" id="save-question-btn" class="action-button">Save</button>
            <button type="button" id="new-question-btn" class="action-button">New</button>
            <button type="button" id="delete-question-btn" class="action-button danger">Delete</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Hardware Controls Bar -->
  <div class="hardware-controls">
    <button id="show-all-btn">Show All</button>
    <button id="hide-all-btn">Hide All</button>
    <button id="show-sets-btn">Sets Only</button>
    <button id="show-question-btn">Question Only</button>
    <button id="show-editor-btn">Editor Only</button>
    <button id="toggle-controls-btn">≡</button>
  </div>
  <div id="show-controls-btn" style="display: none;">≡</div>

  <!-- Core Scripts -->
  <script src="../../js/navigation.js"></script>
  
  <!-- Interview Practice Scripts -->
  <script src="../../js/interview/utils/csv-parser.js"></script>
  <script src="../../js/interview/services/question-service.js"></script>
  <script src="../../js/interview/controllers/interview-controller.js"></script>
</body>
</html>
```

### 4.2 Create CSS Files

#### 4.2.1 Base CSS (`public/css/interview/base.css`)

```css
/* Base styles for Interview Practice feature */

/* Main content area */
.int-content {
  margin-top: 60px;
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: visible;
}

/* Panel styles */
.int-panel {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(66, 133, 244, 0.7);
  padding: 15px;
  margin: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Panel positioning */
.int-sets-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 250px;
}

.int-question-panel {
  position: absolute;
  top: 20px;
  left: 290px;
  width: 500px;
}

.int-editor-panel {
  position: absolute;
  top: 300px;
  left: 290px;
  width: 500px;
}

/* Panel title styles */
.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

/* Empty state message */
.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
}

/* Light theme mode toggle */
.theme-toggle {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
}

.theme-toggle:hover {
  color: rgba(255, 255, 255, 1);
}
```

#### 4.2.2 Panels CSS (`public/css/interview/panels.css`)

```css
/* Panel styles for Interview Practice panels */

/* Question sets list */
.list-container {
  max-height: 300px;
  overflow-y: auto;
  background: rgba(30, 34, 42, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
  margin-top: 10px;
}

.set-item {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.set-item:hover {
  background: rgba(66, 133, 244, 0.3);
}

.set-item.selected {
  background: rgba(66, 133, 244, 0.5);
}

.set-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
}

.set-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* Current question display */
.question-container {
  background: rgba(30, 34, 42, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
  margin-top: 10px;
  padding: 15px;
  min-height: 150px;
}

.question-text {
  font-size: 16px;
  margin-bottom: 15px;
  line-height: 1.5;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.question-category {
  background: rgba(66, 133, 244, 0.3);
  padding: 3px 8px;
  border-radius: 12px;
  margin-right: 8px;
}

.question-difficulty {
  padding: 3px 8px;
  border-radius: 12px;
}

.difficulty-easy {
  background: rgba(52, 168, 83, 0.3);
}

.difficulty-medium {
  background: rgba(251, 188, 4, 0.3);
}

.difficulty-hard {
  background: rgba(234, 67, 53, 0.3);
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.question-tag {
  background: rgba(75, 75, 75, 0.5);
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 5px;
  margin-bottom: 5px;
  font-size: 11px;
}

/* Navigation controls */
.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.counter {
  font-size: 14px;
  color: #fff;
}

/* Question editor */
.editor-container {
  background: rgba(30, 34, 42, 0.8);
  border: 1px solid #444;
  border-radius: 4px;
  margin-top: 10px;
  padding: 15px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.button-group button {
  flex: 1;
  margin-right: 10px;
}

.button-group button:last-child {
  margin-right: 0;
}

.action-button.danger {
  background: rgba(234, 67, 53, 0.7);
}

.action-button.danger:hover {
  background: rgba(234, 67, 53, 0.9);
}
```

#### 4.2.3 Controls CSS (`public/css/interview/controls.css`)

```css
/* Control styles for Interview Practice feature */

/* Action button */
.action-button {
  background: rgba(66, 133, 244, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  margin-top: 10px;
  cursor: pointer;
  width: 100%;
}

.action-button:hover {
  background: rgba(66, 133, 244, 0.9);
}

.action-button:disabled {
  background: rgba(100, 100, 100, 0.5);
  cursor: not-allowed;
}

/* Navigation buttons */
.nav-button {
  background: rgba(66, 133, 244, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.nav-button:hover {
  background: rgba(66, 133, 244, 0.9);
}

.nav-button:disabled {
  background: rgba(100, 100, 100, 0.5);
  cursor: not-allowed;
}

/* Filter controls */
.filter-controls {
  display: flex;
  margin-top: 10px;
}

.filter-dropdown {
  flex: 1;
  margin-right: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px;
  border-radius: 4px;
  font-size: 12px;
}

.filter-dropdown:last-child {
  margin-right: 0;
}

/* Search box */
.search-box {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 10px;
}

/* Panel footer */
.panel-footer {
  margin-top: 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
}

.refresh-timestamp {
  font-style: italic;
}
```

### 4.3 Create Frontend JavaScript Files

#### 4.3.1 CSV Parser Utility (`public/js/interview/utils/csv-parser.js`)

```javascript
/**
 * CSV Parser Utility for Interview Practice
 * Provides client-side CSV parsing functionality
 */
window.CSVParser = {
    /**
     * Parse CSV string into array of objects
     * @param {string} csvContent - CSV content to parse
     * @param {Object} options - Parsing options
     * @returns {Array} Array of objects representing CSV rows
     */
    parse: function(csvContent, options = {}) {
        const defaults = {
            delimiter: ',',
            headers: true,
            trimValues: true
        };
        
        const settings = { ...defaults, ...options };
        
        // Split into lines
        const lines = csvContent.split(/\r?\n/);
        
        // Get headers
        let headers = [];
        if (settings.headers) {
            if (lines.length === 0) return [];
            
            const headerLine = lines.shift();
            headers = this._splitCSVLine(headerLine, settings.delimiter);
            
            if (settings.trimValues) {
                headers = headers.map(h => h.trim());
            }
        }
        
        // Parse rows
        return lines
            .filter(line => line.trim() !== '')
            .map(line => {
                const values = this._splitCSVLine(line, settings.delimiter);
                
                if (settings.trimValues) {
                    values = values.map(v => v.trim());
                }
                
                if (settings.headers) {
                    // Convert to object with headers as keys
                    const row = {};
                    headers.forEach((header, i) => {
                        row[header] = values[i] || '';
                    });
                    return row;
                } else {
                    return values;
                }
            });
    },
    
    /**
     * Convert array of objects to CSV string
     * @param {Array} data - Array of objects to convert
     * @param {Object} options - Conversion options
     * @returns {string} CSV string
     */
    stringify: function(data, options = {}) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const defaults = {
            delimiter: ',',
            headers: true
        };
        
        const settings = { ...defaults, ...options };
        
        // Get all possible headers from all objects
        const headers = settings.headers === true ?
            [...new Set(data.flatMap(obj => Object.keys(obj)))] :
            settings.headers;
        
        // Start with headers row
        let csv = headers.join(settings.delimiter) + '\n';
        
        // Add each data row
        data.forEach(obj => {
            const row = headers.map(header => {
                const value = obj[header] || '';
                // Handle strings with commas or quotes by wrapping in quotes
                if (typeof value === 'string' && (value.includes(settings.delimiter) || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            
            csv += row.join(settings.delimiter) + '\n';
        });
        
        return csv;
    },
    
    /**
     * Split CSV line handling quoted values
     * @private
     * @param {string} line - CSV line to split
     * @param {string} delimiter - Delimiter character
     * @returns {Array} Array of values
     */
    _splitCSVLine: function(line, delimiter) {
        const result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1] || '';
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Double quotes inside quotes - add single quote
                    currentValue += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quotes mode
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                // End of value
                result.push(currentValue);
                currentValue = '';
            } else {
                // Normal character
                currentValue += char;
            }
        }
        
        // Add the last value
        result.push(currentValue);
        
        return result;
    }
};
```

#### 4.3.2 Question Service (`public/js/interview/services/question-service.js`)

```javascript
/**
 * Question Service for Interview Practice
 * Handles fetching and managing interview questions
 */
window.QuestionService = {
    // Cache for question sets
    questionSets: {},
    
    // Current active state
    currentSetId: null,
    currentQuestionIndex: -1,
    
    /**
     * Fetch all available question sets
     * @param {Function} callback - Callback function with results
     */
    fetchQuestionSets: function(callback) {
        console.log('Fetching question sets');
        fetch('/api/interview/sets')
            .then(response => response.json())
            .then(data => {
                console.log('Question sets fetched:', data);
                callback(data);
            })
            .catch(error => {
                console.error('Error fetching question sets:', error);
                callback(null);
            });
    },
    
    /**
     * Fetch a specific question set
     * @param {string} setId - Question set ID
     * @param {Function} callback - Callback function with results
     */
    fetchQuestionSet: function(setId, callback) {
        console.log(`Fetching question set: ${setId}`);
        
        // Check cache first
        if (this.questionSets[setId]) {
            console.log(`Using cached question set: ${setId}`);
            callback(this.questionSets[setId]);
            return;
        }
        
        fetch(`/api/interview/sets/${setId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Question set fetched:', data);
                
                // Cache for future use
                this.questionSets[setId] = data;
                
                callback(data);
            })
            .catch(error => {
                console.error(`Error fetching question set ${setId}:`, error);
                callback(null);
            });
    },
    
    /**
     * Get current question from active set
     * @returns {Object|null} Current question or null if none selected
     */
    getCurrentQuestion: function() {
        if (!this.currentSetId || this.currentQuestionIndex < 0) {
            return null;
        }
        
        const set = this.questionSets[this.currentSetId];
        if (!set || !set.questions || set.questions.length === 0) {
            return null;
        }
        
        return set.questions[this.currentQuestionIndex];
    },
    
    /**
     * Set the active question set and initialize to first question
     * @param {string} setId - Question set ID
     * @param {Function} callback - Callback when complete
     */
    setActiveQuestionSet: function(setId, callback) {
        this.fetchQuestionSet(setId, (set) => {
            if (!set) {
                callback(false);
                return;
            }
            
            this.currentSetId = setId;
            this.currentQuestionIndex = set.questions.length > 0 ? 0 : -1;
            
            callback(true);
        });
    },
    
    /**
     * Move to the next question in the active set
     * @returns {Object|null} Next question or null if at end
     */
    nextQuestion: function() {
        if (!this.currentSetId) {
            return null;
        }
        
        const set = this.questionSets[this.currentSetId];
        if (!set || !set.questions || set.questions.length === 0) {
            return null;
        }
        
        if (this.currentQuestionIndex < set.questions.length - 1) {
            this.currentQuestionIndex++;
            return this.getCurrentQuestion();
        }
        
        return null;
    },
    
    /**
     * Move to the previous question in the active set
     * @returns {Object|null} Previous question or null if at beginning
     */
    previousQuestion: function() {
        if (!this.currentSetId) {
            return null;
        }
        
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return this.getCurrentQuestion();
        }
        
        return null;
    },
    
    /**
     * Get the current position information
     * @returns {Object} Object with current index and total count
     */
    getPosition: function() {
        if (!this.currentSetId) {
            return { current: 0, total: 0 };
        }
        
        const set = this.questionSets[this.currentSetId];
        if (!set || !set.questions) {
            return { current: 0, total: 0 };
        }
        
        return {
            current: this.currentQuestionIndex + 1,
            total: set.questions.length
        };
    },
    
    /**
     * Add a new question to the current set
     * @param {Object} questionData - Question data
     * @param {Function} callback - Callback with new question
     */
    addQuestion: function(questionData, callback) {
        if (!this.currentSetId) {
            callback(null);
            return;
        }
        
        const data = {
            ...questionData,
            setId: this.currentSetId
        };
        
        fetch('/api/interview/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(newQuestion => {
                console.log('Question added:', newQuestion);
                
                // Update cache
                if (this.questionSets[this.currentSetId]) {
                    this.questionSets[this.currentSetId].questions.push(newQuestion);
                }
                
                // Set new question as current
                this.currentQuestionIndex = this.questionSets[this.currentSetId].questions.length - 1;
                
                callback(newQuestion);
            })
            .catch(error => {
                console.error('Error adding question:', error);
                callback(null);
            });
    },
    
    /**
     * Update the current question
     * @param {Object} questionData - Updated question data
     * @param {Function} callback - Callback with updated question
     */
    updateCurrentQuestion: function(questionData, callback) {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) {
            callback(null);
            return;
        }
        
        fetch(`/api/interview/questions/${currentQuestion.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        })
            .then(response => response.json())
            .then(updatedQuestion => {
                console.log('Question updated:', updatedQuestion);
                
                // Update cache
                if (this.questionSets[this.currentSetId]) {
                    const index = this.questionSets[this.currentSetId].questions.findIndex(
                        q => q.id === currentQuestion.id
                    );
                    
                    if (index !== -1) {
                        this.questionSets[this.currentSetId].questions[index] = updatedQuestion;
                    }
                }
                
                callback(updatedQuestion);
            })
            .catch(error => {
                console.error(`Error updating question ${currentQuestion.id}:`, error);
                callback(null);
            });
    },
    
    /**
     * Delete the current question
     * @param {Function} callback - Callback with success status
     */
    deleteCurrentQuestion: function(callback) {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) {
            callback(false);
            return;
        }
        
        fetch(`/api/interview/questions/${currentQuestion.id}`, {
            method: 'DELETE'
        })
            .then(response => {
                console.log(`Question ${currentQuestion.id} deleted`);
                
                // Update cache
                if (this.questionSets[this.currentSetId]) {
                    this.questionSets[this.currentSetId].questions = 
                        this.questionSets[this.currentSetId].questions.filter(
                            q => q.id !== currentQuestion.id
                        );
                    
                    // Adjust current index
                    if (this.currentQuestionIndex >= this.questionSets[this.currentSetId].questions.length) {
                        this.currentQuestionIndex = Math.max(0, this.questionSets[this.currentSetId].questions.length - 1);
                    }
                }
                
                callback(true);
            })
            .catch(error => {
                console.error(`Error deleting question ${currentQuestion.id}:`, error);
                callback(false);
            });
    }
};
```

#### 4.3.3 Interview Controller (`public/js/interview/controllers/interview-controller.js`)

```javascript
/**
 * Interview Practice Controller
 * Handles UI interactions for the interview practice feature
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Interview practice controller initializing');
    
    // DOM Elements
    const setsPanel = document.getElementById('int-sets-panel');
    const questionPanel = document.getElementById('int-question-panel');
    const editorPanel = document.getElementById('int-editor-panel');
    const questionSets = document.getElementById('question-sets');
    const currentQuestion = document.getElementById('current-question');
    const questionEditor = document.getElementById('question-editor');
    
    // Buttons
    const loadSetsBtn = document.getElementById('load-sets-btn');
    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const saveQuestionBtn = document.getElementById('save-question-btn');
    const newQuestionBtn = document.getElementById('new-question-btn');
    const deleteQuestionBtn = document.getElementById('delete-question-btn');
    
    // Form elements
    const questionText = document.getElementById('question-text');
    const questionCategory = document.getElementById('question-category');
    const questionDifficulty = document.getElementById('question-difficulty');
    const questionTags = document.getElementById('question-tags');
    
    // Counter
    const questionCounter = document.getElementById('question-counter');
    
    // Initialize controller
    function init() {
        setupEventListeners();
        loadQuestionSets();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Question set loading
        if (loadSetsBtn) {
            loadSetsBtn.addEventListener('click', loadQuestionSets);
        }
        
        // Navigation
        if (prevQuestionBtn) {
            prevQuestionBtn.addEventListener('click', showPreviousQuestion);
        }
        
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', showNextQuestion);
        }
        
        // Question editing
        if (saveQuestionBtn) {
            saveQuestionBtn.addEventListener('click', saveQuestion);
        }
        
        if (newQuestionBtn) {
            newQuestionBtn.addEventListener('click', createNewQuestion);
        }
        
        if (deleteQuestionBtn) {
            deleteQuestionBtn.addEventListener('click', deleteQuestion);
        }
        
        // Panel visibility controls
        document.querySelector('#show-all-btn').addEventListener('click', () => {
            setsPanel.style.display = 'block';
            questionPanel.style.display = 'block';
            editorPanel.style.display = 'block';
        });
        
        document.querySelector('#hide-all-btn').addEventListener('click', () => {
            setsPanel.style.display = 'none';
            questionPanel.style.display = 'none';
            editorPanel.style.display = 'none';
        });
        
        document.querySelector('#show-sets-btn').addEventListener('click', () => {
            setsPanel.style.display = 'block';
            questionPanel.style.display = 'none';
            editorPanel.style.display = 'none';
        });
        
        document.querySelector('#show-question-btn').addEventListener('click', () => {
            setsPanel.style.display = 'none';
            questionPanel.style.display = 'block';
            editorPanel.style.display = 'none';
        });
        
        document.querySelector('#show-editor-btn').addEventListener('click', () => {
            setsPanel.style.display = 'none';
            questionPanel.style.display = 'none';
            editorPanel.style.display = 'block';
        });
        
        // Toggle controls visibility
        const toggleControlsBtn = document.getElementById('toggle-controls-btn');
        const showControlsBtn = document.getElementById('show-controls-btn');
        const controlPanel = document.querySelector('.hardware-controls');

        if (toggleControlsBtn) {
            toggleControlsBtn.addEventListener('click', () => {
                controlPanel.style.display = 'none';
                showControlsBtn.style.display = 'flex';
            });
        }

        if (showControlsBtn) {
            showControlsBtn.addEventListener('click', () => {
                controlPanel.style.display = 'flex';
                showControlsBtn.style.display = 'none';
            });
        }
    }
    
    // Load question sets
    function loadQuestionSets() {
        if (loadSetsBtn) {
            loadSetsBtn.disabled = true;
            loadSetsBtn.textContent = 'Loading...';
        }
        
        window.QuestionService.fetchQuestionSets(renderQuestionSets);
    }
    
    // Render question sets
    function renderQuestionSets(sets) {
        if (loadSetsBtn) {
            loadSetsBtn.disabled = false;
            loadSetsBtn.textContent = 'Refresh Sets';
        }
        
        if (!sets || !questionSets) return;
        
        if (sets.length === 0) {
            questionSets.innerHTML = '<div class="empty-state">No question sets available</div>';
            return;
        }
        
        let html = '';
        sets.forEach(set => {
            const isSelected = set.id === window.QuestionService.currentSetId;
            
            html += `
                <div class="set-item ${isSelected ? 'selected' : ''}" 
                     data-set-id="${set.id}"
                     onclick="selectQuestionSet('${set.id}')">
                    <div class="set-name">${set.name}</div>
                    <div class="set-info">
                        <span>Modified: ${new Date(set.lastModified).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });
        
        questionSets.innerHTML = html;
    }
    
    // Global function to select a question set
    window.selectQuestionSet = function(setId) {
        console.log(`Question set selected: ${setId}`);
        
        // Update UI to show selection
        const items = document.querySelectorAll('.set-item');
        items.forEach(item => {
            if (item.dataset.setId === setId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // Set active question set
        window.QuestionService.setActiveQuestionSet(setId, (success) => {
            if (success) {
                // Show first question
                const question = window.QuestionService.getCurrentQuestion();
                renderCurrentQuestion(question);
                updateQuestionForm(question);
                updateNavigationState();
            }
        });
    };
    
    // Render current question
    function renderCurrentQuestion(question) {
        if (!currentQuestion) return;
        
        if (!question) {
            currentQuestion.innerHTML = '<div class="empty-state">No question selected</div>';
            return;
        }
        
        // Format the difficulty class
        const difficultyClass = `difficulty-${question.difficulty.toLowerCase()}`;
        
        // Format tags
        const tagsHtml = question.tags && question.tags.length > 0
            ? `
                <div class="question-tags">
                    ${question.tags.map(tag => `<span class="question-tag">${tag}</span>`).join('')}
                </div>
              `
            : '';
        
        let html = `
            <div class="question-text">${question.question}</div>
            <div class="question-meta">
                <div>
                    <span class="question-category">${question.category || 'Uncategorized'}</span>
                    <span class="question-difficulty ${difficultyClass}">${question.difficulty}</span>
                </div>
            </div>
            ${tagsHtml}
        `;
        
        currentQuestion.innerHTML = html;
    }
    
    // Update the question form with current question data
    function updateQuestionForm(question) {
        if (!questionText || !questionCategory || !questionDifficulty || !questionTags) return;
        
        if (!question) {
            // Clear form
            questionText.value = '';
            questionCategory.value = '';
            questionDifficulty.value = 'Medium';
            questionTags.value = '';
            return;
        }
        
        // Fill form with question data
        questionText.value = question.question || '';
        questionCategory.value = question.category || '';
        questionDifficulty.value = question.difficulty || 'Medium';
        questionTags.value = question.tags ? question.tags.join(', ') : '';
    }
    
    // Update navigation button state and counter
    function updateNavigationState() {
        if (!prevQuestionBtn || !nextQuestionBtn || !questionCounter) return;
        
        const position = window.QuestionService.getPosition();
        
        // Update counter
        questionCounter.textContent = `${position.current}/${position.total}`;
        
        // Update button states
        prevQuestionBtn.disabled = position.current <= 1;
        nextQuestionBtn.disabled = position.current >= position.total;
    }
    
    // Show previous question
    function showPreviousQuestion() {
        const question = window.QuestionService.previousQuestion();
        renderCurrentQuestion(question);
        updateQuestionForm(question);
        updateNavigationState();
    }
    
    // Show next question
    function showNextQuestion() {
        const question = window.QuestionService.nextQuestion();
        renderCurrentQuestion(question);
        updateQuestionForm(question);
        updateNavigationState();
    }
    
    // Save current question
    function saveQuestion() {
        if (!questionText || !questionCategory || !questionDifficulty || !questionTags) return;
        
        // Get form data
        const questionData = {
            question: questionText.value,
            category: questionCategory.value,
            difficulty: questionDifficulty.value,
            tags: questionTags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        // Save question
        window.QuestionService.updateCurrentQuestion(questionData, (updatedQuestion) => {
            if (updatedQuestion) {
                renderCurrentQuestion(updatedQuestion);
                updateNavigationState();
                
                // Show feedback
                saveQuestionBtn.textContent = 'Saved!';
                setTimeout(() => {
                    saveQuestionBtn.textContent = 'Save';
                }, 1500);
            }
        });
    }
    
    // Create a new question
    function createNewQuestion() {
        if (!questionText || !questionCategory || !questionDifficulty || !questionTags) return;
        
        // Get form data
        const questionData = {
            question: questionText.value || 'New Question',
            category: questionCategory.value || '',
            difficulty: questionDifficulty.value || 'Medium',
            tags: questionTags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        // Add question
        window.QuestionService.addQuestion(questionData, (newQuestion) => {
            if (newQuestion) {
                renderCurrentQuestion(newQuestion);
                updateQuestionForm(newQuestion);
                updateNavigationState();
                
                // Show feedback
                newQuestionBtn.textContent = 'Added!';
                setTimeout(() => {
                    newQuestionBtn.textContent = 'New';
                }, 1500);
            }
        });
    }
    
    // Delete current question
    function deleteQuestion() {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }
        
        window.QuestionService.deleteCurrentQuestion((success) => {
            if (success) {
                // Show new current question
                const question = window.QuestionService.getCurrentQuestion();
                renderCurrentQuestion(question);
                updateQuestionForm(question);
                updateNavigationState();
                
                // Show feedback
                deleteQuestionBtn.textContent = 'Deleted!';
                setTimeout(() => {
                    deleteQuestionBtn.textContent = 'Delete';
                }, 1500);
            }
        });
    }
    
    // Initialize
    init();
});
```

## 5. Testing Strategy

### 5.1 Unit Tests for CSV Loader (`test/unit/utils/interview/csv-loader.test.js`)

```javascript
// test/unit/utils/interview/csv-loader.test.js
const fs = require('fs').promises;
const path = require('path');
const csvLoader = require('../../../../server/utils/interview/csv-loader');

// Mock fs.promises module
jest.mock('fs', () => ({
    promises: {
        readdir: jest.fn(),
        stat: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn()
    }
}));

// Mock path.join
jest.mock('path', () => ({
    join: jest.fn((dir, ...paths) => [...paths].join('/'))
}));

describe('CSV Loader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Default mocks
        fs.readdir.mockResolvedValue(['sample.csv', 'other.txt']);
        fs.stat.mockImplementation((filePath) => {
            if (filePath.includes('sample.csv')) {
                return Promise.resolve({
                    mtime: new Date(),
                    size: 1024
                });
            }
            return Promise.resolve({
                mtime: new Date(),
                size: 512
            });
        });
        fs.readFile.mockResolvedValue(
            'Question,Category,Difficulty,Tags\n' +
            '"Tell me about yourself","Background","Easy","intro, common"\n' +
            '"What are your strengths?","Skills","Medium","common, self-assessment"\n'
        );
        fs.writeFile.mockResolvedValue(undefined);
    });
    
    describe('getAvailableCsvFiles', () => {
        it('should return a list of CSV files', async () => {
            const files = await csvLoader.getAvailableCsvFiles();
            
            expect(fs.readdir).toHaveBeenCalled();
            expect(files.length).toBe(1);
            expect(files[0]).toHaveProperty('id', 'sample');
            expect(files[0]).toHaveProperty('name', 'sample.csv');
        });
        
        it('should handle directory read errors', async () => {
            fs.readdir.mockRejectedValue(new Error('Directory not found'));
            
            const files = await csvLoader.getAvailableCsvFiles();
            
            expect(files).toEqual([]);
        });
    });
    
    describe('loadCsvFile', () => {
        it('should parse a CSV file into question objects', async () => {
            const questions = await csvLoader.loadCsvFile('sample');
            
            expect(fs.readFile).toHaveBeenCalled();
            expect(questions.length).toBe(2);
            expect(questions[0]).toHaveProperty('question', 'Tell me about yourself');
            expect(questions[0]).toHaveProperty('category', 'Background');
            expect(questions[0]).toHaveProperty('difficulty', 'Easy');
            expect(questions[0]).toHaveProperty('tags');
            expect(questions[0].tags).toEqual(['intro', 'common']);
        });
        
        it('should handle file read errors', async () => {
            fs.readFile.mockRejectedValue(new Error('File not found'));
            
            const questions = await csvLoader.loadCsvFile('sample');
            
            expect(questions).toEqual([]);
        });
    });
    
    describe('saveCsvFile', () => {
        it('should save questions to a CSV file', async () => {
            const questions = [
                {
                    id: 'sample-0',
                    setId: 'sample',
                    question: 'Test question',
                    category: 'Test',
                    difficulty: 'Easy',
                    tags: ['test', 'sample']
                }
            ];
            
            const result = await csvLoader.saveCsvFile('sample', questions);
            
            expect(fs.writeFile).toHaveBeenCalled();
            expect(result).toBe(true);
            
            // Check that the CSV content was formatted correctly
            const writeCall = fs.writeFile.mock.calls[0];
            const csvContent = writeCall[1];
            
            expect(csvContent).toContain('Question,Category,Difficulty,Tags');
            expect(csvContent).toContain('"Test question","Test","Easy","test,sample"');
        });
        
        it('should handle write errors', async () => {
            fs.writeFile.mockRejectedValue(new Error('Write error'));
            
            const result = await csvLoader.saveCsvFile('sample', []);
            
            expect(result).toBe(false);
        });
    });
});
```

### 5.2 Unit Tests for Question Service (`test/unit/utils/interview/question-service.test.js`)

```javascript
// test/unit/utils/interview/question-service.test.js
const questionService = require('../../../../server/utils/interview/question-service');
const csvLoader = require('../../../../server/utils/interview/csv-loader');

// Mock the CSV loader
jest.mock('../../../../server/utils/interview/csv-loader', () => ({
    getAvailableCsvFiles: jest.fn(),
    loadCsvFile: jest.fn(),
    saveCsvFile: jest.fn()
}));

describe('Question Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset service state
        questionService.questionSets = {};
        
        // Setup default mocks
        csvLoader.getAvailableCsvFiles.mockResolvedValue([
            {
                id: 'sample',
                name: 'sample.csv',
                modified: new Date(),
                size: 1024
            }
        ]);
        
        csvLoader.loadCsvFile.mockResolvedValue([
            {
                id: 'sample-0',
                setId: 'sample',
                question: 'Test question 1',
                category: 'Test',
                difficulty: 'Easy',
                tags: ['test']
            },
            {
                id: 'sample-1',
                setId: 'sample',
                question: 'Test question 2',
                category: 'Test',
                difficulty: 'Medium',
                tags: ['test']
            }
        ]);
        
        csvLoader.saveCsvFile.mockResolvedValue(true