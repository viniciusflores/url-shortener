import { describe, test, beforeEach, expect, afterEach, vi } from 'vitest';
import { UrlShortenerService } from '../../src/services/urlShortenerService';
import { MockUrlRepository } from '../../src/repositories/mock/mockUrlRepo';
import { BASE_URL } from '../../src/env';

describe('UrlShortenerService', () => {
  let service: UrlShortenerService;
  let repo: MockUrlRepository;
  const baseUrl = BASE_URL;

  beforeEach(() => {
    repo = new MockUrlRepository();
    service = new UrlShortenerService(repo);
  });

  afterEach(function () {
    vi.resetAllMocks();
    repo.reset();
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
      repo.findByCustomHash(customAlias).then((record) => {
        expect(record).not.toBeNull();
        expect(record?.original_url).toBe(originalUrl);
        expect(record?.hashed_url).toBe(customAlias);
        expect(record?.userId).toBe(userId);
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
      repo.findByCustomHash(customAlias).then((record) => {
        expect(record).not.toBeNull();
        expect(record?.original_url).toBe(originalUrl);
        expect(record?.hashed_url).toBe(customAlias);
        expect(record?.userId).toBe(userId);
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
      });
    });

    test('should return the same shortened url for the same original url', async () => {
      const originalUrl = 'https://example.com';

      const firstShortenedUrl = await service.shorten(originalUrl);
      const secondShortenedUrl = await service.shorten(originalUrl);

      expect(firstShortenedUrl).toBe(secondShortenedUrl);
    });

    test('should throw error when max attempts exceeded', async () => {
      // Mock the repository to always return a hash that exists
      vi.spyOn(repo, 'findByHash').mockResolvedValue({
        original_url: 'https://example.com',
        hashed_url: 'existing-hash',
        clicks: 0,
        lastAccessed: null,
        userId: null,
      });

      const originalUrl = 'https://example.com';

      await expect(service.shorten(originalUrl)).rejects.toThrow(
        'Failed to generate unique hash after multiple attempts',
      );
    });
  });

  describe('resolveShortenedUrl', () => {
    test('should resolve a shortened url to the original url', async () => {
      const originalUrl = 'https://example.com';
      const shortenedUrl = await service.shorten(originalUrl);
      const hash = shortenedUrl.split('/').pop() as string;

      const resolvedUrl = await service.resolveShortenedUrl(hash);

      expect(resolvedUrl).toBe(originalUrl);
    });

    test('should throw an error for invalid hash', async () => {
      await expect(service.resolveShortenedUrl('')).rejects.toThrow(
        'Invalid hash',
      );
      await expect(service.resolveShortenedUrl('invalid-hash')).rejects.toThrow(
        'Invalid hash',
      );
    });

    test('should throw an error if the hash does not exist', async () => {
      await expect(service.resolveShortenedUrl('nonexistent')).rejects.toThrow(
        'URL not found',
      );
    });
  });
});
