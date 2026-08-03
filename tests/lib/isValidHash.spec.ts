import { describe, test, expect } from 'vitest';
import { isValidHash } from '../../src/lib/validators';

describe('isValidHash', () => {
  test('accepts valid hash with alphanumeric characters', () => {
    expect(isValidHash('abc123')).toBe(true);
  });

  test('accepts valid hash with special characters', () => {
    expect(isValidHash('abc+123=')).toBe(true);
  });

  test('accepts valid base64-like hash', () => {
    expect(isValidHash('SGVsbG8=')).toBe(true);
  });

  test('rejects hash with less than 3 characters', () => {
    expect(isValidHash('ab')).toBe(false);
    expect(isValidHash('a')).toBe(false);
    expect(isValidHash('')).toBe(false);
  });

  test('rejects hash with invalid characters', () => {
    expect(isValidHash('abc@123')).toBe(false);
    expect(isValidHash('abc 123')).toBe(false);
    expect(isValidHash('abc!123')).toBe(false);
  });

  test('accepts empty string as invalid', () => {
    expect(isValidHash('')).toBe(false);
  });

  test('rejects null', () => {
    expect(isValidHash(null as any)).toBe(false);
  });

  test('rejects undefined', () => {
    expect(isValidHash(undefined as any)).toBe(false);
  });

  test('accepts hash with forward slash and plus', () => {
    expect(isValidHash('abc/123+')).toBe(true);
  });
});
