import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signToken, verifyToken } from '../../src/lib/jwt/jsonwebtoken';

// Mock the entire jsonwebtoken module
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

describe('JWT Helper Functions', () => {
  const mockPayload = {
    userId: '123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signToken', () => {
    it('should sign a token successfully', async () => {
      const mockToken = 'mock-signed-token';
      const jsonwebtoken = await import('jsonwebtoken');
      vi.mocked(jsonwebtoken.default.sign).mockReturnValue(mockToken);

      const result = signToken(mockPayload);

      expect(jsonwebtoken.default.sign).toHaveBeenCalledWith(
        mockPayload,
        expect.any(String),
        expect.any(Object),
      );
      expect(result).toBe(mockToken);
    });

    it('should use default secret when JWT_SECRET is not set', async () => {
      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = '';

      const mockToken = 'mock-signed-token';
      const jsonwebtoken = await import('jsonwebtoken');
      vi.mocked(jsonwebtoken.default.sign).mockReturnValue(mockToken);

      signToken(mockPayload);

      expect(jsonwebtoken.default.sign).toHaveBeenCalledWith(
        mockPayload,
        'potato', // default secret
        expect.any(Object),
      );

      process.env.JWT_SECRET = originalEnv;
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return decoded payload', async () => {
      const mockDecoded = {
        userId: '123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890 + 2 * 24 * 60 * 60, // 2 days
      };

      const jsonwebtoken = await import('jsonwebtoken');
      vi.mocked(jsonwebtoken.default.verify).mockReturnValue(mockDecoded);

      const result = verifyToken('valid-token');

      expect(jsonwebtoken.default.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(String),
      );
      expect(result).toEqual(mockDecoded);
    });

    it('should return null for invalid token', async () => {
      const jsonwebtoken = await import('jsonwebtoken');
      vi.mocked(jsonwebtoken.default.verify).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const jsonwebtoken = await import('jsonwebtoken');
      vi.mocked(jsonwebtoken.default.verify).mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = verifyToken('expired-token');

      expect(result).toBeNull();
    });
  });
});
