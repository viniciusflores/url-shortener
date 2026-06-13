import { describe, test, expect, vi, afterEach } from 'vitest';
import { errorHandler } from '../src/middlewares/errorHandler';
import { logger } from '../src/utils/logger';

const makeMocks = () => {
  const req = {} as any;
  const json = vi.fn();
  const res = { status: vi.fn().mockReturnValue({ json }) } as any;
  const next = vi.fn();
  return { req, res, next, json };
};

describe('errorHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test('responds with the error statusCode and message', () => {
    const { req, res, next, json } = makeMocks();
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 404,
        message: 'Not found',
      }),
    );
  });

  test('falls back to status 500 when no statusCode is set', () => {
    const { req, res, next, json } = makeMocks();
    const err = new Error('Unexpected');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }));
  });

  test('uses err.status when statusCode is absent', () => {
    const { req, res, next } = makeMocks();
    const err = Object.assign(new Error('Forbidden'), { status: 403 });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('includes stack trace in development environment', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { req, res, next, json } = makeMocks();
    const err = new Error('Dev error');

    errorHandler(err, req, res, next);

    const payload = json.mock.calls[0][0];
    expect(payload.stack).toBe(err.stack);
  });

  test('omits stack trace outside development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { req, res, next, json } = makeMocks();
    const err = new Error('Prod error');

    errorHandler(err, req, res, next);

    const payload = json.mock.calls[0][0];
    expect(payload.stack).toEqual({});
  });

  test('logs the error message', () => {
    const spy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const { req, res, next } = makeMocks();
    const err = new Error('Something broke');

    errorHandler(err, req, res, next);

    expect(spy).toHaveBeenCalledWith('Something broke');
  });

  test('calls next() after handling the error', () => {
    const { req, res, next } = makeMocks();

    errorHandler(new Error(), req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
