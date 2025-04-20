# OBS Hardware Overlay Testing Standards

## Overview

This document outlines the testing standards for the OBS Hardware Overlay Electron application. These standards ensure consistent, maintainable, and reliable tests that support our development process.

## Test Structure

- **Unit Tests**: Located in `test/unit/` directory
- **Integration Tests**: Located in `test/integration/` directory
- **Test files**: Named with `.test.js` suffix

## Important Considerations

### Running Tests With Active Server

The application is typically running during development, which means:

- **Tests should not create their own server instances** that bind to the same port (3000)
- **Integration tests should not require starting the actual server**
- Instead, tests should:
  - Mock necessary components
  - Use Express app instances without calling `listen()`
  - Mount routers directly for testing

### Mock Dependencies

- External system calls should be mocked (e.g., `os`, `child_process`)
- Use Jest's mocking capabilities: `jest.mock()`
- For hardware data, use consistent mock values rather than expecting exact values

## Test Examples

### Testing Utilities

```javascript
// Test for hardware utilities
describe('Hardware Info Utilities', () => {
  it('should return memory information with expected properties', async () => {
    const result = await getMemoryInfo();
    
    // Test for property existence
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('used');
    expect(result).toHaveProperty('percentage');
    
    // Test types and ranges
    expect(typeof result.total).toBe('number');
    expect(typeof result.used).toBe('number');
    expect(typeof result.percentage).toBe('number');
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });
});
```

### Testing API Routes

```javascript
// Test for API routes
describe('Hardware API Routes', () => {
  let app;
  
  beforeEach(() => {
    // Create a test app
    app = express();
    // Mount just the hardware routes
    app.use('/api/hardware', hardwareRoutes);
  });
  
  it('should handle API requests', async () => {
    const response = await request(app).get('/api/hardware');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cpu');
    expect(response.body).toHaveProperty('gpu');
    expect(response.body).toHaveProperty('ram');
  });
});
```

### Testing Page Routes

```javascript
// Test for page routes
describe('Page Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    
    // Mock res.sendFile to avoid actually sending files
    app.use((req, res, next) => {
      res.sendFile = jest.fn((filePath) => {
        res.status(200).send(`Would send file: ${filePath}`);
      });
      next();
    });
    
    app.use('/', pageRoutes);
  });
  
  it('should serve the dashboard page', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('dashboard.html');
  });
});
```

## Adding New Routes

When adding new routes:

1. Create the route in the appropriate module (e.g., `server/routes/api/new-feature.js`)
2. Add tests in a corresponding test file (e.g., `test/unit/routes/api/new-feature.test.js`)
3. Follow the pattern of creating an Express app and mounting just the router being tested
4. Test both successful responses and error handling

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest path/to/test-file.test.js
```

## Best Practices

1. **Keep tests independent** - Each test should run in isolation
2. **Focus on behavior, not implementation** - Test what the code does, not how it does it
3. **Test error handling** - Ensure your code handles errors gracefully
4. **Use descriptive test names** - Make it clear what each test is verifying
5. **Avoid testing exact values for hardware metrics** - They will naturally vary