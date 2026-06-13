import { describe, test, expect, vi, afterEach } from 'vitest';
import { loggerMiddleware } from '../src/middlewares/loggerMiddleware';
import { logger } from '../src/utils/logger';
import { EventEmitter } from 'node:events';

const makeMocks = (method = 'GET', url = '/test', statusCode = 200) => {
  const req = { method, url } as any;
  const res = Object.assign(new EventEmitter(), { statusCode }) as any;
  const next = vi.fn();
  return { req, res, next };
};

describe('loggerMiddleware', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('calls next()', () => {
    const { req, res, next } = makeMocks();

    loggerMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  test('logs method, url, status and exact duration after response finishes', () => {
    const spy = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1250);
    const { req, res, next } = makeMocks('POST', '/shorten', 201);

    loggerMiddleware(req, res, next);
    res.emit('finish');

    expect(spy).toHaveBeenCalledOnce();
    const message = spy.mock.calls[0][0] as string;
    expect(message).toContain('POST');
    expect(message).toContain('/shorten');
    expect(message).toContain('201');
    expect(message).toContain('250ms');
  });
});
