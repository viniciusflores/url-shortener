import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import Redis from 'ioredis';
import { redisCacheUrlShortener } from '../../src/lib/cache';
import { REDIS_TEST_URL } from '../../src/env';

const testRedis = new Redis(REDIS_TEST_URL!);

describe('redisCacheUrlShortener', () => {
  beforeEach(async () => {
    await testRedis.flushdb();
  });

  afterAll(async () => {
    await testRedis.quit();
  });

  it('returns null on cache miss', async () => {
    const result = await redisCacheUrlShortener.get('nonexistent');
    expect(result).toBeNull();
  });

  it('stores and retrieves a cached url', async () => {
    const expiresAt = new Date('2027-01-01T00:00:00Z');

    await redisCacheUrlShortener.set({
      hash: 'abc123',
      original_url: 'https://example.com',
      expiresAt,
    });

    const result = await redisCacheUrlShortener.get('abc123');

    expect(result).toEqual({
      original_url: 'https://example.com',
      expiresAt: expiresAt.toISOString(),
    });
  });

  it('invalidate removes the cached entry', async () => {
    await redisCacheUrlShortener.set({
      hash: 'abc123',
      original_url: 'https://example.com',
      expiresAt: new Date('2027-01-01'),
    });

    await redisCacheUrlShortener.invalidate('abc123');

    const result = await redisCacheUrlShortener.get('abc123');
    expect(result).toBeNull();
  });

  it('sets a TTL on the key', async () => {
    await redisCacheUrlShortener.set({
      hash: 'abc123',
      original_url: 'https://example.com',
      expiresAt: new Date('2027-01-01'),
    });

    const ttl = await testRedis.ttl('abc123');
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60 * 60 * 24 * 7);
  });
});
