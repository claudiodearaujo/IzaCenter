// Global test setup
import './mocks/prisma.mock';
import './mocks/email.mock';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Global beforeEach to clear all mocks
beforeEach(() => {
  jest.clearAllMocks();
});
