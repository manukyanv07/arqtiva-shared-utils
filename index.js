'use strict';

/**
 * @arqtiva/shared-utils
 *
 * Shared utilities for Arqtiva ERP microservices following AWS Lambda best practices
 *
 * @version 1.0.0
 * @author Arqtiva ERP Team
 */

// AWS Clients
const awsClients = require('./clients/aws-clients');

// Utilities
const environment = require('./utils/environment');
const health = require('./utils/health');
const logger = require('./utils/logger');

// Re-export all modules for easy access
module.exports = {
  // AWS Clients
  clients: {
    aws: awsClients
  },

  // Utilities
  utils: {
    environment,
    health,
    logger
  },

  // Direct exports for convenience (backward compatibility)
  ...awsClients,
  environment,
  health,
  logger,

  // Version info
  version: require('./package.json').version
};

// Named exports for modern import syntax
module.exports.getCognitoClient = awsClients.getCognitoClient;
module.exports.getDynamoDbClient = awsClients.getDynamoDbClient;
module.exports.validateServiceEnvironment = environment.validateServiceEnvironment;
module.exports.createHealthCheckResponse = health.createHealthCheckResponse;
module.exports.Logger = logger;