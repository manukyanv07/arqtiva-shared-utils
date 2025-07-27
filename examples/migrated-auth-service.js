'use strict';

/**
 * Example: Migrated auth-service using @arqtiva/shared-utils
 * 
 * This demonstrates how a microservice would look after migration
 * to use the shared utilities package in a separate repository.
 */

const { 
  getCognitoClient, 
  getDynamoDbClient, 
  validateServiceEnvironment,
  createLambdaHealthResponse,
  performHealthCheck,
  getEnvironmentInfo
} = require('@arqtiva/shared-utils');

// Environment validation at module load (optimized for Lambda)
validateServiceEnvironment('auth-service');

// Get optimized AWS clients with connection pooling
const cognitoClient = getCognitoClient();
const dynamoDb = getDynamoDbClient();

/**
 * Lambda handler with shared utilities
 */
exports.handler = async (event, context) => {
  try {
    // Health check endpoint
    if (event.path === '/health' || event.pathParameters?.proxy === 'health') {
      return await handleHealthCheck();
    }

    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return createCORSResponse(200);
    }

    // Route to appropriate handler
    const route = event.pathParameters?.proxy;
    
    switch (route) {
      case 'login':
        return await handleLogin(event);
      case 'register':
        return await handleRegister(event);
      case 'refresh':
        return await handleRefreshToken(event);
      default:
        return createErrorResponse(404, 'NOT_FOUND', 'Endpoint not found');
    }

  } catch (error) {
    console.error('Handler error:', error);
    return createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error');
  }
};

/**
 * Handle health check using shared utilities
 */
async function handleHealthCheck() {
  const healthData = await performHealthCheck('auth-service', {
    cognitoClient,
    dynamoDb
  }, {
    checkEnvironment: true,
    checkClients: true,
    includeMetrics: true
  });

  const statusCode = healthData.status === 'healthy' ? 200 : 
                    healthData.status === 'degraded' ? 200 : 503;

  return createLambdaHealthResponse(healthData, statusCode);
}

/**
 * Handle user login
 */
async function handleLogin(event) {
  const { email, password } = JSON.parse(event.body || '{}');
  
  if (!email || !password) {
    return createErrorResponse(400, 'MISSING_FIELDS', 'Email and password are required');
  }

  try {
    // Use the optimized Cognito client
    const loginCommand = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };

    const result = await cognitoClient.send(loginCommand);
    
    return createSuccessResponse({
      accessToken: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      expiresIn: result.AuthenticationResult.ExpiresIn
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.name === 'NotAuthorizedException') {
      return createErrorResponse(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }
    
    return createErrorResponse(500, 'LOGIN_FAILED', 'Login failed');
  }
}

/**
 * Handle user registration
 */
async function handleRegister(event) {
  const { email, password, organizationName } = JSON.parse(event.body || '{}');
  
  if (!email || !password || !organizationName) {
    return createErrorResponse(400, 'MISSING_FIELDS', 'Email, password, and organization name are required');
  }

  try {
    // Register user with Cognito using optimized client
    const signUpCommand = {
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        }
      ]
    };

    const cognitoResult = await cognitoClient.send(signUpCommand);
    
    // Create organization record in DynamoDB using optimized client
    const organizationId = `org_${Date.now()}`;
    const putCommand = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        PK: `ORG#${organizationId}`,
        SK: 'METADATA',
        organizationId,
        name: organizationName,
        createdBy: email,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    };

    await dynamoDb.send(putCommand);
    
    return createSuccessResponse({
      message: 'Registration successful',
      organizationId,
      userSub: cognitoResult.UserSub
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'UsernameExistsException') {
      return createErrorResponse(409, 'USER_EXISTS', 'User already exists');
    }
    
    return createErrorResponse(500, 'REGISTRATION_FAILED', 'Registration failed');
  }
}

/**
 * Handle token refresh
 */
async function handleRefreshToken(event) {
  const { refreshToken } = JSON.parse(event.body || '{}');
  
  if (!refreshToken) {
    return createErrorResponse(400, 'MISSING_TOKEN', 'Refresh token is required');
  }

  try {
    const refreshCommand = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    };

    const result = await cognitoClient.send(refreshCommand);
    
    return createSuccessResponse({
      accessToken: result.AuthenticationResult.AccessToken,
      expiresIn: result.AuthenticationResult.ExpiresIn
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return createErrorResponse(401, 'INVALID_TOKEN', 'Invalid refresh token');
  }
}

/**
 * Create success response with standard format
 */
function createSuccessResponse(data) {
  const envInfo = getEnvironmentInfo();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify({
      data,
      meta: {
        service: 'auth-service',
        version: '1.0.0',
        apiVersion: 'v1',
        timestamp: new Date().toISOString(),
        environment: envInfo.nodeEnv
      }
    })
  };
}

/**
 * Create error response with standard format
 */
function createErrorResponse(statusCode, code, message) {
  const envInfo = getEnvironmentInfo();
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify({
      error: {
        code,
        message
      },
      meta: {
        service: 'auth-service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: envInfo.nodeEnv
      }
    })
  };
}

/**
 * Create CORS response
 */
function createCORSResponse(statusCode) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: ''
  };
}