import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MockUrlRepository } from '../src/repositories/mock/url_mock_repo';
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
