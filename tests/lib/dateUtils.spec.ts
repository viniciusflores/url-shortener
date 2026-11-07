import { describe, test, expect } from 'vitest';
import { addUTCDays, getStartOfUTCDay } from '../../src/lib/date/utils';

describe('getStartOfUTCDay', () => {
  test('returns midnight UTC of the given date', () => {
    expect(getStartOfUTCDay('2026-11-07').toISOString()).toBe(
      '2026-11-07T00:00:00.000Z',
    );
  });
});

describe('addUTCDays', () => {
  test('adds days across month boundaries', () => {
    const date = new Date('2026-10-31T00:00:00.000Z');
    expect(addUTCDays(date, 1).toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });

  test('does not mutate the given date', () => {
    const date = new Date('2026-10-31T00:00:00.000Z');
    addUTCDays(date, 1);
    expect(date.toISOString()).toBe('2026-10-31T00:00:00.000Z');
  });
});
