/**
 * Structured Logger for AWS Lambda CloudWatch
 * Provides JSON-formatted logging for better CloudWatch analysis
 * 
 * Features:
 * - Structured JSON logging for CloudWatch Logs
 * - Security filtering of sensitive data
 * - Performance metrics tracking
 * - Environment-aware logging levels
 */

'use strict';

class Logger {
  /**
   * Log informational messages
   * @param {string} message - The message to log
   * @param {Object} metadata - Additional metadata to include
   */
  static info(message, metadata = {}) {
    console.log(JSON.stringify({
      level: 'info',
      service: process.env.SERVICE_NAME || 'unknown-service',
      version: process.env.SERVICE_VERSION || '1.0.0',
      message,
      ...metadata,
      timestamp: new Date().toISOString()
    }));
  }
  
  /**
   * Log error messages with stack trace
   * @param {string} message - The error message
   * @param {Error} error - The error object (optional)
   * @param {Object} metadata - Additional metadata
   */
  static error(message, error, metadata = {}) {
    console.log(JSON.stringify({
      level: 'error',
      service: process.env.SERVICE_NAME || 'unknown-service',
      version: process.env.SERVICE_VERSION || '1.0.0',
      message,
      error: error ? error.message : undefined,
      stack: error ? error.stack : undefined,
      ...metadata,
      timestamp: new Date().toISOString()
    }));
  }
  
  /**
   * Log warning messages
   * @param {string} message - The warning message
   * @param {Object} metadata - Additional metadata
   */
  static warn(message, metadata = {}) {
    console.log(JSON.stringify({
      level: 'warn',
      service: process.env.SERVICE_NAME || 'unknown-service',
      version: process.env.SERVICE_VERSION || '1.0.0',
      message,
      ...metadata,
      timestamp: new Date().toISOString()
    }));
  }
  
  /**
   * Log debug messages (only in non-production environments)
   * @param {string} message - The debug message
   * @param {Object} metadata - Additional metadata
   */
  static debug(message, metadata = {}) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify({
        level: 'debug',
        service: process.env.SERVICE_NAME || 'unknown-service',
        version: process.env.SERVICE_VERSION || '1.0.0',
        message,
        ...metadata,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  /**
   * Log incoming Lambda event with security filtering
   * @param {Object} event - The Lambda event object
   * @param {Object} options - Logging options
   * @param {boolean} options.includeBody - Whether to include request body (default: false)
   * @param {boolean} options.includeHeaders - Whether to include headers (default: false)
   */
  static logEvent(event, options = {}) {
    const { includeBody = false, includeHeaders = false } = options;
    
    const eventLog = {
      httpMethod: event.httpMethod,
      path: event.path,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
      requestId: event.requestContext?.requestId
    };
    
    if (includeHeaders && event.headers) {
      // Filter out sensitive headers
      const filteredHeaders = { ...event.headers };
      delete filteredHeaders.authorization;
      delete filteredHeaders.Authorization;
      delete filteredHeaders['x-api-key'];
      delete filteredHeaders['X-API-Key'];
      eventLog.headers = filteredHeaders;
    }
    
    if (includeBody && event.body) {
      try {
        // Don't log sensitive data
        const sanitizedBody = JSON.parse(event.body);
        delete sanitizedBody.password;
        delete sanitizedBody.currentPassword;
        delete sanitizedBody.newPassword;
        delete sanitizedBody.token;
        delete sanitizedBody.refreshToken;
        delete sanitizedBody.accessToken;
        eventLog.body = sanitizedBody;
      } catch (parseError) {
        eventLog.bodyParseError = 'Failed to parse body as JSON';
      }
    }
    
    this.info('Lambda event received', { event: eventLog });
  }
  
  /**
   * Log performance metrics
   * @param {string} operation - The operation being measured
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  static logPerformance(operation, duration, metadata = {}) {
    this.info('Performance metric', {
      operation,
      duration,
      unit: 'ms',
      ...metadata
    });
  }
  
  /**
   * Log business metrics
   * @param {string} metric - The metric name
   * @param {number} value - The metric value
   * @param {string} unit - The unit of measurement
   * @param {Object} metadata - Additional metadata
   */
  static logMetric(metric, value, unit = 'count', metadata = {}) {
    this.info('Business metric', {
      metric,
      value,
      unit,
      ...metadata
    });
  }
  
  /**
   * Log security events
   * @param {string} event - The security event type
   * @param {Object} metadata - Additional metadata
   */
  static logSecurity(event, metadata = {}) {
    this.warn('Security event', {
      securityEvent: event,
      ...metadata
    });
  }
  
  /**
   * Create a correlation ID for request tracing
   * @returns {string} A unique correlation ID
   */
  static createCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = Logger;