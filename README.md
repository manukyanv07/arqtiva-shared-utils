# @arqtiva/shared-utils

[![npm version](https://badge.fury.io/js/%40arqtiva%2Fshared-utils.svg)](https://badge.fury.io/js/%40arqtiva%2Fshared-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Shared utilities for Arqtiva ERP microservices following AWS Lambda best practices.

## Features

- 🚀 **AWS Lambda Optimized**: Client reuse, connection pooling, execution context optimization
- 🔧 **Environment Management**: Comprehensive environment validation and configuration
- 🏥 **Health Checks**: Standardized health check responses with client monitoring
- 🧪 **Test-Friendly**: Mock injection support for all AWS clients
- 📦 **Lightweight**: Minimal dependencies, optimized for cold starts

## Installation

### From GitHub Packages (Recommended)

```bash
# Configure npm to use GitHub Packages for @arqtiva scope
echo "@arqtiva:registry=https://npm.pkg.github.com" >> .npmrc

# Install the package
npm install @arqtiva/shared-utils
```

### From Private Registry

```bash
npm install @arqtiva/shared-utils@latest
```

## Quick Start

```javascript
const { getCognitoClient, getDynamoDbClient, validateServiceEnvironment } = require('@arqtiva/shared-utils');

// Get optimized AWS clients (with connection pooling)
const cognitoClient = getCognitoClient();
const dynamoDb = getDynamoDbClient();

// Validate environment on startup
validateServiceEnvironment('my-service');
```

## API Reference

### AWS Clients (`clients/aws-clients`)

#### `getCognitoClient()`
Returns a singleton Cognito client optimized for Lambda execution context reuse.

```javascript
const cognitoClient = getCognitoClient();
```

#### `getDynamoDbClient()`
Returns a singleton DynamoDB Document client with connection pooling.

```javascript
const dynamoDb = getDynamoDbClient();
```

#### `getClientHealth()`
Returns health status of all initialized clients.

```javascript
const health = getClientHealth();
// { cognito: { initialized: true, isMock: false }, dynamodb: { ... } }
```

### Environment Utils (`utils/environment`)

#### `validateServiceEnvironment(serviceName, options)`
Validates required environment variables for a service.

```javascript
const result = validateServiceEnvironment('auth-service');
// { valid: true, missing: [], warnings: [] }
```

#### `getEnvironmentInfo()`
Returns comprehensive environment information.

```javascript
const info = getEnvironmentInfo();
// { nodeEnv: 'production', awsRegion: 'us-east-1', isTest: false, ... }
```

#### `isTestEnvironment()` / `isProductionEnvironment()`
Environment detection utilities.

```javascript
if (isTestEnvironment()) {
  // Test-specific logic
}
```

### Health Utils (`utils/health`)

#### `createHealthCheckResponse(serviceName, additionalChecks)`
Creates standardized health check response.

```javascript
const healthResponse = createHealthCheckResponse('my-service', {
  database: 'ok',
  cache: 'warning'
});
```

#### `performHealthCheck(serviceName, clients, options)`
Performs comprehensive health check with client monitoring.

```javascript
const health = await performHealthCheck('my-service', {
  cognitoClient,
  dynamoDb
});
```

#### `createLambdaHealthResponse(healthData, statusCode)`
Creates Lambda-compatible health response with CORS headers.

```javascript
const lambdaResponse = createLambdaHealthResponse(healthData, 200);
// Returns proper Lambda response object
```

## Usage Examples

### Basic Lambda Handler with Health Check

```javascript
const { 
  getCognitoClient, 
  getDynamoDbClient, 
  validateServiceEnvironment,
  createLambdaHealthResponse,
  performHealthCheck 
} = require('@arqtiva/shared-utils');

// Validate environment on module load
validateServiceEnvironment('my-service');

// Get optimized clients
const cognitoClient = getCognitoClient();
const dynamoDb = getDynamoDbClient();

exports.handler = async (event) => {
  // Health check endpoint
  if (event.path === '/health') {
    const healthData = await performHealthCheck('my-service', {
      cognitoClient,
      dynamoDb
    });
    return createLambdaHealthResponse(healthData);
  }
  
  // Your business logic here
  // ... use cognitoClient and dynamoDb
};
```

### Advanced Configuration

```javascript
const { 
  createCognitoClient,
  createDynamoDbDocumentClient,
  validateEnvironment,
  getEnvVar 
} = require('@arqtiva/shared-utils');

// Custom client configuration
const cognitoClient = createCognitoClient();
const dynamoDb = createDynamoDbDocumentClient();

// Custom environment validation
const validation = validateEnvironment(
  ['CUSTOM_VAR', 'ANOTHER_VAR'],
  { serviceName: 'my-service', throwOnMissing: true }
);

// Environment variables with defaults
const customTimeout = getEnvVar('CUSTOM_TIMEOUT', '30000');
```

## Best Practices

### 1. Environment Validation
Always validate your environment on module load:

```javascript
const { validateServiceEnvironment } = require('@arqtiva/shared-utils');

// At the top of your main handler file
validateServiceEnvironment('your-service-name');
```

### 2. Client Reuse
Use the singleton client functions for optimal performance:

```javascript
// ✅ Good - clients are reused across invocations
const cognitoClient = getCognitoClient();
const dynamoDb = getDynamoDbClient();

// ❌ Bad - creates new clients on each invocation
const cognitoClient = new CognitoIdentityProviderClient({...});
```

### 3. Health Checks
Implement comprehensive health checks:

```javascript
// Include client health in your health checks
const healthData = await performHealthCheck('my-service', {
  cognitoClient: getCognitoClient(),
  dynamoDb: getDynamoDbClient()
}, {
  checkEnvironment: true,
  checkClients: true,
  includeMetrics: true
});
```

### 4. Test Environment
The package automatically detects test environments and provides mock support:

```javascript
// In your tests, set up mocks
global.mockCognitoClient = mockCognito;
global.mockDynamoClient = mockDynamo;

// The package will automatically use mocks in test environment
const cognitoClient = getCognitoClient(); // Returns mock in tests
```

## Configuration

### Environment Variables

The package recognizes these standard environment variables:

- `NODE_ENV` - Runtime environment (production, development, test)
- `AWS_REGION` - AWS region for services
- `DYNAMODB_TABLE_NAME` - Primary DynamoDB table
- `COGNITO_USER_POOL_ID` - Cognito User Pool ID
- `COGNITO_USER_POOL_CLIENT_ID` - Cognito Client ID

### Service-Specific Variables

Each service can define its required variables:

```javascript
// The package includes predefined requirements for:
// - auth-service
// - user-management-service  
// - organizations-service
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm test` and `npm run lint`
6. Submit a pull request

## Changelog

### v1.0.0
- Initial release
- AWS client factory with connection pooling
- Environment validation utilities
- Health check utilities
- Lambda-optimized patterns

## License

MIT - see [LICENSE](LICENSE) file for details.

## Support

- Create an issue for bug reports
- Submit feature requests via GitHub issues
- Internal documentation: [Confluence](https://arqtiva.atlassian.net)