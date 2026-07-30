import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../../src/middlewares/authMiddleware';
import { verifyToken } from '../../src/lib/jwt';
import { Request, Response, NextFunction } from 'express';

// Mock the verifyToken function
vi.mock('../../src/lib/jwt', () => ({
  verifyToken: vi.fn(),
}));

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const mockUser = { id: '123', email: 'test@example.com' };

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should return 401 if no authorization header is provided', async () => {
    await authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing or invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with "Bearer "', async () => {
    req.headers = { authorization: 'InvalidToken' };

    await authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing or invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid or expired', async () => {
    req.headers = { authorization: 'Bearer invalid-token' };
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user to request if token is valid', async () => {
    req.headers = { authorization: 'Bearer valid-token' };
    vi.mocked(verifyToken).mockReturnValue(mockUser);

    await authMiddleware(req as Request, res as Response, next);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect((req as any).user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle empty token gracefully', async () => {
    req.headers = { authorization: 'Bearer ' };
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
    });
  });

  it('should work correctly with token containing special characters', async () => {
    req.headers = {
      authorization: 'Bearer valid-token-with-special-chars-123!',
    };
    vi.mocked(verifyToken).mockReturnValue(mockUser);

    await authMiddleware(req as Request, res as Response, next);

    expect(verifyToken).toHaveBeenCalledWith(
      'valid-token-with-special-chars-123!',
    );
    expect((req as any).user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});
