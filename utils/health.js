'use strict';

/**
 * Shared health check utilities following Lambda best practices
 * - Consistent health check format across services
 * - Client health monitoring
 * - Environment validation checks
 */

const { getEnvironmentInfo, validateServiceEnvironment } = require('./environment');

/**
 * Create standardized health check response
 * @param {string} serviceName - Name of the service
 * @param {Object} additionalChecks - Additional health checks specific to service
 * @returns {Object} Standardized health check response
 */
function createHealthCheckResponse(serviceName, additionalChecks = {}) {
  const envInfo = getEnvironmentInfo();

  const baseChecks = {
    environment: 'ok',
    timestamp: envInfo.timestamp,
    version: envInfo.serviceVersion,
    nodeEnv: envInfo.nodeEnv,
    awsRegion: envInfo.awsRegion
  };

  return {
    status: 'healthy',
    service: serviceName,
    version: envInfo.serviceVersion,
    timestamp: envInfo.timestamp,
    environment: envInfo.nodeEnv,
    checks: {
      ...baseChecks,
      ...additionalChecks
    }
  };
}

/**
 * Perform comprehensive health check for a service
 * @param {string} serviceName - Name of the service
 * @param {Object} clients - Client instances to check
 * @param {Object} options - Health check options
 * @returns {Object} Comprehensive health check result
 */
async function performHealthCheck(serviceName, clients = {}, options = {}) {
  const {
    checkEnvironment = true,
    checkClients = true,
    includeMetrics = false
  } = options;

  const checks = {};
  let overallStatus = 'healthy';

  // Environment validation check
  if (checkEnvironment) {
    try {
      const envValidation = validateServiceEnvironment(serviceName, {
        skipInProduction: false // Always check in health checks
      });

      checks.environment = {
        status: envValidation.valid ? 'ok' : 'warning',
        missing: envValidation.missing,
        warnings: envValidation.warnings
      };

      if (!envValidation.valid) {
        overallStatus = 'degraded';
      }
    } catch (error) {
      checks.environment = {
        status: 'error',
        error: error.message
      };
      overallStatus = 'unhealthy';
    }
  }

  // Client health checks
  if (checkClients && clients) {
    for (const [clientName, client] of Object.entries(clients)) {
      try {
        if (client && typeof client.getClientHealth === 'function') {
          checks[clientName] = await client.getClientHealth();
        } else if (client) {
          checks[clientName] = {
            status: 'ok',
            initialized: !!client
          };
        } else {
          checks[clientName] = {
            status: 'warning',
            initialized: false,
            message: 'Client not initialized'
          };
          if (overallStatus === 'healthy') {
            overallStatus = 'degraded';
          }
        }
      } catch (error) {
        checks[clientName] = {
          status: 'error',
          error: error.message
        };
        overallStatus = 'unhealthy';
      }
    }
  }

  // Performance metrics (if requested)
  if (includeMetrics) {
    checks.performance = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  return {
    status: overallStatus,
    service: serviceName,
    ...getEnvironmentInfo(),
    checks
  };
}

/**
 * Simple health check for basic liveness probe
 * @param {string} serviceName - Name of the service
 * @returns {Object} Basic health response
 */
function basicHealthCheck(serviceName) {
  return {
    status: 'healthy',
    service: serviceName,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check AWS client health
 * @param {Object} awsClient - AWS client instance
 * @param {string} clientType - Type of client (cognito, dynamodb, etc.)
 * @returns {Object} Client health status
 */
async function checkAWSClientHealth(awsClient, clientType = 'unknown') {
  if (!awsClient) {
    return {
      status: 'error',
      type: clientType,
      initialized: false,
      message: 'Client not initialized'
    };
  }

  try {
    // Basic client configuration check
    const config = awsClient.config || {};

    return {
      status: 'ok',
      type: clientType,
      initialized: true,
      region: config.region || 'unknown',
      maxAttempts: config.maxAttempts || 'default',
      timeout: config.requestTimeout || 'default'
    };
  } catch (error) {
    return {
      status: 'error',
      type: clientType,
      initialized: true,
      error: error.message
    };
  }
}

/**
 * Create Lambda-specific health response with proper headers
 * @param {Object} healthData - Health check data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Lambda response object with CORS headers
 */
function createLambdaHealthResponse(healthData, statusCode = 200) {
  // const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...corsHeaders
    },
    body: JSON.stringify({
      data: healthData,
      meta: {
        service: healthData.service || 'unknown-service',
        version: healthData.version || '1.0.0',
        apiVersion: 'v1',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown'
      }
    })
  };
}

/**
 * Health check middleware for Lambda functions
 * @param {string} serviceName - Name of the service
 * @param {Object} clients - Client instances to check
 * @returns {Function} Middleware function
 */
function healthCheckMiddleware(serviceName, clients = {}) {
  return async (event, _context) => {
    // Only handle health check paths
    if (!event.path || !event.path.includes('/health')) {
      return null; // Let other handlers process
    }

    try {
      const healthData = await performHealthCheck(serviceName, clients, {
        checkEnvironment: true,
        checkClients: true,
        includeMetrics: event.queryStringParameters?.metrics === 'true'
      });

      const statusCode = healthData.status === 'healthy' ? 200 :
        healthData.status === 'degraded' ? 200 : 503;

      return createLambdaHealthResponse(healthData, statusCode);
    } catch (error) {
      const errorHealth = {
        status: 'unhealthy',
        service: serviceName,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      return createLambdaHealthResponse(errorHealth, 503);
    }
  };
}

module.exports = {
  // Primary functions
  createHealthCheckResponse,
  performHealthCheck,
  basicHealthCheck,

  // AWS specific
  checkAWSClientHealth,

  // Lambda specific
  createLambdaHealthResponse,
  healthCheckMiddleware
};