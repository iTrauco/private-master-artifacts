csvLoader.saveCsvFile.mockResolvedValue(true);
    });
    
    describe('getQuestionSets', () => {
        it('should return a list of question sets', async () => {
            const sets = await questionService.getQuestionSets();
            
            expect(csvLoader.getAvailableCsvFiles).toHaveBeenCalled();
            expect(sets.length).toBe(1);
            expect(sets[0]).toHaveProperty('id', 'sample');
            expect(sets[0]).toHaveProperty('name', 'sample');
        });
        
        it('should handle errors', async () => {
            csvLoader.getAvailableCsvFiles.mockRejectedValue(new Error('Test error'));
            
            const sets = await questionService.getQuestionSets();
            
            expect(sets).toEqual([]);
        });
    });
    
    describe('getQuestionSet', () => {
        it('should load and return a question set', async () => {
            const set = await questionService.getQuestionSet('sample');
            
            expect(csvLoader.loadCsvFile).toHaveBeenCalledWith('sample');
            expect(set).toHaveProperty('id', 'sample');
            expect(set).toHaveProperty('questions');
            expect(set.questions.length).toBe(2);
        });
        
        it('should use cached set if available', async () => {
            // Load once to cache
            await questionService.getQuestionSet('sample');
            
            // Reset mock to track new calls
            csvLoader.loadCsvFile.mockClear();
            
            // Load again
            const set = await questionService.getQuestionSet('sample');
            
            // Should not call loadCsvFile again
            expect(csvLoader.loadCsvFile).not.toHaveBeenCalled();
            expect(set).toHaveProperty('id', 'sample');
        });
        
        it('should return null for non-existent sets', async () => {
            csvLoader.loadCsvFile.mockResolvedValue([]);
            
            const set = await questionService.getQuestionSet('nonexistent');
            
            expect(set).toBeNull();
        });
    });
    
    describe('getQuestion', () => {
        it('should return a specific question', async () => {
            // Load set first
            await questionService.getQuestionSet('sample');
            
            const question = await questionService.getQuestion('sample-1');
            
            expect(question).toHaveProperty('id', 'sample-1');
            expect(question).toHaveProperty('question', 'Test question 2');
        });
        
        it('should return null for non-existent questions', async () => {
            const question = await questionService.getQuestion('nonexistent-0');
            
            expect(question).toBeNull();
        });
    });
    
    describe('addQuestion', () => {
        it('should add a question to a set', async () => {
            // Load set first
            await questionService.getQuestionSet('sample');
            
            const newQuestion = {
                setId: 'sample',
                question: 'New test question',
                category: 'Test',
                difficulty: 'Hard',
                tags: ['new', 'test']
            };
            
            const result = await questionService.addQuestion(newQuestion);
            
            expect(csvLoader.saveCsvFile).toHaveBeenCalled();
            expect(result).toHaveProperty('id', 'sample-2');
            expect(result).toHaveProperty('question', 'New test question');
            
            // Verify it was added to the cached set
            expect(questionService.questionSets['sample'].questions.length).toBe(3);
        });
        
        it('should return null if set does not exist', async () => {
            const result = await questionService.addQuestion({ setId: 'nonexistent' });
            
            expect(result).toBeNull();
        });
    });
    
    describe('updateQuestion', () => {
        it('should update an existing question', async () => {
            // Load set first
            await questionService.getQuestionSet('sample');
            
            const update = {
                question: 'Updated question',
                difficulty: 'Hard'
            };
            
            const result = await questionService.updateQuestion('sample-0', update);
            
            expect(csvLoader.saveCsvFile).toHaveBeenCalled();
            expect(result).toHaveProperty('question', 'Updated question');
            expect(result).toHaveProperty('difficulty', 'Hard');
            
            // Original fields should be preserved
            expect(result).toHaveProperty('category', 'Test');
        });
        
        it('should return null if question does not exist', async () => {
            const result = await questionService.updateQuestion('nonexistent-0', {});
            
            expect(result).toBeNull();
        });
    });
    
    describe('deleteQuestion', () => {
        it('should delete a question', async () => {
            // Load set first
            await questionService.getQuestionSet('sample');
            
            const result = await questionService.deleteQuestion('sample-0');
            
            expect(csvLoader.saveCsvFile).toHaveBeenCalled();
            expect(result).toBe(true);
            
            // Verify it was removed from the cached set
            expect(questionService.questionSets['sample'].questions.length).toBe(1);
            
            // Verify IDs were adjusted
            expect(questionService.questionSets['sample'].questions[0].id).toBe('sample-0');
        });
        
        it('should return false if question does not exist', async () => {
            const result = await questionService.deleteQuestion('nonexistent-0');
            
            expect(result).toBe(false);
        });
    });
});
```

### 5.3 API Route Tests (`test/unit/routes/api/interview.test.js`)

```javascript
// test/unit/routes/api/interview.test.js
const request = require('supertest');
const express = require('express');
const interviewRoutes = require('../../../../server/routes/api/interview');

// Mock the question-service module
jest.mock('../../../../server/utils/interview/question-service', () => ({
    getQuestionSets: jest.fn(),
    getQuestionSet: jest.fn(),
    getQuestion: jest.fn(),
    addQuestion: jest.fn(),
    updateQuestion: jest.fn(),
    deleteQuestion: jest.fn()
}));

