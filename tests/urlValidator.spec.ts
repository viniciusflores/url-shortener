import { describe, test, expect } from 'vitest';
import { isValidURL } from '../src/utils/urlValidator';

describe('isValidURL', () => {
  test('accepts https with www', () => {
    expect(isValidURL('https://www.google.com')).toBe(true);
  });

  test('accepts http without www', () => {
    expect(isValidURL('http://google.com')).toBe(true);
  });

  test('accepts country-code TLD like .com.br', () => {
    expect(isValidURL('https://example.com.br')).toBe(true);
  });

  test('accepts short TLDs like .io', () => {
    expect(isValidURL('https://example.io')).toBe(true);
  });

  test('rejects url without protocol', () => {
    expect(isValidURL('www.google.com')).toBe(false);
  });

  test('rejects hostname with no TLD', () => {
    expect(isValidURL('http://google')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidURL('')).toBe(false);
  });

  test('rejects null', () => {
    expect(isValidURL(null)).toBe(false);
  });
});
