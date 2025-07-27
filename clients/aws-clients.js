'use strict';

/**
 * Shared AWS client factory following Lambda best practices
 * - Clients initialized once per container lifecycle
 * - Connection pooling and reuse configured
 * - Test environment compatibility maintained
 */

const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Global client instances for reuse across invocations
let cognitoClient = null;
let dynamoDbClient = null;
let dynamoDbDocumentClient = null;

/**
 * Initialize Cognito client with Lambda best practices
 * @returns {CognitoIdentityProviderClient} Configured Cognito client
 */
function createCognitoClient() {
  if (cognitoClient) {
    return cognitoClient;
  }

  // In test environment, allow mock injection
  if (process.env.NODE_ENV === 'test' && global.mockCognitoClient) {
    cognitoClient = global.mockCognitoClient;
    return cognitoClient;
  }

  // Production: Initialize with connection pooling and reuse
  cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
    maxAttempts: 3,
    requestTimeout: 30000,
    // Connection pooling
    keepAlive: true,
    maxSockets: 50
  });

  return cognitoClient;
}

/**
 * Initialize DynamoDB Document client with Lambda best practices
 * @returns {DynamoDBDocumentClient} Configured DynamoDB Document client
 */
function createDynamoDbDocumentClient() {
  if (dynamoDbDocumentClient) {
    return dynamoDbDocumentClient;
  }

  // In test environment, allow mock injection
  if (process.env.NODE_ENV === 'test' && global.mockDynamoDbDocumentClient) {
    dynamoDbDocumentClient = global.mockDynamoDbDocumentClient;
    return dynamoDbDocumentClient;
  }

  // Create base DynamoDB client if not exists
  if (!dynamoDbClient) {
    dynamoDbClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      maxAttempts: 3,
      requestTimeout: 30000,
      // Connection pooling
      keepAlive: true,
      maxSockets: 50
    });
  }

  // Create Document client with optimized marshalling
  dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false,
      convertClassInstanceToMap: false
    },
    unmarshallOptions: {
      wrapNumbers: false
    }
  });

  return dynamoDbDocumentClient;
}

/**
 * Get or create Cognito client (for backward compatibility)
 * @returns {CognitoIdentityProviderClient} Configured Cognito client
 */
function getCognitoClient() {
  return createCognitoClient();
}

/**
 * Get or create DynamoDB Document client (for backward compatibility)
 * @returns {DynamoDBDocumentClient} Configured DynamoDB Document client
 */
function getDynamoDbClient() {
  return createDynamoDbDocumentClient();
}

/**
 * Initialize all clients at module load time (except in test environment)
 * This follows Lambda best practices for execution context reuse
 */
function initializeClients() {
  if (process.env.NODE_ENV !== 'test') {
    // Initialize clients immediately in production for maximum reuse
    createCognitoClient();
    createDynamoDbDocumentClient();

    // eslint-disable-next-line no-console
    console.log('AWS clients initialized for Lambda execution context reuse');
  }
}

/**
 * Reset clients (primarily for testing)
 * Allows tests to inject fresh mocks
 */
function resetClients() {
  cognitoClient = null;
  dynamoDbClient = null;
  dynamoDbDocumentClient = null;
}

/**
 * Get client health status for health checks
 * @returns {Object} Health status of all clients
 */
function getClientHealth() {
  return {
    cognito: {
      initialized: !!cognitoClient,
      isMock: process.env.NODE_ENV === 'test' && cognitoClient === global.mockCognitoClient
    },
    dynamodb: {
      initialized: !!dynamoDbDocumentClient,
      isMock: process.env.NODE_ENV === 'test' && dynamoDbDocumentClient === global.mockDynamoDbDocumentClient
    }
  };
}

// Initialize clients immediately on module load
initializeClients();

module.exports = {
  // Primary exports
  getCognitoClient,
  getDynamoDbClient,

  // Factory functions
  createCognitoClient,
  createDynamoDbDocumentClient,

  // Utility functions
  initializeClients,
  resetClients,
  getClientHealth
};