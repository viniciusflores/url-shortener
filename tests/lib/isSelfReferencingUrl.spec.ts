import { describe, test, expect } from 'vitest';
import { isSelfReferencingUrl } from '../../src/lib/validators';

describe('isSelfReferencingUrl', () => {
  const baseUrl = 'https://short.example.com';

  test('returns true for a URL on the same host', () => {
    expect(
      isSelfReferencingUrl('https://short.example.com/url/abc123', baseUrl),
    ).toBe(true);
  });

  test('returns true regardless of protocol, port or casing', () => {
    expect(
      isSelfReferencingUrl('http://SHORT.example.com:8080/url/abc', baseUrl),
    ).toBe(true);
  });

  test('returns false for a different host', () => {
    expect(isSelfReferencingUrl('https://example.com/page', baseUrl)).toBe(
      false,
    );
  });

  test('returns false for a subdomain of a different host', () => {
    expect(
      isSelfReferencingUrl('https://other.example.com/page', baseUrl),
    ).toBe(false);
  });

  test('returns false when the URL is malformed', () => {
    expect(isSelfReferencingUrl('not-a-url', baseUrl)).toBe(false);
  });

  test('returns false when the base URL is malformed', () => {
    expect(isSelfReferencingUrl('https://example.com', 'batata')).toBe(false);
  });
});
