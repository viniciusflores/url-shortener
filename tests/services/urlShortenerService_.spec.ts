import { describe, test, beforeEach, expect, afterEach, vi } from 'vitest';
import { UrlShortenerService } from '../../src/services/urlShortenerService';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { BASE_URL } from '../../src/env';
import { generateHash } from '../../src/lib/crypto';
import {
  getExpiredDate,
  getExpiryDatePlusOneYear,
} from '../../src/lib/date/utils';
import { redisCacheUrlShortener } from '../../src/lib/cache';

vi.mock('../../src/lib/cache/redis', () => ({
  redisCacheUrlShortener: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
}));

describe('UrlShortenerService', () => {
  let service: UrlShortenerService;
  let repo: MockUrlRepository;
  const baseUrl = BASE_URL;

  beforeEach(() => {
    repo = new MockUrlRepository();
    service = new UrlShortenerService(repo);
    vi.clearAllMocks();
    vi.mocked(redisCacheUrlShortener.get).mockResolvedValue(null);
  });

  afterEach(function () {
    vi.resetAllMocks();
    repo.reset();
    vi.useRealTimers();
  });

  describe('shorten', () => {
    describe('url validation', () => {
      test('should throw an error for missing URL', async () => {
        await expect(service.shorten('')).rejects.toThrow('Missing URL');
      });

      test('should throw an error for invalid URL', async () => {
        await expect(service.shorten('invalid-url')).rejects.toThrow(
          'Invalid URL',
        );
      });
    });
  });

  describe('Random Hash Flow', () => {
    test('should be able to create a random url', async () => {
      const originalUrl = 'https://example.com';
      const shortenedUrl = await service.shorten(originalUrl);

      expect(shortenedUrl).toMatch(
        new RegExp(`^${baseUrl}/url/[A-Za-z0-9+1=]{3,}$$`),
      );
      repo.findByOriginalUrl(originalUrl).then((record) => {
        expect(record).not.toBeNull();
        expect(record?.original_url).toBe(originalUrl);
        expect(record?.hashed_url).toMatch(/[a-zA-Z0-9]{6}/);
        expect(record?.userId).toBeNull();
        expect(record?.expiresAt).instanceOf(Date);
      });
    });

    test('should return the same shortened url for the same original url', async () => {
      const originalUrl = 'https://example.com';

      const firstShortenedUrl = await service.shorten(originalUrl);
      const secondShortenedUrl = await service.shorten(originalUrl);

      expect(firstShortenedUrl).toBe(secondShortenedUrl);
    });

    test('should be update the expireAt when random url was generated twice', async () => {
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

  describe('Custom Alias Flow', () => {
    test('should be able to create a custom url with alias', async () => {
      const customAlias = 'my-custom-alias';
      const userId = 'user-123';
      const originalUrl = 'https://example.com';

      const shortenedUrl = await service.shorten(
        originalUrl,
        customAlias,
        userId,
      );

      expect(shortenedUrl).toBe(`${baseUrl}/url/${customAlias}`);
      repo.findByHash(customAlias).then((record) => {
        expect(record).not.toBeNull();
        expect(record?.original_url).toBe(originalUrl);
        expect(record?.hashed_url).toBe(customAlias);
        expect(record?.userId).toBe(userId);
        expect(record?.expiresAt).toBeInstanceOf(Date);
      });
    });

    test('should not be able to create a custom url with alias already been taken', async () => {
      const customAlias = 'my-custom-alias';
      const userId = 'user-123';
      const originalUrl = 'https://example.com';

      const shortenedUrl = await service.shorten(
        originalUrl,
        customAlias,
        userId,
      );

      expect(shortenedUrl).toBe(`${baseUrl}/url/${customAlias}`);
      repo.findByHash(customAlias).then((record) => {
        expect(record).not.toBeNull();
        expect(record?.original_url).toBe(originalUrl);
        expect(record?.hashed_url).toBe(customAlias);
        expect(record?.userId).toBe(userId);
        expect(record?.expiresAt).toBeInstanceOf(Date);
      });
      await expect(() =>
        service.shorten(originalUrl, customAlias, userId),
      ).rejects.toThrow('Custom alias already taken');
    });

    test('should throw an error when try to create custom alias without userId', async () => {
      await expect(() =>
        service.shorten('https://example.com', 'my-custom-alias', ''),
      ).rejects.toThrow('Invalid user ID');
    });

    test('should throw an error when try to create custom alias without customAlias', async () => {
      await expect(() =>
        service.shorten('https://example.com', '', 'user0123'),
      ).rejects.toThrow('Invalid custom alias');
    });
  });

  describe('resolveShortenedUrl', () => {
    test('should resolve a shortened url to the original url', async () => {
      const originalUrl = 'https://example.com';
      const shortenedUrl = await service.shorten(originalUrl);
      const hash = shortenedUrl.split('/').pop() as string;

      const resolvedUrl = await service.resolveShortenedUrl(hash);

      expect(resolvedUrl.original_url).toBe(originalUrl);
    });

    test('should handle invalid hash formats properly', async () => {
      // Test empty string
      await expect(service.resolveShortenedUrl('')).rejects.toThrow(
        'Invalid hash format provided',
      );

      // Test null/undefined
      await expect(service.resolveShortenedUrl(null as any)).rejects.toThrow(
        'Invalid hash format provided',
      );

      // Test whitespace only
      await expect(service.resolveShortenedUrl(' ')).rejects.toThrow(
        'Invalid hash format provided',
      );

      // Test invalid characters (like single character)
      await expect(service.resolveShortenedUrl('x')).rejects.toThrow(
        'Invalid hash format provided',
      );

      // Test reserved words
      await expect(service.resolveShortenedUrl('login')).rejects.toThrow(
        'Invalid hash format provided',
      );
      await expect(service.resolveShortenedUrl('api')).rejects.toThrow(
        'Invalid hash format provided',
      );
      await expect(service.resolveShortenedUrl('health')).rejects.toThrow(
        'Invalid hash format provided',
      );

      // Test malformed URLs
      await expect(service.resolveShortenedUrl('/?url=all')).rejects.toThrow(
        'Invalid hash format provided',
      );
    });

    test('should throw an error if the hash does not exist', async () => {
      await expect(service.resolveShortenedUrl('nonexistent')).rejects.toThrow(
        'URL not found',
      );
    });

    test('should be throw an error when url is expired', async () => {
      const originalUrl = 'https://example.com';
      const hash = generateHash();
      const my_url = await repo.createRandom(originalUrl, hash);

      const expiredTime = getExpiredDate();
      my_url.expiresAt = expiredTime;

      await expect(service.resolveShortenedUrl(hash)).rejects.toThrow(
        'The requested resource is no longer available on this server and is permanently removed.',
      );
    });
  });

  describe('Resolve shortener URL with redis', () => {
    test('returns url from cache on hit, without touching the repo for lookup', async () => {
      vi.mocked(redisCacheUrlShortener.get).mockResolvedValue({
        original_url: 'https://example.com',
        expiresAt: getExpiryDatePlusOneYear(),
      });

      // Mock repo.findByHash to be a spy
      const findByHashSpy = vi
        .spyOn(repo, 'findByHash')
        .mockResolvedValue(null);

      const hash = generateHash();
      await repo.createRandom('https://example.com', hash);

      const result = await service.resolveShortenedUrl(hash);

      expect(result.original_url).toBe('https://example.com');
      expect(findByHashSpy).not.toHaveBeenCalled();
    });

    test('invalidates cache and throws when cached entry is expired', async () => {
      vi.mocked(redisCacheUrlShortener.get).mockResolvedValue({
        original_url: 'https://example.com',
        expiresAt: getExpiredDate(),
      });

      await expect(service.resolveShortenedUrl('abc123')).rejects.toThrow(
        'The requested resource is no longer available on this server and is permanently removed.',
      );

      expect(redisCacheUrlShortener.invalidate).toHaveBeenCalledWith('abc123');
    });

    test('populates cache on miss when repo returns a valid record', async () => {
      const hash = generateHash();
      await repo.createRandom('https://example.com', hash);

      await service.resolveShortenedUrl(hash);

      expect(redisCacheUrlShortener.set).toHaveBeenCalledWith(
        expect.objectContaining({ hash, original_url: 'https://example.com' }),
      );
    });
  });
});
