import { describe, test, expect } from 'vitest';
import { isValidISODate } from '../../src/lib/validators';

describe('isValidISODate', () => {
  test('accepts date in YYYY-MM-DD format', () => {
    expect(isValidISODate('2026-11-07')).toBe(true);
    expect(isValidISODate('2024-02-29')).toBe(true);
  });

  test('rejects impossible dates', () => {
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('2026-13-01')).toBe(false);
  });

  test('rejects other formats', () => {
    expect(isValidISODate('2026-1-01')).toBe(false);
    expect(isValidISODate('07/11/2026')).toBe(false);
    expect(isValidISODate('2026-11-07T10:00:00Z')).toBe(false);
    expect(isValidISODate('abc')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidISODate('')).toBe(false);
  });

  test('rejects null', () => {
    expect(isValidISODate(null as any)).toBe(false);
  });

  test('rejects undefined', () => {
    expect(isValidISODate(undefined as any)).toBe(false);
  });
});
