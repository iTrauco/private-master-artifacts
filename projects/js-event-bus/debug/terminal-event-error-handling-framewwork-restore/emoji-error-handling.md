# Emoji-Based Error Handling Patterns

This document provides patterns for implementing error handling with emoji-based visual patterns for improved error identification, categorization, and debugging.

## Error Type Indicators

```javascript
const ErrorTypes = {
  VALIDATION: '📋', // Form/input validation errors
  NETWORK: '🌐',    // Network-related errors
  DATABASE: '💾',   // Database errors
  AUTH: '🔒',       // Authentication/authorization errors
  PERMISSION: '🚫', // Permission denied errors
  TIMEOUT: '⏱️',    // Timeout errors
  RATE_LIMIT: '🚦', // Rate limiting errors
  SERVER: '🖥️',     // Server-side errors
  CLIENT: '📱',     // Client-side errors
  UNKNOWN: '❓',    // Unknown errors
};
```

## Error Severity Indicators

```javascript
const ErrorSeverity = {
  LOW: '🟢',      // Low severity - minor issue
  MEDIUM: '🟡',   // Medium severity - degraded experience
  HIGH: '🟠',     // High severity - significant impact
  CRITICAL: '🔴', // Critical severity - system failure
};
```

## Error Recovery Options

```javascript
const RecoveryOptions = {
  RETRY: '🔄',         // Can be retried
  REFRESH: '🔃',       // Page refresh may help
  CONTACT_SUPPORT: '👨‍💻', // Contact support
  SYSTEM_RESTART: '🔌', // System restart required
  SELF_HEALING: '🔧',   // System will auto-recover
  MANUAL_FIX: '🛠️',     // Manual intervention required
};
```

## Implementation Example

```javascript
class EmojiErrorHandler {
  constructor(options = {}) {
    this.appName = options.appName || 'App';
    this.logErrors = options.logErrors !== false;
    this.captureStackTrace = options.captureStackTrace !== false;
    this.logger = options.logger || console;
  }

  createError(type, message, details = {}, severity = ErrorSeverity.MEDIUM) {
    const errorTypeSymbol = ErrorTypes[type] || ErrorTypes.UNKNOWN;
    const error = new Error(`${errorTypeSymbol} ${message}`);
    
    // Add metadata
    error.type = type;
    error.details = details;
    error.severity = severity;
    error.timestamp = new Date();
    error.application = this.appName;
    
    if (this.captureStackTrace) {
      Error.captureStackTrace(error, this.createError);
    }
    
    if (this.logErrors) {
      this.logError(error);
    }
    
    return error;
  }
  
  logError(error) {
    const { type, severity, details, timestamp } = error;
    const typeEmoji = ErrorTypes[type] || ErrorTypes.UNKNOWN;
    
    this.logger.error(
      `${severity} ${typeEmoji} [${this.appName}] ${error.message}`,
      {
        type,
        details,
        timestamp,
        stack: error.stack
      }
    );
  }
  
  getRecoveryAction(error) {
    // Logic to determine recovery action based on error type
    switch(error.type) {
      case 'NETWORK':
        return RecoveryOptions.RETRY;
      case 'AUTH':
        return RecoveryOptions.REFRESH;
      case 'DATABASE':
        return this.isDatabaseConnectionError(error) 
          ? RecoveryOptions.RETRY 
          : RecoveryOptions.CONTACT_SUPPORT;
      default:
        return RecoveryOptions.CONTACT_SUPPORT;
    }
  }
  
  isDatabaseConnectionError(error) {
    // Implementation-specific logic
    return error.details.code === 'ECONNREFUSED';
  }
  
  // Factory methods for common errors
  validationError(message, details) {
    return this.createError('VALIDATION', message, details, ErrorSeverity.LOW);
  }
  
  networkError(message, details) {
    return this.createError('NETWORK', message, details, ErrorSeverity.MEDIUM);
  }
  
  authError(message, details) {
    return this.createError('AUTH', message, details, ErrorSeverity.HIGH);
  }
  
  serverError(message, details) {
    return this.createError('SERVER', message, details, ErrorSeverity.CRITICAL);
  }
}
```

## Error Handling in Code Sections

```javascript
// ⚠️ START: User authentication logic ⚠️
const errorHandler = new EmojiErrorHandler({ appName: 'AuthService' });

try {
  // Authentication logic
  if (!username) {
    throw errorHandler.validationError('Username is required', { field: 'username' });
  }
  
  if (!password) {
    throw errorHandler.validationError('Password is required', { field: 'password' });
  }
  
  const user = await authenticateUser(username, password);
  
  if (!user) {
    throw errorHandler.authError('Invalid credentials', { username });
  }
  
  return user;
} catch (error) {
  const recovery = errorHandler.getRecoveryAction(error);
  console.error(`Error occurred. Recommended action: ${recovery}`);
  throw error;
}
// ⛔ END: User authentication logic ⛔
```

