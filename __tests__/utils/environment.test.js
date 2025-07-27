'use strict';

const environment = require('../../utils/environment');

describe('Environment Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should pass validation when all required vars are present', () => {
      process.env.TEST_VAR = 'test-value';

      const result = environment.validateEnvironment(['TEST_VAR']);

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should fail validation when required vars are missing', () => {
      const result = environment.validateEnvironment(['MISSING_VAR'], {
        serviceName: 'test-service'
      });

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('MISSING_VAR');
      expect(result.serviceName).toBe('test-service');
    });

    it('should skip validation in production when configured', () => {
      process.env.NODE_ENV = 'production';

      const result = environment.validateEnvironment(['MISSING_VAR'], {
        skipInProduction: true
      });

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should throw error when throwOnMissing is true', () => {
      expect(() => {
        environment.validateEnvironment(['MISSING_VAR'], {
          throwOnMissing: true,
          serviceName: 'test-service'
        });
      }).toThrow('test-service: Missing environment variables: MISSING_VAR');
    });
  });

  describe('validateServiceEnvironment', () => {
    it('should validate auth-service environment', () => {
      process.env.DYNAMODB_TABLE_NAME = 'test-table';
      process.env.COGNITO_USER_POOL_ID = 'test-pool';
      process.env.COGNITO_USER_POOL_CLIENT_ID = 'test-client';

      const result = environment.validateServiceEnvironment('auth-service');

      expect(result.valid).toBe(true);
    });

    it('should handle unknown service', () => {
      const result = environment.validateServiceEnvironment('unknown-service');

      expect(result.valid).toBe(true); // No required vars for unknown service
    });
  });

  describe('getEnvironmentInfo', () => {
    it('should return comprehensive environment info', () => {
      process.env.NODE_ENV = 'test';
      process.env.AWS_REGION = 'us-west-2';
      process.env.SERVICE_VERSION = '2.0.0';

      const info = environment.getEnvironmentInfo();

      expect(info.nodeEnv).toBe('test');
      expect(info.awsRegion).toBe('us-west-2');
      expect(info.isTest).toBe(true);
      expect(info.isProduction).toBe(false);
      expect(info.serviceVersion).toBe('2.0.0');
      expect(info.timestamp).toBeDefined();
    });
  });

  describe('isTestEnvironment', () => {
    it('should detect test environment from NODE_ENV', () => {
      process.env.NODE_ENV = 'test';

      expect(environment.isTestEnvironment()).toBe(true);
    });

    it('should detect test environment from JEST_WORKER_ID', () => {
      process.env.JEST_WORKER_ID = '1';

      expect(environment.isTestEnvironment()).toBe(true);
    });

    it('should detect test environment from npm lifecycle', () => {
      process.env.npm_lifecycle_event = 'test:coverage';

      expect(environment.isTestEnvironment()).toBe(true);
    });

    it('should return false for non-test environment', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.JEST_WORKER_ID;
      delete process.env.npm_lifecycle_event;

      expect(environment.isTestEnvironment()).toBe(false);
    });
  });

  describe('getEnvVar', () => {
    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test-value';

      const value = environment.getEnvVar('TEST_VAR');

      expect(value).toBe('test-value');
    });

    it('should return default value when var not set', () => {
      const value = environment.getEnvVar('MISSING_VAR', 'default-value');

      expect(value).toBe('default-value');
    });

    it('should throw when required var is missing', () => {
      expect(() => {
        environment.getEnvVar('MISSING_VAR', null, true);
      }).toThrow('Required environment variable MISSING_VAR is not set');
    });
  });

  describe('maskSensitiveEnvVars', () => {
    it('should mask sensitive environment variables', () => {
      const env = {
        PUBLIC_VAR: 'public-value',
        COGNITO_USER_POOL_CLIENT_SECRET: 'sensitive-secret',
        AWS_SECRET_ACCESS_KEY: 'sensitive-key',
        NORMAL_VAR: 'normal-value'
      };

      const masked = environment.maskSensitiveEnvVars(env);

      expect(masked.PUBLIC_VAR).toBe('public-value');
      expect(masked.NORMAL_VAR).toBe('normal-value');
      expect(masked.COGNITO_USER_POOL_CLIENT_SECRET).toBe('***MASKED***');
      expect(masked.AWS_SECRET_ACCESS_KEY).toBe('***MASKED***');
    });
  });
});