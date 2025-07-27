'use strict';

/**
 * Shared environment validation utilities following Lambda best practices
 * - Validation performed at module load time
 * - Production optimization to avoid cold start delays
 * - Consistent error handling across services
 */

/**
 * Validate critical environment variables for a service
 * @param {string[]} requiredVars - Array of required environment variable names
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with warnings and errors
 */
function validateEnvironment(requiredVars = [], options = {}) {
  const {
    serviceName = 'unknown-service',
    skipInProduction = true,
    throwOnMissing = false
  } = options;

  // Skip validation in production to avoid cold start delays
  if (skipInProduction && process.env.NODE_ENV === 'production') {
    return {
      valid: true,
      missing: [],
      warnings: []
    };
  }

  const missing = requiredVars.filter(varName => !process.env[varName]);
  const warnings = [];

  if (missing.length > 0) {
    const warningMessage = `${serviceName}: Missing environment variables: ${missing.join(', ')}`;
    warnings.push(warningMessage);
    
    // Log warning but don't fail (unless explicitly requested)
    console.warn(warningMessage);
    
    if (throwOnMissing) {
      throw new Error(warningMessage);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    serviceName
  };
}

/**
 * Standard environment variables required by most services
 */
const STANDARD_ENV_VARS = {
  AWS_REGION: 'AWS region for service deployment',
  DYNAMODB_TABLE_NAME: 'Primary DynamoDB table name',
  COGNITO_USER_POOL_ID: 'Cognito User Pool ID for authentication',
  COGNITO_USER_POOL_CLIENT_ID: 'Cognito User Pool Client ID'
};

/**
 * Service-specific environment variable sets
 */
const SERVICE_ENV_VARS = {
  'auth-service': [
    'DYNAMODB_TABLE_NAME',
    'COGNITO_USER_POOL_ID',
    'COGNITO_USER_POOL_CLIENT_ID'
  ],
  'user-management-service': [
    'DYNAMODB_TABLE_NAME',
    'COGNITO_USER_POOL_ID',
    'COGNITO_USER_POOL_CLIENT_ID'
  ],
  'organizations-service': [
    'DYNAMODB_TABLE',
    'COGNITO_USER_POOL_ID',
    'COGNITO_USER_POOL_CLIENT_ID'
  ]
};

/**
 * Validate environment for a specific service
 * @param {string} serviceName - Name of the service
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
function validateServiceEnvironment(serviceName, options = {}) {
  const requiredVars = SERVICE_ENV_VARS[serviceName] || [];
  
  return validateEnvironment(requiredVars, {
    serviceName,
    ...options
  });
}

/**
 * Get environment configuration summary
 * @returns {Object} Environment configuration details
 */
function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV || 'unknown',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    isTest: process.env.NODE_ENV === 'test',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev',
    serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
    timestamp: new Date().toISOString()
  };
}

/**
 * Check if running in test environment
 * @returns {boolean} True if in test environment
 */
function isTestEnvironment() {
  return !!(
    process.env.NODE_ENV === 'test' ||
    process.env.JEST_WORKER_ID ||
    process.env.npm_lifecycle_event?.includes('test')
  );
}

/**
 * Check if running in production environment
 * @returns {boolean} True if in production
 */
function isProductionEnvironment() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get environment variable with default value and validation
 * @param {string} varName - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @param {boolean} required - Whether the variable is required
 * @returns {string} Environment variable value
 */
function getEnvVar(varName, defaultValue = null, required = false) {
  const value = process.env[varName];
  
  if (!value && required) {
    throw new Error(`Required environment variable ${varName} is not set`);
  }
  
  return value || defaultValue;
}

/**
 * Mask sensitive environment variables for logging
 * @param {Object} env - Environment object to mask
 * @returns {Object} Masked environment object
 */
function maskSensitiveEnvVars(env = process.env) {
  const sensitiveKeys = [
    'COGNITO_USER_POOL_CLIENT_SECRET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'DATABASE_PASSWORD',
    'API_KEY',
    'SECRET'
  ];

  const masked = { ...env };
  
  Object.keys(masked).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive))) {
      masked[key] = '***MASKED***';
    }
  });
  
  return masked;
}

module.exports = {
  // Primary functions
  validateEnvironment,
  validateServiceEnvironment,
  
  // Environment info
  getEnvironmentInfo,
  isTestEnvironment,
  isProductionEnvironment,
  
  // Utilities
  getEnvVar,
  maskSensitiveEnvVars,
  
  // Constants
  STANDARD_ENV_VARS,
  SERVICE_ENV_VARS
};