import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MockUrlRepository } from '../src/repositories/mock/mockUrlRepo';
import { UrlShortenerService } from '../src/service/urlShortenerService';

const repo = new MockUrlRepository();
const service = new UrlShortenerService(repo);
const BASE_URL = 'http://localhost:3000';

describe('UrlShortenerService', () => {
  beforeEach(() => repo.reset());

  describe('shorten', () => {
    test('returns a short URL for a valid URL', async () => {
      const result = await service.shorten('https://google.com', BASE_URL);
      expect(result).toMatch(/^http:\/\/localhost:3000\/url\/.+/);
    });

    test('returns the same short URL when the URL was already shortened', async () => {
      const first = await service.shorten('https://google.com', BASE_URL);
      const second = await service.shorten('https://google.com', BASE_URL);
      expect(first).toBe(second);
    });

    test('throws when URL is missing', async () => {
      await expect(service.shorten('', BASE_URL)).rejects.toThrow(
        'Missing URL',
      );
    });

    test('throws when URL is invalid', async () => {
      await expect(service.shorten('not-a-url', BASE_URL)).rejects.toThrow(
        'Invalid URL',
      );
    });
  });

  describe('resolveShortenedUrl', () => {
    test('returns original URL when hash exists', async () => {
      await repo.create('https://google.com', 'abc123');
      const result = await service.resolveShortenedUrl('abc123');
      expect(result).toBe('https://google.com');
    });

    test('throws when hash does not exist in the database', async () => {
      await expect(service.resolveShortenedUrl('abc123')).rejects.toThrow(
        'URL not found',
      );
    });

    test('returns empty string for an invalid hash format', async () => {
      const result = await service.resolveShortenedUrl('');
      expect(result).toBe('');
    });
  });

  describe('url analytics updated', () => {
    let originalUrl: string;
    let hash: string;

    test.beforeEach(async () => {
      originalUrl = 'https://google.com';
      hash = 'abc123';
      await repo.create(originalUrl, hash);
    });

    test.afterEach(() => {
      vi.resetAllMocks();
      repo.reset();
    });

    test('should increment click count when resolving a shortened URL', async () => {
      const incrementClicksSpy = vi.spyOn(repo, 'incrementClicks');
      await service.resolveShortenedUrl(hash);
      expect(incrementClicksSpy).toHaveBeenCalledWith(hash);
    });

    test('should not increment click count when resolving an invalid hash', async () => {
      const incrementClicksSpy = vi.spyOn(repo, 'incrementClicks');
      await expect(service.resolveShortenedUrl('invalidHash')).rejects.toThrow(
        'URL not found',
      );
      expect(incrementClicksSpy).not.toHaveBeenCalled();
    });

    test('should update lastAccessed timestamp when resolving a shortened URL', async () => {
      const recordBefore = await repo.findByHash(hash);
      expect(recordBefore?.lastAccessed).toBeNull();

      await service.resolveShortenedUrl(hash);

      const recordAfter = await repo.findByHash(hash);
      expect(recordAfter?.lastAccessed).not.toBeNull();
    });

    test('should update lastAccessed each time the shortened URL is resolved', async () => {
      await service.resolveShortenedUrl(hash);
      const firstAccess = (await repo.findByHash(hash))?.lastAccessed;

      // Wait for a short duration to ensure a different timestamp
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await service.resolveShortenedUrl(hash);
      const secondAccess = (await repo.findByHash(hash))?.lastAccessed;

      expect(secondAccess).not.toEqual(firstAccess);
      expect(secondAccess!.getTime()).toBeGreaterThan(firstAccess!.getTime());
    });
  });

  test('should throw after max hash collisions', async () => {
    const repo = {
      findByOriginalUrl: vi.fn().mockResolvedValue(null),
      findByHash: vi.fn().mockResolvedValue({
        hashed_url: 'existing',
      }),
      create: vi.fn(),
    };

    const service = new UrlShortenerService(repo);
    await expect(
      service.shorten('https://www.google.com', 'http://localhost:3000'),
    ).rejects.toThrow('Failed to generate unique hash after multiple attempts');

    expect(repo.create).not.toHaveBeenCalled();
  });
});
