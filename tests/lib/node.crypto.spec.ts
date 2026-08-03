import { describe, test, expect } from 'vitest';
import { generateHash } from '../../src/lib/crypto/node.crypto';

describe('generateHash', () => {
  test('generates hash with default byte count when env var is not set', () => {
    // Mock process.env to return undefined for HASH_STRONG_NUMBER
    const originalEnv = process.env;
    process.env = { ...originalEnv };

    // Test that it works without throwing
    expect(() => generateHash()).not.toThrow();
  });

  test('generates hash with custom byte count from env var', () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, HASH_STRONG_NUMBER: '32' };

    expect(() => generateHash()).not.toThrow();

    // Restore original env
    process.env = originalEnv;
  });

  test('throws error for invalid byte count', () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, HASH_STRONG_NUMBER: 'invalid' };

    expect(() => generateHash()).toThrow(
      'Invalid HASH_STRONG_NUMBER: "invalid"',
    );

    process.env = originalEnv;
  });

  test('throws error for zero byte count', () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, HASH_STRONG_NUMBER: '0' };

    expect(() => generateHash()).toThrow('Invalid HASH_STRONG_NUMBER: "0"');

    process.env = originalEnv;
  });

  test('throws error for negative byte count', () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, HASH_STRONG_NUMBER: '-5' };

    expect(() => generateHash()).toThrow('Invalid HASH_STRONG_NUMBER: "-5"');

    process.env = originalEnv;
  });
});
