import { describe, test, expect } from 'vitest';
import { isValidCustomAlias, reservedWords } from '../../src/lib/validators';

describe('isValidCustomAlias', () => {
  test('accepts alias with letters, numbers, +, _ and -', () => {
    expect(isValidCustomAlias('my-alias')).toBe(true);
    expect(isValidCustomAlias('My_Alias123')).toBe(true);
    expect(isValidCustomAlias('a+b')).toBe(true);
  });

  test('accepts alias with minimum length of 3 characters', () => {
    expect(isValidCustomAlias('abc')).toBe(true);
  });

  test('accepts alias with maximum length of 30 characters', () => {
    expect(isValidCustomAlias('a'.repeat(30))).toBe(true);
  });

  test('rejects alias with less than 3 characters', () => {
    expect(isValidCustomAlias('ab')).toBe(false);
  });

  test('rejects alias with more than 30 characters', () => {
    expect(isValidCustomAlias('a'.repeat(31))).toBe(false);
  });

  test('rejects reserved words', () => {
    reservedWords.forEach((word) => {
      expect(isValidCustomAlias(word)).toBe(false);
    });
  });

  test('rejects alias with invalid characters', () => {
    expect(isValidCustomAlias('my alias')).toBe(false);
    expect(isValidCustomAlias('my/alias')).toBe(false);
    expect(isValidCustomAlias('my.alias')).toBe(false);
    expect(isValidCustomAlias('my@alias')).toBe(false);
    expect(isValidCustomAlias('alias?x=1')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidCustomAlias('')).toBe(false);
  });

  test('rejects null', () => {
    expect(isValidCustomAlias(null as any)).toBe(false);
  });

  test('rejects undefined', () => {
    expect(isValidCustomAlias(undefined as any)).toBe(false);
  });

  test('rejects number', () => {
    expect(isValidCustomAlias(12345 as any)).toBe(false);
  });
});
