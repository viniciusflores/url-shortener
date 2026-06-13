import { describe, test, expect } from 'vitest';
import { logger } from '../src/utils/logger';
import { transports } from 'winston';

describe('logger', () => {
  test('has all custom log levels defined', () => {
    expect(logger.levels).toEqual({
      critical: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    });
  });

  test('has console and file transports configured', () => {
    expect(logger.transports).toHaveLength(2);
    expect(logger.transports[0]).toBeInstanceOf(transports.Console);
    expect(logger.transports[1]).toBeInstanceOf(transports.File);
  });
});
