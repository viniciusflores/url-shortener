import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middlewares/errorHandler';
import { logger } from '../../src/lib/logger/winston';
import { AppError } from '../../src/lib/errors';

// Mock the logger module so it doesn't print logs during test runs
vi.mock('../../src/lib/logger/winston', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('errorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('when handling unknown standard errors', () => {
    it('should respond with 500 "Internal Server Error" and include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const nativeError = new Error('Database connection dropped unexpectedly');

      errorHandler(
        nativeError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Database connection dropped unexpectedly - Stack:',
        ),
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        status: 500,
        message: 'Internal Server Error',
        stack: nativeError.stack,
      });
    });

    it('should respond with 500 "Internal Server Error" and hide stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const nativeError = new Error(
        'Sensitive database configuration error details',
      );

      errorHandler(
        nativeError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        status: 500,
        message: 'Internal Server Error',
        stack: {},
      });
    });
  });

  describe('when handling trusted AppErrors or custom objects', () => {
    it('should extract custom status, messages, and show stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const customAppError = new AppError(
        401,
        'Unauthorized request token format',
      );

      errorHandler(
        customAppError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized request token format - Stack:'),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        status: 401,
        message: 'Unauthorized request token format',
        stack: customAppError.stack,
      });
    });

    it('should successfully match plain mock objects that mirror the AppError shape', () => {
      process.env.NODE_ENV = 'production';
      const plainMockError = {
        statusCode: 422,
        message: 'Validation failure: missing payload parameters',
        stack: 'Mocked trace details',
      };

      errorHandler(
        plainMockError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        status: 422,
        message: 'Validation failure: missing payload parameters',
        stack: {},
      });
    });
  });
});
