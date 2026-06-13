import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateHash } from '../src/utils/generateHash';

describe('generateHash', () => {
  beforeEach(() => {
    vi.stubEnv('HASH_STRONG_NUMBER', '6');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('returns a slash-free base64 string with the correct length for HASH_STRONG_NUMBER', () => {
    const result = generateHash();

    expect(typeof result).toBe('string');
    expect(result).not.toContain('/');
    // 6 bytes → 8-character Base64 string
    expect(result).toHaveLength(8);
  });

  test('uses 16 bytes by default when HASH_STRONG_NUMBER is not set', () => {
    vi.unstubAllEnvs();
    const result = generateHash();

    expect(result).not.toContain('/');
    // 16 bytes → 24-character Base64 string
    expect(result).toHaveLength(24);
  });

  test('throws when HASH_STRONG_NUMBER is not a valid integer', () => {
    vi.stubEnv('HASH_STRONG_NUMBER', 'abc');
    expect(() => generateHash()).toThrow('Invalid HASH_STRONG_NUMBER: "abc"');
  });

  test('throws when HASH_STRONG_NUMBER is zero or negative', () => {
    vi.stubEnv('HASH_STRONG_NUMBER', '0');
    expect(() => generateHash()).toThrow('Invalid HASH_STRONG_NUMBER: "0"');
  });
});
