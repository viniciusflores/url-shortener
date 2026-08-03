import { describe, test, expect } from 'vitest';
import { validateEmail } from '../../src/lib/validators';

describe('validateEmail', () => {
  test('accepts valid email with username and domain', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true);
  });

  test('accepts email with numbers', () => {
    expect(validateEmail('user123@test123.com')).toBe(true);
  });

  test('accepts email with special characters', () => {
    expect(validateEmail('user.name@example.com')).toBe(true);
  });

  test('rejects email without @ symbol', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  test('rejects email without domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  test('rejects email without TLD', () => {
    expect(validateEmail('user@example')).toBe(false);
  });

  test('rejects email with multiple @ symbols', () => {
    expect(validateEmail('user@@example.com')).toBe(false);
  });

  test('rejects email with spaces', () => {
    expect(validateEmail('user example@example.com')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('rejects null', () => {
    expect(validateEmail(null as any)).toBe(false);
  });

  test('rejects undefined', () => {
    expect(validateEmail(undefined as any)).toBe(false);
  });

  test('rejects email starting with @', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  test('rejects email ending with @', () => {
    expect(validateEmail('user@')).toBe(false);
  });
});
