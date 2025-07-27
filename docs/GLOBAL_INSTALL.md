# Global npm Installation Guide

This guide shows how to install the shared utilities package globally on your local machine for development.

## Step 1: Install Globally from Local Directory

```bash
# Navigate to the shared utilities directory
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared

# Install globally from current directory
npm install -g .

# Or using the package name
npm install -g @arqtiva/shared-utils
```

## Step 2: Verify Global Installation

```bash
# Check if package is installed globally
npm list -g @arqtiva/shared-utils

# Should show something like:
# /usr/local/lib
# └── @arqtiva/shared-utils@1.0.0

# Test the package
node -e "console.log(require('@arqtiva/shared-utils'))"
```

## Step 3: Use in Microservices

Now you can use the shared utilities in any microservice without relative paths:

### In auth-service

```javascript
// auth-service/index.js
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

exports.handler = async (event) => {
  // Health check endpoint
  if (event.path === '/health') {
    const healthData = await performHealthCheck('auth-service', {
      cognitoClient,
      dynamoDb
    });
    return createLambdaHealthResponse(healthData);
  }
  
  // Your existing business logic here...
};
```

### In user-management-service

```javascript
// user-management-service/src/index.js
const { 
  getCognitoClient, 
  getDynamoDbClient, 
  validateServiceEnvironment 
} = require('@arqtiva/shared-utils');

// Environment validation
validateServiceEnvironment('user-management-service');

// Optimized clients
const cognitoClient = getCognitoClient();
const dynamoDb = getDynamoDbClient();

exports.handler = async (event) => {
  // Your business logic using optimized clients
};
```

### In organizations-service

```javascript
// organizations-service/src/index.js
const { 
  getDynamoDbClient, 
  validateServiceEnvironment 
} = require('@arqtiva/shared-utils');

// Environment validation
validateServiceEnvironment('organizations-service');

// Optimized DynamoDB client
const dynamoDb = getDynamoDbClient();

exports.handler = async (event) => {
  // Your business logic
};
```

## Step 4: Update Package Dependencies (Optional)

You can optionally add it to package.json for documentation:

```json
{
  "dependencies": {
    "@arqtiva/shared-utils": "^1.0.0"
  }
}
```

But since it's globally installed, npm install won't actually install it locally.

## Development Workflow

### Making Changes to Shared Utilities

```bash
# 1. Make changes to shared utilities
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared

# Edit files...

# 2. Test changes locally
npm test

# 3. Reinstall globally to pick up changes
npm install -g .

# 4. Changes are now available in all microservices
```

### Testing Changes

```bash
# Test in auth-service
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/auth-service
make test-coverage

# Test in user-management-service
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/user-management-service
make test-coverage

# Test in organizations-service
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/organizations-service
make test-coverage
```

## Advantages of Global Installation

### ✅ **Clean Import Paths**
```javascript
// Clean, no relative paths
const { getCognitoClient } = require('@arqtiva/shared-utils');

// Instead of
const { getCognitoClient } = require('../shared');
```

### ✅ **Consistency Across Services**
- Same import pattern in all microservices
- No need to manage relative path depths
- Works from any directory structure

### ✅ **Easy Updates**
- Single command to update all services: `npm install -g .`
- All services immediately use updated version
- No need to manage individual links

### ✅ **Production-Like Behavior**
- Similar to how services would import from published package
- Easy transition to published package later

## Managing Global Package

### Check Global Packages
```bash
# List all global packages
npm list -g --depth=0

# Check specific package
npm list -g @arqtiva/shared-utils
```

### Update Global Package
```bash
# After making changes to shared utilities
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared

# Reinstall globally
npm install -g .
```

### Remove Global Package
```bash
# If you need to remove it
npm uninstall -g @arqtiva/shared-utils
```

## Migration Script

Let me create a script to help migrate all services:

```bash
#!/bin/bash
# migrate-to-global.sh

echo "Installing shared utilities globally..."
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared
npm install -g .

echo "Global installation complete!"
echo "You can now use: require('@arqtiva/shared-utils') in all services"

echo "Testing global installation..."
node -e "
const utils = require('@arqtiva/shared-utils');
console.log('✅ Global installation successful!');
console.log('Available functions:', Object.keys(utils));
"
```

## Troubleshooting

### Permission Issues
```bash
# If you get permission errors, use sudo (macOS/Linux)
sudo npm install -g .

# Or configure npm to use different directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Module Not Found
```bash
# Check if globally installed
npm list -g @arqtiva/shared-utils

# Reinstall if needed
cd /path/to/shared
npm install -g .
```

### Path Issues
```bash
# Check npm global path
npm config get prefix

# Check if path is in NODE_PATH
echo $NODE_PATH
```

## Converting Back to Published Package

When ready to publish to npm registry:

```bash
# 1. Uninstall global package
npm uninstall -g @arqtiva/shared-utils

# 2. Publish to registry
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared
npm publish

# 3. Install from registry in each service
cd ../auth-service
npm install @arqtiva/shared-utils

# 4. Code remains exactly the same!
```

The beauty of this approach is that your code doesn't change at all - only the installation method changes when you're ready to publish!