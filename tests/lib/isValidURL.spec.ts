import { describe, test, expect } from 'vitest';
import { isValidURLToBeShortener } from '../../src/lib/validators';

describe('isValidURLToBeShortener', () => {
  test('accepts https with www', () => {
    expect(isValidURLToBeShortener('https://www.google.com')).toBe(true);
  });

  test('accepts http without www', () => {
    expect(isValidURLToBeShortener('http://google.com')).toBe(true);
  });

  test('accepts country-code TLD like .com.br', () => {
    expect(isValidURLToBeShortener('https://example.com.br')).toBe(true);
  });

  test('accepts short TLDs like .io', () => {
    expect(isValidURLToBeShortener('https://example.io')).toBe(true);
  });

  test('rejects url without protocol', () => {
    expect(isValidURLToBeShortener('www.google.com')).toBe(false);
  });

  test('rejects hostname with no TLD', () => {
    expect(isValidURLToBeShortener('http://google')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidURLToBeShortener('')).toBe(false);
  });

  test('rejects null', () => {
    expect(isValidURLToBeShortener(null)).toBe(false);
  });

  test('rejects invalid protocol', () => {
    expect(isValidURLToBeShortener('ftp://example.com')).toBe(false);
  });

  test('rejects malformed URL', () => {
    expect(isValidURLToBeShortener('http://')).toBe(false);
  });

  test('rejects IP address', () => {
    expect(isValidURLToBeShortener('http://192.168.1.1')).toBe(false);
  });

  test('rejects localhost', () => {
    expect(isValidURLToBeShortener('http://localhost')).toBe(false);
  });

  test('accepts URL with port', () => {
    expect(isValidURLToBeShortener('https://example.com:8080')).toBe(true);
  });
});
