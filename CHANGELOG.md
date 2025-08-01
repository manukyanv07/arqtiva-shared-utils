# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-27

### Added
- **AWS Client Factory**: Optimized AWS client initialization with connection pooling
  - Cognito Identity Provider client with singleton pattern
  - DynamoDB Document client with marshalling optimization
  - Execution context reuse for Lambda cold start optimization
  - Test environment compatibility with mock injection

- **Environment Validation**: Comprehensive environment variable validation
  - Service-specific environment variable sets
  - Production optimization (skip validation in production)
  - Configurable validation with warnings and errors
  - Environment information utilities

- **Health Check System**: Standardized health check responses
  - Lambda-compatible health responses with CORS headers
  - Client health monitoring for AWS services
  - Environment validation in health checks
  - Performance metrics collection (optional)
  - Health check middleware for Lambda functions

- **Testing Support**: Complete test environment compatibility
  - Mock injection for AWS clients
  - Jest configuration with coverage thresholds
  - ESLint configuration for code quality
  - GitHub Actions workflow for CI/CD

### Features
- 🚀 **Lambda Optimized**: Client reuse and connection pooling for AWS Lambda
- 🔧 **Environment Management**: Service-specific environment validation
- 🏥 **Health Monitoring**: Comprehensive health checks with client monitoring
- 🧪 **Test-Friendly**: Mock support for all AWS clients
- 📦 **Lightweight**: Minimal dependencies optimized for cold starts

### Dependencies
- `@aws-sdk/client-cognito-identity-provider`: ^3.450.0
- `@aws-sdk/client-dynamodb`: ^3.450.0
- `@aws-sdk/lib-dynamodb`: ^3.450.0

### Development Dependencies
- `jest`: ^29.7.0 (testing framework)
- `eslint`: ^8.55.0 (code linting)
- `@types/node`: ^20.0.0 (TypeScript definitions)

### Configuration
- **Node.js**: >=18.0.0 required
- **GitHub Packages**: Configured for private registry
- **Coverage**: 80% minimum threshold for all metrics
- **CI/CD**: Automated testing and publishing workflow

### Breaking Changes
- None (initial release)

### Migration Guide
- None (initial release)

### Security
- Environment variable masking for sensitive data
- No secrets or credentials in logs
- Security audit in CI/CD pipeline

## [1.1.0] - 2025-07-27

### Added
- **Structured Logger**: New `utils/logger.js` with AWS Lambda best practices
  - JSON-formatted logging for CloudWatch Logs
  - Automatic security filtering of sensitive data (passwords, tokens)
  - Performance metrics tracking with `logPerformance()`
  - Business metrics with `logMetric()` 
  - Security event logging with `logSecurity()`
  - Environment-aware debug logging (non-production only)
  - Lambda event logging with customizable inclusion options
  - Correlation ID generation for request tracing

### Enhanced
- **Shared Utilities**: Logger exported as `Logger` in main index.js
- **Security**: Comprehensive filtering of sensitive headers and body content
- **CloudWatch Integration**: Optimized JSON structure for CloudWatch Logs analysis

### Breaking Changes
- None - fully backward compatible

## [Unreleased]

### Planned Features
- Connection health monitoring with automatic recovery
- Advanced caching strategies for frequent operations
- Rate limiting utilities for API calls