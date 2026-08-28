import { describe, test, beforeEach, expect, afterEach, vi } from 'vitest';
import { UrlShortenerService } from '../../src/services/urlShortenerService';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { BASE_URL } from '../../src/env';
import { redisCacheUrlShortener } from '../../src/lib/cache';

vi.mock('../../src/lib/cache/redis', () => ({
  redisCacheUrlShortener: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
}));

describe('UrlShortenerService - random hash tests', () => {
  let service: UrlShortenerService;
  let repo: MockUrlRepository;
  const baseUrl = BASE_URL;
  let findByOriginalUrlSpy: vi.SpyInstance;
  let createRandomSpy: vi.SpyInstance;

  beforeEach(() => {
    repo = new MockUrlRepository();
    service = new UrlShortenerService(repo);
    findByOriginalUrlSpy = vi.spyOn(repo, 'findByOriginalUrl');
    createRandomSpy = vi.spyOn(repo, 'createRandom');
    vi.clearAllMocks();
    vi.mocked(redisCacheUrlShortener.get).mockResolvedValue(null);
  });

  afterEach(function () {
    vi.resetAllMocks();
    repo.reset();
    vi.useRealTimers();
  });

  test('should be able to create a random url', async () => {
    const originalUrl = 'https://example.com';

    const shortenedUrl = await service.shorten(originalUrl);

    expect(shortenedUrl).toMatch(
      new RegExp(`^${baseUrl}/url/[A-Za-z0-9+/=]{3,}$`),
    );

    // Verify the URL was created in repo
    const record = await repo.findByOriginalUrl(originalUrl);
    expect(record).not.toBeNull();
    expect(record?.original_url).toBe(originalUrl);
    expect(record?.hashed_url).toMatch(/[A-Za-z0-9+/=]{6}/);
    expect(record?.userId).toBeNull();
    expect(record?.expiresAt).toBeInstanceOf(Date);
  });

  test('should return the same shortened url for the same original url', async () => {
    const originalUrl = 'https://example.com';
    const firstShortenedUrl = await service.shorten(originalUrl);
    const secondShortenedUrl = await service.shorten(originalUrl);

    expect(firstShortenedUrl).toBe(secondShortenedUrl);

    // Verify findByOriginalUrl was called (for both calls)
    expect(findByOriginalUrlSpy).toHaveBeenCalledTimes(2);

    // Verify createRandom was NOT called on second call
    expect(createRandomSpy).toHaveBeenCalledTimes(1); // Only called once for first creation
  });

  test('should update the expireAt when random url was generated twice', async () => {
    vi.useFakeTimers();

    const firstDate = new Date('2025-01-01T11:00:00.000Z');
    vi.setSystemTime(firstDate);

    const originalUrl = 'https://example.com';

    const firstShortenedUrl = await service.shorten(originalUrl);
    const firstUrlData = await repo.findByOriginalUrl(originalUrl);
    const firstExpiresAt = firstUrlData!.expiresAt;

    expect(firstExpiresAt.toISOString()).toEqual('2026-01-01T11:00:00.000Z');

    // Move time forward
    const secondDate = new Date('2026-08-22T12:00:00.000Z');
    vi.setSystemTime(secondDate);

    const secondShortenedUrl = await service.shorten(originalUrl);

    const secondUrlData = await repo.findByOriginalUrl(originalUrl);
    const secondExpiresAt = secondUrlData!.expiresAt;

    expect(secondShortenedUrl).toBe(firstShortenedUrl);

    expect(secondExpiresAt.toISOString()).toEqual('2027-08-22T12:00:00.000Z');
    expect(secondExpiresAt!.getTime()).toBeGreaterThan(
      firstExpiresAt!.getTime(),
    );

    vi.useRealTimers();
  });

  test('should throw error when max attempts exceeded', async () => {
    // Mock the repository to always return a hash that exists
    vi.spyOn(repo, 'findByHash').mockResolvedValue({
      original_url: 'https://example.com',
      hashed_url: 'existing-hash',
      clicks: 0,
      lastAccessed: null,
      userId: null,
      expiresAt: new Date(),
    });

    const originalUrl = 'https://example.com';

    await expect(service.shorten(originalUrl)).rejects.toThrow(
      'Failed to generate unique hash after multiple attempts',
    );
  });
});
