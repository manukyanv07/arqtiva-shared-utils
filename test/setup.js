'use strict';

/**
 * Jest test setup for shared utilities
 * Configures global mocks and test environment
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.AWS_REGION = 'us-east-1';

// Mock AWS SDK clients for testing
const mockCognitoClient = {
  send: jest.fn(),
  config: {
    region: 'us-east-1',
    maxAttempts: 3,
    requestTimeout: 30000
  }
};

const mockDynamoClient = {
  send: jest.fn(),
  config: {
    region: 'us-east-1',
    maxAttempts: 3,
    requestTimeout: 30000
  }
};

const mockDynamoDbDocumentClient = {
  send: jest.fn(),
  config: {
    region: 'us-east-1',
    maxAttempts: 3,
    requestTimeout: 30000
  }
};

// Set global mocks
global.mockCognitoClient = mockCognitoClient;
global.mockDynamoClient = mockDynamoClient;
global.mockDynamoDbDocumentClient = mockDynamoDbDocumentClient;

// Mock AWS SDK modules
jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn(() => mockCognitoClient)
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => mockDynamoClient)
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => mockDynamoDbDocumentClient)
  }
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();

  // Reset client mocks
  mockCognitoClient.send.mockClear();
  mockDynamoClient.send.mockClear();
  mockDynamoDbDocumentClient.send.mockClear();
});