describe('Interview API Routes', () => {
    let app;
    
    beforeEach(() => {
        // Create a fresh Express app and mount our routes for each test
        app = express();
        app.use(express.json());
        app.use('/', interviewRoutes);
        
        // Reset and setup mocks
        const questionService = require('../../../../server/utils/interview/question-service');
        
        questionService.getQuestionSets.mockResolvedValue([
            { id: 'set-1', name: 'Test Set 1' },
            { id: 'set-2', name: 'Test Set 2' }
        ]);
        
        questionService.getQuestionSet.mockImplementation((setId) => {
            if (setId === 'set-1') {
                return Promise.resolve({
                    id: 'set-1',
                    name: 'Test Set 1',
                    questions: [
                        {
                            id: 'set-1-0',
                            question: 'Test question'
                        }
                    ]
                });
            }
            return Promise.resolve(null);
        });
        
        questionService.getQuestion.mockImplementation((questionId) => {
            if (questionId === 'set-1-0') {
                return Promise.resolve({
                    id: 'set-1-0',
                    setId: 'set-1',
                    question: 'Test question'
                });
            }
            return Promise.resolve(null);
        });
        
        questionService.addQuestion.mockImplementation((questionData) => {
            return Promise.resolve({
                id: 'set-1-1',
                setId: 'set-1',
                ...questionData
            });
        });
        
        questionService.updateQuestion.mockImplementation((questionId, questionData) => {
            if (questionId === 'set-1-0') {
                return Promise.resolve({
                    id: 'set-1-0',
                    setId: 'set-1',
                    question: questionData.question || 'Test question'
                });
            }
            return Promise.resolve(null);
        });
        
        questionService.deleteQuestion.mockImplementation((questionId) => {
            return Promise.resolve(questionId === 'set-1-0');
        });
    });
    
    describe('GET /sets', () => {
        it('should return a list of question sets', async () => {
            const response = await request(app).get('/sets');
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            expect(response.body[0]).toHaveProperty('id', 'set-1');
        });
        
        it('should handle errors', async () => {
            const questionService = require('../../../../server/utils/interview/question-service');
            questionService.getQuestionSets.mockRejectedValue(new Error('Test error'));
            
            const response = await request(app).get('/sets');
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
    
    describe('GET /sets/:setId', () => {
        it('should return a specific question set', async () => {
            const response = await request(app).get('/sets/set-1');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'set-1');
            expect(response.body).toHaveProperty('questions');
            expect(response.body.questions.length).toBe(1);
        });
        
        it('should return 404 for non-existent sets', async () => {
            const response = await request(app).get('/sets/nonexistent');
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    
    describe('GET /questions/:questionId', () => {
        it('should return a specific question', async () => {
            const response = await request(app).get('/questions/set-1-0');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'set-1-0');
            expect(response.body).toHaveProperty('question', 'Test question');
        });
        
        it('should return 404 for non-existent questions', async () => {
            const response = await request(app).get('/questions/nonexistent');
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    
    describe('POST /questions', () => {
        it('should add a new question', async () => {
            const response = await request(app)
                .post('/questions')
                .send({
                    setId: 'set-1',
                    question: 'New question',
                    category: 'Test',
                    difficulty: 'Easy'
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 'set-1-1');
            expect(response.body).toHaveProperty('question', 'New question');
        });
        
        it('should handle errors', async () => {
            const questionService = require('../../../../server/utils/interview/question-service');
            questionService.addQuestion.mockRejectedValue(new Error('Test error'));
            
            const response = await request(app)
                .post('/questions')
                .send({
                    setId: 'set-1',
                    question: 'New question'
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
    
    describe('PUT /questions/:questionId', () => {
        it('should update a question', async () => {
            const response = await request(app)
                .put('/questions/set-1-0')
                .send({
                    question: 'Updated question'
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'set-1-0');
            expect(response.body).toHaveProperty('question', 'Updated question');
        });
        
        it('should return 404 for non-existent questions', async () => {
            const response = await request(app)
                .put('/questions/nonexistent')
                .send({
                    question: 'Updated question'
                });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    
    describe('DELETE /questions/:questionId', () => {
        it('should delete a question', async () => {
            const response = await request(app).delete('/questions/set-1-0');
            
            expect(response.status).toBe(204);
        });
        
        it('should return 404 for non-existent questions', async () => {
            const response = await request(app).delete('/questions/nonexistent');
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
});
```

## 6. Integration Steps

Follow these steps to implement the Interview Practice module:

1. Create the necessary directories for the file structure
2. Create the server-side files:
   - CSV loader utility
   - Question service
   - API routes
   - Update page routing
3. Create the client-side files:
   - HTML structure
   - CSS styling
   - JavaScript utilities, services, and controller
4. Create unit tests for the components
5. Test the integration with the existing application
6. Create sample CSV files in the data/qa directory

## 7. Deployment Check List

Before deploying the changes:

- [ ] Ensure all CSV files are properly formatted and accessible
- [ ] Verify all API endpoints are responding as expected
- [ ] Check that the UI is responsive and works on different screen sizes
- [ ] Test navigation between panels
- [ ] Test CRUD operations for questions
- [ ] Ensure error handling is robust
- [ ] Verify that the module integrates properly with the existing application
- [ ] Check that all unit tests pass
- [ ] Perform end-to-end testing of the complete workflow

## 8. Dependency Requirements

This module has the following dependencies:

- **Server-side**:
  - csv-parse: For parsing CSV files
  
- **Client-side**:
  - No additional external dependencies required

## 9. Security Considerations

- Validate all input from form submissions
- Sanitize question content before display to prevent XSS vulnerabilities
- Implement proper error handling to avoid information disclosure
- Consider implementing rate limiting for API requests
- Ensure proper file permissions for CSV files

## 10. Future Enhancements

Once the basic implementation is complete, consider these enhancements:

- Add filtering and sorting options for questions
- Implement question categories and tagging system
- Add a search functionality
- Create a practice mode with timers and scoring
- Add support for importing/exporting question sets
- Implement user progress tracking
- Add rich text formatting for questions and answers