## Client-Side Error Display

```javascript
function displayErrorToUser(error) {
  const errorContainer = document.getElementById('error-container');
  
  // Extract error type and severity
  const typeEmoji = error.message.substring(0, 2); // Extract emoji
  const severityEmoji = error.severity;
  const recoveryAction = getRecoveryAction(error);
  
  errorContainer.innerHTML = `
    <div class="error-alert severity-${error.type.toLowerCase()}">
      <div class="error-icon">${severityEmoji} ${typeEmoji}</div>
      <div class="error-content">
        <h3>${formatErrorType(error.type)}</h3>
        <p>${error.message.substring(2)}</p>
        <div class="error-recovery">
          ${recoveryAction} ${getRecoveryMessage(recoveryAction)}
        </div>
      </div>
    </div>
  `;
  
  errorContainer.style.display = 'block';
}

function getRecoveryMessage(recoveryAction) {
  switch(recoveryAction) {
    case RecoveryOptions.RETRY: return 'Try again';
    case RecoveryOptions.REFRESH: return 'Refresh the page';
    case RecoveryOptions.CONTACT_SUPPORT: return 'Contact support';
    default: return 'An error occurred';
  }
}

function formatErrorType(type) {
  return type.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ') + ' Error';
}
```

## API Error Response Format

```javascript
// Server-side API response with emoji error format
app.use((err, req, res, next) => {
  const errorHandler = new EmojiErrorHandler({ appName: 'API' });
  
  // Process the error
  const statusCode = getStatusCodeForError(err);
  const errorType = getErrorTypeForStatusCode(statusCode);
  const formattedError = errorHandler.createError(
    errorType,
    err.message || 'An unexpected error occurred',
    err.details || {},
    getErrorSeverityForStatusCode(statusCode)
  );
  
  // Send the response
  res.status(statusCode).json({
    success: false,
    error: {
      type: formattedError.type,
      message: formattedError.message,
      code: statusCode,
      severity: formattedError.severity,
      timestamp: formattedError.timestamp,
      requestId: req.id
    }
  });
});

function getStatusCodeForError(err) {
  if (err.statusCode) return err.statusCode;
  
  switch(err.type) {
    case 'VALIDATION': return 400;
    case 'AUTH': return 401;
    case 'PERMISSION': return 403;
    case 'RATE_LIMIT': return 429;
    case 'SERVER': return 500;
    default: return 500;
  }
}

function getErrorTypeForStatusCode(statusCode) {
  switch(true) {
    case statusCode < 400: return 'UNKNOWN';
    case statusCode < 500: return 'CLIENT';
    default: return 'SERVER';
  }
}

function getErrorSeverityForStatusCode(statusCode) {
  switch(true) {
    case statusCode < 400: return ErrorSeverity.LOW;
    case statusCode < 500: return ErrorSeverity.MEDIUM;
    case statusCode < 600: return ErrorSeverity.HIGH;
    default: return ErrorSeverity.CRITICAL;
  }
}
```

## Integrating with Event Bus Pattern

```javascript
// 🚨 START: Event bus error handling 🚨
class EventBus {
  constructor() {
    this.listeners = {};
    this.errorHandler = new EmojiErrorHandler({ appName: 'EventBus' });
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }
  
  off(event, callback) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  emit(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        // Enhance the error with event information
        const enhancedError = this.errorHandler.createError(
          'EVENT_BUS',
          `Error in handler for event '${event}'`,
          {
            originalError: error.message,
            event,
            eventData: data,
            handler: callback.name || 'anonymous'
          },
          ErrorSeverity.HIGH
        );
        
        // Emit the error event
        if (event !== 'error') {
          this.emit('error', enhancedError);
        } else {
          console.error('Error in error handler:', error);
        }
      }
    });
  }
}
// 🛑 END: Event bus error handling 🛑
```

## Benefits

1. **Visual Pattern Recognition**: Emojis make different error types instantly recognizable
2. **Severity Indication**: Clear visual indicators of error severity
3. **Recovery Guidance**: Built-in recovery instructions for users and developers
4. **Consistent Error Format**: Standardized approach across frontend, backend, and logs
5. **Improved Debugging**: Faster identification of error patterns and sources

## Implementation Considerations

1. **Backward Compatibility**: Ensure systems that consume errors can handle emoji characters
2. **Error Translation**: Consider how error messages with emojis should be translated
3. **Accessibility**: Provide alternative text for screen readers
4. **Documentation**: Keep a reference guide of error types and their meanings
5. **Error Tracking**: Verify that error tracking systems preserve the emoji information
