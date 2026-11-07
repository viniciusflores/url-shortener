import { describe, it, expect, vi, beforeEach } from 'vitest';

const envMocks = vi.hoisted(() => {
  return {
    value: 7,
  };
});

vi.mock('../../src/env', () => ({
  get HASH_STRONG_NUMBER() {
    return envMocks.value;
  },
}));

import { generateHash } from '../../src/lib/crypto/node.crypto';

describe('generateHash', () => {
  beforeEach(() => {
    envMocks.value = 7;
  });

  it('should return a string when called', () => {
    const result = generateHash();

    expect(typeof result).toBe('string');
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
  });

  it('should have a reasonable length based on HASH_STRONG_NUMBER', () => {
    const result = generateHash();
    expect(result.length).toBe(10);
  });

  it('should return unique and valid strings on multiple calls', () => {
    const call1 = generateHash();
    const call2 = generateHash();

    expect(call1).not.toBe(call2);
    expect(call1.length).toBe(10);
    expect(call2.length).toBe(10);
  });

  it('should only contain URL-safe base64 characters without padding', () => {
    for (let i = 0; i < 50; i++) {
      const result = generateHash();
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it('should change output length when HASH_STRONG_NUMBER changes', () => {
    envMocks.value = 15;

    const hashWithLargeNumber = generateHash();

    expect(hashWithLargeNumber.length).toBe(20);
  });
});
