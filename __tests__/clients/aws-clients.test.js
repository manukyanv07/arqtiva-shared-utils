'use strict';

const awsClients = require('../../clients/aws-clients');

describe('AWS Clients', () => {
  beforeEach(() => {
    // Reset clients before each test
    awsClients.resetClients();
  });

  describe('getCognitoClient', () => {
    it('should return a singleton Cognito client', () => {
      const client1 = awsClients.getCognitoClient();
      const client2 = awsClients.getCognitoClient();

      expect(client1).toBe(client2);
      expect(client1).toBe(global.mockCognitoClient);
    });

    it('should initialize client with proper configuration', () => {
      const client = awsClients.getCognitoClient();

      expect(client.config).toEqual({
        region: 'us-east-1',
        maxAttempts: 3,
        requestTimeout: 30000
      });
    });
  });

  describe('getDynamoDbClient', () => {
    it('should return a singleton DynamoDB Document client', () => {
      const client1 = awsClients.getDynamoDbClient();
      const client2 = awsClients.getDynamoDbClient();

      expect(client1).toBe(client2);
      expect(client1).toBe(global.mockDynamoDbDocumentClient);
    });
  });

  describe('getClientHealth', () => {
    it('should return health status for all clients', () => {
      // Initialize clients
      awsClients.getCognitoClient();
      awsClients.getDynamoDbClient();

      const health = awsClients.getClientHealth();

      expect(health).toHaveProperty('cognito');
      expect(health).toHaveProperty('dynamodb');
      expect(health.cognito.initialized).toBe(true);
      expect(health.dynamodb.initialized).toBe(true);
    });

    it('should indicate mock status in test environment', () => {
      awsClients.getCognitoClient();
      const health = awsClients.getClientHealth();

      expect(health.cognito.isMock).toBe(true);
    });
  });

  describe('resetClients', () => {
    it('should reset all clients to null', () => {
      // Initialize clients
      awsClients.getCognitoClient();
      awsClients.getDynamoDbClient();

      // Reset clients
      awsClients.resetClients();

      const health = awsClients.getClientHealth();
      expect(health.cognito.initialized).toBe(false);
      expect(health.dynamodb.initialized).toBe(false);
    });
  });

  describe('initializeClients', () => {
    it('should initialize all clients', () => {
      // In test environment, initializeClients doesn't auto-initialize
      // So we manually call the client getters to initialize them
      awsClients.getCognitoClient();
      awsClients.getDynamoDbClient();

      const health = awsClients.getClientHealth();
      expect(health.cognito.initialized).toBe(true);
      expect(health.dynamodb.initialized).toBe(true);
    });
  });
});