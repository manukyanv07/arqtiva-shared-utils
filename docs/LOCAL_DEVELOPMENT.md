# Local Development Guide

This guide shows how to use the shared utilities package locally without publishing to npm registry.

## Method 1: npm link (Recommended)

### Step 1: Create npm link for shared utilities

```bash
# In the shared utilities directory
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared

# Create global symlink
npm link
```

### Step 2: Link in each microservice

```bash
# In auth-service directory
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/auth-service

# Link to the shared utilities
npm link @arqtiva/shared-utils

# In user-management-service directory
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/user-management-service

# Link to the shared utilities
npm link @arqtiva/shared-utils

# In organizations-service directory
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/organizations-service

# Link to the shared utilities
npm link @arqtiva/shared-utils
```

### Step 3: Use in code (same as published package)

```javascript
const { 
  getCognitoClient, 
  getDynamoDbClient, 
  validateServiceEnvironment 
} = require('@arqtiva/shared-utils');
```

## Method 2: Relative Path (Alternative)

### Update package.json in each service

```json
{
  "dependencies": {
    "@arqtiva/shared-utils": "file:../shared"
  }
}
```

### Install dependencies

```bash
# In each service directory
npm install
```

## Method 3: Direct Require (Quick Test)

For quick testing, you can directly require from the relative path:

```javascript
// Direct require from relative path
const { 
  getCognitoClient, 
  getDynamoDbClient, 
  validateServiceEnvironment 
} = require('../shared');
```

## Migration Steps for Local Development

### Step 1: Prepare shared utilities

```bash
# Install dependencies in shared utilities
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared
npm install

# Run tests to ensure everything works
npm test

# Create npm link
npm link
```

### Step 2: Migrate auth-service

```bash
# Go to auth-service
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/auth-service

# Link shared utilities
npm link @arqtiva/shared-utils

# Update package.json dependencies (optional for local)
# "dependencies": {
#   "@arqtiva/shared-utils": "^1.0.0"
# }
```

### Step 3: Update auth-service code

Replace the existing client initialization with shared utilities:

```javascript
// OLD CODE (current auth-service/index.js)
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Client initialization code...

// NEW CODE (using shared utilities)
const { 
  getCognitoClient, 
  getDynamoDbClient, 
  validateServiceEnvironment,
  createLambdaHealthResponse,
  performHealthCheck 
} = require('@arqtiva/shared-utils');

// Environment validation at module load
validateServiceEnvironment('auth-service');

// Get optimized clients
const cognitoClient = getCognitoClient();
const dynamoDb = getDynamoDbClient();
```

## Testing with Local Package

### Step 1: Test shared utilities

```bash
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared
npm test
```

### Step 2: Test in auth-service

```bash
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/auth-service

# Run tests to ensure shared utilities work
npm test

# Test the service
make test-coverage
```

## Verifying the Link

### Check if link is working

```bash
# In service directory, check node_modules
ls -la node_modules/@arqtiva/

# Should show symlink to shared utilities
# @arqtiva/shared-utils -> ../../../shared
```

### Test import in Node.js

```bash
# In service directory
node -e "console.log(require('@arqtiva/shared-utils'))"
```

## Development Workflow

### Making changes to shared utilities

```bash
# 1. Make changes in shared utilities
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared

# Edit files...

# 2. Test changes
npm test

# 3. Changes are immediately available in linked services
# No need to reinstall or republish!
```

### Adding new utilities

```bash
# 1. Add new function to shared utilities
# Edit clients/aws-clients.js or utils/environment.js

# 2. Export from index.js
# Add to module.exports

# 3. Test in shared utilities
npm test

# 4. Use in services immediately
# const { newFunction } = require('@arqtiva/shared-utils');
```

## Troubleshooting

### Link not working

```bash
# Remove and recreate link
npm unlink @arqtiva/shared-utils
cd ../shared
npm link
cd ../auth-service
npm link @arqtiva/shared-utils
```

### Module not found

```bash
# Check if shared utilities are properly installed
cd ../shared
npm install

# Check if link exists
ls -la node_modules/@arqtiva/
```

### Test failures

```bash
# Ensure test environment is set up
cd ../shared
npm test

# Check if mocks are properly configured
cd ../auth-service
npm test
```

## Benefits of Local Development

### Immediate Changes
- ✅ Changes in shared utilities are immediately available
- ✅ No need to publish/install for each change
- ✅ Fast iteration and testing

### Development Speed
- ✅ Test changes across multiple services quickly
- ✅ Debug shared utilities in real service context
- ✅ Maintain all code in single repository

### Easy Rollback
- ✅ Git history maintains all changes
- ✅ Easy to revert shared utilities changes
- ✅ No version management complexity

## Converting to Published Package Later

When ready to publish:

```bash
# 1. Remove npm links
npm unlink @arqtiva/shared-utils

# 2. Publish shared utilities
cd ../shared
npm publish

# 3. Install published package
cd ../auth-service
npm install @arqtiva/shared-utils@^1.0.0
```

The code remains exactly the same - only the installation method changes!