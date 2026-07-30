import { describe, test, expect } from 'vitest';
import { isValidPassword } from '../../src/lib/validators';

describe('isValidPassword', () => {
  test('accepts password with 6 or more characters', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('password')).toBe(true);
  });

  test('rejects password with less than 6 characters', () => {
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });

  test('accepts empty string as invalid', () => {
    expect(isValidPassword('')).toBe(false);
  });

  test('accepts single character as invalid', () => {
    expect(isValidPassword('a')).toBe(false);
  });

  test('accepts long password as valid', () => {
    expect(isValidPassword('thisisaverylongpassword')).toBe(true);
  });

  test('rejects null', () => {
    expect(isValidPassword(null as any)).toBe(false);
  });

  test('rejects undefined', () => {
    expect(isValidPassword(undefined as any)).toBe(false);
  });
});
