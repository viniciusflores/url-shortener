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
    expect(result.length).toBe(12);
  });

  it('should return unique and valid strings on multiple calls', () => {
    const call1 = generateHash();
    const call2 = generateHash();

    expect(call1).not.toBe(call2);
    expect(call1.length).toBe(12);
    expect(call2.length).toBe(12);
  });

  it('should not contain any forward slashes', () => {
    for (let i = 0; i < 50; i++) {
      const result = generateHash();
      expect(result).not.toContain('/');
    }
  });

  it('should match a base64 character set structure after replacing 1 back to /', () => {
    const result = generateHash();
    const originalBase64 = result.replace(/1/g, '/');

    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    expect(base64Regex.test(originalBase64)).toBe(true);
  });

  it('should change output length when HASH_STRONG_NUMBER changes', () => {
    envMocks.value = 15;

    const hashWithLargeNumber = generateHash();

    expect(hashWithLargeNumber.length).toBe(20);
  });
});
